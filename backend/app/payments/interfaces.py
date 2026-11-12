"""Interfaces and Domain Contracts for Luna Payments Engine.

Strict Hexagonal Architecture:
- Defines the IPaymentGateway port for B2B (PayPal) and B2B2C (Paystack Split).
- Normalizes gateway checkout initializations, status verifications, and webhooks.
- Disallows vendor SDK imports in core domain interfaces.
"""

from __future__ import annotations

import abc
from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


class CheckoutInitRequest(BaseModel):
    """Payload to initiate a transaction checkout session."""

    tenant_id: str = Field(min_length=1)
    amount: float = Field(gt=0)
    currency: str = Field(default="NGN", min_length=3, max_length=3)
    transaction_type: str = Field(
        default="subscription",
        description="subscription | credits_topup | booking_split | trial_tokenization",
    )
    customer_email: str = Field(min_length=3)
    customer_name: str | None = None
    discount_code: str | None = None
    subaccount_code: str | None = None  # Paystack Split subaccount for merchant
    ticket_id: str | None = None  # Queue ticket reference when booking
    metadata: dict[str, Any] = Field(default_factory=dict)


class CheckoutInitResult(BaseModel):
    """Normalized response from payment initialization."""

    success: bool
    checkout_url: str | None = None
    reference: str
    provider: str  # PAYPAL | PAYSTACK | MANUAL
    status: str  # PENDING | SUCCESS | DISCOUNTED | FAILED
    transaction_id: str | None = None
    discount_applied: bool = False
    amount: float
    currency: str
    message: str | None = None


class TransactionVerificationResult(BaseModel):
    """Normalized response from payment verification."""

    status: str  # SUCCESS | FAILED | PENDING
    reference: str
    amount: float
    currency: str
    paid_at: datetime | None = None
    gateway_response: dict[str, Any] = Field(default_factory=dict)


class LunaTransactionEvent(BaseModel):
    """Standardized event emitted by webhook parsers."""

    event_type: str
    provider: str  # PAYPAL | PAYSTACK
    reference: str
    amount: float
    currency: str
    status: str  # SUCCESS | FAILED | PENDING
    customer_email: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    raw_payload: dict[str, Any] = Field(default_factory=dict)


class ApplyDiscountRequest(BaseModel):
    """Request to evaluate and validate a promotional discount code."""

    code: str = Field(min_length=1)
    transaction_type: str = Field(default="subscription")
    original_amount: float = Field(ge=0)


class ApplyDiscountResult(BaseModel):
    """Result of discount code validation."""

    valid: bool
    code: str
    discount_percent: float
    discounted_amount: float
    is_free: bool
    message: str


class SplitCalculationResult(BaseModel):
    """Details of B2B2C customer checkout split breakdown."""

    target_revenue_kobo: int
    paystack_fee_kobo: int
    luna_margin_kobo: int
    total_customer_charge_kobo: int
    subaccount_settlement_kobo: int
    currency: str = "NGN"


class CreateSubaccountRequest(BaseModel):
    """Request to create a vendor subaccount for split settlements."""

    business_id: str = Field(min_length=1)
    business_name: str = Field(min_length=1)
    settlement_bank: str = Field(min_length=2, description="Bank code e.g. 058")
    account_number: str = Field(min_length=10, max_length=10)
    percentage_charge: float = Field(default=0.0, ge=0.0, le=100.0)


class CreateSubaccountResult(BaseModel):
    """Result of subaccount creation."""

    success: bool
    subaccount_code: str | None = None
    message: str


class IPaymentGateway(abc.ABC):
    """Abstract Port for payment providers in Luna hexagonal architecture.
    
    Strictly implemented using raw HTTP clients (httpx.AsyncClient) without vendor SDKs.
    """

    @abc.abstractmethod
    async def initialize_subscription(
        self,
        amount: float,
        currency: str,
        customer_email: str,
        metadata: dict[str, Any] | None = None,
        return_url: str | None = None,
        cancel_url: str | None = None,
    ) -> CheckoutInitResult:
        """Initialize B2B SaaS billing or SC top-up (PayPal)."""
        pass

    @abc.abstractmethod
    async def initialize_split_payment(
        self,
        amount: float,
        subaccount_code: str,
        platform_fee: float,
        customer_email: str,
        metadata: dict[str, Any] | None = None,
        callback_url: str | None = None,
    ) -> CheckoutInitResult:
        """Initialize B2B2C customer booking with automated split payout (Paystack)."""
        pass

    @abc.abstractmethod
    async def verify_transaction(
        self,
        reference: str,
    ) -> TransactionVerificationResult:
        """Verify transaction status from provider gateway."""
        pass
