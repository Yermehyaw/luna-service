To support the hybrid **PWA Reminder Mode** and **Sandbox/Delegated API** strategy without locking your frontend into a hard-to-maintain architecture, all additions are designed around a **Feature Flag & Abstraction Strategy**.

When your backend eventually transitions to direct, fully-automated API publishing, flipping a single workspace configuration flag (`publishing_mode: "DIRECT_API"`) will automatically bypass the mobile handoff flows and restore a standard, automated scheduling UI without requiring a rewrite of your Next.js components.

Here is the complete breakdown of the required frontend features, toggles, alerts, and UI flows.

---

## 1. PWA Installation & Device Onboarding Flow

Because "Reminder Mode" requires Web Push Notifications on mobile devices (especially iOS 16.4+), the frontend must guide staff members to install the PWA and grant notification permissions smoothly.

### Components & Alerts

* **PWA Install Banner (Contextual Prompt):**
* *Trigger:* Appears only on mobile browser view when `window.matchMedia('(display-mode: standalone)').matches` is `false`.
* *UI:* A warm, reassuring bottom drawer: *"Enable mobile publishing reminders for [Workspace Name]. Tap Share and select 'Add to Home Screen'."*
* *Reversibility:* The component checks a single `isPWAInstalled` hook. Once your backend moves to direct API publishing, this component can be globally disabled via a feature flag.


* **Notification Permission Pre-Prompt (Double-Prompt Pattern):**
* *UI:* A custom LUNA modal explaining *why* permissions are needed before triggering the native browser prompt: *"LUNA needs notification access to alert you when it's time to publish your scheduled posts."*
* *Action:* Tapping "Enable Reminders" triggers the native browser `Notification.requestPermission()` and registers the Firebase Cloud Messaging (FCM) Web Push token with FastAPI.



---

## 2. Sandbox & Provider Connection UI

To onboard beta clients onto the Meta Sandbox or third-party APIs without confusing them with technical developer jargon, the frontend hides the complex API plumbing behind simplified status cards.

```
┌─────────────────────────────────────────────────────────────┐
│ INSTAGRAM BUSINESS ACCOUNT                                   │
│ Status: Active (Dedicated Beta Channel)                      │
│                                                             │
│ [!] Action Needed: Accept Meta Developer Access             │
│ We sent an invite to your FB Account. Click below to confirm│
│                                                             │
│ [ Guide Me ]                                [ Check Status ]│
└─────────────────────────────────────────────────────────────┘

```

### Components & Alerts

* **Sandbox Status Indicator Badge:**
* *UI:* Displays a neutral badge on connected social channels in the settings view: `Channel Mode: Guided / Beta`.
* *Reversibility:* When switching to a production Meta App key, this badge simply updates to `Channel Mode: Automated / Direct`.


* **White-Glove Tester Onboarding Modal:**
* *UI:* A 3-step modal shown during channel setup:
1. "Enter your personal Facebook Profile URL."
2. "Check your Facebook Notifications for a Developer Tester Invite from LUNA."
3. "Tap Accept, then return here and click 'Verify Connection'."


* *Action:* Fires a request to `POST /api/v1/social_studio/channels/verify-sandbox` to confirm the user accepted the invite before enabling DM/Analytics features.



---

## 3. Post Composer & Strategy Toggle (The Abstraction Layer)

The Post Composer needs to handle both **Automated Direct Posting** (for platforms connected via APIs like Zernio) and **Reminder Mode Posting** (for Sandbox/unreviewed platforms) within the same interface.

### Toggles & UI Elements

* **Channel Publishing Mode Badge (In-Composer):**
* *UI:* When drafting a post, selecting a channel displays a subtle helper tag next to the social icon:
* Instagram / TikTok: `[Mobile Reminder]`
* Facebook Page: `[Auto-Publish]`


* *Helper Tooltip:* Hovering over `[Mobile Reminder]` reveals: *"You will receive a mobile push notification to publish this post manually in 1 tap."*


