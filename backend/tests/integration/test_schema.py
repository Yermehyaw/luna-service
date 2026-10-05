import uuid

import pytest
from sqlalchemy import delete, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Branch, Business, Customer, Payment, Service, Ticket

pytestmark = pytest.mark.schema


def unique_suffix():
    return uuid.uuid4().hex[:8]


async def test_every_id_is_a_uuid(db: AsyncSession):
    business = Business(name="Acme", subdomain=f"schema-{unique_suffix()}")
    db.add(business)
    await db.commit()

    assert len(business.id) == 36
    assert business.id.count("-") == 4


async def test_timestamps_are_populated_by_the_database(db: AsyncSession):
    business = Business(name="Acme", subdomain=f"schema-{unique_suffix()}")
    db.add(business)
    await db.commit()
    await db.refresh(business)

    assert business.created_at is not None
    assert business.updated_at is not None


async def test_subdomain_is_required(db: AsyncSession):
    db.add(Business(name="No Subdomain"))

    with pytest.raises(IntegrityError):
        await db.commit()
    await db.rollback()


async def test_subdomain_is_unique(db: AsyncSession):
    subdomain = f"dup-{unique_suffix()}"
    db.add(Business(name="First", subdomain=subdomain))
    await db.commit()

    db.add(Business(name="Second", subdomain=subdomain))
    with pytest.raises(IntegrityError):
        await db.commit()
    await db.rollback()


async def _tenant_fixture(db: AsyncSession, ticket_number: str):
    business = Business(name="Acme", subdomain=f"schema-{unique_suffix()}")
    db.add(business)
    await db.flush()

    branch = Branch(business_id=business.id, name="Main")
    service = Service(business_id=business.id, name="Svc", duration_mins=10)
    customer = Customer(
        business_id=business.id, full_name="Ada", email="ada@example.com"
    )
    db.add_all([branch, service, customer])
    await db.flush()

    ticket = Ticket(
        business_id=business.id,
        branch_id=branch.id,
        service_id=service.id,
        customer_id=customer.id,
        customer_name="Ada",
        ticket_number=ticket_number,
        status="booked",
    )
    db.add(ticket)
    await db.commit()
    return business, ticket


async def test_ticket_number_is_unique(db: AsyncSession):
    business, ticket = await _tenant_fixture(db, "AC-DUP01")

    db.add(
        Ticket(
            business_id=business.id,
            branch_id=ticket.branch_id,
            service_id=ticket.service_id,
            customer_id=ticket.customer_id,
            customer_name="Ada",
            ticket_number="AC-DUP01",
            status="booked",
        )
    )

    with pytest.raises(IntegrityError):
        await db.commit()
    await db.rollback()


async def test_ticket_requires_a_real_branch(db: AsyncSession):
    business = Business(name="Acme", subdomain=f"schema-{unique_suffix()}")
    db.add(business)
    await db.flush()
    service = Service(business_id=business.id, name="Svc", duration_mins=10)
    customer = Customer(
        business_id=business.id, full_name="Ada", email="ada@example.com"
    )
    db.add_all([service, customer])
    await db.flush()

    db.add(
        Ticket(
            business_id=business.id,
            branch_id="does-not-exist",
            service_id=service.id,
            customer_id=customer.id,
            customer_name="Ada",
            ticket_number="AC-GHOST1",
            status="booked",
        )
    )

    with pytest.raises(IntegrityError):
        await db.commit()
    await db.rollback()


async def test_deleting_a_business_removes_its_whole_subtree(db: AsyncSession):
    # Bulk delete rather than db.delete() so the cascade under test is the
    # database's, not the ORM's in-memory cascade.
    await db.execute(
        text(
            "TRUNCATE payments, tickets, services, branches, customers, "
            "businesses RESTART IDENTITY CASCADE"
        )
    )
    await db.commit()

    business, _ = await _tenant_fixture(db, "AC-DEL001")

    await db.execute(delete(Business).where(Business.id == business.id))
    await db.commit()

    for table in ("branches", "services", "customers", "tickets"):
        count = await db.scalar(text(f"SELECT count(*) FROM {table}"))
        assert count == 0, f"{table} still has rows after the business was deleted"


async def test_payment_is_attached_to_its_ticket(db: AsyncSession):
    business, ticket = await _tenant_fixture(db, "AC-PAY001")

    db.add(
        Payment(
            business_id=business.id,
            ticket_id=ticket.id,
            amount_kobo=500000,
            currency="NGN",
            provider="alatpay",
            status="pending",
        )
    )
    await db.commit()

    loaded = await db.scalar(
        select(Ticket).where(Ticket.id == ticket.id).options(selectinload(Ticket.payments))
    )
    assert len(loaded.payments) == 1
    assert loaded.payments[0].amount_kobo == 500000


async def test_payment_reference_is_unique_so_a_retry_cannot_double_apply(
    db: AsyncSession,
):
    business, ticket = await _tenant_fixture(db, "AC-PAY002")

    def payment():
        return Payment(
            business_id=business.id,
            ticket_id=ticket.id,
            amount_kobo=1000,
            status="pending",
            provider_reference="ref-duplicate-1",
        )

    db.add(payment())
    await db.commit()

    db.add(payment())
    with pytest.raises(IntegrityError):
        await db.commit()
    await db.rollback()
