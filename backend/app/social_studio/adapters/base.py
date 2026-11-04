"""Base Social Media Adapter with Async HTTP and Database Sync Helpers."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any
import httpx
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.social import PostStatus, QueryStatus, SocialPost, SocialQuery
from app.social_studio.interfaces import (
    DmReplyResult,
    ISocialProvider,
    LunaMessage,
    ScheduleResult,
    SocialAnalyticsData,
)

logger = logging.getLogger(__name__)


class BaseSocialAdapter(ISocialProvider):
    """Base class for all vendor adapters, providing non-blocking httpx async I/O."""

    def __init__(
        self,
        api_key: str,
        base_url: str,
        timeout: float = 15.0,
        db: AsyncSession | None = None,
    ) -> None:
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.db = db

    def _get_client(self) -> httpx.AsyncClient:
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Luna-Social-Studio/1.0",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return httpx.AsyncClient(
            base_url=self.base_url,
            headers=headers,
            timeout=self.timeout,
        )

    def _query_to_luna_message(self, q: SocialQuery) -> LunaMessage:
        """Helper to convert a database SocialQuery model to a LunaMessage contract."""
        platform = "instagram"
        if q.account and hasattr(q.account, "platform") and q.account.platform:
            platform = q.account.platform

        return LunaMessage(
            id=str(q.id),
            business_id=q.business_id,
            account_id=q.account_id,
            platform=platform,
            author_handle=q.author_handle,
            body=q.body,
            media_url=getattr(q, "media_url", None),
            timestamp=q.created_at or datetime.utcnow(),
            sentiment=q.sentiment,
            sentiment_score=q.sentiment_score,
            intent=q.intent,
            suggested_reply=q.suggested_reply,
            status=q.status,
            raw_payload={
                "response_body": q.response_body,
                "answered_at": q.answered_at.isoformat() if q.answered_at else None,
            },
        )

    async def _fetch_db_inbox(
        self,
        business_id: str,
        status_filter: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[LunaMessage]:
        """Reads persisted queries from PostgreSQL if vendor API is in test or fallback mode."""
        if not self.db:
            return []

        stmt = select(SocialQuery).where(SocialQuery.business_id == business_id)
        if status_filter:
            stmt = stmt.where(SocialQuery.status == status_filter)
        stmt = stmt.order_by(desc(SocialQuery.created_at)).offset(offset).limit(limit)

        result = await self.db.execute(stmt)
        queries = result.scalars().all()
        return [self._query_to_luna_message(q) for q in queries]
