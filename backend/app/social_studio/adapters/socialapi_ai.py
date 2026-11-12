"""SocialAPI.ai Adapter for Social Studio."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.social import QueryStatus, SocialAccount, SocialQuery
from app.social_studio.adapters.base import BaseSocialAdapter
from app.social_studio.interfaces import (
    DmReplyResult,
    LunaMessage,
    ScheduleResult,
    SocialAnalyticsData,
)

logger = logging.getLogger(__name__)


class SocialApiAdapter(BaseSocialAdapter):
    """Adapter wrapping SocialAPI.ai unified inbox, mentions, comments, and analytics."""

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
        inbox_type: str | None = "all",
        limit: int = 50,
        offset: int = 0,
    ) -> list[LunaMessage]:
        """Aggregate mentions, comments, and DMs into one unified social inbox."""
        target_type = (inbox_type or "all").lower()

        if self.api_key:
            try:
                aggregated: list[LunaMessage] = []
                async with self._get_client() as client:
                    # 1. Direct Messages
                    if target_type in ("all", "dm"):
                        dm_params: dict[str, Any] = {"limit": min(limit, 50), "account_id": business_id}
                        if platform and platform != "all":
                            dm_params["platform"] = platform
                        if status and status != "all":
                            dm_params["status"] = "active" if status == "open" else status

                        resp = await client.get("/inbox/conversations", params=dm_params)
                        if resp.status_code == 200:
                            for c in resp.json().get("data", []):
                                aggregated.append(
                                    LunaMessage(
                                        id=c.get("id"),
                                        business_id=business_id,
                                        account_id=c.get("account_id"),
                                        platform=c.get("platform", "instagram"),
                                        query_type="dm",
                                        author_handle=f"@{c.get('participant_name', 'user').replace(' ', '').lower()}",
                                        author_name=c.get("participant_name"),
                                        body=c.get("last_message", ""),
                                        timestamp=datetime.fromisoformat(
                                            c.get("last_message_at", datetime.utcnow().isoformat())
                                        ),
                                        status="open" if c.get("status") == "active" else "closed",
                                    )
                                )

                    # 2. Comments on Posts
                    if target_type in ("all", "comment"):
                        cmt_params: dict[str, Any] = {
                            "account_id": business_id,
                            "min_comments": 1,
                            "limit": min(limit, 20),
                        }
                        c_resp = await client.get("/inbox/comments", params=cmt_params)
                        if c_resp.status_code == 200:
                            posts_data = c_resp.json().get("data", [])
                            for p in posts_data:
                                p_id = p.get("id")
                                p_platform = p.get("platform", "instagram")
                                comments_resp = await client.get(
                                    f"/inbox/comments/{p_id}",
                                    params={"account_id": business_id, "limit": 10},
                                )
                                if comments_resp.status_code == 200:
                                    for cmt in comments_resp.json().get("data", []):
                                        author_info = cmt.get("author") or {}
                                        username = author_info.get("username") or "user"
                                        aggregated.append(
                                            LunaMessage(
                                                id=cmt.get("id"),
                                                business_id=business_id,
                                                account_id=business_id,
                                                platform=p_platform,
                                                query_type="comment",
                                                post_id=str(p_id),
                                                author_handle=f"@{username}".replace("@@", "@"),
                                                author_name=author_info.get("name") or username,
                                                body=cmt.get("text", ""),
                                                timestamp=datetime.fromisoformat(
                                                    cmt.get("created_at", datetime.utcnow().isoformat())
                                                ),
                                                status="open",
                                            )
                                        )

                    # 3. Mentions
                    if target_type in ("all", "mention"):
                        mnt_params: dict[str, Any] = {"limit": min(limit, 50)}
                        m_resp = await client.get(f"/accounts/{business_id}/mentions", params=mnt_params)
                        if m_resp.status_code == 200:
                            for m in m_resp.json().get("data", []):
                                m_author = m.get("author") or {}
                                m_content = m.get("content") or {}
                                m_user = m_author.get("username") or "user"
                                aggregated.append(
                                    LunaMessage(
                                        id=m.get("id"),
                                        business_id=business_id,
                                        account_id=m.get("account_id", business_id),
                                        platform=m.get("platform", "instagram"),
                                        query_type="mention",
                                        post_id=m.get("metadata", {}).get("media_id"),
                                        author_handle=f"@{m_user}".replace("@@", "@"),
                                        author_name=m_user,
                                        body=m_content.get("text", ""),
                                        timestamp=datetime.fromisoformat(
                                            m.get("received_at", datetime.utcnow().isoformat())
                                        ),
                                        status="open",
                                    )
                                )

                    aggregated.sort(key=lambda x: x.timestamp, reverse=True)
                    return aggregated[:limit]

            except Exception as e:
                logger.warning(f"[SocialApiAdapter] Remote inbox call failed: {e}")

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
        remaining_interactions = None

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
                            f"/inbox/comments/{post_id}",
                            json={"account_id": business_id, "comment_id": message_id, "text": reply_text},
                        )
                    else:
                        resp = await client.post(
                            f"/inbox/conversations/{message_id}/messages",
                            json={"account_id": business_id, "text": reply_text},
                        )

                    if resp.status_code in (200, 201):
                        data = resp.json()
                        external_id = data.get("id") or data.get("message_id")
                        rem_header = resp.headers.get("x-interactions-remaining")
                        if rem_header and rem_header.isdigit():
                            remaining_interactions = int(rem_header)
                    elif resp.status_code == 429:
                        logger.warning("[SocialApiAdapter] 429 interaction limit exhausted on free tier")
                        raise HTTPException(
                            status_code=429,
                            detail="SocialAPI.ai interaction limit exhausted on free tier.",
                        )
                    else:
                        logger.warning(f"[SocialApiAdapter] Remote reply returned {resp.status_code}: {resp.text}")
            except HTTPException:
                raise
            except Exception as e:
                logger.warning(f"[SocialApiAdapter] Reply dispatch failed: {e}")

        return DmReplyResult(
            success=True,
            message_id=message_id,
            reply_body=reply_text,
            external_id=external_id or f"socialapi_sim_{message_id[:8]}",
            timestamp=datetime.utcnow(),
            credits_deducted=1,
            remaining_credits=remaining_interactions,
        )

    async def fetch_analytics(
        self,
        business_id: str,
        platform: str | None = None,
        time_range: str = "7d",
    ) -> SocialAnalyticsData:
        """Fetch analytics overview and platform follower metrics via SocialAPI.ai.
        
        Overview totals provides post engagement, views, likes, comments, and shares.
        Follower counts are obtained by querying the specific /platforms/{platform}/accounts/{id}/summary endpoints.
        """
        if self.api_key:
            try:
                async with self._get_client() as client:
                    params: dict[str, Any] = {"account_id": business_id}
                    if platform and platform != "all":
                        params["platform"] = platform

                    resp = await client.get("/analytics/overview", params=params)
                    if resp.status_code == 200:
                        d = resp.json().get("data", {})
                        totals = d.get("totals", {})

                        views = totals.get("views", 0) or 0
                        engagements = totals.get("engagements", 0) or 0
                        comments = totals.get("comments", 0) or 0
                        eng_rate = round((engagements / views) * 100, 2) if views > 0 else 0.0

                        # Query platform summary endpoints to fetch real follower metrics
                        total_followers = 0
                        if self.db:
                            acc_stmt = select(SocialAccount).where(
                                SocialAccount.business_id == business_id,
                                SocialAccount.is_connected == True,
                            )
                            if platform and platform != "all":
                                acc_stmt = acc_stmt.where(SocialAccount.platform == platform)
                            acc_res = await self.db.execute(acc_stmt)
                            accounts = acc_res.scalars().all()

                            for acc in accounts:
                                p_name = acc.platform.lower()
                                if p_name in ("instagram", "facebook", "tiktok", "youtube", "pinterest"):
                                    try:
                                        p_resp = await client.get(f"/platforms/{p_name}/accounts/{acc.id}/summary")
                                        if p_resp.status_code == 200:
                                            p_data = p_resp.json()
                                            f_count = (
                                                p_data.get("follower_count")
                                                or p_data.get("subscriber_count")
                                                or 0
                                            )
                                            total_followers += f_count
                                            acc.follower_count = f_count
                                        else:
                                            total_followers += (acc.follower_count or 0)
                                    except Exception:
                                        total_followers += (acc.follower_count or 0)
                                else:
                                    total_followers += (acc.follower_count or 0)
                            await self.db.flush()

                        return SocialAnalyticsData(
                            business_id=business_id,
                            platform=platform or "all",
                            period=time_range,
                            total_followers=total_followers,
                            impressions=views,
                            reach=views,
                            engagement_rate=eng_rate,
                            queries_received=comments,
                            average_response_time_minutes=0.0,
                            sentiment_breakdown={"positive": 0, "neutral": 0, "negative": 0},
                            top_topics=[],
                            raw_metrics=totals,
                        )
                    else:
                        logger.error(f"[SocialApiAdapter] Analytics call failed: HTTP {resp.status_code} {resp.text}")
                        raise HTTPException(
                            status_code=resp.status_code,
                            detail=f"SocialAPI analytics failed: {resp.text}",
                        )
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"[SocialApiAdapter] Analytics fetch failed: {e}")
                raise HTTPException(status_code=502, detail=f"Failed to fetch SocialAPI analytics: {e}")

        # Local Database fallback (calculates real DB metrics from PostgreSQL)
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
