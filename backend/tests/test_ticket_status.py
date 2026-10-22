import pytest

from app.models.queue import ALLOWED_TRANSITIONS, TicketStatus
from app.services.ticket_status import (
    InvalidStatus,
    InvalidTransition,
    allowed_transitions,
    can_transition,
    ensure_known_status,
    is_terminal,
    validate_transition,
)


def test_every_status_has_a_transition_rule():
    for status in TicketStatus.values():
        assert status in ALLOWED_TRANSITIONS


def test_booked_can_move_to_called_cancelled_or_no_show():
    assert allowed_transitions(TicketStatus.BOOKED.value) == {
        "called",
        "cancelled",
        "no_show",
    }


def test_called_can_move_to_done_or_no_show():
    assert allowed_transitions(TicketStatus.CALLED.value) == {"done", "no_show"}


@pytest.mark.parametrize("status", ["done", "cancelled", "no_show"])
def test_terminal_statuses_have_nowhere_to_go(status):
    assert allowed_transitions(status) == frozenset()
    assert is_terminal(status) is True


def test_done_cannot_go_back_to_called():
    assert can_transition("done", "called") is False


def test_a_ticket_cannot_skip_from_booked_to_done():
    assert can_transition("booked", "done") is False


def test_cancelled_cannot_be_resurrected():
    assert can_transition("cancelled", "booked") is False
    assert can_transition("cancelled", "called") is False


def test_a_ticket_cannot_be_called_twice():
    assert can_transition("called", "called") is False


def test_no_show_cannot_be_marked_done():
    assert can_transition("no_show", "done") is False


def test_transitioning_to_the_same_status_is_illegal():
    for status in TicketStatus.values():
        assert can_transition(status, status) is False


def test_validate_transition_returns_the_target_when_legal():
    assert validate_transition("booked", "called") == "called"
    assert validate_transition("called", "done") == "done"


def test_validate_transition_raises_on_an_illegal_move():
    with pytest.raises(InvalidTransition) as error:
        validate_transition("done", "called")

    assert error.value.current == "done"
    assert error.value.target == "called"


def test_validate_transition_raises_on_an_unknown_current_status():
    with pytest.raises(InvalidStatus):
        validate_transition("bokked", "called")


def test_validate_transition_raises_on_an_unknown_target_status():
    with pytest.raises(InvalidStatus):
        validate_transition("booked", "finished")


def test_can_transition_is_false_rather_than_raising_for_garbage():
    assert can_transition("nonsense", "called") is False
    assert can_transition("booked", "nonsense") is False


def test_is_terminal_rejects_an_unknown_status():
    with pytest.raises(InvalidStatus):
        is_terminal("nonsense")


def test_ensure_known_status_passes_through_a_valid_value():
    assert ensure_known_status("booked") == "booked"
