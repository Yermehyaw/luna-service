"""Fan-out for queue events, with Redis as an option rather than a dependency.

Two things have to happen when a ticket moves:

1. Every socket on *this* process hears about it — in-process dispatch.
2. Every other worker hears about it — Redis pub/sub.

(1) always runs, first, and on its own. That means a deployment with no Redis
at all still pushes live updates correctly; what it loses is only the ability to
reach sockets held by a different worker. Total realtime loss over a missing
dependency would be the wrong trade for a demo.

Because (1) always runs, each message carries the publishing process' id so the
listener can ignore its own echo. Without that, every event would reach every
socket exactly twice.
"""

import asyncio
import json
import logging
import uuid

from redis import asyncio as aioredis

from app.realtime.channels import CHANNEL_PATTERN
from app.realtime.manager import ConnectionManager

logger = logging.getLogger(__name__)

# Deliberately short: this runs during application startup, and a missing Redis
# must not be able to stall the server's boot sequence.
CONNECT_TIMEOUT_SECONDS = 1.5

# Fixed rather than exponential backoff. A live demo sitting behind a 32-second
# delay while Redis restarts is worse than one retrying every five seconds.
RECONNECT_SECONDS = 5.0


class QueueBroker:
    def __init__(self, redis_url: str) -> None:
        self._redis_url = redis_url
        self._manager: ConnectionManager | None = None
        self._client = None
        self._listener: asyncio.Task | None = None
        # Identifies this process so its own messages can be ignored on return.
        self._source = uuid.uuid4().hex
        self._redis_ok = False
        self._stopping = False

    @property
    def redis_connected(self) -> bool:
        return self._redis_ok

    async def start(self, manager: ConnectionManager) -> None:
        """Begin listening for cross-worker events. Never raises.

        Failure here is a supported state, not a startup error: the app boots,
        sockets connect, and updates flow to this process.
        """
        self._manager = manager
        if await self._connect():
            self._listener = asyncio.create_task(self._listen_loop())

    async def stop(self) -> None:
        self._stopping = True
        listener, self._listener = self._listener, None
        if listener is not None:
            listener.cancel()
            try:
                await listener
            except asyncio.CancelledError:
                pass
        await self._close_client()

    async def publish(self, channel: str, message: str) -> None:
        """Deliver `message` to every subscriber of `channel`, on every worker."""
        if self._manager is None:
            return

        await self._manager.dispatch(channel, message)

        if not self._redis_ok or self._client is None:
            return
        try:
            await self._client.publish(
                channel, json.dumps({"source": self._source, "message": message})
            )
        except Exception as error:
            # Local delivery already happened above, so nothing is lost by giving
            # up on the cross-worker hop here.
            logger.warning(
                "Redis publish failed (%s); queue updates stay on this process",
                error.__class__.__name__,
            )
            self._redis_ok = False

    async def _connect(self) -> bool:
        try:
            client = aioredis.from_url(
                self._redis_url,
                decode_responses=True,
                socket_connect_timeout=CONNECT_TIMEOUT_SECONDS,
            )
            await client.ping()
        except Exception as error:
            logger.warning(
                "Redis unavailable (%s); queue updates stay on this process only",
                error.__class__.__name__,
            )
            return False
        self._client = client
        self._redis_ok = True
        return True

    async def _close_client(self) -> None:
        client, self._client = self._client, None
        if client is None:
            return
        # aclose() is the current name; close() remains on older redis-py, and
        # a failed shutdown should never propagate into the app's shutdown path.
        close = getattr(client, "aclose", None) or getattr(client, "close", None)
        if close is None:
            return
        try:
            await close()
        except Exception:
            pass

    async def _listen_loop(self) -> None:
        """Follows Redis across reconnects until `stop()` is called.

        A Redis restart should cost a few seconds of single-process delivery,
        not force a redeploy of the API.
        """
        while not self._stopping:
            try:
                await self._listen_once()
            except asyncio.CancelledError:
                raise
            except Exception as error:
                logger.warning(
                    "Redis listener stopped (%s)", error.__class__.__name__
                )
            self._redis_ok = False
            await self._close_client()
            if self._stopping:
                return
            await asyncio.sleep(RECONNECT_SECONDS)
            if await self._connect():
                logger.info("Redis reconnected; cross-worker updates resumed")

    async def _listen_once(self) -> None:
        if self._client is None:
            raise RuntimeError("no redis client to listen on")
        pubsub = self._client.pubsub()
        # Pattern subscribe covers branch and ticket channels with one
        # subscription, so channels can be created without re-subscribing.
        await pubsub.psubscribe(CHANNEL_PATTERN)
        try:
            async for entry in pubsub.listen():
                if entry["type"] != "pmessage":
                    continue
                try:
                    envelope = json.loads(entry["data"])
                except (TypeError, ValueError):
                    # A malformed payload from something else writing to this
                    # keyspace must not take the listener down.
                    continue
                # Valid JSON that is not an object (a bare string, a number) is
                # the same kind of foreign traffic, just less obviously so.
                if not isinstance(envelope, dict):
                    continue
                if envelope.get("source") == self._source:
                    continue
                message = envelope.get("message")
                if isinstance(message, str) and self._manager is not None:
                    await self._manager.dispatch(entry["channel"], message)
        finally:
            try:
                await pubsub.punsubscribe(CHANNEL_PATTERN)
                close = getattr(pubsub, "aclose", None) or getattr(
                    pubsub, "close", None
                )
                if close is not None:
                    await close()
            except Exception:
                pass
