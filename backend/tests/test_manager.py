"""The per-process socket registry.

`ConnectionManager` is the only thing between an event and a live socket, so the
behaviours worth pinning are: it reaches the right channel, it survives a client
that vanished mid-send, and it does not leak empty channels.
"""

from app.realtime.channels import branch_channel, ticket_channel
from app.realtime.manager import ConnectionManager

CHANNEL = branch_channel("business-a", "branch-a")


class FakeWebSocket:
    """Enough of a Starlette WebSocket for `send_text`, which is all we call."""

    def __init__(self) -> None:
        self.sent: list[str] = []

    async def send_text(self, message: str) -> None:
        self.sent.append(message)


class BrokenWebSocket(FakeWebSocket):
    """A client that dropped without closing its socket."""

    async def send_text(self, message: str) -> None:
        raise RuntimeError("client vanished")


async def test_dispatch_reaches_only_the_subscribed_channel():
    manager = ConnectionManager()
    on_branch, on_ticket = FakeWebSocket(), FakeWebSocket()
    await manager.connect(CHANNEL, on_branch)
    await manager.connect(ticket_channel("business-a", "AC-ABC12"), on_ticket)

    delivered = await manager.dispatch(CHANNEL, "hello")

    assert delivered == 1
    assert on_branch.sent == ["hello"]
    assert on_ticket.sent == []


async def test_dispatch_reaches_every_socket_on_the_channel():
    manager = ConnectionManager()
    first, second = FakeWebSocket(), FakeWebSocket()
    await manager.connect(CHANNEL, first)
    await manager.connect(CHANNEL, second)

    await manager.dispatch(CHANNEL, "hello")

    assert first.sent == ["hello"]
    assert second.sent == ["hello"]


async def test_dispatch_to_an_unknown_channel_is_a_noop():
    manager = ConnectionManager()

    assert await manager.dispatch("queue:branch:none:none", "hello") == 0


async def test_a_failed_socket_is_dropped_and_the_others_still_receive():
    manager = ConnectionManager()
    healthy, broken = FakeWebSocket(), BrokenWebSocket()
    await manager.connect(CHANNEL, healthy)
    await manager.connect(CHANNEL, broken)

    delivered = await manager.dispatch(CHANNEL, "hello")

    # One live client must not be starved by another client dying mid-broadcast.
    assert delivered == 1
    assert healthy.sent == ["hello"]
    assert manager.connection_count(CHANNEL) == 1


async def test_the_only_socket_failing_clears_the_channel():
    manager = ConnectionManager()
    await manager.connect(CHANNEL, BrokenWebSocket())

    await manager.dispatch(CHANNEL, "hello")

    # Channels are one per ticket, so they accumulate in the thousands over a
    # few days of uptime. An empty one has to go back on the next failure.
    assert manager.connection_count(CHANNEL) == 0


async def test_disconnect_removes_the_socket_and_counts_correctly():
    manager = ConnectionManager()
    socket = FakeWebSocket()
    await manager.connect(CHANNEL, socket)
    await manager.connect(ticket_channel("business-a", "AC-ABC12"), FakeWebSocket())

    assert manager.connection_count(CHANNEL) == 1
    assert manager.connection_count() == 2

    manager.disconnect(CHANNEL, socket)

    assert manager.connection_count(CHANNEL) == 0
    assert manager.connection_count() == 1


async def test_disconnecting_an_unknown_socket_is_safe():
    manager = ConnectionManager()

    manager.disconnect(CHANNEL, FakeWebSocket())

    assert manager.connection_count() == 0
