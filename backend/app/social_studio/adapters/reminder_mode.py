"""PWA Reminder Mode Adapter: Zero-Cost Publishing via Web Push & Web Share API.

Bypasses official Meta and TikTok App Reviews for V1 by treating the application as a
content scheduler and dispatcher. When a post is scheduled:
1. The post draft is persisted in the PostgreSQL database.
2. A reminder task payload is registered for Firebase Cloud Messaging (FCM) Web Push.
3. Upon tapping the mobile push notification, the PWA opens with media and caption
   staged, calling `navigator.clipboard.writeText()` and `navigator.share()` to hand off
   directly into native OS apps.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.social import (
    PostStatus,
    SocialAccount,
    SocialPost,
    SocialPostTarget,
)
from app.social_studio.adapters.base import BaseSocialAdapter
from app.social_studio.interfaces import (
    DmReplyResult,
    LunaMessage,
    ScheduleResult,
    SocialAnalyticsData,
)

logger = logging.getLogger(__name__)


class ReminderModeAdapter(BaseSocialAdapter):
    """Adapter implementing the Zero-Cost MVP Reminder Mode for social publishing."""

    def __init__(self, db: AsyncSession | None = None) -> None:
        super().__init__(api_key="", base_url="", db=db)

    async def get_inbox(
        self,
        business_id: str,
        platform: str | None = None,
        status: str | None = None,
        inbox_type: str | None = "all",
        limit: int = 50,
        offset: int = 0,
    ) -> list[LunaMessage]:
        return await self._fetch_db_inbox(
            business_id,
            status_filter=status,
            inbox_type=inbox_type,
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
        from app.social_studio.adapters.zernio_api import ZernioAdapter

        zernio = ZernioAdapter(db=self.db)
        return await zernio.send_dm_reply(
            business_id=business_id,
            message_id=message_id,
            reply_text=reply_text,
            author_id=author_id,
            query_type=query_type,
        )

    async def fetch_analytics(
        self,
        business_id: str,
        platform: str | None = None,
        time_range: str = "7d",
    ) -> SocialAnalyticsData:
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
        """Saves post draft and generates PWA Web Share handoff payload."""
        if not self.db:
            fake_id = str(uuid.uuid4())
            return ScheduleResult(
                success=True,
                post_id=fake_id,
                status="reminder_queued",
                scheduled_for=scheduled_for or datetime.utcnow(),
                platforms=platforms,
                mode="REMINDER",
                reminder_payload={
                    "caption": content,
                    "media_url": media_url,
                    "platforms": platforms,
                },
            )

        # 1. Create SocialPost record in PostgreSQL
        post = SocialPost(
            business_id=business_id,
            author_id=author_id,
            body=content,
            media_url=media_url,
            status=PostStatus.SCHEDULED.value if scheduled_for else PostStatus.DRAFT.value,
            scheduled_for=scheduled_for or datetime.utcnow(),
        )
        self.db.add(post)
        await self.db.flush()

        # 2. Attach targets for connected accounts matching platforms
        stmt = select(SocialAccount).where(
            SocialAccount.business_id == business_id,
            SocialAccount.platform.in_(platforms),
        )
        result = await self.db.execute(stmt)
        accounts = result.scalars().all()

        for acc in accounts:
            target = SocialPostTarget(
                post_id=str(post.id),
                account_id=str(acc.id),
                status=PostStatus.SCHEDULED.value,
            )
            self.db.add(target)

        await self.db.flush()

        # 3. Construct PWA mobile share handoff envelope
        reminder_payload = {
            "post_id": str(post.id),
            "business_id": business_id,
            "caption": content,
            "media_url": media_url,
            "platforms": platforms,
            "scheduled_for": post.scheduled_for.isoformat() if post.scheduled_for else None,
            "share_handoff_url": f"/tenant/{business_id}/staff/social-studio?post_id={post.id}&action=publish_handoff",
            "push_notification": {
                "title": f"Reminder: Publish to {', '.join(platforms)}",
                "body": (content[:80] + "...") if len(content) > 80 else content,
                "icon": "/brand/luna-icon-purple.png",
                "tag": f"social-post-{post.id}",
            },
        }

        return ScheduleResult(
            success=True,
            post_id=str(post.id),
            status="reminder_queued",
            scheduled_for=post.scheduled_for,
            platforms=platforms,
            mode="REMINDER",
            reminder_payload=reminder_payload,
        )
