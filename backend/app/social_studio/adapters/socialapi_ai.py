"""SocialAPI.ai Adapter for Social Studio."""

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


class SocialApiAdapter(BaseSocialAdapter):
    """Adapter wrapping SocialAPI.ai free tier for reading messages and replying."""

    def __init__(self, db: AsyncSession | None = None) -> None:
        super().__init__(
            api_key=settings.SOCIALAPI_AI_KEY,
            base_url=settings.SOCIALAPI_BASE_URL,
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
                    resp = await client.get(
                        f"/accounts/{business_id}/conversations",
                        params={"limit": limit, "page": offset // limit + 1},
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        messages: list[LunaMessage] = []
                        for c in data.get("items", []):
                            messages.append(
                                LunaMessage(
                                    id=c.get("conversation_id"),
                                    business_id=business_id,
                                    platform=c.get("network", "facebook"),
                                    author_handle=c.get("sender_handle", "@user"),
                                    body=c.get("last_message", ""),
                                    timestamp=datetime.fromisoformat(
                                        c.get("updated_at", datetime.utcnow().isoformat())
                                    ),
                                    status="open" if not c.get("is_resolved") else "closed",
                                )
                            )
                        return messages
            except Exception as e:
                logger.warning(f"[SocialApiAdapter] Remote inbox call failed: {e}")

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
                        f"/accounts/{business_id}/messages",
                        json={"conversation_id": message_id, "text": reply_text},
                    )
                    if resp.status_code in (200, 201):
                        external_id = resp.json().get("id")
            except Exception as e:
                logger.warning(f"[SocialApiAdapter] Reply dispatch failed: {e}")

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
            external_id=external_id or f"socialapi_sim_{message_id[:8]}",
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
            total_followers=2180,
            impressions=24500,
            reach=16800,
            engagement_rate=5.2,
            queries_received=34,
            average_response_time_minutes=2.9,
            sentiment_breakdown={"positive": 24, "neutral": 8, "negative": 2},
            top_topics=["Branch Location", "Mobile App Transfer", "Pricing"],
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
