# 🚀 LUNA FRONTEND — MULTI-TENANT NEXT.JS APP ROUTER ARCHITECTURE

> **A production-ready Next.js App Router application serving Luna's marketing homepage, SaaS onboarding platform, multi-tenant customer arrival portals, and private staff operations consoles—integrated with FastAPI and real-time WebSockets.**

---

## 📌 1. EXECUTIVE SUMMARY & WHAT'S NEW

The **Luna Frontend** is a unified multi-tenant Next.js application built using the Next.js App Router architecture. It empowers organizations across **Banking, Healthcare, Telecom, Education, and Retail** to deliver zero-wait, appointment-driven digital customer service from a **single codebase**.

### 🌟 Key Features & Recent Updates
1. **Free Custom Subdomain Provisioning (`yourname.luna.com`)**:
   - Instant business subdomain creation with zero DNS complexity (e.g. `victor.luna.com`).
   - Interactive claim tool on the homepage pre-populating registration.
2. **8 Free Curated Themes & Live CSS Variable Engine**:
   - One-click palette presets tailored for banking, healthcare, telecom, luxury, and civic organizations.
   - Full manual hex color pickers, typography controls, and split-screen desktop/mobile preview.
3. **Lovable & Replit-Style Multi-Provider AI Site Studio (Groq, OpenAI, Gemini, Claude, Kimi)**:
   - Chat-driven website personalization accepting user API keys for **Groq**, **OpenAI**, **Google Gemini**, **Anthropic Claude**, and **Moonshot Kimi**.
   - Live Key Testing (latency ping), client-side secure localStorage, and **Smart AI Auto-Routing** cascade to combine multiple keys.
   - Autonomous styling with LLaMA 3.3, GPT-4o, Gemini 1.5, Claude 3.5, and Kimi 8k, plus zero-key smart local simulation.
4. **Real-Time WebSocket Queue Integration (FastAPI Backend)**:
   - **Staff Branch WebSocket** (`/api/queue/ws/branches/{branch_id}`): Pushes new ticket arrivals, status changes, and audio call announcements.
   - **Customer Ticket WebSocket** (`/api/queue/ws/tickets/{ticket_number}`): Pushes live wait updates, queue positions, and instant counter call chimes.
5. **Staff Operations Console (`/staff/ops-console`)**:
   - Real-time ticket caller with audio chime synthesizer, digital walk-in intake modal, and counter assignments.
6. **Customer Arrival & Live Tracking Flow**:
   - Timed ticket booking (`/book-queue`) connected to FastAPI backend.
   - Real-time 4-step progress stepper (`/track`) reflecting live desk status without page refresh.
7. **Document Pre-Clearance (`/verify`)**:
   - Digital pass confirmation and document intake before arriving at physical branches.
8. **Social Studio & AI Broadcasts (`/staff/social-studio`)**:
   - Instant public announcement ticker publisher with AI presets (*Zero-Wait Notice*, *Weather Advisory*, *Pre-Clearance Push*).
9. **Full Marketing Landing Page (`/`)**:
   - Complete replacement of placeholder root with a rich Luna brand homepage featuring interactive live demo cards, live queue stats, and tenant directories.
10. **Resilient Tenant Layout Architecture**:
    - Centralized `[tenantId]/layout.tsx` providing safe context hydration and eliminating SSR 500 crashes.

```text
                                  ONE LUNA FRONTEND
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
  Luna Marketing                    Luna Platform                  Tenant Applications
 (app/page.tsx)                    (app/(platform))              (app/tenant/[tenantId])
        │                                 │                                 │
 ├── Official Brand Homepage       ├── Login / Register              ├── victor.luna.com (New Business)
 ├── Subdomain Claim Bar           ├── Platform Dashboard            ├── Acme Bank (acme-bank.luna.com)
 ├── 8 Themes Showcase             ├── Free Subdomain Flow           ├── City General Hospital
 ├── Solutions & Live Metrics      └── Account Settings              └── Luna Mobile & Fiber
 └── Tenant Demo Switcher                                                   │
                                                                 ├── /book-queue (Customer Booking)
                                                                 ├── /track (Realtime WebSocket Tracker)
                                                                 ├── /verify (Document Pre-Clearance)
                                                                 └── /staff/
                                                                     ├── ops-console (Live WebSocket Caller)
                                                                     ├── services (Service Windows)
                                                                     ├── social-studio (AI Broadcast Ticker)
                                                                     ├── branches & customers
                                                                     └── settings (8 Themes & Groq AI)
```