* **The `usePublishingMode` Hook:**
* *Logic:* A central Next.js hook that inspects the selected channel's capabilities returned by FastAPI.
* *Behavior:* If `mode === 'REMINDER'`, the CTA button renders as **"Schedule Reminder"**. If `mode === 'DIRECT_API'`, the CTA button renders as **"Schedule Post"**.



---

## 4. Mobile Execution & Handoff Flow (The PWA Experience)

When a scheduled reminder fires, the staff member receives a push notification on their phone. Tapping it opens a dedicated mobile handoff route (`/app/social-studio/reminder/[postId]`).

```
┌─────────────────────────────────────────────────────────────┐
│ 🔔 LUNA PUBLISHING REMINDER                                  │
│ Scheduled for: Today, 5:00 PM                               │
│ Target: Instagram (@bakery_ng)                              │
├─────────────────────────────────────────────────────────────┤
│ [ Media Preview Carousel ]                                  │
│                                                             │
│ Caption:                                                    │
│ "Fresh sourdough loaves available now at our Ikeja branch!" │
│                                                             │
│  [ 📋 Copy Caption & Open Instagram ]  <-- Primary Action   │
│                                                             │
│  [ Snooze 15m ]                           [ Mark as Done ]  │
└─────────────────────────────────────────────────────────────┘

```

### Execution Steps & Micro-Interactions

1. **Notification Tap:** The native OS Web Push notification carries a deep-link payload: `{ url: "/social-studio/reminder/post_123" }`.
2. **The Handoff View:** Displays the media preview, target account, and the full caption text.
3. **The Primary Action Button (`Copy Caption & Open App`):**
* *Step A:* Executes `navigator.clipboard.writeText(caption)` and shows a subtle toast alert: *"Caption copied to clipboard!"*
* *Step B:* Triggers `navigator.share({ files: [mediaFile], title: caption })` to launch the native OS Share Sheet with Instagram, TikTok, or LinkedIn pre-selected.


4. **Post-Execution Feedback Modal:**
* When the user switches back to the LUNA PWA, a bottom sheet slides up asking: *"Did your post go live on Instagram?"*
* *Options:* `[ Yes, Mark as Published ]` (updates backend state to `PUBLISHED`) or `[ Remind Me Later ]` (reschedules notification in 15 minutes).



---

## 5. Universal State & Status Indicators

To keep team members aligned across desktop and mobile, post statuses must clearly reflect where a post is in the "Reminder Mode" lifecycle.

| Status Tag | UI Color | Meaning |
| --- | --- | --- |
| `Draft` | Gray | Post is incomplete or awaiting AI generation. |
| `Scheduled (Reminder)` | Blue | Post is queued; mobile notification scheduled. |
| `Pending Confirmation` | Amber | Push notification sent to staff phone; awaiting "Mark as Published" confirmation. |
| `Published` | Green | Post confirmed live by staff member or verified via read-only API analytics sweep. |
| `Missed Reminder` | Red | Push notification expired without staff confirmation. |

---

## Summary of Reversibility & Clean Abstraction

To ensure these components can be swapped or retired without technical debt when LUNA transitions to direct API publishing:

1. **Encapsulate Handoff UI:** Place all PWA handoff logic inside a single isolated folder: `src/features/social-studio/components/reminder-handoff/`.
2. **Centralize Capabilities Config:** All UI logic must read from a unified API schema payload from FastAPI:
```json
{
  "channel_id": "ig_123",
  "platform": "instagram",
  "capabilities": {
    "publishing_mode": "REMINDER",
    "inbox_supported": true,
    "analytics_supported": true
  }
}

```


3. **Future-Proofing:** When LUNA receives public Meta/TikTok API approvals, FastAPI simply changes `"publishing_mode"` from `"REMINDER"` to `"DIRECT_API"`. The frontend will automatically hide the PWA install prompts, change the composer buttons to "Schedule Post", and bypass the mobile handoff screen entirely—without modifying a single line of frontend component code.
