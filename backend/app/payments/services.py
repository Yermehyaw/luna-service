"""Core Business Logic for Luna Payments Engine.

Includes:
- Dynamic Paystack Split Payment calculation (Target Revenue + Paystack Fee + Luna Margin)
- Promotional Discount Code Engine (BETA100 100% waiver & instant fulfillment)
- Transaction ledger recording & post-payment fulfillment (Credits, Subscriptions, Tickets)
"""

from __future__ import annotations

from datetime import datetime
import logging
import uuid
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.payment import GatewayProvider, Payment, PaymentStatus, Transaction, TransactionStatus
from app.models.queue import Ticket
from app.models.tenant import Business
from app.payments.interfaces import (
    ApplyDiscountResult,
    CheckoutInitResult,
    LunaTransactionEvent,
    SplitCalculationResult,
)
from app.social_studio import credit_manager

logger = logging.getLogger(__name__)

# Official Beta Discount Codes
VALID_DISCOUNT_CODES = {
    "BETA100": {
        "discount_percent": 100.0,
        "is_free": True,
        "description": "100% Beta Tester Waiver - Social Studio & SaaS Subscription",
    },
    "EARLYBIRD50": {
        "discount_percent": 50.0,
        "is_free": False,
        "description": "50% Early Bird Growth Discount",
    },
}


def calculate_paystack_split(
    target_revenue_naira: float,
    custom_luna_margin_naira: float | None = None,
) -> SplitCalculationResult:
    """Calculate Paystack Split amounts ensuring exact vendor settlement.
    
    Formula:
    Target Business Revenue + Paystack Fee (1.5% + ₦100) + LUNA Margin = Final Customer Price.
    
    Settlement Mechanics:
    With `bearer: 'subaccount'`, Paystack deposits `Target Business Revenue` straight into
    the business's local bank account, while deducting the Paystack fee from the gross charge
    and routing `LUNA Margin + Paystack Fee` as the transaction charge to the main platform.
    """
    if target_revenue_naira <= 0:
        raise ValueError("Target revenue must be greater than zero.")

    # Luna platform margin (1% + ₦100 default)
    if custom_luna_margin_naira is not None:
        margin_naira = max(0.0, custom_luna_margin_naira)
    else:
        margin_percent = settings.LUNA_PLATFORM_MARGIN_PERCENT / 100.0
        fixed_margin = float(settings.LUNA_PLATFORM_MARGIN_FIXED_KOBO) / 100.0
        margin_naira = (target_revenue_naira * margin_percent) + fixed_margin

    # Solve for final price T where Paystack fee F is:
    # F = 0.015 * T + (100 if T >= 2500 else 0), capped at 2000
    r_plus_m = target_revenue_naira + margin_naira

    # Test assuming T < 2500 (no ₦100 flat fee)
    t_low = r_plus_m / (1.0 - 0.015)
    if t_low < 2500.0:
        total_customer_price = t_low
        paystack_fee = t_low * 0.015
    else:
        # T >= 2500 includes ₦100 flat fee
        t_high = (r_plus_m + 100.0) / (1.0 - 0.015)
        raw_fee = (t_high * 0.015) + 100.0
        if raw_fee > 2000.0:
            # Paystack fee is capped at ₦2,000 max
            paystack_fee = 2000.0
            total_customer_price = r_plus_m + 2000.0
        else:
            paystack_fee = raw_fee
            total_customer_price = t_high

    target_kobo = int(round(target_revenue_naira * 100))
    luna_margin_kobo = int(round(margin_naira * 100))
    paystack_fee_kobo = int(round(paystack_fee * 100))
    total_customer_kobo = int(round(total_customer_price * 100))

    return SplitCalculationResult(
        target_revenue_kobo=target_kobo,
        paystack_fee_kobo=paystack_fee_kobo,
        luna_margin_kobo=luna_margin_kobo,
        total_customer_charge_kobo=total_customer_kobo,
        subaccount_settlement_kobo=target_kobo,
        currency="NGN",
    )


def validate_discount_code(
    code: str | None,
    original_amount: float,
) -> ApplyDiscountResult:
    """Validate a promotional discount code and calculate waiver."""
    if not code:
        return ApplyDiscountResult(
            valid=False,
            code="",
            discount_percent=0.0,
            discounted_amount=original_amount,
            is_free=False,
            message="No discount code provided.",
        )

    clean_code = code.strip().upper()
    discount_info = VALID_DISCOUNT_CODES.get(clean_code)

    if not discount_info:
        return ApplyDiscountResult(
            valid=False,
            code=clean_code,
            discount_percent=0.0,
            discounted_amount=original_amount,
            is_free=False,
            message=f"Discount code '{clean_code}' is invalid or expired.",
        )

    percent = discount_info["discount_percent"]
    discounted_amount = max(0.0, original_amount * (1.0 - (percent / 100.0)))
    is_free = percent >= 100.0

    return ApplyDiscountResult(
        valid=True,
        code=clean_code,
        discount_percent=percent,
        discounted_amount=discounted_amount,
        is_free=is_free,
        message=f"Applied {clean_code}: {discount_info['description']}",
    )


