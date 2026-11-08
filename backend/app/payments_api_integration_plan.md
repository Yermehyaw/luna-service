# LUNA PAYMENTS: Architectural Blueprint & Integration Plan

**Target:** Antigravity (Development Engine) / Core Engineering Team
**Project:** LUNA (B2B2C SaaS & Enterprise Platform) - `withluna.tech`
**Module:** Payments & Billing Engine

## 1. PROJECT CONTEXT & PAYMENT STRATEGY

LUNA handles two distinct financial flows:
1. **B2B SaaS Billing:** Businesses paying their ₦20,000/month subscriptions or buying Social Credits (SC) to use LUNA.
2. **B2B2C End-Customer Checkout:** Everyday customers paying the businesses (e.g., booking fees, queue reservations) via LUNA's tenant portals.

**The Routing Challenge:** 
To win upcoming startup pitch competitions, the MVP must demonstrate global and local readiness using **PayPal** and **Paystack**. However, the long-term enterprise vision requires transitioning to **Duplo** (for optimized B2B compliance and high-value routing) and **Monnify** (for superior B2B2C local bank transfers). 

**The Solution:**
We will implement the **Strategy Pattern (Hexagonal Architecture)** in the backend. By building a unified Payment Gateway Interface, we prevent vendor lock-in. LUNA will never hardcode "Paystack" into a checkout button; instead, it will ask the backend for a "payment initialization payload," allowing us to hot-swap providers via environment variables and database flags.

---

## 2. THE THREE-PHASE ROADMAP

### Phase 1: The Pitch Competition MVP (Current)
*   **Gateways:** Paystack (Africa/Local) & PayPal (Global).
*   **Implementation:** Build adapters for both. Use Paystack for the ₦20,000 SaaS subscription (recurring billing) and SC top-ups. Use PayPal to demonstrate global scalability to competition judges.
*   **Goal:** Secure funding and validate the business model.

### Phase 2: The B2B2C Scaling (Post-Pitch)
*   **Gateway:** Add Monnify.
*   **Implementation:** Build `monnify_adapter.py`. Route all end-customer payments (everyday consumers paying for queues/bookings on tenant subdomains) through Monnify to leverage their robust bank-transfer network and T+0 settlement.

### Phase 3: Enterprise Compliance & High-Value B2B (Maturity)
*   **Gateway:** Add Duplo.
*   **Implementation:** Build `duplo_adapter.py`. Route the ₦20,000 SaaS subscriptions of enterprise clients (e.g., banks, logistics firms) through Duplo to benefit from their B2B compliance tools and lower fee caps.

---

## 3. BACKEND ARCHITECTURE: FASTAPI (HEXAGONAL PATTERN)

The backend must completely isolate core business logic from the specific payment gateways.

### Directory Structure
```text
backend/
├── app/
│   ├── payments/
│   │   ├── router.py              # API Endpoints (POST /checkout, POST /webhooks)
│   │   ├── interfaces.py          # IPaymentGateway (The Port)
│   │   ├── adapters/              
│   │   │   ├── paystack_adapter.py
│   │   │   ├── paypal_adapter.py
│   │   │   ├── monnify_adapter.py # (Future)
│   │   │   └── duplo_adapter.py   # (Future)
│   │   ├── webhook_parser.py      # Normalizes vendor webhooks into LunaTransaction
│   │   └── services.py            # Core logic (creating invoices, applying credits)
```

### Engineering Directives

**1. The Port (Abstract Base Class):**
Create `IPaymentGateway` in `interfaces.py`. It must strictly define:
*   `initialize_transaction(amount, currency, customer_email, metadata)` -> Returns a standardized checkout URL and internal transaction reference.
*   `verify_transaction(reference)` -> Returns a normalized status (`SUCCESS`, `FAILED`, `PENDING`).
*   `create_subscription(plan_id, customer_id)` -> Returns subscription mandate.

**2. Dynamic Dependency Injection (`Depends()`):**
In `router.py`, the checkout endpoint must not know which gateway it is using.
```python
# Pseudo-code logic for injection
def get_payment_gateway(tenant_id: str, flow_type: str):
    if flow_type == "B2B_SUBSCRIPTION" and is_enterprise(tenant_id):
        return DuploAdapter() # Phase 3
    elif flow_type == "B2B_SUBSCRIPTION":
        return PaystackAdapter()
    elif flow_type == "B2B2C_CHECKOUT":
        return MonnifyAdapter() # Phase 2 (or Paystack for MVP)
    elif flow_type == "GLOBAL_CHECKOUT":
        return PayPalAdapter()
```

**3. The Unified Webhook Normalizer:**
Payment gateways send wildly different webhook payloads. 
*   Expose a single endpoint: `POST /api/v1/payments/webhook/{provider}`.
*   `webhook_parser.py` validates the signature based on the provider, extracts the exact amount paid, the currency, and the internal LUNA reference, and translates it into a standard `LunaTransactionEvent`.
*   This triggers the `services.py` to credit the user's SC balance or unlock the Social Studio Inbox.

---

## 4. FRONTEND STRATEGY (NEXT.JS)

The Next.js frontend must remain "dumb" regarding payment providers to avoid lock-in.

*   **Agnostic Checkout Buttons:** The UI simply renders "Pay ₦20,000" or "Buy SC Credits".
*   **The API Handshake:** Clicking the button sends a request to FastAPI `POST /payments/initialize`.
*   **The Redirect:** FastAPI returns a payload like `{ "checkout_url": "https://checkout.paystack.com/..." }`. The Next.js frontend simply redirects the user to `checkout_url`.
*   **UI Resilience:** When the backend swaps Paystack for Duplo in Phase 3, the frontend code requires zero changes because it relies entirely on the URL returned by the backend.

---

## 5. DATABASE SCHEMA (AVOIDING DATA LOCK-IN)

Do not use provider-specific column names (like `paystack_reference`) in your main database tables. 

**Table: `transactions`**
*   `id` (UUID, Primary Key)
*   `tenant_id` (Foreign Key)
*   `amount` (Decimal)
*   `currency` (String)
*   `status` (Enum: PENDING, SUCCESS, FAILED)
*   `gateway_provider` (String: e.g., "PAYSTACK", "DUPLO", "MONNIFY")
*   `gateway_reference` (String: The provider's unique ID for verification)
*   `internal_reference` (String: LUNA's generated ID passed in the metadata)
*   `metadata` (JSONB: Details like `{"social_credits_purchased": 50}`)

By isolating the gateway name in a generic string column, querying revenue or verifying historical transactions remains unified regardless of how many APIs you integrate.