"""Monnify Gateway Adapter (Phase 2 - Bank Transfer Checkouts & T+0 Settlement)."""

from __future__ import annotations

from typing import Any
from app.payments.interfaces import (
    CheckoutInitResult,
    IPaymentGateway,
    TransactionVerificationResult,
)


class MonnifyAdapter(IPaymentGateway):
    """Phase 2 gateway: Direct dynamic virtual accounts and low-cost bank transfers."""

    async def initialize_subscription(
        self,
        amount: float,
        currency: str,
        customer_email: str,
        metadata: dict[str, Any] | None = None,
        return_url: str | None = None,
        cancel_url: str | None = None,
    ) -> CheckoutInitResult:
        raise NotImplementedError("Monnify gateway integration is scheduled for Phase 2.")

    async def initialize_split_payment(
        self,
        amount: float,
        subaccount_code: str,
        platform_fee: float,
        customer_email: str,
        metadata: dict[str, Any] | None = None,
        callback_url: str | None = None,
    ) -> CheckoutInitResult:
        raise NotImplementedError("Monnify gateway integration is scheduled for Phase 2.")

    async def verify_transaction(
        self,
        reference: str,
    ) -> TransactionVerificationResult:
        raise NotImplementedError("Monnify gateway integration is scheduled for Phase 2.")
