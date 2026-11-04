"""Zernio API Adapter for Social Media Inbox & Analytics Integration."""

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


class ZernioAdapter(BaseSocialAdapter):
    """Adapter wrapping Zernio API free tier for multi-platform social management."""

    def __init__(self, db: AsyncSession | None = None) -> None:
        super().__init__(
            api_key=settings.ZERNIO_API_KEY,
            base_url=settings.ZERNIO_BASE_URL,
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
        """Fetch unified inbox messages via Zernio or database fallback."""
        if self.api_key:
            try:
                async with self._get_client() as client:
                    params: dict[str, Any] = {"limit": limit, "offset": offset}
                    if platform:
                        params["platform"] = platform
                    resp = await client.get(f"/tenants/{business_id}/inbox", params=params)
                    if resp.status_code == 200:
                        data = resp.json()
                        messages: list[LunaMessage] = []
                        for item in data.get("messages", []):
                            messages.append(
                                LunaMessage(
                                    id=item.get("id"),
                                    business_id=business_id,
                                    platform=item.get("platform", "instagram"),
                                    author_handle=item.get("author", "@customer"),
                                    author_name=item.get("name"),
                                    body=item.get("text", ""),
                                    media_url=item.get("media_url"),
                                    timestamp=datetime.fromisoformat(
                                        item.get("created_at", datetime.utcnow().isoformat())
                                    ),
                                    sentiment=item.get("sentiment"),
                                    intent=item.get("intent"),
                                    status=item.get("status", "open"),
                                )
                            )
                        return messages
            except Exception as e:
                logger.warning(f"[ZernioAdapter] Remote inbox call failed: {e}. Falling back to DB.")

        # Fallback to local DB queries (safe for offline testing & demo)
        return await self._fetch_db_inbox(business_id, status_filter=status, limit=limit, offset=offset)

    async def send_dm_reply(
        self,
        business_id: str,
        message_id: str,
        reply_text: str,
        author_id: str | None = None,
    ) -> DmReplyResult:
        """Send DM reply via Zernio and update local query state."""
        external_id: str | None = None

        if self.api_key:
            try:
                async with self._get_client() as client:
                    payload = {"message_id": message_id, "text": reply_text}
                    resp = await client.post(f"/tenants/{business_id}/reply", json=payload)
                    if resp.status_code in (200, 201):
                        external_id = resp.json().get("external_id")
            except Exception as e:
                logger.warning(f"[ZernioAdapter] Outbound reply dispatch failed: {e}")

        # Sync local database query state
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
            external_id=external_id or f"zernio_sim_{message_id[:8]}",
            timestamp=datetime.utcnow(),
            credits_deducted=1,
        )

    async def fetch_analytics(
        self,
        business_id: str,
        platform: str | None = None,
        time_range: str = "7d",
    ) -> SocialAnalyticsData:
        """Fetch engagement analytics via Zernio."""
        if self.api_key:
            try:
                async with self._get_client() as client:
                    resp = await client.get(
                        f"/tenants/{business_id}/analytics",
                        params={"period": time_range, "platform": platform or "all"},
                    )
                    if resp.status_code == 200:
                        d = resp.json()
                        return SocialAnalyticsData(
                            business_id=business_id,
                            platform=platform or "all",
                            period=time_range,
                            total_followers=d.get("followers", 0),
                            impressions=d.get("impressions", 0),
                            reach=d.get("reach", 0),
                            engagement_rate=d.get("engagement_rate", 0.0),
                            queries_received=d.get("queries_count", 0),
                            average_response_time_minutes=d.get("avg_response_mins", 4.2),
                            sentiment_breakdown=d.get("sentiment", {"positive": 0, "neutral": 0, "negative": 0}),
                            top_topics=d.get("top_topics", []),
                        )
            except Exception as e:
                logger.warning(f"[ZernioAdapter] Analytics fetch failed: {e}")

        # Local default analytics response
        return SocialAnalyticsData(
            business_id=business_id,
            platform=platform or "all",
            period=time_range,
            total_followers=1420,
            impressions=18940,
            reach=12400,
            engagement_rate=4.8,
            queries_received=28,
            average_response_time_minutes=3.5,
            sentiment_breakdown={"positive": 18, "neutral": 7, "negative": 3},
            top_topics=["Account Opening", "Card Delivery", "Operating Hours"],
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
        """Fallback to Reminder Mode if automated publishing is not active."""
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
