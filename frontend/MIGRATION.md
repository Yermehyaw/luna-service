# MIGRATION MAP: VITE SPA TO MULTI-TENANT NEXT.JS APP ROUTER

## Overview
This document maps legacy single-page application routes and components to the unified Next.js App Router multi-tenant architecture inside `frontend/`.

## Route & Page Mapping
| Old SPA Route | New Next.js App Router Route | Purpose |
|---|---|---|
| `/` | `app/(marketing)/page.tsx` | Luna Marketing Homepage |
| `/login` | `app/(platform)/login/page.tsx` | Platform Auth Access |
| `/register` | `app/(platform)/register/page.tsx` | Subdomain Business Signup |
| `/console` | `app/tenant/[tenantId]/staff/ops-console/page.tsx` | Branch Staff Queue Console |
| `/book` | `app/tenant/[tenantId]/book-queue/page.tsx` | Customer Ticket Booking |
| `/track` | `app/tenant/[tenantId]/track/page.tsx` | Live Position Tracking |
| `/verify` | `app/tenant/[tenantId]/verify/page.tsx` | Paperwork Pre-Clearance |

## Core Architectural Improvements
1. **Single Application for All Organizations**: Removed duplicate per-company components in favor of configuration-driven layouts.
2. **CSS Variable Branding**: Replaced hardcoded CSS classes with `--tenant-primary` and `--tenant-accent`.
3. **Repository Abstraction**: Abstracted mock fetch calls behind typed `QueueRepository` and `TenantRepository` interfaces.
