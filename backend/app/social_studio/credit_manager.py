"""Social Credit (SC) Billing & Enforcement Engine.

Governs the freemium / pay-as-you-go credit economy for Luna Social Studio:
- Inbound data fetching (inbox, reading DMs, analytics) = 0 SC (FREE).
- Outbound actions (DM replies, AI content generation) = 1+ SC (DECREMENTED).
- If balance < 1: raises HTTP 402 Payment Required.
"""

from __future__ import annotations

from typing import Any
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tenant import Business
from app.social_studio.interfaces import PlatformCapability, ProviderCapabilities


DEFAULT_PLATFORM_CAPABILITIES: dict[str, PlatformCapability] = {
    "instagram": PlatformCapability(
        platform="instagram",
        supports_dm=True,
        supports_comments=True,
        supports_mentions=True,
        can_reply_mentions=False,
        supports_reviews=False,
        supports_analytics=True,
        dm_window_hours=24,
        notes="Mentions are read-only; DMs require customer interaction within trailing 24h",
    ),
    "facebook": PlatformCapability(
        platform="facebook",
        supports_dm=True,
        supports_comments=True,
        supports_mentions=True,
        can_reply_mentions=False,
        supports_reviews=True,
        supports_analytics=True,
        dm_window_hours=24,
        notes="Page-level DMs only; Recommendations supported; Mentions cannot be replied to",
    ),
    "x": PlatformCapability(
        platform="x",
        supports_dm=True,
        supports_comments=True,
        supports_mentions=True,
        can_reply_mentions=False,
        supports_reviews=False,
        supports_analytics=True,
        dm_window_hours=None,
        notes="Encrypted X Chat not accessible via API; Mentions are read-only",
    ),
    "linkedin": PlatformCapability(
        platform="linkedin",
        supports_dm=False,
        supports_comments=True,
        supports_mentions=True,
        can_reply_mentions=False,
        supports_reviews=False,
        supports_analytics=True,
        dm_window_hours=None,
        notes="Company Pages only; personal profiles cannot list comments or mentions",
    ),
    "tiktok": PlatformCapability(
        platform="tiktok",
        supports_dm=False,
        supports_comments=True,
        supports_mentions=False,
        can_reply_mentions=False,
        supports_reviews=False,
        supports_analytics=True,
        dm_window_hours=None,
        notes="Business Accounts only; Creator accounts lack comments and mentions",
    ),
    "whatsapp": PlatformCapability(
        platform="whatsapp",
        supports_dm=True,
        supports_comments=False,
        supports_mentions=False,
        can_reply_mentions=False,
        supports_reviews=False,
        supports_analytics=False,
        dm_window_hours=24,
        notes="24h customer care window; outbound outside window requires approved template",
    ),
    "google": PlatformCapability(
        platform="google",
        supports_dm=False,
        supports_comments=False,
        supports_mentions=False,
        can_reply_mentions=False,
        supports_reviews=True,
        supports_analytics=True,
        dm_window_hours=None,
        notes="Google Business Profile reviews and location analytics",
    ),
    "youtube": PlatformCapability(
        platform="youtube",
        supports_dm=False,
        supports_comments=True,
        supports_mentions=False,
        can_reply_mentions=False,
        supports_reviews=False,
        supports_analytics=True,
        dm_window_hours=None,
        notes="Video comments and channel analytics",
    ),
    "pinterest": PlatformCapability(
        platform="pinterest",
        supports_dm=False,
        supports_comments=False,
        supports_mentions=False,
        can_reply_mentions=False,
        supports_reviews=False,
        supports_analytics=True,
        dm_window_hours=None,
        notes="Publishing and board analytics only",
    ),
    "telegram": PlatformCapability(
        platform="telegram",
        supports_dm=True,
        supports_comments=False,
        supports_mentions=False,
        can_reply_mentions=False,
        supports_reviews=False,
        supports_analytics=False,
        dm_window_hours=None,
        notes="Bot messaging only; user must initiate contact",
    ),
}


class InsufficientCreditsError(HTTPException):
    """Raised when tenant attempts an outbound action with 0 or negative SC balance."""

    def __init__(self, current_balance: int, required: int = 1) -> None:
        super().__init__(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "error": "insufficient_social_credits",
                "message": (
                    f"Insufficient Social Credits (SC). You have {current_balance} SC remaining, "
                    f"but this action requires {required} SC. Unlock the Basic Plan at ₦20,000/month "
                    "or purchase a credit top-up to continue sending outbound interactions."
                ),
                "current_credits": current_balance,
                "required_credits": required,
                "upgrade_url": "/staff/settings?tab=billing",
            },
        )


