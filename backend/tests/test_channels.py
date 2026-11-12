"""Channel names are the tenant boundary of the realtime layer.

The Redis subscription pattern is a wildcard, so the name of a channel is the
only thing keeping one business' queue events off another business' sockets.
These assertions are cheap; the failure they catch would not be.
"""

from app.realtime.channels import CHANNEL_PATTERN, branch_channel, ticket_channel

BUSINESS_A = "business-a"
BUSINESS_B = "business-b"
SHARED_ID = "the-same-string"
NUMBER = "AC-ABC12"


def test_branch_channel_names_the_business_and_the_branch():
    assert branch_channel(BUSINESS_A, SHARED_ID) == (
        f"queue:branch:{BUSINESS_A}:{SHARED_ID}"
    )


def test_ticket_channel_names_the_business_and_the_ticket_number():
    assert ticket_channel(BUSINESS_A, NUMBER) == (
        f"queue:ticket:{BUSINESS_A}:{NUMBER}"
    )


def test_two_businesses_never_land_on_the_same_channel():
    # Both ids are client-supplied today (no auth yet, plan.md Q2), so the
    # business id is the part doing the isolation work.
    assert branch_channel(BUSINESS_A, SHARED_ID) != branch_channel(
        BUSINESS_B, SHARED_ID
    )
    assert ticket_channel(BUSINESS_A, NUMBER) != ticket_channel(BUSINESS_B, NUMBER)


def test_a_branch_and_a_ticket_with_the_same_id_do_not_collide():
    # Prefix difference: an id reused across the two channel families cannot
    # carry one kind of event to a subscriber of the other.
    assert branch_channel(BUSINESS_A, SHARED_ID) != ticket_channel(
        BUSINESS_A, SHARED_ID
    )


def test_the_subscription_pattern_covers_both_channel_families():
    # CHANNEL_PATTERN is what the single Redis pattern subscription uses. A typo
    # here would leave cross-worker delivery silently empty while local dispatch
    # keeps working, so the match is spelled out rather than assumed.
    assert CHANNEL_PATTERN == "queue:*"
    assert branch_channel(BUSINESS_A, SHARED_ID).startswith("queue:")
    assert ticket_channel(BUSINESS_A, NUMBER).startswith("queue:")