---

## 🌐 2. FREE SUBDOMAIN CREATION (`yourname.luna.com`)

Every business that signs up on Luna automatically receives a **free custom subdomain**:
- **Example**: A business owned by Victor claims `victor.luna.com`.
- **Zero Cost & Instant Provisioning**: No DNS configuration required by the tenant. Handled transparently by Next.js edge routing and tenant resolution.
- **Dedicated Public Arrival Portal**: Customers visit `https://victor.luna.com` to book timed tickets, track lobby wait times, and pre-clear documents.
- **Dedicated Staff Operations Console**: Staff access `https://victor.luna.com/staff/ops-console` to call tickets, view analytics, and manage queue windows.

### Subdomain Routing Rules
| Inbound Host | Internal Next.js App Route | Description |
|---|---|---|
| `luna.com` / `localhost:3000` | `app/page.tsx` | Main Marketing Landing Website |
| `app.luna.com` | `app/(platform)/dashboard/page.tsx` | Platform SaaS Admin |
| `victor.luna.com` | `app/tenant/victor/page.tsx` | Victor's Branded Customer Portal |
| `victor.luna.com/book-queue` | `app/tenant/victor/book-queue/page.tsx` | Victor's Ticket Booking Portal |
| `victor.luna.com/track` | `app/tenant/victor/track/page.tsx` | Victor's Live WebSocket Queue Tracker |
| `victor.luna.com/staff/*` | `app/tenant/victor/staff/*` | Victor's Private Operations Consoles |
| `victor.localhost:3000` | `app/tenant/victor/*` | Local Development Subdomain Resolution |

---

## 🎨 3. 8 FREE THEME PRESETS & DYNAMIC BRANDING ENGINE

Immediately after signup, businesses can customize their site via the **Theme Studio & Settings** (`/tenant/[slug]/staff/settings`). Tenants can choose from **8 curated free themes** or fine-tune individual colors:

| Theme Name | Primary | Background | Accent (CTA) | Industry Best Fit |
|---|---|---|---|---|
| **1. Luna Classic** | `#291E29` | `#FFF6E9` (Cream) | `#FFA800` (Tangerine) | Official Luna Brand Look ("Beyond the Expected") |
| **2. Oceanic Cobalt** | `#0057B8` | `#F4F8FC` (Ice) | `#00A3E0` (Sky) | Commercial Banks & Wealth Advisory |
| **3. Emerald Wellness**| `#12A05A` | `#F3FBF6` (Mint) | `#17B568` (Emerald) | Hospitals, Clinics & Diagnostic Labs |
| **4. Tangerine Spark** | `#FF8A00` | `#FFF8F0` (Peach) | `#F45B16` (Flame) | Telecom Flagships & Retail Electronics |
| **5. Midnight Obsidian**| `#0F172A` | `#F8FAFC` (Slate) | `#38BDF8` (Cyan) | Modern Fintech, Luxury & Concierge VIP |
| **6. Crimson Velvet** | `#BE123C` | `#FFF1F2` (Rose) | `#F59E0B` (Amber) | Hospitality, Dining & Event Lounges |
| **7. Amethyst Royal** | `#6D28D9` | `#F5F3FF` (Lilac) | `#FBBF24` (Gold) | Universities, Admissions & Colleges |
| **8. Nordic Teal** | `#0F766E` | `#F0FDFA` (Teal) | `#06B6D4` (Cyan) | Government Centers & Clean Tech |

