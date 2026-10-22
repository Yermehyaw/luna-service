from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.tenant import Business


class SocialPlatform(str, enum.Enum):
    X = "x"
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"
    LINKEDIN = "linkedin"
    TIKTOK = "tiktok"
    WHATSAPP = "whatsapp"

    @classmethod
    def values(cls) -> list[str]:
        return [m.value for m in cls]


class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHING = "publishing"
    PUBLISHED = "published"
    FAILED = "failed"

    @classmethod
    def values(cls) -> list[str]:
        return [m.value for m in cls]


class QueryStatus(str, enum.Enum):
    OPEN = "open"
    ANSWERED = "answered"
    ESCALATED = "escalated"
    CLOSED = "closed"

    @classmethod
    def values(cls) -> list[str]:
        return [m.value for m in cls]


class Sentiment(str, enum.Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"

    @classmethod
    def values(cls) -> list[str]:
        return [m.value for m in cls]


class Intent(str, enum.Enum):
    COMPLAINT = "complaint"
    REFUND_REQUEST = "refund_request"
    BOOKING_REQUEST = "booking_request"
    HOURS_INQUIRY = "hours_inquiry"
    PRODUCT_QUESTION = "product_question"
    PRAISE = "praise"
    OTHER = "other"

    @classmethod
    def values(cls) -> list[str]:
        return [m.value for m in cls]


class SocialAccount(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """One handle on one platform. A business owns many of these."""

    __tablename__ = "social_accounts"

    business_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    platform: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    handle: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(255))
    is_connected: Mapped[bool] = mapped_column(
        nullable=False, default=False, server_default="false"
    )
    follower_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    business: Mapped[Business] = relationship(back_populates="social_accounts")
    post_targets: Mapped[list[SocialPostTarget]] = relationship(
        back_populates="account", cascade="all, delete-orphan", passive_deletes=True
    )
    queries: Mapped[list[SocialQuery]] = relationship(
        back_populates="account", cascade="all, delete-orphan", passive_deletes=True
    )

    __table_args__ = (
        Index("uq_social_accounts_platform_handle", "platform", "handle", unique=True),
    )


class SocialPost(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Content composed once, published to many handles.

    The post is the unit of authorship, SocialPostTarget is the unit of
    publication. That split is what makes cross-handle posting work without
    duplicating the body text.
    """

    __tablename__ = "social_posts"

    business_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id: Mapped[str | None] = mapped_column(String(36), index=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=PostStatus.DRAFT.value, index=True
    )
    scheduled_for: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    generated_from_idea: Mapped[bool] = mapped_column(
        nullable=False, default=False, server_default="false"
    )

    targets: Mapped[list[SocialPostTarget]] = relationship(
        back_populates="post", cascade="all, delete-orphan", passive_deletes=True
    )

    __table_args__ = (Index("ix_social_posts_business_status", "business_id", "status"),)


class SocialPostTarget(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """One post's publication to one handle."""

    __tablename__ = "social_post_targets"

    post_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("social_posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    account_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("social_accounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=PostStatus.DRAFT.value
    )
    external_post_id: Mapped[str | None] = mapped_column(String(255))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    error_message: Mapped[str | None] = mapped_column(Text)

    post: Mapped[SocialPost] = relationship(back_populates="targets")
    account: Mapped[SocialAccount] = relationship(back_populates="post_targets")


class SocialQuery(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """An inbound customer question or comment needing a human response.

    Sentiment and intent are computed on ingest so staff can triage: a refund
    request shouldn't sit unread behind a compliment.
    """

    __tablename__ = "social_queries"

    business_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    account_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("social_accounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_handle: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=QueryStatus.OPEN.value, index=True
    )
    sentiment: Mapped[str | None] = mapped_column(String(16), index=True)
    sentiment_score: Mapped[float | None] = mapped_column()
    intent: Mapped[str | None] = mapped_column(String(32), index=True)
    # Offered to staff, never auto-sent.
    suggested_reply: Mapped[str | None] = mapped_column(Text)
    answered_by: Mapped[str | None] = mapped_column(String(36), index=True)
    answered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    response_body: Mapped[str | None] = mapped_column(Text)
    used_suggestion: Mapped[bool] = mapped_column(
        nullable=False, default=False, server_default="false"
    )

    account: Mapped[SocialAccount] = relationship(back_populates="queries")

    __table_args__ = (
        Index(
            "ix_social_queries_business_status_sentiment",
            "business_id",
            "status",
            "sentiment",
        ),
    )


class ContentCredit(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Daily idea-generation credits. Basic tier gets a free daily allowance."""

    __tablename__ = "content_credits"

    business_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    credit_date: Mapped[str] = mapped_column(String(10), nullable=False)
    granted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    consumed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    purchased: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )

    __table_args__ = (
        Index("uq_content_credits_business_date", "business_id", "credit_date", unique=True),
    )

    @property
    def remaining(self) -> int:
        return self.granted + self.purchased - self.consumed
