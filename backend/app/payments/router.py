"""FastAPI Router for Luna Payments & Billing Engine.

Implements:
- B2B SaaS Subscriptions & SC Top-Ups via PayPal (Hackathon Focus)
- B2B2C End-Customer Booking Split Payments via Paystack
- The "Discount Code" Engine (BETA100 100% waiver & psychological freemium)
- Universal Webhook Receiver for PayPal and Paystack
- Paystack Subaccount Management for automated tenant payouts
"""

from __future__ import annotations

from typing import Annotated, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    AuthenticatedUser,
    enforce_tenant_isolation,
    get_optional_current_user,
)
from app.models.payment import GatewayProvider, Transaction, TransactionStatus
from app.models.tenant import Business
from app.payments.adapters.paypal_adapter import PaypalAdapter
from app.payments.adapters.paystack_adapter import PaystackAdapter
from app.payments.interfaces import (
    ApplyDiscountRequest,
    ApplyDiscountResult,
    CheckoutInitRequest,
    CheckoutInitResult,
    CreateSubaccountRequest,
    CreateSubaccountResult,
    SplitCalculationResult,
    TransactionVerificationResult,
)
from app.payments.services import (
    calculate_paystack_split,
    fulfill_discount_checkout,
    fulfill_successful_transaction,
    record_pending_transaction,
    validate_discount_code,
)
from app.payments.webhook_parser import parse_vendor_webhook

router = APIRouter(prefix="/api/payments", tags=["Payments"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


def get_paypal_adapter() -> PaypalAdapter:
    return PaypalAdapter()


def get_paystack_adapter() -> PaystackAdapter:
    return PaystackAdapter()


# --- 1. Checkout Initialization & Discount Processing ---

@router.post("/checkout", response_model=CheckoutInitResult)
async def initialize_checkout(
    payload: CheckoutInitRequest,
    db: DbSession,
    paypal: PaypalAdapter = Depends(get_paypal_adapter),
    paystack: PaystackAdapter = Depends(get_paystack_adapter),
    current_user: Annotated[AuthenticatedUser | None, Depends(get_optional_current_user)] = None,
) -> CheckoutInitResult:
    """Initialize a payment checkout session.
    
    Routes:
    - B2B (subscription, credits_topup, trial_tokenization) -> PayPal Orders v2
    - B2B2C (booking_split) -> Paystack Split Payments API
    
    Discount Code Engine:
    If a 100% discount code (e.g. BETA100) is applied, the checkout gateway is
    completely bypassed, entitlements are fulfilled instantly, and the transaction
    is saved as DISCOUNTED in the ledger.
    """
    if current_user and payload.transaction_type in ("subscription", "credits_topup", "trial_tokenization"):
        enforce_tenant_isolation(payload.tenant_id, current_user)
        if not current_user.is_staff:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Staff privileges required to manage subscriptions or credits",
            )
    # 1. Verify tenant exists
    stmt = select(Business).where(Business.id == payload.tenant_id)
    res = await db.execute(stmt)
    business = res.scalar_one_or_none()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tenant '{payload.tenant_id}' not found.",
        )

    # 2. Check for Promotional Discount Code
    if payload.discount_code:
        disc = validate_discount_code(payload.discount_code, payload.amount)
        if disc.valid and disc.is_free:
            # Complete 100% waiver bypass
            return await fulfill_discount_checkout(
                db=db,
                tenant_id=payload.tenant_id,
                amount=payload.amount,
                currency=payload.currency,
                transaction_type=payload.transaction_type,
                discount_code=disc.code,
                customer_email=payload.customer_email,
                metadata=payload.metadata,
            )

    meta = dict(payload.metadata)
    meta["tenant_id"] = payload.tenant_id
    meta["transaction_type"] = payload.transaction_type
    if payload.ticket_id:
        meta["ticket_id"] = payload.ticket_id

    # 3. Route according to Transaction Type
    if payload.transaction_type == "booking_split":
        # Resolve Paystack Subaccount
        subaccount = payload.subaccount_code or business.paystack_subaccount_code
        if not subaccount:
            # Fallback simulated subaccount if business has not added bank payout yet
            subaccount = f"ACCT_sim_{business.id[:8]}"

        # Calculate exact split fees
        split_details = calculate_paystack_split(payload.amount)
        platform_fee_naira = float(split_details.luna_margin_kobo + split_details.paystack_fee_kobo) / 100.0

        init_result = await paystack.initialize_split_payment(
            amount=payload.amount,
            subaccount_code=subaccount,
            platform_fee=platform_fee_naira,
            customer_email=payload.customer_email,
            metadata=meta,
        )

        # Record pending transaction in DB
        txn = await record_pending_transaction(
            db=db,
            tenant_id=payload.tenant_id,
            amount=payload.amount,
            currency="NGN",
            provider="PAYSTACK",
            reference=init_result.reference,
            transaction_type=payload.transaction_type,
            metadata=meta,
        )
        init_result.transaction_id = str(txn.id)
        return init_result

    else:
        # B2B SaaS Subscriptions or Social Credit (SC) Top-Ups -> PayPal
        charge_amount = payload.amount
        if payload.discount_code:
            disc = validate_discount_code(payload.discount_code, payload.amount)
            if disc.valid:
                charge_amount = disc.discounted_amount
                meta["discount_code"] = disc.code
                meta["discount_percent"] = disc.discount_percent

        init_result = await paypal.initialize_subscription(
            amount=charge_amount,
            currency=payload.currency,
            customer_email=payload.customer_email,
            metadata=meta,
        )

        txn = await record_pending_transaction(
            db=db,
            tenant_id=payload.tenant_id,
            amount=charge_amount,
            currency=payload.currency,
            provider="PAYPAL",
            reference=init_result.reference,
            transaction_type=payload.transaction_type,
            metadata=meta,
        )
        init_result.transaction_id = str(txn.id)
        return init_result


