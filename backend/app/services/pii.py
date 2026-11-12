import re

EMAIL_PATTERN = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_PATTERN = re.compile(r"\+?\d[\d\s().-]{7,}\d")
LONG_DIGITS_PATTERN = re.compile(r"\b\d{10,}\b")

EMAIL_TOKEN = "[REDACTED_EMAIL]"
PHONE_TOKEN = "[REDACTED_PHONE]"
NUMBER_TOKEN = "[REDACTED_NUMBER]"


def scrub_pii(text: str | None) -> str | None:
    """Redact the identifiers that must never leave the tenant database.

    Applied at ingest and again at export, so a row written before a rule was
    added is still clean when it reaches a training file.
    """
    if text is None:
        return None

    scrubbed = EMAIL_PATTERN.sub(EMAIL_TOKEN, text)
    scrubbed = LONG_DIGITS_PATTERN.sub(NUMBER_TOKEN, scrubbed)
    scrubbed = PHONE_PATTERN.sub(PHONE_TOKEN, scrubbed)
    return scrubbed
