# 🚀 LUNA FRONTEND — MULTI-TENANT NEXT.JS APP ROUTER ARCHITECTURE

> **One Next.js App Router application capable of serving Luna's marketing website, the Luna SaaS/platform interface, multiple tenant customer portals, and multiple tenant staff portals from the same codebase.**

---

## 📌 1. EXECUTIVE SUMMARY

The **Luna Frontend** is a production-quality, highly scalable, multi-tenant Next.js application built using the Next.js App Router architecture. It serves diverse enterprise organizations—such as **Banks, Hospitals, Telecom Operators, Educational Institutions, Government Agencies, and Retail Businesses**—from a **single unified codebase**.

All tenants share reusable frontend feature modules, UI components, and routing patterns. Tenant-specific differences are completely driven by:
- **Free Custom Subdomain Provisioning** (`victor.luna.com`)
- **8 Curated Free Theme Options** with full manual fine-tuning
- **Lovable & Replit-Style AI Site Studio** powered by Groq (LLaMA 3.3)
- **Dynamic CSS Variable Branding Engine**
- **Feature Flags & Role Matrices**

```text
                                  ONE LUNA FRONTEND
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
  Luna Marketing                    Luna Platform                  Tenant Applications
(app/(marketing))                  (app/(platform))              (app/tenant/[tenantId])
        │                                 │                                 │
 ├── Homepage                      ├── Login / Register              ├── victor.luna.com (New Business)
 ├── Company                       ├── Platform Dashboard            ├── Acme Bank
 ├── Institutions                  ├── Free Subdomain Claim          ├── City General Hospital
 ├── Features                      ├── Billing & Subscriptions       ├── Luna Mobile & Fiber
 └── Pricing                       └── Account Settings              └── National ID Center
```

---

## 🌐 2. FREE SUBDOMAIN CREATION (`yourname.luna.com`)

Every business that signs up on Luna automatically receives a **free custom subdomain**:
- **Example**: A business owned by Victor claims `victor.luna.com`.
- **Zero Cost & Instant Provisioning**: No DNS configuration required by the tenant. Handled transparently by Next.js edge middleware.
- **Dedicated Public Arrival Portal**: Customers visit `https://victor.luna.com` to book timed tickets, track lobby wait times, and pre-clear documents.
- **Dedicated Staff Operations Console**: Staff access `https://victor.luna.com/staff/ops-console` to call tickets, view analytics, and manage queue windows.

### Subdomain Routing Rules
| Inbound Host | Internal Next.js App Route | Description |
|---|---|---|
| `luna.com` | `app/(marketing)/page.tsx` | Main Marketing Website |
| `app.luna.com` | `app/(platform)/dashboard/page.tsx` | Platform SaaS Admin |
| `victor.luna.com` | `app/tenant/victor/page.tsx` | Victor's Customer Portal |
| `victor.luna.com/staff/*` | `app/tenant/victor/staff/*` | Victor's Staff Operations |
| `victor.localhost:3000` | `app/tenant/victor/*` | Local Development Subdomain |

---

## 🎨 3. 8 FREE THEME PRESETS & VISUAL CUSTOMIZATION

Immediately after business signup, users are routed to their **Website Customizer & Theme Studio** (`/tenant/[slug]/staff/settings`), where they can choose from **8 curated free themes** or fine-tune individual colors:

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

### Manual Fine-Tuning Controls
- **Hex Color Pickers**: Real-time adjustment of Primary, Secondary, Accent, Background, and Text colors.
- **Copy & Messaging**: Live editing of Hero Title, Hero Subtitle, Live Announcement Ticker, and CTA Button Text.
- **Real-Time Responsive Preview**: Split-screen desktop & mobile viewport simulator rendering changes live as they are typed.

---

## 🤖 4. AI WEBSITE PERSONALIZATION STUDIO (LOVABLE & REPLIT STYLE)

For businesses wanting hyper-personalized websites, Luna includes an interactive **AI Website Studio**:

