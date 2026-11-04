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


class InsufficientCreditsError(HTTPException):
    """Raised when tenant attempts an outbound action with 0 or negative SC balance."""

    def __init__(self, current_balance: int, required: int = 1) -> None:
        super().__init__(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "error": "insufficient_social_credits",
                "message": (
                    f"Insufficient Social Credits (SC). You have {current_balance} SC remaining, "
                    f"but this action requires {required} SC. Please top up your credits or upgrade "
                    "to the Pro Plan (₦20,000/month) to unlock unlimited interactions."
                ),
                "current_credits": current_balance,
                "required_credits": required,
                #"upgrade_url": "/staff/settings?tab=billing",
            },
        )


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


async def get_credit_balance(db: AsyncSession, business_id: str) -> dict[str, Any]:
    """Retrieve current SC balance without modifying state (0 SC cost)."""
    business = await get_tenant_business(db, business_id)
    balance = business.social_credits if business.social_credits is not None else 0
    return {
        "business_id": business.id,
        "social_credits": balance,
        "is_trial_active": balance > 0,
        "is_locked": balance <= 0,
        "provider": business.active_social_provider or "zernio",
    }


async def validate_and_deduct_credits(
    db: AsyncSession,
    business_id: str,
    cost: int = 1,
    action: str = "outbound_reply",
) -> int:
    """Validate SC balance and decrement if sufficient.

    Raises 402 Payment Required if balance < cost.
    Returns remaining credit balance after deduction.
    """
    business = await get_tenant_business(db, business_id)
    current_balance = business.social_credits if business.social_credits is not None else 0

    if current_balance < cost:
        raise InsufficientCreditsError(current_balance=current_balance, required=cost)

    business.social_credits = current_balance - cost
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
