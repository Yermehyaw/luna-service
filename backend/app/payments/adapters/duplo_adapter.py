"""Duplo Gateway Adapter (Phase 3 - B2B SaaS Enterprise Invoicing & Compliance)."""

from __future__ import annotations

from typing import Any
from app.payments.interfaces import (
    CheckoutInitResult,
    IPaymentGateway,
    TransactionVerificationResult,
)


class DuploAdapter(IPaymentGateway):
    """Phase 3 gateway: Automated enterprise invoicing and low-fee corporate transfers."""

    async def initialize_subscription(
        self,
        amount: float,
        currency: str,
        customer_email: str,
        metadata: dict[str, Any] | None = None,
        return_url: str | None = None,
        cancel_url: str | None = None,
    ) -> CheckoutInitResult:
        raise NotImplementedError("Duplo gateway integration is scheduled for Phase 3.")

    async def initialize_split_payment(
        self,
        amount: float,
        subaccount_code: str,
        platform_fee: float,
        customer_email: str,
        metadata: dict[str, Any] | None = None,
        callback_url: str | None = None,
    ) -> CheckoutInitResult:
        raise NotImplementedError("Duplo gateway integration is scheduled for Phase 3.")

    async def verify_transaction(
        self,
        reference: str,
    ) -> TransactionVerificationResult:
        raise NotImplementedError("Duplo gateway integration is scheduled for Phase 3.")
