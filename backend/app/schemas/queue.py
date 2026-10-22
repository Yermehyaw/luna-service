from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.queue import TicketStatus

PageLimit = Annotated[int, Field(ge=1, le=200)]
PageOffset = Annotated[int, Field(ge=0)]

TicketStatusLiteral = Literal["booked", "called", "done", "cancelled", "no_show"]


class TicketCreate(BaseModel):
    # business_id comes from the body for now because auth isn't wired. Once
    # tenant resolution lands in Phase 3 this field goes away.
    model_config = ConfigDict(str_strip_whitespace=True)

    business_id: str
    branch_id: str
    service_id: str
    customer_id: str
    customer_name: str = Field(min_length=1, max_length=255)
    customer_email: str | None = Field(default=None, max_length=320)
    booked_for: datetime | None = None
    notes: str | None = Field(default=None, max_length=2048)
    is_priority: bool = False

    @field_validator("customer_name")
    @classmethod
    def _name_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("customer_name cannot be blank")
        return value.strip()


class WaitEstimateResponse(BaseModel):
    minutes: int | None
    tickets_ahead: int
    service_duration_mins: int
    display: str


class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    ticket_number: str
    business_id: str
    branch_id: str
    service_id: str
    customer_id: str
    customer_name: str
    customer_email: str | None
    status: str
    is_priority: bool
    booked_for: datetime | None
    called_at: datetime | None
    completed_at: datetime | None
    cancelled_at: datetime | None
    created_at: datetime
    updated_at: datetime
    wait: WaitEstimateResponse | None = None


class TicketListResponse(BaseModel):
    items: list[TicketResponse]
    total: int
    limit: int
    offset: int


class TicketStatusUpdate(BaseModel):
    status: TicketStatusLiteral

    @field_validator("status")
    @classmethod
    def _known_status(cls, value: str) -> str:
        if value not in TicketStatus.values():
            raise ValueError(f"'{value}' is not a valid ticket status")
        return value


class ServiceCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    business_id: str
    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=1024)
    duration_mins: int = Field(default=15, ge=1, le=600)
    requires_documents: bool = False
    requires_payment: bool = False
    price_kobo: int | None = Field(default=None, ge=0)


class ServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    business_id: str
    name: str
    description: str | None
    duration_mins: int
    is_active: bool
    requires_documents: bool
    requires_payment: bool
    price_kobo: int | None


class ServiceListResponse(BaseModel):
    items: list[ServiceResponse]
    total: int
