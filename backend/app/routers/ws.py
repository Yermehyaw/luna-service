"""Queue WebSockets: a staff console per branch, a customer socket per ticket.

Deliberately does not use the `get_db` dependency. A WebSocket outlives a request
by minutes or hours, and `get_db` would hold one pooled connection open for that
whole time — with `DATABASE_POOL_SIZE=5` and `max_overflow=10`, fifteen open
sockets would exhaust the pool and deadlock every HTTP endpoint in the app. So
each socket opens its own short-lived session for the handshake, commits nothing,
and lets it go before the receive loop starts.

The session factory arrives through `Depends(get_session_factory)` instead of an
import, so integration tests can point the handshake at the test database.
"""

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.core.database import get_session_factory
from app.models.queue import Ticket
from app.models.tenant import Branch
from app.realtime import manager
from app.realtime.channels import branch_channel, ticket_channel
from app.realtime.payloads import connected, pong, ticket_snapshot, to_wire
from app.services import queue_service

router = APIRouter(prefix="/api/queue", tags=["Queue realtime"])

# 1008 (policy violation) for both an unknown branch and an unknown ticket. A
# caller who guessed an id is told "not for you" rather than "doesn't exist" —
# the same answer the HTTP routes give with a 404.
CLOSE_POLICY_VIOLATION = 1008

CLIENT_PING = "ping"


async def _serve(websocket: WebSocket, channel: str, snapshot: str | None) -> None:
    """Accept, subscribe, announce, then stay open until the client leaves.

    The receive loop doubles as disconnect detection: a client that vanishes
    raises `WebSocketDisconnect` here, and a client that silently dies is caught
    later by `ConnectionManager.dispatch` dropping the failed send.
    """
    await websocket.accept()
    await manager.connect(channel, websocket)
    try:
        await websocket.send_text(to_wire(connected(channel)))
        if snapshot is not None:
            await websocket.send_text(snapshot)
        while True:
            text = await websocket.receive_text()
            if text.strip().lower() == CLIENT_PING:
                await websocket.send_text(to_wire(pong()))
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(channel, websocket)


@router.websocket("/ws/branches/{branch_id}")
async def branch_socket(
    websocket: WebSocket,
    branch_id: str,
    business_id: str = Query(min_length=1),
    sessions=Depends(get_session_factory),
) -> None:
    """Staff console channel: every ticket event for one branch.

    `business_id` still comes from the client because auth is not wired yet
    (plan.md Q2), so this is tenant *filtering*, not enforcement. Same honest
    caveat as the HTTP routes — and the same fix when identity lands.
    """
    async with sessions() as db:
        branch = await db.scalar(
            select(Branch.id).where(
                Branch.id == branch_id, Branch.business_id == business_id
            )
        )
    if branch is None:
        await websocket.close(code=CLOSE_POLICY_VIOLATION, reason="unknown branch")
        return

    # No snapshot: the console's initial queue is an HTTP read, which the client
    # already makes. Pushing it here would duplicate the endpoint and the payload.
    await _serve(websocket, branch_channel(business_id, branch_id), None)


@router.websocket("/ws/tickets/{ticket_number}")
async def ticket_socket(
    websocket: WebSocket,
    ticket_number: str,
    sessions=Depends(get_session_factory),
) -> None:
    """Customer channel: status and wait for a single ticket.

    The tenant is resolved from the ticket rather than supplied by the client
    (plan.md Q11), so there is no `business_id` to forge. The trade is that
    anyone holding a ticket number can follow that one ticket — acceptable
    because the number is a random opaque string, and the channel carries only
    that ticket's status and estimate, never the rest of the branch's queue.
    """
    async with sessions() as db:
        ticket = await db.scalar(
            select(Ticket).where(Ticket.ticket_number == ticket_number)
        )
        if ticket is None:
            await websocket.close(code=CLOSE_POLICY_VIOLATION, reason="unknown ticket")
            return
        wait = await queue_service.estimate_wait_for_ticket(
            db, business_id=ticket.business_id, ticket_number=ticket.ticket_number
        )
        # Everything is read inside the block: once it exits the session is
        # closed and any leftover attribute access would be a lazy load on a
        # detached instance.
        snapshot = to_wire(ticket_snapshot(ticket, wait))
        channel = ticket_channel(ticket.business_id, ticket_number)

    await _serve(websocket, channel, snapshot)
