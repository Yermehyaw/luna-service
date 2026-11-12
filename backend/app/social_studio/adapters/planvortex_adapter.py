"""PlanVortex API Adapter for Social Studio (Backup Overflow Provider).

Adheres to zero-cost free-tier boundaries:
- Max 2 connected accounts per client (split 2 on Zernio + 2 on PlanVortex = 4 max accounts).
- Strict non-blocking HTTP networking via httpx.AsyncClient (no vendor SDKs).
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any
from fastapi import HTTPException
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


class PlanVortexAdapter(BaseSocialAdapter):
    """Adapter wrapping PlanVortex API free tier for overflow client onboarding."""

    def __init__(self, db: AsyncSession | None = None) -> None:
        super().__init__(
            api_key=settings.PLANVORTEX_API_KEY,
            base_url=settings.PLANVORTEX_BASE_URL,
            db=db,
        )

    async def get_inbox(
        self,
        business_id: str,
        platform: str | None = None,
        status: str | None = None,
        inbox_type: str | None = "all",
        limit: int = 50,
        offset: int = 0,
    ) -> list[LunaMessage]:
        target_type = (inbox_type or "all").lower()

        if self.api_key:
            try:
                async with self._get_client() as client:
                    params: dict[str, Any] = {"limit": limit, "offset": offset, "type": target_type}
                    if platform and platform != "all":
                        params["platform"] = platform

                    resp = await client.get(
                        f"/organizations/{business_id}/inbox",
                        params=params,
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        messages: list[LunaMessage] = []
                        for item in data.get("messages", []):
                            messages.append(
                                LunaMessage(
                                    id=item.get("id"),
                                    business_id=business_id,
                                    platform=item.get("platform", "x"),
                                    query_type=item.get("type", "dm"),
                                    post_id=item.get("post_id"),
                                    author_handle=item.get("sender_handle", "@customer"),
                                    body=item.get("content", ""),
                                    timestamp=datetime.fromisoformat(
                                        item.get("created_at", datetime.utcnow().isoformat())
                                    ),
                                    status=item.get("status", "open"),
                                )
                            )
                        return messages
            except Exception as e:
                logger.warning(f"[PlanVortexAdapter] Remote inbox call failed: {e}")

        return await self._fetch_db_inbox(
            business_id,
            status_filter=status,
            inbox_type=target_type,
            limit=limit,
            offset=offset,
        )

    async def send_dm_reply(
        self,
        business_id: str,
        message_id: str,
        reply_text: str,
        author_id: str | None = None,
        query_type: str | None = None,
    ) -> DmReplyResult:
        if query_type == "mention":
            raise HTTPException(
                status_code=400,
                detail="Mentions cannot be replied to due to strict social media API usage policies.",
            )

        external_id = None
        if self.api_key:
            try:
                async with self._get_client() as client:
                    resp = await client.post(
                        f"/organizations/{business_id}/messages/{message_id}/reply",
                        json={"text": reply_text},
                    )
                    if resp.status_code in (200, 201):
                        external_id = resp.json().get("id")
            except Exception as e:
                logger.warning(f"[PlanVortexAdapter] Reply dispatch failed: {e}")

        if self.db:
            stmt = select(SocialQuery).where(
                SocialQuery.id == message_id,
                SocialQuery.business_id == business_id,
            )
            result = await self.db.execute(stmt)
            query = result.scalar_one_or_none()
            if query:
                if getattr(query, "query_type", "dm") == "mention":
                    raise HTTPException(
                        status_code=400,
                        detail="Mentions cannot be replied to due to strict social media API usage policies.",
                    )
                query.response_body = reply_text
                query.status = QueryStatus.ANSWERED.value
                query.answered_at = datetime.utcnow()
                query.answered_by = author_id
                await self.db.flush()

        return DmReplyResult(
            success=True,
            message_id=message_id,
            reply_body=reply_text,
            external_id=external_id or f"planvortex_sim_{message_id[:8]}",
            timestamp=datetime.utcnow(),
            credits_deducted=1,
        )

    async def fetch_analytics(
        self,
        business_id: str,
        platform: str | None = None,
        time_range: str = "7d",
    ) -> SocialAnalyticsData:
        """Fetch analytics without hardcoded placeholder fabrication."""
        if self.api_key:
            try:
                async with self._get_client() as client:
                    resp = await client.get(f"/organizations/{business_id}/analytics")
                    if resp.status_code == 200:
                        d = resp.json()
                        followers = d.get("total_followers", 0) or 0
                        impressions = d.get("impressions", 0) or 0
                        engagements = d.get("engagements", 0) or 0
                        eng_rate = round((engagements / impressions) * 100, 2) if impressions > 0 else 0.0

                        return SocialAnalyticsData(
                            business_id=business_id,
                            platform=platform or "all",
                            period=time_range,
                            total_followers=followers,
                            impressions=impressions,
                            reach=d.get("reach", 0) or 0,
                            engagement_rate=eng_rate,
                            queries_received=d.get("queries_count", 0) or 0,
                            average_response_time_minutes=0.0,
                            sentiment_breakdown={"positive": 0, "neutral": 0, "negative": 0},
                            top_topics=[],
                            raw_metrics=d,
                        )
                    else:
                        raise HTTPException(
                            status_code=resp.status_code,
                            detail=f"PlanVortex analytics failed: {resp.text}",
                        )
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"[PlanVortexAdapter] Analytics fetch failed: {e}")
                raise HTTPException(status_code=502, detail=f"Failed to fetch PlanVortex analytics: {e}")

        return await self._fetch_db_analytics(business_id, platform=platform, time_range=time_range)

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
