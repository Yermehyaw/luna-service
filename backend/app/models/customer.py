from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.queue import Ticket
    from app.models.tenant import Business


class Customer(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "customers"

    # Signup happens on the business' subdomain, so the tenant is known at
    # registration and a customer belongs to exactly one business.
    business_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(32))
    clerk_user_id: Mapped[str | None] = mapped_column(String(128), unique=True)
    is_verified: Mapped[bool] = mapped_column(
        nullable=False, default=False, server_default="false"
    )

    business: Mapped[Business] = relationship(back_populates="customers")
    tickets: Mapped[list[Ticket]] = relationship(
        back_populates="customer", cascade="all, delete-orphan", passive_deletes=True
    )
