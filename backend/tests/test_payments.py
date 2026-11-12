"""Unit and integration tests for Luna Payments & Billing Engine.

Verifies:
- Paystack Split Payments calculation logic (Revenue + Fee + Margin = Final Price).
- Discount Code Engine (BETA100 100% waiver, entitlement instant fulfillment).
- PayPal Adapter (B2B SaaS subscription & SC top-up checkout flows).
- Paystack Adapter (B2B2C Booking split payment initialization & subaccount setup).
- Unified Webhook Normalizer (HMAC-SHA512 verification & standard event mapping).
- Fast, non-blocking raw HTTP execution without vendor SDKs.
"""

import hashlib
import hmac
import json
import uuid
import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.core.config import settings
from app.models.payment import GatewayProvider, Transaction, TransactionStatus
from app.models.tenant import Business
from app.payments.adapters.paypal_adapter import PaypalAdapter
from app.payments.adapters.paystack_adapter import PaystackAdapter
from app.payments.interfaces import (
    ApplyDiscountRequest,
    CheckoutInitRequest,
    CreateSubaccountRequest,
    LunaTransactionEvent,
)
from app.payments.services import (
    calculate_paystack_split,
    fulfill_discount_checkout,
    fulfill_successful_transaction,
    validate_discount_code,
)
from app.payments.webhook_parser import (
    parse_paypal_webhook,
    parse_paystack_webhook,
    verify_paystack_signature,
)


# --- 1. Paystack Split Calculation Tests ---

def test_split_calculation_small_amount():
    """For amounts < ₦2,500, Paystack waives the flat ₦100 fee."""
    target_revenue = 1500.0  # ₦1,500
    res = calculate_paystack_split(target_revenue)

    assert res.target_revenue_kobo == 150000
    assert res.subaccount_settlement_kobo == 150000
    assert res.currency == "NGN"
    # Gross price should be higher than target revenue + margin
    assert res.total_customer_charge_kobo > res.target_revenue_kobo
    assert res.luna_margin_kobo > 0
    assert res.paystack_fee_kobo > 0


def test_split_calculation_normal_amount():
    """For amounts >= ₦2,500, Paystack charges 1.5% + ₦100."""
    target_revenue = 10000.0  # ₦10,000
    res = calculate_paystack_split(target_revenue)

    assert res.target_revenue_kobo == 1000000
    assert res.subaccount_settlement_kobo == 1000000
    # Customer charge covers target + fee + margin
    gross_naira = res.total_customer_charge_kobo / 100.0
    expected_fee_approx = (gross_naira * 0.015) + 100.0
    assert abs((res.paystack_fee_kobo / 100.0) - expected_fee_approx) < 2.0


def test_split_calculation_capped_fee():
    """For large amounts, Paystack fee is capped at ₦2,000."""
    target_revenue = 250000.0  # ₦250,000
    res = calculate_paystack_split(target_revenue)

    assert res.paystack_fee_kobo == 200000  # exactly ₦2,000 in kobo


def test_split_calculation_invalid_amount():
    with pytest.raises(ValueError):
        calculate_paystack_split(0.0)
    with pytest.raises(ValueError):
        calculate_paystack_split(-50.0)


# --- 2. Discount Code Engine Tests ---

def test_discount_code_beta100_waiver():
    """BETA100 gives 100% waiver and is_free flag."""
    res = validate_discount_code("BETA100", original_amount=20000.0)
    assert res.valid is True
    assert res.code == "BETA100"
    assert res.discount_percent == 100.0
    assert res.discounted_amount == 0.0
    assert res.is_free is True
    assert "100%" in res.message


def test_discount_code_case_insensitive():
    res = validate_discount_code("beta100", original_amount=5000.0)
    assert res.valid is True
    assert res.is_free is True


def test_discount_code_invalid():
    res = validate_discount_code("INVALID_CODE", original_amount=1000.0)
    assert res.valid is False
    assert res.is_free is False
    assert res.discounted_amount == 1000.0


# --- 3. Database Mocking & Discount Fulfillment Tests ---

class MockDbResult:
    def __init__(self, item):
        self.item = item

    def scalar_one_or_none(self):
        return self.item


