"""Realtime delivery for queue events.

`manager` is this process' live sockets. `broker` decides whether events also
cross Redis, so that separate workers see the same queue.

Both are module-level singletons: a router broadcasts without plumbing them
through dependencies, and `main`'s lifespan starts and stops the broker without
anything knowing about it. Tests build their own instances to stay isolated.
"""

from app.core.config import settings
from app.realtime.broker import QueueBroker
from app.realtime.manager import ConnectionManager

manager = ConnectionManager()
broker = QueueBroker(settings.REDIS_URL)
