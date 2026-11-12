"""Payment Gateway Adapters."""

from app.payments.adapters.paypal_adapter import PaypalAdapter
from app.payments.adapters.paystack_adapter import PaystackAdapter
from app.payments.adapters.monnify_adapter import MonnifyAdapter
from app.payments.adapters.duplo_adapter import DuploAdapter

__all__ = [
    "PaypalAdapter",
    "PaystackAdapter",
    "MonnifyAdapter",
    "DuploAdapter",
]