class MockAsyncDbSession:
    def __init__(self, business: Business):
        self.business = business
        self.added = []
        self.committed = False

    async def execute(self, query):
        return MockDbResult(self.business)

    def add(self, obj):
        self.added.append(obj)

    async def commit(self):
        self.committed = True

    async def refresh(self, obj):
        if not getattr(obj, "id", None):
            obj.id = str(uuid.uuid4())


@pytest.mark.asyncio
async def test_fulfill_discount_subscription_upgrades_tier():
    biz = Business(
        name="Lekki Hair Lounge",
        subdomain="lekki-hair",
        tier="free",
        social_credits=50,
    )
    db = MockAsyncDbSession(biz)

    init_res = await fulfill_discount_checkout(
        db=db,
        tenant_id=str(biz.id),
        amount=20000.0,
        currency="NGN",
        transaction_type="subscription",
        discount_code="BETA100",
        customer_email="owner@lekki.com",
    )

    assert init_res.success is True
    assert init_res.status == "DISCOUNTED"
    assert init_res.discount_applied is True
    assert init_res.amount == 0.0
    assert init_res.checkout_url is None
    # Verify business upgraded
    assert biz.tier == "pro"
    assert biz.social_credits >= 100
    assert db.committed is True
    assert len(db.added) == 1
    txn = db.added[0]
    assert txn.status == "DISCOUNTED"


@pytest.mark.asyncio
async def test_fulfill_discount_credits_topup():
    biz = Business(
        name="AutoBay Victoria",
        subdomain="autobay-vi",
        tier="basic",
        social_credits=20,
    )
    db = MockAsyncDbSession(biz)

    init_res = await fulfill_discount_checkout(
        db=db,
        tenant_id=str(biz.id),
        amount=5000.0,
        currency="NGN",
        transaction_type="credits_topup",
        discount_code="BETA100",
        customer_email="manager@autobay.com",
        metadata={"social_credits_purchased": 50},
    )

    assert init_res.success is True
    assert biz.social_credits == 70  # 20 + 50
    assert db.committed is True


# --- 4. PayPal Adapter Tests (Raw HTTP / Simulation) ---

@pytest.mark.asyncio
async def test_paypal_adapter_initialization_and_verification():
    adapter = PaypalAdapter(client_id=None, client_secret=None)

    # 1. B2B Subscription Checkout Init
    init_res = await adapter.initialize_subscription(
        amount=20.0,
        currency="USD",
        customer_email="b2b@company.com",
        metadata={"tenant_id": "tenant-123", "transaction_type": "subscription"},
    )
    assert init_res.success is True
    assert init_res.provider == "PAYPAL"
    assert "paypal.com" in (init_res.checkout_url or "")
    assert init_res.status == "PENDING"

    # 2. Split payment should raise NotImplementedError
    with pytest.raises(NotImplementedError):
        await adapter.initialize_split_payment(
            amount=5000.0,
            subaccount_code="ACCT_123",
            platform_fee=200.0,
            customer_email="cust@email.com",
        )

    # 3. Verify transaction
    verif = await adapter.verify_transaction(init_res.reference)
    assert verif.status == "SUCCESS"
    assert verif.reference == init_res.reference


# --- 5. Paystack Adapter Tests (Raw HTTP / Simulation) ---

@pytest.mark.asyncio
async def test_paystack_adapter_split_and_subaccount():
    adapter = PaystackAdapter(secret_key=None)

    # 1. Subaccount Creation
    sub_req = CreateSubaccountRequest(
        business_id="biz-456",
        business_name="Apex Dental Clinic",
        settlement_bank="058",  # GTBank
        account_number="0123456789",
    )
    sub_res = await adapter.create_subaccount(sub_req)
    assert sub_res.success is True
    assert sub_res.subaccount_code is not None
    assert "ACCT_" in sub_res.subaccount_code

    # 2. Split Payment Checkout Init
    init_res = await adapter.initialize_split_payment(
        amount=7500.0,
        subaccount_code=sub_res.subaccount_code,
        platform_fee=250.0,
        customer_email="patient@health.ng",
        metadata={"tenant_id": "biz-456", "ticket_id": "tkt-789"},
    )
    assert init_res.success is True
    assert init_res.provider == "PAYSTACK"
    assert "paystack.com" in (init_res.checkout_url or "")
    assert init_res.amount == 7500.0

    # 3. Verify Transaction
    verif = await adapter.verify_transaction(init_res.reference)
    assert verif.status == "SUCCESS"
    assert verif.currency == "NGN"


