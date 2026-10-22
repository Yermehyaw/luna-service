from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.queue import Ticket
    from app.models.tenant import Business


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"

    @classmethod
    def values(cls) -> list[str]:
        return [m.value for m in cls]


class Payment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "payments"

    business_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ticket_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Integer minor units, never float. Naira kobo, matching ALATPay.
    amount_kobo: Mapped[int] = mapped_column(nullable=False)
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="NGN", server_default="NGN"
    )

    provider: Mapped[str] = mapped_column(
        String(32), nullable=False, default="alatpay", server_default="alatpay"
    )
    # Unique so a retried webhook cannot double-apply.
    provider_reference: Mapped[str | None] = mapped_column(
        String(128), unique=True, index=True
    )

    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=PaymentStatus.PENDING.value, index=True
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    business: Mapped[Business] = relationship(back_populates="payments")
    ticket: Mapped[Ticket] = relationship(back_populates="payments")
