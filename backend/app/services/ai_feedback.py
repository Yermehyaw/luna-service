from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_feedback import AIFeedback, FeedbackOutcome
from app.services.pii import scrub_pii


def derive_outcome(suggested_reply: str | None, final_reply: str | None) -> str:
    """Infer what happened from the texts alone: no buttons, no extra staff work."""
    suggested = (suggested_reply or "").strip()
    final = (final_reply or "").strip()

    if not final:
        return FeedbackOutcome.UNUSED.value
    if final == suggested:
        return FeedbackOutcome.ACCEPTED.value
    return FeedbackOutcome.EDITED.value


async def record_feedback(
    db: AsyncSession,
    *,
    business_id: str,
    message: str,
    suggested_reply: str | None = None,
    final_reply: str | None = None,
    source: str = "social_query",
    intent: str | None = None,
    intent_confidence: float | None = None,
    sentiment: str | None = None,
    sentiment_score: float | None = None,
) -> AIFeedback:
    feedback = AIFeedback(
        business_id=business_id,
        source=source,
        message_text=scrub_pii(message) or "",
        suggested_reply=scrub_pii(suggested_reply),
        final_reply=scrub_pii(final_reply),
        outcome=derive_outcome(suggested_reply, final_reply),
        intent=intent,
        intent_confidence=intent_confidence,
        sentiment=sentiment,
        sentiment_score=sentiment_score,
    )
    db.add(feedback)
    await db.flush()
    return feedback


async def list_feedback(
    db: AsyncSession,
    *,
    business_id: str,
    limit: int = 50,
    offset: int = 0,
) -> list[AIFeedback]:
    result = await db.execute(
        select(AIFeedback)
        .where(AIFeedback.business_id == business_id)
        .order_by(AIFeedback.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


async def purge_expired_feedback(db: AsyncSession, retention_days: int) -> int:
    """Delete feedback older than the retention window, per data-handling policy."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)
    result = await db.execute(delete(AIFeedback).where(AIFeedback.created_at < cutoff))
    return result.rowcount or 0
