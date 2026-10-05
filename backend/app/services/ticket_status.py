from app.models.queue import ALLOWED_TRANSITIONS, TERMINAL_STATUSES, TicketStatus


class InvalidStatus(ValueError):
    pass


class InvalidTransition(ValueError):
    def __init__(self, current: str, target: str) -> None:
        self.current = current
        self.target = target
        super().__init__(f"cannot move a ticket from '{current}' to '{target}'")


def ensure_known_status(value: str) -> str:
    if value not in TicketStatus.values():
        raise InvalidStatus(f"'{value}' is not a valid ticket status")
    return value


def allowed_transitions(current: str) -> frozenset[str]:
    ensure_known_status(current)
    return ALLOWED_TRANSITIONS[current]


def is_terminal(status: str) -> bool:
    ensure_known_status(status)
    return status in TERMINAL_STATUSES


def can_transition(current: str, target: str) -> bool:
    if current not in ALLOWED_TRANSITIONS or target not in ALLOWED_TRANSITIONS:
        return False
    return target in ALLOWED_TRANSITIONS[current]


def validate_transition(current: str, target: str) -> str:
    ensure_known_status(current)
    ensure_known_status(target)
    if target not in ALLOWED_TRANSITIONS[current]:
        raise InvalidTransition(current, target)
    return target
