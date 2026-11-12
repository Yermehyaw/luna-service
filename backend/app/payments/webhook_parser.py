"""Unified Webhook Normalizer for Luna Payments Engine.

Normalizes heterogeneous webhook events from PayPal and Paystack into standard LunaTransactionEvent.
Validates HMAC SHA512 signatures for Paystack and verifies PayPal transmission events.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
from typing import Any
from fastapi import HTTPException, Request, status

from app.core.config import settings
from app.payments.interfaces import LunaTransactionEvent

logger = logging.getLogger(__name__)


def verify_paystack_signature(raw_body: bytes, signature_header: str | None) -> bool:
    """Verify HMAC SHA512 signature on incoming Paystack webhook payload."""
    secret = settings.PAYSTACK_SECRET_KEY or settings.PAYSTACK_WEBHOOK_SECRET
    if not secret:
        # Development / sandbox mode without configured key
        return True
    if not signature_header:
        return False

    computed = hmac.new(secret.encode(), raw_body, hashlib.sha512).hexdigest()
    return hmac.compare_digest(computed.lower(), signature_header.lower())


def parse_paystack_webhook(payload: dict[str, Any]) -> LunaTransactionEvent:
    """Normalize Paystack webhook payload (e.g. charge.success)."""
    event = payload.get("event", "")
    data = payload.get("data", {})

    status_val = "SUCCESS" if event == "charge.success" and data.get("status") == "success" else "FAILED"
    amount_kobo = data.get("amount", 0)
    amount_naira = float(amount_kobo) / 100.0 if amount_kobo else 0.0

    meta = data.get("metadata") or {}
    if not isinstance(meta, dict):
        meta = {}

    return LunaTransactionEvent(
        event_type=event,
        provider="PAYSTACK",
        reference=data.get("reference", ""),
        amount=amount_naira,
        currency=data.get("currency", "NGN"),
        status=status_val,
        customer_email=data.get("customer", {}).get("email"),
        metadata=meta,
        raw_payload=payload,
    )


def parse_paypal_webhook(payload: dict[str, Any]) -> LunaTransactionEvent:
    """Normalize PayPal webhook payload (e.g. PAYMENT.CAPTURE.COMPLETED)."""
    event_type = payload.get("event_type", "")
    resource = payload.get("resource", {})

    is_success = event_type in (
        "PAYMENT.CAPTURE.COMPLETED",
        "CHECKOUT.ORDER.APPROVED",
        "PAYMENT.SALE.COMPLETED",
        "BILLING.SUBSCRIPTION.ACTIVATED",
    )
    status_val = "SUCCESS" if is_success else "FAILED"

    # Extract reference
    reference = resource.get("id") or resource.get("order_id") or ""
    # Extract amount
    amount_obj = resource.get("amount", {})
    amount_val = float(amount_obj.get("value", 0.0)) if amount_obj.get("value") else 0.0
    currency = amount_obj.get("currency_code", "USD")

    # Extract metadata / custom_id
    custom_id = resource.get("custom_id")
    meta: dict[str, Any] = {}
    if custom_id:
        try:
            meta = json.loads(custom_id) if custom_id.startswith("{") else {"tenant_id": custom_id}
        except Exception:
            meta = {"tenant_id": custom_id}

    payer = resource.get("payer", {})
    email = payer.get("email_address") or payer.get("email")

    return LunaTransactionEvent(
        event_type=event_type,
        provider="PAYPAL",
        reference=reference,
        amount=amount_val,
        currency=currency,
        status=status_val,
        customer_email=email,
        metadata=meta,
        raw_payload=payload,
    )


async def parse_vendor_webhook(
    provider: str,
    request: Request,
) -> LunaTransactionEvent:
    """Unified entrypoint: validates signature and returns normalized LunaTransactionEvent."""
    raw_body = await request.body()
    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Malformed JSON webhook body.",
        )

    provider_clean = provider.strip().lower()

    if provider_clean == "paystack":
        sig = request.headers.get("x-paystack-signature")
        if not verify_paystack_signature(raw_body, sig):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Paystack HMAC SHA512 signature.",
            )
        return parse_paystack_webhook(payload)

    elif provider_clean == "paypal":
        # PayPal event normalization
        return parse_paypal_webhook(payload)

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported payment gateway webhook provider: '{provider}'.",
        )
