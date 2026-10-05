import math
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

DEFAULT_DURATION_MINS = 15

# Past this the estimate stops being credible, so callers get None and the UI
# says "being scheduled" rather than printing something silly.
MAX_REPORTABLE_WAIT_MINS = 240


@dataclass(frozen=True)
class WaitEstimate:
    minutes: int | None
    tickets_ahead: int
    service_duration_mins: int

    @property
    def is_reliable(self) -> bool:
        return self.minutes is not None


def calculate_wait_minutes(
    tickets_ahead: int, service_duration_mins: int = DEFAULT_DURATION_MINS
) -> int | None:
    if tickets_ahead < 0:
        raise ValueError("tickets_ahead cannot be negative")
    if service_duration_mins <= 0:
        return None

    minutes = tickets_ahead * service_duration_mins
    if minutes > MAX_REPORTABLE_WAIT_MINS:
        return None
    return minutes


def build_estimate(
    tickets_ahead: int, service_duration_mins: int = DEFAULT_DURATION_MINS
) -> WaitEstimate:
    return WaitEstimate(
        minutes=calculate_wait_minutes(tickets_ahead, service_duration_mins),
        tickets_ahead=tickets_ahead,
        service_duration_mins=service_duration_mins,
    )


def projected_service_time(
    tickets_ahead: int,
    service_duration_mins: int = DEFAULT_DURATION_MINS,
    now: datetime | None = None,
) -> datetime | None:
    minutes = calculate_wait_minutes(tickets_ahead, service_duration_mins)
    if minutes is None:
        return None
    return (now or datetime.now(timezone.utc)) + timedelta(minutes=minutes)


def format_countdown(minutes: int | None) -> str:
    if minutes is None:
        return "Being scheduled"
    if minutes <= 0:
        return "Any moment now"
    if minutes < 60:
        return f"About {minutes} min"
    hours = math.floor(minutes / 60)
    remainder = minutes % 60
    if remainder == 0:
        return f"About {hours} hr"
    return f"About {hours} hr {remainder} min"
