"""The WebSocket wire format.

Asserted without Redis, a socket or a database: a payload is a dict with an
envelope (`type`, `timestamp`, `data`) and `data` is the same `TicketResponse`
an HTTP client gets, so the two transports cannot drift apart.
"""

import json
from datetime import datetime, timezone

from app.models.queue import Ticket
from app.realtime.payloads import (
    CONNECTED,
    PONG,
    TICKET_CREATED,
    TICKET_SNAPSHOT,
    TICKET_STATUS_CHANGED,
    TICKET_WAIT_UPDATED,
    connected,
    pong,
    ticket_created,
    ticket_snapshot,
    ticket_status_changed,
    ticket_wait_updated,
    to_wire,
)
from app.services.wait_time import build_estimate

NOW = datetime(2026, 1, 1, 9, 0, tzinfo=timezone.utc)


def make_ticket(**overrides) -> Ticket:
    """A detached Ticket, so payload shape can be checked with no session."""
    fields = dict(
        id="ticket-id",
        business_id="business-a",
        branch_id="branch-a",
        service_id="service-a",
        customer_id="customer-a",
        ticket_number="AC-ABC12",
        customer_name="Ada Lovelace",
        customer_email="ada@example.com",
        status="booked",
        is_priority=False,
        booked_for=None,
        created_at=NOW,
        updated_at=NOW,
    )
    fields.update(overrides)
    return Ticket(**fields)


def test_created_payload_has_the_envelope():
    payload = ticket_created(make_ticket())

    assert payload["type"] == TICKET_CREATED
    assert payload["timestamp"].endswith("+00:00")
    assert isinstance(payload["data"], dict)


def test_created_payload_data_is_the_http_body():
    # Same builder, same fields: a client rendering either transport shows the
    # same ticket without a second mapping table.
    payload = ticket_created(make_ticket(), build_estimate(2, 15))

    data = payload["data"]
    assert data["ticket_number"] == "AC-ABC12"
    assert data["customer_name"] == "Ada Lovelace"
    assert data["status"] == "booked"
    assert data["wait"] == {
        "minutes": 30,
        "tickets_ahead": 2,
        "service_duration_mins": 15,
        "display": "About 30 min",
    }


def test_payload_without_an_estimate_has_a_null_wait():
    payload = ticket_created(make_ticket())

    assert payload["data"]["wait"] is None


def test_an_unreportable_estimate_is_still_labelled():
    # minutes is None when the queue is past the credible horizon, and the
    # display string is what the UI prints in that case.
    payload = ticket_created(make_ticket(), build_estimate(100, 15))

    assert payload["data"]["wait"]["minutes"] is None
    assert payload["data"]["wait"]["display"] == "Being scheduled"


def test_status_change_carries_the_previous_status():
    payload = ticket_status_changed(make_ticket(status="called"), "booked")

    assert payload["type"] == TICKET_STATUS_CHANGED
    assert payload["data"]["status"] == "called"
    assert payload["data"]["previous_status"] == "booked"


def test_wait_update_is_plain_ticket_data():
    # A customer whose position moved because someone else moved must see their
    # own estimate, not a diff of somebody else's ticket.
    payload = ticket_wait_updated(make_ticket(), build_estimate(1, 15))

    assert payload["type"] == TICKET_WAIT_UPDATED
    assert "previous_status" not in payload["data"]
    assert payload["data"]["wait"]["tickets_ahead"] == 1


def test_snapshot_marks_itself_as_state_not_as_an_event():
    payload = ticket_snapshot(make_ticket(), build_estimate(0, 15))

    assert payload["type"] == TICKET_SNAPSHOT
    assert payload["data"]["wait"]["tickets_ahead"] == 0


def test_connected_names_the_channel_it_landed_on():
    payload = connected("queue:branch:business-a:branch-a")

    assert payload["type"] == CONNECTED
    assert payload["data"]["channel"] == "queue:branch:business-a:branch-a"


def test_pong_carries_no_data():
    payload = pong()

    assert payload["type"] == PONG
    assert payload["data"] == {}


def test_to_wire_is_json_that_round_trips():
    payload = ticket_created(make_ticket())

    wire = to_wire(payload)

    assert isinstance(wire, str)
    assert json.loads(wire) == payload
