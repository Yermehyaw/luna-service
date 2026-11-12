from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.models.payment import Payment, Transaction
    from app.models.queue import Service, Ticket
    from app.models.social import SocialAccount

BUSINESS_TYPES = ("bank", "school", "civic", "healthcare", "salon", "other")


class Business(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "businesses"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    short: Mapped[str | None] = mapped_column(String(64))
    type: Mapped[str | None] = mapped_column(String(32))
    subdomain: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    ticket_prefix: Mapped[str] = mapped_column(
        String(8), nullable=False, default="LM", server_default="LM"
    )
    active_social_provider: Mapped[str] = mapped_column(
        String(32), nullable=False, default="socialapi", server_default="socialapi"
    )
    social_credits: Mapped[int] = mapped_column(
        Integer, nullable=False, default=50, server_default="50"
    )
    tier: Mapped[str] = mapped_column(
        String(32), nullable=False, default="free", server_default="free"
    )
    posts_used_this_month: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    interactions_used_this_month: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    paystack_subaccount_code: Mapped[str | None] = mapped_column(
        String(64), nullable=True
    )
    payout_bank_name: Mapped[str | None] = mapped_column(
        String(128), nullable=True
    )
    payout_account_number: Mapped[str | None] = mapped_column(
        String(32), nullable=True
    )
    payout_account_holder: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )

    branches: Mapped[list[Branch]] = relationship(
        back_populates="business", cascade="all, delete-orphan", passive_deletes=True
    )
    services: Mapped[list[Service]] = relationship(
        back_populates="business", cascade="all, delete-orphan", passive_deletes=True
    )
    tickets: Mapped[list[Ticket]] = relationship(
        back_populates="business", cascade="all, delete-orphan", passive_deletes=True
    )
    customers: Mapped[list[Customer]] = relationship(
        back_populates="business", cascade="all, delete-orphan", passive_deletes=True
    )
    payments: Mapped[list[Payment]] = relationship(
        back_populates="business", cascade="all, delete-orphan", passive_deletes=True
    )
    transactions: Mapped[list[Transaction]] = relationship(
        back_populates="business", cascade="all, delete-orphan", passive_deletes=True
    )
    social_accounts: Mapped[list[SocialAccount]] = relationship(
        back_populates="business", cascade="all, delete-orphan", passive_deletes=True
    )


class Branch(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "branches"

    business_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str | None] = mapped_column(String(32))
    address: Mapped[str | None] = mapped_column(String(512))
    is_active: Mapped[bool] = mapped_column(
        nullable=False, default=True, server_default="true"
    )

    business: Mapped[Business] = relationship(back_populates="branches")
    tickets: Mapped[list[Ticket]] = relationship(
        back_populates="branch", cascade="all, delete-orphan", passive_deletes=True
    )
