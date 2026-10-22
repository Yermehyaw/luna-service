from __future__ import annotations

import enum

from sqlalchemy import ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class FeedbackOutcome(str, enum.Enum):
    ACCEPTED = "accepted"
    EDITED = "edited"
    UNUSED = "unused"

    @classmethod
    def values(cls) -> list[str]:
        return [m.value for m in cls]


class DatasetKind(str, enum.Enum):
    REPLY_PAIRS = "reply_pairs"
    INTENT_DISTILL = "intent_distill"

    @classmethod
    def values(cls) -> list[str]:
        return [m.value for m in cls]


class AIFeedback(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """One AI suggestion and what actually happened to it.

    Captured by the backend when a reply is sent, never by a staff action: the
    suggested text and the final sent text are compared to derive the outcome.
    That is the only human signal the system needs, and it costs staff nothing.
    """

    __tablename__ = "ai_feedback"

    business_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source: Mapped[str] = mapped_column(
        String(32), nullable=False, default="social_query", server_default="social_query"
    )
    message_text: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_reply: Mapped[str | None] = mapped_column(Text)
    final_reply: Mapped[str | None] = mapped_column(Text)
    outcome: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    intent: Mapped[str | None] = mapped_column(String(64), index=True)
    intent_confidence: Mapped[float | None] = mapped_column()
    sentiment: Mapped[str | None] = mapped_column(String(16))
    sentiment_score: Mapped[float | None] = mapped_column()

    __table_args__ = (
        Index("ix_ai_feedback_business_created", "business_id", "created_at"),
    )


class AITrainingDataset(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Registry row for one exported, versioned training dataset.

    The JSONL itself lives on disk/blob storage (never the model host), so the
    export can be moved to a self-hosted setup without a database migration.
    """

    __tablename__ = "ai_training_datasets"

    kind: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    version: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    sample_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(512), nullable=False)
    business_id: Mapped[str | None] = mapped_column(String(36), index=True)
    notes: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (Index("uq_ai_training_datasets_version", "version", unique=True),)
