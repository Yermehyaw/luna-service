from datetime import datetime, timedelta, timezone

import pytest

from app.services.wait_time import (
    DEFAULT_DURATION_MINS,
    MAX_REPORTABLE_WAIT_MINS,
    build_estimate,
    calculate_wait_minutes,
    format_countdown,
    projected_service_time,
)

FIXED_NOW = datetime(2026, 10, 2, 9, 0, tzinfo=timezone.utc)


def test_nobody_ahead_means_no_wait():
    assert calculate_wait_minutes(0, service_duration_mins=15) == 0


def test_wait_is_tickets_ahead_times_service_duration():
    assert calculate_wait_minutes(4, service_duration_mins=15) == 60
    assert calculate_wait_minutes(1, service_duration_mins=30) == 30


def test_a_non_positive_service_duration_yields_no_estimate():
    assert calculate_wait_minutes(3, service_duration_mins=0) is None
    assert calculate_wait_minutes(3, service_duration_mins=-5) is None


def test_absurd_estimates_are_suppressed():
    assert calculate_wait_minutes(1000, service_duration_mins=15) is None


def test_the_reportable_ceiling_is_inclusive():
    assert calculate_wait_minutes(MAX_REPORTABLE_WAIT_MINS, 1) == MAX_REPORTABLE_WAIT_MINS
    assert calculate_wait_minutes(MAX_REPORTABLE_WAIT_MINS + 1, 1) is None


def test_negative_tickets_ahead_is_rejected():
    with pytest.raises(ValueError):
        calculate_wait_minutes(-1, 15)


def test_build_estimate_carries_the_inputs_through():
    estimate = build_estimate(3, 20)

    assert estimate.minutes == 60
    assert estimate.tickets_ahead == 3
    assert estimate.service_duration_mins == 20
    assert estimate.is_reliable is True


def test_build_estimate_reports_unreliable_when_suppressed():
    estimate = build_estimate(5000, 15)

    assert estimate.minutes is None
    assert estimate.is_reliable is False


def test_projected_service_time_adds_the_estimate():
    assert projected_service_time(2, 15, now=FIXED_NOW) == FIXED_NOW + timedelta(
        minutes=30
    )


def test_projected_service_time_is_none_when_unreliable():
    assert projected_service_time(5000, 15, now=FIXED_NOW) is None


def test_default_duration_is_used_when_unspecified():
    estimate = build_estimate(2)

    assert estimate.service_duration_mins == DEFAULT_DURATION_MINS
    assert estimate.minutes == 2 * DEFAULT_DURATION_MINS


@pytest.mark.parametrize(
    ("minutes", "expected"),
    [
        (None, "Being scheduled"),
        (0, "Any moment now"),
        (5, "About 5 min"),
        (45, "About 45 min"),
        (60, "About 1 hr"),
        (90, "About 1 hr 30 min"),
        (125, "About 2 hr 5 min"),
    ],
)
def test_countdown_text(minutes, expected):
    assert format_countdown(minutes) == expected


def test_countdown_never_invents_a_number_when_unknown():
    assert "min" not in format_countdown(None)