async def fulfill_discount_checkout(
    db: AsyncSession,
    tenant_id: str,
    amount: float,
    currency: str,
    transaction_type: str,
    discount_code: str,
    customer_email: str,
    metadata: dict[str, Any] | None = None,
) -> CheckoutInitResult:
    """Fulfill 100% discounted invoice instantly without contacting external gateways."""
    meta = metadata or {}
    meta["discount_code"] = discount_code
    meta["customer_email"] = customer_email

    # 1. Update business entitlement
    stmt = select(Business).where(Business.id == tenant_id)
    res = await db.execute(stmt)
    business = res.scalar_one_or_none()
    if business:
        if transaction_type == "subscription":
            business.tier = "pro"
            # Refresh trial credits
            business.social_credits = max(business.social_credits, 100)
        elif transaction_type == "credits_topup":
            credits_to_add = meta.get("social_credits_purchased", 50)
            business.social_credits += credits_to_add

    # 2. Record Transaction in ledger
    ref = f"disc_{uuid.uuid4().hex[:14]}"
    txn = Transaction(
        tenant_id=tenant_id,
        amount=amount,
        currency=currency,
        status=TransactionStatus.DISCOUNTED.value,
        gateway_provider=GatewayProvider.MANUAL.value,
        gateway_reference=ref,
        transaction_type=transaction_type,
        metadata_json=meta,
        paid_at=datetime.utcnow(),
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)

    return CheckoutInitResult(
        success=True,
        checkout_url=None,
        reference=ref,
        provider="MANUAL",
        status="DISCOUNTED",
        transaction_id=str(txn.id),
        discount_applied=True,
        amount=0.0,
        currency=currency,
        message=f"100% discount code '{discount_code}' applied. Entitlements credited instantly.",
    )


async def record_pending_transaction(
    db: AsyncSession,
    tenant_id: str,
    amount: float,
    currency: str,
    provider: str,
    reference: str,
    transaction_type: str,
    metadata: dict[str, Any] | None = None,
) -> Transaction:
    """Record initial pending transaction in database ledger."""
    txn = Transaction(
        tenant_id=tenant_id,
        amount=amount,
        currency=currency,
        status=TransactionStatus.PENDING.value,
        gateway_provider=provider.upper(),
        gateway_reference=reference,
        transaction_type=transaction_type,
        metadata_json=metadata or {},
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)
    return txn


async def fulfill_successful_transaction(
    db: AsyncSession,
    event: LunaTransactionEvent,
) -> bool:
    """Fulfill business entitlements upon confirmed payment via webhook or verification."""
    # Find matching transaction by gateway reference
    stmt = select(Transaction).where(Transaction.gateway_reference == event.reference)
    res = await db.execute(stmt)
    txn = res.scalar_one_or_none()

    if not txn:
        # Fallback: create completed transaction if webhook arrived first
        tenant_id = event.metadata.get("tenant_id")
        if not tenant_id:
            logger.warning(f"Unable to fulfill transaction {event.reference}: missing tenant_id")
            return False
        txn = Transaction(
            tenant_id=tenant_id,
            amount=event.amount,
            currency=event.currency,
            status=TransactionStatus.SUCCESS.value,
            gateway_provider=event.provider.upper(),
            gateway_reference=event.reference,
            transaction_type=event.metadata.get("transaction_type", "subscription"),
            metadata_json=event.metadata,
            paid_at=datetime.utcnow(),
        )
        db.add(txn)
    else:
        if txn.status == TransactionStatus.SUCCESS.value:
            # Already fulfilled (idempotency guard)
            return True
        txn.status = TransactionStatus.SUCCESS.value
        txn.paid_at = datetime.utcnow()

    # Apply Entitlements
    t_type = txn.transaction_type
    biz_stmt = select(Business).where(Business.id == txn.tenant_id)
    biz_res = await db.execute(biz_stmt)
    business = biz_res.scalar_one_or_none()

    if business:
        if t_type == "subscription":
            business.tier = "pro"
            business.social_credits = max(business.social_credits, 100)
            logger.info(f"Tenant {business.id} upgraded to Pro tier via {event.provider}")
        elif t_type == "credits_topup":
            credits_to_add = txn.metadata_json.get("social_credits_purchased", 50) if txn.metadata_json else 50
            business.social_credits += credits_to_add
            logger.info(f"Granted {credits_to_add} SC to tenant {business.id}")

    # If linked to a queue ticket payment
    ticket_id = (txn.metadata_json or {}).get("ticket_id")
    if ticket_id:
        pay_stmt = select(Payment).where(Payment.ticket_id == ticket_id)
        pay_res = await db.execute(pay_stmt)
        payment_row = pay_res.scalar_one_or_none()
        if payment_row:
            payment_row.status = PaymentStatus.SUCCESS.value
            payment_row.paid_at = datetime.utcnow()
            payment_row.provider_reference = event.reference

    await db.commit()
    return True
