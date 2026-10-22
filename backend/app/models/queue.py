from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.models.payment import Payment
    from app.models.tenant import Branch, Business


class TicketStatus(str, enum.Enum):
    BOOKED = "booked"
    CALLED = "called"
    DONE = "done"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

    @classmethod
    def values(cls) -> list[str]:
        return [m.value for m in cls]


# Status is a plain string in the DB (MVP call for flexibility), so this map is
# the only thing validating transitions. Every write path goes through it.
ALLOWED_TRANSITIONS: dict[str, frozenset[str]] = {
    TicketStatus.BOOKED.value: frozenset(
        {TicketStatus.CALLED.value, TicketStatus.CANCELLED.value, TicketStatus.NO_SHOW.value}
    ),
    TicketStatus.CALLED.value: frozenset(
        {TicketStatus.DONE.value, TicketStatus.NO_SHOW.value}
    ),
    TicketStatus.DONE.value: frozenset(),
    TicketStatus.CANCELLED.value: frozenset(),
    TicketStatus.NO_SHOW.value: frozenset(),
}

TERMINAL_STATUSES = frozenset(
    {TicketStatus.DONE.value, TicketStatus.CANCELLED.value, TicketStatus.NO_SHOW.value}
)

ACTIVE_STATUSES = (TicketStatus.BOOKED.value, TicketStatus.CALLED.value)


class Service(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "services"

    business_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1024))
    duration_mins: Mapped[int] = mapped_column(Integer, nullable=False, default=15)
    is_active: Mapped[bool] = mapped_column(
        nullable=False, default=True, server_default="true"
    )
    requires_documents: Mapped[bool] = mapped_column(
        nullable=False, default=False, server_default="false"
    )
    requires_payment: Mapped[bool] = mapped_column(
        nullable=False, default=False, server_default="false"
    )
    price_kobo: Mapped[int | None] = mapped_column(Integer)

    business: Mapped[Business] = relationship(back_populates="services")
    tickets: Mapped[list[Ticket]] = relationship(
        back_populates="service", cascade="all, delete-orphan", passive_deletes=True
    )


class Ticket(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "tickets"

    business_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    branch_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("branches.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    service_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    customer_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Opaque and non-sequential on purpose. A counter would let a customer infer
    # their queue position or the business' traffic volume.
    ticket_number: Mapped[str] = mapped_column(
        String(16), unique=True, nullable=False, index=True
    )

    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=TicketStatus.BOOKED.value, index=True
    )
    booked_for: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    called_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Snapshot of the name at booking time, so a rendered ticket stays correct
    # if the customer profile is edited later.
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_email: Mapped[str | None] = mapped_column(String(320))
    notes: Mapped[str | None] = mapped_column(String(2048))
    is_priority: Mapped[bool] = mapped_column(
        nullable=False, default=False, server_default="false"
    )

    business: Mapped[Business] = relationship(back_populates="tickets")
    branch: Mapped[Branch] = relationship(back_populates="tickets")
    service: Mapped[Service] = relationship(back_populates="tickets")
    customer: Mapped[Customer] = relationship(back_populates="tickets")
    payments: Mapped[list[Payment]] = relationship(
        back_populates="ticket", cascade="all, delete-orphan", passive_deletes=True
    )

    __table_args__ = (
        Index("ix_tickets_branch_status_booked_for", "branch_id", "status", "booked_for"),
    )
