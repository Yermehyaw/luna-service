from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.queue import Service
from app.schemas.queue import (
    PageLimit,
    PageOffset,
    ServiceCreate,
    ServiceListResponse,
    ServiceResponse,
    TicketCreate,
    TicketListResponse,
    TicketResponse,
    TicketStatusUpdate,
    WaitEstimateResponse,
)
from app.services import queue_service
from app.services.queue_service import NotFound, QueueError
from app.services.ticket_status import InvalidTransition
from app.services.wait_time import format_countdown

router = APIRouter(prefix="/api/queue", tags=["Queue"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


def _to_response(ticket, wait_estimate=None) -> TicketResponse:
    response = TicketResponse.model_validate(ticket)
    if wait_estimate is not None:
        response.wait = WaitEstimateResponse(
            minutes=wait_estimate.minutes,
            tickets_ahead=wait_estimate.tickets_ahead,
            service_duration_mins=wait_estimate.service_duration_mins,
            display=format_countdown(wait_estimate.minutes),
        )
    return response


@router.post(
    "/tickets", response_model=TicketResponse, status_code=status.HTTP_201_CREATED
)
async def create_ticket(payload: TicketCreate, db: DbSession) -> TicketResponse:
    try:
        ticket = await queue_service.create_ticket(
            db,
            business_id=payload.business_id,
            branch_id=payload.branch_id,
            service_id=payload.service_id,
            customer_id=payload.customer_id,
            customer_name=payload.customer_name,
            customer_email=payload.customer_email,
            booked_for=payload.booked_for,
            notes=payload.notes,
            is_priority=payload.is_priority,
        )
    except NotFound as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error
    except QueueError as error:
        raise HTTPException(status.HTTP_409_CONFLICT, str(error)) from error

    await db.commit()
    await db.refresh(ticket)
    estimate = await queue_service.estimate_wait_for_ticket(
        db, business_id=payload.business_id, ticket_number=ticket.ticket_number
    )
    return _to_response(ticket, estimate)


@router.get("/tickets", response_model=TicketListResponse)
async def list_tickets(
    db: DbSession,
    business_id: str = Query(min_length=1),
    branch_id: str | None = None,
    service_id: str | None = None,
    ticket_status: str | None = Query(default=None, alias="status"),
    active_only: bool = False,
    limit: PageLimit = 50,
    offset: PageOffset = 0,
) -> TicketListResponse:
    tickets, total = await queue_service.list_tickets(
        db,
        business_id=business_id,
        branch_id=branch_id,
        service_id=service_id,
        status=ticket_status,
        active_only=active_only,
        limit=limit,
        offset=offset,
    )
    return TicketListResponse(
        items=[_to_response(ticket) for ticket in tickets],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/tickets/{ticket_number}", response_model=TicketResponse)
async def get_ticket(
    ticket_number: str, db: DbSession, business_id: str = Query(min_length=1)
) -> TicketResponse:
    try:
        ticket = await queue_service.get_ticket(
            db, business_id=business_id, ticket_number=ticket_number
        )
        estimate = await queue_service.estimate_wait_for_ticket(
            db, business_id=business_id, ticket_number=ticket_number
        )
    except NotFound as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error

    return _to_response(ticket, estimate)


@router.patch("/tickets/{ticket_number}/status", response_model=TicketResponse)
async def update_ticket_status(
    ticket_number: str,
    payload: TicketStatusUpdate,
    db: DbSession,
    business_id: str = Query(min_length=1),
) -> TicketResponse:
    try:
        ticket = await queue_service.transition_ticket(
            db,
            business_id=business_id,
            ticket_number=ticket_number,
            target_status=payload.status,
        )
    except NotFound as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error
    except InvalidTransition as error:
        raise HTTPException(status.HTTP_409_CONFLICT, str(error)) from error

    await db.commit()
    await db.refresh(ticket)
    return _to_response(ticket)


@router.get("/tickets/{ticket_number}/wait", response_model=WaitEstimateResponse)
async def get_ticket_wait(
    ticket_number: str, db: DbSession, business_id: str = Query(min_length=1)
) -> WaitEstimateResponse:
    try:
        estimate = await queue_service.estimate_wait_for_ticket(
            db, business_id=business_id, ticket_number=ticket_number
        )
    except NotFound as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error

    return WaitEstimateResponse(
        minutes=estimate.minutes,
        tickets_ahead=estimate.tickets_ahead,
        service_duration_mins=estimate.service_duration_mins,
        display=format_countdown(estimate.minutes),
    )


@router.get("/services", response_model=ServiceListResponse)
async def list_services(
    db: DbSession,
    business_id: str = Query(min_length=1),
    active_only: bool = True,
) -> ServiceListResponse:
    services = await queue_service.list_services(
        db, business_id=business_id, active_only=active_only
    )
    return ServiceListResponse(
        items=[ServiceResponse.model_validate(service) for service in services],
        total=len(services),
    )


@router.post(
    "/services", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED
)
async def create_service(payload: ServiceCreate, db: DbSession) -> ServiceResponse:
    service = Service(
        business_id=payload.business_id,
        name=payload.name,
        description=payload.description,
        duration_mins=payload.duration_mins,
        requires_documents=payload.requires_documents,
        requires_payment=payload.requires_payment,
        price_kobo=payload.price_kobo,
    )
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return ServiceResponse.model_validate(service)
