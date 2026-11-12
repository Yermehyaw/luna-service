from __future__ import annotations

import enum
from datetime import datetime
from typing import Any, TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String
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


class TransactionStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    DISCOUNTED = "DISCOUNTED"

    @classmethod
    def values(cls) -> list[str]:
        return [m.value for m in cls]


class GatewayProvider(str, enum.Enum):
    PAYPAL = "PAYPAL"
    PAYSTACK = "PAYSTACK"
    MONNIFY = "MONNIFY"
    DUPLO = "DUPLO"
    MANUAL = "MANUAL"


class Transaction(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Core transaction ledger avoiding provider lock-in.
    
    Tracks B2B SaaS subscriptions & SC top-ups (PayPal)
    and B2B2C customer booking split payments (Paystack).
    """
    __tablename__ = "transactions"

    tenant_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="NGN", server_default="NGN"
    )
    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=TransactionStatus.PENDING.value,
        server_default=TransactionStatus.PENDING.value,
        index=True,
    )
    gateway_provider: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=GatewayProvider.PAYPAL.value,
        server_default=GatewayProvider.PAYPAL.value,
    )
    gateway_reference: Mapped[str | None] = mapped_column(
        String(128), unique=True, index=True
    )
    transaction_type: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="subscription",
        server_default="subscription",
    )  # subscription | credits_topup | booking_split | trial_tokenization
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, default=dict
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    business: Mapped[Business] = relationship(back_populates="transactions")


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
