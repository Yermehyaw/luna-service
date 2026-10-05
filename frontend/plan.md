# Luna Frontend Execution Plan

This document outlines the step-by-step implementation plan for the frontend team to build the MVP of the Luna platform. No actual code is written here; this serves as the architectural blueprint.

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
    *   Allow role assignment (Add staff logins).
    *   Cross-branch performance tracking.
    *   Configuration management (updating the business's branding/colors post-onboarding).

## Summary of Strategy
By relying on dynamic data fetching rather than hardcoded templates, and by utilizing real integrations (ALATPay) and comprehensive feature ports (Social Studio), the frontend will remain flexible, DRY (Don't Repeat Yourself), and capable of scaling infinitely as the SaaS grows.
