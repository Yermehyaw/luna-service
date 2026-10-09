# LUNA FRONTEND ARCHITECTURE SPECIFICATION

## 1. Executive Summary
Luna Frontend is built as a single Next.js App Router application capable of serving:
- Luna Marketing Website (`app/(marketing)`)
- Luna SaaS Platform Admin (`app/(platform)`)
- Dynamic Tenant Customer Portals (`app/tenant/[tenantId]`)
- Dynamic Tenant Staff Consoles (`app/tenant/[tenantId]/staff`)

## 2. Host-Based & Subdomain Resolution
The middleware at `frontend/middleware.ts` handles host resolution:
- Subdomain `acme-bank.luna.com` or local `acme-bank.localhost:3000` rewrites to `/tenant/acme-bank`
- `app.luna.com` rewrites to `/platform/dashboard`
- Main domain `luna.com` renders the marketing website

## 3. Decoupled Repository Pattern
UI components interact exclusively with abstract TypeScript repository interfaces (`QueueRepository`, `TenantRepository`, `AuthRepository`). Data access is decoupled from UI layout to allow seamless future connection to a FastAPI backend:
```text
UI Component -> QueueRepository -> MockQueueRepository (Replace with FastAPIQueueRepository later)
```

## 4. Branding Engine & Dynamic CSS Variables
Tenant branding colors are dynamically injected into root CSS custom properties (`--tenant-primary`, `--tenant-secondary`, `--tenant-accent`, `--tenant-bg`, `--tenant-text`), allowing a single codebase to adopt different brand identities without duplicate applications.
