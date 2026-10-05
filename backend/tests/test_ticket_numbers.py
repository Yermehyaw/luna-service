import re

from app.services import ticket_numbers
from app.services.ticket_numbers import (
    MAX_GENERATION_ATTEMPTS,
    TicketNumberExhausted,
    format_ticket_number,
    generate_ticket_number,
    generate_suffix,
    normalize_prefix,
)

TICKET_NUMBER_PATTERN = re.compile(r"^[A-Z]{2,8}-[A-Z0-9]{5}$")


def test_generated_number_matches_the_expected_shape():
    assert TICKET_NUMBER_PATTERN.match(generate_ticket_number("LM"))


def test_generated_number_uses_the_business_prefix():
    assert generate_ticket_number("ACME").startswith("ACME-")


def test_generated_suffix_never_contains_ambiguous_characters():
    for _ in range(500):
        suffix = generate_suffix()
        for character in suffix:
            assert character not in ticket_numbers.AMBIGUOUS_CHARACTERS


def test_suffix_length_is_configurable():
    assert len(generate_suffix(8)) == 8
    assert len(generate_suffix(3)) == 3


def test_numbers_are_not_sequential():
    numbers = [generate_ticket_number("LM") for _ in range(50)]

    assert numbers != sorted(numbers)
    assert len(set(numbers)) > 45


def test_numbers_do_not_leak_the_count_of_prior_tickets():
    # A counter padded to width would give a uniform, zero-led set.
    suffixes = [generate_suffix() for _ in range(200)]

    assert len(set(suffixes)) == 200
    assert len(set(suffix[0] for suffix in suffixes)) > 1
    assert not any(suffix.startswith("0") for suffix in suffixes)


def test_prefix_is_normalized_to_uppercase():
    assert normalize_prefix("acme") == "ACME"
    assert normalize_prefix("AcMe") == "ACME"


def test_prefix_strips_non_alpha_characters():
    assert normalize_prefix("AC-ME!") == "ACME"


def test_empty_prefix_falls_back_to_the_default():
    assert normalize_prefix("") == "LM"
    assert normalize_prefix("123") == "LM"


def test_format_ticket_number_joins_prefix_and_suffix():
    assert format_ticket_number("lm", "H2JKQ") == "LM-H2JKQ"


def test_generation_attempt_budget_is_bounded():
    assert 0 < MAX_GENERATION_ATTEMPTS <= 20


def test_ticket_number_exhausted_is_a_ticket_number_error():
    assert issubclass(TicketNumberExhausted, ticket_numbers.TicketNumberError)
