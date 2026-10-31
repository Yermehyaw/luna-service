"""Channel names for queue events.

A socket receives everything published on the name it subscribed to, and nothing
else. That makes the channel string the actual isolation boundary for realtime —
so every channel here embeds `business_id` as its first segment, and the channel
functions are the only place names are built. Inline f-strings scattered through
the routers would eventually produce one that forgot the tenant.

Channel shape::

    queue:branch:{business_id}:{branch_id}   # staff console, all tickets in a branch
    queue:ticket:{business_id}:{ticket_number}  # customer, their own ticket only

Segments are safe to join with `:` because both values come from the database:
`business_id`/`branch_id` are UUIDs and `ticket_number` is a generated opaque
string, none of which can contain a colon.
"""

BRANCH_CHANNEL_PREFIX = "queue:branch"
TICKET_CHANNEL_PREFIX = "queue:ticket"

# Matches every queue channel, so one Redis subscription covers both kinds
# instead of needing a fresh PSUBSCRIBE whenever a branch or ticket connects.
CHANNEL_PATTERN = "queue:*"


def branch_channel(business_id: str, branch_id: str) -> str:
    """Channel staff consoles subscribe to: every event for one branch."""
    return f"{BRANCH_CHANNEL_PREFIX}:{business_id}:{branch_id}"


def ticket_channel(business_id: str, ticket_number: str) -> str:
    """Channel a single customer subscribes to: their own ticket only."""
    return f"{TICKET_CHANNEL_PREFIX}:{business_id}:{ticket_number}"