@router.post("/apply-discount", response_model=ApplyDiscountResult)
async def check_discount_code(
    payload: ApplyDiscountRequest,
) -> ApplyDiscountResult:
    """Validate a promotional discount code prior to checkout."""
    return validate_discount_code(payload.code, payload.original_amount)


# --- 2. Paystack Split Calculation Preview ---

@router.get("/split-preview", response_model=SplitCalculationResult)
async def preview_split_calculation(
    amount: float = Query(gt=0, description="Target booking price in Naira"),
    custom_margin: float | None = Query(None, description="Custom platform profit margin in Naira"),
) -> SplitCalculationResult:
    """Calculate and preview Paystack Split amounts for a given booking fee."""
    return calculate_paystack_split(amount, custom_margin)


# --- 3. Verification & Return Redirection Handling ---

@router.get("/verify/{provider}/{reference}", response_model=TransactionVerificationResult)
async def verify_transaction_status(
    provider: str,
    reference: str,
    db: DbSession,
    paypal: PaypalAdapter = Depends(get_paypal_adapter),
    paystack: PaystackAdapter = Depends(get_paystack_adapter),
) -> TransactionVerificationResult:
    """Verify transaction with provider and fulfill entitlements on success."""
    provider_clean = provider.strip().lower()

    if provider_clean == "paypal":
        res = await paypal.verify_transaction(reference)
    elif provider_clean == "paystack":
        res = await paystack.verify_transaction(reference)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported verification provider: '{provider}'",
        )

    if res.status == "SUCCESS":
        from app.payments.interfaces import LunaTransactionEvent
        event = LunaTransactionEvent(
            event_type="verification.success",
            provider=provider.upper(),
            reference=reference,
            amount=res.amount,
            currency=res.currency,
            status="SUCCESS",
            raw_payload=res.gateway_response,
        )
        await fulfill_successful_transaction(db, event)

    return res


# --- 4. Unified Webhook Receiver ---

@router.post("/webhook/{provider}")
async def handle_payment_webhook(
    provider: str,
    request: Request,
    db: DbSession,
) -> dict[str, Any]:
    """Universal Webhook Endpoint for PayPal and Paystack.
    
    Verifies payload signature, normalizes into LunaTransactionEvent,
    and fulfills business entitlements (upgrades, credits, tickets).
    """
    event = await parse_vendor_webhook(provider, request)
    fulfilled = False

    if event.status == "SUCCESS":
        fulfilled = await fulfill_successful_transaction(db, event)

    return {
        "status": "received",
        "provider": event.provider,
        "event_type": event.event_type,
        "reference": event.reference,
        "fulfilled": fulfilled,
    }


# --- 5. Merchant Payout Subaccount Setup ---

@router.post("/subaccount", response_model=CreateSubaccountResult)
async def setup_payout_subaccount(
    payload: CreateSubaccountRequest,
    db: DbSession,
    paystack: PaystackAdapter = Depends(get_paystack_adapter),
    current_user: Annotated[AuthenticatedUser | None, Depends(get_optional_current_user)] = None,
) -> CreateSubaccountResult:
    """Provision a Paystack subaccount for a business tenant for split settlements."""
    if current_user:
        enforce_tenant_isolation(payload.business_id, current_user)
        if not current_user.is_tenant_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Business owner privileges required to configure payout subaccounts",
            )

    stmt = select(Business).where(Business.id == payload.business_id)
    res = await db.execute(stmt)
    business = res.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Business tenant not found.")

    sub_res = await paystack.create_subaccount(payload)
    if sub_res.success and sub_res.subaccount_code:
        business.paystack_subaccount_code = sub_res.subaccount_code
        business.payout_bank_name = payload.settlement_bank
        business.payout_account_number = payload.account_number
        business.payout_account_holder = payload.business_name
        await db.commit()

    return sub_res


# --- 6. Tenant Transactions Ledger Listing ---

class TransactionResponseItem(BaseModel):
    id: str
    tenant_id: str
    amount: float
    currency: str
    status: str
    gateway_provider: str
    gateway_reference: str | None
    transaction_type: str
    metadata_json: dict[str, Any] | None
    created_at: Any
    paid_at: Any


@router.get("/transactions", response_model=list[TransactionResponseItem])
async def list_tenant_transactions(
    business_id: str = Query(min_length=1),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: DbSession = None,
    current_user: Annotated[AuthenticatedUser | None, Depends(get_optional_current_user)] = None,
) -> list[TransactionResponseItem]:
    """List financial transactions for a tenant."""
    if current_user:
        enforce_tenant_isolation(business_id, current_user)
        if not current_user.is_staff:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Staff privileges required to view financial records",
            )

    stmt = (
        select(Transaction)
        .where(Transaction.tenant_id == business_id)
        .order_by(desc(Transaction.created_at))
        .offset(offset)
        .limit(limit)
    )
    res = await db.execute(stmt)
    items = res.scalars().all()

    return [
        TransactionResponseItem(
            id=str(t.id),
            tenant_id=t.tenant_id,
            amount=t.amount,
            currency=t.currency,
            status=t.status,
            gateway_provider=t.gateway_provider,
            gateway_reference=t.gateway_reference,
            transaction_type=t.transaction_type,
            metadata_json=t.metadata_json,
            created_at=t.created_at,
            paid_at=t.paid_at,
        )
        for t in items
    ]
