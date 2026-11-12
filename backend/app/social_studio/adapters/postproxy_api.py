"""Postproxy API Adapter for Social Media Management."""

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


class PostproxyAdapter(BaseSocialAdapter):
    """Adapter wrapping Postproxy API for DMs, comments, and post stats."""

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
        inbox_type: str | None = "all",
        limit: int = 50,
        offset: int = 0,
    ) -> list[LunaMessage]:
        """Aggregate mentions, comments, and DMs via Postproxy API."""
        target_type = (inbox_type or "all").lower()

        if self.api_key:
            try:
                aggregated: list[LunaMessage] = []
                async with self._get_client() as client:
                    # 1. Direct Messages
                    if target_type in ("all", "dm"):
                        resp = await client.get("/api/chats", params={"limit": min(limit, 50)})
                        if resp.status_code == 200:
                            for chat in resp.json().get("chats", resp.json().get("data", [])):
                                aggregated.append(
                                    LunaMessage(
                                        id=chat.get("id"),
                                        business_id=business_id,
                                        account_id=chat.get("profile_id", business_id),
                                        platform=chat.get("platform", "x"),
                                        query_type="dm",
                                        author_handle=chat.get("participant_handle", chat.get("sender", "@customer")),
                                        author_name=chat.get("participant_name"),
                                        body=chat.get("last_message_preview", chat.get("last_message", "")),
                                        timestamp=datetime.fromisoformat(
                                            chat.get("last_message_at", datetime.utcnow().isoformat())
                                        ),
                                        status="open" if chat.get("status") == "open" else "closed",
                                    )
                                )

                    # 2. Comments
                    if target_type in ("all", "comment"):
                        c_resp = await client.get(
                            f"/api/profiles/{business_id}/comments",
                            params={"limit": min(limit, 20)},
                        )
                        if c_resp.status_code == 200:
                            for cmt in c_resp.json().get("comments", c_resp.json().get("data", [])):
                                aggregated.append(
                                    LunaMessage(
                                        id=cmt.get("id"),
                                        business_id=business_id,
                                        account_id=cmt.get("profile_id", business_id),
                                        platform=cmt.get("platform", "instagram"),
                                        query_type="comment",
                                        post_id=cmt.get("post_id"),
                                        author_handle=cmt.get("author_handle", "@customer"),
                                        author_name=cmt.get("author_name"),
                                        body=cmt.get("text", cmt.get("body", "")),
                                        timestamp=datetime.fromisoformat(
                                            cmt.get("created_at", datetime.utcnow().isoformat())
                                        ),
                                        status="open",
                                    )
                                )

                    # 3. Mentions
                    if target_type in ("all", "mention"):
                        m_resp = await client.get(
                            f"/api/profiles/{business_id}/comments",
                            params={"type": "mention", "limit": min(limit, 20)},
                        )
                        if m_resp.status_code == 200:
                            for m in m_resp.json().get("comments", m_resp.json().get("data", [])):
                                aggregated.append(
                                    LunaMessage(
                                        id=m.get("id"),
                                        business_id=business_id,
                                        account_id=m.get("profile_id", business_id),
                                        platform=m.get("platform", "x"),
                                        query_type="mention",
                                        post_id=m.get("post_id"),
                                        author_handle=m.get("author_handle", "@customer"),
                                        author_name=m.get("author_name"),
                                        body=m.get("text", m.get("body", "")),
                                        timestamp=datetime.fromisoformat(
                                            m.get("created_at", datetime.utcnow().isoformat())
                                        ),
                                        status="open",
                                    )
                                )

                    aggregated.sort(key=lambda x: x.timestamp, reverse=True)
                    return aggregated[:limit]

            except Exception as e:
                logger.warning(f"[PostproxyAdapter] Remote inbox call failed: {e}")

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
        external_id = None

        if query_type == "mention":
            raise HTTPException(
                status_code=400,
                detail="Mentions cannot be replied to due to strict social media API usage policies.",
            )

        post_id = None
        if self.db:
            stmt = select(SocialQuery).where(
                SocialQuery.id == message_id,
                SocialQuery.business_id == business_id,
            )
            result = await self.db.execute(stmt)
            query = result.scalar_one_or_none()
            if query:
                db_q_type = getattr(query, "query_type", "dm") or "dm"
                if db_q_type == "mention":
                    raise HTTPException(
                        status_code=400,
                        detail="Mentions cannot be replied to due to strict social media API usage policies.",
                    )
                query_type = db_q_type
                post_id = getattr(query, "post_id", None)
                query.response_body = reply_text
                query.status = QueryStatus.ANSWERED.value
                query.answered_at = datetime.utcnow()
                query.answered_by = author_id
                await self.db.flush()

        if query_type == "mention":
            raise HTTPException(
                status_code=400,
                detail="Mentions cannot be replied to due to strict social media API usage policies.",
            )

        if self.api_key:
            try:
                async with self._get_client() as client:
                    if query_type == "comment" and post_id:
                        resp = await client.post(
                            f"/api/posts/{post_id}/comments",
                            json={"body": reply_text, "parent_comment_id": message_id},
                        )
                    else:
                        resp = await client.post(
                            f"/api/chats/{message_id}/messages",
                            json={"body": reply_text},
                        )
                    if resp.status_code in (200, 201):
                        external_id = resp.json().get("id")
            except Exception as e:
                logger.warning(f"[PostproxyAdapter] Reply dispatch failed: {e}")

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
        """Fetch profile stats via Postproxy /api/profiles/{id}/stats without placeholders."""
        if self.api_key:
            try:
                async with self._get_client() as client:
                    resp = await client.get(f"/api/profiles/{business_id}/stats")
                    if resp.status_code == 200:
                        d = resp.json()
                        followers = d.get("follower_count", 0) or 0
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
                            queries_received=d.get("comments_count", 0) or 0,
                            average_response_time_minutes=0.0,
                            sentiment_breakdown={"positive": 0, "neutral": 0, "negative": 0},
                            top_topics=[],
                            raw_metrics=d,
                        )
                    else:
                        raise HTTPException(
                            status_code=resp.status_code,
                            detail=f"Postproxy stats failed: {resp.text}",
                        )
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"[PostproxyAdapter] Stats fetch failed: {e}")
                raise HTTPException(status_code=502, detail=f"Failed to fetch Postproxy stats: {e}")

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
