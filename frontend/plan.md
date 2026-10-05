# Luna Frontend Architecture & Philosophy Guide

Welcome to the Luna Frontend repository! This document serves as the holistic implementation guide for the frontend team. It covers the user journeys, feature descriptions, technical architecture, and the strict design philosophy that governs the Luna platform.

---

## 🌍 The Luna Vision & User Journeys

Luna is a multi-tenant B2B2C SaaS platform designed to eliminate physical waiting rooms (the "anti-waiting room" philosophy) and unify customer interactions. 

### The Business Flow (B2B)
1. **Discovery:** A business owner (e.g., a clinic administrator or bank manager) lands on `luna.com`. They learn about the platform's ability to streamline queues and manage customer relations.
2. **Onboarding:** They sign up securely via Clerk. They enter a multi-step onboarding wizard where they define their business type (e.g., Hospitality, Consumer), set their custom subdomain (e.g., `clinic.luna.com`), and upload their brand identity (primary color, logo).
3. **Operations:** Once onboarded, staff log in to the **Business Dashboard**. Here, they access the Smart Queue to call customers, the Social Studio to monitor brand sentiment, and the Ops Console to manage staff roles across branches.

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
*  **Content Creation Ideas:** Using AI credits it allows the business to generate content ideas from sentiments, user replies/comments, trends or routine event-centere pots (e.g holidays, anniversaries etc).
* **Scheduled Posts:** Posts can be scheduled on the calendar to be posted on preffered handles or saved as draft for later.

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



# Luna Frontend Build Flow

This section outlines the step-by-step build in creating with the frontend; this can also serve as the architectural blueprint.

## 1. Luna SaaS Landing Page & Onboarding Flow
**Goal:** A marketing page to attract businesses and a robust onboarding flow to collect data needed for their custom portals.
*   **Step 1.1 - The Hook:** Build the main landing page showcasing the "Anti-Waiting Room" philosophy, the Social Studio intelligence, and future features i.e Brach Connect and Documnet verificxation. It shld also mention the ALATPay payment integration
*   **Step 1.2 - Sign Up:** Integrate Clerk for authentication.
*   **Step 1.3 - The Onboarding Stepper:** Create a multi-step form:
    *   *Step A:* Collect Business Name and verify subdomain availability (e.g., `clinic.luna.com`).
    *   *Step B:* Collect Business Type (Consumer, Hospitality, Professional, Maintenance, Educational).
    *   *Step C:* Collect visual branding (Primary Brand Color HEX, Logo Upload, Preferred Font (Default is Allen Sans)).
    *   *Step D:* Define initial Services/Products rendered.
*   **Step 1.4 - Data Persistence:** Submit this configuration payload to the FastAPI backend to generate the `Business` record.

## 2. Dynamic Customer Portals (Custom Domain Landing Pages)
**Goal:** Auto-generated, highly customizable portals for the businesses' customers to book services, pay, and leave feedback.
*   **Step 2.1 - Dynamic Configuration Fetching:** Do NOT hardcode the 5 templates. Instead, build a generic "Customer Portal Layout" component. When a customer visits `clinic.luna.com`, the Next.js app fetches the JSON configuration (colors, logo, typography, active modules) from FastAPI.
*   **Step 2.2 - Dynamic Rendering:** Use the fetched configuration to inject CSS variables dynamically (e.g., setting `--brand-primary` to the fetched HEX code) so the layout instantly matches the business's identity.
*   **Step 2.3 - The Booking & Queuing Widget:** Implement the flow for a customer to select a service, choose a time slot, and receive a digital queue ticket.
*   **Step 2.4 - From KYC to OYC (Own Your Customer):** Implement customer sign up to the business just before payments to prevent user fatigue/unwillingness to open an acct. Use Clerk auth for this as well. Social media handles shld be requested for in the signup/login modal.
*   **Step 2.4 - Real ALATPay Integration:** Integrate the official ALATPay API. When a service requires a fee, redirect or open the ALATPay modal to securely process the payment before finalizing the booking ticket. Store the ALATPay `reference_id` in the backend.
*   **Step 2.5 - Feedback Flow:** Implement a post-service feedback widget where customers can rate their experience and leave comments.

## 3. The Business Dashboard (Staff & Admin Console)
**Goal:** The control center for staff and management to run the business.
*   **Step 3.1 - Dashboard Shell & Routing:** Build a persistent topbar layout similar to the one in `https://04sxbi-zu0fcjy3f-arcadawebapps2.vercel.app/console`. Ensure routing checks the Clerk user's role (Admin vs Staff) to determine which tabs are visible.
*   **Step 3.2 - Overview Tab:** Build a high-level analytics view showing today's queue volume, revenue processed via ALATPay, and overall sentiment score.
*   **Step 3.3 - Smart Queue Management Tab:** Build the interface for branch staff to view the live queue (via WebSockets), call the next ticket, and mark tickets as resolved.
*   **Step 3.4 - Social Studio Tab:** Port and expand the legacy `Social.tsx` features found in `frontend_old/src/pages/Social.tsx` and use it to build the interface. . This is not just an inbox. It must include:
    *   Omnichannel feed (collating messages).
    *   AI Sentiment Analytics (Angry, Neutral, Happy).
    *   Trending Topics dashboard (What are customers complaining about today?).
    *   AI-suggested replies embedded directly into the chat interface.
    *   Content drafting tools for generating social media posts based on trends.
*   **Step 3.5 - Ops Console (Principal Admins Only):** Build the Manager-specific tab. This replaces the standard overview for Admins.
    *   Allow role assignment and addition/removal of staff logins).
    *   Cross-branch performance tracking.
    *   Configuration management (updating the business's branding/colors post-onboarding).

## Summary
By relying on dynamic data fetching rather than hardcoded templates, and by utilizing real integrations (ALATPay) and comprehensive feature ports (Social Studio), the frontend will remain flexible, DRY (Don't Repeat Yourself), and capable of scaling infinitely as the SaaS grows.