### Dynamic CSS Variable Branding Engine
Theme colors are injected directly into root CSS variables:
```css
:root {
  --tenant-primary: #0057B8;
  --tenant-secondary: #002F6C;
  --tenant-accent: #00A3E0;
  --tenant-bg: #F4F8FC;
  --tenant-text: #0B1D3A;
}
```
All tenant pages dynamically inherit these variables, enabling real-time palette changes without redeployment.

---

## 🤖 4. MULTI-PROVIDER AI SITE STUDIO & SMART AI AUTO-ROUTING (LOVABLE & REPLIT STYLE)

For hyper-personalized websites, Luna includes an interactive **AI Website Studio** located in Tenant Settings (`/tenant/[slug]/staff/settings`). Tenants can build and customize themes using industry-leading AI models, test their keys live, save them securely in their browser, and **combine keys using Smart AI Auto-Routing**.

### 🛠️ Supported AI Providers & Models
| Provider | Default Model | Typical Latency | Key Prefix / Format | Documentation Link |
|---|---|---|---|---|
| **⚡ Groq** | `llama-3.3-70b-versatile` | ~250ms – 400ms (Blazing fast) | `gsk_...` | [console.groq.com/keys](https://console.groq.com/keys) |
| **🟢 OpenAI** | `gpt-4o-mini` | ~800ms – 1400ms (High fidelity) | `sk-...` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **🔷 Google Gemini** | `gemini-1.5-flash` | ~600ms – 1100ms (Generous free tier) | `AIzaSy...` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **🟣 Anthropic Claude** | `claude-3-5-haiku-20241022` | ~700ms – 1200ms (Creative copy) | `sk-ant-api03-...` | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| **🌙 Moonshot Kimi** | `moonshot-v1-8k` | ~900ms – 1500ms (Long context & styles) | `sk-...` | [platform.moonshot.cn/console/api-keys](https://platform.moonshot.cn/console/api-keys) |

---

### 🔑 1. Live Key Testing ("Test Key")
Before using an API key in design workflows, users can verify their credentials with a single click:
- **Instant Latency Check**: Luna executes a lightweight test probe directly against the provider's API.
- **Latency Meter**: Displays the exact response round-trip time in milliseconds (e.g. `⚡ Key Valid (320ms)`).
- **Error Diagnostics**: If a key is revoked, quota-exhausted, or formatted incorrectly, the modal displays the exact upstream error message immediately.

---

### 💾 2. Secure Client-Side Key Storage ("Save Key")
- **100% Client-Side Privacy**: All API keys are stored solely in the tenant's browser `localStorage` (`luna_ai_key_groq`, `luna_ai_key_openai`, `luna_ai_key_gemini`, `luna_ai_key_anthropic`, `luna_ai_key_kimi`).
- **Zero Server Exposure**: Keys are **never** logged, sent to, or stored on the Luna FastAPI backend or any third-party telemetry server.
- **One-Click Deletion**: Users can remove any saved key at any time, instantly wiping it from storage.

---

### 🔀 3. Smart AI Auto-Routing & Combining Keys
Tenants can combine multiple AI keys to create an ultra-reliable, high-performance personalization pipeline:

```text
               USER PROMPT: "Design a high-energy electric sports clinic"
                                      │
                                      ▼
                      ┌────────────────────────────────┐
                      │    SMART AI AUTO-ROUTING       │
                      │           CASCADE              │
                      └────────────────────────────────┘
                                      │
                 ┌────────────────────┼────────────────────┐
                 ▼                    ▼                    ▼
           1. GROQ LLaMA 3.3    2. OPENAI GPT-4o    3. GEMINI 1.5 FLASH
           (Fastest ~300ms)    (If Groq Busy)      (If OpenAI Limit)
                 │                    │                    │
                 └───────────┬────────┴────────────────────┘
                             │ (Fallback Cascade)
                 ┌───────────┴─────────────────────────────┐
                 ▼                                         ▼
         4. CLAUDE 3.5 HAIKU                       5. MOONSHOT KIMI
          (Creative Redesign)                    (Long Context Fallback)
                             │
                             ▼ (If all keys fail or none entered)
             ┌─────────────────────────────────────────────────────┐
             │       6. BUILT-IN SMART HEURISTIC ENGINE            │
             │         (Zero-latency local simulation)             │
             └─────────────────────────────────────────────────────┘
                                      │
                                      ▼
               LIVE SITE RE-THEMED IN REAL TIME (CSS Variables + Copy)
```

1. **Combined AI Auto-Routing (Default & Recommended)**:
   - When multiple keys are configured, Luna cascades requests in order of lowest latency: **Groq $\to$ OpenAI $\to$ Google Gemini $\to$ Anthropic Claude $\to$ Moonshot Kimi**.
   - If a provider encounters a rate limit (`429`), network timeout, or service downtime, the router automatically fails over to the next available provider within milliseconds—ensuring zero downtime.
2. **Dedicated Single Provider Routing**:
   - Users can lock execution to a specific provider of choice (e.g. exclusively using *Anthropic Claude* or *Google Gemini*).
3. **Smart Local Fallback (Zero Keys Required)**:
   - If a user has not entered any API keys yet, Luna's local heuristic engine parses their aesthetic request and applies authentic color palettes and high-converting marketing copy—enabling instant interactive onboarding without requiring an API key.

---

### 💻 4. Code Architecture (`frontend/src/features/tenant-branding/`)
- [`multi-ai-service.ts`](file:///frontend/src/features/tenant-branding/multi-ai-service.ts):
  - `testAiKey(provider, key)`: Ping function returning `{ success: boolean, latencyMs: number, error?: string }`.
  - `generateSiteCustomizationMultiAi(prompt, currentBranding, tenantName, industry)`: Master dispatcher handling key retrieval, active routing strategies, and automatic cascade fallback.
  - Provider-specific parsers formatting prompts for OpenAI chat completion format, Anthropic messages format, and Google Gemini contents format.
- [`MultiAiKeyModal.tsx`](file:///frontend/src/features/tenant-branding/MultiAiKeyModal.tsx):
  - Accessible tabbed modal for managing keys across all 5 providers.
  - Interactive "Test Key" buttons with real-time spinners and response badges.
  - Strategy selector: *Combined AI Auto-Routing* vs *Dedicated Single Provider*.
- [`settings/page.tsx`](file:///frontend/src/app/tenant/[tenantId]/staff/settings/page.tsx):
  - Live AI chat studio displaying the active routing badge, connected key count, response provider pill (e.g. `⚡ Groq LLaMA 3.3 (290ms)`), and real-time site preview.

---

## ⚡ 5. REAL-TIME WEBSOCKET QUEUE INTEGRATION (FASTAPI BACKEND)

The frontend connects directly to the FastAPI backend at `http://127.0.0.1:8000` via typed REST endpoints and persistent WebSockets.

### 1. Two Sockets, Two Audiences
| Audience | WebSocket Route | Query Params | Functionality |
|---|---|---|---|
| **Staff Console** | `GET /api/queue/ws/branches/{branch_id}` | `business_id` (required) | Pushes every ticket event for the branch in real time |
| **Customer Tracker** | `GET /api/queue/ws/tickets/{ticket_number}` | none | Pushes snapshot, wait updates, and call announcements |

### 2. Real-Time WebSocket Hook (`use-realtime.ts`)
- **`useBranchRealtime`**:
  - Connects to `ws://127.0.0.1:8000/api/queue/ws/branches/{branch_id}?business_id={business_id}`.
  - Automatically handles `connected`, `ticket.created`, `ticket.status_changed`.
  - Sends keepalive `"ping"` frames every 25 seconds.
  - Automatically reconnects on network blips and triggers HTTP state reconciliation.
- **`useTicketRealtime`**:
  - Connects to `ws://127.0.0.1:8000/api/queue/ws/tickets/{ticket_number}`.
  - Receives initial `ticket.snapshot`, live `ticket.status_changed`, and `ticket.wait_updated` fan-outs.
  - Powers real-time audio chimes when staff calls the ticket to the counter.

### 3. Queue REST API Client (`queue-api.ts`)
```typescript
import { queueApi } from '@/lib/queue-api';

// Create a digital arrival ticket
const ticket = await queueApi.createTicket({
  business_id: 'tenant_001',
  branch_id: 'b_001',
  service_id: 's_001',
  customer_name: 'Ada Lovelace',
  customer_email: 'ada@example.com',
});

// Update ticket status from staff console
await queueApi.updateTicketStatus(ticket.ticket_number, 'called', 'tenant_001');

// Fetch live wait estimate
const wait = await queueApi.getWaitEstimate(ticket.ticket_number, 'tenant_001');
```

---

## 🖥️ 6. TENANT PAGES & WORKFLOWS

### 1. Staff Operations Console (`/tenant/[slug]/staff/ops-console`)
- **Live WebSocket Status Pill**: Displays `🟢 Live WebSocket (Port 8000)` with active socket state.
- **Live Ticket Caller**: Audio chime synthesis + visual banner broadcast when calling customers to Counter 1.
- **Issue Walk-in Digital Ticket Modal**: Staff can immediately issue tickets for walk-ins with priority tags.
- **Counter Action Controls**: Complete Service (`status: done`) and No-Show / Skip (`status: no_show`).
- **Metric Cards**: Active lobby queue, pre-cleared documents count, and door-to-counter average wait time.

### 2. Customer Booking Portal (`/tenant/[slug]/book-queue`)
- Loads real services from `GET /api/queue/services`.
- Dispatches ticket creation via `POST /api/queue/tickets`.
- Displays real backend ticket numbers (`AC-XXXXX`) and estimated arrival waits.
- Direct link to live position tracking.

### 3. Customer Live Queue Tracker (`/tenant/[slug]/track`)
- Supports ticket pre-fill via query parameter (`?ticket=AC-XXXXX`).
- Subscribes to the customer WebSocket for real-time updates.
- **4-Step Timeline Stepper**:
  1. *Booked* &rarr; 2. *In Lounge* &rarr; 3. *Called (Now Serving)* &rarr; 4. *Done (Completed)*.
- Audio alert and animated banner activate the moment staff calls the ticket.

### 4. Service Windows Management (`/tenant/[slug]/staff/services`)
- Displays all active service counters and SLA duration targets.
- Interactive modal to create new service windows with backend persistence (`POST /api/queue/services`).

### 5. Social Studio & AI Broadcasts (`/tenant/[slug]/staff/social-studio`)
- Direct broadcast composer updating the public announcement ticker on customer portals.
- **AI Inspiration Presets**: One-click generation for weather advisories, zero-wait alerts, and pre-clearance reminders.
- Configurable **Groq API Key** modal for LLaMA 3.1 generation.

---

## 📂 7. FOLDER STRUCTURE

```text
frontend/
├── src/
│   ├── app/                                  # Next.js App Router (Routes & Layouts)
│   │   ├── page.tsx                          # Full Luna Marketing Homepage (Hero, Subdomain Claim, Themes)
│   │   ├── (platform)/                       # SaaS Platform & Admin
│   │   │   ├── login/page.tsx                # Staff & Platform Login
│   │   │   ├── register/page.tsx             # Free Subdomain Signup Flow
│   │   │   └── dashboard/page.tsx            # Platform Admin Console
│   │   ├── tenant/                           # Multi-Tenant Application Engines
│   │   │   └── [tenantId]/
│   │   │       ├── layout.tsx                # Root Tenant Provider Layout (Safe Context Hydration)
│   │   │       ├── page.tsx                  # Dynamic Tenant Customer Landing Page
│   │   │       ├── book-queue/page.tsx       # Customer Timed Ticket Booking
│   │   │       ├── track/page.tsx            # Live WebSocket Queue Tracker & Audio Caller
│   │   │       ├── verify/page.tsx           # Document Pre-Clearance
│   │   │       └── staff/                    # Tenant Staff Operations
│   │   │           ├── ops-console/page.tsx  # Branch Operations Console & Live Caller
│   │   │           ├── analytics/page.tsx    # Wait-time Charts & Queue Analytics
│   │   │           ├── branches/page.tsx     # Branch Management & Add Branch Modal
│   │   │           ├── customers/page.tsx    # Customer Registry with Live Search Filter
│   │   │           ├── services/page.tsx     # Service Windows & Modal Creator
│   │   │           ├── settings/page.tsx     # 8 Themes, Free Subdomain & Groq AI Studio
│   │   │           └── social-studio/page.tsx# Social Broadcasts & Groq AI Generator
│   │   ├── globals.css                       # Tailwind CSS & Luna Brand Variables
│   │   └── layout.tsx                        # Root HTML Shell & Font Configuration
│   │
│   ├── components/
│   │   ├── layouts/                          # TenantCustomerLayout & TenantStaffLayout
│   │   └── shared/                           # LunaLogo, LunaIcon (Official Brand Assets)
│   │
│   ├── lib/
│   │   ├── api-client.ts                     # REST Client configured for FastAPI @ Port 8000
│   │   ├── queue-api.ts                      # Typed Queue, Ticket & Service API Methods
│   │   ├── use-realtime.ts                   # Branch & Customer WebSocket Hooks
│   │   ├── ai-service.ts                     # Groq LLaMA 3 Client & Contextual Fallbacks
│   │   ├── tenant.ts                         # Tenant Resolvers & Subdomain Utilities
│   │   └── tenant-context.tsx                # Safe Tenant Provider & Hook (`useTenant`)
│   │
│   ├── features/
│   │   └── queue-management/
│   │       └── api/queue-repository.ts       # Hybrid Queue Repository with Backend Sync
│   │
│   └── mock/                                 # Initial Mock Tenant & Branch Datasets
│       ├── tenants.ts                        # Acme Bank, City Hospital, Luna Telecom
│       ├── branches.ts                       # Branch Locations & Addresses
│       └── services.ts                       # Service Counters & Duration SLA
│
├── public/brand/                             # Official Luna Wordmarks, Icons & Graphics
├── package.json                              # Next.js 15, React 19, Lucide, Tailwind
└── tsconfig.json                             # Strict TypeScript Configuration
```

---

## ⚙️ 8. LOCAL DEVELOPMENT & TESTING

### 1. Start FastAPI Backend
Ensure the backend is running on port 8000:
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Interactive API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Start Next.js Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run build
npm start
```
*(Or `npm run dev` for development mode).*

### 3. Verify Live Routes
- **Luna Homepage**: [http://localhost:3000](http://localhost:3000)
- **New Business Registration**: [http://localhost:3000/register](http://localhost:3000/register)
- **Acme Bank Customer Portal**: [http://localhost:3000/tenant/acme-bank](http://localhost:3000/tenant/acme-bank)
- **Book Arrival Ticket**: [http://localhost:3000/tenant/acme-bank/book-queue](http://localhost:3000/tenant/acme-bank/book-queue)
- **Customer Live Queue Position Tracking**: [http://localhost:3000/tenant/acme-bank/track](http://localhost:3000/tenant/acme-bank/track)
- **Staff Operations Console**: [http://localhost:3000/tenant/acme-bank/staff/ops-console](http://localhost:3000/tenant/acme-bank/staff/ops-console)
- **Service Windows Management**: [http://localhost:3000/tenant/acme-bank/staff/services](http://localhost:3000/tenant/acme-bank/staff/services)
- **Social Studio & AI Broadcasts**: [http://localhost:3000/tenant/acme-bank/staff/social-studio](http://localhost:3000/tenant/acme-bank/staff/social-studio)
- **8 Themes & AI Website Studio**: [http://localhost:3000/tenant/acme-bank/staff/settings](http://localhost:3000/tenant/acme-bank/staff/settings)