def resolve_priority_provider(tenant_index: int) -> str:
    """Waterfall provider routing for zero-cost infrastructure arbitrage:
    - Priority 1 (SocialAPI.ai): First 2 clients (indices 0, 1)
    - Priority 2 (Postproxy): Next 2 clients (indices 2, 3)
    - Priority 3 (Backup Overflow): Zernio (max 2 accounts) + PlanVortex (max 2 accounts)
    """
    if tenant_index < 2:
        return "socialapi"
    elif tenant_index < 4:
        return "postproxy"
    elif tenant_index % 2 == 0:
        return "zernio"
    else:
        return "planvortex"


async def get_tenant_business(db: AsyncSession, business_id: str) -> Business:
    """Fetch tenant business record or raise 404."""
    query = select(Business).where(Business.id == business_id)
    result = await db.execute(query)
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business tenant '{business_id}' not found.",
        )
    return business


async def get_tenant_capabilities(db: AsyncSession, business_id: str) -> ProviderCapabilities:
    """Read provider capabilities and free-tier limits for frontend UI toggles."""
    business = await get_tenant_business(db, business_id)
    provider = (business.active_social_provider or "socialapi").lower()
    tier = getattr(business, "tier", "free")
    balance = business.social_credits if business.social_credits is not None else 0
    posts_used = getattr(business, "posts_used_this_month", 0) or 0
    interactions_used = getattr(business, "interactions_used_this_month", 0) or 0

    # Free-tier constraints defined in social_api_limitations.md
    post_limit = 10 if tier == "free" else 100
    interaction_limit = 50 if tier == "free" else 500

    return ProviderCapabilities(
        tenant_id=str(business.id),
        active_provider=provider,
        publishing_mode="REMINDER",  # PWA Reminder Mode zero-cost MVP
        inbox_supported=True,
        analytics_supported=True,
        posts_limit_monthly=post_limit,
        interactions_limit_monthly=interaction_limit,
        posts_remaining=max(0, post_limit - posts_used),
        interactions_remaining=max(0, interaction_limit - interactions_used),
        social_credits_remaining=balance,
        tier=tier,
        is_trial_active=balance > 0,
        is_locked=balance <= 0 and tier == "free",
        platform_capabilities=DEFAULT_PLATFORM_CAPABILITIES,
    )


async def get_credit_balance(db: AsyncSession, business_id: str) -> dict[str, Any]:
    """Retrieve current SC balance without modifying state (0 SC cost)."""
    business = await get_tenant_business(db, business_id)
    balance = business.social_credits if business.social_credits is not None else 0
    tier = getattr(business, "tier", "free")
    return {
        "business_id": business.id,
        "social_credits": balance,
        "tier": tier,
        "is_trial_active": balance > 0,
        "is_locked": balance <= 0 and tier == "free",
        "provider": business.active_social_provider or "socialapi",
        "posts_remaining": max(0, 10 - (getattr(business, "posts_used_this_month", 0) or 0)),
        "interactions_remaining": max(0, 50 - (getattr(business, "interactions_used_this_month", 0) or 0)),
    }


async def validate_and_deduct_credits(
    db: AsyncSession,
    business_id: str,
    cost: int = 1,
    action: str = "outbound_reply",
) -> int:
    """Validate SC balance and decrement if sufficient.
    
    Raises 402 Payment Required if balance < cost.
    Increments monthly interactions counter and returns remaining balance.
    """
    business = await get_tenant_business(db, business_id)
    current_balance = business.social_credits if business.social_credits is not None else 0

    if current_balance < cost:
        raise InsufficientCreditsError(current_balance=current_balance, required=cost)

    business.social_credits = current_balance - cost
    # Track interaction count to respect free-tier 50 interactions/month cap
    current_interactions = getattr(business, "interactions_used_this_month", 0) or 0
    business.interactions_used_this_month = current_interactions + cost

    await db.flush()
    return business.social_credits


async def grant_social_credits(
    db: AsyncSession,
    business_id: str,
    amount: int,
    reason: str = "top_up_or_trial",
) -> int:
    """Grant additional Social Credits (e.g. on 7-day trial start or PAYG purchase)."""
    business = await get_tenant_business(db, business_id)
    current_balance = business.social_credits if business.social_credits is not None else 0
    business.social_credits = current_balance + amount
    await db.flush()
    return business.social_credits