# --- 6. Webhook Normalization & Signature Verification Tests ---

def test_paystack_webhook_parser():
    payload = {
        "event": "charge.success",
        "data": {
            "id": 998811,
            "reference": "pstk_ref_101",
            "amount": 500000,  # ₦5,000 in kobo
            "currency": "NGN",
            "status": "success",
            "customer": {"email": "customer@lagos.com"},
            "metadata": {"tenant_id": "tenant-99", "ticket_id": "tkt-01"},
        },
    }
    event = parse_paystack_webhook(payload)
    assert isinstance(event, LunaTransactionEvent)
    assert event.provider == "PAYSTACK"
    assert event.status == "SUCCESS"
    assert event.amount == 5000.0
    assert event.currency == "NGN"
    assert event.reference == "pstk_ref_101"
    assert event.customer_email == "customer@lagos.com"
    assert event.metadata["tenant_id"] == "tenant-99"


def test_paypal_webhook_parser():
    payload = {
        "event_type": "PAYMENT.CAPTURE.COMPLETED",
        "resource": {
            "id": "CAPTURE-776655",
            "status": "COMPLETED",
            "amount": {"value": "20.00", "currency_code": "USD"},
            "custom_id": json.dumps({"tenant_id": "tenant-88", "transaction_type": "subscription"}),
            "payer": {"email_address": "buyer@paypal.com"},
        },
    }
    event = parse_paypal_webhook(payload)
    assert isinstance(event, LunaTransactionEvent)
    assert event.provider == "PAYPAL"
    assert event.status == "SUCCESS"
    assert event.amount == 20.0
    assert event.currency == "USD"
    assert event.reference == "CAPTURE-776655"
    assert event.metadata["tenant_id"] == "tenant-88"


def test_paystack_hmac_sha512_signature_verification():
    raw_body = b'{"event":"charge.success","data":{"id":123}}'
    secret = "sk_test_luna_secret_key"
    correct_sig = hmac.new(secret.encode(), raw_body, hashlib.sha512).hexdigest()

    # Inject secret temporarily into settings
    original = settings.PAYSTACK_SECRET_KEY
    try:
        settings.PAYSTACK_SECRET_KEY = secret
        assert verify_paystack_signature(raw_body, correct_sig) is True
        assert verify_paystack_signature(raw_body, "tampered_signature") is False
        assert verify_paystack_signature(raw_body, None) is False
    finally:
        settings.PAYSTACK_SECRET_KEY = original


# --- 7. Router Endpoints Integration Tests ---

@pytest.mark.asyncio
async def test_router_checkout_discount_waiver():
    from app.payments.router import initialize_checkout

    biz = Business(
        name="Kemi Salon",
        subdomain="kemi-salon",
        tier="free",
        social_credits=50,
    )
    db = MockAsyncDbSession(biz)
    paypal = PaypalAdapter()
    paystack = PaystackAdapter()

    req = CheckoutInitRequest(
        tenant_id=str(biz.id),
        amount=20000.0,
        currency="NGN",
        transaction_type="subscription",
        customer_email="kemi@salon.ng",
        discount_code="BETA100",
    )

    res = await initialize_checkout(req, db=db, paypal=paypal, paystack=paystack)
    assert res.success is True
    assert res.status == "DISCOUNTED"
    assert res.discount_applied is True
    assert res.amount == 0.0
    assert biz.tier == "pro"


@pytest.mark.asyncio
async def test_router_checkout_booking_split():
    from app.payments.router import initialize_checkout

    biz = Business(
        name="QuickFix Motors",
        subdomain="quickfix-motors",
        tier="basic",
        social_credits=50,
        paystack_subaccount_code="ACCT_qfix_99",
    )
    db = MockAsyncDbSession(biz)
    paypal = PaypalAdapter()
    paystack = PaystackAdapter()

    req = CheckoutInitRequest(
        tenant_id=str(biz.id),
        amount=8000.0,
        currency="NGN",
        transaction_type="booking_split",
        customer_email="driver@lagos.com",
        ticket_id="ticket-auto-1",
    )

    res = await initialize_checkout(req, db=db, paypal=paypal, paystack=paystack)
    assert res.success is True
    assert res.provider == "PAYSTACK"
    assert res.status == "PENDING"
    assert res.checkout_url is not None
    assert "paystack.com" in res.checkout_url
