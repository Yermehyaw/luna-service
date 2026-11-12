from app.models.ai_feedback import AIFeedback, DatasetKind, FeedbackOutcome
from app.services.ai_feedback import derive_outcome
from app.services.pii import scrub_pii
from app.services.training_data import build_export_rows


def _feedback(**kwargs) -> AIFeedback:
    defaults = {
        "business_id": "biz-1",
        "message_text": "Where is my refund?",
        "intent": "refund_request",
        "intent_confidence": 0.9,
        "outcome": FeedbackOutcome.ACCEPTED.value,
    }
    defaults.update(kwargs)
    return AIFeedback(**defaults)


def test_derive_outcome_accepted_when_final_matches_suggestion():
    assert derive_outcome("Hello there", "Hello there") == "accepted"
    assert derive_outcome(" Hello there ", "Hello there") == "accepted"


def test_derive_outcome_edited_when_final_differs():
    assert derive_outcome("Hello", "Hello, sorry for the delay") == "edited"


def test_derive_outcome_unused_when_nothing_was_sent():
    assert derive_outcome("Hello", None) == "unused"
    assert derive_outcome("Hello", "   ") == "unused"
    assert derive_outcome(None, None) == "unused"


def test_scrub_pii_redacts_email_phone_and_account_numbers():
    text = "Mail ada@example.com or call +234 801 234 5678, account 0123456789"

    scrubbed = scrub_pii(text)

    assert "ada@example.com" not in scrubbed
    assert "[REDACTED_EMAIL]" in scrubbed
    assert "+234 801 234 5678" not in scrubbed
    assert "[REDACTED_PHONE]" in scrubbed
    assert "0123456789" not in scrubbed
    assert "[REDACTED_NUMBER]" in scrubbed


def test_scrub_pii_passes_through_plain_text_and_none():
    assert scrub_pii("The queue is too long") == "The queue is too long"
    assert scrub_pii(None) is None


def test_reply_pairs_only_keep_sent_replies():
    rows = [
        _feedback(final_reply="Thanks for waiting", outcome="accepted"),
        _feedback(final_reply="We fixed it", outcome="edited"),
        _feedback(final_reply=None, outcome="unused"),
    ]

    records = build_export_rows(DatasetKind.REPLY_PAIRS, rows)

    assert [record["reply"] for record in records] == [
        "Thanks for waiting",
        "We fixed it",
    ]
    assert records[0]["text"] == "Where is my refund?"


def test_intent_distill_filters_by_confidence():
    rows = [
        _feedback(intent="refund_request", intent_confidence=0.91),
        _feedback(intent="hours_inquiry", intent_confidence=0.4),
        _feedback(intent=None, intent_confidence=None),
    ]

    records = build_export_rows(
        DatasetKind.INTENT_DISTILL, rows, min_confidence=0.85
    )

    assert records == [
        {"text": "Where is my refund?", "intent": "refund_request", "confidence": 0.91}
    ]


def test_export_records_are_scrubbed_even_if_stored_text_was_not():
    rows = [
        _feedback(
            message_text="Reach me at ada@example.com",
            final_reply="Call 08012345678",
            outcome="edited",
        )
    ]

    records = build_export_rows(DatasetKind.REPLY_PAIRS, rows)

    assert "ada@example.com" not in records[0]["text"]
    assert "08012345678" not in records[0]["reply"]
