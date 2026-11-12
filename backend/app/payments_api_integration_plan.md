# LUNA PAYMENTS: Architectural Blueprint & Integration Plan

**Target:** Antigravity (Development Engine) / Core Engineering Team
**Project:** LUNA (B2B2C SaaS & Enterprise Platform) - `withluna.tech`
**Module:** Payments & Billing Engine (Optimized for PayPal AI Hackathon 2026)

## 1. PROJECT CONTEXT & PAYMENT STRATEGY

LUNA handles two distinct financial flows: B2B (SaaS Subscriptions) and B2B2C (End-Customer Bookings). 

**The Routing Strategy:**
*   **B2B SaaS Billing (PayPal):** To meet the requirements of the PayPal AI Hackathon and demonstrate global scalability, all B2B transactions (Social Credit purchases, card tokenization for trials, and monthly subscriptions) are routed through PayPal's HTTP API.
*   **B2B2C End-Customer Checkout (Paystack Split Payments):** Everyday consumers paying for queues/bookings on tenant subdomains will use Paystack. To avoid legislative hurdles and security liabilities of holding client funds, we will utilize **Paystack Split Payments**. Funds settle directly into the business's bank account, while LUNA automatically deducts a micro-fee (covering Paystack's transaction cost + a small platform profit) without over-escalating the final price for the consumer.

*Note on Architecture:* We strictly use raw HTTP APIs (`httpx.AsyncClient`) for all payment gateways. **No SDKs.** This ensures non-blocking FastAPI performance and prevents vendor lock-in, allowing seamless future migrations (e.g., Duplo, Monnify).

## 2. THE EVOLUTION ROADMAP

### Phase 1: The Hackathon MVP (Current Focus)

*   **B2B Gateway (PayPal):** Handles card tokenization for the 7-day trial of the Social Studio Inbox, ₦20,000/month SaaS subscriptions, and pay-as-you-go AI Social Credit (SC) top-ups.
*   **B2B2C Gateway (Paystack):** Handles end-customer bookings using the Split Payment API.
*   **The "Discount Code" Strategy (Psychological Freemium):** The Social Studio Inbox is hard-paywalled; entering card details via PayPal is mandatory to start the 7-day trial. However, beta testers are given a "100% Discount Code." This zeros out the initial trial/subscription cost and allows free SC top-ups. This keeps testers on the platform indefinitely while ingraining the psychological reality that LUNA is a high-value, paid enterprise tool, not a free utility.

### Phase 2 & 3: Scaling & Enterprise Maturity (Post-Pitch)

*   **Phase 2:** Integrate **Monnify** alongside Paystack to capture high-volume, T+0 settled bank transfers for B2B2C consumer checkouts.
*   **Phase 3:** Integrate **Duplo** for Enterprise B2B SaaS billing to leverage their B2B compliance and lower fee caps for massive multi-branch organizations.

## 3. BACKEND ARCHITECTURE: FASTAPI (HEXAGONAL PATTERN)

The backend must completely isolate core business logic from the specific payment gateways.

### Directory Structure

```text
backend/
├── app/
│   ├── payments/
│   │   ├── router.py              # API Endpoints (POST /checkout, POST /apply-discount)
│   │   ├── interfaces.py          # IPaymentGateway (The Port)
│   │   ├── adapters/              
│   │   │   ├── paypal_adapter.py  # (Raw HTTP - Hackathon Focus)
│   │   │   ├── paystack_adapter.py# (Raw HTTP - Split Payments)
│   │   │   ├── monnify_adapter.py # (Future)
│   │   │   └── duplo_adapter.py   # (Future)
│   │   ├── webhook_parser.py      # Normalizes vendor webhooks into LunaTransaction
│   │   └── services.py            # Core logic (invoices, split calcs, discount validation)
```

### Engineering Directives

**1. The Port (Abstract Base Class):**
Create `IPaymentGateway` in `interfaces.py`. It must strictly define:
*   `initialize_subscription(amount, currency, customer_email, metadata)` -> Routes to PayPal.
*   `initialize_split_payment(amount, subaccount_code, platform_fee)` -> Routes to Paystack.
*   `verify_transaction(reference)` -> Returns a normalized status (`SUCCESS`, `FAILED`, `PENDING`).

**2. The Discount Code Engine (`services.py`):**
Before initializing *any* PayPal checkout payload for SCs or subscriptions, the system must check for an applied `discount_code`. 
*   If `code == "BETA100"`, the backend flags the invoice as `DISCOUNT_PAID`, credits the SCs to the tenant, and bypasses the PayPal initialization entirely. 
*   This keeps the payment gateway code clean while allowing marketing to arbitrarily waive fees for early adopters.

**3. Paystack Split Calculation Logic:**
LUNA's platform fee on bookings must be calculated dynamically before sending the payload to Paystack.
*   *Formula:* `Target Business Revenue + Paystack Fee (1.5% + ₦100) + LUNA Margin = Final Customer Price.` 
*   *Goal:* Keep the LUNA Margin low enough that the final price does not deter the end-customer from booking.

**4. The Unified Webhook Normalizer:**
*   Expose a single endpoint: `POST /api/v1/payments/webhook/{provider}`.
*   `webhook_parser.py` validates the signature, extracts the exact amount, currency, and internal LUNA reference, and translates it into a standard `LunaTransactionEvent`.
*   This triggers `services.py` to credit the user's SC balance or mark a customer's queue ticket as `PAID`.

## 4. DATABASE SCHEMA (AVOIDING DATA LOCK-IN)

Do not use provider-specific column names in your core tables.

**Table: `transactions`**
*   `id` (UUID, Primary Key)
*   `tenant_id` (Foreign Key)
*   `amount` (Decimal)
*   `currency` (String)
*   `status` (Enum: PENDING, SUCCESS, FAILED, DISCOUNTED)
*   `gateway_provider` (String: e.g., "PAYPAL", "PAYSTACK")
*   `gateway_reference` (String: The provider's unique ID for verification)
*   `metadata` (JSONB: Details like `{"social_credits_purchased": 50, "discount_code": "BETA100"}`)
