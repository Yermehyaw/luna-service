# 🚀 LUMA FRONTEND — MULTI-TENANT NEXT.JS APP ROUTER ARCHITECTURE

> **One Next.js App Router application capable of serving Luma's marketing website, the Luma SaaS/platform interface, multiple tenant customer portals, and multiple tenant staff portals from the same codebase.**

---

## 📌 1. EXECUTIVE SUMMARY

The **Luma Frontend** is a production-quality, highly scalable, multi-tenant Next.js application built using the Next.js App Router architecture. It serves diverse enterprise organizations—such as **Banks, Hospitals, Telecom Operators, Educational Institutions, Government Agencies, and Retail Businesses**—from a **single unified codebase**.

All tenants share reusable frontend feature modules, UI components, and routing patterns. Tenant-specific differences are completely driven by **dynamic configuration**, **CSS variable branding**, **feature flags**, and **role/permission matrices**.

```text
                                  ONE LUMA FRONTEND
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
  Luma Marketing                    Luma Platform                  Tenant Applications
(app/(marketing))                  (app/(platform))              (app/tenant/[tenantId])
        │                                 │                                 │
 ├── Homepage                      ├── Login / Register              ├── Acme Bank
 ├── Company                       ├── Platform Dashboard            ├── City General Hospital
 ├── Institutions                  ├── Organizations                 ├── Luma Mobile & Fiber
 ├── Features                      ├── Billing & Subscriptions       ├── Makerere Registry
 └── Pricing                       └── Account Settings              └── National ID Center
```

---

## 🔒 2. FRONTEND-ONLY SCOPE & BACKEND-READY DESIGN

This project is strictly **FRONTEND-ONLY**. No backend code (FastAPI, PostgreSQL, Prisma, RLS, or database migrations) is executed inside this codebase.

To ensure seamless future integration with a FastAPI backend without requiring a frontend rewrite, the application strictly adheres to the **Repository Pattern**:

```text
Next.js Frontend (UI & Hooks)
            │
   Repository Interface (e.g., QueueRepository)
            │
 ┌──────────┴────────────────────────┐
 │                                   │
MockQueueRepository        FastAPIQueueRepository
(Current Data Layer)        (Future Backend Connection)
```

Every major domain feature depends on abstract TypeScript interfaces (`QueueRepository`, `TenantRepository`, `TicketRepository`, `SocialRepository`, `AuthRepository`). Swapping out mock data for real FastAPI endpoints in the future simply requires supplying a `FastAPI*Repository` class.

---

## 📂 3. TARGET ARCHITECTURE & FOLDER STRUCTURE

The repository layout follows a modular, domain-driven structure:

```text
frontend/
├── src/
│   ├── app/                                  # Next.js App Router (Routes & Layouts)
│   │   ├── (marketing)/                      # Marketing pages (Home, Pricing, Institutions)
│   │   │   └── page.tsx
│   │   ├── (platform)/                       # SaaS Platform & Admin (Login, Register, Dashboard)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── dashboard/page.tsx
│   │   ├── tenant/                           # Multi-Tenant Application Engines
│   │   │   └── [tenantId]/
│   │   │       ├── page.tsx                  # Customizable Tenant Customer Landing Page
│   │   │       ├── book-queue/page.tsx       # Customer Timed Ticket Booking
│   │   │       ├── track/page.tsx            # Live Ticket Position Tracker
│   │   │       ├── verify/page.tsx           # Document Pre-Clearance
│   │   │       └── staff/                    # Tenant Operations Consoles
│   │   │           ├── ops-console/page.tsx  # Branch Operations Console & Ticket Caller
│   │   │           ├── analytics/page.tsx    # Live Performance & Wait-time Charts
│   │   │           ├── branches/page.tsx     # Branch Network Manager
│   │   │           ├── customers/page.tsx    # Customer Registry
│   │   │           ├── services/page.tsx     # Service & Priority Window Config
│   │   │           ├── settings/page.tsx     # Landing Page Customizer & CSS Palette Builder
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
│   │   ├── shared/                           # Luma Brand Mark & Shared Icons
│   │   └── ui/                               # Atomic UI Components (Buttons, Modals, Cards)
│   │
│   ├── features/                             # Modular Business Feature Domains
│   │   ├── queue-management/                 # Queue Engine, Live Ticker, Ticket Calling
│   │   ├── ticketing/                        # Ticket Verification & History
│   │   ├── social-studio/                    # Broadcast Announcements & Campaign Cards
│   │   ├── verification/                     # Document Pre-Clearance Engine
│   │   ├── analytics/                        # Performance Metrics & Wait-Time Visualizers
│   │   ├── tenant-management/                # Business Onboarding & Subdomain Registration
│   │   ├── tenant-branding/                  # CSS Variable Theme Customizer
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
├── middleware.ts                             # Next.js Host-Based Subdomain Rewriter
├── package.json                              # Project Dependencies & Next 15 Setup
├── postcss.config.mjs                        # PostCSS & Tailwind Plugin Config
└── tsconfig.json                             # Strict TypeScript Compiler Options
```

