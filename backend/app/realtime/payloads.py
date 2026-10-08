"""Event payloads sent over the queue's WebSockets.

Kept out of the transport so the wire format can be asserted without Redis, a
socket, or a database. Every payload is a dict of the same shape::

    {"type": "...", "timestamp": "<iso8601>", "data": {...}}

`data` is a dumped `TicketResponse`, so a WebSocket client and an HTTP client
see the same fields for the same ticket.
"""

import json
from datetime import datetime, timezone

from app.models.queue import Ticket
from app.schemas.queue import build_ticket_response
from app.services.wait_time import WaitEstimate

TICKET_CREATED = "ticket.created"
TICKET_STATUS_CHANGED = "ticket.status_changed"
TICKET_WAIT_UPDATED = "ticket.wait_updated"
TICKET_SNAPSHOT = "ticket.snapshot"
CONNECTED = "connected"
PONG = "pong"


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def event(event_type: str, data: dict) -> dict:
    return {"type": event_type, "timestamp": _timestamp(), "data": data}


def to_wire(payload: dict) -> str:
    # The payload was already dumped with mode="json", so datetimes and enums are
    # plain strings by now. No custom encoder sits on this path to break later.
    return json.dumps(payload)


def connected(channel: str) -> dict:
    """Sent once on accept so the client can confirm which channel it landed on."""
    return event(CONNECTED, {"channel": channel})


def pong() -> dict:
    """Answer to a client "ping", so a browser can tell a live socket from a
    half-open one that stopped delivering events."""
    return event(PONG, {})


def ticket_created(
    ticket: Ticket, wait: WaitEstimate | None = None
) -> dict:
    return event(
        TICKET_CREATED, build_ticket_response(ticket, wait).model_dump(mode="json")
    )


def ticket_status_changed(
    ticket: Ticket, previous_status: str, wait: WaitEstimate | None = None
) -> dict:
    data = build_ticket_response(ticket, wait).model_dump(mode="json")
    # Carried alongside `status` because "what changed" is the single most useful
    # thing for a client diffing its local copy.
    data["previous_status"] = previous_status
    return event(TICKET_STATUS_CHANGED, data)


def ticket_wait_updated(ticket: Ticket, wait: WaitEstimate | None = None) -> dict:
    """Published to tickets whose position changed because *someone else* moved.

    Without this a customer's page stays correct only until another ticket is
    called, and then quietly tells them the wrong thing.
    """
    return event(
        TICKET_WAIT_UPDATED, build_ticket_response(ticket, wait).model_dump(mode="json")
    )


def ticket_snapshot(ticket: Ticket, wait: WaitEstimate | None = None) -> dict:
    """Current state of one ticket, sent the moment its socket opens.

    Distinct from `ticket.created` because nothing just happened — the page needs
    something to render before the next event, which may be hours away for a
    ticket already booked for later in the day.
    """
    return event(
        TICKET_SNAPSHOT, build_ticket_response(ticket, wait).model_dump(mode="json")
    )
