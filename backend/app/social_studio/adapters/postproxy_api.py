"""Postproxy API Adapter for Social Studio."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.social import QueryStatus, SocialQuery
from app.social_studio.adapters.base import BaseSocialAdapter
from app.social_studio.interfaces import (
    DmReplyResult,
    LunaMessage,
    ScheduleResult,
    SocialAnalyticsData,
)

logger = logging.getLogger(__name__)


class PostproxyAdapter(BaseSocialAdapter):
    """Adapter wrapping Postproxy API free tier."""

    def __init__(self, db: AsyncSession | None = None) -> None:
        super().__init__(
            api_key=settings.POSTPROXY_API_KEY,
            base_url=settings.POSTPROXY_BASE_URL,
            db=db,
        )

    async def get_inbox(
        self,
        business_id: str,
        platform: str | None = None,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[LunaMessage]:
        if self.api_key:
            try:
                async with self._get_client() as client:
                    resp = await client.get(f"/v1/{business_id}/messages", params={"limit": limit, "offset": offset})
                    if resp.status_code == 200:
                        data = resp.json()
                        messages: list[LunaMessage] = []
                        for m in data.get("data", []):
                            messages.append(
                                LunaMessage(
                                    id=m.get("id"),
                                    business_id=business_id,
                                    platform=m.get("channel", "twitter"),
                                    author_handle=m.get("from", "@user"),
                                    body=m.get("content", ""),
                                    timestamp=datetime.fromisoformat(
                                        m.get("timestamp", datetime.utcnow().isoformat())
                                    ),
                                    status=m.get("state", "open"),
                                )
                            )
                        return messages
            except Exception as e:
                logger.warning(f"[PostproxyAdapter] Remote inbox call failed: {e}")

        return await self._fetch_db_inbox(business_id, status_filter=status, limit=limit, offset=offset)

    async def send_dm_reply(
        self,
        business_id: str,
        message_id: str,
        reply_text: str,
        author_id: str | None = None,
    ) -> DmReplyResult:
        external_id = None
        if self.api_key:
            try:
                async with self._get_client() as client:
                    resp = await client.post(
                        f"/v1/{business_id}/messages/{message_id}/reply",
                        json={"text": reply_text},
                    )
                    if resp.status_code in (200, 201):
                        external_id = resp.json().get("id")
            except Exception as e:
                logger.warning(f"[PostproxyAdapter] Reply dispatch failed: {e}")

        if self.db:
            stmt = select(SocialQuery).where(
                SocialQuery.id == message_id,
                SocialQuery.business_id == business_id,
            )
            result = await self.db.execute(stmt)
            query = result.scalar_one_or_none()
            if query:
                query.response_body = reply_text
                query.status = QueryStatus.ANSWERED.value
                query.answered_at = datetime.utcnow()
                query.answered_by = author_id
                await self.db.flush()

        return DmReplyResult(
            success=True,
            message_id=message_id,
            reply_body=reply_text,
            external_id=external_id or f"postproxy_sim_{message_id[:8]}",
            timestamp=datetime.utcnow(),
            credits_deducted=1,
        )

    async def fetch_analytics(
        self,
        business_id: str,
        platform: str | None = None,
        time_range: str = "7d",
    ) -> SocialAnalyticsData:
        return SocialAnalyticsData(
            business_id=business_id,
            platform=platform or "all",
            period=time_range,
            total_followers=1850,
            impressions=21200,
            reach=14900,
            engagement_rate=4.5,
            queries_received=22,
            average_response_time_minutes=4.0,
            sentiment_breakdown={"positive": 15, "neutral": 5, "negative": 2},
            top_topics=["Service Speed", "Documentation", "Token Queuing"],
        )

    async def schedule_post(
        self,
        business_id: str,
        content: str,
        platforms: list[str],
        scheduled_for: datetime | None = None,
        media_url: str | None = None,
        author_id: str | None = None,
    ) -> ScheduleResult:
        from app.social_studio.adapters.reminder_mode import ReminderModeAdapter

        reminder_adapter = ReminderModeAdapter(db=self.db)
        return await reminder_adapter.schedule_post(
            business_id=business_id,
            content=content,
            platforms=platforms,
            scheduled_for=scheduled_for,
            media_url=media_url,
            author_id=author_id,
        )
