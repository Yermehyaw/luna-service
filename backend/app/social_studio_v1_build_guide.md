# LUNA SOCIAL STUDIO v1: Architectural Blueprint & Build Prompt
**Target:** Antigravity (Development Engine) / Core Engineering Team
**Project:** LUNA (B2B2C SaaS & Enterprise Platform) - `withluna.tech`
**Module:** Social Studio (MVP Version 1.0)

## 1. PROJECT CONTEXT & STRATEGY
LUNA is a multi-tenant B2B2C platform bringing queue management, document verification, and social customer service into a single unified dashboard. 

**The MVP Constraint (Zero-Cost & No App Review):**
For V1.0, we are completely bypassing official social media App Review processes (Meta, TikTok) and minimizing third-party SaaS API costs. The MVP must serve our first pilot users via strategic technical workarounds. 

**The Future State (Post-MVP):**
The architecture MUST be strictly provider-agnostic. In the future, we will undergo official App Reviews, generate our own native API keys, and potentially self-host open-source API infrastructures (like Mixpost Pro). The transition from the MVP workarounds to our native API must require **zero rewrites** to the frontend UI or core database logic.

---

## 2. THE FEATURE-ROUTING MATRIX (MVP EXECUTION)
Antigravity, you must build the system to route specific features through specific channels:

### A. Post Scheduling: The "Reminder Mode" (PWA)
*   **Method:** We will NOT use APIs to publish posts. LUNA will act as a scheduling/drafting tool. 
*   **Execution:** The Next.js frontend must be configured as a Progressive Web App (PWA). The FastAPI backend saves drafted posts. At the scheduled time, the backend triggers a Firebase Cloud Messaging (FCM) Web Push Notification to the user's phone. When the user taps "Publish" in the PWA, use the browser's `navigator.clipboard.writeText()` and Web Share API (`navigator.share()`) to pass the media and caption directly to the native Instagram/Facebook/TikTok apps on their OS.

### B. DMs & Analytics (Facebook, Instagram, Threads)
*   **Method:** Meta Developer Sandbox.
*   **Execution:** We will manually add trial clients as "Testers" in our Meta Developer Portal. The backend must connect to the Meta Graph API using these sandbox tokens. This grants us 100% free, unreviewed access to real-time webhook DMs, comments, and deep analytics.

### C. DMs & Analytics (TikTok)
*   **Method:** Delegated Third-Party API (Zernio).
*   **Execution:** For high-value prospects, we will route their TikTok connection through Zernio's free tier (2 connected accounts). The backend must use the Zernio API to fetch TikTok DMs and analytics.

---

## 3. BACKEND ARCHITECTURE: FASTAPI (HEXAGONAL PATTERN)
The backend must use a strict Ports and Adapters (Hexagonal) architecture to ensure we can hot-swap APIs in the future.

### Directory Structure
```text
backend/
├── app/
│   ├── a_i/                       # Dedicated directory for HuggingFace/NLP (Suggested replies, sentiment)
│   ├── core/                      # Global DB, Redis, Auth configs
│   ├── social_studio/
│   │   ├── router.py              # API Endpoints (FastAPI)
│   │   ├── interfaces.py          # The Ports (Abstract Base Classes)
│   │   ├── adapters/              # The Adapters
│   │   │   ├── meta_sandbox.py    # Meta Graph API logic
│   │   │   ├── zernio_api.py      # Zernio API logic
│   │   │   └── reminder_mode.py   # PWA Push Notification trigger logic
│   │   ├── webhook_parser.py      # Normalizes incoming vendor payloads
│   │   └── services.py            # Business logic connecting DB and Adapters
```

### Development Directives for Antigravity:
1.  **Strict Interfaces:** Define `ISocialProvider` in `interfaces.py` with methods like `schedule_post()`, `fetch_analytics()`, and `send_dm_reply()`. All UI requests must talk to this interface, never directly to Meta or Zernio.
2.  **Dependency Injection:** Use FastAPI's `Depends()` to dynamically resolve the active adapter. Read the tenant's `active_social_provider` from PostgreSQL and inject the correct adapter class into the route.
3.  **Unified Webhook Ingress:** Build a single `/webhooks` endpoint in `webhook_parser.py`. It must identify if the payload is from Meta or Zernio, parse it into a standard `LunaMessage` Pydantic model, pass it to the `a_i/` module for intent classification/suggested replies, save it to PostgreSQL, and push it to Redis.
4.  **Real-time WebSockets:** Use Redis Pub/Sub connected to FastAPI WebSockets to push new DMs to the Next.js frontend instantly.
5.  **Hyperfast Latency:** All adapters MUST use `httpx.AsyncClient` for non-blocking network I/O. Use Redis to cache analytics data heavily. 

---

## 4. FRONTEND ARCHITECTURE: NEXT.JS (APP ROUTER)
The frontend must support seamless B2B2C multi-tenancy and the PWA Reminder Mode workflow.

### Development Directives for Antigravity:
1.  **Edge Middleware:** Use Next.js Edge Middleware to inspect Host headers. Dynamically route `wema.withluna.tech` to the B2B2C customer-facing portals, while routing `app.withluna.tech` to the enterprise Staff/Manager dashboards.
2.  **Feature-Sliced Design:** Do not use generic components/pages folders. Group code by domain (e.g., `features/social-studio/`, `features/queue-management/`). Use a generic `DashboardLayout` that accepts tenant configuration (colors, active modules) from the backend to ensure zero code repetition across subdomains.
3.  **PWA Configuration:** Implement a `manifest.json` and a Service Worker. Integrate Firebase Cloud Messaging (FCM) to handle incoming background push notifications for the Reminder Mode scheduling handoff.
4.  **UI Blending:** The desktop UI will act as the "Command Center" (Unified Inbox, live WebSockets, Analytics charts). The mobile PWA UI must elegantly handle the execution phase (displaying the "Publish to OS" buttons when opened via a push notification).

---

## 5. POST-MVP MIGRATION PATH (THE FUTURE)
Antigravity, design the codebase knowing that Phase 2 will occur within 6-12 months:
*   Paid customers will allow us to fully migrate to paid tiers of third-party API platforms
*   We will pass Meta and TikTok App Reviews.
*   We will likely deploy Mixpost Pro via Docker.
*   **Execution:** We will simply write new adapter files (`native_meta_adapter.py`, `mixpost_client.py`), implement the `ISocialProvider` interface, and update the PostgreSQL database's `active_social_provider` string for our tenants. 
*   **Rule:** The database schema, frontend UI components, and websocket architecture MUST remain entirely untouched during this future migration.
