# LUNA SOCIAL STUDIO: Architectural Blueprint & Build Prompt

**Target:** Antigravity (Development Engine) / Core Engineering Team
**Project:** LUNA (B2B2C SaaS & Enterprise Platform) - `withluna.tech`
**Module:** Social Studio (V1.0 - Freemium to Enterprise)



## 1. PROJECT CONTEXT & OVERARCHING STRATEGY

LUNA is a multi-tenant platform operating on a Next.js (Frontend/PWA) and FastAPI (Backend) stack. The Social Studio module brings scheduling, analytics, and a unified inbox to African businesses.

To overcome initial capital constraints and Meta/TikTok App Review blockers, this system utilizes a **Zero-Cost MVP Strategy**:

* **Publishing:** Executed entirely via a Progressive Web App (PWA) "Reminder Mode". Zero API calls are made for publishing to bypass platform restrictions.

* **Inbox & Analytics:** Handled by wrapping the free tiers of four third-party APIs (**SocialAPI.ai, Postproxy, Zernio, and PlanVortex**).

* **Strict HTTP Rule:** You must **strictly use raw HTTP APIs** (`httpx.AsyncClient`) for all third-party integrations. **DO NOT use official vendor SDKs.** This ensures maximum asynchronous performance, prevents vendor data-model bleed, and allows seamless hot-swapping to native Meta/TikTok Graph APIs in the future.



## 2. TENANT ROUTING MATRIX & EVOLUTION ROADMAP

The backend must be architected to dynamically route tenants using the Hexagonal (Ports & Adapters) Architecture.

### Phase 1: The Zero-Cost MVP (Current Focus)

We arbitrage free tiers using a strict priority waterfall for onboarding new trial clients:

1. **Priority 1 (SocialAPI.ai):** The first 2 clients are assigned here.

2. **Priority 2 (Postproxy):** The next 2 clients are routed here to maximize its capacity.

3. **Priority 3 (Backup Overflow):** Any additional clients testing the app are routed to Zernio (max 2 accounts per client) and PlanVortex (max 2 accounts per client) to provide up to 4 connected accounts.


### Phase 2: The Funded 3rd-Party Scaling

* **Trigger:** Users convert to paid Basic tiers, generating revenue.

* **Action:** Consolidate API routing to paid tiers on the primary utilities (SocialAPI or Postproxy).

* **Engineering:** Zero frontend rewrites. Simply update the `active_social_provider` flag in PostgreSQL for the tenant.


### Phase 3: The Independent Native API

* **Trigger:** LUNA passes official Meta and TikTok App Reviews.

* **Action:** Generate native App Secrets. Swap out third-party adapters for `native_meta_adapter.py`.



## 3. BUSINESS MODEL, TIERS & FEATURE GATING

LUNA operates on a four-tier architecture: **Free**, **Basic**, **Pro**, and **Enterprise**. The MVP relies on a strict freemium model governed by a **Social Credit (SC)** billing engine.

### The Trial & Billing Flow

* **Sign-Up (Free Tier):** Content ideas, post scheduling/calendar, and social analytics are available immediately. The Unified Inbox is strictly **locked**.

*   **The 7-Day Trial:** To unlock the Inbox, the client must enter Credit/Debit Card details upfront or enter a valid promo code. This triggers the free trial on the Basic tier, limited to a maximum of **50 Social Credits (SC)**. More free SC credits can be obtained either by pay-as-you-go, upgrading to paid plan or a 100% discount with a valid promo code.

* **Conversion:** At the end of the 7-day trial, the system auto-bills **₦20,000/month** to lock them into the **Basic** plan.

* **Pay-As-You-Go (PAYG):** If a user depletes their SC balance, they are prompted to purchase additional credit top-ups. (Future AI agents are paywalled behind higher tiers).


### The Social Credit (SC) Economy Rules

1. **AI Content Generation:** Every prompt/generation of a content idea **consumes SC**.

2. **Outbound Interactions:** Sending a DM reply or commenting **consumes SC**.

3. **Inbound Fetching (FREE):** Fetching, reading, and ingesting DMs, comments, and Analytics data is **completely free and consumes 0 SC**.



## 4. BACKEND ARCHITECTURE: FASTAPI (HEXAGONAL PATTERN)

Note: AI models are hosted in a separate, dedicated external environment. This FastAPI service handles routing and business logic only.

### Directory Structure

```
backend/
├── app/
│   ├── core/                      # Billing engine, DB sessions, Redis clients
│   ├── social_studio/
│   │   ├── router.py              # API Endpoints (e.g., POST /schedule, GET /inbox)
│   │   ├── interfaces.py          # The Ports (Abstract Base Classes)
│   │   ├── adapters/              
│   │   │   ├── socialapi_adapter.py    
│   │   │   ├── postproxy_adapter.py   
│   │   │   ├── zernio_adapter.py      
│   │   │   ├── planvortex_adapter.py      
│   │   │   └── reminder_mode.py   # PWA push notification scheduler
│   │   ├── webhook_parser.py      # Normalizes vendor webhooks into LunaMessage schema
│   │   └── credit_manager.py      # Middleware validating Social Credits (SC)

```

### Engineering Directives:

1. **The Interface (Port):** Define `ISocialProvider` in `interfaces.py`. It must mandate methods for `fetch_analytics()`, `send_dm_reply()`, and `get_inbox()`.

2. **Credit Validation Middleware:** `credit_manager.py` MUST intercept outbound actions (Replies, AI Generation). If `tenant.social_credits < 1`, return a `402 Payment Required` exception.

3. **Dependency Injection (`Depends()`):** Build a resolver that checks the tenant's `active_social_provider` in the DB and injects the correct adapter based on the Priority Routing logic established during their onboarding.

4. **Asynchronous Networking:** All adapters must use `httpx.AsyncClient`. Do not use `requests` or official SDKs.

5. **Webhook Normalization:** `webhook_parser.py` exposes a single endpoint to receive DMs from all 4 providers. It identifies the origin, translates it to a `LunaMessage` model, saves to DB, and pushes to Redis WebSockets.



## 5. FRONTEND COORDINATION: NEXT.JS (APP ROUTER)

1. **PWA Configuration & Push Notifications:**

   * Include a `manifest.json` and a Service Worker configured with Firebase Cloud Messaging (FCM).

2. **The Reminder Mode Handoff UI:**

   * Clicking the Web Push notification opens a dedicated mobile route displaying the drafted media/caption.

   * Uses `navigator.clipboard.writeText()` and the `navigator.share()` Web Share API to pass the media natively into Instagram/TikTok.

3. **The `usePublishingMode` Feature Toggle:**

   * A global Next.js hook. If `mode === 'REMINDER'`, CTA reads "Schedule Reminder". When LUNA shifts to Phase 3, this updates automatically to "Schedule Post".

4. **Feature Gating UI:**

   * Wrap the Unified Inbox route in a component checking for an active Basic tier/trial. If locked, render the paywall UI.

   * Display the Social Credit balance (e.g., `⚡ 12/50 SC`) persistently in the header.
