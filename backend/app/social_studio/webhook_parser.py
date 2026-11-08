"""Webhook Normalization Engine for Social Studio.

Translates heterogeneous webhook payloads from different social aggregators (Zernio,
SocialAPI.ai, Postproxy, Meta Graph) into unified `LunaMessage` schemas, commits them
to PostgreSQL, and dispatches live events to the staff console over Redis WebSockets.
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.social import QueryStatus, SocialAccount, SocialQuery
from app.realtime.channels import social_inbox_channel
from app.social_studio.interfaces import LunaMessage

logger = logging.getLogger(__name__)


def parse_webhook_payload(
    provider: str,
    payload: dict[str, Any],
    fallback_business_id: str | None = None,
) -> LunaMessage:
    """Normalize vendor-specific webhook into a standardized LunaMessage."""
    prov = provider.lower()
    msg_id = str(uuid.uuid4())
    business_id = fallback_business_id or "default"
    platform = "instagram"
    author_handle = "@customer"
    author_name = None
    body = ""
    media_url = None

    if prov == "zernio":
        data = payload.get("data", payload)
        msg_id = data.get("id", msg_id)
        business_id = data.get("business_id", business_id)
        platform = data.get("platform", "instagram")
        author_handle = data.get("sender", data.get("from", "@customer"))
        author_name = data.get("sender_name")
        body = data.get("text", data.get("body", ""))
        media_url = data.get("media_url")

    elif prov in ("socialapi", "socialapi_ai"):
        # SocialAPI webhook event shape or interaction payload
        event_data = payload.get("data", payload)
        msg_id = event_data.get("id", payload.get("message_id", msg_id))
        business_id = event_data.get("account_id", payload.get("business_id", business_id))
        platform = event_data.get("platform", payload.get("network", "instagram"))

        author_obj = event_data.get("author")
        if isinstance(author_obj, dict) and author_obj:
            username = author_obj.get("username", "customer")
            author_handle = f"@{username}".replace("@@", "@")
            author_name = author_obj.get("name") or author_obj.get("username")
        else:
            author_handle = payload.get("sender_handle") or event_data.get("sender_handle") or payload.get("from") or "@customer"
            author_name = payload.get("sender_name") or event_data.get("sender_name") or author_handle.lstrip("@")

        content_obj = event_data.get("content")
        if isinstance(content_obj, dict) and content_obj:
            body = content_obj.get("text", payload.get("text", ""))
            media_list = content_obj.get("media") or []
            if media_list and isinstance(media_list, list) and len(media_list) > 0:
                media_url = media_list[0].get("url")
        else:
            body = payload.get("text", payload.get("body", event_data.get("text", "")))

    elif prov == "planvortex":
        msg_id = payload.get("event_id", payload.get("id", msg_id))
        business_id = payload.get("org_id", payload.get("business_id", business_id))
        platform = payload.get("channel", "x")
        author_handle = payload.get("handle", "@customer")
        body = payload.get("content", payload.get("text", ""))
        media_url = payload.get("media_url")

    elif prov == "postproxy":
        msg = payload.get("message", payload)
        msg_id = msg.get("id", msg_id)
        business_id = payload.get("business_id", business_id)
        platform = msg.get("channel", "x")
        author_handle = msg.get("from", "@customer")
        body = msg.get("content", msg.get("text", ""))
        media_url = msg.get("attachment_url")

    else:
        # Generic envelope normalization
        msg_id = payload.get("id", msg_id)
        business_id = payload.get("business_id", business_id)
        platform = payload.get("platform", payload.get("channel", "instagram"))
        author_handle = payload.get("author", payload.get("sender", payload.get("from", "@customer")))
        body = payload.get("body", payload.get("text", payload.get("content", "")))
        media_url = payload.get("media_url")

    return LunaMessage(
        id=str(msg_id),
        business_id=str(business_id),
        platform=str(platform),
        author_handle=str(author_handle),
        author_name=author_name,
        body=str(body),
        media_url=media_url,
        timestamp=datetime.utcnow(),
        status="open",
        raw_payload=payload,
    )


async def ingest_webhook_message(
    db: AsyncSession,
    message: LunaMessage,
    broker: Any = None,
) -> SocialQuery:
    """Persist normalized message into SocialQuery and push to live staff WebSockets."""
    # 1. Resolve or create associated SocialAccount handle
    account_stmt = select(SocialAccount).where(
        SocialAccount.business_id == message.business_id,
        SocialAccount.platform == message.platform,
    )
    acc_result = await db.execute(account_stmt)
    account = acc_result.scalars().first()

    if not account:
        account = SocialAccount(
            business_id=message.business_id,
            platform=message.platform,
            handle=f"@{message.platform}_inbox",
            display_name=f"{message.platform.title()} Channel",
            is_connected=True,
        )
        db.add(account)
        await db.flush()

    # 2. Persist SocialQuery record
    query = SocialQuery(
        business_id=message.business_id,
        account_id=str(account.id),
        author_handle=message.author_handle,
        body=message.body,
        media_url=message.media_url,
        status=QueryStatus.OPEN.value,
        sentiment=message.sentiment,
        sentiment_score=message.sentiment_score,
        intent=message.intent,
        suggested_reply=message.suggested_reply,
    )
    db.add(query)
    await db.commit()
    await db.refresh(query)

    # 3. Fan-out realtime WebSocket event to staff console
    if broker:
        channel = social_inbox_channel(message.business_id)
        wire_frame = json.dumps(
            {
                "type": "social.message_received",
                "timestamp": datetime.utcnow().isoformat(),
                "data": {
                    "id": str(query.id),
                    "business_id": query.business_id,
                    "account_id": query.account_id,
                    "platform": message.platform,
                    "author_handle": query.author_handle,
                    "body": query.body,
                    "media_url": query.media_url,
                    "status": query.status,
                    "sentiment": query.sentiment,
                    "intent": query.intent,
                    "created_at": query.created_at.isoformat() if query.created_at else None,
                },
            }
        )
        try:
            await broker.publish(channel, wire_frame)
        except Exception as e:
            logger.warning(f"[WebhookParser] Realtime broker publish failed: {e}")

    return query
