# LUNA SOCIAL STUDIO: Architectural Blueprint & Build Prompt

**Target:** Antigravity (Development Engine) / Core Engineering Team
**Project:** LUNA (B2B2C SaaS & Enterprise Platform) - `withluna.tech`
**Module:** Social Studio (V1.0 - Freemium to Enterprise)

## 1. PROJECT CONTEXT & OVERARCHING STRATEGY

LUNA is a multi-tenant platform operating on a Next.js (Frontend/PWA) and FastAPI (Backend) stack. The Social Studio module brings scheduling, analytics, and a unified inbox to African businesses. 

To overcome initial capital constraints and Meta/TikTok App Review blockers, this system utilizes a **Zero-Cost MVP Strategy**:
*   **Publishing:** Executed entirely via a Progressive Web App (PWA) "Reminder Mode". Zero API calls are made for publishing to bypass platform restrictions.
*   **Inbox & Analytics:** Handled by wrapping the free tiers of third-party APIs (**Zernio**, **SocialAPI.ai**, and **Postproxy**).

This is achieved using a **Hexagonal (Ports & Adapters) Architecture** in the backend, allowing LUNA to seamlessly hot-swap API providers as the business scales, without rewriting core frontend or database logic.

---

## 2. THE THREE-PHASE EVOLUTIONARY ROADMAP

The backend must be architected to transition through these three phases via simple Adapter hot-swaps:

### Phase 1: The Zero-Cost MVP (Current Focus)
*   **Cost:** ₦0. We arbitrage the free tiers on Zernio, SocialAPI.ai, and Postproxy.
*   **Methodology:** PWA Reminder Mode for publishing. 3rd-party APIs for reading/replying to DMs and fetching analytics.

### Phase 2: The Funded 3rd-Party Scaling
*   **Trigger:** Users convert after a free trial for a certain no of days which ensures customers are already hooked on the product and williong to pay, thus generating revenue.
*   **Action:** We consolidate API routing to a paid tier of a single provider (likely SocialAPI.ai or Postproxy) to handle higher volumes.
*   **Engineering Effort:** Zero frontend rewrites. We simply update the `active_social_provider` flag in PostgreSQL, and the backend routes requests through the upgraded adapter.

### Phase 3: The Independent Native API
*   **Trigger:** LUNA passes official Meta and TikTok App Reviews.
*   **Action:** We generate our own native App Secrets and self-host our API logic.
*   **Engineering Effort:** Create a `native_meta_adapter.py`. Update the Dependency Injection router to use it. Retire the third-party adapters. The UI and database remain 100% untouched.

---

## 3. BUSINESS MODEL & FEATURE GATING

The MVP relies on a strict freemium model governed by a **Social Credit (SC)** billing engine.

### The Trial & Billing Flow
*   **Sign-Up:** Content ideas, post scheduling/calendar, and social analytics are available immediately.
*   **The Inbox Lock:** The Unified Inbox is strictly **locked** for all newly onboarded clients.
*   **The 7-Day Trial:** To unlock the Inbox, the client must enter Credit/Debit Card details upfront. This triggers the free trial limited to a maximum of **50 Social Credits (SC)**.
*   **Conversion:** At the end of the trial period, the system sends a payment reminder and auto-bills **20,000 Naira/month** for the Pro plan.
*   **Pay-As-You-Go (PAYG):** If a user depletes their SC balance, they are prompted to purchase additional credit top-ups.

### The Social Credit (SC) Economy Rules
1.  **AI Content Generation:** Every prompt/generation of a content idea **consumes SC**.
2.  **Outbound Interactions:** Sending a DM reply or commenting **consumes SC**.
3.  **Inbound Fetching (FREE):** Fetching, reading, and ingesting DMs, comments, and Analytics data is **completely free and consumes 0 SC**. (Third-party APIs charge based on outbound interactions or total connected accounts, making read-requests safe to execute continuously).

---

## 4. BACKEND ARCHITECTURE: FASTAPI (HEXAGONAL PATTERN)

The backend strictly separates core logic from vendor-specific implementations. Note: The AI models are hosted in a separate, dedicated external environment, completely decoupled from this routing logic.

### Directory Structure
```text
backend/
├── app/
│   ├── core/                      # Billing engine, DB sessions, Redis clients
│   ├── social_studio/
│   │   ├── router.py              # API Endpoints (e.g., POST /schedule, GET /inbox)
│   │   ├── interfaces.py          # The Ports (Abstract Base Classes)
│   │   ├── adapters/              
│   │   │   ├── zernio_api.py      
│   │   │   ├── socialapi_ai.py    
│   │   │   ├── postproxy_api.py   
│   │   │   └── reminder_mode.py   # PWA push notification scheduler
│   │   ├── webhook_parser.py      # Normalizes vendor webhooks into LunaMessage schema
│   │   └── credit_manager.py      # Middleware validating Social Credits (SC)
```

### Engineering Directives:
1.  **The Interface (Port):** Define `ISocialProvider` in `interfaces.py`. It must mandate methods for `fetch_analytics()`, `send_dm_reply()`, and `get_inbox()`. 
2.  **Credit Validation Middleware:** `credit_manager.py` MUST intercept outbound actions (Replies, AI Generation). If `tenant.social_credits < 1`, return a `402 Payment Required` exception. If > 0, execute the action and decrement the SC balance. *Fetching data bypasses this decrement.*
3.  **Dependency Injection (`Depends()`):** Build a resolver that checks the tenant's `active_social_provider` in the DB and injects either `ZernioAdapter`, `SocialApiAdapter`, or `PostproxyAdapter` dynamically.
4.  **Asynchronous Networking:** All adapters must use `httpx.AsyncClient` to prevent blocking the FastAPI event loop. 
5.  **Webhook Normalization:** `webhook_parser.py` exposes a single endpoint to receive DMs from all providers. It identifies the origin, translates it to a `LunaMessage` model, saves to DB, and pushes to Redis WebSockets.

---

## 5. FRONTEND COORDINATION: NEXT.JS (APP ROUTER)

The frontend must dynamically adapt between Automated API modes and the MVP Reminder Mode using feature flags.

1.  **PWA Configuration & Push Notifications:** 
    *   Include a `manifest.json` and a Service Worker configured with Firebase Cloud Messaging (FCM). 
    *   When a scheduled post is due, the device receives a Web Push Notification.
2.  **The Reminder Mode Handoff UI:** 
    *   Clicking the push notification opens a dedicated mobile route displaying the drafted media and caption.
    *   The primary action button uses the `navigator.clipboard.writeText()` API to copy the caption, followed by the `navigator.share()` Web Share API to pass the media directly into the native social media apps (Instagram, TikTok, etc.).
3.  **The `usePublishingMode` Feature Toggle:** 
    *   A global React hook that reads the active capabilities from the backend. 
    *   If `mode === 'REMINDER'`, the composer CTA reads "Schedule Reminder". Once LUNA shifts to Phase 3 (Native APIs), the backend updates this flag, and the UI automatically switches to "Schedule Post" without requiring code rewrites.
4.  **Feature Gating UI:** 
    *   Wrap the Unified Inbox route in a component that checks for an active trial/card on file. 
    *   If locked, render a paywall state with a credit card entry form to initiate the 7-day trial.
    *   Display the current Social Credit balance (e.g., `⚡ 12/50 SC`) persistently in the dashboard header.
