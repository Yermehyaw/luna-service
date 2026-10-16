"""Registry of live WebSockets, grouped by channel.

This is per-process state: it only knows about sockets held by *this* worker.
Cross-worker delivery is the broker's job (see `app/realtime/broker.py`).
"""

import asyncio
import logging
from collections import defaultdict

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        self._channels: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, channel: str, websocket: WebSocket) -> None:
        self._channels[channel].add(websocket)

    def disconnect(self, channel: str, websocket: WebSocket) -> None:
        sockets = self._channels.get(channel)
        if sockets is None:
            return
        sockets.discard(websocket)
        # Drop empty channels rather than letting them accumulate. An API up for
        # a few days serves thousands of distinct channels (one per ticket).
        if not sockets:
            del self._channels[channel]

    def connection_count(self, channel: str | None = None) -> int:
        if channel is not None:
            return len(self._channels.get(channel, ()))
        return sum(len(sockets) for sockets in self._channels.values())

    async def dispatch(self, channel: str, message: str) -> int:
        """Send `message` to every socket on `channel`. Returns how many got it.

        Sends run concurrently so one stalled client cannot hold up the rest of
        the queue — a live update that arrives late is worse than no update.
        """
        sockets = self._channels.get(channel)
        if not sockets:
            return 0

        # Copy: a socket disconnecting mid-send mutates the set we iterate.
        targets = list(sockets)
        results = await asyncio.gather(
            *(websocket.send_text(message) for websocket in targets),
            return_exceptions=True,
        )

        delivered = 0
        for websocket, result in zip(targets, results):
            if result is None:
                delivered += 1
                continue
            # Anything a socket cannot be sent makes it unusable, so it is dropped
            # instead of lingering and failing on every later broadcast.
            logger.debug("dropping socket after send failure: %s", result)
            self.disconnect(channel, websocket)
        return delivered
