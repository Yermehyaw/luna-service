# Luna Frontend Architecture & Philosophy Guide

Welcome to the Luna Frontend repository! This document serves as the holistic implementation guide for the frontend team. It covers the user journeys, feature descriptions, technical architecture, and the strict design philosophy that governs the Luna platform.

---

## 🌍 The Luna Vision & User Journeys

Luna is a multi-tenant B2B2C SaaS platform designed to eliminate physical waiting rooms (the "anti-waiting room" philosophy) and unify customer interactions. 

### The Business Flow (B2B)
1. **Discovery:** A business owner (e.g., a clinic administrator or bank manager) lands on `luna.com`. They learn about the platform's ability to streamline queues and manage customer relations.
2. **Onboarding:** They sign up securely via Clerk. They enter a multi-step onboarding wizard where they define their business type (e.g., Hospitality, Consumer), set their custom subdomain (e.g., `clinic.luna.com`), and upload their brand identity (primary color, logo).
3. **Operations:** Once onboarded, staff log in to the **Business Dashboard** (`app.luna.com`). Here, they access the Smart Queue to call customers, the Social Studio to monitor brand sentiment, and the Ops Console to manage staff roles across branches.

### The Customer Flow (B2C)
1. **Discovery:** A customer visits the business's custom portal (e.g., `clinic.luna.com`). The portal dynamically themes itself to match the business's brand colors and logo.
2. **Booking & Pre-Clearance:** The customer selects a service (e.g., "General Checkup"). If required, they upload pre-clearance documents.
3. **Payment:** They pay for the booking natively using our **Real ALATPay API** integration.
4. **Smart Queue Tracking:** They receive a digital ticket. They can track their live wait time ("11 minutes away") from their phone, allowing them to wait at home or a coffee shop instead of a crowded lobby.
5. **Feedback:** After service, they are prompted to leave feedback on their experience.

---

## 🚀 Core Features

### 1. Dynamic Customer Portals
Rather than hardcoding static templates, the frontend dynamically fetches the business's configuration from the backend. The layout adapts structurally based on the `business_type` and injects dynamic CSS variables to seamlessly reflect the business's branding without requiring custom deployments.

### 2. Smart Queueing
A real-time, WebSocket-powered queue management system. Staff click "Call Next" on the dashboard, and the customer's phone instantly updates. Wait times are dynamically calculated based on historical throughput.

### 3. Social Studio (Omnichannel & AI)
Far more than a simple inbox. This module provides:
*   **Omnichannel Feed:** Collates messages from X (Twitter), Instagram, and direct feedback.
*   **AI Sentiment Analytics:** Uses AI to tag messages as Happy, Neutral, or Angry, and identifies trending topics.
*   **Suggested Replies & Drafting:** AI embeds suggested responses directly into the chat UI and offers drafting tools for outbound social media campaigns.

### 4. Ops Console (Principal Admins)
An elevated dashboard view for managers. It replaces the standard overview to provide cross-branch performance tracking, staff role assignments, and platform configuration.

---

## 🎨 Design System & Philosophy

Luna's visual identity must be strictly adhered to across all interfaces. The design files can be referenced in `Luna_Concept.pdf`.

**Logo Philosophy:** Luna's logo represents our ambition to give businesses greater control and simplify experiences. The distinctive U and N are visually connected through continuous, flowing forms, creating an impression of movement. A small four-point star sits between the U and N.

### Color Palette (Tailwind configured)
Our colors are thoughtfully curated to reflect sophistication.
*   **Warmth (Cream) - `#FFF6E9`:** The main background color for websites and dashboards. It creates a human, accessible experience in an otherwise technical environment.
*   **Intelligence (Dark Purple) - `#291E29`:** Primary text color and dark backgrounds. It represents structure, oversight, and technology-driven thoughtfulness.
*   **Energy (Tangerine) - `#FFA800`:** Embodies our spark of enthusiasm and creativity. **Rule:** Tangerine is NEVER a main background color. It is strictly reserved for buttons, calls to action, and subtle design accents.
*   *Digital Variations:* Extended shades (`#D8AAE0`, `#FFE5B3`, etc.) are used for hovers, borders, and notifications.

### Typography & Hierarchy
*   **Title Font (`font-title`):** **Meigan**. Used strictly for headers and titles. Never use for body text.
*   **Primary Font (`font-primary`):** **Allen Sans**. A geometric sans-serif for general UI and buttons. Fallback: **Kota Sans**.
*   **Secondary Font (`font-secondary`):** **Calibri**. Used specifically for dense documents and presentations.
*   **Hierarchy Rules:** Header copy should be 130%-150% larger than body copy. Titles should be 4-6 times larger than headers.

### Campaign Photography
*   **Direction:** Shot in studio settings with bright background colors.
*   **Casting:** Inclusive casting representing African entrepreneurs of all sorts. The vibe must always be positive and optimistic.

---

## 🏗️ Technical Architecture: The Modular Monolith

To serve the SaaS landing page, the business dashboards, and the thousands of potential customer portals from a single codebase, we use **Next.js Edge Middleware** and **Feature-Sliced Design**.

### 1. Routing Strategy (Local vs. Production)
For local development ease, we are using **Path-Based Routing**. This allows testing different domains without modifying `hosts` files or using `ngrok`.

*   **Local Routing (Path-Based):**
    *   `localhost:3000/` -> Luna SaaS Marketing
    *   `localhost:3000/app/` -> Business Staff Dashboard
    *   `localhost:3000/t/[business_name]/` -> Customer Portal

*   **Production Routing (Subdomain-Based via Middleware):**
    When deploying to production, we activate Next.js Middleware to rewrite host headers. 
    *   `luna.com` -> `src/app/marketing/`
    *   `app.luna.com` -> `src/app/dashboard/`
    *   `[business].luna.com` -> `src/app/[tenant]/`
    *   *To switch to Production Routing:* Enable `src/middleware.ts` and add a wildcard domain (`*.luna.com`) to Vercel.

### 2. Feature-Sliced Design (`src/features/`)
**DO NOT** build complex business logic directly inside the `src/app/` folder. 
All core logic, API calls, and components must be isolated in `src/features/` (e.g., `features/social-studio/`, `features/onboarding/`). The `src/app/` folder only imports these features and handles Next.js layout wrapping.

### 3. Authentication & API Flow
*   The frontend uses **Clerk** to handle user sign-ups and JWT generation.
*   Every request to the FastAPI backend must include the Clerk JWT in the `Authorization` header.
*   The backend verifies the JWT and resolves the user's role and `business_id` dynamically.
