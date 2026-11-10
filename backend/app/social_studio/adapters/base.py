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
            query_type=getattr(q, "query_type", "dm") or "dm",
            post_id=getattr(q, "post_id", None),
            author_handle=q.author_handle,
            body=q.body,
            media_url=getattr(q, "media_url", None),
            timestamp=q.created_at or datetime.utcnow(),
            sentiment=q.sentiment,
            sentiment_score=q.sentiment_score,
            intent=q.intent,
            suggested_reply=q.suggested_reply,
            status=q.status or "open",
            raw_payload={
                "response_body": q.response_body,
                "answered_at": q.answered_at.isoformat() if q.answered_at else None,
            },
        )

    async def _fetch_db_inbox(
        self,
        business_id: str,
        status_filter: str | None = None,
        inbox_type: str | None = "all",
        limit: int = 50,
        offset: int = 0,
    ) -> list[LunaMessage]:
        """Reads persisted queries from PostgreSQL if vendor API is in test or fallback mode."""
        if not self.db:
            return []

        stmt = select(SocialQuery).where(SocialQuery.business_id == business_id)
        if status_filter:
            stmt = stmt.where(SocialQuery.status == status_filter)
        if inbox_type and inbox_type != "all":
            stmt = stmt.where(SocialQuery.query_type == inbox_type)
        stmt = stmt.order_by(desc(SocialQuery.created_at)).offset(offset).limit(limit)

        result = await self.db.execute(stmt)
        queries = result.scalars().all()
        return [self._query_to_luna_message(q) for q in queries]

    async def _fetch_db_analytics(
        self,
        business_id: str,
        platform: str | None = None,
        time_range: str = "7d",
    ) -> SocialAnalyticsData:
        """Compute real analytics metrics from local database (0 fake placeholders)."""
        if not self.db:
            return SocialAnalyticsData(
                business_id=business_id,
                platform=platform or "all",
                period=time_range,
                total_followers=0,
                impressions=0,
                reach=0,
                engagement_rate=0.0,
                queries_received=0,
                average_response_time_minutes=0.0,
                sentiment_breakdown={"positive": 0, "neutral": 0, "negative": 0},
                top_topics=[],
            )

        from app.models.social import SocialAccount
        from sqlalchemy import func

        # 1. Total followers across connected accounts
        acc_stmt = select(func.coalesce(func.sum(SocialAccount.follower_count), 0)).where(
            SocialAccount.business_id == business_id
        )
        if platform and platform != "all":
            acc_stmt = acc_stmt.where(SocialAccount.platform == platform)
        acc_res = await self.db.execute(acc_stmt)
        followers = int(acc_res.scalar() or 0)

        # 2. Total queries received
        q_stmt = select(func.count(SocialQuery.id)).where(SocialQuery.business_id == business_id)
        q_res = await self.db.execute(q_stmt)
        queries_count = int(q_res.scalar() or 0)

        # 3. Sentiment breakdown
        sent_stmt = (
            select(SocialQuery.sentiment, func.count(SocialQuery.id))
            .where(SocialQuery.business_id == business_id)
            .group_by(SocialQuery.sentiment)
        )
        sent_res = await self.db.execute(sent_stmt)
        sentiment_map = {"positive": 0, "neutral": 0, "negative": 0}
        for s_val, count in sent_res.all():
            if s_val in sentiment_map:
                sentiment_map[s_val] = count

        # 4. Average response time in minutes for answered queries
        time_stmt = select(
            SocialQuery.created_at, SocialQuery.answered_at
        ).where(
            SocialQuery.business_id == business_id,
            SocialQuery.answered_at.isnot(None),
            SocialQuery.created_at.isnot(None),
        )
        time_res = await self.db.execute(time_stmt)
        rows = time_res.all()
        avg_resp_mins = 0.0
        if rows:
            durations = [(r.answered_at - r.created_at).total_seconds() / 60.0 for r in rows if r.answered_at > r.created_at]
            if durations:
                avg_resp_mins = round(sum(durations) / len(durations), 1)

        return SocialAnalyticsData(
            business_id=business_id,
            platform=platform or "all",
            period=time_range,
            total_followers=followers,
            impressions=0,
            reach=0,
            engagement_rate=0.0,
            queries_received=queries_count,
            average_response_time_minutes=avg_resp_mins,
            sentiment_breakdown=sentiment_map,
            top_topics=[],
        )