### How It Works
1. **User Groq API Key**:
   - The user is prompted to enter their free **Groq API Key** (`gsk_...`).
   - Free keys can be created in seconds from [console.groq.com/keys](https://console.groq.com/keys).
   - Keys are stored securely in browser `localStorage` (`luna_groq_api_key`) and never sent to any intermediary server.
2. **Conversational Prompting**:
   - The user chats naturally with the AI assistant (e.g., *"Make my website look like a high-end pediatric clinic with pastel tones and friendly copy"* or *"Switch to dark luxury mode with obsidian and gold"*).
3. **Autonomous Generation (LLaMA 3.3 / 3.1)**:
   - Luna calls the Groq chat completions API with the ultra-fast `llama-3.3-70b-versatile` model.
   - The model streams back a conversational explanation and an exact JSON configuration block.
4. **Live Site Transformation**:
   - Luna automatically extracts the design parameters, updates the CSS variables, rewrites hero text, updates CTA buttons, and reflects the changes in the live preview in real time!
5. **Simulated Demo Mode**:
   - If the user hasn't connected a Groq key yet, built-in intelligent demo simulations allow them to experience the Lovable-style AI transformation immediately with 1-click prompt chips.

---

## 🔒 5. FRONTEND-ONLY SCOPE & BACKEND-READY DESIGN

This project is strictly **FRONTEND-ONLY**. No backend code (FastAPI, PostgreSQL, Prisma, RLS, or database migrations) is executed inside this codebase.

To ensure seamless future integration with a FastAPI backend without requiring a frontend rewrite, the application adheres strictly to the **Repository Pattern**:

```text
Next.js Frontend (UI & Hooks)
            │
   Repository Interface (e.g., QueueRepository, TenantRepository)
            │
 ┌──────────┴────────────────────────┐
 │                                   │
MockTenantRepository        FastAPITenantRepository
(Current Data Layer)        (Future Backend Connection)
```

Swapping out mock data for real FastAPI endpoints in the future simply requires supplying a `FastAPI*Repository` class implementing the existing TypeScript interfaces.

---

## 📂 6. TARGET ARCHITECTURE & FOLDER STRUCTURE

```text
frontend/
├── src/
│   ├── app/                                  # Next.js App Router (Routes & Layouts)
│   │   ├── (marketing)/                      # Marketing pages (Home, Pricing, Institutions)
│   │   │   └── page.tsx
│   │   ├── (platform)/                       # SaaS Platform & Admin (Login, Register, Dashboard)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx             # Free Subdomain Signup Flow
│   │   │   └── dashboard/page.tsx
│   │   ├── tenant/                           # Multi-Tenant Application Engines
│   │   │   └── [tenantId]/
│   │   │       ├── page.tsx                  # Dynamic Tenant Customer Landing Page
│   │   │       ├── book-queue/page.tsx       # Customer Timed Ticket Booking
│   │   │       ├── track/page.tsx            # Live Ticket Position Tracker
│   │   │       ├── verify/page.tsx           # Document Pre-Clearance
│   │   │       └── staff/                    # Tenant Operations Consoles
│   │   │           ├── ops-console/page.tsx  # Branch Operations Console & Ticket Caller
│   │   │           ├── analytics/page.tsx    # Live Performance & Wait-time Charts
│   │   │           ├── branches/page.tsx     # Branch Network Manager
│   │   │           ├── customers/page.tsx    # Customer Registry
│   │   │           ├── services/page.tsx     # Service & Priority Window Config
│   │   │           ├── settings/page.tsx     # 8 Themes, Free Subdomain & Groq AI Studio
│   │   │           └── social-studio/page.tsx# Social Broadcasts & Customer Communication
│   │   ├── error.tsx                         # Global Error Boundary
│   │   ├── globals.css                       # Global Tailwind CSS & Root Tenant Variables
│   │   ├── layout.tsx                        # Root Layout with Font Definitions & Auth Context
│   │   ├── loading.tsx                       # Global Skeleton Fallback
│   │   └── not-found.tsx                     # Custom 404 Handler
│   │
│   ├── components/                           # Shared UI Components & Layouts
│   │   ├── layouts/                          # Reusable Shells (TenantCustomerLayout, TenantStaffLayout)
│   │   ├── navigation/                       # Navbar, Staff Sidebar, Tenant Switcher
│   │   ├── shared/                           # Luna Official Brand Marks & Assets
│   │   └── ui/                               # Atomic UI Components (Buttons, Modals, Cards)
│   │
│   ├── features/                             # Modular Business Feature Domains
│   │   ├── tenant-branding/                  # 8 Free Themes & Groq AI Personalization Engine
│   │   │   ├── themes.ts                     # 8 Curated Theme Presets Specification
│   │   │   └── groq-service.ts               # Groq LLaMA 3.3 Prompt Engine & Key Manager
│   │   ├── queue-management/                 # Queue Engine, Live Ticker, Ticket Calling
│   │   ├── ticketing/                        # Ticket Verification & History
│   │   ├── social-studio/                    # Broadcast Announcements & Campaign Cards
│   │   ├── verification/                     # Document Pre-Clearance Engine
│   │   └── authentication/                   # Frontend Auth State & Role Guards
│   │
│   ├── lib/                                  # Centralized Utilities & Repositories
│   │   ├── api-client.ts                     # Standardized HTTP/Fetch Abstraction
│   │   ├── auth.tsx                          # Auth Context & Session Provider
│   │   ├── tenant.ts                         # Tenant Resolution, Mock Repo & Subdomain Utilities
│   │   ├── tenant-context.tsx                # Active Tenant Provider Hook (`useTenant`)
│   │   ├── tenant-branding.ts                # CSS Variable Injector
│   │   └── utils.ts                          # Classname Merging (`cn`)
│   │
│   ├── mock/                                 # Typed Development Data Repositories
│   │   ├── tenants.ts                        # Pre-configured Enterprise Tenants
│   │   ├── branches.ts                       # Branch Network Mock Data
│   │   ├── services.ts                       # Priority Window & Service Items
│   │   └── users.ts                          # Staff & Customer Mock Profiles
│   │
│   └── types/                                # Strict TypeScript Interface Definitions
│       ├── tenant.ts                         # Tenant, TenantBranding, TenantFeatures Interfaces
│       ├── user.ts                           # User, Role & Permission Schemas
│       ├── queue.ts                          # Queue & Arrival Window Schemas
│       └── ticket.ts                         # Digital Ticket Interface
│
├── public/brand/                             # Official Luna Wordmarks, Icons & Graphics
├── middleware.ts                             # Next.js Host-Based Subdomain Rewriter
├── package.json                              # Project Dependencies & Next 15 Setup
├── postcss.config.mjs                        # PostCSS & Tailwind Plugin Config
└── tsconfig.json                             # Strict TypeScript Compiler Options
```

---

## ⚙️ 7. LOCAL DEVELOPMENT & COMMANDS

### Prerequisites
- Node.js v18.x or v20.x+
- npm v9.x+

### Quick Start
Navigate to the `frontend/` directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Next.js local development server:

```bash
npm run dev
```

The application will be accessible at:
- **Marketing Site**: [http://localhost:3000](http://localhost:3000)
- **New Business Registration**: [http://localhost:3000/register](http://localhost:3000/register)
- **Website Customizer & AI Studio**: [http://localhost:3000/tenant/acme-bank/staff/settings](http://localhost:3000/tenant/acme-bank/staff/settings)
- **Acme Bank Customer Portal**: [http://localhost:3000/tenant/acme-bank](http://localhost:3000/tenant/acme-bank)
- **Acme Bank Staff Console**: [http://localhost:3000/tenant/acme-bank/staff/ops-console](http://localhost:3000/tenant/acme-bank/staff/ops-console)
- **City Hospital Customer Portal**: [http://localhost:3000/tenant/city-hospital](http://localhost:3000/tenant/city-hospital)

### Verify Production Build
To run a full production build and type check:

```bash
npm run build
```

---

## 📄 8. KEY ARCHITECTURAL PRINCIPLES

1. **Strict Dependency Direction**:
   - `app` → `features` → `shared components/lib`. Business logic lives inside `features/`, while `app/` is reserved for route composition.
2. **No Duplicated Applications**:
   - Single layout tree (`TenantCustomerLayout`, `TenantStaffLayout`) serves all organizations without duplicate code.
3. **Zero Raw Technical Errors**:
   - Polished fallbacks, loading skeletons (`loading.tsx`), empty states, and custom 404/Error boundaries.
4. **Backend-Decoupled Data Layer**:
   - UI components interact strictly through repository functions (`getTenantBySlug`, `createTenant`, `updateTenant`), ensuring seamless FastAPI integration when backend APIs are ready.
