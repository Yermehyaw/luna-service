"""Redis fan-out, and the guarantee that it is optional.

The invariant every test here protects: a message published by this process
reaches this process' sockets even when there is no Redis at all. Cross-worker
delivery is the extra; losing it must never cost the whole feature.
"""

import json

from app.realtime.channels import branch_channel
from app.realtime.broker import QueueBroker
from app.realtime.manager import ConnectionManager

CHANNEL = branch_channel("business-a", "branch-a")


class SpyManager(ConnectionManager):
    """A manager that records dispatches without needing real sockets."""

    def __init__(self) -> None:
        super().__init__()
        self.dispatched: list[tuple[str, str]] = []

    async def dispatch(self, channel: str, message: str) -> int:
        self.dispatched.append((channel, message))
        return 1


async def _aiter(entries):
    for entry in entries:
        yield entry


class FakePubSub:
    def __init__(self, entries) -> None:
        self._entries = entries
        self.pattern = None

    async def psubscribe(self, pattern: str) -> None:
        self.pattern = pattern

    async def punsubscribe(self, pattern: str) -> None:
        pass

    async def aclose(self) -> None:
        pass

    def listen(self):
        return _aiter(self._entries)


class FakeRedis:
    """Stands in for a connected client, so no server is needed."""

    def __init__(self, entries=(), publish_error=None) -> None:
        self._entries = entries
        self.publish_error = publish_error
        self.published: list[tuple[str, str]] = []

    async def ping(self) -> bool:
        return True

    async def publish(self, channel: str, message: str) -> None:
        if self.publish_error is not None:
            raise self.publish_error
        self.published.append((channel, message))

    def pubsub(self) -> FakePubSub:
        return FakePubSub(self._entries)


async def _broker_without_redis(manager=None) -> QueueBroker:
    """A broker whose startup failed to reach Redis, as in a deployment that
    never ran one. `"not-a-url"` raises inside redis-py's URL parser, so the
    connection attempt costs nothing instead of blocking on a TCP timeout.
    """
    broker = QueueBroker("not-a-url")
    if manager is not None:
        await broker.start(manager)
    return broker


async def test_publish_before_start_does_nothing():
    # Nothing has subscribed the manager yet, so there is nowhere to deliver.
    manager = SpyManager()
    broker = QueueBroker("not-a-url")

    await broker.publish(CHANNEL, "hello")

    assert manager.dispatched == []


async def test_starting_without_redis_does_not_raise():
    # Failure here is a supported state: the app boots, sockets connect, and
    # updates still flow to this process.
    broker = await _broker_without_redis()

    assert broker.redis_connected is False

    await broker.stop()


async def test_publish_reaches_this_process_even_with_no_redis():
    manager = SpyManager()
    broker = await _broker_without_redis(manager)

    await broker.publish(CHANNEL, "hello")

    assert manager.dispatched == [(CHANNEL, "hello")]
    assert broker.redis_connected is False

    await broker.stop()


async def test_publish_sends_a_source_tagged_envelope_to_redis():
    # The `source` field is what lets the listener ignore its own echo; without
    # it every event would reach every local socket twice.
    manager = SpyManager()
    broker = await _broker_without_redis(manager)
    fake = FakeRedis()
    broker._client = fake
    broker._redis_ok = True

    await broker.publish(CHANNEL, "hello")

    assert manager.dispatched == [(CHANNEL, "hello")]
    channel, envelope = fake.published[0]
    assert channel == CHANNEL
    assert json.loads(envelope) == {"source": broker._source, "message": "hello"}

    await broker.stop()


async def test_a_failing_publish_keeps_local_delivery_and_marks_redis_down():
    manager = SpyManager()
    broker = await _broker_without_redis(manager)
    broker._client = FakeRedis(publish_error=RuntimeError("connection lost"))
    broker._redis_ok = True

    await broker.publish(CHANNEL, "hello")

    # Local delivery already happened, so nothing is lost by giving up on the
    # cross-worker hop.
    assert manager.dispatched == [(CHANNEL, "hello")]
    assert broker.redis_connected is False

    await broker.stop()


async def test_the_own_echo_is_not_dispatched_a_second_time():
    entries = [
        # Non-pmessage frames (subscribe acks, messages on other channels).
        {"type": "subscribe", "data": 1},
        # Garbage that never parses as an envelope.
        {"type": "pmessage", "channel": CHANNEL, "data": "not json"},
        # Valid JSON that is not an object, so `.get` would blow up on it.
        {"type": "pmessage", "channel": CHANNEL, "data": "42"},
        # This process' own message, which local dispatch already delivered.
        {
            "type": "pmessage",
            "channel": CHANNEL,
            "data": json.dumps({"source": "this-process", "message": "mine"}),
        },
        # A worker we have never met: must be forwarded, not assumed to be ours.
        {
            "type": "pmessage",
            "channel": CHANNEL,
            "data": json.dumps({"source": "another-worker", "message": "theirs"}),
        },
        # A JSON envelope with no source at all is foreign by definition.
        {
            "type": "pmessage",
            "channel": CHANNEL,
            "data": json.dumps({"message": "no-source"}),
        },
    ]
    manager = SpyManager()
    broker = await _broker_without_redis(manager)
    broker._source = "this-process"
    broker._client = FakeRedis(entries)

    await broker._listen_once()

    assert manager.dispatched == [
        (CHANNEL, "theirs"),
        (CHANNEL, "no-source"),
    ]

    await broker.stop()


async def test_stopping_without_starting_is_safe():
    broker = QueueBroker("not-a-url")

    await broker.stop()

    assert broker.redis_connected is False