---

## 🌐 4. HOST-BASED SUBDOMAIN RESOLUTION & MIDDLEWARE

Tenant resolution is executed transparently via Next.js Middleware (`frontend/middleware.ts`). The middleware inspects `request.headers.get("host")` and rewrites requests dynamically:

1. **Production Custom Subdomains**:
   - `acme-bank.luma.com` → rewrites internally to `/tenant/acme-bank`
   - `acme-bank.luma.com/staff` → rewrites internally to `/tenant/acme-bank/staff`
2. **Local Development Subdomains**:
   - `http://acme-bank.localhost:3000` → rewrites internally to `/tenant/acme-bank`
   - `http://acme-bank.localhost:3000/staff/ops-console` → rewrites internally to `/tenant/acme-bank/staff/ops-console`
3. **Explicit Local Path Fallback**:
   - `http://localhost:3000/tenant/acme-bank` → renders tenant customer portal directly.
4. **Platform App Route**:
   - `app.luma.com` → redirects to `/platform/dashboard`.

---

## 🎨 5. DYNAMIC BRANDING ENGINE & FEATURE FLAGS

### CSS Variable Injection
Instead of creating duplicate components for each company (e.g., `BankDashboard`, `HospitalDashboard`), Luma uses a **single component tree** driven by CSS variables:

```css
:root {
  --tenant-primary: #0057B8;
  --tenant-secondary: #002F6C;
  --tenant-accent: #00A3E0;
  --tenant-bg: #F4F8FC;
  --tenant-text: #0B1D3A;
}
```

When a tenant page mounts, `applyTenantBranding(tenant.branding)` automatically injects the tenant's exact color scheme into root CSS variables.

### Feature Flags (`TenantFeatures`)
UI features are conditionally rendered based on tenant configuration flags:

```ts
export interface TenantFeatures {
  queue: boolean;
  ticketing: boolean;
  social: boolean;
  messaging: boolean;
  notifications: boolean;
  analytics: boolean;
  verification: boolean;
  customerManagement: boolean;
  branchManagement: boolean;
  servicesManagement: boolean;
}
```

If a tenant (e.g. City Hospital) has `social: false`, the Social Studio navigation item and dashboard modules are hidden automatically.

---

## 🏢 6. DEMO TENANTS INCLUDED

The application comes pre-configured with realistic development tenants (`frontend/src/mock/tenants.ts`):

1. **Acme Bank** (`slug: acme-bank`)
   - **Industry**: Commercial Banking
   - **Primary Color**: `#0057B8` (Bank Blue)
   - **Features**: Queue Booking, Document Pre-Clearance, Social Studio, Branch Network.
2. **City General Hospital** (`slug: city-hospital`)
   - **Industry**: Healthcare & Medical Triage
   - **Primary Color**: `#12A05A` (Emerald Green)
   - **Features**: Outpatient Consultation Triage, Appointments, Document Verification.
3. **Luma Mobile & Fiber** (`slug: luma-telecom`)
   - **Industry**: Telecom & Retail
   - **Primary Color**: `#FF8A00` (Telecom Orange)
   - **Features**: Retail Queueing, SIM Swap Priority Counters, Social Broadcasts.

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
- **Acme Bank Customer Portal**: [http://localhost:3000/tenant/acme-bank](http://localhost:3000/tenant/acme-bank)
- **Acme Bank Staff Console**: [http://localhost:3000/tenant/acme-bank/staff/ops-console](http://localhost:3000/tenant/acme-bank/staff/ops-console)
- **City Hospital Customer Portal**: [http://localhost:3000/tenant/city-hospital](http://localhost:3000/tenant/city-hospital)
- **Business Subdomain Registration**: [http://localhost:3000/register](http://localhost:3000/register)

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
