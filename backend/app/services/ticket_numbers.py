import secrets
import string

# 0/O and 1/I/L get misread when a number is read aloud or typed off a phone
# screen, so they stay out of the random part.
AMBIGUOUS_CHARACTERS = "01OIL"
ALPHABET = "".join(
    c for c in string.ascii_uppercase + string.digits if c not in AMBIGUOUS_CHARACTERS
)
SUFFIX_LENGTH = 5
MAX_GENERATION_ATTEMPTS = 8


class TicketNumberError(RuntimeError):
    pass


class TicketNumberExhausted(TicketNumberError):
    pass


def normalize_prefix(prefix: str) -> str:
    cleaned = "".join(c for c in prefix.upper() if c in string.ascii_uppercase)
    return cleaned or "LM"


def generate_suffix(length: int = SUFFIX_LENGTH) -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(length))


def format_ticket_number(prefix: str, suffix: str) -> str:
    return f"{normalize_prefix(prefix)}-{suffix}"


def generate_ticket_number(prefix: str = "LM", length: int = SUFFIX_LENGTH) -> str:
    """Uniqueness is the caller's problem, only the DB can enforce it."""
    return format_ticket_number(prefix, generate_suffix(length))
