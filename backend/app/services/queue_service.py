from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.queue import ACTIVE_STATUSES, Service, Ticket, TicketStatus
from app.models.tenant import Branch, Business
from app.services import ticket_numbers
from app.services.ticket_status import validate_transition
from app.services.wait_time import DEFAULT_DURATION_MINS, WaitEstimate, build_estimate


class QueueError(Exception):
    pass


class NotFound(QueueError):
    pass


class CrossTenantAccess(QueueError):
    pass


class TicketNumberUnavailable(QueueError):
    pass


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def _generate_unique_ticket_number(db: AsyncSession, prefix: str) -> str:
    for _ in range(ticket_numbers.MAX_GENERATION_ATTEMPTS):
        candidate = ticket_numbers.generate_ticket_number(prefix)
        taken = await db.scalar(
            select(Ticket.id).where(Ticket.ticket_number == candidate)
        )
        if taken is None:
            return candidate
    raise TicketNumberUnavailable("could not generate a unique ticket number, try again")


async def create_ticket(
    db: AsyncSession,
    *,
    business_id: str,
    branch_id: str,
    service_id: str,
    customer_id: str,
    customer_name: str,
    customer_email: str | None = None,
    booked_for: datetime | None = None,
    notes: str | None = None,
    is_priority: bool = False,
) -> Ticket:
    service = await _load_service(db, business_id, service_id)

    branch = await db.scalar(
        select(Branch).where(Branch.id == branch_id, Branch.business_id == business_id)
    )
    if branch is None:
        raise NotFound("branch not found for this business")

    ticket = Ticket(
        business_id=business_id,
        branch_id=branch_id,
        service_id=service_id,
        customer_id=customer_id,
        customer_name=customer_name,
        customer_email=customer_email,
        notes=notes,
        is_priority=is_priority,
        status=TicketStatus.BOOKED.value,
        booked_for=booked_for or _now(),
        ticket_number=await _generate_unique_ticket_number(
            db, await _load_ticket_prefix(db, business_id)
        ),
    )
    ticket.service = service

    db.add(ticket)
    try:
        await db.flush()
    except IntegrityError as error:
        await db.rollback()
        raise QueueError(f"could not create ticket: {error.orig}") from error

    return ticket


async def _load_service(db: AsyncSession, business_id: str, service_id: str) -> Service:
    service = await db.scalar(
        select(Service).where(Service.id == service_id, Service.business_id == business_id)
    )
    if service is None:
        raise NotFound("service not found for this business")
    if not service.is_active:
        raise QueueError("service is not currently bookable")
    return service


async def _load_ticket_prefix(db: AsyncSession, business_id: str) -> str:
    prefix = await db.scalar(
        select(Business.ticket_prefix).where(Business.id == business_id)
    )
    return prefix or "LM"


async def get_ticket(
    db: AsyncSession, *, business_id: str, ticket_number: str
) -> Ticket:
    ticket = await db.scalar(
        select(Ticket).where(
            Ticket.ticket_number == ticket_number, Ticket.business_id == business_id
        )
    )
    if ticket is None:
        raise NotFound("ticket not found")
    return ticket


async def list_tickets(
    db: AsyncSession,
    *,
    business_id: str,
    branch_id: str | None = None,
    status: str | None = None,
    service_id: str | None = None,
    active_only: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[Ticket], int]:
    conditions = [Ticket.business_id == business_id]

    if branch_id:
        conditions.append(Ticket.branch_id == branch_id)
    if service_id:
        conditions.append(Ticket.service_id == service_id)
    if status:
        conditions.append(Ticket.status == status)
    if active_only:
        conditions.append(Ticket.status.in_(ACTIVE_STATUSES))

    total = await db.scalar(select(func.count()).select_from(Ticket).where(*conditions))

    result = await db.scalars(
        select(Ticket)
        .where(*conditions)
        # Priority lane first, then oldest booking. Same order a teller works
        # the queue in.
        .order_by(Ticket.is_priority.desc(), Ticket.booked_for.asc())
        .limit(limit)
        .offset(offset)
    )

    return list(result), total or 0


async def transition_ticket(
    db: AsyncSession,
    *,
    business_id: str,
    ticket_number: str,
    target_status: str,
) -> Ticket:
    ticket = await get_ticket(db, business_id=business_id, ticket_number=ticket_number)
    new_status = validate_transition(ticket.status, target_status)

    timestamp = _now()
    ticket.status = new_status
    if new_status == TicketStatus.CALLED.value:
        ticket.called_at = timestamp
    elif new_status == TicketStatus.DONE.value:
        ticket.completed_at = timestamp
    elif new_status == TicketStatus.CANCELLED.value:
        ticket.cancelled_at = timestamp

    await db.flush()
    return ticket


async def count_tickets_ahead(
    db: AsyncSession,
    *,
    branch_id: str,
    service_id: str,
    exclude_ticket_id: str | None = None,
) -> int:
    # Counts the way a teller actually works the queue: priority lane first,
    # then oldest first. A plain count would disagree with the real order.
    conditions = [
        Ticket.branch_id == branch_id,
        Ticket.service_id == service_id,
        Ticket.status == TicketStatus.BOOKED.value,
    ]
    if exclude_ticket_id:
        conditions.append(Ticket.id != exclude_ticket_id)

    reference = None
    if exclude_ticket_id:
        reference = await db.scalar(
            select(Ticket).where(
                Ticket.id == exclude_ticket_id,
                Ticket.branch_id == branch_id,
                Ticket.service_id == service_id,
            )
        )

    if reference is None or reference.booked_for is None:
        return await db.scalar(
            select(func.count()).select_from(Ticket).where(*conditions)
        ) or 0

    ahead_priority = await db.scalar(
        select(func.count())
        .select_from(Ticket)
        .where(
            *conditions,
            Ticket.is_priority.is_(True),
            Ticket.booked_for < reference.booked_for,
        )
    )
    ahead_standard = await db.scalar(
        select(func.count())
        .select_from(Ticket)
        .where(
            *conditions,
            Ticket.is_priority.is_(False),
            Ticket.booked_for <= reference.booked_for,
        )
    )
    return (ahead_priority or 0) + (ahead_standard or 0)


async def estimate_wait_for_ticket(
    db: AsyncSession, *, business_id: str, ticket_number: str
) -> WaitEstimate:
    ticket = await get_ticket(db, business_id=business_id, ticket_number=ticket_number)
    if ticket.status not in ACTIVE_STATUSES:
        return build_estimate(0, DEFAULT_DURATION_MINS)

    service = await db.get(Service, ticket.service_id)
    duration = service.duration_mins if service else DEFAULT_DURATION_MINS
    tickets_ahead = await count_tickets_ahead(
        db,
        branch_id=ticket.branch_id,
        service_id=ticket.service_id,
        exclude_ticket_id=ticket.id,
    )
    return build_estimate(tickets_ahead, duration)


async def list_services(
    db: AsyncSession, *, business_id: str, active_only: bool = True
) -> list[Service]:
    conditions = [Service.business_id == business_id]
    if active_only:
        conditions.append(Service.is_active.is_(True))

    result = await db.scalars(
        select(Service).where(*conditions).order_by(Service.name.asc())
    )
    return list(result)
