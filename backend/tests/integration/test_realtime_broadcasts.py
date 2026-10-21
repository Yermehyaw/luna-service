"""What the API publishes when a ticket moves.

The broker is replaced with a recorder so these tests assert the *routing* —
which channel, which event, which tenant — without Redis, a socket or a worker.
That routing is the part where a mistake would leak one business' queue to
another's screens.
"""

import json
from datetime import datetime, timedelta, timezone

import pytest

from app.realtime.channels import branch_channel, ticket_channel

# Far enough ahead of "now" that the ordering between two bookings made within
# the same test is fixed rather than dependent on clock resolution.
LATER = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()


class RecordingBroker:
    """Captures publishes instead of dispatching or forwarding them."""

    def __init__(self) -> None:
        self.messages: list[tuple[str, str]] = []

    async def publish(self, channel: str, message: str) -> None:
        self.messages.append((channel, message))

    def channels(self) -> set[str]:
        return {channel for channel, _ in self.messages}

    def payloads(self, channel: str) -> list[dict]:
        return [
            json.loads(message)
            for published, message in self.messages
            if published == channel
        ]

    def types_on(self, channel: str) -> list[str]:
        return [payload["type"] for payload in self.payloads(channel)]


@pytest.fixture
def broker(monkeypatch) -> RecordingBroker:
    # The router binds `broker` as a module-level name at import time, so this
    # is the seam that has to be swapped.
    from app.routers import queue as queue_router

    recorder = RecordingBroker()
    monkeypatch.setattr(queue_router, "broker", recorder)
    return recorder


def _payload(tenant, **overrides):
    body = {
        "business_id": tenant["business_id"],
        "branch_id": tenant["branch_id"],
        "service_id": tenant["service_id"],
        "customer_id": tenant["customer_id"],
        "customer_name": "Ada Lovelace",
        "customer_email": "ada@example.com",
    }
    body.update(overrides)
    return body


def _branch_channel(tenant) -> str:
    return branch_channel(tenant["business_id"], tenant["branch_id"])


async def test_a_new_ticket_is_announced_on_its_branch_channel(
    client, tenant, broker
):
    response = await client.post("/api/queue/tickets", json=_payload(tenant))
    assert response.status_code == 201
    body = response.json()

    branch_messages = broker.payloads(_branch_channel(tenant))
    assert len(branch_messages) == 1
    assert branch_messages[0]["type"] == "ticket.created"
    # Identical to the HTTP body: a console and a browser tab rendering the two
    # transports must agree on what just happened.
    assert branch_messages[0]["data"] == body


async def test_a_new_ticket_is_announced_on_the_customers_own_channel(
    client, tenant, broker
):
    body = (await client.post("/api/queue/tickets", json=_payload(tenant))).json()

    channel = ticket_channel(tenant["business_id"], body["ticket_number"])
    messages = broker.payloads(channel)

    assert len(messages) == 1
    assert messages[0]["type"] == "ticket.created"
    assert messages[0]["data"] == body


async def test_a_second_booking_refreshes_the_ticket_already_waiting(
    client, tenant, broker
):
    first = (await client.post("/api/queue/tickets", json=_payload(tenant))).json()
    await client.post(
        "/api/queue/tickets", json=_payload(tenant, booked_for=LATER)
    )

    channel = ticket_channel(tenant["business_id"], first["ticket_number"])
    updates = [
        payload
        for payload in broker.payloads(channel)
        if payload["type"] == "ticket.wait_updated"
    ]

    # The payload is the *waiting customer's own ticket*, with their own
    # estimate — nobody else's name or number goes down that socket.
    assert len(updates) == 1
    assert updates[0]["data"]["ticket_number"] == first["ticket_number"]
    assert updates[0]["data"]["wait"]["tickets_ahead"] == 0


async def test_calling_a_ticket_announces_the_transition(client, tenant, broker):
    created = (await client.post("/api/queue/tickets", json=_payload(tenant))).json()
    response = await client.patch(
        f"/api/queue/tickets/{created['ticket_number']}/status",
        params={"business_id": tenant["business_id"]},
        json={"status": "called"},
    )
    assert response.status_code == 200
    body = response.json()

    for channel in (_branch_channel(tenant), ticket_channel(
        tenant["business_id"], created["ticket_number"]
    )):
        transitions = [
            payload
            for payload in broker.payloads(channel)
            if payload["type"] == "ticket.status_changed"
        ]
        assert len(transitions) == 1
        assert transitions[0]["data"]["status"] == "called"
        assert transitions[0]["data"]["previous_status"] == "booked"
        # Same as the HTTP body plus the one field only the event carries.
        without_delta = {
            key: value
            for key, value in transitions[0]["data"].items()
            if key != "previous_status"
        }
        assert without_delta == body


async def test_calling_the_next_ticket_refreshes_everyone_behind_it(
    client, tenant, broker
):
    first = (await client.post("/api/queue/tickets", json=_payload(tenant))).json()
    second = (
        await client.post(
            "/api/queue/tickets", json=_payload(tenant, booked_for=LATER)
        )
    ).json()

    # Ignore the bookings; only the transition matters here.
    broker.messages.clear()
    await client.patch(
        f"/api/queue/tickets/{first['ticket_number']}/status",
        params={"business_id": tenant["business_id"]},
        json={"status": "called"},
    )

    channel = ticket_channel(tenant["business_id"], second["ticket_number"])
    updates = [
        payload
        for payload in broker.payloads(channel)
        if payload["type"] == "ticket.wait_updated"
    ]

    assert len(updates) == 1
    assert updates[0]["data"]["wait"]["tickets_ahead"] == 0
    assert updates[0]["data"]["wait"]["display"] == "Any moment now"


async def test_wait_updates_stay_inside_the_service_that_moved(
    client, tenant, broker
):
    other_service = (
        await client.post(
            "/api/queue/services",
            json={
                "business_id": tenant["business_id"],
                "name": "Cash Deposit",
                "duration_mins": 10,
            },
        )
    ).json()
    first = (await client.post("/api/queue/tickets", json=_payload(tenant))).json()
    await client.post(
        "/api/queue/tickets",
        json=_payload(tenant, service_id=other_service["id"], booked_for=LATER),
    )

    # Same branch, different service: the fan-out must not touch it, because
    # count_tickets_ahead is scoped to a branch *and* a service.
    channel = ticket_channel(tenant["business_id"], first["ticket_number"])
    assert broker.types_on(channel) == ["ticket.created"]


async def test_one_business_never_hears_about_another(
    client, tenant, other_tenant, broker
):
    # The other business books first, so tenant A's fan-out runs while a
    # foreign ticket is sitting in the database looking for an excuse to move.
    other = (await client.post("/api/queue/tickets", json=_payload(other_tenant))).json()
    await client.post("/api/queue/tickets", json=_payload(tenant))

    other_channel = ticket_channel(
        other_tenant["business_id"], other["ticket_number"]
    )

    # `ticket.created` is its own booking, and nothing else: the second
    # business' booking produced no message that crossed the tenant boundary.
    assert broker.types_on(other_channel) == ["ticket.created"]

    # Every message went to exactly the four channels this pair of bookings
    # owns — nothing invented, nothing shared.
    tenant_number = next(
        payload["data"]["ticket_number"]
        for payload in broker.payloads(_branch_channel(tenant))
        if payload["type"] == "ticket.created"
    )
    assert broker.channels() == {
        _branch_channel(tenant),
        _branch_channel(other_tenant),
        ticket_channel(tenant["business_id"], tenant_number),
        other_channel,
    }
