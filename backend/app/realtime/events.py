"""What gets published when, and to whom.

This sits in its own module rather than inside the router because the fan-out
rule — *when one ticket moves, everyone waiting behind it gets a new estimate* —
is the product behaviour of a live queue, not HTTP plumbing. It deserves to be
next to its tests.

Called after `db.commit()` so readers see committed state.
"""

import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.queue import Service, Ticket, TicketStatus
from app.realtime.channels import branch_channel, ticket_channel
from app.realtime.payloads import (
    ticket_created,
    ticket_status_changed,
    ticket_wait_updated,
    to_wire,
)
from app.services import queue_service
from app.services.wait_time import DEFAULT_DURATION_MINS, build_estimate

logger = logging.getLogger(__name__)

# A packed branch would otherwise fan out hundreds of queries inside one request.
# Capped so a busy branch degrades to slightly stale estimates rather than a slow
# endpoint — and stale-but-labelled beats a request that times out.
MAX_WAIT_FANOUT = 50


async def publish_ticket_created(
    db: AsyncSession, broker, *, ticket: Ticket, wait
) -> None:
    """Announce a new ticket to its branch and to the customer who holds it."""
    wire = to_wire(ticket_created(ticket, wait))
    await broker.publish(
        branch_channel(ticket.business_id, ticket.branch_id), wire
    )
    await broker.publish(
        ticket_channel(ticket.business_id, ticket.ticket_number), wire
    )
    await publish_wait_fanout(db, broker, ticket)


async def publish_ticket_status_changed(
    db: AsyncSession, broker, *, ticket: Ticket, previous_status: str, wait
) -> None:
    """Announce a transition, then refresh everyone it affected."""
    wire = to_wire(ticket_status_changed(ticket, previous_status, wait))
    await broker.publish(
        branch_channel(ticket.business_id, ticket.branch_id), wire
    )
    await broker.publish(
        ticket_channel(ticket.business_id, ticket.ticket_number), wire
    )
    await publish_wait_fanout(db, broker, ticket)


async def publish_wait_fanout(db: AsyncSession, broker, ticket: Ticket) -> None:
    """Push a refreshed estimate to every ticket waiting behind `ticket`.

    Moving one ticket to `called` changes how long everyone else has left. Without
    this, a customer's page is correct until somebody else moves and then quietly
    tells them the wrong thing for the rest of their wait.

    Only same-branch, same-service tickets are affected, because
    `count_tickets_ahead` is scoped to a branch and a service — anything wider
    would be broadcasting work that does not belong to them.
    """
    service = await db.get(Service, ticket.service_id)
    duration = service.duration_mins if service else DEFAULT_DURATION_MINS

    waiting = await db.scalars(
        select(Ticket)
        .where(
            Ticket.branch_id == ticket.branch_id,
            Ticket.service_id == ticket.service_id,
            Ticket.status == TicketStatus.BOOKED.value,
            Ticket.id != ticket.id,
        )
        # Same order the queue is worked, so if the cap bites it trims the tail
        # rather than the customers closest to being called.
        .order_by(Ticket.is_priority.desc(), Ticket.booked_for.asc())
        .limit(MAX_WAIT_FANOUT)
    )

    for neighbour in waiting:
        tickets_ahead = await queue_service.count_tickets_ahead(
            db,
            branch_id=neighbour.branch_id,
            service_id=neighbour.service_id,
            exclude_ticket_id=neighbour.id,
        )
        await broker.publish(
            ticket_channel(neighbour.business_id, neighbour.ticket_number),
            to_wire(ticket_wait_updated(neighbour, build_estimate(tickets_ahead, duration))),
        )
