"""FastAPI Router for Luna Social Studio (V1 Freemium to Enterprise).

Hexagonal architecture with dynamic dependency injection:
- Adapters are selected based on the business's `active_social_provider` column.
- Credit enforcement middleware protects outbound actions (402 Payment Required).
- Free inbound reads and analytics cost 0 Social Credits (SC).
- PWA Reminder Mode provides 100% zero-cost social publishing without API review blockers.
"""

from __future__ import annotations

from datetime import datetime
from typing import Annotated, Any
from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.realtime import broker
from app.social_studio import credit_manager
from app.social_studio.adapters import (
    BaseSocialAdapter,
    PostproxyAdapter,
    ReminderModeAdapter,
    SocialApiAdapter,
    ZernioAdapter,
)
from app.social_studio.interfaces import (
    DmReplyResult,
    ISocialProvider,
    LunaMessage,
    ScheduleResult,
    SocialAnalyticsData,
)
from app.social_studio.webhook_parser import ingest_webhook_message, parse_webhook_payload

router = APIRouter(prefix="/api/social", tags=["Social Studio"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


# --- Request & Response Schemas ---

class DmReplyRequest(BaseModel):
    business_id: str = Field(min_length=1)
    message_id: str = Field(min_length=1)
    reply_text: str = Field(min_length=1)
    author_id: str | None = None


class PostScheduleRequest(BaseModel):
    business_id: str = Field(min_length=1)
    content: str = Field(min_length=1)
    platforms: list[str] = Field(min_items=1)
    scheduled_for: datetime | None = None
    media_url: str | None = None
    author_id: str | None = None


class CreditGrantRequest(BaseModel):
    business_id: str = Field(min_length=1)
    amount: int = Field(gt=0)
    reason: str = "trial_or_purchase"


class ProviderSwitchRequest(BaseModel):
    business_id: str = Field(min_length=1)
    provider: str = Field(pattern="^(zernio|socialapi|postproxy|reminder_mode)$")


# --- Dependency Injection Resolver ---

async def get_social_provider(
    business_id: str = Query(min_length=1),
    db: AsyncSession = Depends(get_db),
) -> ISocialProvider:
    """Dependency Injection: Hot-swaps the adapter based on tenant configuration."""
    business = await credit_manager.get_tenant_business(db, business_id)
    provider_name = (business.active_social_provider or "zernio").lower()

    if provider_name == "socialapi":
        return SocialApiAdapter(db=db)
    elif provider_name == "postproxy":
        return PostproxyAdapter(db=db)
    elif provider_name == "reminder_mode":
        return ReminderModeAdapter(db=db)
    else:
        return ZernioAdapter(db=db)


# --- Endpoints ---

@router.get("/inbox", response_model=list[LunaMessage])
async def get_inbox(
    business_id: str = Query(min_length=1),
    platform: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    provider: ISocialProvider = Depends(get_social_provider),
) -> list[LunaMessage]:
    """Fetch unified inbox messages (0 Social Credits consumed - FREE)."""
    return await provider.get_inbox(
        business_id=business_id,
        platform=platform,
        status=status_filter,
        limit=limit,
        offset=offset,
    )


@router.post("/reply", response_model=DmReplyResult)
async def send_dm_reply(
    payload: DmReplyRequest,
    db: DbSession,
) -> DmReplyResult:
    """Send an outbound reply to a customer DM/comment.
    
    Consumes 1 Social Credit (SC). Raises HTTP 402 if credit balance < 1.
    """
    # 1. Enforce credit validation & decrement balance
    remaining_credits = await credit_manager.validate_and_deduct_credits(
        db,
        business_id=payload.business_id,
        cost=1,
        action="dm_reply",
    )

    # 2. Resolve tenant adapter
    business = await credit_manager.get_tenant_business(db, payload.business_id)
    provider_name = (business.active_social_provider or "zernio").lower()

    if provider_name == "socialapi":
        provider: ISocialProvider = SocialApiAdapter(db=db)
    elif provider_name == "postproxy":
        provider = PostproxyAdapter(db=db)
    else:
        provider = ZernioAdapter(db=db)

    # 3. Dispatch outbound reply
    result = await provider.send_dm_reply(
        business_id=payload.business_id,
        message_id=payload.message_id,
        reply_text=payload.reply_text,
        author_id=payload.author_id,
    )
    result.remaining_credits = remaining_credits
    await db.commit()
    return result


@router.get("/analytics", response_model=SocialAnalyticsData)
async def get_social_analytics(
    business_id: str = Query(min_length=1),
    platform: str | None = None,
    period: str = Query(default="7d"),
    provider: ISocialProvider = Depends(get_social_provider),
) -> SocialAnalyticsData:
    """Fetch aggregated cross-platform social analytics (0 Social Credits consumed - FREE)."""
    return await provider.fetch_analytics(
        business_id=business_id,
        platform=platform,
        time_range=period,
    )


@router.post("/schedule", response_model=ScheduleResult)
async def schedule_social_post(
    payload: PostScheduleRequest,
    db: DbSession,
) -> ScheduleResult:
    """Schedule a social post via PWA Reminder Mode (0 API cost, zero app review blocker)."""
    # Reminder Mode persists to DB and prepares mobile PWA Web Share handoff
    reminder_adapter = ReminderModeAdapter(db=db)
    result = await reminder_adapter.schedule_post(
        business_id=payload.business_id,
        content=payload.content,
        platforms=payload.platforms,
        scheduled_for=payload.scheduled_for,
        media_url=payload.media_url,
        author_id=payload.author_id,
    )
    await db.commit()
    return result


@router.get("/credits")
async def get_credit_balance(
    business_id: str = Query(min_length=1),
    db: DbSession = None,
) -> dict[str, Any]:
    """Retrieve tenant Social Credit (SC) balance and trial status."""
    return await credit_manager.get_credit_balance(db, business_id)


@router.post("/credits/grant")
async def grant_credits(
    payload: CreditGrantRequest,
    db: DbSession,
) -> dict[str, Any]:
    """Top-up or grant Social Credits (SC) to a business tenant."""
    new_balance = await credit_manager.grant_social_credits(
        db,
        business_id=payload.business_id,
        amount=payload.amount,
        reason=payload.reason,
    )
    await db.commit()
    return {
        "business_id": payload.business_id,
        "amount_granted": payload.amount,
        "new_balance": new_balance,
    }


@router.patch("/provider")
async def switch_provider(
    payload: ProviderSwitchRequest,
    db: DbSession,
) -> dict[str, Any]:
    """Hot-swap the active social API provider for this tenant without UI rewrites."""
    business = await credit_manager.get_tenant_business(db, payload.business_id)
    previous_provider = business.active_social_provider
    business.active_social_provider = payload.provider
    await db.commit()
    return {
        "business_id": business.id,
        "previous_provider": previous_provider,
        "active_social_provider": business.active_social_provider,
        "message": f"Successfully hot-swapped social provider to {payload.provider}.",
    }


@router.post("/webhook/{provider}")
async def handle_vendor_webhook(
    provider: str,
    request: Request,
    db: DbSession,
    business_id: str | None = Query(default=None),
) -> dict[str, Any]:
    """Single endpoint receiving heterogeneous incoming webhooks from all social providers."""
    payload = await request.json()
    normalized_message = parse_webhook_payload(
        provider=provider,
        payload=payload,
        fallback_business_id=business_id,
    )
    query = await ingest_webhook_message(db, normalized_message, broker=broker)
    return {
        "status": "ingested",
        "message_id": str(query.id),
        "business_id": query.business_id,
        "author": query.author_handle,
    }
