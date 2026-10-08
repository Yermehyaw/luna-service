"""The WebSocket endpoints, driven as a real client.

Everything else in the realtime suite stops at the routing rules; this exercises
`app/routers/ws.py` over an actual ASGI connection — handshake, close codes,
the frames pushed on open, and a status change arriving on a live socket.

`TestClient` is synchronous, so these run inside async tests: the socket's
portal lives on its own thread, which leaves the test free to keep using the
async HTTP client while the socket is open.
"""

import json

import pytest
from starlette.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.main import app
from app.realtime import broker, manager
from app.realtime.channels import branch_channel, ticket_channel


@pytest.fixture
def sockets(monkeypatch) -> TestClient:
    # The ASGI test transport never runs the lifespan, so nothing attaches the
    # broker to the connection manager and `publish` would return early. This is
    # the same assignment `main.py` makes at startup, minus the Redis attempt.
    # The manager is process-wide, so it is emptied on the way out: a test that
    # dies mid-socket must not leave a channel subscribed for the next one.
    monkeypatch.setattr(broker, "_manager", manager)
    yield TestClient(app)
    manager._channels.clear()


def _branch_url(tenant) -> tuple[str, dict]:
    return (
        f"/api/queue/ws/branches/{tenant['branch_id']}",
        {"business_id": tenant["business_id"]},
    )


def _create_payload(tenant) -> dict:
    return {
        "business_id": tenant["business_id"],
        "branch_id": tenant["branch_id"],
        "service_id": tenant["service_id"],
        "customer_id": tenant["customer_id"],
        "customer_name": "Ada Lovelace",
    }


async def test_a_staff_socket_is_told_which_channel_it_joined(client, sockets, tenant):
    url, params = _branch_url(tenant)

    with sockets.websocket_connect(url, params=params) as session:
        frame = json.loads(session.receive_text())

    assert frame["type"] == "connected"
    assert frame["data"]["channel"] == branch_channel(
        tenant["business_id"], tenant["branch_id"]
    )


async def test_a_branch_that_is_not_the_tenants_is_refused(client, sockets, tenant):
    # Client-side `business_id` is the only tenant check until auth lands, so a
    # branch id from elsewhere has to be refused rather than subscribed.
    with pytest.raises(WebSocketDisconnect) as raised:
        with sockets.websocket_connect(
            "/api/queue/ws/branches/someone-elses-branch",
            params={"business_id": tenant["business_id"]},
        ):
            pass

    assert raised.value.code == 1008


async def test_a_ticket_socket_opens_with_its_own_state(client, sockets, tenant):
    created = (await client.post("/api/queue/tickets", json=_create_payload(tenant))).json()

    with sockets.websocket_connect(
        f"/api/queue/ws/tickets/{created['ticket_number']}"
    ) as session:
        handshake = json.loads(session.receive_text())
        snapshot = json.loads(session.receive_text())

    assert handshake["type"] == "connected"
    assert handshake["data"]["channel"] == ticket_channel(
        tenant["business_id"], created["ticket_number"]
    )
    assert snapshot["type"] == "ticket.snapshot"
    assert snapshot["data"]["ticket_number"] == created["ticket_number"]
    assert snapshot["data"]["wait"]["tickets_ahead"] == 0


async def test_an_unknown_ticket_is_refused(client, sockets, tenant):
    with pytest.raises(WebSocketDisconnect) as raised:
        with sockets.websocket_connect("/api/queue/ws/tickets/AC-NOPE1"):
            pass

    assert raised.value.code == 1008


async def test_a_client_ping_is_answered(client, sockets, tenant):
    url, params = _branch_url(tenant)

    with sockets.websocket_connect(url, params=params) as session:
        session.receive_text()
        session.send_text("ping")
        frame = json.loads(session.receive_text())

    assert frame["type"] == "pong"


async def test_a_status_change_arrives_on_the_open_branch_socket(
    client, sockets, tenant
):
    created = (await client.post("/api/queue/tickets", json=_create_payload(tenant))).json()
    url, params = _branch_url(tenant)

    with sockets.websocket_connect(url, params=params) as session:
        session.receive_text()  # the connected frame

        await client.patch(
            f"/api/queue/tickets/{created['ticket_number']}/status",
            params={"business_id": tenant["business_id"]},
            json={"status": "called"},
        )
        event = json.loads(session.receive_text())

    assert event["type"] == "ticket.status_changed"
    assert event["data"]["ticket_number"] == created["ticket_number"]
    assert event["data"]["previous_status"] == "booked"


async def test_a_status_change_arrives_on_the_customers_socket(
    client, sockets, tenant
):
    created = (await client.post("/api/queue/tickets", json=_create_payload(tenant))).json()

    with sockets.websocket_connect(
        f"/api/queue/ws/tickets/{created['ticket_number']}"
    ) as session:
        session.receive_text()  # the connected frame
        session.receive_text()  # the snapshot

        await client.patch(
            f"/api/queue/tickets/{created['ticket_number']}/status",
            params={"business_id": tenant["business_id"]},
            json={"status": "called"},
        )
        event = json.loads(session.receive_text())

    assert event["type"] == "ticket.status_changed"
    assert event["data"]["status"] == "called"
    assert event["data"]["wait"]["tickets_ahead"] == 0
