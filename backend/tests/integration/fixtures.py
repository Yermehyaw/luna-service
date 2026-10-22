import uuid

import pytest_asyncio
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Branch, Business, Customer, Service, Ticket


@pytest_asyncio.fixture
async def db(session_factory) -> AsyncSession:
    async with session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def tenant(db):
    business = Business(
        name="Acme Bank",
        short="acme",
        type="bank",
        subdomain=f"it-{uuid.uuid4().hex[:12]}",
        ticket_prefix="AC",
    )
    db.add(business)
    await db.flush()

    branch = Branch(business_id=business.id, name="Lagos Main", code="LOS")
    service = Service(
        business_id=business.id,
        name="Account Opening",
        duration_mins=15,
        requires_payment=True,
        price_kobo=500000,
    )
    inactive = Service(business_id=business.id, name="Retired", is_active=False)
    customer = Customer(
        business_id=business.id,
        full_name="Ada Lovelace",
        email=f"ada-{uuid.uuid4().hex[:8]}@example.com",
    )
    db.add_all([branch, service, inactive, customer])
    await db.commit()

    return {
        "business_id": business.id,
        "branch_id": branch.id,
        "service_id": service.id,
        "inactive_service_id": inactive.id,
        "customer_id": customer.id,
    }


@pytest_asyncio.fixture
async def other_tenant(db):
    business = Business(
        name="Glob Bank",
        short="glob",
        type="bank",
        subdomain=f"it-{uuid.uuid4().hex[:12]}",
        ticket_prefix="GB",
    )
    db.add(business)
    await db.flush()

    branch = Branch(business_id=business.id, name="Abuja", code="ABJ")
    service = Service(
        business_id=business.id, name="Loan Application", duration_mins=30
    )
    customer = Customer(
        business_id=business.id,
        full_name="Kemi Ade",
        email=f"kemi-{uuid.uuid4().hex[:8]}@example.com",
    )
    db.add_all([branch, service, customer])
    await db.commit()

    return {
        "business_id": business.id,
        "branch_id": branch.id,
        "service_id": service.id,
        "customer_id": customer.id,
    }


@pytest_asyncio.fixture(autouse=True)
async def _clean_tickets(session_factory):
    yield
    async with session_factory() as session:
        await session.execute(delete(Ticket))
        await session.commit()
