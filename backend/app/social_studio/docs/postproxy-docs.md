# Quickstart

Postproxy is a unified API for social media platforms, with built-in scheduling, error handling, and retry management. This quickstart covers publishing posts, but the API also handles engagement: managing [comments](/reference/comments/) on your posts, sending and receiving 1:1 [direct messages](/reference/direct-messages/), and reading and replying to [Google Business reviews and Facebook Page recommendations](/reference/profile-comments/). You'll find guides and examples for each platform on the [platform pages](/reference/platforms/).

This guide gets you from zero to your first published post. Grab an API key, connect an account, then pick how you want to publish — the [REST API](#publish-with-the-api), the [MCP server](#publish-with-mcp) for AI agents, or a [no-code tool](#publish-with-no-code-tools) like Zapier or n8n.

## Get your API key

1. Sign up or log in to your [Postproxy dashboard](https://app.postproxy.dev).
2. Open the **API keys** settings and create a key.
3. Copy the key — you'll pass it as a Bearer token on every request.

API keys are either **full access** (your whole account) or **scoped to a single profile group**. See [Authentication](/getting-started/authentication/) for details.

## Connect a social account

In the dashboard, open **Profiles** and authorize the social platforms you want to publish to (Facebook, Instagram, TikTok, LinkedIn, X, YouTube, Threads, Pinterest, Bluesky, Telegram, or Google Business).

Postproxy creates your first **profile group** automatically when you sign up, and each account you connect becomes a **profile** in that group. Once at least one account is connected, you're ready to publish.

Prefer to onboard accounts programmatically? Call `initialize_connection` on a profile group to generate an OAuth URL, then redirect your user to it to authorize the account.


<Tabs>
  <TabItem label="cURL">
    <Code code={initConnBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={initConnJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={initConnPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={initConnGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={initConnRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={initConnPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={initConnJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={initConnCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={initConnResult} lang="json" />

Redirect the user to the returned `url` to complete the OAuth flow. Once they authorize, the account appears as a profile in the group.

## Publish with the API

### Step 1: Get your profiles

First, retrieve your connected profiles to get their IDs.


<Tabs>
  <TabItem label="cURL">
    <Code code={getProfilesBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={getProfilesJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={getProfilesPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={getProfilesGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={getProfilesRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={getProfilesPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={getProfilesJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={getProfilesCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={getProfilesResult} lang="json" />

Note the profile IDs and platform types - you'll use these when creating posts.

### Step 2: Create a post

Post content to one or more profiles. You can specify profiles by their ID or by platform name (uses the first profile for that platform).


<Tabs>
  <TabItem label="cURL">
    <Code code={postNowBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={postNowJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={postNowPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={postNowGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={postNowRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={postNowPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={postNowJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={postNowCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={postNowResult} lang="json" />

Your post will be published to the specified platforms almost immediately.

### Step 3: Schedule a post (optional)

To schedule a post for later, add `scheduled_at` with an ISO 8601 timestamp.


<Tabs>
  <TabItem label="cURL">
    <Code code={postLaterBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={postLaterJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={postLaterPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={postLaterGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={postLaterRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={postLaterPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={postLaterJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={postLaterCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={postLaterResult} lang="json" />

Postproxy handles the scheduling - your post will be published at the specified time.

## Publish with MCP

Prefer to publish from an AI agent? Point any [MCP](https://modelcontextprotocol.io/) client at Postproxy's hosted server — no install required. For Claude Code:

<Code code={`claude mcp add --transport http postproxy \\
  https://mcp.postproxy.dev/mcp?api_key=YOUR_KEY`} lang="bash" />

Replace `YOUR_KEY` with your API key, then prompt your agent with something like *"Check my Postproxy authentication status"* or *"Publish a post to X and LinkedIn."* See the [MCP Server](/automation/mcp-server/) guide for the local npm package and full tool list.

## Publish with no-code tools

If you'd rather wire Postproxy into an automation tool, it plugs into the platforms you already use:

- **[Zapier](/automation/zapier/)** — trigger a Zap, then use the Create Post, Schedule Post, or Create Draft actions.
- **[Make](/automation/make/)** — drop Postproxy into a scenario as a publishing step.
- **[n8n](/automation/n8n/)** — build production publishing pipelines with the Postproxy node.

Each connects with the same API key from the [first step](#get-your-api-key).

## Publish with OpenClaw

Running OpenClaw? Install the [Postproxy skill](https://clawhub.ai/danbaranov/skills/postproxy) from ClawHub and it can publish, schedule, and manage content from chat:

<Code code={`npx clawhub@latest install postproxy`} lang="bash" />

Drop your API key in `~/.openclaw/.env`, then prompt OpenClaw to publish to any connected platform. See the [OpenClaw guide](/how-to/automate-social-media-with-openclaw/) for setup details.

## Supported platforms

Each platform has its own API guide covering supported formats, media limits, and platform-specific parameters:

- [Facebook](/reference/platforms/facebook/)
- [Instagram](/reference/platforms/instagram/)
- [TikTok](/reference/platforms/tiktok/)
- [LinkedIn](/reference/platforms/linkedin/)
- [YouTube](/reference/platforms/youtube/)
- [X (Twitter)](/reference/platforms/twitter/)
- [Threads](/reference/platforms/threads/)
- [Pinterest](/reference/platforms/pinterest/)
- [Bluesky](/reference/platforms/bluesky/)
- [Telegram](/reference/platforms/telegram/)
- [Google Business](/reference/platforms/google-business/)

## Media handling

When creating a post with media, provide URLs to your images or videos. Postproxy downloads and processes the media, then uploads it to each platform according to their requirements.

Each platform has specific constraints for media (file size, formats, dimensions). See [Platform Parameters](/reference/platforms/) for details.

## Rate limits and retries

Social networks have rate limits that Postproxy handles automatically. If a post hits a rate limit, Postproxy queues it and retries when possible. You don't need to implement retry logic in your application.

---

# Authentication

All Postproxy API requests require authentication using a Bearer token in the `Authorization` header.

```
Authorization: Bearer YOUR_API_KEY
```

You can get your API key from your Postproxy dashboard.

## API key types

| Type | Scope |
|------|-------|
| Full Access | Access all profile groups, create/delete profile groups |
| Profile Group Scoped | Access only the specified profile group |

Profile-group-scoped keys can also be created and revoked programmatically with an account-wide key — see the [API Keys reference](/reference/api-keys/).

## Example request

```bash
curl -X GET "https://api.postproxy.dev/api/profiles" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Profile group context

API requests operate within a profile group context:

1. **Explicit parameter**: Pass `?profile_group_id=<id>` as a query parameter
2. **API key scope**: If your API key is scoped to a profile group, that group is used automatically
3. **Default**: If neither is specified and the key has full access, the first profile group is used

---

# post-lifecycle

When you create a post through Postproxy, it moves through a predictable lifecycle. This guide explains each state, what to expect, and how to handle different scenarios.

## Lifecycle overview

<div class="lifecycle-flow">
  <div class="lf-node lf-draft">Draft</div>
  <div class="lf-arrow"><span>publish / schedule</span></div>
  <div class="lf-node lf-pending">Pending<small>media processing</small></div>
  <div class="lf-arrow-short"></div>
  <div class="lf-branch">
    <div class="lf-branch-left">
      <div class="lf-arrow"><span>media ok</span></div>
      <div class="lf-node lf-scheduled">Scheduled</div>
      <div class="lf-arrow"><span>at scheduled time</span></div>
      <div class="lf-node lf-processing">Processing<small>&lt; 1 sec</small></div>
      <div class="lf-arrow"><span>jobs initiated</span></div>
      <div class="lf-node lf-processed">Processed</div>
    </div>
    <div class="lf-branch-right">
      <div class="lf-arrow"><span>media failed</span></div>
      <div class="lf-node lf-failed">Media Processing Failed</div>
    </div>
  </div>
</div>

<style>{`
  .lifecycle-flow {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    padding: 2rem 1rem;
    margin: 1.5rem 0;
    background: var(--sl-color-gray-6, #1a1a2e);
    border: 1px solid var(--sl-color-gray-5, #2a2a3e);
    border-radius: 12px;
  }
  :root[data-theme="light"] .lifecycle-flow {
    background: var(--sl-color-gray-7, #f5f5f8);
    border-color: var(--sl-color-gray-5, #ddd);
  }
  .lf-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    border: 2px solid;
    text-align: center;
    min-width: 140px;
  }
  .lf-node small {
    font-weight: 400;
    font-size: 0.78rem;
    opacity: 0.7;
  }
  .lf-draft {
    border-color: #6b7280;
    background: rgba(107, 114, 128, 0.12);
    color: var(--sl-color-white);
  }
  .lf-pending {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.12);
    color: var(--sl-color-white);
  }
  .lf-scheduled {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.12);
    color: var(--sl-color-white);
  }
  .lf-processing {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.12);
    color: var(--sl-color-white);
  }
  .lf-processed {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.12);
    color: var(--sl-color-white);
  }
  .lf-failed {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.12);
    color: var(--sl-color-white);
  }
  .lf-arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 0;
    position: relative;
  }
  .lf-arrow::before {
    content: '';
    display: block;
    width: 2px;
    height: 18px;
    background: var(--sl-color-gray-3, #666);
  }
  .lf-arrow::after {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid var(--sl-color-gray-3, #666);
  }
  .lf-arrow span {
    font-size: 0.75rem;
    color: var(--sl-color-gray-3, #888);
    margin-top: 2px;
    margin-bottom: 2px;
  }
  .lf-arrow-short {
    width: 2px;
    height: 18px;
    background: var(--sl-color-gray-3, #666);
  }
  .lf-branch {
    display: flex;
    gap: 2rem;
    width: 100%;
    justify-content: center;
    position: relative;
    margin-top: 0;
  }
  .lf-branch::before {
    content: '';
    position: absolute;
    top: 0;
    left: calc(50% - var(--branch-half, 120px));
    right: calc(50% - var(--branch-half, 120px));
    height: 2px;
    background: var(--sl-color-gray-3, #666);
  }
  .lf-branch-left,
  .lf-branch-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    flex: 1;
    max-width: 220px;
  }
  @media (max-width: 540px) {
    .lf-branch {
      flex-direction: column;
      align-items: center;
      gap: 0;
    }
    .lf-branch::before {
      display: none;
    }
    .lf-branch-left,
    .lf-branch-right {
      max-width: 100%;
    }
  }
`}</style>

:::tip[Key concepts]
- **Pending** — Media processing happens here (if you have media)
- **Processed** — Set immediately after publishing jobs are *initiated*, not after they complete
- **No "failed" post status** — Once `processed`, the post stays `processed` even if platforms fail (check platform statuses instead)
- **Media failure** — The only time a post fails at the post level is `media_processing_failed`
:::

---

## Three layers of status

Every post has three independent status layers. Understanding these is essential for building reliable integrations.

<CardGrid>
  <Card title="Post status" icon="document">
    Overall state of the post: `draft`, `pending`, `scheduled`, `processing`, `processed`, or `media_processing_failed`
  </Card>
  <Card title="Platform status" icon="rocket">
    Individual status for each social platform: `pending`, `processing`, `published`, `failed`, or `failed_waiting_for_retry`
  </Card>
  <Card title="Media status" icon="download">
    Processing state of each attachment: `pending`, `processed`, or `failed`
  </Card>
</CardGrid>

---

## Post states

### <Badge text="Draft" variant="note" size="large" /> Draft

Your post is saved but not scheduled for publication. It's a work in progress.

```json
{
  "status": "draft",
  "draft": true,
  "scheduled_at": null
}
```

**Next step:** Call `POST /api/posts/:id/publish` to publish immediately, or update the post with `scheduled_at` to schedule it.

**Can edit/delete:** Yes

---

### <Badge text="Pending" variant="caution" size="large" /> Pending

Your post has been created and media is being processed. The post is not yet ready for publication.

```json
{
  "status": "pending",
  "draft": false,
  "media": [
    { "status": "pending", "content_type": "image/jpeg" }
  ]
}
```

**What happens:**

<Steps>
1. Media files are downloaded from URLs or processed from uploads
2. Files are validated and prepared for each platform
3. Media status transitions: `pending` → `processed` or `failed`
</Steps>

**Next step:**
- All media processed successfully → status becomes `scheduled`
- Any media failed → status becomes `media_processing_failed`

**Typical duration:** Images 1–15 seconds. Videos 10–120 seconds depending on size.

**Can edit/delete:** Cannot edit. Can delete.

---

### <Badge text="Scheduled" variant="success" size="large" /> Scheduled

Your post is ready and queued for publication at the specified time. All media has been successfully processed.

```json
{
  "status": "scheduled",
  "draft": false,
  "scheduled_at": "2024-01-15T10:00:00Z",
  "media": [
    { "status": "processed", "url": "https://cdn.postproxy.dev/..." }
  ]
}
```

**Next step:** At the scheduled time, the system changes status to `processing`, initiates publishing jobs, and immediately transitions to `processed`.

**Can edit/delete:** Cannot edit. Can delete.

---

### <Badge text="Processing" variant="caution" size="large" /> Processing

A brief intermediate state while platform publishing jobs are being enqueued.

```json
{
  "status": "processing",
  "draft": false
}
```

**Duration:** Usually less than 1 second.

**Can edit/delete:** No

---

### <Badge text="Processed" variant="success" size="large" /> Processed

Platform publishing jobs have been **initiated**. The post is now in the hands of each platform's publishing system.

```json
{
  "status": "processed",
  "draft": false
}
```

:::caution
`status: "processed"` does **not** mean all platforms have successfully published. It means jobs have been started. Always check individual platform statuses for actual results.
:::

At the platform level, you may see various states:

```json
{
  "platforms": [
    { "platform": "twitter", "status": "published" },
    { "platform": "instagram", "status": "processing" },
    { "platform": "youtube", "status": "failed" }
  ]
}
```

**Can edit/delete:** Text only, on platforms that support editing — see [Editing published posts](/reference/posts/#editing-published-posts). Can delete from Postproxy (does not remove from social platforms).

---

### <Badge text="Media Processing Failed" variant="danger" size="large" /> Media Processing Failed

One or more media attachments failed to download or process. This is the **only** failure state at the post level.

```json
{
  "status": "media_processing_failed",
  "media": [
    {
      "id": "abc123",
      "status": "failed",
      "error_message": "Media file not found (404)",
      "source_url": "https://example.com/missing.jpg"
    }
  ]
}
```

**Recovery:** Create a new post with correct media URLs and delete the failed post.

---

## Platform-level states

Even if a post has `status: "processed"`, individual platforms can succeed or fail independently.

### Platform status flow

<div class="platform-flow">
  <span class="pf-node">pending</span>
  <span class="pf-sep">→</span>
  <span class="pf-node">processing</span>
  <span class="pf-sep">→</span>
  <span class="pf-node pf-success">published</span>
  <div class="pf-row-gap"></div>
  <span class="pf-indent"></span>
  <span class="pf-sep">↘</span>
  <span class="pf-node pf-danger">failed</span>
  <span class="pf-sep">→</span>
  <span class="pf-node pf-warn">failed_waiting_for_retry</span>
  <span class="pf-sep">→</span>
  <span class="pf-node">processing</span>
  <span class="pf-label">(retry)</span>
</div>

<style>{`
  .platform-flow {
    padding: 1.5rem 1.5rem;
    background: var(--sl-color-gray-6, #1a1a2e);
    border: 1px solid var(--sl-color-gray-5, #2a2a3e);
    border-radius: 10px;
    margin: 1rem 0;
    font-family: var(--sl-font-mono, monospace);
    font-size: 0.85rem;
    line-height: 2.2;
    overflow-x: auto;
    overflow-y: visible;
    white-space: nowrap;
    min-height: fit-content;
  }
  .pf-row-gap {
    display: block;
    height: 0.75rem;
  }
  :root[data-theme="light"] .platform-flow {
    background: var(--sl-color-gray-7, #f5f5f8);
    border-color: var(--sl-color-gray-5, #ddd);
  }
  .pf-node {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 5px;
    background: rgba(107, 114, 128, 0.15);
    border: 1px solid rgba(107, 114, 128, 0.3);
    color: var(--sl-color-white);
  }
  .pf-success {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.4);
  }
  .pf-danger {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.4);
  }
  .pf-warn {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.4);
  }
  .pf-sep {
    margin: 0 6px;
    color: var(--sl-color-gray-3, #888);
  }
  .pf-indent {
    display: inline-block;
    width: 8.5rem;
  }
  .pf-label {
    margin-left: 6px;
    color: var(--sl-color-gray-3);
    font-size: 0.8rem;
  }
`}</style>

### Status definitions

| Status | Meaning |
|--------|---------|
| `pending` | Waiting to be processed |
| `processing` | Currently publishing — active API call in progress |
| `published` | Successfully live on the social network |
| `failed` | Permanent failure — check `error_message` |
| `failed_waiting_for_retry` | Temporary failure, retry scheduled — see `retry_after` |

### Partial success example

Post to 3 platforms where 2 succeed and 1 fails:

```json
{
  "status": "processed",
  "platforms": [
    { "platform": "twitter", "status": "published" },
    { "platform": "linkedin", "status": "published" },
    {
      "platform": "instagram",
      "status": "failed",
      "error_message": "Instagram account disconnected"
    }
  ]
}
```

---

## Retry behavior

Postproxy automatically retries transient failures so you don't have to.

<CardGrid>
  <Card title="Retried automatically" icon="approve-check">
    Network timeouts, temporary rate limits, platform API temporarily unavailable, quota errors
  </Card>
  <Card title="Not retried" icon="close">
    Invalid credentials, account disconnected, content policy violations, invalid media format
  </Card>
</CardGrid>

### Retry schedule

Retries use exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1st retry | 1 minute |
| 2nd retry | 5 minutes |
| 3rd retry | 15 minutes |
| 4th retry | 30 minutes |
| 5th retry | 60 minutes |

Maximum: **5 retry attempts**

### During a retry

```json
{
  "platform": "twitter",
  "status": "failed_waiting_for_retry",
  "error_message": "Rate limit exceeded",
  "retry_attempts": 2,
  "retry_after": "2024-01-15T10:20:00Z"
}
```

---

## Media processing

When you include media in a post, it must be processed before publishing can begin.

### Media states

| Status | Meaning | Duration |
|--------|---------|----------|
| `pending` | Downloading/processing | 1–30 seconds |
| `processed` | Ready for publication | — |
| `failed` | Could not process | Check `error_message` |

### Processing timeline

| Media type | Typical duration |
|-----------|-----------------|
| Small image (< 1 MB) | 1–5 seconds |
| Large image (1–10 MB) | 5–15 seconds |
| Short video (< 100 MB) | 10–30 seconds |
| Large video (> 100 MB) | 30–120 seconds |

### Common media errors

| Error | Cause |
|-------|-------|
| `Media file not found (404)` | URL doesn't exist |
| `Access denied to media file (403)` | URL requires authentication |
| `Connection timed out` | Server too slow or unreachable |
| `Unsupported format` | File type not supported by platform |

:::note
If any media fails, the entire post is blocked. The post status becomes `media_processing_failed` and publishing does not start.
:::

---

## Webhook events

Subscribe to webhooks to receive real-time updates about your posts. See [Webhooks](/reference/webhooks/) for setup.

| Event | When it fires |
|-------|---------------|
| `post.processed` | Post finished processing, jobs initiated |
| `platform_post.published` | Individual platform published successfully |
| `platform_post.failed` | Individual platform failed |
| `platform_post.failed_waiting_for_retry` | Retry scheduled for a platform |
| `media.failed` | Media processing error |
| `platform_post.insights` | New analytics available |

All webhook deliveries share the same envelope (top-level `id`, `object: "event"`, `type`, `created_at`, `data.object`) — see [Webhooks · Event payload](/reference/webhooks/#event-payload).

### Example: post.processed

```json
{
  "id": "whevt_abc",
  "object": "event",
  "type": "post.processed",
  "created_at": "2025-01-15T10:30:00Z",
  "data": {
    "object": {
      "id": "abc123",
      "body": "Hello world!",
      "status": "processed",
      "platforms": [
        { "platform": "twitter", "status": "published" },
        { "platform": "instagram", "status": "published" }
      ]
    }
  }
}
```

### Example: platform_post.failed

```json
{
  "id": "whevt_def",
  "object": "event",
  "type": "platform_post.failed",
  "created_at": "2025-01-15T10:30:01Z",
  "data": {
    "object": {
      "id": "pp_456",
      "post_id": "abc123",
      "platform": "instagram",
      "status": "failed",
      "error": "Invalid credentials"
    }
  }
}
```

---

## Common scenarios

### Scenario 1: Scheduled post (text only)

```bash
POST /api/posts
{
  "post": {
    "body": "Big announcement tomorrow!",
    "scheduled_at": "2024-01-16T09:00:00Z"
  },
  "profiles": ["twitter", "linkedin"]
}
```

<Steps>
1. Immediate response: `status: "scheduled"` (no media to process)
2. At scheduled time: `processing` → `processed` (jobs enqueued, < 1 second)
3. Platform jobs run asynchronously — Twitter and LinkedIn publish independently
</Steps>

---

### Scenario 2: Scheduled post (with media)

```bash
POST /api/posts
{
  "post": {
    "body": "Big announcement tomorrow!",
    "scheduled_at": "2024-01-16T09:00:00Z"
  },
  "profiles": ["instagram", "facebook"],
  "media": ["https://example.com/photo.jpg"]
}
```

<Steps>
1. Immediate response: `status: "pending"`, media `status: "pending"`
2. Media processing: 5–15 seconds
3. Media processed → post becomes `scheduled`
4. At scheduled time: `processing` → `processed` (jobs initiated)
5. Platform jobs run asynchronously
</Steps>

---

### Scenario 3: Immediate publish

```bash
POST /api/posts
{
  "post": { "body": "Live now!" },
  "profiles": ["twitter"]
}
```

<Steps>
1. System sets `scheduled_at` to current time
2. Status: `scheduled` → `processing` → `processed` (< 1 second)
3. Twitter platform job runs (1–5 seconds)
</Steps>

**Total time:** 2–10 seconds

---

### Scenario 4: Draft workflow

```bash
# Step 1: Create draft
POST /api/posts
{
  "post": { "body": "Work in progress", "draft": true },
  "profiles": ["twitter"]
}
# Response: status: "draft"
```

```bash
# Step 2: Publish when ready (hours or days later)
POST /api/posts/abc123/publish
# Response: status: "processing"
```

The draft stays in `draft` status with no automatic publishing until you explicitly call `/publish`.

---

### Scenario 5: Partial platform failure

<Steps>
1. Post status: `processing` → `processed` (< 1 second)
2. Platform jobs run independently:
   - Twitter: published (2 sec)
   - LinkedIn: published (3 sec)
   - Instagram: **failed** — account disconnected (4 sec)
3. Post remains `processed` — platform statuses show mixed results
</Steps>

**After platforms finish:**

```json
{
  "status": "processed",
  "platforms": [
    { "platform": "twitter", "status": "published" },
    { "platform": "linkedin", "status": "published" },
    {
      "platform": "instagram",
      "status": "failed",
      "error_message": "Instagram account disconnected"
    }
  ]
}
```

**Recovery:** Fix Instagram connection in your dashboard, then create a new post for Instagram if needed.

---

### Scenario 6: Automatic retry

<Steps>
1. Post status: `processing` → `processed` (job initiated)
2. Twitter API returns rate limit error
3. Platform status: `failed_waiting_for_retry`
4. System waits 1 minute, retries automatically
5. Twitter publishes successfully
</Steps>

**During retry:**
```json
{
  "status": "processed",
  "platforms": [{
    "platform": "twitter",
    "status": "failed_waiting_for_retry",
    "retry_after": "2024-01-15T10:01:00Z"
  }]
}
```

---

## Timeline reference

| Phase | Duration | Notes |
|-------|----------|-------|
| Post creation | < 1 sec | Post created with initial status |
| Media processing (images) | 1–15 sec | Post in `pending` status |
| Media processing (video) | 10–120 sec | Depends on file size |
| Scheduling | Instant | Post → `scheduled` after media ready |
| Job initiation | < 1 sec | `processing` → `processed` |
| Platform publishing (text) | 1–5 sec | Per platform |
| Platform publishing (images) | 5–15 sec | Per platform |
| Platform publishing (video) | 10–60 sec | Per platform |
| Retries | 1–60 min | Exponential backoff, max 5 attempts |
| First insights | 1+ hour | After platform reports `published` |
| Insight updates | 2–12 hours | Varies by platform |

### Platform-specific notes

- **TikTok** — May take 1–5 minutes for video processing on their end
- **YouTube** — Large videos may take longer to upload
- **Instagram / Twitter / Facebook / LinkedIn** — Usually fastest (1–10 seconds)

---

## Filtering posts by status

Use the `status` query parameter to filter posts:

```bash
GET /api/posts?status=draft
GET /api/posts?status=scheduled
GET /api/posts?status=published
GET /api/posts?status=failed
```

| Filter | What you get |
|--------|--------------|
| `draft` | All draft posts |
| `scheduled` | Posts scheduled for the future |
| `published` | Successfully published posts (`status: "processed"`) |
| `failed` | Posts with at least one failed platform |

---

## Best practices

<CardGrid>
  <Card title="Check platform statuses" icon="information">
    `processed` means jobs started, not completed. Always check individual platform statuses for actual publishing state.
  </Card>
  <Card title="Handle retries gracefully" icon="approve-check">
    Don't alert users on first failure. Check for `failed_waiting_for_retry` and wait for automatic retries before reporting permanent failures.
  </Card>
  <Card title="Use webhooks" icon="rocket">
    Instead of polling the API, subscribe to webhook events for instant notifications and fewer API calls.
  </Card>
  <Card title="Plan for partial failures" icon="warning">
    Posts can partially succeed — some platforms publish while others fail. Handle this in your UI and allow users to retry failed platforms.
  </Card>
</CardGrid>

---

## Related

- [Posts API Reference](/reference/posts/) — Endpoint details for creating and managing posts
- [Platform Parameters](/reference/platforms/) — Platform-specific options
- [Webhooks](/reference/webhooks/) — Webhook setup and event types

---

# sdks

Postproxy provides official SDKs for 7 languages. Each SDK wraps the REST API with idiomatic methods, type definitions, and built-in error handling.

## Installation

<Tabs>
  <TabItem label="Node">
    <Code code="npm install postproxy-sdk" lang="bash" />
  </TabItem>
  <TabItem label="Python">
    <Code code="pip install postproxy-sdk" lang="bash" />
  </TabItem>
  <TabItem label="Go">
    <Code code="go get github.com/postproxy/postproxy-go" lang="bash" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code="gem install postproxy-sdk" lang="bash" />
  </TabItem>
  <TabItem label="PHP">
    <Code code="composer require postproxy/postproxy-php" lang="bash" />
  </TabItem>
  <TabItem label="Java">
    <Code code={`// Gradle
implementation 'dev.postproxy:postproxy-java:1.+'

// Maven
<dependency>
  <groupId>dev.postproxy</groupId>
  <artifactId>postproxy-java</artifactId>
  <version>1.+</version>
</dependency>`} lang="groovy" />
  </TabItem>
  <TabItem label=".NET">
    <Code code="dotnet add package PostProxy" lang="bash" />
  </TabItem>
</Tabs>

## Initialization

<Tabs>
  <TabItem label="Node">
    <Code code={`import PostProxy from "postproxy-sdk";

const client = new PostProxy("YOUR_API_KEY");`} lang="typescript" />
  </TabItem>
  <TabItem label="Python">
    <Code code={`from postproxy import PostProxy

client = PostProxy("YOUR_API_KEY")`} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={`import postproxy "github.com/postproxy/postproxy-go"

client := postproxy.New("YOUR_API_KEY")`} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={`require "postproxy"

client = PostProxy::Client.new("YOUR_API_KEY")`} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={`use PostProxy\\PostProxy;

$client = new PostProxy("YOUR_API_KEY");`} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={`import dev.postproxy.PostProxy;

PostProxy client = new PostProxy("YOUR_API_KEY");`} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={`using PostProxy;

var client = new PostProxyClient("YOUR_API_KEY");`} lang="csharp" />
  </TabItem>
</Tabs>

## Available SDKs

| Language | Package | GitHub |
|----------|---------|--------|
| Node / TypeScript | [`postproxy-sdk`](https://www.npmjs.com/package/postproxy-sdk) | [postproxy/postproxy-node](https://github.com/postproxy/postproxy-node) |
| Python | [`postproxy-sdk`](https://pypi.org/project/postproxy-sdk/) | [postproxy/postproxy-python](https://github.com/postproxy/postproxy-python) |
| Go | `postproxy-go` | [postproxy/postproxy-go](https://github.com/postproxy/postproxy-go) |
| Ruby | [`postproxy-sdk`](https://rubygems.org/gems/postproxy-sdk) | [postproxy/postproxy-ruby](https://github.com/postproxy/postproxy-ruby) |
| PHP | [`postproxy/postproxy-php`](https://packagist.org/packages/postproxy/postproxy-php) | [postproxy/postproxy-php](https://github.com/postproxy/postproxy-php) |
| Java | [`dev.postproxy:postproxy-java`](https://central.sonatype.com/artifact/dev.postproxy/postproxy-java) | [postproxy/postproxy-java](https://github.com/postproxy/postproxy-java) |
| .NET | [`PostProxy`](https://www.nuget.org/packages/PostProxy/) | [postproxy/postproxy-dotnet](https://github.com/postproxy/postproxy-dotnet) |

## Features

| Feature | Node | Python | Go | Ruby | PHP | Java | .NET |
|---------|------|--------|----|------|-----|------|------|
| Typed responses | ✓ | ✓ | ✓ | — | — | ✓ | ✓ |
| Async support | ✓ | ✓ | ✓ | — | — | ✓ | ✓ |
| File uploads | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile group scoping | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

All SDKs support passing a `profileGroupId` (or equivalent) at the client level or per-request.

---

# Examples

Ready-to-use examples for the most common API workflows. Each example includes code in 8 languages with full request and response samples. You can also download all examples as a ready-to-run collection for [Bruno](https://www.usebruno.com/): [postproxy/postproxy-api-collection](https://github.com/postproxy/postproxy-api-collection).

---

## List posts

Fetch a paginated list of your posts.


<Tabs>
  <TabItem label="cURL">
    <Code code={listPostsBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={listPostsJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={listPostsPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={listPostsGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={listPostsRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={listPostsPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={listPostsJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={listPostsCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={listPostsResult} lang="json" />

See [Posts API Reference](/reference/posts/#list-posts) for all query parameters including filtering by status, platform, and schedule date.

---

## Get a single post

Retrieve full details for a post including media, platform results, and insights.


<Tabs>
  <TabItem label="cURL">
    <Code code={getPostBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={getPostJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={getPostPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={getPostGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={getPostRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={getPostPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={getPostJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={getPostCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={getPostResult} lang="json" />

---

## Create a post

Publish a simple post with an image to a single platform.


<Tabs>
  <TabItem label="cURL">
    <Code code={createPostBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={createPostJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={createPostPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={createPostGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={createPostRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={createPostPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={createPostJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={createPostCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={createPostResult} lang="json" />

---

## Update a post

Modify an existing draft or scheduled post. You can update the body, profiles, media, or any other field. Only send the fields you want to change — everything else stays the same.


<Tabs>
  <TabItem label="cURL">
    <Code code={updatePostBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={updatePostJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={updatePostPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={updatePostGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={updatePostRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={updatePostPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={updatePostJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={updatePostCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={updatePostResult} lang="json" />

Only draft posts and scheduled posts (more than 5 minutes before publish time) can be updated. When sending `profiles` or `media`, the existing values are fully replaced. See [Update post](/reference/posts/#update-post) for full details on update behavior.

---

## Create a post with a local file

Instead of passing media URLs, you can upload files directly from your computer. Use `multipart/form-data` with form fields `post[body]`, `profiles[]`, and `media[]`. This example uses an image from `~/Downloads`:


<Tabs>
  <TabItem label="cURL">
    <Code code={createPostFileBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={createPostFileJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={createPostFilePython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={createPostFileGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={createPostFileRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={createPostFilePhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={createPostFileJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={createPostFileCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={createPostFileResult} lang="json" />

Replace the file path with your own — for example, `$HOME/Downloads/your-image.png` on macOS/Linux or `%USERPROFILE%\Downloads\your-image.png` on Windows.

---

## Cover Images

Some platforms (Instagram Reels, YouTube, Pinterest, TikTok videos) support a cover image. Postproxy downloads and stores cover images to ensure they're available at publish time, even if the original URL becomes unavailable.

- **`cover_url`** (string) — URL of the image. Postproxy downloads and stores it.
- **`cover_file`** — File upload (multipart) or base64-encoded image (data URI or `{"base64": "...", "content_type": "image/png"}`).

Use `cover_url` when sending `platforms` as JSON, `cover_file` when sending as multipart form fields or base64.

**JSON example** (cover as URL):

```json
{
  "platforms": {
    "youtube": {
      "privacy_status": "public",
      "cover_url": "https://example.com/thumbnail.jpg"
    }
  }
}
```

**JSON example** (cover as base64):

```json
{
  "platforms": {
    "youtube": {
      "privacy_status": "public",
      "cover_file": {
        "base64": "iVBORw0KGgo...",
        "content_type": "image/png",
        "filename": "thumbnail.png"
      }
    }
  }
}
```

**Multipart example** (cover as file upload):

```bash
curl -X POST https://api.postproxy.dev/api/posts \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "post[body]=My post" \
  -F "profiles[]=youtube" \
  -F "media[]=@video.mp4" \
  -F "platforms[youtube][privacy_status]=public" \
  -F "platforms[youtube][title]=My Video" \
  -F "platforms[youtube][cover_file]=@thumbnail.jpg"
```

When sending platform parameters as form fields, string values are automatically cast to their expected types (e.g. `"false"` → `false`, `"22"` → `22`).

**Multipart with `platforms` as a JSON string:** if you'd rather keep `platforms` as a single JSON blob alongside your multipart media uploads, that also works. Nested values keep their original types (no casting needed), and you can still reference uploaded files by path:

```bash
curl -X POST https://api.postproxy.dev/api/posts \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F 'post[body]=Hello world from API!' \
  -F 'post[draft]=true' \
  -F 'media[]=@/path/to/video.mp4' \
  -F 'profiles[]=youtube' \
  -F 'platforms={"youtube":{"made_for_kids":false,"privacy_status":"public","title":"My Video","tags":["launch","product"],"category_id":"22"}}'
```

---

## Cross-post to multiple platforms

Post a video to YouTube, TikTok, and Instagram simultaneously with platform-specific parameters for each.


<Tabs>
  <TabItem label="cURL">
    <Code code={crossPostBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={crossPostJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={crossPostPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={crossPostGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={crossPostRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={crossPostPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={crossPostJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={crossPostCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={crossPostResult} lang="json" />

Each platform gets its own `params` — YouTube gets a title and privacy setting, TikTok gets its privacy status, and Instagram is published as a reel with a first comment. See [Platform Parameters](/reference/platforms/) for all available options.

---

## Create a thread

Post a multi-part thread to X (Twitter) and Threads. Each item in the `thread` array becomes a reply to the previous post. Thread children can also include media.


<Tabs>
  <TabItem label="cURL">
    <Code code={threadPostBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={threadPostJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={threadPostPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={threadPostGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={threadPostRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={threadPostPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={threadPostJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={threadPostCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={threadPostResult} lang="json" />

:::note
Threads are only supported on X (Twitter) and Threads. The array order determines the posting sequence. Per-platform chains run independently — a failure on X does not block the Threads chain.
:::

---

## Schedule a post

Set `scheduled_at` with an ISO 8601 timestamp to publish a post at a specific time. Postproxy handles the scheduling automatically.


<Tabs>
  <TabItem label="cURL">
    <Code code={scheduledPostBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={scheduledPostJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={scheduledPostPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={scheduledPostGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={scheduledPostRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={scheduledPostPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={scheduledPostJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={scheduledPostCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={scheduledPostResult} lang="json" />

The post status is `scheduled` and `attempted_at` is `null` until the scheduled time arrives.

---

## Create a draft and publish later

Set `draft: true` to create a post without publishing it. Review the content, then publish it with a separate API call when ready.


**Step 1:** Create the draft.

<Tabs>
  <TabItem label="cURL">
    <Code code={draftPostBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={draftPostJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={draftPostPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={draftPostGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={draftPostRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={draftPostPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={draftPostJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={draftPostCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={draftPostResult} lang="json" />

**Step 2:** Publish when ready.

```bash
curl -X POST "https://api.postproxy.dev/api/posts/drf456abc/publish" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

The SDK examples above show both steps. See [Publish post](/reference/posts/#publish-post) for details.

---

## Get post stats

Retrieve engagement metrics (impressions, likes, comments, etc.) for one or more posts. Stats are collected periodically and returned as time-series snapshots. You can filter by platform and date range.


<Tabs>
  <TabItem label="cURL">
    <Code code={postStatsBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={postStatsJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={postStatsPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={postStatsGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={postStatsRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={postStatsPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={postStatsJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={postStatsCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={postStatsResult} lang="json" />

The `stats` fields vary by platform. See [Stats fields by platform](/reference/posts/#stats-fields-by-platform) for the full breakdown.

---

## Get profiles

List all connected social media profiles in your account.


<Tabs>
  <TabItem label="cURL">
    <Code code={listProfilesBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={listProfilesJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={listProfilesPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={listProfilesGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={listProfilesRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={listProfilesPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={listProfilesJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={listProfilesCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={listProfilesResult} lang="json" />

Use the `id` from the response when creating posts with specific profiles. You can also use platform names like `"twitter"` as a shorthand — Postproxy will pick the first connected profile for that platform.

---

## Connect a new profile

Use the Initialize Connection endpoint to generate an OAuth URL for connecting a new social media account. Redirect the user to the returned URL — after they authenticate, they'll be sent back to your `redirect_url` and the profile is created automatically.


<Tabs>
  <TabItem label="cURL">
    <Code code={initConnBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={initConnJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={initConnPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={initConnGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={initConnRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={initConnPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={initConnJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={initConnCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={initConnResult} lang="json" />

Redirect the user to the `url` in the response. Supported platforms: `facebook`, `instagram`, `tiktok`, `linkedin`, `youtube`, `twitter`, `threads`, `pinterest`. See [Initialize Connection](/reference/profile-groups/#initialize-connection) for full details.

---

## List comments on a post

Fetch comments on a published post, including nested replies. Supported on Instagram, Facebook, Threads, Bluesky, and YouTube, with LinkedIn coming soon.


<Tabs>
  <TabItem label="cURL">
    <Code code={listCommentsBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={listCommentsJs} lang="js" />
  </TabItem>
  <TabItem label="Go">
    <Code code={listCommentsGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={listCommentsRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={listCommentsPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={listCommentsJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={listCommentsCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={listCommentsResult} lang="json" />

Each top-level comment includes a `replies` array with all nested replies. See [Comments API Reference](/reference/comments/#list-comments) for pagination and filtering options.

---

## Create a comment

Post a comment on a published post. The comment is stored immediately and published to the platform asynchronously.


<Tabs>
  <TabItem label="cURL">
    <Code code={createCommentBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={createCommentJs} lang="js" />
  </TabItem>
  <TabItem label="Go">
    <Code code={createCommentGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={createCommentRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={createCommentPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={createCommentJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={createCommentCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={createCommentResult} lang="json" />

The comment starts with `status: "pending"` and updates to `"published"` once it's live on the platform.

---

## Reply to a comment

Reply to an existing comment by passing `parent_id`. Works the same as creating a comment, but nests the reply under the specified parent.


<Tabs>
  <TabItem label="cURL">
    <Code code={replyCommentBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={replyCommentJs} lang="js" />
  </TabItem>
  <TabItem label="Go">
    <Code code={replyCommentGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={replyCommentRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={replyCommentPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={replyCommentJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={replyCommentCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={replyCommentResult} lang="json" />

You can also hide, unhide, like, unlike, and delete comments. See the [Comments API Reference](/reference/comments/) for all available actions.

---

# overview

The Postproxy API allows you to programmatically create and manage social media posts across multiple platforms including Facebook, Instagram, TikTok, LinkedIn, YouTube, X (Twitter), Threads, Pinterest, Bluesky, Telegram, and Google Business. Beyond publishing, you can also handle engagement — read and reply to [comments](/reference/comments/) on your posts and read and send 1:1 [direct messages](/reference/direct-messages/).

## Base URL

All API requests should be made to:

```
https://api.postproxy.dev
```

## Authentication

All API requests require authentication using a Bearer token in the `Authorization` header.

```http
Authorization: Bearer your_api_key_here
```

### API Key Types

| Type | Scope | Capabilities |
|------|-------|--------------|
| Full Access | Entire account | Access all profile groups, create/delete profile groups |
| Profile Group Scoped | Single profile group | Access only the specified profile group, cannot create/delete profile groups |

### Profile Group Context

API requests operate within a profile group context. The profile group is determined by:

1. **Explicit parameter**: Pass `?profile_group_id=<id>` as a query parameter
2. **API key scope**: If your API key is scoped to a profile group, that group is used automatically
3. **Default**: If neither is specified and the key has full access, the first profile group in your account is used

## Response Format

All responses are JSON. IDs are returned as string IDs.

### Successful Responses

**Single resource:**

```json
{
  "id": "abc123xyz",
  "name": "My Profile Group",
  "profiles_count": 3
}
```

**Collection with pagination:**

```json
{
  "total": 150,
  "page": 1,
  "per_page": 10,
  "data": [
    { "id": "..." },
    { "id": "..." }
  ]
}
```

### Error Responses

| Code | Response |
|------|----------|
| `401` | `{"error": "Invalid API key"}` |
| `404` | `{"error": "Not found"}` |
| `400` | `{"status": 400, "error": "Bad Request", "message": "..."}` |
| `422` | `{"errors": ["Validation error message"]}` |

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200 OK` | Request succeeded |
| `201 Created` | Resource was created successfully |
| `400 Bad Request` | Missing required parameters |
| `401 Unauthorized` | Invalid, missing, or insufficient API key permissions |
| `404 Not Found` | Resource does not exist or is not accessible |
| `409 Conflict` | Duplicate submission, or a request with the same `Idempotency-Key` is still in flight |
| `422 Unprocessable Entity` | Validation failed |
| `429 Too Many Requests` | Posting rate limit reached |

## Idempotency

Any write request (`POST`, `PUT`, `PATCH`, `DELETE`) can carry an `Idempotency-Key` header. If the connection drops before you see the response, retry with the same key and you get the original response back instead of creating a second post.

```bash
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Idempotency-Key: 3f8b1c94-6a2d-4f0e-9d31-7c5e2a8b4f10" \
     -H "Content-Type: application/json" \
     -d '{ "post": { "body": "Hello" }, "profiles": ["prof123abc"] }'
```

Generate a fresh key per logical operation — a UUID is ideal. Keys are scoped to your account and may be up to 255 characters.

| Situation | Result |
|-----------|--------|
| First request with the key | Runs normally |
| Retry after a success | Original status and body replayed, with an `Idempotent-Replay: true` response header |
| Retry while the first request is still running | `409 Conflict` — wait and retry |
| Same key, different request body | `422 Unprocessable Entity` |
| Retry after an error response | Runs normally — errors are not replayed |

Only successful (`2xx`) responses are stored, so a request that failed validation, hit a quota, or was rate-limited leaves the key free: fix the payload and retry with the same key. Stored responses are kept for **24 hours**; after that, reusing a key executes the request again.

Requests without the header are unaffected. Post creation also has an independent duplicate guard: an identical body sent to the same profiles within a minute is rejected with `409 Conflict` and a `duplicate_post_id`, whether or not you send a key.

## Versioning & Deprecation

The API has a single stable version served at `https://api.postproxy.dev/api` — there is no version segment in the URL and no version header to manage. Changes are additive: new endpoints, optional parameters, and response fields may appear over time, and clients should ignore response fields they do not recognize. Existing fields, parameters, and status codes are not changed or removed without a deprecation cycle.

When something is deprecated, it is marked `deprecated: true` in the [OpenAPI specification](https://postproxy.dev/openapi.json) and announced in the [changelog](/getting-started/changelog/) at least 90 days before removal. The specification itself carries a date-based version (`info.version`) that updates when the surface changes.

## Pagination

List endpoints support pagination with the following query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (1-based). Passing `0` returns page `1` |
| `per_page` | integer | `10` | Number of items per page |

## API Resources

| Resource | Description |
|----------|-------------|
| [Posts](/reference/posts/) | Create, list, and delete posts |
| [Queues](/reference/queues/) | Manage posting queues with recurring timeslots and priority |
| [Profiles](/reference/profiles/) | List connected social media profiles |
| [Placements](/reference/placements/) | List all account placements and switch which connected profile serves them (account-wide keys) |
| [Google Business](/reference/platforms/google-business/#business-profile-management) | Read and update a Business Profile location: hours, attributes, services, food menus, action links, profile media |
| [Facebook Page](/reference/platforms/facebook/#page-profile-management) | Read and update a Facebook Page's profile: about, description, website, phone, emails |
| [Pinterest](/reference/platforms/pinterest/#board-management) | Create and delete Pinterest boards |
| [YouTube](/reference/platforms/youtube/#playlists) | List, create, update and delete YouTube playlists |
| [Instagram](/reference/platforms/instagram/#reel-audio) | Search reel audio and manage incoming collaboration invites (Facebook-login profiles) |
| [Profile Groups](/reference/profile-groups/) | Manage profile groups |
| [API Keys](/reference/api-keys/) | Create, list, and revoke profile-group-scoped API keys (account-wide keys) |
| [Comments](/reference/comments/) | Read and reply to comments on published posts, per post or across many at once |
| [Direct Messages](/reference/direct-messages/) | Read and send 1:1 chats and messages on Facebook, Instagram, Telegram, and Bluesky |
| [Profile Comments](/reference/profile-comments/) | Read and reply to profile-scoped comments (Google Business reviews, Facebook Page recommendations) |
| [Webhooks](/reference/webhooks/) | Subscribe to post events |
| [Calendar](/reference/calendar/) | View scheduled posts calendar |

## Supported Platforms

Each platform has its own reference page with media limits, parameters, comments, direct messages, and webhooks — see [Platforms](/reference/platforms/).

| Platform | Platform ID | Available Formats |
|----------|------------|-------------------|
| [Facebook](/reference/platforms/facebook/) | `facebook` | `post`, `reel`, `story` |
| [Instagram](/reference/platforms/instagram/) | `instagram` | `post`, `reel`, `story` |
| [TikTok](/reference/platforms/tiktok/) | `tiktok` | `video`, `image` |
| [LinkedIn](/reference/platforms/linkedin/) | `linkedin` | `post` |
| [YouTube](/reference/platforms/youtube/) | `youtube` | `post` (channel video) |
| [X (Twitter)](/reference/platforms/twitter/) | `twitter` | `post`, `poll` |
| [Threads](/reference/platforms/threads/) | `threads` | `post` |
| [Pinterest](/reference/platforms/pinterest/) | `pinterest` | `pin` |
| [Bluesky](/reference/platforms/bluesky/) | `bluesky` | `post` |
| [Telegram](/reference/platforms/telegram/) | `telegram` | `post` (publishes to channels via [bring-your-own-bot](/guides/telegram-byo-bot/)) |
| [Google Business](/reference/platforms/google-business/) | `google_business` | `standard`, `event`, `offer`, `photo` (local posts and gallery photos on Business Profile locations; replies to reviews via [Profile Comments](/reference/profile-comments/)) |

---

# posts

The Posts API allows you to create, retrieve, update, and delete social media posts across multiple platforms.

:::note
All calls require authentication.
:::

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/posts` | List all posts |
| `GET` | `/api/posts/:id` | Get a single post |
| `GET` | `/api/posts/stats` | Get stats snapshots for posts |
| `POST` | `/api/posts` | Create a new post |
| `PATCH` | `/api/posts/:id` | Update an existing post |
| `POST` | `/api/posts/:id/publish` | Publish a draft post |
| `DELETE` | `/api/posts/:id` | Delete a post |
| `POST` | `/api/posts/:id/delete_on_platform` | Delete a post from social media platforms |

---

## List posts

<span class="method get">GET</span> `/api/posts`

Retrieves a paginated list of all posts in the current profile group. Thread children are not returned as top-level items — only parent posts appear. Use the Get Post endpoint to retrieve thread children for a specific post.

### Query parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `page` | integer | No | `1` | Page number (1-based). Passing `0` returns page `1` |
| `per_page` | integer | No | `10` | Number of posts per page |
| `profile_group_id` | string | No | - | Filter by profile group (id) |
| `status` | string | No | - | Filter by status: `draft`, `scheduled`, `published`, `failed` |
| `platforms` | array | No | - | Array of platforms (e.g., `platforms[]=instagram&platforms[]=tiktok`) |
| `source` | string | No | - | Filter by source: `postproxy` (created via app or API) or `imported` (imported from a connected platform) |
| `scheduled_after` | string | No | - | ISO 8601 date to filter posts scheduled after that date |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={listPostsBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={listPostsJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={listPostsPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={listPostsGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={listPostsRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={listPostsPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={listPostsJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={listPostsCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={listPostsResult} lang="json" />

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total number of posts |
| `page` | integer | Current page number |
| `per_page` | integer | Items per page |
| `data` | array | Array of post objects |

---

## Get post

<span class="method get">GET</span> `/api/posts/:id`

Retrieves a single post by its ID.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Post id |

### Query parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_group_id` | string | No | Scope the lookup to a specific profile group |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={getPostBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={getPostJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={getPostPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={getPostGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={getPostRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={getPostPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={getPostJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={getPostCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={getPostResult} lang="json" />

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique post identifier (id) |
| `body` | string | Post body/text content |
| `status` | string | Post status: `processing`, `processed`, `scheduled` |
| `source` | string | Origin of the post: `postproxy` (created via app or API) or `imported` (imported from a connected platform) |
| `scheduled_at` | string\|null | ISO 8601 timestamp if scheduled, null otherwise |
| `created_at` | string | ISO 8601 timestamp of creation |
| `queue_id` | string\|null | Queue ID if the post belongs to a queue |
| `queue_priority` | string\|null | Priority level (`high`, `medium`, `low`) if in a queue |
| `media` | array | Array of media attachment objects |
| `platforms` | array | Array of platform-specific posting results |
| `thread` | array | Array of thread child posts (only present for thread posts). Each item carries its own `platforms` array — see [Checking a thread was fully delivered](#checking-a-thread-was-fully-delivered) |

### Media object fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique attachment identifier (id) |
| `status` | string | Processing status: `pending`, `processed`, `failed` |
| `error_message` | string\|null | Error details if processing failed |
| `content_type` | string | MIME type (e.g. `image/jpeg`, `video/mp4`) |
| `source_url` | string\|null | Original source URL if media was provided as a URL |
| `url` | string\|null | Hosted URL of the processed file (null if not yet processed) |
| `platforms` | array | Per-platform formatting/upload errors for this attachment. Only included when at least one platform had an error processing this specific media file. Omitted when there are no platform-level errors |

### Media platform object fields

Each entry in a media `platforms` array describes a platform-specific error for that attachment (e.g. format/aspect ratio rejected on Instagram, file size too large on Twitter):

| Field | Type | Description |
|-------|------|-------------|
| `platform` | string | Network identifier (`instagram`, `twitter`, etc.) |
| `status` | string | Per-platform attachment status |
| `error` | string | Error summary for this attachment on this platform |
| `error_details` | object\|null | Structured platform error (omitted when no platform error info is available) |
| `error_details.platform_error_code` | string\|null | Error code returned by the platform API |
| `error_details.platform_error_subcode` | string\|null | Error subcode returned by the platform API |
| `error_details.platform_error_message` | string\|null | Error message returned by the platform API |
| `error_details.postproxy_note` | string\|null | Additional context from Postproxy about the error |

### Thread child fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (id) of the child post |
| `body` | string | Text content of the child post |
| `media` | array | Array of media attachment objects (same structure as above) |

### Platform object fields

| Field | Type | Description |
|-------|------|-------------|
| `platform` | string | Platform identifier: `facebook`, `instagram`, `tiktok`, `linkedin`, `youtube`, `twitter`, `threads`, `pinterest` |
| `profile_id` | string | ID of the connected profile this platform entry was posted to |
| `profile_name` | string | Display name of the connected profile |
| `status` | string | Platform posting status: `processing`, `published`, `failed`, `pending_deletion`, `deleted` |
| `params` | object\|null | Platform-specific parameters used for this post |
| `error` | string\|null | Error summary (null on success) |
| `error_details` | object\|null | Structured error details from the platform (null when no platform error info is available) |
| `error_details.platform_error_code` | string\|null | Error code returned by the platform API |
| `error_details.platform_error_subcode` | string\|null | Error subcode returned by the platform API |
| `error_details.platform_error_message` | string\|null | Error message returned by the platform API |
| `error_details.postproxy_note` | string\|null | Additional context from Postproxy about the error |
| `attempted_at` | string\|null | ISO 8601 timestamp of posting attempt |
| `insights` | object | Engagement metrics (when available) |
| `permalink` | string\|null | Direct URL to the published post on the platform. Null if not published or permalink is unavailable |
| `insights.impressions` | integer | Number of impressions/views |
| `insights.on` | string | ISO 8601 timestamp when insights were captured |
| `attachments` | array | Platform-level files such as the video cover. Only returned by [Get post](#get-post), and omitted when there are none |

### Platform attachment fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique attachment identifier (id) |
| `type` | string | Attachment type. Currently always `cover` |
| `status` | string | Processing status: `pending`, `processed`, `failed` |
| `content_type` | string\|null | MIME type of the file (e.g. `image/jpeg`) |
| `url` | string\|null | Hosted URL of the processed file (null until processed) |

The `cover` attachment is the video's cover image (thumbnail). For posts published through Postproxy it is the `cover_url` you passed. For imported posts it is the cover taken from the platform: Instagram Reels, TikTok videos, and LinkedIn videos.

TikTok does not allow downloading the source video, so imported TikTok posts have an empty `media` array — use the `cover` attachment as the thumbnail.

---

## Post stats

<span class="method get">GET</span> `/api/posts/stats`

Retrieves stats snapshots for one or more posts. Returns all matching snapshots (not just the latest) so you can see trends over time. Supports filtering by profiles/networks and timespan.

For thread posts, stats from all posts in the thread (parent + children) are included under the parent post's ID. This means you get aggregated platform-level stats across the entire thread in a single request.

### Query parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_ids` | string | Yes | Comma-separated list of post ids (max 50) |
| `profiles` | string | No | Comma-separated list of profile ids or platform names (e.g. `instagram,twitter` or `abc123,def456` or mixed) |
| `from` | string | No | ISO 8601 timestamp — only include snapshots recorded at or after this time |
| `to` | string | No | ISO 8601 timestamp — only include snapshots recorded at or before this time |

Platform names are matched against known platforms (`facebook`, `instagram`, `tiktok`, `linkedin`, `youtube`, `twitter`, `threads`, `pinterest`). Anything else is treated as a profile id.

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={statsBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={statsJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={statsPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={statsGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={statsRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={statsPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={statsJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={statsCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={statsResult} lang="json" />

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | object | Keyed by post id |
| `data.<post_id>.platforms` | array | Array of platform objects for this post |
| `platforms[].profile_id` | string | Profile id |
| `platforms[].platform` | string | Platform name (`instagram`, `twitter`, etc.) |
| `platforms[].records` | array | Snapshots ordered by `recorded_at` ascending |
| `records[].stats` | object | Normalized metrics — the same key means the same thing across platforms (varies by platform, see below) |
| `records[].raw_stats` | object \| null | The same metrics as a flat key-value object under their original platform names (e.g. `like_count` for Twitter, `impressionCount` for LinkedIn). `null` for snapshots recorded before July 20, 2026 |
| `records[].recorded_at` | string | ISO 8601 timestamp when the snapshot was captured |

Each snapshot carries two views of the same data: `stats` is normalized into a common schema, while `raw_stats` keeps the original platform key names and can include extra metrics that aren't mapped into `stats`. Normalized `stats` is unchanged — `raw_stats` is purely additive.

### Stats fields by platform

The table shows each normalized `stats` key and the original `raw_stats` key it maps from.

| Platform | Normalized key → raw key |
|----------|--------------------------|
| Instagram | `impressions` → `views`, `likes`, `comments`, `saved`, `profile_visits`, `follows`. `raw_stats` also includes `reach`, `shares` and `total_interactions` (likes, saves, shares and comments, net of removals). Reels add `ig_reels_avg_watch_time` and `ig_reels_video_view_total_time`, both in milliseconds. Feed posts and carousels add `profile_activity` (actions taken on your profile from that post) and `profile_activity_by_action_type`, keyed by action type (e.g. `bio_link_clicked`) — only action types that occurred are present, so the object can be empty |
| Facebook | `impressions` → `post_media_view`, `clicks` → `post_clicks`, `likes` → `post_reactions_by_type_total.like`, `comments`, `shares`. `raw_stats` keeps the full reaction-type breakdown (`love`, `haha`, `wow`, `sad`, `angry`, `care`) plus `post_total_media_view_unique` (unique viewers). Facebook only counts public reshares, so `shares` undercounts versus the Page UI |
| Threads | `impressions` → `views`, `likes`, `replies`, `reposts`, `quotes`, `shares` |
| Twitter | `impressions` → `impression_count`, `likes` → `like_count`, `retweets` → `retweet_count`, `comments` → `reply_count`, `quotes` → `quote_count`, `saved` → `bookmark_count` |
| YouTube | `impressions` → `view_count`, `likes` → `like_count`, `comments` → `comment_count`, `saved` → `favorite_count` |
| LinkedIn | `impressions` → `impressionCount`, `likes` → `likeCount`, `comments` → `commentCount`, `shares` → `shareCount`, `clicks` → `clickCount`. `raw_stats` also includes `uniqueImpressionsCount`, `shareMentionsCount`, `engagement` |
| TikTok | `impressions` → `view_count`, `likes` → `like_count`, `comments` → `comment_count`, `shares` → `share_count`, `reach` (unique accounts that saw the video). `raw_stats` also includes `video_duration`, `average_time_watched`, `total_time_watched`, `full_video_watched_rate`. `reach` and the watch-time metrics need a profile connected on or after 2026-09-30 — see [Connecting TikTok](/reference/platforms/tiktok/#connecting-tiktok) |
| Pinterest | `impressions` → `IMPRESSION`, `saved` → `SAVE`, `likes` → `TOTAL_REACTIONS`, `comments` → `TOTAL_COMMENTS`, `outbound_clicks` → `OUTBOUND_CLICK` |
| Bluesky | `likes` → `like_count`, `reposts` → `repost_count`, `comments` → `reply_count`, `quotes` → `quote_count` (no impressions) |

:::note
Instagram stories do not return stats, and Instagram has no per-post follower / non-follower split — Meta serves that at the account level only, see [Profile stats](/reference/profiles/#profile-stats). TikTok stats require the post to have a public ID. LinkedIn stats are organization posts only; member profiles return an empty object.
:::

### Error responses

**Missing post_ids parameter (400):**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "param is missing or the value is empty: post_ids"
}
```

---

## Create post

<span class="method post">POST</span> `/api/posts`

Creates a new post and publishes it to the specified platforms.

### Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post[body]` | string | No* | Text content of the post |
| `post[scheduled_at]` | string | No | ISO 8601 timestamp to schedule the post |
| `post[draft]` | boolean | No | If `true`, creates a draft that won't publish until reviewed |
| `profiles` | array | Yes | Array of profile IDs or platform names |
| `media` | array | No* | Array of media URLs or file uploads |
| `platforms` | object | No | Platform-specific parameters |
| `thread` | array | No | Array of thread child posts (see [Threads](#threads)) |
| `profile_group_id` | string | No | ID of the profile group to resolve `profiles` against. If omitted, platform names resolve in the default group (first one on the account) and profile IDs are looked up across all groups your API key / user can access. See [Profile resolution](#profile-resolution) |
| `queue_id` | string | No | Queue ID — adds the post to a queue (see [Queues](/reference/queues/)) |
| `queue_priority` | string | No | Queue priority: `high`, `medium` (default), or `low` |

*Some platforms require media (Instagram, TikTok, YouTube). Some platforms require text content.

### Draft posts

Set `draft: true` to create a post that won't be published automatically. Draft posts can be reviewed and then published using the [Publish endpoint](#publish-post).

```json
{
  "post": {
    "body": "Content to review before posting",
    "draft": true
  },
  "profiles": ["instagram"]
}
```

### Profiles parameter

The `profiles` array accepts either:

- **Platform names**: `"twitter"`, `"instagram"`, `"facebook"`, etc. — uses the first connected profile for that platform
- **Profile IDs**: ID of a specific profile

#### Profile resolution

How each entry in `profiles` is resolved depends on whether `profile_group_id` is sent:

| `profile_group_id` sent? | Platform name (e.g. `"twitter"`) | Profile ID (e.g. `"abc123profile"`) |
|---|---|---|
| Yes | Resolved inside that group | Must belong to that group |
| No  | Resolved inside the **default group** (first profile group on the account) | Looked up across all profile groups your API key / OAuth user can access |

All resolved profiles must belong to the **same** profile group. Mixing profiles from different groups in one request returns a `422` — pass `profile_group_id` to disambiguate, or split into separate requests.

When `queue_id` is also sent, the queue must belong to the same profile group as the resolved profiles.

### Media parameter

You can provide media in three ways:

**Option 1: URLs (JSON request)**

Pass URLs to images or videos that Postproxy will download:

```json
{
  "media": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.png"
  ]
}
```

**Option 2: Base64 data URI (JSON request)**

Inline a file as a base64 data URI. Postproxy decodes it and downloads it to durable storage:

```json
{
  "media": [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  ]
}
```

**Option 3: File upload (multipart form)**

Upload files directly using `multipart/form-data`:


<Tabs>
  <TabItem label="cURL">
    <Code code={uploadPostBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={uploadPostJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={uploadPostPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={uploadPostGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={uploadPostRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={uploadPostPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={uploadPostJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={uploadPostCsharp} lang="csharp" />
  </TabItem>
</Tabs>

When using file upload, use form field names with brackets: `post[body]`, `profiles[]`, `media[]`.

### Alt text

Add accessibility alt text to images by passing `alt_text` in the platform parameters — a single string, or an array matching the order of the `media` array (a single string applies to the first media item).

```json
{
  "media": ["https://example.com/one.jpg", "https://example.com/two.jpg"],
  "platforms": {
    "bluesky": {
      "alt_text": ["A red fox in the snow", "The same fox, mid-leap"]
    },
    "instagram": {
      "alt_text": ["A red fox in the snow", "The same fox, mid-leap"]
    }
  }
}
```

Supported on [Facebook](/reference/platforms/facebook/) (feed post images), [Instagram](/reference/platforms/instagram/) (feed post images, including carousels — not reels or stories), [X](/reference/platforms/twitter/) (images), [Threads](/reference/platforms/threads/) (images, including carousels), [LinkedIn](/reference/platforms/linkedin/) (images), [Bluesky](/reference/platforms/bluesky/) (images and video), and [Pinterest](/reference/platforms/pinterest/) (image Pins). Sending `alt_text` for any other network returns a validation error.

### AI disclosure

Mark a post as made or edited with AI by passing `made_with_ai: true` in the platform parameters — Meta then shows its "AI info" label on the post.

```json
{
  "platforms": {
    "instagram": { "made_with_ai": true },
    "facebook": { "made_with_ai": true }
  }
}
```

Supported on [Instagram](/reference/platforms/instagram/) feed posts (single media and carousels — the label applies to the whole carousel), reels, and stories, and on [Facebook](/reference/platforms/facebook/) feed posts with images. Facebook's video, reel, and story endpoints have no disclosure parameter, so the flag is ignored there.

Meta also applies the label on its own when a file carries C2PA/IPTC AI metadata; the flag covers content that doesn't. The label is set at publish time and can't be added or removed afterwards.

[TikTok](/reference/platforms/tiktok/) takes the same `made_with_ai` parameter; YouTube's equivalent is `contains_synthetic_media`.

### Platform-specific parameters

Pass platform-specific options in the `platforms` object. See [Platform Parameters](/reference/platforms/) for all available options.

```json
{
  "platforms": {
    "instagram": {
      "format": "reel",
      "first_comment": "Check the link in bio!",
      "user_tags": [{ "username": "natgeo" }]
    },
    "youtube": {
      "title": "My Video Title",
      "privacy_status": "public"
    }
  }
}
```

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={createPostBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={createPostJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={createPostPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={createPostGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={createPostRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={createPostPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={createPostJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={createPostCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Request body (JSON):

<Code code={JSON.stringify(createPostRequestBody, null, 2)} lang="json" />

Response (201 Created):

<Code code={createPostResult} lang="json" />

### Error responses

**Missing profiles parameter (400):**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "param is missing or the value is empty: Missing profiles parameter"
}
```

**Validation errors (422):**
```json
{
  "errors": [
    "Post profiles must have at least one profile selected",
    "Media is required for feed post on Instagram"
  ]
}
```

---

## Update post

<span class="method patch">PATCH</span> `/api/posts/:id`

Updates an existing post. Draft posts and scheduled posts (more than 5 minutes before their publish time) can be fully updated. Published posts can have their text edited on platforms that support it — see [Editing published posts](#editing-published-posts).

All parameters are optional — only send the fields you want to change. Fields you omit are left unchanged.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Post id |

### Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post[body]` | string | No | Updated text content |
| `post[scheduled_at]` | string | No | Updated ISO 8601 schedule timestamp |
| `post[draft]` | boolean | No | Set or unset draft status |
| `profiles` | array | No | Replace all profiles (array of profile IDs or platform names) |
| `platforms` | object | No | Update platform-specific parameters |
| `media` | array | No | Replace all media (array of media URLs or file uploads) |
| `thread` | array | No | Replace all thread children |
| `queue_id` | string | No | Assign the post to a queue |
| `queue_priority` | string | No | Queue priority: `high`, `medium`, or `low` |
| `profile_group_id` | string | No | Scope the lookup to a specific profile group |

### Update behavior

Each parameter has specific update semantics:

**`post` (body, scheduled_at, draft)** — Merged with existing values. Only the fields you include are changed.

**`profiles`** — **Full replace.** When sent, all existing profile assignments are removed and replaced with the new set. If omitted, existing profiles are kept. Accepts the same values as create (profile IDs or platform names). Resolution follows the same rules as [create](#profile-resolution).

**`platforms`** — **Merged with existing params.** When sent without `profiles`, the platform parameters are merged into the existing profile assignments. For example, sending `{"platforms": {"youtube": {"privacy_status": "unlisted"}}}` updates the YouTube privacy status without changing other params or profiles. When sent together with `profiles`, platform params are applied to the new profile set (same as create).

**`media`** — **Full replace.** When sent, all existing media attachments are destroyed and replaced with the new set. Send an empty array `[]` to remove all media. If omitted, existing media is kept.

**`thread`** — **Full replace.** When sent, all existing thread children are destroyed and rebuilt from the new array. Send an empty array `[]` to remove all thread children. If omitted, existing thread is kept. Thread children automatically inherit the parent's profiles, scheduling, and draft status.

### Editing published posts

Once a post is published, `PATCH /api/posts/:id` edits its text on every platform that supports editing. Only these fields are accepted:

| Parameter | Description |
|-----------|-------------|
| `post[body]` | New text. Replaces the post body and is pushed to every editable platform post |
| `platforms.youtube.title` | New video title |
| `platforms.pinterest.title` | New pin title |
| `platforms.pinterest.destination_link` | New pin link |

Any other parameter (`media`, `profiles`, `thread`, `queue_id`, `queue_priority`, `post[scheduled_at]`, `post[draft]`, other platform params) returns `422`.

Editing is asynchronous: the response returns the updated post immediately, and each platform reports the outcome via the [`platform_post.edited` or `platform_post.edit_failed`](/reference/webhooks/#platform_postpublished-platform_postfailed-platform_postfailed_waiting_for_retry-platform_postedited-platform_postedit_failed) webhook. A failed edit keeps the platform post `published` and sets its `error` fields.

| Platform | Editable | Notes |
|----------|----------|-------|
| Facebook | Yes | Feed posts only (not reels or stories) |
| LinkedIn | Yes | |
| YouTube | Yes | Description and title |
| Pinterest | Yes | Description, title and link |
| Telegram | Yes | Message text, or caption for media posts |
| Google Business | Yes | Not `photo` format |
| X (Twitter) | Yes | Within 30 minutes of publishing, up to 5 edits, not polls. X assigns the edited post a **new ID**, so `platform_id` changes |
| Instagram, Threads, TikTok, Bluesky | No | The platform API has no edit endpoint |

Platform posts that can't be edited keep their original text. Thread children can't be edited.

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={updatePostBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={updatePostJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={updatePostPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={updatePostGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={updatePostRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={updatePostPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={updatePostJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={updatePostCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Request body (JSON):

<Code code={JSON.stringify(updatePostRequestBody, null, 2)} lang="json" />

Response (200 OK):

<Code code={updatePostResult} lang="json" />

### Error responses

**Post not editable (422):**
```json
{
  "error": "Post cannot be edited (only drafts or scheduled posts more than 5 minutes before publish time)"
}
```

**Disallowed field on a published post (422):**
```json
{
  "error": "Only body and platform text fields (youtube title, pinterest title/destination_link) can be changed on a published post"
}
```

**Nothing to edit on a published post (422):**
```json
{
  "error": "Nothing to edit: body and platform text fields are unchanged"
}
```

**Profile not found (422):**
```json
{
  "error": "Profile not found for invalid_id"
}
```

**Invalid platform params (422):**
```json
{
  "error": "Invalid platform params for youtube: bad_key. Allowed: title, privacy_status, format"
}
```

**Post not found (404):**
```json
{
  "error": "Not found"
}
```

---

## Delete post

<span class="method delete">DELETE</span> `/api/posts/:id`

Deletes a post from the database. By default, this does not remove the post from social media platforms. Pass `delete_on_platform: true` to also delete the post from platforms before removing it from the database.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Post id |

### Query parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `delete_on_platform` | boolean | No | `false` | If `true`, also deletes the post from all published platforms before removing it from the database |
| `profile_group_id` | string | No | - | Scope the lookup to a specific profile group |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={deletePostBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={deletePostJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={deletePostPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={deletePostGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={deletePostRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={deletePostPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={deletePostJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={deletePostCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={deletePostResult} lang="json" />

---

## Delete on platform

<span class="method post">POST</span> `/api/posts/:id/delete_on_platform`

Deletes a published post from one or more social media platforms without removing it from the database. The deletion happens asynchronously via a background job.

Optionally provide `post_profile_id`, `profile_id`, or `network` to target specific platform(s). If no parameter is provided, the post is deleted from all published platforms. When using `post_profile_id`, the deletion covers all post profiles for the same profile across the entire thread (parent + children).

### Supported platforms

Platform deletion is supported on: **Facebook**, **Threads**, **X (Twitter)**, **LinkedIn**, **Pinterest**, **YouTube**.

Platform deletion is **not** supported on: **Instagram**, **TikTok**.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Post id |

### Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_profile_id` | string | No | ID of a specific post profile. Resolves to the underlying profile and deletes across the entire thread |
| `profile_id` | string | No | ID of a profile. Deletes all post profiles for this profile on the post |
| `network` | string | No | Network name (e.g. `twitter`, `facebook`). Deletes all post profiles for this network on the post |
| `profile_group_id` | string | No | Scope the lookup to a specific profile group |

If none of these parameters are provided, the post is deleted from all published platforms.

### Example: Delete from all platforms

```bash
curl -X POST "https://api.postproxy.dev/api/posts/abc123xyz/delete_on_platform" \
  -H "Authorization: Bearer your_api_key"
```

### Example: By network

```bash
curl -X POST "https://api.postproxy.dev/api/posts/abc123xyz/delete_on_platform" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"network": "twitter"}'
```

### Example: By profile id

```bash
curl -X POST "https://api.postproxy.dev/api/posts/abc123xyz/delete_on_platform" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"profile_id": "prof_abc123"}'
```

### Example: By post profile id

```bash
curl -X POST "https://api.postproxy.dev/api/posts/abc123xyz/delete_on_platform" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"post_profile_id": "pp_abc123"}'
```

### Response (200 OK)

```json
{
  "success": true,
  "deleting": [
    {
      "post_profile_id": "pp_abc123",
      "platform": "twitter"
    }
  ]
}
```

### Error responses

**No eligible profiles (422):**

```json
{
  "error": "No profiles eligible for deletion: platform deletion is not supported for instagram"
}
```

**Post not found (404):**

```json
{
  "error": "Not found"
}
```

---

## Publish post

<span class="method post">POST</span> `/api/posts/:id/publish`

Publishes a draft post. Only posts with `status: "draft"` can be published using this endpoint.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Post id |

### Query parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_group_id` | string | No | Scope the lookup to a specific profile group |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={publishPostBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={publishPostJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={publishPostPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={publishPostGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={publishPostRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={publishPostPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={publishPostJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={publishPostCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={publishPostResult} lang="json" />

### Error responses

**Post not found (404):**
```json
{
  "error": "Not found"
}
```

**Post is not a draft (422):**
```json
{
  "error": "Post is not a draft"
}
```

---

## Post statuses

### Post-level status

| Status | Description |
|--------|-------------|
| `draft` | Post is saved but not published, awaiting review |
| `processing` | Post is being published to platforms |
| `processed` | All platform publishing attempts completed |
| `scheduled` | Post is scheduled for future publishing |
| `media_processing_failed` | One or more media attachments failed to process |

### Platform-level status

| Status | Description |
|--------|-------------|
| `processing` | Currently being published to this platform |
| `published` | Successfully published |
| `failed` | Publishing failed (check error message) |
| `pending_deletion` | Deletion from platform is in progress |
| `deleted` | Successfully deleted from platform |

---

## Threads

Threads allow you to create a sequence of posts that are published as replies to each other, forming a conversation thread on supported platforms.

### Supported platforms

Threads are only supported on:

- **X (Twitter)** — each post is published as a reply to the previous tweet
- **Threads** — each post is published as a reply to the previous Threads post

Attempting to create a thread with other platforms (Instagram, Facebook, LinkedIn, etc.) will return a `422` error.

### How threads work

1. The parent post (`post[body]`) is published first on each platform
2. Each child post in the `thread` array is published sequentially as a reply to the previous post
3. Per-platform chains are independent — the X chain and Threads chain run in parallel
4. Position is determined by the array order (first item = first reply, etc.)

### Thread parameter

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `body` | string | Yes | Text content for this thread post |
| `media` | array | No | Array of media URLs (same format as top-level `media`) |

### Error handling

- If a post in the thread chain fails, subsequent posts in that chain will **wait** (they are not published)
- Each platform chain is independent — a failure on X does not block the Threads chain

### Checking a thread was fully delivered

Every item in a thread is delivered separately, so **the parent's `platforms` array only describes the parent**. Each entry in `thread` carries its own `platforms` array with the same shape — `status`, `permalink`, `error`, `error_details` — so a half-delivered thread is visible without extra requests. Both [`GET /api/posts`](#list-posts) and [`GET /api/posts/:id`](#get-post) include it.

A thread is fully live on a platform when every item — the parent and each `thread` entry — has `status: "published"` and a non-null `permalink` for that platform. Because the chain is sequential, an item that is still `processing` or has `failed` means **every later item in that chain is undelivered**, which can leave a thread truncated mid-sentence on the platform.

The top-level `status` does not answer this. `processed` means the post was accepted and handed to the publishing pipeline, not that the deliveries succeeded — check `platforms[]` on the parent and on each thread item instead.

---

# queues

The Queues API lets you create and manage posting queues. Queues automatically schedule posts into recurring weekly timeslots, with priority-based ordering.

:::note
All calls require authentication.
:::

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/post_queues` | List all queues |
| `GET` | `/api/post_queues/:id` | Get a single queue |
| `GET` | `/api/post_queues/:id/next_slot` | Get next available timeslot |
| `POST` | `/api/post_queues` | Create a new queue |
| `PATCH` | `/api/post_queues/:id` | Update a queue |
| `DELETE` | `/api/post_queues/:id` | Delete a queue |

---

## Concepts

### Timeslots

Each queue has a set of weekly timeslots that define when posts are published. A timeslot is a combination of a day of the week (0=Sunday through 6=Saturday) and a time in 24-hour `HH:MM` format. Times are interpreted in the queue's timezone.

### Priority

Posts added to a queue have a priority level that determines scheduling order:

| Priority | Description |
|----------|-------------|
| `high` | Scheduled first — gets the earliest available slot |
| `medium` | Default priority |
| `low` | Scheduled last — fills remaining slots |

Within the same priority level, posts are ordered by creation time (oldest first).

### Dynamic rearrangement

The queue automatically rearranges all scheduled posts when:

- A new post is added to the queue
- A post is removed from the queue
- Timeslots are added or removed
- The queue's timezone is changed
- The queue is unpaused

### Jitter

Queues support a `jitter` parameter (0–60 minutes) that randomly shifts each post's scheduled time by +/- the specified number of minutes. This makes posting patterns look more natural and less automated.

For example, with `jitter: 10` and a timeslot at `09:00`, posts will be scheduled anywhere between `08:50` and `09:10`.

Jitter is applied when the queue is arranged — when posts are added, removed, or when queue settings change.

### Pausing

When a queue is paused (`enabled: false`), posts in the queue will **not** be published even if their scheduled time arrives. When the queue is unpaused, all posts (including those that became past-due while paused) are rearranged into future timeslots.

---

## List queues

<span class="method get">GET</span> `/api/post_queues`

Retrieves all queues for the current account.

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `profile_group_id` | string | No | Filter by profile group (ID) |

### Example

```bash
curl -X GET "https://api.postproxy.dev/api/post_queues" \
  -H "Authorization: Bearer your_api_key"
```

### Response

```json
{
  "data": [
    {
      "id": "q1abc",
      "name": "Morning Posts",
      "description": "Daily morning content",
      "timezone": "America/New_York",
      "enabled": true,
      "jitter": 10,
      "profile_group_id": "pg123",
      "timeslots": [
        { "id": 1, "day": 1, "time": "09:00" },
        { "id": 2, "day": 3, "time": "09:00" },
        { "id": 3, "day": 5, "time": "14:00" }
      ],
      "posts_count": 5
    }
  ]
}
```

---

## Get queue

<span class="method get">GET</span> `/api/post_queues/:id`

Retrieves a single queue by its ID.

### Example

```bash
curl -X GET "https://api.postproxy.dev/api/post_queues/q1abc" \
  -H "Authorization: Bearer your_api_key"
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Queue identifier (ID) |
| `name` | string | Queue name |
| `description` | string\|null | Optional description |
| `timezone` | string | IANA timezone name (e.g. `America/New_York`) |
| `enabled` | boolean | Whether the queue is active |
| `jitter` | integer | Random offset in minutes (+/-) applied to scheduled times (0–60, default: 0) |
| `profile_group_id` | string | Associated profile group (ID) |
| `timeslots` | array | Weekly timeslot definitions |
| `posts_count` | integer | Number of currently scheduled posts |

### Timeslot fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Timeslot ID (used for deletion) |
| `day` | integer | Day of the week: `0`=Sunday, `1`=Monday, ..., `6`=Saturday |
| `time` | string | Time in 24-hour `HH:MM` format |

---

## Get next slot

<span class="method get">GET</span> `/api/post_queues/:id/next_slot`

Returns the next available timeslot for the queue.

### Example

```bash
curl -X GET "https://api.postproxy.dev/api/post_queues/q1abc/next_slot" \
  -H "Authorization: Bearer your_api_key"
```

### Response

```json
{
  "next_slot": "2026-03-11T14:00:00Z"
}
```

### Error response

**No timeslots configured (422):**
```json
{
  "error": "No available slots found. Add timeslots to your queue."
}
```

---

## Create queue

<span class="method post">POST</span> `/api/post_queues`

Creates a new posting queue connected to a profile group.

### Request body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `profile_group_id` | string | Yes | Profile group ID to connect the queue to |
| `post_queue[name]` | string | Yes | Queue name |
| `post_queue[description]` | string | No | Optional description |
| `post_queue[timezone]` | string | No | IANA timezone (default: `UTC`) |
| `post_queue[jitter]` | integer | No | Random offset in minutes (0–60, default: `0`) |
| `post_queue[queue_timeslots_attributes]` | array | No | Initial timeslots |

### Example

```bash
curl -X POST "https://api.postproxy.dev/api/post_queues" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_group_id": "pg123",
    "post_queue": {
      "name": "Morning Posts",
      "description": "Weekday morning content",
      "timezone": "America/New_York",
      "queue_timeslots_attributes": [
        { "day": 1, "time": "09:00" },
        { "day": 2, "time": "09:00" },
        { "day": 3, "time": "09:00" },
        { "day": 4, "time": "09:00" },
        { "day": 5, "time": "09:00" }
      ]
    }
  }'
```

### Response (201 Created)

Returns the created queue object (same format as [Get Queue](#get-queue)).

---

## Update queue

<span class="method post">PATCH</span> `/api/post_queues/:id`

Updates a queue's settings, timeslots, or enabled state. Any changes to timezone or timeslots will trigger a rearrangement of all queued posts.

### Request body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `post_queue[name]` | string | No | Queue name |
| `post_queue[description]` | string | No | Description |
| `post_queue[timezone]` | string | No | IANA timezone |
| `post_queue[enabled]` | boolean | No | Pause (`false`) or unpause (`true`) the queue |
| `post_queue[jitter]` | integer | No | Random offset in minutes (0–60) |
| `post_queue[queue_timeslots_attributes]` | array | No | Add/remove timeslots |

### Managing timeslots

**Add a timeslot:**
```json
{
  "post_queue": {
    "queue_timeslots_attributes": [
      { "day": 2, "time": "10:00" }
    ]
  }
}
```

**Remove a timeslot** (pass `id` and `_destroy: true`):
```json
{
  "post_queue": {
    "queue_timeslots_attributes": [
      { "id": 42, "_destroy": true }
    ]
  }
}
```

### Example: Pause a queue

```bash
curl -X PATCH "https://api.postproxy.dev/api/post_queues/q1abc" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{ "post_queue": { "enabled": false } }'
```

### Example: Change timezone

```bash
curl -X PATCH "https://api.postproxy.dev/api/post_queues/q1abc" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{ "post_queue": { "timezone": "America/Los_Angeles" } }'
```

:::note
All queued posts will be rearranged to match the new timezone's timeslots.
:::

### Response

Returns the updated queue object.

---

## Delete queue

<span class="method delete">DELETE</span> `/api/post_queues/:id`

Deletes a queue. Posts that were in the queue will have their queue reference removed but will not be deleted.

### Example

```bash
curl -X DELETE "https://api.postproxy.dev/api/post_queues/q1abc" \
  -H "Authorization: Bearer your_api_key"
```

### Response (200 OK)

```json
{
  "deleted": true
}
```

---

## Adding posts to a queue

To add a post to a queue, pass the `queue_id` parameter when creating a post via the [Posts API](/reference/posts/):

```bash
curl -X POST "https://api.postproxy.dev/api/posts" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "post": {
      "body": "Queued post content"
    },
    "profiles": ["twitter", "linkedin"],
    "queue_id": "q1abc",
    "queue_priority": "high"
  }'
```

### Queue parameters on post creation

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `queue_id` | string | Yes | - | Queue ID |
| `queue_priority` | string | No | `medium` | Priority: `high`, `medium`, or `low` |

The post will be assigned to the next available timeslot. After saving, the queue is rearranged so that higher-priority posts get earlier slots.

### Response fields on queued posts

Posts created via a queue include additional fields:

| Field | Type | Description |
|-------|------|-------------|
| `queue_id` | string | Queue ID the post belongs to |
| `queue_priority` | string | Priority level: `high`, `medium`, or `low` |
| `scheduled_at` | string | Assigned timeslot (ISO 8601) |

:::caution
Do not pass `scheduled_at` together with `queue_id` — the queue determines the scheduled time automatically.
:::

---

# profiles

The Profiles API allows you to retrieve and manage connected social media profiles. Profiles represent authenticated connections to social media platforms.

:::note
All calls require authentication.
:::

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profiles` | List all profiles |
| `GET` | `/api/profiles/:id` | Get a single profile (with latest stats) |
| `GET` | `/api/profiles/:id/placements` | List placements for a profile |
| `PATCH` | `/api/profiles/:id/assign_placement_to_group` | Assign a placement to another profile group |
| `PATCH` | `/api/profiles/:id/assign_to_group` | Move a profile to another profile group |
| `GET` | `/api/profiles/:id/stats` | Get profile stats timeseries |
| `GET` | `/api/profiles/:id/follower_history` | Daily follower series for a date range |
| `GET` | `/api/profiles/:id/daily_stats` | Per-day account metrics for a date range |
| `GET` | `/api/profiles/:id/participants/:user_id` | Follow/verified status of an Instagram user (Instagram only) |
| `GET` | `/api/profiles/:id/resolve_mention` | Resolve a LinkedIn company page to its mention URN (LinkedIn only) |
| `POST` | `/api/profiles/:id/backfill_posts` | Backfill older posts from the platform |
| `GET` | `/api/profiles/:id/post_syncs` | List post sync runs |
| `GET` | `/api/profiles/:id/post_syncs/:post_sync_id` | Get one post sync run |
| `POST` | `/api/profiles/:id/backfill_chats` | Backfill direct-message conversations (Instagram & Facebook) |
| `GET` | `/api/profiles/:id/chat_syncs` | List chat sync runs |
| `GET` | `/api/profiles/:id/chat_syncs/:chat_sync_id` | Get one chat sync run |
| `DELETE` | `/api/profiles/:id` | Delete/disconnect a profile |

---

## Profile object

A profile represents a connected social media account.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique profile identifier (id) |
| `name` | string | Display name of the connected account |
| `username` | string\|null | Handle on the platform (without `@`). `null` when the platform does not expose one |
| `platform_id` | string | The account's ID on the platform |
| `status` | string | Platform connection status: `active`, `expired`, `inactive` (might be disconnected or suspended on a platform, or waiting for a group that can take it — see `inactive_reason`) |
| `inactive_reason` | string\|null | Why an `inactive` profile is inactive. `network_taken`: the account arrived with a Facebook login that granted several Instagram accounts, but its group already holds an active Instagram profile — [move it](#assign-profile-to-group) to a group without one to activate it. `null` otherwise, including when the connection was simply lost and needs reconnecting |
| `platform` | string | Platform identifier |
| `profile_group_id` | string | ID of the profile group this belongs to |
| `expires_at` | string\|null | ISO 8601 timestamp when the connection expires (if applicable) |
| `post_count` | integer | Number of posts made through this profile |
| `avatar_url` | string\|null | Stable Postproxy storage URL of the account's profile picture, resized to 256×256. `null` until it has been mirrored. For `facebook` this is the connecting user's picture — each Page's picture is `avatar_url` on its [placement](#placement-object) |
| `platform_url` | string\|null | Public URL of the account on the platform. `null` when the platform has no stable public profile URL (e.g. `linkedin`, `google_business`) |
| `placements_sync_status` | string\|null | State of the latest pull of this profile's [placements](#list-placements): `syncing`, `synced`, or `failed`. The pull runs in the background right after connecting and can take several minutes on profiles with many pages/locations. `null` for platforms without placements and for `telegram`, whose channels arrive via webhook |

### Platform values

| Platform | Account type |
|---------|----------|
| `facebook` | Facebook Page |
| `instagram` | Instagram Business/Creator Account |
| `tiktok` | TikTok Account |
| `linkedin` | LinkedIn Profile or Company Page |
| `youtube` | YouTube Channel |
| `twitter` | X (Twitter) Account |
| `threads` | Threads Account |
| `pinterest` | Pinterest Account |
| `bluesky` | Bluesky Account |
| `telegram` | Telegram Bot (publishes to channels via [placements](#list-placements)) |
| `google_business` | Google Business Profile (publishes to locations via [placements](#list-placements)) |

---

## List profiles

<span class="method get">GET</span> `/api/profiles`

Retrieves your profiles. Pass `profile_group_id` to restrict to a single group; omit it to return profiles across every group your API key or OAuth user can access.

### Query parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `profile_group_id` | string | No | - | Restrict to profiles in this group. When omitted, returns profiles across every profile group your API key or OAuth user can access. |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={listProfilesBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={listProfilesJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={listProfilesPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={listProfilesGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={listProfilesRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={listProfilesPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={listProfilesJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={listProfilesCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={listProfilesResult} lang="json" />

### Profile resolution

The same scoping rule applies to the `:id` endpoints below (`GET /api/profiles/:id`, `/placements`, `/stats`, `/follower_history`, `/daily_stats`, `PATCH /api/profiles/:id/assign_placement_to_group`, `PATCH /api/profiles/:id/assign_to_group`, and `DELETE /api/profiles/:id`):

| `profile_group_id` sent? | Profile ID lookup scope |
|--------------------------|-------------------------|
| Yes | The profile must belong to that group |
| No | Resolved across every profile group your API key or OAuth user can access |

This mirrors the resolution rule already used by `POST /api/posts`.

---

## Get profile

<span class="method get">GET</span> `/api/profiles/:id`

Retrieves a single profile by its ID. The response includes the profile fields plus the latest stats snapshot per placement and (for placement networks) a `summary_stats` rollup.

For non-placement networks (e.g. `bluesky`, `twitter`), `latest_stats` contains a single entry with `placement_id: null` and `summary_stats` is `null`.

Snapshots are typically refreshed every 23 hours per profile. If `latest_stats` is empty, the profile has been connected but has not yet been polled for stats.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Profile id |

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `latest_stats` | array | Latest snapshot per placement. One entry for non-placement networks (with `placement_id: null`). Empty array if no snapshots have been recorded yet. |
| `latest_stats[].placement_id` | string\|null | Platform-specific placement ID. `null` for non-placement networks. |
| `latest_stats[].stats` | object | Platform-specific metrics. See [Stats fields by network](#stats-fields-by-network). |
| `latest_stats[].recorded_at` | string | ISO 8601 timestamp when the snapshot was captured. |
| `summary_stats` | object\|null | For placement networks: numeric values summed across the latest snapshot of every placement. `null` for non-placement networks and when no snapshots exist. Non-numeric values (e.g. `channel_title`) are omitted from the summary. |
| `summary_stats.stats` | object | Summed metrics. |
| `summary_stats.recorded_at` | string | ISO 8601 timestamp of the most recent placement snapshot included in the summary. |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={getProfileBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={getProfileJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={getProfilePython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={getProfileGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={getProfileRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={getProfilePhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={getProfileJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={getProfileCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={getProfileResult} lang="json" />

---

## List placements

<span class="method get">GET</span> `/api/profiles/:id/placements`

For an account-wide listing across every profile — including which connected profile actively serves each placement and how to switch it — see [Placements](/reference/placements/).

Retrieves the available placements for a profile. For Facebook profiles, placements are business pages. For LinkedIn profiles, placements include the personal profile and organizations. For Pinterest profiles, placements are boards. For Telegram profiles, placements are the channels the bot has been added to. For Google Business profiles, placements are the locations associated with the connected Business Profile account(s).

This endpoint is available for `facebook`, `linkedin`, `pinterest`, `telegram`, and `google_business` profiles.

Placements are account-level records: your account holds exactly one record per placement, shared by every profile that can see it on the platform, and this endpoint returns all of them for the profile — so two profiles that both admin the same Facebook Page both list it, under the same `id`. A placement and its history survive its connecting profile's disconnect; any other connected profile with access serves it from then on. The listing follows the profile-group scoping below: a group-scoped key or `profile_group_id` returns that group's placements; an unscoped account key also includes placements left unassigned by a deleted group.

Placements are pulled in the background right after a profile connects, which can take several minutes for profiles with many pages or locations. An empty list right after connecting usually means that pull is still running: check `placements_sync_status` on the [Profile object](#profile-object) (`syncing` → `synced` / `failed`), or subscribe to the [`profile.placements_synced`](/reference/webhooks/#profileplacements_synced) webhook instead of polling.

If no placement is specified when creating a post:
- **LinkedIn**: defaults to the personal profile
- **Facebook**: it fails — `page_id` is always required
- **Pinterest**: it fails
- **Telegram**: it fails — `chat_id` is always required
- **Google Business**: it fails — `location_id` (the location resource path) is always required

For Telegram, each placement is a channel the bot has been added to. The placement `id` is the Telegram `chat_id` you pass as `chat_id` when creating a post. The list is empty until the user adds the bot as administrator to a channel — Telegram pushes a `my_chat_member` event for each one and we record it. Poll this endpoint after connecting Telegram until the expected channels appear.

For Google Business, each placement is a location resource managed by the connected account(s). The placement `id` is the full Business Profile resource path (e.g. `accounts/123456789/locations/987654321`) you pass as `location_id` when creating a post. Each location's `metadata.place_id` is its [Google Maps Place ID](https://developers.google.com/maps/documentation/places/web-service/place-id) — use it to cross-reference the location against Google Maps / Places or build a reviews permalink; it's omitted when Google returns no Place ID for the location. Listing locations issues one call per Google Business account on the profile, so responses may be slower than other networks when many accounts/locations are linked.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Profile id |

### Placement object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string\|null | Platform-specific placement ID. `null` for personal profile (LinkedIn) |
| `name` | string | Display name of the placement |
| `avatar_url` | string\|null | Stable Postproxy storage URL of the placement's picture, resized to 256×256 (Facebook Pages). `null` until it has been mirrored and for networks without one |
| `metadata` | object | Extra per-placement data Postproxy stores. For Google Business this carries the location's `place_id` (Google Maps Place ID). `{}` when there's nothing extra. |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={listPlacementsBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={listPlacementsJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={listPlacementsPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={listPlacementsGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={listPlacementsRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={listPlacementsPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={listPlacementsJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={listPlacementsCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={listPlacementsResult} lang="json" />

---

## Assign placement to group

<span class="method patch">PATCH</span> `/api/profiles/:id/assign_placement_to_group`

Moves a single placement (a Facebook Page, LinkedIn organization, Telegram channel, Google Business location, …) into a different profile group, independent of where its parent connection is homed. This is the API equivalent of the group selector on a profile's page in the app. Group-scoped surfaces (profile lists, post attribution, composer, queues) follow the placement's group; publishing itself is untouched.

A connection shows a placement in exactly one group at a time. On accounts allowed to connect the same platform account more than once, each connection carries its own view: this endpoint moves the placement only for the connection in the URL, and other connections seeing the same placement keep their groups. A placement lands in the group of the profile that connected it and only becomes unassigned when that group is deleted; an unassigned placement can't be posted to until it's assigned again. Account-wide API keys can assign unassigned placements; a group-scoped key stays confined to its own group's placements.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Profile ID (a connection that can see the placement; the move applies to this connection's view) |

### Body parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `placement_id` | string | Yes | Platform-specific placement ID, as returned by [List placements](#list-placements) |
| `target_profile_group_id` | string | Yes | ID of the profile group to move the placement into. Must be in the same environment (live/sandbox) as your API key |

### Example

```bash
curl -X PATCH "https://api.postproxy.dev/api/profiles/prof123abc/assign_placement_to_group" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "placement_id": "967627696429808",
       "target_profile_group_id": "grp456def"
     }'
```

Response — the moved placement in the [Placement object](#placement-object) shape, plus its new group:

```json
{
  "id": "967627696429808",
  "name": "Acme Store",
  "avatar_url": "https://cdn.postproxy.dev/uploads/profile_placement_avatar_967627696429808.jpg",
  "metadata": {
    "username": "acmestore"
  },
  "profile_group_id": "grp456def"
}
```

### Scoping

An API key scoped to a single profile group cannot move placements across groups — both the placement and the target group must be within the key's group, so any cross-group attempt returns 404. Use an account-wide API key to move placements between groups.

### Error responses

**Profile, placement, or target group not found / not accessible (404):**

```json
{
  "error": "Not found. Make sure you pass the correct profile_group_id"
}
```

**Missing `placement_id` or `target_profile_group_id` (400):**

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "param is missing or the value is empty or invalid: placement_id"
}
```

---

## Assign profile to group

<span class="method patch">PATCH</span> `/api/profiles/:id/assign_to_group`

Moves a profile (the connection itself) into a different profile group, without disconnecting and reconnecting it. This is the API equivalent of the group selector next to a profile's name in the app, and the counterpart of [Assign placement to group](#assign-placement-to-group), which moves a single placement rather than the whole connection. The connection keeps its ID, tokens, and post history, so nothing scheduled against it breaks.

The profile's placements that sit in its current home group move with it. Placements you had already assigned to another group stay where they are.

The target group must be able to take the connection: on group-billed plans a group holds one profile per network, so moving a profile into a group that already has one on the same network returns `422`. The target group must be in the same environment (live/sandbox) as the profile.

Moving a profile with `inactive_reason: "network_taken"` into a group that can take it also activates it: `status` becomes `active`, `inactive_reason` becomes `null`, its posts and stats start syncing, and [`profile.connected`](/reference/webhooks/#profileconnected-profiledisconnected) fires. If its own group no longer holds an active profile on that network, pass its current group as `target_profile_group_id` to activate it in place.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Profile ID |

### Body parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `target_profile_group_id` | string | Yes | ID of the profile group to move the profile into. Must be in the same environment (live/sandbox) as your API key |

### Example

```bash
curl -X PATCH "https://api.postproxy.dev/api/profiles/prof123abc/assign_to_group" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "target_profile_group_id": "grp456def"
     }'
```

Response — the moved profile, in the same shape as [Get profile](#get-profile), with `profile_group_id` set to the new group. Moving a profile into the group it is already in is a no-op and returns `200`:

```json
{
  "id": "prof123abc",
  "name": "Acme Corp",
  "username": null,
  "platform_id": "AbCd1234Ef",
  "platform": "linkedin",
  "status": "active",
  "profile_group_id": "grp456def",
  "expires_at": "2026-12-01T10:00:00Z",
  "post_count": 42,
  "avatar_url": "https://...",
  "platform_url": null,
  "placements_sync_status": null,
  "latest_stats": [],
  "summary_stats": null
}
```

### Scoping

An API key scoped to a single profile group cannot move profiles across groups — both the profile and the target group must be within the key's group, so any cross-group attempt returns 404. Use an account-wide API key to move profiles between groups.

### Error responses

**Profile or target group not found / not accessible (404):**

```json
{
  "error": "Not found. Make sure you pass the correct profile_group_id"
}
```

**Target group already has a profile on this network (422):**

```json
{
  "error": "Another linkedin profile is already connected to this profile group. Connect it to a different profile group, or move to a plan billed per profile to keep several here."
}
```

**Missing `target_profile_group_id` (400):**

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "param is missing or the value is empty or invalid: target_profile_group_id"
}
```

---

## Profile stats

<span class="method get">GET</span> `/api/profiles/:id/stats`

Retrieves the full stats timeseries for a profile. Mirrors [Post Stats](/reference/posts/#post-stats) in shape (`records[].stats + recorded_at`) — use this to plot follower growth and engagement trends over time.

This is the raw snapshot series — one record per polling cycle, keys straight from the platform. For clean one-record-per-day series, see [Follower history](#follower-history) and [Daily stats](#daily-stats).

Snapshots are captured roughly every 23 hours. For networks with multiple placements (Facebook pages, LinkedIn organizations, Telegram channels, Google Business locations), each placement has its own timeseries — `placement_id` is **required** so the response is scoped to a single placement.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Profile id |

### Query parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `placement_id` | string | Conditional | **Required** for `facebook`, `linkedin`, `telegram`, and `google_business` profiles. The platform-specific ID returned by [List placements](#list-placements). Omit (or ignored) for other networks. |
| `from` | string | No | ISO 8601 timestamp — only include snapshots recorded at or after this time. |
| `to` | string | No | ISO 8601 timestamp — only include snapshots recorded at or before this time. |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={getStatsBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={getStatsJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={getStatsPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={getStatsGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={getStatsRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={getStatsPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={getStatsJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={getStatsCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={getStatsResult} lang="json" />

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `data.profile_id` | string | Profile ID. |
| `data.platform` | string | Network name (`facebook`, `linkedin`, `bluesky`, etc.). |
| `data.placement_id` | string\|null | The placement filter that was applied (echo of the request). `null` for non-placement networks. |
| `data.records` | array | Snapshots ordered by `recorded_at` ascending. |
| `records[].stats` | object | Platform-specific metrics. See [Stats fields by network](#stats-fields-by-network). |
| `records[].recorded_at` | string | ISO 8601 timestamp when the snapshot was captured. |

### Error responses

**Missing `placement_id` for a placement network (400):**

```json
{
  "error": "placement_id is required for linkedin profiles"
}
```

**Profile not found (404):**

```json
{
  "error": "Not found"
}
```

---

## Follower history

<span class="method get">GET</span> `/api/profiles/:id/follower_history`

Daily follower movement for a date range, one record per day. This reads a daily rollup refreshed once a day per network — distinct from the raw snapshot timeseries served by [Profile stats](#profile-stats).

Follower data is collected for `facebook`, `instagram`, `youtube`, and `tiktok` profiles.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Profile id |

### Query parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `placement_id` | string | Conditional | **Required** for placement networks (`facebook`, `linkedin`, `telegram`, `google_business`) — the placement ID from [List placements](#list-placements). Of these, only Facebook reports follower data. |
| `from` | string | No | ISO 8601 date. Defaults to 29 days before `to`. |
| `to` | string | No | ISO 8601 date. Defaults to yesterday. |

The range is capped at 366 days.

### Example

```bash
curl -X GET "https://api.postproxy.dev/api/profiles/prof_fb_001/follower_history?placement_id=108520199&from=2026-08-01&to=2026-08-24" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

Response:

```json
{
  "data": {
    "profile_id": "prof_fb_001",
    "platform": "facebook",
    "placement_id": "108520199",
    "from": "2026-08-01",
    "to": "2026-08-24",
    "records": [
      {
        "date": "2026-08-01",
        "followers_gained": 12,
        "followers_lost": 3,
        "followers_change": 9,
        "followers_total": 5210
      }
    ]
  }
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `data.placement_id` | string\|null | The placement filter that was applied (echo of the request). `null` for non-placement networks. |
| `data.from` / `data.to` | string | The date range that was applied, including defaults. |
| `records[].date` | string | ISO 8601 date the record describes. |
| `records[].followers_gained` | integer\|null | New followers that day. |
| `records[].followers_lost` | integer\|null | Unfollows that day. |
| `records[].followers_change` | integer\|null | Net movement. Derived as `followers_gained − followers_lost` when the platform reports both but no net figure. |
| `records[].followers_total` | integer\|null | Total follower count as of that day. |

Metrics a platform does not expose are `null`; days with no follower data at all are omitted rather than returned as all-null records.

| Platform | `followers_gained` | `followers_lost` | `followers_change` | `followers_total` |
|----------|--------------------|------------------|--------------------|-------------------|
| Facebook | ✓ | ✓ | computed | most recent day only |
| Instagram | ✓ (gains only) | — | — | most recent day only |
| YouTube | ✓ | ✓ | — | most recent day only |
| TikTok | — | — | ✓ (net day-over-day change) | ✓ (daily) |

Notes:
- Days are bucketed as the platform reports them — Meta and YouTube use US Pacific time, TikTok uses UTC.
- History depth varies by platform: YouTube reaches back years, Facebook roughly 90 days, Instagram 30 days, and TikTok accumulates forward from when daily collection started for the profile.
- Google Business has no follower data — a Business Profile has no audience count.

### Error responses

**Missing `placement_id` for a placement network (400):**

```json
{
  "error": "placement_id is required for facebook profiles"
}
```

**`from` after `to` (400):**

```json
{
  "error": "from must be on or before to"
}
```

**Range longer than 366 days (422):**

```json
{
  "error": "date range cannot exceed 366 days"
}
```

---

## Daily stats

<span class="method get">GET</span> `/api/profiles/:id/daily_stats`

Per-day account metrics for a date range, with a choice of attribution:

- `attribution=received` (default) — engagement bucketed by the day it **arrived**. A like landing today on last month's post counts today. This is the right mode for "activity during this period". Engagement a post already had before Postproxy first tracked it (posts imported after publishing, or published before the profile was connected) isn't counted as received on any day — only growth after that.
- `attribution=publish` — each post's lifetime totals summed onto its **publish** day, computed from the latest post snapshots at read time.

Account-level daily metrics (`views`, `platform_stats`) are collected for `facebook`, `instagram`, `youtube`, `tiktok`, and `google_business` profiles; the received-attribution engagement metrics (`*_received`) work for every network with post insights. Google Business locations get about 18 months of history pulled on their first daily sync, so their daily metrics reach back before the connection date.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Profile id |

### Query parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `placement_id` | string | Conditional | **Required** for placement networks (`facebook`, `linkedin`, `telegram`, `google_business`) — the placement ID from [List placements](#list-placements). For Google Business it's the location's placement id. |
| `attribution` | string | No | `received` (default) or `publish`. |
| `from` | string | No | ISO 8601 date. Defaults to 29 days before `to`. |
| `to` | string | No | ISO 8601 date. Defaults to yesterday. |

The range is capped at 366 days.

### Example

```bash
curl -X GET "https://api.postproxy.dev/api/profiles/prof_fb_001/daily_stats?placement_id=108520199&from=2026-08-01&to=2026-08-24" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

Response (`attribution=received`):

```json
{
  "data": {
    "profile_id": "prof_fb_001",
    "platform": "facebook",
    "placement_id": "108520199",
    "attribution": "received",
    "from": "2026-08-01",
    "to": "2026-08-24",
    "data_timezone": "America/Los_Angeles",
    "records": [
      {
        "date": "2026-08-01",
        "views": 12556,
        "viewers": 8210,
        "viewers_7d": 31400,
        "viewers_28d": 90210,
        "likes_received": 41,
        "comments_received": 7,
        "shares_received": 3,
        "views_received": 9800,
        "platform_stats": {
          "page_views_total": 120,
          "page_post_engagements": 210
        }
      }
    ],
    "metrics": {
      "views": { "supported": true, "source": "native", "platform_metric": "page_media_view", "additive": true, "missing_day": "unavailable", "coverage_start": "2026-06-09", "provisional_from": "2026-08-23" },
      "viewers": { "supported": true, "source": "native", "platform_metric": "page_total_media_view_unique", "window": "1d", "additive": false, "missing_day": "unavailable", "coverage_start": "2026-06-09", "provisional_from": "2026-08-23" },
      "viewers_7d": { "supported": true, "source": "native", "platform_metric": "page_total_media_view_unique", "window": "7d", "additive": false, "missing_day": "unavailable", "coverage_start": "2026-06-09", "provisional_from": "2026-08-23" },
      "viewers_28d": { "supported": true, "source": "native", "platform_metric": "page_total_media_view_unique", "window": "28d", "additive": false, "missing_day": "unavailable", "coverage_start": "2026-06-09", "provisional_from": "2026-08-23" },
      "likes_received": { "supported": true, "source": "derived", "additive": true, "missing_day": "zero", "coverage_start": "2026-07-14", "provisional_from": "2026-08-23" },
      "comments_received": { "supported": true, "source": "derived", "additive": true, "missing_day": "zero", "coverage_start": "2026-07-14", "provisional_from": "2026-08-23" },
      "shares_received": { "supported": true, "source": "derived", "additive": true, "missing_day": "zero", "coverage_start": "2026-07-14", "provisional_from": "2026-08-23" },
      "views_received": { "supported": true, "source": "derived", "additive": true, "missing_day": "zero", "coverage_start": "2026-07-14", "provisional_from": "2026-08-23" }
    }
  }
}
```

### Response fields (`attribution=received`)

| Field | Type | Description |
|-------|------|-------------|
| `records[].date` | string | ISO 8601 date the record describes. |
| `records[].views` | integer\|null | Account-level views that day, as the platform reports them. |
| `records[].viewers` / `viewers_7d` / `viewers_28d` | integer\|null | Unique viewers as computed by the platform for the window **ending on that day**: the day itself, the trailing 7 days, the trailing 28 days. `null` where the platform has no unique-viewer metric (see the table below). |
| `records[].likes_received` / `comments_received` / `shares_received` / `views_received` | integer\|null | That day's increase in engagement, summed across the profile's tracked posts. |
| `records[].platform_stats` | object | Network-native daily extras (open map, varies by platform — see below). |
| `data_timezone` | string\|null | The timezone the platform buckets days in (`null` for networks without a daily series). |
| `metrics` | object | Per-key metadata — see [Metric metadata](#metric-metadata). |

Unique counts are not additive — never sum `viewers*` values across days; read the `_7d`/`_28d` value on the last day of your range instead. An unavailable value is always `null`, never `0`.

On placement networks every metric, including `*_received`, is scoped to the requested placement.

Posts are polled at full cadence for their first week, then daily up to 30 days old; beyond that a post's later engagement no longer registers in the `*_received` series.

### Viewers by platform

| Platform | `viewers` (1d) | `viewers_7d` | `viewers_28d` |
|----------|----------------|--------------|---------------|
| Facebook | ✓ `page_total_media_view_unique` (`period=day`) | ✓ (`period=week`) | ✓ (`period=days_28`) |
| Instagram | ✓ `reach` (`period=day`, last 30 days) | ✓ (`period=week`) | ✓ (`period=days_28`) |
| YouTube | — (the Analytics API has no unique-viewer metric) | — | — |
| TikTok | — | — | — |
| Google Business | — | — | — |

### Metric metadata

`metrics` has one entry per top-level record key (`views`, `viewers*`, `*_received`, or `*_published` under `attribution=publish`):

| Field | Meaning |
|-------|---------|
| `supported` | Whether this profile can ever carry a value for the key. When `false` the record value is always `null` and `reason` says why: `platform` (the network has no such metric), `plan` (the account's plan doesn't include insights, or insights are switched off), `permission` (the connected account didn't grant the insights permission). |
| `source` | `native` — stored as the platform reports it. `derived` — computed by Postproxy (TikTok `views` from cumulative video totals, every `*_received` / `*_published` key from post snapshots). |
| `platform_metric` | The platform metric the key is read from (native keys only). |
| `window` | For unique-viewer keys, the window the value covers, ending on the record's day: `1d`, `7d`, `28d`. |
| `additive` | `true` when values can be summed across days; `false` for unique-viewer keys. |
| `missing_day` | What a day missing from `records`, or a `null` value, means on or after `coverage_start`: `unavailable` (not reported by the platform for that day) or `zero` (`*_received` — an absent day had no tracked activity). Before `coverage_start` everything is unavailable. |
| `coverage_start` | First day Postproxy holds a value for this key on this profile; `null` when supported but nothing has been stored yet (for example an Instagram account under 100 followers, which Meta refuses to serve series for). |
| `provisional_from` | First day whose values may still be revised on a later pull — Meta finalises daily numbers within ~48 hours, YouTube Analytics within ~72 hours, `*_received` for the trailing 2 days. `null` when values are final as soon as they appear (TikTok). |

### Response fields (`attribution=publish`)

`records[]` instead carries `likes_published`, `comments_published`, `shares_published`, and `views_published` — each post's latest lifetime totals bucketed onto its publish day. `platform_stats` is empty in this mode. `metrics` describes those keys: all `derived`, `missing_day: "zero"`, `coverage_start` is the profile's earliest publish day, and `provisional_from` reaches back 30 days because a post's totals keep moving for as long as it is polled.

### `platform_stats` by network

| Network | Typical fields |
|---------|----------------|
| `facebook` | `page_views_total`, `page_post_engagements` |
| `instagram` | `total_interactions`: likes, comments, saves, shares, and replies the account received that day |
| `youtube` | `estimatedMinutesWatched`, `likes`, `comments`, `shares` |
| `tiktok` | `total_video_views_cum`, `total_video_likes_cum`, `total_video_comments_cum`, `total_video_shares_cum`, `video_count` (cumulative totals across the account's video list), plus daily `profile_views` on profiles connected on or after 2026-09-30 |
| `google_business` | The raw Business Profile Performance metrics: `business_impressions_desktop_search`, `business_impressions_desktop_maps`, `business_impressions_mobile_search`, `business_impressions_mobile_maps`, `website_clicks`, `call_clicks`, `business_direction_requests`, `business_conversations`, `business_bookings`, `business_food_orders`, `business_food_menu_clicks` |

A key only appears when the platform returned a value for it, so fields can come and go between days.

### Error responses

Same as [Follower history](#follower-history), plus:

**Invalid `attribution` (400):**

```json
{
  "error": "attribution must be received or publish"
}
```

---

## Stats fields by network

The `stats` object's keys come straight from each platform's API — they are not normalized into a common schema, so each network exposes a different set.

| Network | Placement-scoped? | Typical fields |
|---------|-------------------|----------------|
| `facebook` | Yes (per page) | `fan_count`, `followers_count`, plus daily page insights: `page_media_view` (Meta's unified "Views"), `page_views_total`, `page_post_engagements`, `page_daily_follows`, `page_daily_unfollows`, `page_daily_follows_unique`, `page_daily_unfollows_unique` |
| `linkedin` | Yes (per organization) | `followerCount`, `shareCount`, `likeCount`, `commentCount`, `clickCount`, `engagement`, `allPageViews`, `overviewPageViews`, `aboutPageViews`, `careersPageViews`, `peoplePageViews`, `insightsPageViews` |
| `telegram` | Yes (per channel) | `followers_count`, `channel_title`, `channel_username` |
| `instagram` | No | `followers_count`, `follows_count`, `media_count`, plus per-window insights suffixed with `_1d`, `_7d`, `_14d`, `_30d`: `views_*`, `reach_*`, `profile_views_*`, `accounts_engaged_*`, `total_interactions_*`, `website_clicks_*`, and reach/views split by audience: `reach_followers_*`, `reach_non_followers_*`, `views_followers_*`, `views_non_followers_*` |
| `threads` | No | `followers_count`, `views`, `likes`, `replies`, `reposts`, `quotes` |
| `youtube` | No | `subscriberCount`, `viewCount`, `videoCount`, plus per-window Analytics metrics suffixed with `_7d`, `_28d`, `_90d`: `views_*`, `estimatedMinutesWatched_*`, `averageViewDuration_*`, `averageViewPercentage_*`, `subscribersGained_*`, `subscribersLost_*`, `likes_*`, `dislikes_*`, `comments_*`, `shares_*`, `videosAddedToPlaylists_*`, `videosRemovedFromPlaylists_*` |
| `twitter` | No | `followers_count`, `following_count`, `tweet_count`, `listed_count`, `like_count` |
| `tiktok` | No | `follower_count`, `following_count`, `likes_count`, `video_count` |
| `pinterest` | No | `follower_count`, `following_count`, `pin_count`, `board_count`, `monthly_views`, `analytics_30d` (nested 30-day rollup) |
| `bluesky` | No | `followersCount`, `followsCount`, `postsCount` |
| `google_business` | Yes (per location) | `views` (all four impression metrics summed), plus the raw Business Profile Performance metrics: `business_impressions_desktop_search`, `business_impressions_desktop_maps`, `business_impressions_mobile_search`, `business_impressions_mobile_maps`, `website_clicks`, `call_clicks`, `business_direction_requests`, `business_conversations`, `business_bookings`, `business_food_orders`, `business_food_menu_clicks` |

Notes:
- LinkedIn page-view metrics are filtered down to the rollups (we drop redundant mobile/desktop splits and dead sections like `productsPageViews` / `lifeAtPageViews`).
- Non-numeric fields (e.g. Telegram's `channel_title`) appear in `latest_stats[].stats` but are omitted from `summary_stats.stats`, which sums numeric values only.
- A stats key only appears in a snapshot if the platform returned a value for it on that polling cycle, so fields can come and go between records.
- **Instagram's follower split covers reach and views only.** `*_followers_*` / `*_non_followers_*` are served for account-level reach and views; the unsplit `reach_*` / `views_*` keys are unchanged.
- **Instagram metrics vary by account.** Instagram serves a different account-level metric set per account, so an absent key means that account can't report it — not that the metric is gone.
- **Google Business has no followers.** A Business Profile has no audience count, so no follower field appears. Snapshots are trailing 30-day totals per location, and Google exposes no per-post analytics for local posts. See [Google Business stats](/reference/platforms/google-business/#stats).

---

## Participant status

<span class="method get">GET</span> `/api/profiles/:id/participants/:user_id`

**Instagram only.** Returns whether a user follows the profile's Instagram account (and vice versa), plus their verified badge and follower count. The data comes live from Instagram's messaging user lookup.

The `user_id` is the Instagram-scoped user id you receive when the user interacts with your account — the sender id on a [DM chat](/reference/direct-messages/) (`participant_external_id`) or the author id on a [comment](/reference/comments/) (`author_external_id`). Instagram only resolves users who have messaged or commented on your account; arbitrary Instagram accounts can't be looked up.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Profile id (must be an Instagram profile) |
| `user_id` | string | Yes | Instagram-scoped user id (DM sender id or comment author id) |

### Example

```bash
curl -X GET "https://api.postproxy.dev/api/profiles/prof123abc/participants/1254459754837075" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

Response:

```json
{
  "is_verified_user": false,
  "is_user_follow_business": true,
  "is_business_follow_user": false,
  "follower_count": 1234,
  "fetched_at": "2026-08-28T10:00:00Z"
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `is_user_follow_business` | boolean | The user follows your Instagram account |
| `is_business_follow_user` | boolean | Your Instagram account follows the user |
| `is_verified_user` | boolean | The user has a verified badge |
| `follower_count` | integer | The user's follower count |
| `fetched_at` | string | ISO 8601 timestamp of when the data was fetched from Instagram |

### Caching

Lookups are rate-limited to one Instagram call per user per second. Within that window, repeat requests return the same payload from cache. The `X-Cached` response header says which happened: `false` — fetched live from Instagram; `true` — served from cache (`fetched_at` shows the original fetch time).

### Error responses

**Non-Instagram profile (400):**

```json
{
  "error": "participant status is only supported for Instagram profiles"
}
```

**Unknown user id (404)** — Instagram can't resolve the id, or the user is outside your account's messaging scope:

```json
{
  "error": "Not found"
}
```

**Instagram rate limit hit (429):** retry after the `Retry-After` header.

---

## Resolve mention

<span class="method get">GET</span> `/api/profiles/:id/resolve_mention`

**LinkedIn only.** Turns a LinkedIn company page URL into the URN LinkedIn needs to render an @-mention. Company, showcase, and school pages all resolve; the page does not have to be one this connection administers.

Mentions are written into post text as `@[Display Name](urn)` — for example `@[Postproxy](urn:li:organization:110810308)`. Without the URN the mention publishes as plain text: no link, no notification. Postproxy resolves the URN; composing the text is yours. See [Mentions](/reference/platforms/linkedin/#mentions).

Person mentions (`linkedin.com/in/...`) can't be resolved yet — person lookup is coming soon.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Profile id (must be a LinkedIn profile) |

### Query parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | string | Yes | Company page URL (`https://www.linkedin.com/company/postproxy`) or just its name (`postproxy`) |

### Example

```bash
curl -X GET "https://api.postproxy.dev/api/profiles/prof_li_001/resolve_mention?url=https://www.linkedin.com/company/postproxy" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

Response:

```json
{
  "urn": "urn:li:organization:110810308",
  "type": "organization",
  "name": "Postproxy",
  "vanity_name": "postproxy"
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `urn` | string | LinkedIn URN to put inside `@[...](...)` |
| `type` | string | Always `organization` today |
| `name` | string | The page's name — a sensible default for the mention's display text |
| `vanity_name` | string | The slug that matched, to confirm the right page came back |

### Caching

Results are cached for 1 hour per company page, shared across profiles — a page's URN doesn't change, and the lookup draws on the same LinkedIn quota as publishing. Pages that resolve to nothing are cached for the same hour, so a bad URL in a loop won't hammer LinkedIn.

### Error responses

**Non-LinkedIn profile (400):**

```json
{
  "error": "mention resolution is only supported for LinkedIn profiles"
}
```

**Person page URL (400):**

```json
{
  "error": "only organization mentions can be resolved; person pages are not supported"
}
```

**Unknown company page (404):**

```json
{
  "error": "Not found"
}
```

---

## Post syncs

Postproxy mirrors posts published natively on a platform into your account, so they show up in history and can receive insights and comments. Every one of those pulls is recorded as a **post sync**: the sync fired when the profile connects, the recurring poll (every 3 hours; 23 hours on X), and any [backfill](#backfill-posts) you start.

### Post sync object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique sync identifier |
| `profile_id` | string | Profile this run belongs to |
| `kind` | string | Always `posts` today |
| `trigger` | string | `connect`, `scheduled`, or `backfill` |
| `status` | string | `pending`, `running`, `completed`, or `failed` |
| `started_at` | string\|null | ISO 8601 timestamp when the run began |
| `completed_at` | string\|null | ISO 8601 timestamp when it finished or failed |
| `posts_seen` | integer | Posts the platform returned across the run |
| `posts_imported` | integer | Posts that were **new** and got created. Lower than `posts_seen` whenever the run re-read posts you already have |
| `backfill_from` | string\|null | The date floor requested. `null` for `connect` and `scheduled` runs |
| `oldest_posted_at` | string\|null | Publish date of the oldest post the run reached — how far back it has walked |
| `error` | string\|null | Platform error message when `status` is `failed` |
| `created_at` | string | ISO 8601 timestamp |

Runs are kept for 30 days. A profile's page in the app shows the same list in its **Post sync** section.

---

## Backfill posts

<span class="method post">POST</span> `/api/profiles/:id/backfill_posts`

Walks the profile's feed backwards from the newest post, importing in batches of 25, until it reaches `from` or the platform stops returning posts. Runs in the background — the response is the [post sync](#post-sync-object) record, which you poll for progress.

Only one backfill runs per profile at a time. A backfill always walks from now backwards, so an in-flight one already covers any window a second request could ask for; starting another returns `409` with the running one's id.

### Body parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | string | Yes | ISO 8601 date/time, or a bare date meaning that date's start of day. The run stops at the first post published before this |

### Example

```bash
curl -X POST "https://api.postproxy.dev/api/profiles/prof123abc/backfill_posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "from": "2025-01-01" }'
```

Response (`202 Accepted`):

```json
{
  "id": "sync456def",
  "profile_id": "prof123abc",
  "kind": "posts",
  "trigger": "backfill",
  "status": "pending",
  "started_at": null,
  "completed_at": null,
  "posts_seen": 0,
  "posts_imported": 0,
  "backfill_from": "2025-01-01T00:00:00.000Z",
  "oldest_posted_at": null,
  "error": null,
  "created_at": "2026-08-06T09:15:00.000Z"
}
```

### Notes

- **How far back you can reach depends on the platform, not on Postproxy.** Where a platform's API pages through history, the backfill follows it; where it doesn't, the run ends early with whatever it got and `status: "completed"`.
- Imported posts arrive with `source: "imported"` and fire the [`post.imported`](/reference/webhooks/#postimported) webhook, the same as posts picked up by the recurring poll.
- Posts you already have are skipped, so overlapping backfills are safe — they just report a `posts_imported` lower than `posts_seen`.

### Error responses

**Missing or unparseable `from` (400):**

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "from"
}
```

**Backfill already running (409):**

```json
{
  "error": "A posts backfill is already running for this profile",
  "profile_sync_id": "sync456def"
}
```

**Profile can't be backfilled (422)** — disconnected, in a rate-limit cooldown, or an X profile on a plan without pull access:

```json
{
  "error": "This profile can't be backfilled right now"
}
```

---

## List post syncs

<span class="method get">GET</span> `/api/profiles/:id/post_syncs`

Retrieves [post sync](#post-sync-object) runs for a profile, newest first.

### Query parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `trigger` | string | No | - | Filter by `connect`, `scheduled`, or `backfill` |
| `status` | string | No | - | Filter by `pending`, `running`, `completed`, or `failed` |
| `page` | integer | No | `1` | Page number (1-based). Passing `0` returns page `1` |
| `per_page` | integer | No | `25` | Results per page (maximum `100`) |

### Example

```bash
curl -X GET "https://api.postproxy.dev/api/profiles/prof123abc/post_syncs?trigger=backfill" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

Response:

```json
{
  "total": 1,
  "page": 1,
  "per_page": 25,
  "data": [
    {
      "id": "sync456def",
      "profile_id": "prof123abc",
      "kind": "posts",
      "trigger": "backfill",
      "status": "running",
      "started_at": "2026-08-06T09:15:02.000Z",
      "completed_at": null,
      "posts_seen": 150,
      "posts_imported": 143,
      "backfill_from": "2025-01-01T00:00:00.000Z",
      "oldest_posted_at": "2025-11-04T18:22:00.000Z",
      "error": null,
      "created_at": "2026-08-06T09:15:00.000Z"
    }
  ]
}
```

---

## Get post sync

<span class="method get">GET</span> `/api/profiles/:id/post_syncs/:post_sync_id`

Retrieves a single run — poll this to follow a backfill to completion. Returns a [post sync object](#post-sync-object); the run is finished when `status` is `completed` or `failed`.

```bash
curl -X GET "https://api.postproxy.dev/api/profiles/prof123abc/post_syncs/sync456def" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Chat syncs

Postproxy mirrors direct-message conversations from Instagram and Facebook into your account so they show up under [Direct Messages](/reference/direct-messages/). Live traffic arrives over platform webhooks. Every pull on top of that is recorded as a **chat sync**: the one fired when the profile connects (or when direct messages are enabled on the account), which imports the newest 100 conversations with their newest 100 messages each, and any [backfill](#backfill-chats) you start — for example to recover a gap after a webhook outage or a period when another app held the conversation.

### Chat sync object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique sync identifier |
| `profile_id` | string | Profile this run belongs to |
| `kind` | string | Always `chats` |
| `trigger` | string | `connect` or `backfill` |
| `status` | string | `pending`, `running`, `completed`, or `failed` |
| `started_at` | string\|null | ISO 8601 timestamp when the run began |
| `completed_at` | string\|null | ISO 8601 timestamp when it finished or failed |
| `chats_seen` | integer | Conversations the platform returned across the run |
| `messages_imported` | integer | Messages that were **new** and got created. Messages you already have are skipped and not counted |
| `backfill_from` | string\|null | The date floor requested. `null` for `connect` runs |
| `oldest_updated_at` | string\|null | Last-activity time of the oldest conversation the run reached — how far back it has walked |
| `error` | string\|null | Platform error message when `status` is `failed` |
| `created_at` | string | ISO 8601 timestamp |

Runs are kept for 30 days.

---

## Backfill chats

<span class="method post">POST</span> `/api/profiles/:id/backfill_chats`

Walks the profile's conversations from the most recently active one backwards, and inside each conversation walks its messages from the newest backwards, until both reach `from`. Runs in the background — the response is the [chat sync](#chat-sync-object) record, which you poll for progress.

Only one chats backfill runs per profile at a time (a [posts backfill](#backfill-posts) on the same profile is independent). A backfill always walks from now backwards, so an in-flight one already covers any window a second request could ask for; starting another returns `409` with the running one's id.

### Body parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | string | Yes | ISO 8601 date/time, or a bare date meaning that date's start of day. Conversations last active before this are not opened; inside a conversation the run stops at the first message sent before this |

### Example

```bash
curl -X POST "https://api.postproxy.dev/api/profiles/prof123abc/backfill_chats" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "from": "2026-09-18" }'
```

Response (`202 Accepted`):

```json
{
  "id": "sync789ghi",
  "profile_id": "prof123abc",
  "placement_id": null,
  "kind": "chats",
  "trigger": "backfill",
  "status": "pending",
  "started_at": null,
  "completed_at": null,
  "chats_seen": 0,
  "messages_imported": 0,
  "backfill_from": "2026-09-18T00:00:00.000Z",
  "oldest_updated_at": null,
  "error": null,
  "created_at": "2026-09-21T09:15:00.000Z"
}
```

### Notes

- **Instagram and Facebook only**, and the account must have direct messages enabled. Other networks return `422`.
- A Facebook profile walks the conversations of every Page it manages; each chat lands under its Page's placement.
- Imported messages appear in [`GET /api/chats/:chat_id/messages`](/reference/direct-messages/#list-messages) once the run reaches them. Backfilled messages do **not** fire [`message.received`](/reference/webhooks/#messagereceived-messagesent-messagedelivered-messageread-messageedited-messagedeleted-messagefailed_waiting_for_retry-messagefailed) — poll the run, then list the chats. Messages you already have are skipped, so overlapping backfills are safe.
- Conversations are ordered by last activity. A conversation whose only activity is before `from` is never opened, even if it has messages after `from` in your own records.
- How far back you can reach depends on the platform's conversation history, not on Postproxy.

### Error responses

**Missing or unparseable `from` (400):**

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "from"
}
```

**Backfill already running (409):**

```json
{
  "error": "A chats backfill is already running for this profile",
  "profile_sync_id": "sync789ghi"
}
```

**Profile can't be backfilled (422)** — not an Instagram or Facebook profile, direct messages disabled on the account, disconnected, or in a rate-limit cooldown:

```json
{
  "error": "This profile can't be backfilled right now"
}
```

---

## List chat syncs

<span class="method get">GET</span> `/api/profiles/:id/chat_syncs`

Retrieves [chat sync](#chat-sync-object) runs for a profile, newest first.

### Query parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `trigger` | string | No | - | Filter by `connect` or `backfill` |
| `status` | string | No | - | Filter by `pending`, `running`, `completed`, or `failed` |
| `page` | integer | No | `1` | Page number (1-based). Passing `0` returns page `1` |
| `per_page` | integer | No | `25` | Results per page (maximum `100`) |

### Example

```bash
curl -X GET "https://api.postproxy.dev/api/profiles/prof123abc/chat_syncs?trigger=backfill" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

Response:

```json
{
  "total": 1,
  "page": 1,
  "per_page": 25,
  "data": [
    {
      "id": "sync789ghi",
      "profile_id": "prof123abc",
      "placement_id": null,
      "kind": "chats",
      "trigger": "backfill",
      "status": "running",
      "started_at": "2026-09-21T09:15:02.000Z",
      "completed_at": null,
      "chats_seen": 40,
      "messages_imported": 12,
      "backfill_from": "2026-09-18T00:00:00.000Z",
      "oldest_updated_at": "2026-09-18T14:02:00.000Z",
      "error": null,
      "created_at": "2026-09-21T09:15:00.000Z"
    }
  ]
}
```

---

## Get chat sync

<span class="method get">GET</span> `/api/profiles/:id/chat_syncs/:chat_sync_id`

Retrieves a single run — poll this to follow a backfill to completion. Returns a [chat sync object](#chat-sync-object); the run is finished when `status` is `completed` or `failed`.

```bash
curl -X GET "https://api.postproxy.dev/api/profiles/prof123abc/chat_syncs/sync789ghi" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Delete profile

<span class="method delete">DELETE</span> `/api/profiles/:id`

Disconnects and removes a profile from the account. This does not affect posts already published through this profile.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Profile id |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={deleteProfileBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={deleteProfileJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={deleteProfilePython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={deleteProfileGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={deleteProfileRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={deleteProfilePhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={deleteProfileJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={deleteProfileCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={deleteProfileResult} lang="json" />

---

## Token expiration

Some platforms issue access tokens that expire. The `expires_at` field indicates when the connection will expire and require re-authentication.

| Behavior | Description |
|----------|-------------|
| `expires_at: null` | Token does not expire or has a refresh token |
| `expires_at: "2024-..."` | Token expires at the specified time |

When a token expires:
- Posts to that profile will fail
- The user needs to reconnect the profile through the web dashboard
- Use the [Initialize Connection](/reference/profile-groups/#initialize-connection) endpoint to generate a new connection URL

---

## Connecting new profiles

Profiles cannot be created directly via the API. To connect a new social media account:

1. Use the [Initialize Connection](/reference/profile-groups/#initialize-connection) endpoint to get an OAuth URL
2. Redirect the user to that URL to authenticate
3. User is redirected back to your `redirect_url` after authentication
4. The profile is automatically created and associated with the profile group

---

## Using profiles in posts

When creating posts, reference profiles by:

1. **Profile ID**: Use the `id` id directly
2. **Platform name**: Use the platform string (e.g., `"twitter"`) to automatically select the profile for that platform

```json
{
  "profiles": ["prof123abc", "twitter", "linkedin"]
}
```

If multiple profiles exist for the same platform in a profile group, using the platform name selects the first one. Use the profile ID for explicit selection.

---

# profile-groups

Profile Groups are organizational containers that group related social media profiles together. For example, you might have separate profile groups for different brands, clients, or projects.

For multi-tenant setups, pair a new group with a key scoped to it via the [API Keys endpoints](/reference/api-keys/#customer-onboarding) — a two-call tenant onboarding at signup.

:::note
All calls require authentication.
:::

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profile_groups` | List all profile groups |
| `GET` | `/api/profile_groups/:id` | Get a single profile group |
| `POST` | `/api/profile_groups` | Create a new profile group |
| `DELETE` | `/api/profile_groups/:id` | Delete a profile group |
| `POST` | `/api/profile_groups/:id/initialize_connection` | Get OAuth URL to connect a profile |

---

## Profile group object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique profile group identifier (id) |
| `name` | string | Display name of the profile group |
| `profiles_count` | integer | Number of connected profiles in this group |

---

## List profile groups

<span class="method get">GET</span> `/api/profile_groups`

Retrieves all profile groups accessible with your API key.

### API key behavior

| API Key Type | Returns |
|--------------|---------|
| Full account access | All profile groups in the account |
| Profile group scoped | Only the scoped profile group |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={listGroupsBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={listGroupsJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={listGroupsPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={listGroupsGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={listGroupsRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={listGroupsPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={listGroupsJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={listGroupsCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={listGroupsResult} lang="json" />

---

## Get profile group

<span class="method get">GET</span> `/api/profile_groups/:id`

Retrieves a single profile group by its ID.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Profile group id |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={getGroupBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={getGroupJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={getGroupPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={getGroupGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={getGroupRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={getGroupPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={getGroupJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={getGroupCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={getGroupResult} lang="json" />

---

## Create profile group

<span class="method post">POST</span> `/api/profile_groups`

Creates a new profile group.

:::caution
This endpoint requires a **full account access** API key. Profile group scoped API keys cannot create new profile groups.
:::

### Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_group[name]` | string | Yes | Name for the new profile group |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={createGroupBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={createGroupJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={createGroupPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={createGroupGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={createGroupRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={createGroupPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={createGroupJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={createGroupCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response (201 Created):

<Code code={createGroupResult} lang="json" />

### Error responses

**Permission denied (scoped API key) (422):**
```json
{
  "error": "Your API key has no such permission"
}
```

---

## Delete profile group

<span class="method delete">DELETE</span> `/api/profile_groups/:id`

Deletes a profile group and all its associated profiles.

:::caution
This endpoint requires a **full account access** API key. Profile group scoped API keys cannot delete profile groups.
:::

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Profile group id |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={deleteGroupBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={deleteGroupJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={deleteGroupPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={deleteGroupGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={deleteGroupRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={deleteGroupPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={deleteGroupJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={deleteGroupCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={deleteGroupResult} lang="json" />

---

## Initialize connection

<span class="method post">POST</span> `/api/profile_groups/:id/initialize_connection`

Generates a URL to connect a new social media profile to a profile group. This is used to initiate the OAuth flow for connecting social accounts as if it was inside your service.

:::note
**Bluesky** uses an app-password flow instead of OAuth. The payload is different — see [Connect Bluesky (App Password)](#connect-bluesky-app-password) below.

**Telegram** uses a bring-your-own-bot flow. The payload is different and channel discovery is asynchronous — see [Connect Telegram (Bring Your Own Bot)](#connect-telegram-bring-your-own-bot) below.

**WhatsApp** uses Meta's Embedded Signup and takes an extra `onboarding` parameter that says where the phone number lives today — see [Connect WhatsApp (Embedded Signup)](#connect-whatsapp-embedded-signup) below.

**Instagram** connects with Instagram Login by default, or with Facebook Login when you pass `onboarding: "facebook"` — see [Connect Instagram (Instagram or Facebook Login)](#connect-instagram-instagram-or-facebook-login) below.
:::

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Profile group id |

### Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `platform` | string | Yes | Platform to connect |
| `redirect_url` | string | Yes (except `bluesky`, `telegram`) | URL to redirect to after OAuth completes |
| `refresh_connection` | boolean | No | Re-authorize a profile already connected to this group — to renew tokens or re-pick pages. Skips the "already connected" check for that platform: the same account is updated in place, while a different account is still rejected with `account_is_already_connected` |
| `identifier` | string | Yes for `bluesky` | Bluesky handle (e.g. `yourname.bsky.social`) |
| `app_password` | string | Yes for `bluesky` | Bluesky app password (generate at bsky.app/settings/app-passwords) |
| `bot_token` | string | Yes for `telegram` | Telegram bot token from [@BotFather](https://t.me/BotFather) |
| `onboarding` | string | No (`whatsapp` and `instagram` only) | **`whatsapp`:** where the number lives — `business_app` (coexistence with the WhatsApp Business app) or `api` (Cloud API or a fresh number); omit to let the user choose on the connect page, see [Connect WhatsApp](#connect-whatsapp-embedded-signup). **`instagram`:** which login to use — `instagram` (default) or `facebook`, see [Connect Instagram](#connect-instagram-instagram-or-facebook-login) |

### Supported platforms

| Platform | Account type | Auth type |
|---------|--------------|-----------|
| `facebook` | Facebook Page | OAuth |
| `instagram` | Instagram Business/Creator Account | OAuth (Instagram or Facebook Login, optional `onboarding`) |
| `tiktok` | TikTok Account | OAuth |
| `linkedin` | LinkedIn Profile | OAuth |
| `youtube` | YouTube Channel | OAuth |
| `twitter` | X (Twitter) Account | OAuth |
| `threads` | Threads Account | OAuth |
| `pinterest` | Pinterest Account | OAuth |
| `bluesky` | Bluesky Account | App password (no OAuth) |
| `telegram` | Telegram Channels (via bot) | Bring-your-own-bot (no OAuth) |
| `whatsapp` | WhatsApp Business Account | OAuth (Meta Embedded Signup, optional `onboarding`) |

### Example


<Tabs>
  <TabItem label="cURL">
    <Code code={initConnBash} lang="bash" />
  </TabItem>
  <TabItem label="Node">
    <Code code={initConnJs} lang="js" />
  </TabItem>
  <TabItem label="Python">
    <Code code={initConnPython} lang="python" />
  </TabItem>
  <TabItem label="Go">
    <Code code={initConnGo} lang="go" />
  </TabItem>
  <TabItem label="Ruby">
    <Code code={initConnRuby} lang="ruby" />
  </TabItem>
  <TabItem label="PHP">
    <Code code={initConnPhp} lang="php" />
  </TabItem>
  <TabItem label="Java">
    <Code code={initConnJava} lang="java" />
  </TabItem>
  <TabItem label=".NET">
    <Code code={initConnCsharp} lang="csharp" />
  </TabItem>
</Tabs>

Response:

<Code code={initConnResult} lang="json" />

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | URL to redirect the user to for OAuth authentication |
| `success` | boolean | Whether the invitation was created successfully |

### OAuth flow

1. Call this endpoint to get the connection URL
2. Redirect the user to the returned `url`
3. User authenticates with the social platform
4. User is redirected to your `redirect_url` after completion, with `id` (the new profile's id) and `platform_id` (the account's ID on the platform) appended as query parameters
5. A new profile is created in the specified profile group

**Example:** If your `redirect_url` is `https://myapp.com/callback?org=123`, a successful connection redirects to `https://myapp.com/callback?org=123&id=prof123abc&platform_id=123456789012345`.

If the user cancels or the OAuth flow fails, the user is redirected to your `redirect_url` with `?failure=true` and an `error_code` appended as query parameters. Any existing query parameters on your `redirect_url` are preserved.

| Error Code | Description |
|------------|-------------|
| `user_abandoned` | The user cancelled or dismissed the OAuth flow |
| `account_is_already_connected` | The social account is already connected to another profile. `platform_id` is appended alongside `failure` and `error_code`, so you can tell which platform account the user tried to connect |
| `update_failed` | Failed to update a previously disconnected profile during reconnection |

**Example:** If your `redirect_url` is `https://myapp.com/callback?org=123`, a cancelled connection redirects to `https://myapp.com/callback?org=123&failure=true&error_code=user_abandoned`.

### Error responses

**Missing redirect_url (422):**
```json
{
  "error": "Missing redirect_url"
}
```

**Missing platform (422):**
```json
{
  "error": "Missing platform"
}
```

**Platform already connected (422):**
```json
{
  "error": "Platform already connected"
}
```

---

## Connect Instagram (Instagram or Facebook Login)

An Instagram professional (Business or Creator) account can be connected two ways. Instagram Login is the default and works for any professional account. Facebook Login works for an account that is linked to a Facebook Page the user manages, and is the route to pick when the user administers the account from Facebook.

<span class="method post">POST</span> `/api/profile_groups/:id/initialize_connection`

### Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `platform` | string | Yes | `instagram` |
| `redirect_url` | string | Yes | URL to redirect to after OAuth completes |
| `onboarding` | string | No | `instagram` (default) or `facebook` |

### Example

```bash
curl -X POST "https://api.postproxy.dev/api/profile_groups/grp123abc/initialize_connection" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "platform": "instagram",
       "onboarding": "facebook",
       "redirect_url": "https://myapp.com/oauth/callback"
     }'
```

Facebook login connects **every Instagram account linked to the Pages the user grants**, not just one. The `id` and `platform_id` appended to your `redirect_url` belong to the primary account: the one already active in this group, otherwise the first one not connected elsewhere. The rest are connected at the same time:

- On plans billed per profile, they are all active in this group.
- On group-billed plans a group holds one Instagram profile, so the others are created with `status: "inactive"` and [`inactive_reason: "network_taken"`](/reference/profiles/#profile-object). They don't sync and fire no webhooks until you [move each one](/reference/profiles/#assign-profile-to-group) to a group without an Instagram profile, which activates it and fires `profile.connected`. Find them with [`GET /api/profiles`](/reference/profiles/).
- Accounts already connected in another group stay in that group and get fresh tokens.
- With `refresh_connection`, a different account isn't rejected — it's added the same way.

Calls without `onboarding` behave exactly as before. Either login produces a profile with `platform: "instagram"`, and the same API everywhere afterwards. Connecting an account again with the other login method updates the existing profile in place, keeping its `id`, post history and billing.

The connect page the `url` opens offers both routes as **Continue with Instagram** and **Continue with Facebook**, and an "Ask colleague" link gives the user both options as well.

---

## Connect WhatsApp (Embedded Signup)

WhatsApp connects through Meta's **Embedded Signup** — a Facebook login that grants Postproxy access to a WhatsApp Business Account (WABA) and its phone numbers. The call returns a `url` like any OAuth platform; what's different is the `onboarding` parameter.

<span class="method post">POST</span> `/api/profile_groups/:id/initialize_connection`

### Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `platform` | string | Yes | `whatsapp` |
| `redirect_url` | string | Yes | URL to redirect to after signup completes |
| `onboarding` | string | No | `business_app`, `api`, or omitted — see below |

### Choosing `onboarding`

| Value | Use when | What happens |
|-------|----------|--------------|
| `business_app` | The number is in the **WhatsApp Business app** on a phone and the team answers customers from it | *Coexistence.* Meta shows a QR code the user scans from WhatsApp Business (Settings → Linked devices). The phone keeps working, Postproxy sees the same chats, and up to 6 months of history is imported |
| `api` | The number is already on the Cloud API, or is a fresh number that will only be used from Postproxy | Standard Cloud API onboarding. The number is claimed for the API and stops working in the WhatsApp app. A new number is verified by SMS or voice call during signup |
| *(omitted)* | You don't know which applies | The connect page opens with a **"Where is your number now?"** chooser before the Facebook login |

### Example

```bash
curl -X POST "https://api.postproxy.dev/api/profile_groups/grp123abc/initialize_connection" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "platform": "whatsapp",
       "redirect_url": "https://myapp.com/oauth/callback",
       "onboarding": "api"
     }'
```

### What gets created

One connected WABA becomes **one profile**, and each of its phone numbers becomes a **placement** of that profile. If the login grants several WABAs, one profile is created per WABA.

Numbers arrive asynchronously: [`profile.placements_synced`](/reference/webhooks/#profileplacements_synced) fires once they're ready, then `GET /api/profiles/:id/placements` lists them with their `display_phone_number`, `quality_rating` and `messaging_limit_tier`. Poll or wait for the webhook before sending.

WhatsApp profiles are messaging-only — `POST /api/posts` returns `422`. Full details, including coexistence limits and the message template API, are on the [WhatsApp platform page](/reference/platforms/whatsapp/).

---

## Connect Bluesky (App Password)

Bluesky does not support OAuth in the same way other platforms do. Instead of returning a redirect URL, the API authenticates synchronously with the user's Bluesky handle and an app password, then creates the profile in one call.

<span class="method post">POST</span> `/api/profile_groups/:id/initialize_connection`

### Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `platform` | string | Yes | Must be `"bluesky"` |
| `identifier` | string | Yes | Bluesky handle. The `.bsky.social` suffix is added automatically if missing. Custom domains (e.g. `you.example.com`) are accepted as-is. |
| `app_password` | string | Yes | Bluesky **app password**, not the account password. Users generate one at https://bsky.app/settings/app-passwords |

:::caution
Always use an app password, never the user's main login password. Accounts protected by 2FA will reject the main password and return an error explaining that an app password is required.
:::

### Example

```bash
curl -X POST "https://api.postproxy.dev/api/profile_groups/grp123abc/initialize_connection" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "bluesky",
    "identifier": "yourname.bsky.social",
    "app_password": "xxxx-xxxx-xxxx-xxxx"
  }'
```

Response:

```json
{
  "success": true,
  "profile": {
    "id": "prof321zyx",
    "network": "bluesky",
    "name": "Your Display Name",
    "external_username": "yourname.bsky.social"
  }
}
```

### Error responses

**Missing credentials (422):**
```json
{
  "error": "Bluesky requires `identifier` (handle) and `app_password` in the payload. Generate an app password at https://bsky.app/settings/app-passwords",
  "error_code": "missing_credentials"
}
```

**Invalid credentials / 2FA required (401):**
```json
{
  "error": "This account requires 2FA. Generate an app password at bsky.app/settings/app-passwords and use that instead of your main password.",
  "error_code": "bluesky_login_failed"
}
```

**Account already connected to another profile group (422):**
```json
{
  "error": "This Bluesky profile is already connected to Postproxy.",
  "error_code": "account_is_already_connected"
}
```

---

## Connect Telegram (Bring Your Own Bot)

Telegram does not expose consumer OAuth for posting. Instead, the user creates their own bot via [@BotFather](https://t.me/BotFather) and adds it as administrator to the channel(s) they want to publish to. Postproxy uses that bot's token to publish.

A single Telegram `Profile` represents one bot. The channels it can publish to are exposed via the [placements](/reference/profiles/#list-placements) endpoint, and the destination channel for each post is selected per-post via the `chat_id` parameter — see [platform parameters](/reference/platforms/telegram/).

For a step-by-step walkthrough (creating the bot, adding it to channels, publishing the first post), see the [Connect Telegram with your own bot](/guides/telegram-byo-bot/) guide.

### Three-step flow

1. **Submit the bot token** with this endpoint to create a `Profile`. Postproxy validates the token and registers a webhook with Telegram.
2. **User adds the bot as administrator** to each Telegram channel they want to publish to. As Telegram notifies us via the webhook, channels appear in the Profile's placements.
3. **Poll** [`GET /api/profiles/:id/placements`](/reference/profiles/#list-placements) to list discovered channels. Use `chat_id` (the placement's `id`) when creating posts.

<span class="method post">POST</span> `/api/profile_groups/:id/initialize_connection`

### Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `platform` | string | Yes | Must be `"telegram"` |
| `bot_token` | string | Yes | Token issued by [@BotFather](https://t.me/BotFather). Get one with `/newbot`, then choose a name and username and copy the token. |

### Example

```bash
curl -X POST "https://api.postproxy.dev/api/profile_groups/grp123abc/initialize_connection" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "telegram",
    "bot_token": "123456789:ABCdef-GhIJklMnOpQrStUvWxYz"
  }'
```

Response:

```json
{
  "success": true,
  "profile": {
    "id": "prof321zyx",
    "network": "telegram",
    "name": "My Bot",
    "external_username": "my_bot"
  },
  "next_step": "Add @my_bot as administrator to the Telegram channel(s) you want to publish to. Channels will appear in GET /api/profiles/prof321zyx/placements once Telegram notifies us."
}
```

### Listing channels

After the bot has been added as administrator to one or more channels, list them via:

```bash
curl "https://api.postproxy.dev/api/profiles/prof321zyx/placements" \
  -H "Authorization: Bearer your_api_key"
```

```json
{
  "data": [
    { "id": "-1001234567890", "name": "My Channel (@mychannel)" },
    { "id": "-1009876543210", "name": "Private Channel" }
  ]
}
```

The list is empty until the user adds the bot to a channel. We recommend polling every few seconds while the user completes that step. If a channel never appears, ask the user to remove and re-add the bot — that re-fires the discovery event.

### Error responses

**Missing bot token (422):**
```json
{
  "error": "Telegram requires `bot_token` in the payload. Create a bot via @BotFather (https://t.me/BotFather) and pass the token."
}
```

**Invalid bot token (401):**
```json
{
  "error": "Telegram bot token is invalid or revoked — please reconnect the profile.",
  "error_code": "telegram_connect_failed"
}
```

**Bot already connected to another profile group (422):**
```json
{
  "error": "This Telegram bot is already connected to Postproxy.",
  "error_code": "account_is_already_connected"
}
```

---

## Use cases

### Multi-brand management

Create separate profile groups for different brands:

```bash
# Create brand profile groups
curl -X POST "https://api.postproxy.dev/api/profile_groups" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"profile_group": {"name": "Brand A"}}'

curl -X POST "https://api.postproxy.dev/api/profile_groups" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"profile_group": {"name": "Brand B"}}'
```

### Client onboarding

Generate connection URLs for clients to connect their accounts:

```bash
# Get OAuth URL for client to connect Instagram
curl -X POST "https://api.postproxy.dev/api/profile_groups/grp_client123/initialize_connection" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "redirect_url": "https://yourplatform.com/client/connected"
  }'
```

### Scoped API keys for partners

Issue profile-group-scoped API keys to partners, allowing them access only to their designated profile group while protecting other data.

---

# platforms

Each connected network behaves differently — different formats, media limits, character counts, and engagement features. This section has **one page per platform** that gathers all of it in one place: publishing formats and parameters, media constraints, placements, what you can (and can't) do with comments and direct messages, and which webhooks fire.

Most networks publish. **WhatsApp** is messaging-only — it has no publishing formats and no comments, and its page covers conversations, message templates and phone number administration instead.

| Platform | ID | Publishing formats | Page |
|----------|----|--------------------|------|
| Facebook | `facebook` | Feed post, Reel, Story | [Facebook](/reference/platforms/facebook/) |
| Instagram | `instagram` | Feed post, Reel, Story | [Instagram](/reference/platforms/instagram/) |
| Threads | `threads` | Feed post | [Threads](/reference/platforms/threads/) |
| X (Twitter) | `twitter` | Tweet, Poll | [X (Twitter)](/reference/platforms/twitter/) |
| LinkedIn | `linkedin` | Feed post, Poll | [LinkedIn](/reference/platforms/linkedin/) |
| YouTube | `youtube` | Channel video | [YouTube](/reference/platforms/youtube/) |
| TikTok | `tiktok` | Video, Images | [TikTok](/reference/platforms/tiktok/) |
| Pinterest | `pinterest` | Pin | [Pinterest](/reference/platforms/pinterest/) |
| Bluesky | `bluesky` | Feed post | [Bluesky](/reference/platforms/bluesky/) |
| Telegram | `telegram` | Channel post | [Telegram](/reference/platforms/telegram/) |
| Google Business | `google_business` | Standard, Event, Offer, Photo | [Google Business](/reference/platforms/google-business/) |
| WhatsApp | `whatsapp` | — (messaging only) | [WhatsApp](/reference/platforms/whatsapp/) |

## Using platform parameters

A single post can target many networks at once. The shared `post.body` and `media` apply everywhere; per-network options go in the `platforms` object, keyed by platform ID:

```json
{
  "post": {
    "body": "My post content"
  },
  "profiles": ["instagram", "youtube"],
  "media": ["https://example.com/video.mp4"],
  "platforms": {
    "instagram": {
      "format": "reel",
      "first_comment": "Link in bio!"
    },
    "youtube": {
      "title": "My Video Title",
      "privacy_status": "public"
    }
  }
}
```

Every parameter is documented on the platform's own page. See the [Posts API](/reference/posts/) for the full request shape.

## Character limits

| Platform | Limit | Notes |
|----------|-------|-------|
| Facebook | 63,206 | 2,200 for Reels |
| Instagram | 2,200 | Stories have no caption |
| Threads | 500 | |
| X (Twitter) | 280 / 25,000 | 280 on free accounts, 25,000 on paid. Polls are always capped at 280 |
| LinkedIn | 3,000 | |
| YouTube | 5,000 | Description. Title is capped at 100 |
| TikTok | 2,200 | |
| Pinterest | 500 | Description. Title is capped at 100 |
| Bluesky | 300 | Counted in graphemes |
| Telegram | 4,096 | |
| Google Business | 1,500 | Photo format has no body |
| WhatsApp | — | No publishing. Message templates follow Meta's own component limits |

## Media limits

Maximums for a single post. Per-format differences (Stories, Reels, etc.) are on each platform page.

| Platform | Images | Image max | Video max | Video length | Documents |
|----------|--------|-----------|-----------|--------------|-----------|
| Facebook | 10 | 4 MB | 4 GB | up to 4 h | — |
| Instagram | 10 | 8 MB | 300 MB | 3 s – 60 min | — |
| Threads | 20 | 8 MB | 1 GB | up to 5 min | — |
| X (Twitter) | 4 | 5 MB | 512 MB | 1 – 140 s | — |
| LinkedIn | 20 | 8 MB | 5 GB | up to 15 min | 1 (100 MB) |
| YouTube | — | — | 256 GB | no limit | — |
| TikTok | 35 | 20 MB | 4 GB | 3 s – 10 min | — |
| Pinterest | 1 | 32 MB | 2 GB | 4 s – 15 min | — |
| Bluesky | 4 | 1 MB | 50 MB | 1 – 60 s | — |
| Telegram | 10 | 10 MB | 50 MB | — | 1 (50 MB) |
| Google Business | 1 | 5 MB | — | — | — |
| WhatsApp | 1 | 5 MB | 16 MB | — | 1 (100 MB) |

## Engagement & delivery

What's available beyond publishing. "Threads" here means native multi-post chains (a thread/conversation), not the Threads network.

| Platform | Comments | Direct messages | Post chains | Placements |
|----------|----------|-----------------|-------------|------------|
| Facebook | Full (list, reply, delete, hide, like) + Page reviews (via [Profile Comments](/reference/profile-comments/)) | Yes | — | Pages |
| Instagram | List, reply, delete, hide | Yes | — | — |
| Threads | List, reply, hide | — | Yes | — |
| X (Twitter) | — | — | Yes | — |
| LinkedIn | Coming soon | — | — | Profile + organizations |
| YouTube | List, reply, delete | — | — | — |
| TikTok | List, reply, delete, hide, like, pin ([newer connections](/reference/platforms/tiktok/#connecting-tiktok)) | — | — | — |
| Pinterest | — | — | — | Boards |
| Bluesky | List (read-only) | Yes (text only) | Yes | — |
| Telegram | — | Yes | — | Channels |
| Google Business | Reviews (via [Profile Comments](/reference/profile-comments/)) | — | — | Locations |
| WhatsApp | — | Yes — templates, interactive messages, groups | — | Phone numbers |

Comment actions vary per platform — see the [Comments API](/reference/comments/) support matrix. Direct messages are detailed in the [Direct Messages API](/reference/direct-messages/).

## Cross-platform posting tips

### Text-only posts

Supported on X, LinkedIn, Facebook, Threads, Bluesky, Telegram, and Google Business. Instagram, TikTok, YouTube, and Pinterest require media. WhatsApp does not publish at all.

```json
{
  "post": {
    "body": "Exciting announcement coming soon!"
  },
  "profiles": ["twitter", "linkedin", "threads"]
}
```

### Image carousel

Supported on Instagram, Facebook, X (up to 4), LinkedIn (up to 20), Threads (up to 20), Telegram (up to 10), and Bluesky (up to 4).

```json
{
  "post": {
    "body": "Check out these photos!"
  },
  "profiles": ["instagram", "facebook"],
  "media": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg",
    "https://example.com/photo3.jpg"
  ]
}
```

### Video content

When posting the same video to multiple platforms, use platform-specific parameters:

```json
{
  "post": {
    "body": "New video is live!"
  },
  "profiles": ["youtube", "tiktok", "instagram"],
  "media": ["https://example.com/video.mp4"],
  "platforms": {
    "youtube": {
      "title": "Tutorial: Getting Started",
      "privacy_status": "public"
    },
    "tiktok": {
      "privacy_status": "PUBLIC_TO_EVERYONE"
    },
    "instagram": {
      "format": "reel"
    }
  }
}
```

### Post chains (threads)

Supported on X, Threads, and Bluesky. Pass a `thread` array of follow-up posts:

```json
{
  "post": {
    "body": "1/ Here is a thread about our launch"
  },
  "profiles": ["twitter", "threads"],
  "thread": [
    {
      "body": "2/ First, we built the foundation...",
      "media": ["https://example.com/screenshot.jpg"]
    },
    { "body": "3/ Then we added the features..." },
    { "body": "4/ Check it out at example.com" }
  ]
}
```

Thread children can include their own `media` arrays. See the [Threads section](/reference/posts/#threads) in the Posts API for full details.

## Validation errors

The API validates media against each platform's constraints before publishing. Common errors:

| Error | Cause |
|-------|-------|
| "Media is required for feed post on Instagram" | Instagram posts need at least one image or video |
| "Too many images for Feed post on Twitter (max: 4)" | X allows at most 4 images |
| "Content is not allowed for story on Instagram" | Stories don't support text content |
| "Cannot mix video and image for feed post on Facebook" | Some platforms don't allow mixed media |
| "Documents are not supported for feed post on Twitter" | The platform doesn't support document uploads |
| "Too many documents for Feed post on LinkedIn (max: 1)" | LinkedIn allows at most 1 document per post |
| "Cannot mix documents with images or videos for feed post on LinkedIn" | Documents must be posted on their own |

---

# facebook

:::tip[Building with an AI assistant?]
This page is the complete Facebook API reference for Postproxy — every format, parameter, media limit, and example in one place. Click **Copy page** at the top to copy it as Markdown, then paste it into ChatGPT, Claude, Cursor, or any LLM and it'll have everything it needs to write your integration.
:::

Postproxy publishes feed posts, Reels, and Stories to a Facebook **Page**, and offers the fullest engagement support of any network: complete comment management (including likes), Messenger direct messages with reactions and private replies, and Page reviews (recommendations) with replies. It also reads and updates the [Page's profile fields](#page-profile-management) — about, description, website, phone, emails.

Every request below uses the base URL `https://api.postproxy.dev` and an `Authorization: Bearer YOUR_API_KEY` header. Replace `YOUR_API_KEY` and the example IDs with your own.

## Profiles and profile groups

Every post targets one or more **profiles**. A profile is one connected account — for Facebook, a Facebook Page. Reference one in a request by its `id` (the `prof_abc123` in the examples below) or by the platform name `"facebook"`, which selects the group's Facebook profile (a group holds at most one profile per platform). List what's connected with [`GET /api/profiles`](/reference/profiles/).

Profiles live in **profile groups** — containers that organize the accounts for one brand, client, or project. List groups with [`GET /api/profile_groups`](/reference/profile-groups/), and connect a new Facebook profile with the [Initialize Connection](/reference/profile-groups/#initialize-connection) endpoint.

<details>
<summary>Example: get profiles and profile groups</summary>

List the profiles you can post to — `GET /api/profiles`:

```bash
curl -X GET "https://api.postproxy.dev/api/profiles" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    {
      "id": "prof_abc123",
      "name": "My Company Page",
      "platform": "facebook",
      "status": "active",
      "profile_group_id": "grp_xyz789",
      "expires_at": null,
      "post_count": 84,
      "avatar_url": "https://cdn.postproxy.dev/uploads/avatar_prof_abc123.jpg"
    }
  ]
}
```

List your profile groups — `GET /api/profile_groups`:

```bash
curl -X GET "https://api.postproxy.dev/api/profile_groups" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    { "id": "grp_xyz789", "name": "Main Brand", "profiles_count": 5 },
    { "id": "grp_def456", "name": "Client Project", "profiles_count": 3 }
  ]
}
```

</details>

## At a glance

| | |
|---|---|
| **Platform ID** | `facebook` |
| **Formats** | `post` (default), `reel`, `story` |
| **Character limit** | 63,206 (2,200 for Reels) |
| **Media** | Optional on feed posts; required for Reels and Stories |
| **Placements** | Pages — `page_id` (required) |
| **Comments** | List, reply, edit, delete, hide/unhide, like/unlike |
| **Reviews** | Page recommendations — list, reply, delete your reply (via [Profile Comments](/reference/profile-comments/)) |
| **Direct messages** | Yes — text, media, reactions, quick replies and buttons, private replies, m.me referrals |
| **Page profile** | Read and update about, description, website, phone, emails, and more — see [Page profile management](#page-profile-management) |
| **Country restriction** | Feed posts — see [Country restriction](#country-restriction) |
| **Link posts** | Feed posts — see [Link posts](#link-posts) |
| **Post chains** | No |

## Publishing

### Formats

| Format | Description |
|--------|-------------|
| `post` | Feed post (default) |
| `reel` | Facebook Reel |
| `story` | Facebook Story |

Every format requires a `page_id` — the Page to publish to. Fetch the IDs from [placements](#placements).

### Feed post

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | `"post"` (default) |
| `first_comment` | string | No | Comment added after publishing |
| `page_id` | string | Yes | Page to publish to — fetch from [placements](#placements) |
| `alt_text` | string or array | No | Alt text for images — see [Alt text](/reference/posts/#alt-text) |
| `made_with_ai` | boolean | No | Show Meta's "AI info" label. Feed posts with images only — see [AI disclosure](/reference/posts/#ai-disclosure) |
| `countries` | array or string | No | Restrict the post to viewers in these countries — see [Country restriction](#country-restriction) |
| `link` | string | No | Publish as a native link post with Facebook's preview card — see [Link posts](#link-posts) |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Image | 4 MB | jpg, png, gif, webp | 10 | — |
| Video | 4 GB | mp4, mov | 1 | 1 s – 4 h |

- Text-only posts are allowed; media is optional.
- Images and video cannot be mixed.
- Minimum image dimensions: 200×200 px.

```bash
# Feed post with an image and a first comment
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Exciting news! Check out our latest update." },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/image.jpg"],
       "platforms": {
         "facebook": {
           "format": "post",
           "first_comment": "What do you think? Let us know!",
           "page_id": "123456789"
         }
       }
     }'
```

### Country restriction

Restrict a feed post so only people in the given countries see it — Facebook's audience geo-gating. Anyone else won't see the post on the Page, in feed, or via a direct link. Enter the countries in the composer's Facebook settings, or pass `countries` as ISO 3166-1 alpha-2 codes — an array or a comma-separated string, case-insensitive.

```bash
# Feed post visible only to people in the US, Canada, and the UK
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Our North America and UK stores are now open." },
       "profiles": ["prof_abc123"],
       "platforms": {
         "facebook": {
           "page_id": "123456789",
           "countries": ["US", "CA", "GB"]
         }
       }
     }'
```

- Applies to the `post` format only; reels and stories ignore it.
- The restriction is set at publish time and can't be changed afterwards through the API.

### Link posts

Publish a feed post as a native link post: Facebook scrapes the URL's Open Graph tags and renders its own preview card — image, title, domain — which clicks through to the link, with the post body as the message above it. Fill in "Link" in the composer's Facebook settings, or pass `link` with an `http(s)` URL.

```bash
# Feed post published as a native link post
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Our guide to scheduling posts from your own app." },
       "profiles": ["prof_abc123"],
       "platforms": {
         "facebook": {
           "page_id": "123456789",
           "link": "https://postproxy.dev/blog/schedule-social-media-posts-api/"
         }
       }
     }'
```

- Applies to the `post` format only; reels and stories ignore it.
- Text-only — a `link` sent together with media is rejected with a `422` at create time, as is anything that isn't an `http(s)` URL.
- The preview card comes from the destination page's Open Graph tags, so change those to change the card. If Facebook can't fetch the URL, the post fails with a link error.

### Reel

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | `"reel"` |
| `title` | string | No | Title of the Reel |
| `page_id` | string | Yes | Page to publish to — fetch from [placements](#placements) |
| `first_comment` | string | No | Comment added after publishing |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Video | 300 MB | mp4, mov | 1 | 3 s – 90 s |

- A video is **required**.

```bash
# Reel
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Behind the scenes 🎬" },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/video.mp4"],
       "platforms": {
         "facebook": { "format": "reel", "title": "Launch BTS", "page_id": "123456789", "first_comment": "Link in bio!" }
       }
     }'
```

### Story

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | `"story"` |
| `page_id` | string | Yes | Page to publish to — fetch from [placements](#placements) |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Image | 4 MB | jpg, png | 1 | — |
| Video | 4 GB | mp4, mov | 1 | 3 s – 60 s |

- Media is **required**; text captions are not supported.
- Minimum dimensions: 500×500 px.

```bash
# Story (single image)
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": {},
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/story.jpg"],
       "platforms": { "facebook": { "format": "story", "page_id": "123456789" } }
     }'
```

## Placements

A Facebook profile can manage several **Pages**. List them with the placements endpoint — each placement's `id` is the `page_id` you pass when creating a post.

`page_id` is **required** on every post — there is no default Page, even when the profile has only one. Pass the `id` of the Page you want to publish to.

```bash
# List the Pages (placements) for a Facebook profile
curl "https://api.postproxy.dev/api/profiles/prof_abc123/placements" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Comments

Facebook has the most complete Comments API support. All comment writes are asynchronous and need the `profile_id` query parameter.

| Action | Supported |
|--------|-----------|
| List / read | Yes |
| Reply | Yes |
| Delete | Yes |
| Edit | Yes |
| Hide / unhide | Yes |
| Like / unlike | Yes |

- Comment `attachments` can carry photo, video, sticker, and share media.
- Author name and avatar are fetched when Facebook returns them. Follow/verified metadata (`is_verified_user`, `is_user_follow_business`, `is_business_follow_user`, `follower_count`) is not available on Facebook — it's Instagram-only.

```bash
# List comments on a post
curl "https://api.postproxy.dev/api/posts/post_abc123/comments?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```bash
# Reply to a comment (omit parent_id to comment on the post itself)
curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "body": "Appreciate the feedback!", "parent_id": "cmt_abc123" }'
```

```bash
# Like / unlike a comment
curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments/cmt_abc123/like?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"

curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments/cmt_abc123/unlike?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```bash
# Hide / unhide a comment
curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments/cmt_abc123/hide?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"

curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments/cmt_abc123/unhide?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```bash
# Delete a comment
curl -X DELETE "https://api.postproxy.dev/api/posts/post_abc123/comments/cmt_abc123?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Reviews (recommendations)

Facebook Page **recommendations** live on the Page, not on a post, so they surface through the [Profile Comments API](/reference/profile-comments/) — not the post-level Comments API. Recommendations are backfilled when the profile connects, then kept current in real time — new recommendations, edits, removals, and comments on them land within seconds.

| Action | Supported |
|--------|-----------|
| List | Yes — recommendations on the Page |
| Reply | Yes — a comment on the recommendation; several allowed |
| Delete | Yes — removes your comment; the recommendation stays |

- `platform_data.recommendation_type` is `"positive"` or `"negative"`. `platform_data.star_rating` only appears on legacy reviews left before Facebook replaced stars with recommendations (2018).
- Meta does not expose who left a recommendation — `author_username` and `author_avatar_url` are always `null`.
- `placement_id` is the Page ID; pass it to scope listings when the profile manages several Pages.
- `permalink` points at the Page's reviews tab (`https://www.facebook.com/<page_id>/reviews`) — Facebook has no per-review URLs.

```bash
# List recommendations (and your replies) for a profile
curl "https://api.postproxy.dev/api/profiles/prof_abc123/comments?placement_id=123456789" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```bash
# Reply to a recommendation — parent_id is its Postproxy ID or story ID
curl -X POST "https://api.postproxy.dev/api/profiles/prof_abc123/comments" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "body": "Thanks for the kind words!",
       "parent_id": "122219817518532572"
     }'
```

A `profile_comment.created` webhook fires for each new recommendation (across all Pages of the profile).

## Page profile management

Beyond publishing, Postproxy reads and updates the profile fields on a Facebook Page — the about text, description, website, phone, emails, and other contact and company details. This is separate from publishing to that Page.

Every endpoint is scoped to one connected profile and one Page:

```
/api/profiles/:profile_id/facebook/...
```

No extra connection or scope is needed: any Facebook profile connected to Postproxy can use these endpoints. **Every request requires `page_id`** — the Page's Facebook ID, exactly the placement `id` from [Placements](#placements). A `page_id` your profile can't reach returns `404`; a missing one returns `400`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profiles/:profile_id/facebook/page` | Get the Page's profile fields |
| `PATCH` | `/api/profiles/:profile_id/facebook/update_page` | Update the Page's profile fields |

Payloads use the Graph API's own field names, unchanged in both directions.

### Get Page

<span class="method get">GET</span> `/api/profiles/:profile_id/facebook/page`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_id` | string | Yes | Placement ID (see above) |
| `fields` | string | No | Comma-separated Graph API Page fields. Defaults to the profile-oriented set below |

Default fields: `id`, `name`, `username`, `link`, `category`, `fan_count`, `followers_count`, `about`, `description`, `general_info`, `company_overview`, `mission`, `products`, `founded`, `website`, `phone`, `emails`, `impressum`, `price_range`.

```bash
curl -X GET "https://api.postproxy.dev/api/profiles/prof_abc123/facebook/page?page_id=123456789" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "id": "123456789",
  "name": "Acme Coffee",
  "username": "acmecoffee",
  "link": "https://www.facebook.com/acmecoffee",
  "category": "Coffee shop",
  "fan_count": 12840,
  "followers_count": 13102,
  "about": "Neighbourhood coffee since 2009.",
  "description": "Roasted in-house. Open daily.",
  "website": "https://acme.example",
  "phone": "+1 555-0100",
  "emails": ["hello@acme.example"],
  "founded": "2009",
  "price_range": "$$"
}
```

Facebook omits fields the Page has never set, so keys can be absent from the response.

### Update Page

<span class="method patch">PATCH</span> `/api/profiles/:profile_id/facebook/update_page`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_id` | string | Yes | Placement ID |
| `about` | string | No | Short bio, up to 255 characters |
| `description` | string | No | Long-form description |
| `general_info` | string | No | Additional information |
| `company_overview` | string | No | Company overview |
| `mission` | string | No | Mission statement |
| `products` | string | No | Products |
| `founded` | string | No | Founding year or date |
| `website` | string | No | Website URL(s), space-separated for more than one |
| `phone` | string | No | Contact phone |
| `emails` | array | No | Contact email addresses |
| `impressum` | string | No | Legal notice (Impressum) |
| `price_range` | string | No | One of `$`, `$$`, `$$$`, `$$$$`, `Unspecified` |

Send only the fields you want to change; anything omitted is left as-is. At least one field is required, or the request is a `400`.

The response is the updated Page, in the same shape as [Get Page](#get-page).

```bash
curl -X PATCH "https://api.postproxy.dev/api/profiles/prof_abc123/facebook/update_page" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "page_id": "123456789",
       "about": "Neighbourhood coffee since 2009. Now with a roastery.",
       "website": "https://acme.example/coffee",
       "emails": ["hello@acme.example", "orders@acme.example"]
     }'
```

Requires the connecting user to hold a Page role that allows editing Page info; otherwise Facebook rejects the write and the request returns `403`.

### Page profile errors

| Status | Meaning |
|--------|---------|
| `400` | Missing `page_id`, no updatable field sent, or `about` over 255 characters |
| `403` | The Page token lacks permission to edit the Page |
| `404` | Profile not found, or `page_id` isn't a placement of this profile |
| `422` | Not a `facebook` profile, the connection needs re-authentication, or Facebook rejected the payload |
| `429` | Facebook is rate-limiting; retry after the `Retry-After` header |
| `502` | Facebook did not accept the connection |

## Direct messages

Facebook Messenger is supported through the Direct Messages API. Each send accepts **either** text **or** a single attachment.

| Capability | Supported |
|------------|-----------|
| Send / receive text | Yes |
| Attachments | Yes — one per send |
| Reactions | Yes — named reactions map to emoji (`love` → ❤, `like` → 👍, …) |
| Typing indicator | Yes — `start_typing` / `stop_typing` |
| Edit outbound message | No |
| Delivery / read receipts | Yes |
| Private reply to a comment | Yes |
| Quick replies / buttons | Yes — up to 13 chips, up to 3 buttons |
| m.me link referrals | Yes |
| Inbound delivery | Webhook |

- **24-hour window.** Free-form messages are only allowed within 24 hours of the participant's last message. Sending outside the window is not supported.
- **Private replies** DM a commenter directly, bypass the 24-hour window (up to 7 days), and are allowed once per comment.
- **[Quick replies and buttons](/reference/direct-messages/#quick-replies-and-buttons).** Send up to 13 quick-reply chips above the participant's composer, or up to 3 buttons (`web_url` / `postback`) attached to the message, optionally with a `card` (`subtitle`, `image_url`, `default_action`). Buttons ship as a Meta generic template, so `body` is capped at 220 characters when they're present, and they can't be combined with `media`. Taps arrive as inbound messages with `tapped_action` carrying your payload.
- **[m.me link referrals](/reference/direct-messages/#igme--mme-link-referrals).** When a user enters the thread via `https://m.me/<page_username>?ref=...`, the referral is stored on the chat (`metadata.referral`), a `referral.received` webhook fires, and the 24-hour window opens — you can reply before the user sends a message.
- Start a chat with the participant's Page-scoped ID (PSID) as `participant_external_id`.

```bash
# Create or find a chat by PSID
curl -X POST "https://api.postproxy.dev/api/profiles/prof_abc123/chats" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "participant_external_id": "7000000000000000", "participant_name": "Jane Doe" }'
```

```bash
# Send a text message
curl -X POST "https://api.postproxy.dev/api/chats/chat_abc123/messages" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "body": "Hi! How can we help?" }'
```

```bash
# Send a single media attachment
curl -X POST "https://api.postproxy.dev/api/chats/chat_abc123/messages" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "media": ["https://example.com/receipt.pdf"] }'
```

```bash
# Send quick-reply chips
curl -X POST "https://api.postproxy.dev/api/chats/chat_abc123/messages" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "body": "What can I help with?", "quick_replies": [
             { "title": "Track order", "payload": "TRACK" },
             { "title": "Talk to support", "payload": "HELP" }
           ] }'
```

```bash
# Send buttons attached to the message
curl -X POST "https://api.postproxy.dev/api/chats/chat_abc123/messages" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "body": "Your order shipped", "buttons": [
             { "type": "web_url",  "title": "Track",  "url": "https://shop.example.com/orders/123" },
             { "type": "postback", "title": "Cancel", "payload": "CANCEL:123" }
           ] }'
```

```bash
# React to a message (named reaction -> emoji)
curl -X POST "https://api.postproxy.dev/api/messages/msg_abc123/react" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "reaction": "like" }'
```

```bash
# Private reply to a commenter (bypasses the 24h window, once per comment)
curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments/cmt_abc123/private_reply?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "text": "Sent you a DM with the details!" }'
```

## Stats

Postproxy records periodic stat snapshots you can pull as a timeseries; field names pass through from Facebook unchanged.

### Profile stats

Page-level metrics, refreshed roughly every 23 hours and scoped per Page — pass the Page's `placement_id`. See the [Profile stats endpoint](/reference/profiles/#profile-stats) (`GET /api/profiles/:id/stats`).

**Fields:** `fan_count`, `followers_count`, plus daily Page insights (`page_media_view`, `page_views_total`, `page_post_engagements`, `page_daily_follows`, `page_daily_unfollows`, `page_daily_follows_unique`, `page_daily_unfollows_unique`)

`page_media_view` is Meta's unified "Views" metric. Reach-style metrics are no longer exposed by the Facebook Page Insights API.

```bash
# Fetch the stats timeseries for one Page (placement_id is the page_id)
curl "https://api.postproxy.dev/api/profiles/prof_abc123/stats?placement_id=123456789" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

### Post stats

Per-post engagement, captured after publish via the [Post stats endpoint](/reference/posts/#post-stats) (`GET /api/posts/stats`).

**Fields:** `impressions`, `clicks`, `likes`, `comments`, `shares`

```bash
# Fetch post stats
curl "https://api.postproxy.dev/api/posts/stats?post_ids=post_abc123&profiles=facebook" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Webhooks

Subscribe with the Webhooks API. Create a subscription:

```bash
curl -X POST "https://api.postproxy.dev/api/webhooks" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com/webhooks/postproxy",
       "events": ["platform_post.published", "comment.created", "message.received", "reaction.received"]
     }'
```

Events relevant to Facebook:

| Event | When |
|-------|------|
| `post.processed` | A post is ready to publish |
| `platform_post.published` | A post was published to the platform |
| `platform_post.failed` | A post failed to publish (retries exhausted) |
| `platform_post.failed_waiting_for_retry` | A publish attempt failed; will retry |
| `platform_post.insights` | New analytics snapshot |
| `comment.created` | A comment was synced on a Facebook post |
| `profile_comment.created` | A new Page recommendation was synced, or your reply was published |
| `message.received` / `.sent` | Inbound / outbound DM |
| `message.delivered` / `.read` | Delivery and read receipts |
| `message.edited` | An inbound message was edited |
| `reaction.received` | A reaction was added or removed on a message |
| `referral.received` | A participant entered a DM thread via an m.me link |
| `profile.connected` / `.disconnected` | Connection state changed |
| `profile.stats` | New profile stats snapshot (once per Page) |
| `media.failed` | A media attachment failed to process |

Facebook does **not** report message deletions — `message.deleted` only fires for Instagram.

## What you can't do

Facebook's API doesn't expose these features, so they aren't available through Postproxy:

- Demographic targeting (age, gender, or interests) — [country restriction](#country-restriction) works today.
- Going live.
- Posting to a personal profile; publishing targets a Page only.
- Interactive Story stickers.
- Creating Events.
- Posting to Groups, which Facebook has deprecated.

## Notes

- Publishing targets a Facebook **Page**, not a personal profile.
- `page_id` is required on every post; fetch it from [placements](#placements).
- Reels are video-only and capped at 90 seconds; Stories require 500×500 px media.

---

# instagram

:::tip[Building with an AI assistant?]
This page is the complete Instagram API reference for Postproxy — every format, parameter, media limit, and example in one place. Click **Copy page** at the top to copy it as Markdown, then paste it into ChatGPT, Claude, Cursor, or any LLM and it'll have everything it needs to write your integration.
:::

Postproxy publishes feed posts, Reels, and Stories to an Instagram professional (Business or Creator) account, and lets you read and reply to comments and read and send direct messages — including private replies to commenters and inbound story mentions.

Every request below uses the base URL `https://api.postproxy.dev` and an `Authorization: Bearer YOUR_API_KEY` header. Replace `YOUR_API_KEY` and the example IDs with your own.

## Profiles and profile groups

Every post targets one or more **profiles**. A profile is one connected account — for Instagram, an Instagram Business or Creator account. Reference one in a request by its `id` (the `prof_abc123` in the examples below) or by the platform name `"instagram"`, which selects the group's Instagram profile (a group holds at most one profile per platform). List what's connected with [`GET /api/profiles`](/reference/profiles/).

Profiles live in **profile groups** — containers that organize the accounts for one brand, client, or project. List groups with [`GET /api/profile_groups`](/reference/profile-groups/), and connect a new Instagram profile with the [Initialize Connection](/reference/profile-groups/#initialize-connection) endpoint.

### Connecting Instagram

An Instagram professional account connects either with **Instagram Login** (the default) or with **Facebook Login**, which suits an account linked to a Facebook Page the user manages. Pick the route with the `onboarding` parameter on [Initialize Connection](/reference/profile-groups/#connect-instagram-instagram-or-facebook-login) — `instagram` or `facebook` — or omit it and the connect page offers both. Either way the profile comes back as `platform: "instagram"` and behaves identically from then on, and connecting the same account again through the other login updates the existing profile in place, keeping its `id`, post history and billing.

<details>
<summary>Example: get profiles and profile groups</summary>

List the profiles you can post to — `GET /api/profiles`:

```bash
curl -X GET "https://api.postproxy.dev/api/profiles" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    {
      "id": "prof_abc123",
      "name": "@mycompany",
      "platform": "instagram",
      "status": "active",
      "profile_group_id": "grp_xyz789",
      "expires_at": null,
      "post_count": 96,
      "avatar_url": "https://cdn.postproxy.dev/uploads/avatar_prof_abc123.jpg"
    }
  ]
}
```

List your profile groups — `GET /api/profile_groups`:

```bash
curl -X GET "https://api.postproxy.dev/api/profile_groups" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    { "id": "grp_xyz789", "name": "Main Brand", "profiles_count": 5 },
    { "id": "grp_def456", "name": "Client Project", "profiles_count": 3 }
  ]
}
```

</details>

## At a glance

| | |
|---|---|
| **Platform ID** | `instagram` |
| **Formats** | `post` (default), `reel`, `story` |
| **Character limit** | 2,200 (Stories have no caption) |
| **Media** | Required on every format |
| **Comments** | List, reply, delete, hide/unhide |
| **Direct messages** | Yes — text, media, reactions, quick replies and buttons, private replies, ice breakers, ig.me referrals |
| **Post chains** | No |
| **Reel audio** | Music and original sounds — Facebook-login profiles only |
| **Collaboration invites** | List, accept, decline incoming invites — Facebook-login profiles only |

## Publishing

### Formats

| Format | Description |
|--------|-------------|
| `post` | Feed post — single image, video, or carousel (default) |
| `reel` | Instagram Reel |
| `story` | Instagram Story |

### Feed post

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | `"post"` (default) |
| `first_comment` | string | No | Comment added after publishing (max 2,196 characters) |
| `collaborators` | array | No | Collaborator usernames to invite |
| `disable_comment` | boolean | No | Turn comments off on the post. Applied right after publishing |
| `location_id` | string | No | Location to tag. See [Location](#location) |
| `user_tags` | array | No | Instagram accounts to tag. See [User tags](#user-tags) |
| `alt_text` | string or array | No | Alt text for images, including carousel images (max 1,000 characters). Feed post images only — not reels or stories. See [Alt text](/reference/posts/#alt-text) |
| `made_with_ai` | boolean | No | Show Meta's "AI info" label on the post. Applies to the whole carousel. See [AI disclosure](/reference/posts/#ai-disclosure) |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Image | 8 MB | jpg, png | 10 | — |
| Video | 300 MB | mp4, mov | 1 | 3 s – 60 min |

- Media is **required**. Text caption is optional.
- Pass 2–10 media items in `media` to publish a **carousel**; a single item posts as a regular photo or video.
- Images and a video can be mixed in one carousel.
- Minimum image dimensions: 200×200 px.

```bash
# Feed carousel with a first comment and collaborators
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Three takeaways from our launch week 👇" },
       "profiles": ["prof_abc123"],
       "media": [
         "https://example.com/slide1.jpg",
         "https://example.com/slide2.jpg",
         "https://example.com/slide3.jpg"
       ],
       "platforms": {
         "instagram": {
           "format": "post",
           "first_comment": "Follow for more content!",
           "collaborators": ["partnerhandle"]
         }
       }
     }'
```

### Reel

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | `"reel"` |
| `first_comment` | string | No | Comment added after publishing (max 2,196 characters) |
| `cover_url` / `cover_file` | string / file | No | Cover image. Pass `cover_url` (URL) in JSON or `cover_file` (file) in multipart |
| `audio_name` | string | No | Name of the audio track. Ignored when `audio_id` is set |
| `audio_id` | string | No | Music or original sound to attach, from [Reel audio](#reel-audio). Facebook-login profiles only |
| `audio_volume` | integer | No | Volume of the attached audio, `1`–`100` (default `100`). Facebook-login profiles only |
| `video_volume` | integer | No | Volume of the video's own audio when `audio_id` is set, `1`–`100` (default `100`). Facebook-login profiles only |
| `strip_audio` | boolean | No | Remove the video's own audio track before publishing |
| `trial_strategy` | string | No | Trial-reel strategy: `"MANUAL"` or `"SS_PERFORMANCE"` |
| `collaborators` | array | No | Up to 3 collaborator usernames |
| `thumb_offset` | string | No | Thumbnail offset in milliseconds. Ignored if `cover_url` is set |
| `share_to_feed` | boolean | No | Also show the reel in the profile feed and grid. Defaults to Instagram's behavior, which shares it. Pass `false` to publish to the Reels tab only |
| `disable_comment` | boolean | No | Turn comments off on the reel. Applied right after publishing |
| `location_id` | string | No | Location to tag. See [Location](#location) |
| `user_tags` | array | No | Instagram accounts to tag. See [User tags](#user-tags) |
| `made_with_ai` | boolean | No | Show Meta's "AI info" label on the reel. See [AI disclosure](/reference/posts/#ai-disclosure) |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Video | 300 MB | mp4, mov | 1 | 3 s – 90 min |

- A video is **required**; images are not accepted on Reels.

```bash
# Reel with a cover image and audio name
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "New reel is live! Full tutorial on our channel 🎬" },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/video.mp4"],
       "platforms": {
         "instagram": {
           "format": "reel",
           "first_comment": "Full tutorial link in bio!",
           "cover_url": "https://example.com/thumbnail.jpg",
           "audio_name": "Trending Audio Track"
         }
       }
     }'
```

### Story

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | `"story"` |
| `strip_audio` | boolean | No | Remove the video's own audio track before publishing (video stories) |
| `user_tags` | array | No | Instagram accounts to tag. See [User tags](#user-tags) |
| `made_with_ai` | boolean | No | Show Meta's "AI info" label on the story. See [AI disclosure](/reference/posts/#ai-disclosure) |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Image | 8 MB | jpg, png | 1 | — |
| Video | 100 MB | mp4, mov | 1 | 1 s – 60 min |

- Media is **required**; text captions are not supported.
- Minimum dimensions: 200×200 px.

```bash
# Story (single image)
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": {},
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/story.jpg"],
       "platforms": { "instagram": { "format": "story" } }
     }'
```

### User tags

Tag public Instagram accounts in a feed post, Reel, or Story by passing `user_tags` in the Instagram platform parameters. Each entry takes:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | Public Instagram username (a leading `@` is stripped) |
| `x` | float | For images | Horizontal position, `0.0`–`1.0` from the left edge |
| `y` | float | For images | Vertical position, `0.0`–`1.0` from the top edge |
| `media_index` | integer | No | Which media item to tag, 0-based. Defaults to `0` |

- **Images** require `x` and `y` — Instagram rejects an image tag without coordinates.
- **Reels and video slides** are tagged by username only; coordinates are ignored.
- **Stories** accept coordinates but don't require them.
- `media_index` targets a specific carousel slide, video slides included, so one post can tag different accounts on each image.
- Coordinates outside `0.0`–`1.0`, a `media_index` past the last media item, or an image tag missing `x`/`y` return a `422` naming the offending entry.
- Private accounts, and accounts that don't allow tagging, are silently skipped by Instagram at publish time.
- API only for now — the composer has no field for it yet.

```bash
# Carousel: slides 0 and 1 are images (coordinates required), slide 2 is a video (username only)
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Mission recap 🚀" },
       "profiles": ["prof_abc123"],
       "media": [
         "https://example.com/slide1.jpg",
         "https://example.com/slide2.jpg",
         "https://example.com/clip.mp4"
       ],
       "platforms": {
         "instagram": {
           "format": "post",
           "user_tags": [
             { "username": "natgeo", "x": 0.5, "y": 0.4 },
             { "username": "nasa", "x": 0.2, "y": 0.8, "media_index": 1 },
             { "username": "spacex", "media_index": 2 }
           ]
         }
       }
     }'
```

### Location

`location_id` tags a feed post or Reel with a location. Instagram locations are Facebook Pages, so the value is the numeric ID of a Facebook Page that has an address — a place name doesn't work.

- On a carousel the location applies to the whole post; individual slides can't have their own.
- Stories don't support locations.
- A Page with no address is rejected by Instagram, and the post fails with the error Instagram returns.

```bash
# Reel tagged with a location, published to the Reels tab only
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Opening night 🎉" },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/video.mp4"],
       "platforms": {
         "instagram": {
           "format": "reel",
           "location_id": "110843418940484",
           "share_to_feed": false
         }
       }
     }'
```

### Rate limits

- **100 posts per day** per user, on a rolling 24-hour window, across all Instagram formats.
- Instagram may also throttle bursts with `User is performing too many actions`. Slow down and retry later when you hit it.

## Reel audio

Search the music and original sounds a reel can use as its soundtrack, then attach one when you publish by passing its `audio_id` as a [reel parameter](#reel).

:::note
**Facebook-login profiles only.** Meta opens its audio library to Instagram profiles connected through [Facebook login](#connecting-instagram). Profiles connected with Instagram login return a `422`.
:::

### Available audio

<span class="method get">GET</span> `/api/profiles/:profile_id/instagram/available_audio`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `audio_type` | string | No | `music` (default) or `original_sound` |
| `search_query` | string | No | Search term. Without one, Instagram returns trending audio |

```bash
# Search the music library
curl "https://api.postproxy.dev/api/profiles/prof_abc123/instagram/available_audio?audio_type=music&search_query=summer" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    {
      "audio_id": "1234567890123456",
      "audio_type": "music",
      "title": "Summer Nights",
      "display_artist": "Example Artist",
      "duration_in_ms": 165000,
      "cover_artwork_thumbnail_uri": "https://...",
      "is_ads_eligible": true,
      "on_platform_audio_preview_link": "https://www.instagram.com/reels/audio/1234567890123456/",
      "download_url": "https://..."
    }
  ]
}
```

Items keep Meta's own field names. `display_artist` and `cover_artwork_thumbnail_uri` come with `music` only; `ig_username` and `profile_picture_url` with `original_sound` only. `download_url` is a temporary preview link that expires after about 1.5 days.

Instagram returns only audio cleared for third-party use, so the catalog can differ from what the Instagram app shows.

**Errors:** `400` when `audio_type` is neither `music` nor `original_sound`, `403` when the connection can't read the audio library, `404` for an unknown profile, `422` when the profile isn't an Instagram profile connected via Facebook login or the connection needs re-authentication, `429` when Instagram rate-limits (retry after the `Retry-After` header), `502` when Instagram doesn't accept the connection.

### Attaching audio to a reel

```bash
# Reel with library music replacing the original sound
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Summer edit ☀️" },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/video.mp4"],
       "platforms": {
         "instagram": {
           "format": "reel",
           "audio_id": "1234567890123456",
           "audio_volume": 80,
           "strip_audio": true
         }
       }
     }'
```

Mix the two tracks with `audio_volume` and `video_volume`, or pass `strip_audio: true` to drop the video's own audio and leave only the attached track.

## Collaboration invites

List the posts other accounts have invited this profile to collaborate on, then accept or decline each invite. To send invites from your own posts, pass `collaborators` when you [publish a feed post](#feed-post) or [reel](#reel).

:::note
**Facebook-login profiles only.** Meta offers collaboration invites to Instagram profiles connected through [Facebook login](#connecting-instagram). Profiles connected with Instagram login return a `422`.
:::

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profiles/:profile_id/instagram/collaboration_invites` | List incoming invites |
| `POST` | `/api/profiles/:profile_id/instagram/accept_collaboration_invite` | Accept an invite |
| `POST` | `/api/profiles/:profile_id/instagram/decline_collaboration_invite` | Decline an invite |

### List invites

<span class="method get">GET</span> `/api/profiles/:profile_id/instagram/collaboration_invites`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | `next_cursor` from the previous page |

```bash
curl "https://api.postproxy.dev/api/profiles/prof_abc123/instagram/collaboration_invites" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "collaboration_invites": [
    {
      "media_id": "17890000000000000",
      "media_owner_username": "partner_brand",
      "caption": "Our new collab drop",
      "media_url": "https://..."
    }
  ],
  "next_cursor": null
}
```

`next_cursor` is `null` on the last page. Instagram leaves out `media_url` for videos with copyrighted or licensed audio.

### Accept or decline an invite

<span class="method post">POST</span> `/api/profiles/:profile_id/instagram/accept_collaboration_invite`

<span class="method post">POST</span> `/api/profiles/:profile_id/instagram/decline_collaboration_invite`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `media_id` | string | Yes | `media_id` from [List invites](#list-invites) |

```bash
curl -X POST "https://api.postproxy.dev/api/profiles/prof_abc123/instagram/accept_collaboration_invite" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "media_id": "17890000000000000" }'
```

```json
{ "accepted": true, "media_id": "17890000000000000" }
```

Decline returns `{ "declined": true, "media_id": "17890000000000000" }`.

**Errors:** `400` when `media_id` is missing, `403` when the connection lacks permission for collaboration invites, `404` for an unknown profile, `422` when the profile isn't an Instagram profile connected via Facebook login, the connection needs re-authentication, or Instagram rejected the request, `429` when Instagram rate-limits (retry after the `Retry-After` header).

## Comments

Instagram comments are managed through the Comments API. All comment writes are asynchronous. Every call needs the `profile_id` query parameter.

| Action | Supported |
|--------|-----------|
| List / read | Yes |
| Reply | Yes |
| Delete | Yes |
| Hide / unhide | Yes |
| Like / unlike | No |

- Comments are **text-only** — the `attachments` array is always empty.
- Author metadata is available when Instagram returns it: `is_verified_user`, `is_user_follow_business`, `is_business_follow_user`, and `follower_count`. You can also fetch it on demand for any commenter or DM sender via the [Participant Status endpoint](/reference/profiles/#participant-status).
- A `comment.created` webhook fires when a new comment is synced.

```bash
# List comments on a post
curl "https://api.postproxy.dev/api/posts/post_abc123/comments?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```bash
# Reply to a comment (omit parent_id to comment on the post itself)
curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "body": "Thanks for the kind words!", "parent_id": "cmt_abc123" }'
```

```bash
# Hide / unhide a comment
curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments/cmt_abc123/hide?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"

curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments/cmt_abc123/unhide?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```bash
# Delete a comment
curl -X DELETE "https://api.postproxy.dev/api/posts/post_abc123/comments/cmt_abc123?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Direct messages

Instagram Direct is supported through the Direct Messages API. Outbound sends are asynchronous and accept **either** text **or** a single attachment per send.

| Capability | Supported |
|------------|-----------|
| Send / receive text | Yes |
| Attachments | Yes — one per send |
| Reactions | Yes — Instagram accepts `love` (an `emoji` may accompany it) |
| Typing indicator | Yes — `start_typing` / `stop_typing` |
| Edit outbound message | No |
| Delivery / read receipts | Yes |
| Private reply to a comment | Yes |
| Quick replies / buttons | Yes — chips on plain text only, up to 3 buttons |
| Quoted replies | Yes — `reply_to_external_id` |
| ig.me link referrals | Yes |
| Ice breakers | Yes — up to 4 questions |
| Inbound delivery | Webhook |

- **24-hour window.** Free-form messages are only allowed within 24 hours of the participant's last message. Sending outside the window is not supported.
- **[Quoted replies](/reference/direct-messages/#send-message).** Pass the `external_id` (Instagram `mid`) of any message in the chat, inbound or outbound, as `reply_to_external_id` and the send quotes it in the thread. Works with text, media and `tag: "HUMAN_AGENT"`. If Instagram rejects the target (deleted, too old, or not in this chat), the send fails with `message.failed` and Meta's error in `error_details`.
- **Private replies** DM a commenter directly, bypass the 24-hour window (up to 7 days after the comment), and are allowed once per comment.
- **Story mentions** arrive as inbound messages with a `story_mention` attachment, mirrored to durable storage. **Story replies** populate `story_reply` on the message.
- **[ig.me link referrals](/reference/direct-messages/#igme--mme-link-referrals).** When a user enters the thread via `https://ig.me/m/<username>?ref=...`, the referral is stored on the chat (`metadata.referral`), a `referral.received` webhook fires, and the 24-hour window opens — you can reply before the user sends a message. Meta only delivers ig.me referrals for profiles with at least one ice breaker set.
- **[Quick replies and buttons](/reference/direct-messages/#quick-replies-and-buttons).** Send up to 13 quick-reply chips above the participant's composer, or up to 3 buttons (`web_url` / `postback`) attached to the message, optionally with a `card`. Instagram delivers chips **only on a plain-text message** — `quick_replies` with `media` or with `buttons` returns `422` (Facebook accepts both). Buttons cap `body` at 220 characters and can't be combined with `media`. Taps arrive as inbound messages with `tapped_action` carrying your payload.
- **[Ice breakers](/reference/direct-messages/#ice-breakers).** Manage the up to four suggested questions shown when a user opens a new thread, via `GET` / `POST` / `DELETE /api/profiles/:id/ice_breakers`. A tap arrives as an inbound message with `tapped_action` carrying your `payload` and `kind: "postback"`.
- Start a chat with the participant's Instagram-scoped user ID as `participant_external_id`.

```bash
# List chats for the profile
curl "https://api.postproxy.dev/api/profiles/prof_abc123/chats" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```bash
# Create or find a chat by participant ID (idempotent)
curl -X POST "https://api.postproxy.dev/api/profiles/prof_abc123/chats" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "participant_external_id": "17841400000000000", "participant_username": "janedoe" }'
```

```bash
# Send a text message
curl -X POST "https://api.postproxy.dev/api/chats/chat_abc123/messages" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "body": "Hi! Thanks for reaching out 👋" }'
```

```bash
# Send a single media attachment
curl -X POST "https://api.postproxy.dev/api/chats/chat_abc123/messages" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "media": ["https://example.com/catalog.jpg"] }'
```

```bash
# React to a message (Instagram accepts "love")
curl -X POST "https://api.postproxy.dev/api/messages/msg_abc123/react" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "reaction": "love" }'
```

```bash
# Private reply to a commenter (bypasses the 24h window, once per comment)
curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments/cmt_abc123/private_reply?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "text": "Just sent you a DM with the details!" }'
```

```bash
# Set ice breakers (replaces the existing set)
curl -X POST "https://api.postproxy.dev/api/profiles/prof_abc123/ice_breakers" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "ice_breakers": [
           { "question": "Track my order", "payload": "TRACK_ORDER" },
           { "question": "What are your hours?", "payload": "HOURS" }
         ] }'
```

## Stats

Postproxy records periodic stat snapshots you can pull as a timeseries; field names pass through from Instagram unchanged.

### Profile stats

Account-level metrics, refreshed roughly every 23 hours via the [Profile stats endpoint](/reference/profiles/#profile-stats) (`GET /api/profiles/:id/stats`).

**Fields:** `followers_count`, `follows_count`, `media_count`, plus per-window insights suffixed `_1d`, `_7d`, `_14d`, `_30d` (`views_*`, `reach_*`, `profile_views_*`, `accounts_engaged_*`, `total_interactions_*`, `website_clicks_*`, `follower_count_*`). Reach and views also come split by audience: `reach_followers_*`, `reach_non_followers_*`, `views_followers_*`, `views_non_followers_*`.

```bash
# Fetch the profile stats timeseries
curl "https://api.postproxy.dev/api/profiles/prof_abc123/stats" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

### Post stats

Per-post engagement, captured after publish via the [Post stats endpoint](/reference/posts/#post-stats) (`GET /api/posts/stats`).

**Fields:** `impressions`, `likes`, `comments`, `saved`, `profile_visits`, `follows`. `raw_stats` adds `reach`, `shares` and `total_interactions`, plus `ig_reels_avg_watch_time` and `ig_reels_video_view_total_time` (milliseconds) on reels, and `profile_activity` with its `profile_activity_by_action_type` breakdown on feed posts and carousels.

Stories do not return post stats, and there is no per-post follower / non-follower split.

```bash
# Fetch post stats
curl "https://api.postproxy.dev/api/posts/stats?post_ids=post_abc123&profiles=instagram" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Webhooks

Subscribe with the Webhooks API. Create a subscription:

```bash
curl -X POST "https://api.postproxy.dev/api/webhooks" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com/webhooks/postproxy",
       "events": ["platform_post.published", "comment.created", "message.received"]
     }'
```

Events relevant to Instagram:

| Event | When |
|-------|------|
| `post.processed` | A post is ready to publish |
| `platform_post.published` | A post was published to the platform |
| `platform_post.failed` | A post failed to publish (retries exhausted) |
| `platform_post.failed_waiting_for_retry` | A publish attempt failed; will retry |
| `platform_post.insights` | New analytics snapshot |
| `comment.created` | A comment was synced on an Instagram post |
| `message.received` / `.sent` | Inbound / outbound DM |
| `message.delivered` / `.read` | Delivery and read receipts |
| `message.deleted` | A message was unsent (Instagram is the only network that reports this) |
| `message.edited` | An inbound message was edited |
| `reaction.received` | A reaction was added or removed on a message |
| `referral.received` | A participant entered a DM thread via an ig.me link |
| `profile.connected` / `.disconnected` | Connection state changed |
| `profile.stats` | New profile stats snapshot |
| `media.failed` | A media attachment failed to process |

## What you can't do

Instagram's API doesn't surface these features, so Postproxy can't offer them either:

- Tagging products from a shop in a post.
- Adding location tags to Stories.
- Attaching interactive Story stickers — polls, questions, link stickers, or countdowns.
- Adding music from Instagram's audio library to a Reel on a profile connected with **Instagram login** — the library is available to Facebook-login profiles, see [Reel audio](#reel-audio).
- Publishing to a personal account (only Business or Creator accounts work).
- Starting a live broadcast.
- Applying Instagram's built-in photo or video filters.
- Building Guides.

## Notes

- Only **professional** (Business or Creator) Instagram accounts can publish via the API.
- Carousels may combine images and a video; Reels and Stories are single-media.
- Trial Reels (`trial_strategy`) publish to non-followers first; use `MANUAL` or `SS_PERFORMANCE`.

---

# threads

:::tip[Building with an AI assistant?]
This page is the complete Threads API reference for Postproxy — every format, parameter, media limit, and example in one place. Click **Copy page** at the top to copy it as Markdown, then paste it into ChatGPT, Claude, Cursor, or any LLM and it'll have everything it needs to write your integration.
:::

Postproxy publishes feed posts and multi-post chains to Threads, and lets you read and reply to comments. Threads has no direct-message API.

Every request below uses the base URL `https://api.postproxy.dev` and an `Authorization: Bearer YOUR_API_KEY` header. Replace `YOUR_API_KEY` and the example IDs with your own.

## Profiles and profile groups

Every post targets one or more **profiles**. A profile is one connected account — for Threads, a Threads account. Reference one in a request by its `id` (the `prof_abc123` in the examples below) or by the platform name `"threads"`, which selects the group's Threads profile (a group holds at most one profile per platform). List what's connected with [`GET /api/profiles`](/reference/profiles/).

Profiles live in **profile groups** — containers that organize the accounts for one brand, client, or project. List groups with [`GET /api/profile_groups`](/reference/profile-groups/), and connect a new Threads profile with the [Initialize Connection](/reference/profile-groups/#initialize-connection) endpoint.

<details>
<summary>Example: get profiles and profile groups</summary>

List the profiles you can post to — `GET /api/profiles`:

```bash
curl -X GET "https://api.postproxy.dev/api/profiles" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    {
      "id": "prof_abc123",
      "name": "@mycompany",
      "platform": "threads",
      "status": "active",
      "profile_group_id": "grp_xyz789",
      "expires_at": null,
      "post_count": 38,
      "avatar_url": "https://cdn.postproxy.dev/uploads/avatar_prof_abc123.jpg"
    }
  ]
}
```

List your profile groups — `GET /api/profile_groups`:

```bash
curl -X GET "https://api.postproxy.dev/api/profile_groups" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    { "id": "grp_xyz789", "name": "Main Brand", "profiles_count": 5 },
    { "id": "grp_def456", "name": "Client Project", "profiles_count": 3 }
  ]
}
```

</details>

## At a glance

| | |
|---|---|
| **Platform ID** | `threads` |
| **Formats** | `post` (default) |
| **Character limit** | 500 |
| **Media** | Optional |
| **Comments** | List, reply, hide/unhide |
| **Direct messages** | No |
| **Post chains** | Yes |

## Publishing

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt_text` | string or array | No | Alt text for images, including carousel images — see [Alt text](/reference/posts/#alt-text) |
| `topic_tag` | string | No | Topic tag the post is filed under on Threads, shown above the post and searchable. One tag per post, without the leading `#` (a leading `#` is stripped), up to 50 characters; periods and ampersands are rejected with a `422`. Works on text, media and carousel posts, and on thread replies. Set at publish time and can't be changed afterwards |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Image | 8 MB | jpg, png, gif, webp | 20 | — |
| Video | 1 GB | mp4, mov | 1 | up to 5 min |

- Text-only posts are allowed; media is optional.
- Images and a video can be mixed in a carousel (up to 20 items).
- Minimum image dimensions: 200×200 px.

```bash
# Simple post with an image
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Exciting announcement coming soon! Stay tuned." },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/image.jpg"],
       "platforms": { "threads": { "topic_tag": "photography" } }
     }'
```

### Post chains

Threads supports native thread conversations. Pass a `thread` array of follow-up posts; each child can carry its own `media`.

```bash
# A 3-post thread
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "1/ Here is a thread about our launch" },
       "profiles": ["prof_abc123"],
       "thread": [
         { "body": "2/ First, we built the foundation...", "media": ["https://example.com/shot.jpg"] },
         { "body": "3/ Check it out at example.com" }
       ]
     }'
```

## Comments

Threads comments are managed through the Comments API. All comment writes are asynchronous and need the `profile_id` query parameter.

| Action | Supported |
|--------|-----------|
| List / read | Yes |
| Reply | Yes |
| Hide / unhide | Yes |
| Delete | No |
| Like / unlike | No |

- Comment `attachments` can carry `IMAGE`, `VIDEO`, `AUDIO`, and `GIF` media on both top-level comments and replies.
- A `comment.created` webhook fires when a new comment is synced.

```bash
# List comments on a post
curl "https://api.postproxy.dev/api/posts/post_abc123/comments?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```bash
# Reply to a comment
curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "body": "Glad you liked it!", "parent_id": "cmt_abc123" }'
```

```bash
# Hide / unhide a comment
curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments/cmt_abc123/hide?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"

curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments/cmt_abc123/unhide?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Direct messages

Not supported — Threads has no DM API. Calls to the Direct Messages API for a Threads profile return `422`.

## Stats

Postproxy records periodic stat snapshots you can pull as a timeseries; field names pass through from Threads unchanged.

### Profile stats

Account-level metrics, refreshed roughly every 23 hours via the [Profile stats endpoint](/reference/profiles/#profile-stats) (`GET /api/profiles/:id/stats`).

**Fields:** `followers_count`, `views`, `likes`, `replies`, `reposts`, `quotes`

```bash
# Fetch the profile stats timeseries
curl "https://api.postproxy.dev/api/profiles/prof_abc123/stats" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

### Post stats

Per-post engagement, captured after publish via the [Post stats endpoint](/reference/posts/#post-stats) (`GET /api/posts/stats`).

**Fields:** `impressions`, `likes`, `replies`, `reposts`, `quotes`, `shares`

```bash
# Fetch post stats
curl "https://api.postproxy.dev/api/posts/stats?post_ids=post_abc123&profiles=threads" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Webhooks

Subscribe with the Webhooks API:

```bash
curl -X POST "https://api.postproxy.dev/api/webhooks" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com/webhooks/postproxy",
       "events": ["platform_post.published", "comment.created"]
     }'
```

Events relevant to Threads:

| Event | When |
|-------|------|
| `post.processed` | A post is ready to publish |
| `platform_post.published` | A post was published to the platform |
| `platform_post.failed` | A post failed to publish (retries exhausted) |
| `platform_post.failed_waiting_for_retry` | A publish attempt failed; will retry |
| `platform_post.insights` | New analytics snapshot |
| `comment.created` | A comment was synced on a Threads post |
| `profile.connected` / `.disconnected` | Connection state changed |
| `profile.stats` | New profile stats snapshot |
| `media.failed` | A media attachment failed to process |

## What you can't do

Threads' API doesn't expose these features, so they aren't available through Postproxy:

- Edit a post once it's published.
- Create quote posts.
- Add polls to a post.
- Search for and insert GIFs from Threads' library.
- See the list of accounts that liked or reposted a post.
- Open a new top-level comment on a post — comments can only be replied to.
- Like or unlike comments.

## Notes

- The 500-character limit is strict — longer copy should be split across a post chain.
- Threads comments cannot be deleted or liked through the API.

---

# twitter

:::tip[Building with an AI assistant?]
This page is the complete X (Twitter) API reference for Postproxy — every format, parameter, media limit, and example in one place. Click **Copy page** at the top to copy it as Markdown, then paste it into ChatGPT, Claude, Cursor, or any LLM and it'll have everything it needs to write your integration.
:::

Postproxy publishes tweets, native polls, and tweet chains (threads) to X. X is a [bring-your-own-keys](/guides/twitter-byo-keys/) integration — you connect your own developer app. There is no comment or direct-message API.

Every request below uses the base URL `https://api.postproxy.dev` and an `Authorization: Bearer YOUR_API_KEY` header. Replace `YOUR_API_KEY` and the example IDs with your own.

## Profiles and profile groups

Every post targets one or more **profiles**. A profile is one connected account — for X (Twitter), an X account. Reference one in a request by its `id` (the `prof_abc123` in the examples below) or by the platform name `"twitter"`, which selects the group's X (Twitter) profile (a group holds at most one profile per platform). List what's connected with [`GET /api/profiles`](/reference/profiles/).

Profiles live in **profile groups** — containers that organize the accounts for one brand, client, or project. List groups with [`GET /api/profile_groups`](/reference/profile-groups/), and connect a new X (Twitter) profile with the [Initialize Connection](/reference/profile-groups/#initialize-connection) endpoint.

<details>
<summary>Example: get profiles and profile groups</summary>

List the profiles you can post to — `GET /api/profiles`:

```bash
curl -X GET "https://api.postproxy.dev/api/profiles" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    {
      "id": "prof_abc123",
      "name": "@mycompany",
      "platform": "twitter",
      "status": "active",
      "profile_group_id": "grp_xyz789",
      "expires_at": null,
      "post_count": 127,
      "avatar_url": "https://cdn.postproxy.dev/uploads/avatar_prof_abc123.jpg"
    }
  ]
}
```

List your profile groups — `GET /api/profile_groups`:

```bash
curl -X GET "https://api.postproxy.dev/api/profile_groups" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    { "id": "grp_xyz789", "name": "Main Brand", "profiles_count": 5 },
    { "id": "grp_def456", "name": "Client Project", "profiles_count": 3 }
  ]
}
```

</details>

## At a glance

| | |
|---|---|
| **Platform ID** | `twitter` |
| **Formats** | `post` (default), `poll` |
| **Character limit** | 280 (free) / 25,000 (paid); polls always 280 |
| **Media** | Optional (`post`); not allowed (`poll`) |
| **Comments** | No |
| **Direct messages** | No |
| **Post chains** | Yes |

## Publishing

### Formats

| Format | Description |
|--------|-------------|
| `post` | Tweet (default). Content type is inferred from the attached media |
| `poll` | Tweet with a native poll |

### Tweet (`post`)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt_text` | string or array | No | Alt text for images (max 1,000 characters) — see [Alt text](/reference/posts/#alt-text) |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Image | 5 MB | jpg, png, webp, gif | 4 | — |
| Video | 512 MB | mp4, mov | 1 | 1 s – 140 s |

- Text-only tweets are allowed; media is optional.
- Images and video cannot be mixed.
- Minimum image dimensions 4×4 px; minimum video dimensions 32×32 px.

```bash
# Tweet with an image
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Just shipped a new feature! Check it out 🎉" },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/image.jpg"],
       "platforms": { "twitter": {} }
     }'
```

### Poll (`poll`)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | `"poll"` |
| `poll_options` | array of strings | Yes | 2–4 choices, max 25 characters each |
| `poll_duration_minutes` | integer | Yes | 5 to 10,080 (7 days) |

Polls are capped at 280 characters and **cannot** include media or be part of a thread.

```bash
# Poll
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Which framework do you prefer?" },
       "profiles": ["prof_abc123"],
       "platforms": {
         "twitter": {
           "format": "poll",
           "poll_options": ["Rails", "Django", "Laravel", "Other"],
           "poll_duration_minutes": 1440
         }
       }
     }'
```

### Post chains (threads)

X supports threads for the `post` format. Pass a `thread` array of follow-up tweets; each child can carry its own `media`. Polls cannot be threaded.

```bash
# A tweet thread
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "1/ A short thread on what we learned 🧵" },
       "profiles": ["prof_abc123"],
       "thread": [
         { "body": "2/ Ship small, ship often." },
         { "body": "3/ Talk to users every week.", "media": ["https://example.com/chart.png"] }
       ]
     }'
```

## Comments

Not supported through the API.

## Direct messages

Not supported.

## Stats

Postproxy records periodic stat snapshots you can pull as a timeseries; field names pass through from X unchanged.

### Profile stats

Account-level metrics, refreshed roughly every 23 hours via the [Profile stats endpoint](/reference/profiles/#profile-stats) (`GET /api/profiles/:id/stats`).

**Fields:** `followers_count`, `following_count`, `tweet_count`, `listed_count`, `like_count`

```bash
# Fetch the profile stats timeseries
curl "https://api.postproxy.dev/api/profiles/prof_abc123/stats" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

### Post stats

Per-tweet engagement, captured after publish via the [Post stats endpoint](/reference/posts/#post-stats) (`GET /api/posts/stats`).

**Fields:** `impressions`, `likes`, `retweets`, `comments`, `quotes`, `saved`

```bash
# Fetch post stats
curl "https://api.postproxy.dev/api/posts/stats?post_ids=post_abc123&profiles=twitter" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Webhooks

Subscribe with the Webhooks API:

```bash
curl -X POST "https://api.postproxy.dev/api/webhooks" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com/webhooks/postproxy",
       "events": ["platform_post.published", "platform_post.failed", "platform_post.insights"]
     }'
```

Events relevant to X:

| Event | When |
|-------|------|
| `post.processed` | A post is ready to publish |
| `platform_post.published` | A post was published to the platform |
| `platform_post.failed` | A post failed to publish (retries exhausted) |
| `platform_post.failed_waiting_for_retry` | A publish attempt failed; will retry |
| `platform_post.insights` | New analytics snapshot |
| `profile.connected` / `.disconnected` | Connection state changed |
| `profile.stats` | New profile stats snapshot |
| `media.failed` | A media attachment failed to process |

## What you can't do

X's API doesn't expose these features, so they aren't available through Postproxy:

- Reading, posting, hiding, or liking replies and comments — there's no comment API for X.
- Sending or receiving direct messages.
- Posting quote tweets or retweeting existing tweets.
- Mixing images and video on the same tweet, or attaching media to a poll.
- Threading a poll — polls always publish as a single standalone tweet.

## Notes

- The character limit depends on your X account tier: 280 on free, 25,000 on paid. Polls are always capped at 280.
- X requires your own API keys — see the [X bring-your-own-keys guide](/guides/twitter-byo-keys/).
- `poll`, media, and threads are mutually exclusive.

---

# linkedin

:::tip[Building with an AI assistant?]
This page is the complete LinkedIn API reference for Postproxy — every format, parameter, media limit, and example in one place. Click **Copy page** at the top to copy it as Markdown, then paste it into ChatGPT, Claude, Cursor, or any LLM and it'll have everything it needs to write your integration.
:::

Postproxy publishes feed posts and polls to a LinkedIn **personal profile** or a **company page (organization)**, including image, video, and document (PDF/slide) posts.

Every request below uses the base URL `https://api.postproxy.dev` and an `Authorization: Bearer YOUR_API_KEY` header. Replace `YOUR_API_KEY` and the example IDs with your own.

## Profiles and profile groups

Every post targets one or more **profiles**. A profile is one connected account — for LinkedIn, a personal profile or a company page (organization). Reference one in a request by its `id` (the `prof_abc123` in the examples below) or by the platform name `"linkedin"`, which selects the group's LinkedIn profile (a group holds at most one profile per platform). List what's connected with [`GET /api/profiles`](/reference/profiles/).

Profiles live in **profile groups** — containers that organize the accounts for one brand, client, or project. List groups with [`GET /api/profile_groups`](/reference/profile-groups/), and connect a new LinkedIn profile with the [Initialize Connection](/reference/profile-groups/#initialize-connection) endpoint.

<details>
<summary>Example: get profiles and profile groups</summary>

List the profiles you can post to — `GET /api/profiles`:

```bash
curl -X GET "https://api.postproxy.dev/api/profiles" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    {
      "id": "prof_abc123",
      "name": "My Company",
      "platform": "linkedin",
      "status": "active",
      "profile_group_id": "grp_xyz789",
      "expires_at": null,
      "post_count": 53,
      "avatar_url": "https://cdn.postproxy.dev/uploads/avatar_prof_abc123.jpg"
    }
  ]
}
```

List your profile groups — `GET /api/profile_groups`:

```bash
curl -X GET "https://api.postproxy.dev/api/profile_groups" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    { "id": "grp_xyz789", "name": "Main Brand", "profiles_count": 5 },
    { "id": "grp_def456", "name": "Client Project", "profiles_count": 3 }
  ]
}
```

</details>

## At a glance

| | |
|---|---|
| **Platform ID** | `linkedin` |
| **Formats** | `post` (default), `poll` |
| **Character limit** | 3,000 |
| **Media** | Optional |
| **Placements** | Personal profile + organizations — selected with `organization_id` |
| **Reshares** | Yes — pass `reshare_urn` |
| **Polls** | Yes — see [Polls](#polls) |
| **Country targeting** | Organization posts — see [Country targeting](#country-targeting) |
| **Mentions** | Company pages — see [Mentions](#mentions); person lookup coming soon |
| **Comments** | Coming soon |
| **Direct messages** | No |
| **Post chains** | No |

## Publishing

### Formats

| Format | Description |
|--------|-------------|
| `post` | Feed post (default) |
| `poll` | Native LinkedIn poll — see [Polls](#polls) |

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `organization_id` | string | No | Post as a company page. Omit to post on the personal profile |
| `reshare_urn` | string | No | Reshare an existing LinkedIn post — see [Resharing](#resharing) |
| `alt_text` | string or array | No | Alt text for images (single and multi-image posts) — see [Alt text](/reference/posts/#alt-text) |
| `document_title` | string | No | Title shown above an attached document (PDF, DOC, DOCX, PPT, PPTX). Defaults to the file name |
| `countries` | array or string | No | Show the post only to members in these countries (organization posts) — see [Country targeting](#country-targeting) |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Image | 8 MB | jpg, png, gif | 20 | — |
| Video | 5 GB | mp4, mov, avi | 1 | up to 15 min |
| Document | 100 MB | pdf, doc, docx, ppt, pptx | 1 | — |

- Text-only posts are allowed; media is optional.
- Images and video cannot be mixed.
- A **document** must be posted on its own — it cannot be combined with images or video. Max 300 pages.
- LinkedIn shows a title above a document. Set it with `document_title`; without it, the title is the file name — the last segment of the media URL, the uploaded file's name, or the base64 `filename`.
- Minimum image dimensions: 552×276 px.

```bash
# Post to the personal profile
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "We are excited to share our latest product update!" },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/image.jpg"],
       "platforms": { "linkedin": {} }
     }'
```

```bash
# Post to a company page
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Hiring! We are growing the engineering team." },
       "profiles": ["prof_abc123"],
       "platforms": { "linkedin": { "organization_id": "12345678" } }
     }'
```

```bash
# Document (PDF carousel) — must be the only attachment
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Our 2026 industry report — free download." },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/report.pdf"],
       "platforms": { "linkedin": { "organization_id": "12345678" } }
     }'
```

### Polls

Set `format` to `poll` to publish a native LinkedIn poll. The post `body` becomes the commentary shown above the poll, `poll_question` is what members vote on, and `poll_options` lists the choices. Voting is single-select and closes after `poll_duration_days`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `organization_id` | string | No | Publish the poll as a company page. Omit to post on the personal profile |
| `poll_question` | string | Yes | 1–140 characters |
| `poll_options` | array of strings | Yes | 2–4 choices, max 30 characters each |
| `poll_duration_days` | integer | No | How long the poll accepts votes: `1`, `3`, `7`, or `14`. Defaults to `7` |
| `countries` | array or string | No | Organization polls only — see [Country targeting](#country-targeting) |

- Polls can't carry media — `media` together with the `poll` format returns a `422`.
- Polls can't be combined with `reshare_urn`, and can't be edited after publishing.
- LinkedIn forbids polls that ask for political opinions, health status, or other sensitive data.
- Available in the composer as a content-type toggle, and via the API.

```bash
# Publish a poll
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "We are picking next quarter'"'"'s stack." },
       "profiles": ["prof_abc123"],
       "platforms": {
         "linkedin": {
           "format": "poll",
           "poll_question": "Which framework do you prefer?",
           "poll_options": ["Rails", "Django", "Laravel", "Other"],
           "poll_duration_days": 7
         }
       }
     }'
```

### Country targeting

Restrict an **organization-page** post (feed post or poll) so only members in the given countries see it in the feed. Pass `countries` as ISO 3166-1 alpha-2 codes — an array or a comma-separated string, up to 25 countries, case-insensitive.

```bash
# Feed post visible only to members in the US, Canada, and the UK
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "North America and UK: our regional pricing just launched." },
       "profiles": ["prof_abc123"],
       "platforms": {
         "linkedin": {
           "organization_id": "12345678",
           "countries": ["US", "CA", "GB"]
         }
       }
     }'
```

- LinkedIn only allows targeting on organization pages — `countries` without `organization_id` returns a `422`.
- LinkedIn requires the targeted audience to exceed **300 of the page's followers**; a smaller audience fails at publish time with LinkedIn's error.
- Targeting is set at publish time and can't be changed afterwards.

<details>
<summary>Supported country codes</summary>

AE, AR, AT, AU, BD, BE, BG, BH, BR, BY, CA, CH, CL, CN, CO, CR, CY, CZ, DE, DK, EE, EG, ES, FI, FR, GB, GE, GH, GR, HK, HR, HU, ID, IE, IL, IN, IS, IT, JO, JP, KE, KR, KW, KZ, LB, LK, LT, LU, LV, MA, MT, MX, MY, NG, NL, NO, NP, NZ, OM, PA, PE, PH, PK, PL, PT, QA, RO, RS, RU, SA, SE, SG, SI, SK, TH, TN, TR, TW, UA, US, UY, VE, VG, VI, VN, ZA. Any other code returns a `422`.

</details>

### Resharing

Reshare an existing LinkedIn post by passing `reshare_urn` in the LinkedIn platform parameters — on `POST /api/posts`, or `PATCH` it onto a post that hasn't published yet. The post `body` becomes the commentary shown above the reshared post; send an empty body for a plain repost.

`reshare_urn` accepts either form:

| Value | Example |
|-------|---------|
| Post URN | `urn:li:share:7123456789012345678`, `urn:li:ugcPost:…`, `urn:li:activity:…` |
| LinkedIn post URL | `https://www.linkedin.com/feed/update/urn:li:activity:7123456789012345678/` |

- A pasted URL is normalized to its URN, and that normalized value is what `platforms[].params` returns.
- A value that can't be parsed into a URN returns a `422`.
- A reshare **can't carry its own media** — LinkedIn shows the reshared post's media instead — so `media` together with `reshare_urn` returns a `422`.
- Combine `reshare_urn` with `organization_id` to reshare as a company page.
- API only for now — the composer has no field for it yet.

```bash
# Reshare with commentary, on the personal profile
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "This matches what we are seeing too." },
       "profiles": ["prof_abc123"],
       "platforms": {
         "linkedin": { "reshare_urn": "urn:li:share:7123456789012345678" }
       }
     }'
```

```bash
# Plain repost as a company page — empty body, pasted post URL
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "" },
       "profiles": ["prof_abc123"],
       "platforms": {
         "linkedin": {
           "organization_id": "12345678",
           "reshare_urn": "https://www.linkedin.com/feed/update/urn:li:activity:7123456789012345678/"
         }
       }
     }'
```

### Mentions

@-mention a company page by writing `@[Display Name](urn)` into the post body — for example `@[Postproxy](urn:li:organization:110810308)`. Without the URN the mention publishes as plain text: no link, no notification.

Get the URN from [`GET /api/profiles/:id/resolve_mention`](/reference/profiles/#resolve-mention), which turns a company page URL (or just its slug) into the URN plus the page's display name. Company, showcase, and school pages all resolve — the page doesn't have to be one you administer.

```bash
# 1. Resolve the page
curl -X GET "https://api.postproxy.dev/api/profiles/prof_abc123/resolve_mention?url=https://www.linkedin.com/company/postproxy" \
     -H "Authorization: Bearer YOUR_API_KEY"
# → { "urn": "urn:li:organization:110810308", "name": "Postproxy", ... }

# 2. Mention it in the post body
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Publishing this via @[Postproxy](urn:li:organization:110810308) — one API for every network." },
       "profiles": ["prof_abc123"]
     }'
```

Person mentions can't be resolved yet — person lookup is coming soon.

## Placements

A LinkedIn profile can publish to the **personal profile** and to any **organizations** the account administers. List them with the placements endpoint:

- The personal profile is returned with `id: null`.
- Each organization's `id` is the value you pass as `organization_id`.

```bash
# List placements (personal profile + organizations)
curl "https://api.postproxy.dev/api/profiles/prof_abc123/placements" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

Omit `organization_id` to publish on the personal profile.

## Comments

**Coming soon.** Comment list, reply, hide, and delete support for LinkedIn is in progress. When live, comments will be managed through the Comments API.

## Direct messages

Not supported.

## Stats

Postproxy records periodic stat snapshots you can pull as a timeseries; field names pass through from LinkedIn unchanged.

:::note[Personal profile stats aren't available]
LinkedIn's API does not return analytics for personal (member) profiles — only for company pages. Profile stats and post stats for the personal profile will be empty. This is a LinkedIn limitation, not Postproxy's.
:::

### Profile stats

Follower and page-view metrics for **company pages**, refreshed roughly every 23 hours and scoped per organization — pass the `placement_id`. See the [Profile stats endpoint](/reference/profiles/#profile-stats) (`GET /api/profiles/:id/stats`).

**Fields:** `followerCount`, `shareCount`, `likeCount`, `commentCount`, `clickCount`, `engagement`, `allPageViews`, `overviewPageViews`, `aboutPageViews`, `careersPageViews`, `peoplePageViews`, `insightsPageViews`

```bash
# Fetch the stats timeseries for one organization (placement_id is the organization_id)
curl "https://api.postproxy.dev/api/profiles/prof_abc123/stats?placement_id=12345678" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

### Post stats

Per-post engagement, captured after publish via the [Post stats endpoint](/reference/posts/#post-stats) (`GET /api/posts/stats`). Organization posts only — LinkedIn returns no stats for personal (member) profiles. LinkedIn currently reports impressions only.

**Fields:** `impressions`

```bash
# Fetch post stats
curl "https://api.postproxy.dev/api/posts/stats?post_ids=post_abc123&profiles=linkedin" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Webhooks

Subscribe with the Webhooks API:

```bash
curl -X POST "https://api.postproxy.dev/api/webhooks" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com/webhooks/postproxy",
       "events": ["platform_post.published", "platform_post.insights", "profile.stats"]
     }'
```

Events relevant to LinkedIn:

| Event | When |
|-------|------|
| `post.processed` | A post is ready to publish |
| `platform_post.published` | A post was published to the platform |
| `platform_post.failed` | A post failed to publish (retries exhausted) |
| `platform_post.failed_waiting_for_retry` | A publish attempt failed; will retry |
| `platform_post.insights` | New analytics snapshot |
| `profile.connected` / `.disconnected` | Connection state changed |
| `profile.stats` | New profile stats snapshot — fires once per organization (not for the personal profile) |
| `media.failed` | A media attachment failed to process |

## What you can't do

LinkedIn's API doesn't expose the following, so they aren't available through Postproxy:

- Publishing long-form articles (the `linkedin.com/article/new` editor).
- Sending direct messages or InMail.
- Scheduling or posting events.
- Starting or sending newsletters.
- Reacting to other people's posts.
- Following hashtags.
- Mentioning individual people — [company-page mentions](#mentions) work today; person lookup is coming soon.
- Combining different media types in one post — images can't run alongside video, and a document can't share a post with images or video.
- Retrieving past posts, profile stats, or post insights for a personal profile — LinkedIn's API only exposes history and analytics for organizations.

## Notes

- Choose the audience with `organization_id`: present → company page, absent → personal profile.
- Document posts (PDF, DOCX, PPTX) render as LinkedIn's native multi-page carousel and must be the only attachment.
- A [reshare](#resharing) is a normal post with `reshare_urn` set — the `body` is the commentary, and it can't add media of its own.

---

# youtube

:::tip[Building with an AI assistant?]
This page is the complete YouTube API reference for Postproxy — every format, parameter, media limit, and example in one place. Click **Copy page** at the top to copy it as Markdown, then paste it into ChatGPT, Claude, Cursor, or any LLM and it'll have everything it needs to write your integration.
:::

Postproxy uploads videos to a connected YouTube channel. The post body becomes the video **description**; the video file is required.

Every request below uses the base URL `https://api.postproxy.dev` and an `Authorization: Bearer YOUR_API_KEY` header. Replace `YOUR_API_KEY` and the example IDs with your own.

## Profiles and profile groups

Every post targets one or more **profiles**. A profile is one connected account — for YouTube, a YouTube channel. Reference one in a request by its `id` (the `prof_abc123` in the examples below) or by the platform name `"youtube"`, which selects the group's YouTube profile (a group holds at most one profile per platform). List what's connected with [`GET /api/profiles`](/reference/profiles/).

Profiles live in **profile groups** — containers that organize the accounts for one brand, client, or project. List groups with [`GET /api/profile_groups`](/reference/profile-groups/), and connect a new YouTube profile with the [Initialize Connection](/reference/profile-groups/#initialize-connection) endpoint.

<details>
<summary>Example: get profiles and profile groups</summary>

List the profiles you can post to — `GET /api/profiles`:

```bash
curl -X GET "https://api.postproxy.dev/api/profiles" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    {
      "id": "prof_abc123",
      "name": "My Channel",
      "platform": "youtube",
      "status": "active",
      "profile_group_id": "grp_xyz789",
      "expires_at": null,
      "post_count": 31,
      "avatar_url": "https://cdn.postproxy.dev/uploads/avatar_prof_abc123.jpg"
    }
  ]
}
```

List your profile groups — `GET /api/profile_groups`:

```bash
curl -X GET "https://api.postproxy.dev/api/profile_groups" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    { "id": "grp_xyz789", "name": "Main Brand", "profiles_count": 5 },
    { "id": "grp_def456", "name": "Client Project", "profiles_count": 3 }
  ]
}
```

</details>

## At a glance

| | |
|---|---|
| **Platform ID** | `youtube` |
| **Formats** | `post` (channel video) |
| **Character limit** | 5,000 (description); title 100 |
| **Media** | Required — video only |
| **Playlists** | List, create, update, delete; publish into one with `playlist_id` — see [Playlists](#playlists) |
| **Comments** | List, reply, edit, delete |
| **Direct messages** | No |
| **Post chains** | No |

## Publishing

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `privacy_status` | string | No | `public`, `unlisted`, or `private` (defaults to `public`) |
| `title` | string | No | Video title (max 100 characters) |
| `cover_url` / `cover_file` | string / file | No | Custom thumbnail, 2 MB max (requires a verified YouTube account) |
| `made_for_kids` | boolean | No | Whether the video is made for kids |
| `tags` | array | No | Tags for the video |
| `category_id` | string | No | YouTube category ID (defaults to `"22"`, People & Blogs) |
| `contains_synthetic_media` | boolean | No | Disclose altered or AI-generated content |
| `playlist_id` | string | No | Add the video to this playlist on the channel — see [Playlists](#playlists) |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Video | 256 GB | mp4, mov, avi, wmv, flv, 3gp | 1 | 1 s+ |

- A video is **required**; images are not accepted.
- The post `body` becomes the video description.

### Privacy status

| Value | Visibility |
|-------|------------|
| `public` | Everyone |
| `unlisted` | Anyone with the link |
| `private` | Only you |

```bash
# Public upload with a custom thumbnail
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Check out our latest tutorial on building API integrations!" },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/video.mp4"],
       "platforms": {
         "youtube": {
           "title": "How to Build an API Integration",
           "privacy_status": "public",
           "cover_url": "https://example.com/custom-thumbnail.jpg"
         }
       }
     }'
```

```bash
# Unlisted upload with tags and a category
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Internal demo recording." },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/demo.mp4"],
       "platforms": {
         "youtube": {
           "title": "Q3 Demo",
           "privacy_status": "unlisted",
           "tags": ["demo", "product"],
           "category_id": "28",
           "made_for_kids": false
         }
       }
     }'
```

## Playlists

List, create, update and delete playlists on the connected channel. A playlist's `id` is the `playlist_id` you publish a video into.

Every endpoint is scoped to one connected profile:

```
/api/profiles/:profile_id/youtube/...
```

No extra connection or scope is needed: any YouTube profile connected to Postproxy can use these endpoints. Playlist calls count against the channel's YouTube Data API quota (creating, updating and deleting cost 50 units each).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profiles/:profile_id/youtube/playlists` | List playlists |
| `POST` | `/api/profiles/:profile_id/youtube/create_playlist` | Create a playlist |
| `PATCH` | `/api/profiles/:profile_id/youtube/update_playlist` | Update a playlist |
| `DELETE` | `/api/profiles/:profile_id/youtube/delete_playlist` | Delete a playlist |

### Playlist object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | YouTube playlist ID |
| `title` | string | Playlist title |
| `description` | string | Playlist description |
| `privacy_status` | string | `public`, `unlisted` or `private` |
| `item_count` | integer | Number of videos in the playlist |
| `thumbnail_url` | string \| null | Playlist thumbnail |
| `published_at` | string | When the playlist was created (ISO 8601) |

### List playlists

<span class="method get">GET</span> `/api/profiles/:profile_id/youtube/playlists`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_token` | string | No | `next_page_token` from the previous page |

```bash
curl "https://api.postproxy.dev/api/profiles/prof_abc123/youtube/playlists" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    {
      "id": "PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG",
      "title": "Tutorials",
      "description": "Step-by-step guides",
      "privacy_status": "public",
      "item_count": 12,
      "thumbnail_url": "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
      "published_at": "2026-03-14T09:21:00.000Z"
    }
  ],
  "next_page_token": null
}
```

Up to 50 playlists per page. `next_page_token` is `null` on the last page.

### Create playlist

<span class="method post">POST</span> `/api/profiles/:profile_id/youtube/create_playlist`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Playlist title (max 150 characters) |
| `description` | string | No | Playlist description |
| `privacy_status` | string | No | `public` (default), `unlisted` or `private` |

```bash
curl -X POST "https://api.postproxy.dev/api/profiles/prof_abc123/youtube/create_playlist" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Tutorials",
       "description": "Step-by-step guides",
       "privacy_status": "public"
     }'
```

The response is the new [playlist](#playlist-object).

### Update playlist

<span class="method patch">PATCH</span> `/api/profiles/:profile_id/youtube/update_playlist`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `playlist_id` | string | Yes | Playlist ID from [List playlists](#list-playlists) |
| `title` | string | No | New title |
| `description` | string | No | New description. Pass `""` to clear it |
| `privacy_status` | string | No | `public`, `unlisted` or `private` |

Fields you leave out keep their current value.

```bash
curl -X PATCH "https://api.postproxy.dev/api/profiles/prof_abc123/youtube/update_playlist" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "playlist_id": "PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG",
       "privacy_status": "unlisted"
     }'
```

The response is the updated [playlist](#playlist-object).

### Delete playlist

<span class="method delete">DELETE</span> `/api/profiles/:profile_id/youtube/delete_playlist`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `playlist_id` | string | Yes | Playlist ID from [List playlists](#list-playlists) |

```bash
curl -X DELETE "https://api.postproxy.dev/api/profiles/prof_abc123/youtube/delete_playlist?playlist_id=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "deleted": true,
  "playlist_id": "PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG"
}
```

Deleting a playlist does not delete the videos in it.

### Publish into a playlist

Pass `playlist_id` in the YouTube platform parameters:

```bash
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "A walkthrough of account setup." },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/setup.mp4"],
       "platforms": {
         "youtube": {
           "title": "How to set up your account",
           "playlist_id": "PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG"
         }
       }
     }'
```

The playlist is checked before the video uploads, so an unknown `playlist_id` fails the post without uploading anything. If YouTube rejects adding the uploaded video to the playlist, the video is removed from the channel and the post fails.

### Errors

| Status | Meaning |
|--------|---------|
| `400` | Missing `title` or `playlist_id`, or an unknown `privacy_status` value |
| `403` | The connection lacks permission to manage playlists; reconnect the profile |
| `404` | Profile not found, or the playlist doesn't exist on this channel |
| `422` | Profile is not a YouTube profile, the connection needs re-authentication, or YouTube rejected the request |
| `429` | YouTube quota or rate limit reached; retry after the `Retry-After` header |
| `502` | YouTube could not be reached |

## Comments

Comments on your published YouTube videos, including nested replies, sync into the [Comments API](/reference/comments/). You can list comments, post top-level comments, reply, [edit](/reference/comments/#edit-comment), and delete. Hide/unhide and like/unlike aren't available — the YouTube Data API doesn't offer them.

YouTube profiles connected before comments launched must be reconnected to grant the additional permission comment access requires. Until you reconnect, comment syncing stays off for that profile (posting is unaffected) and turns on automatically once you reconnect.

## Direct messages

Not supported.

## Stats

Postproxy records periodic stat snapshots you can pull as a timeseries; field names pass through from YouTube unchanged.

### Profile stats

Channel-level metrics, refreshed roughly every 23 hours via the [Profile stats endpoint](/reference/profiles/#profile-stats) (`GET /api/profiles/:id/stats`).

**Fields:** `subscriberCount`, `viewCount`, `videoCount`

```bash
# Fetch the profile stats timeseries
curl "https://api.postproxy.dev/api/profiles/prof_abc123/stats" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

### Post stats

Per-video engagement, captured after publish via the [Post stats endpoint](/reference/posts/#post-stats) (`GET /api/posts/stats`).

**Fields:** `impressions`, `likes`, `comments`, `saved`

```bash
# Fetch post stats
curl "https://api.postproxy.dev/api/posts/stats?post_ids=post_abc123&profiles=youtube" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Webhooks

Subscribe with the Webhooks API:

```bash
curl -X POST "https://api.postproxy.dev/api/webhooks" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com/webhooks/postproxy",
       "events": ["platform_post.published", "platform_post.failed", "platform_post.insights"]
     }'
```

Events relevant to YouTube:

| Event | When |
|-------|------|
| `post.processed` | A post is ready to publish |
| `platform_post.published` | A post was published to the platform |
| `platform_post.failed` | A post failed to publish (retries exhausted) |
| `platform_post.failed_waiting_for_retry` | A publish attempt failed; will retry |
| `platform_post.insights` | New analytics snapshot |
| `profile.connected` / `.disconnected` | Connection state changed |
| `profile.stats` | New profile stats snapshot |
| `media.failed` | A media attachment failed to process |

## What you can't do

YouTube's API doesn't expose these features, so they aren't available through Postproxy:

- Publish Community posts.
- Start a live stream or schedule a Premiere.
- Add or upload captions and subtitles.
- Attach end screens, cards, or chapters (timestamps written into the description still work).
- Like or dislike videos.
- Change monetization settings.

## Notes

- `privacy_status` is optional and defaults to `public` when omitted.
- A custom thumbnail (`cover_url` / `cover_file`) must be 2 MB or smaller and requires a verified YouTube account.
- Set `contains_synthetic_media: true` to disclose AI-generated or altered content, per YouTube policy.
- YouTube allows roughly 100 uploads per day per Google Cloud project. For what that means when picking an automation setup, see [How to automate YouTube uploads](/blog/automate-youtube-uploads/).

---

# tiktok

:::tip[Building with an AI assistant?]
This page is the complete TikTok API reference for Postproxy — every format, parameter, media limit, and example in one place. Click **Copy page** at the top to copy it as Markdown, then paste it into ChatGPT, Claude, Cursor, or any LLM and it'll have everything it needs to write your integration.
:::

Postproxy publishes single videos and photo posts (up to 35 images) to a connected TikTok account.

Every request below uses the base URL `https://api.postproxy.dev` and an `Authorization: Bearer YOUR_API_KEY` header. Replace `YOUR_API_KEY` and the example IDs with your own.

## Profiles and profile groups

Every post targets one or more **profiles**. A profile is one connected account — for TikTok, a TikTok account. Reference one in a request by its `id` (the `prof_abc123` in the examples below) or by the platform name `"tiktok"`, which selects the group's TikTok profile (a group holds at most one profile per platform). List what's connected with [`GET /api/profiles`](/reference/profiles/).

Profiles live in **profile groups** — containers that organize the accounts for one brand, client, or project. List groups with [`GET /api/profile_groups`](/reference/profile-groups/), and connect a new TikTok profile with the [Initialize Connection](/reference/profile-groups/#initialize-connection) endpoint.

<details>
<summary>Example: get profiles and profile groups</summary>

List the profiles you can post to — `GET /api/profiles`:

```bash
curl -X GET "https://api.postproxy.dev/api/profiles" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    {
      "id": "prof_abc123",
      "name": "@mycompany",
      "platform": "tiktok",
      "status": "active",
      "profile_group_id": "grp_xyz789",
      "expires_at": null,
      "post_count": 47,
      "avatar_url": "https://cdn.postproxy.dev/uploads/avatar_prof_abc123.jpg"
    }
  ]
}
```

List your profile groups — `GET /api/profile_groups`:

```bash
curl -X GET "https://api.postproxy.dev/api/profile_groups" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    { "id": "grp_xyz789", "name": "Main Brand", "profiles_count": 5 },
    { "id": "grp_def456", "name": "Client Project", "profiles_count": 3 }
  ]
}
```

</details>

## Connecting TikTok

TikTok connections — from the app, onboarding, an "Ask colleague" link, or [`POST /api/profile_groups/:id/initialize_connection`](/reference/profile-groups/#initialize-connection) — run through TikTok's Business API. The profile is still `platform: "tiktok"`, so nothing changes in how you address it in a request.

Profiles connected **on or after 2026-09-30** get two things earlier TikTok connections can't have:

- **[Comments](#comments)** — list, reply, delete, hide/unhide, like/unlike, and pin/unpin through the [Comments API](/reference/comments/).
- **[Reach and watch time](#post-stats)** — `reach` on post stats, watch-time metrics in `raw_stats`, and daily `profile_views`.
- **[Custom video covers](#video)** — `cover_url` / `cover_file` on video posts. `thumb_offset` works on every profile.

Profiles connected **before** that date keep working exactly as they are, Reconnect included, but they don't get comments or reach. To move one over, disconnect it and connect TikTok again — it comes back as a new profile, so re-point anything scheduled against the old one.

Accounts that bring their own TikTok app (Integrations → TikTok) keep connecting through that app.

One publishing difference on Business API profiles: TikTok publishes videos publicly, so [`privacy_status`](#privacy-status) applies to photo posts only.

## At a glance

| | |
|---|---|
| **Platform ID** | `tiktok` |
| **Formats** | `video` (default), `image` |
| **Character limit** | 2,200 |
| **Media** | Required |
| **Comments** | List, reply, delete, hide/unhide, like/unlike, pin/unpin — profiles connected on or after 2026-09-30, see [Connecting TikTok](#connecting-tiktok) |
| **Direct messages** | No |
| **Post chains** | No |

## Publishing

:::caution[Check the defaults — comments are disabled by default]
TikTok posts publish with **comments disabled** unless you pass `disable_comment: false`. Duets and Stitches are off by default too. Review the parameter defaults below before publishing so your posts behave the way you expect.
:::

### Formats

| Format | Description |
|--------|-------------|
| `video` | Single video (default) |
| `image` | Photo post, up to 35 images |

### Video

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | `"video"` (default) |
| `upload_as_draft` | boolean | No | Upload to the creator's TikTok inbox instead of publishing. Defaults to `false`. See [Draft uploads](#draft-uploads) |
| `privacy_status` | string | No | See [privacy values](#privacy-status); defaults to `PUBLIC_TO_EVERYONE` |
| `made_with_ai` | boolean | No | Mark content as AI-generated. Defaults to `false` |
| `disable_comment` | boolean | No | Disable comments on the post. Defaults to `true` — pass `false` to allow comments |
| `disable_duet` | boolean | No | Disable Duets. Defaults to `true` — pass `false` to allow Duets |
| `disable_stitch` | boolean | No | Disable Stitches. Defaults to `true` — pass `false` to allow Stitches |
| `brand_content_toggle` | boolean | No | Paid partnership promoting a third-party business. Defaults to `false` |
| `brand_organic_toggle` | boolean | No | Paid partnership promoting your own brand. Defaults to `false` |
| `cover_url` / `cover_file` | string / file | No | Custom cover image for the video. JPG, PNG, or WebP, 360×360 to 1080×1920 px, up to 20 MB. Pass `cover_url` (URL) in JSON or `cover_file` (file) in multipart. Rejected with a `422` on profiles connected before 2026-09-30 — see [Connecting TikTok](#connecting-tiktok) |
| `thumb_offset` | string | No | Frame of the video to use as the cover, in milliseconds. Ignored if `cover_url` is set. Works on every TikTok profile |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Video | 4 GB | mp4, mov, av, webm | 1 | 3 s – 10 min |

- A video is **required**. Minimum dimensions: 720×1280 px.

```bash
# Video post
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Quick tip: Building APIs just got easier! 🚀" },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/video.mp4"],
       "platforms": {
         "tiktok": {
           "privacy_status": "PUBLIC_TO_EVERYONE",
           "disable_comment": false,
           "made_with_ai": false
         }
       }
     }'
```

### Image

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | `"image"` |
| `upload_as_draft` | boolean | No | Upload to the creator's TikTok inbox instead of publishing. Defaults to `false`. See [Draft uploads](#draft-uploads) |
| `privacy_status` | string | No | See [privacy values](#privacy-status); defaults to `PUBLIC_TO_EVERYONE` |
| `photo_cover_index` | integer | No | Index (0-based) of the cover photo. Defaults to `0` (first photo) |
| `auto_add_music` | boolean | No | Add music automatically. Defaults to `false` |
| `disable_comment` | boolean | No | Disable comments on the post. Defaults to `true` — pass `false` to allow comments |
| `brand_content_toggle` | boolean | No | Paid partnership promoting a third-party business. Defaults to `false` |
| `brand_organic_toggle` | boolean | No | Paid partnership promoting your own brand. Defaults to `false` |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Image | 20 MB | jpg, gif | 35 | — |

```bash
# Photo post
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Swipe through our 2026 lookbook 📸" },
       "profiles": ["prof_abc123"],
       "media": [
         "https://example.com/photo1.jpg",
         "https://example.com/photo2.jpg"
       ],
       "platforms": {
         "tiktok": {
           "format": "image",
           "privacy_status": "PUBLIC_TO_EVERYONE",
           "photo_cover_index": 0,
           "auto_add_music": true
         }
       }
     }'
```

### Draft uploads

With `upload_as_draft: true` the media is sent to the creator's TikTok inbox instead of being published. The creator opens the notification in the TikTok app and finishes the post there — which is the only way to add a trending sound from TikTok's music library, since the API can't set one. Works for both video and photo posts.

- **Video drafts ignore every other TikTok parameter**, including the post body. TikTok's upload endpoint accepts the video file and nothing else; caption, privacy, Duet/Stitch and content disclosure are all chosen by the creator in the app.
- **Photo drafts keep every parameter except `privacy_status`**, which the creator picks when publishing.
- The platform entry reaches `status: "published"` once TikTok confirms the media landed in the inbox — read that as *delivered to the creator*, not *live on TikTok*.
- `permalink` stays `null` and no insights are collected: neither exists until the creator publishes the post themselves.

```bash
# Video sent to the creator's drafts
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "" },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/video.mp4"],
       "platforms": {
         "tiktok": {
           "upload_as_draft": true
         }
       }
     }'
```

### Privacy status

| Value | Visibility |
|-------|------------|
| `PUBLIC_TO_EVERYONE` | Everyone |
| `MUTUAL_FOLLOW_FRIENDS` | Mutual followers |
| `FOLLOWER_OF_CREATOR` | Followers only |
| `SELF_ONLY` | Private (only you) |

`privacy_status` is optional — omit it and the post defaults to `PUBLIC_TO_EVERYONE`. That default is only accepted for production-audited TikTok apps; unaudited or sandbox apps must send a non-public value (such as `SELF_ONLY`), or TikTok rejects the post.

On profiles connected on or after 2026-09-30, TikTok publishes videos publicly and `privacy_status` applies to photo posts only — see [Connecting TikTok](#connecting-tiktok).

## Comments

The full [Comments API](/reference/comments/) works on TikTok videos and photo posts — for profiles connected on or after 2026-09-30 (see [Connecting TikTok](#connecting-tiktok)). Earlier connections return `405`.

| Action | Endpoint |
|--------|----------|
| List comments and replies | [`GET /api/posts/:post_id/comments`](/reference/comments/#list-comments) |
| Comment or reply | [`POST /api/posts/:post_id/comments`](/reference/comments/#create-comment) |
| Delete | [`DELETE /api/posts/:post_id/comments/:id`](/reference/comments/#delete-comment) |
| Hide / unhide | [`POST .../hide`](/reference/comments/#hide-comment) / [`/unhide`](/reference/comments/#unhide-comment) |
| Like / unlike | [`POST .../like`](/reference/comments/#like-comment) / [`/unlike`](/reference/comments/#unlike-comment) |
| Pin / unpin | [`POST .../pin`](/reference/comments/#pin-comment) / [`/unpin`](/reference/comments/#unpin-comment) |

```bash
# Reply to a comment on a TikTok video
curl -X POST "https://api.postproxy.dev/api/posts/post_abc123/comments?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "body": "Thanks for watching!", "parent_id": "7412345678901234567" }'
```

- **Pinning:** TikTok keeps one pinned comment per video, so pinning a second comment moves the pin. Pin state is returned as `platform_data.pinned`.
- Editing a comment isn't possible — TikTok has no comment-edit API.
- New comments and replies arrive in real time and fire [`comment.created`](/reference/webhooks/#commentcreated); a comment deleted on TikTok drops out of the API.
- Comment actions are asynchronous, as on every other network — the response is `{ "accepted": true }`.

## Direct messages

Not supported.

## Stats

Postproxy records periodic stat snapshots you can pull as a timeseries; field names pass through from TikTok unchanged.

### Profile stats

Account-level metrics, refreshed roughly every 23 hours via the [Profile stats endpoint](/reference/profiles/#profile-stats) (`GET /api/profiles/:id/stats`).

**Fields:** `follower_count`, `following_count`, `likes_count`, `video_count`

```bash
# Fetch the profile stats timeseries
curl "https://api.postproxy.dev/api/profiles/prof_abc123/stats" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

### Post stats

Per-post engagement, captured after publish via the [Post stats endpoint](/reference/posts/#post-stats) (`GET /api/posts/stats`). Requires the post to have a public ID.

**Fields:** `impressions`, `likes`, `comments`, `shares`, plus `reach` — the number of unique accounts that saw the video — on profiles connected on or after 2026-09-30.

On those profiles `raw_stats` also carries `video_duration`, `average_time_watched`, `total_time_watched`, and `full_video_watched_rate`, and [`GET /api/profiles/:id/daily_stats`](/reference/profiles/#daily-stats) reports daily `profile_views` under `platform_stats`.

```bash
# Fetch post stats
curl "https://api.postproxy.dev/api/posts/stats?post_ids=post_abc123&profiles=tiktok" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Webhooks

Subscribe with the Webhooks API:

```bash
curl -X POST "https://api.postproxy.dev/api/webhooks" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com/webhooks/postproxy",
       "events": ["platform_post.published", "platform_post.failed", "platform_post.insights"]
     }'
```

Events relevant to TikTok:

| Event | When |
|-------|------|
| `post.processed` | A post is ready to publish |
| `platform_post.published` | A post was published to the platform |
| `platform_post.failed` | A post failed to publish (retries exhausted) |
| `platform_post.failed_waiting_for_retry` | A publish attempt failed; will retry |
| `platform_post.insights` | New analytics snapshot |
| `comment.created` | A new comment or reply arrived on a TikTok post |
| `profile.connected` / `.disconnected` | Connection state changed |
| `profile.stats` | New profile stats snapshot |
| `media.failed` | A media attachment failed to process |

## What you can't do

TikTok's API doesn't expose these features, so they aren't available through Postproxy:

- Edit a post after it's published
- Publish text-only posts — media is always required
- Edit a comment after posting it
- Send or read direct messages
- Go Live
- Create Duets or Stitches
- Apply effects or filters
- Pull from TikTok's sound/music library (except `auto_add_music` on photo carousels, or by sending the post to [drafts](#draft-uploads) for the creator to finish in the app)
- Create playlists
- Read For You Page analytics

## Notes

- `privacy_status` is optional and defaults to `PUBLIC_TO_EVERYONE` — see [Privacy status](#privacy-status) for the audited-app caveat.
- Videos must be at least 720×1280 px.
- Comments, `reach`, and watch-time metrics need a profile connected on or after 2026-09-30 — see [Connecting TikTok](#connecting-tiktok).
- `upload_as_draft: true` delivers to the creator's TikTok inbox rather than publishing — see [Draft uploads](#draft-uploads).
- When a post is a paid partnership, set `brand_content_toggle` (third-party) or `brand_organic_toggle` (own brand) as required by TikTok.

---

# pinterest

:::tip[Building with an AI assistant?]
This page is the complete Pinterest API reference for Postproxy — every format, parameter, media limit, and example in one place. Click **Copy page** at the top to copy it as Markdown, then paste it into ChatGPT, Claude, Cursor, or any LLM and it'll have everything it needs to write your integration.
:::

Postproxy creates image and video **Pins** on a connected Pinterest account. Every Pin requires media and a destination **board**. Boards can also be [created and deleted](#board-management) through the API.

Every request below uses the base URL `https://api.postproxy.dev` and an `Authorization: Bearer YOUR_API_KEY` header. Replace `YOUR_API_KEY` and the example IDs with your own.

## Profiles and profile groups

Every post targets one or more **profiles**. A profile is one connected account — for Pinterest, a Pinterest account (each post also needs a destination board, selected via [placements](#placements)). Reference one in a request by its `id` (the `prof_abc123` in the examples below) or by the platform name `"pinterest"`, which selects the group's Pinterest profile (a group holds at most one profile per platform). List what's connected with [`GET /api/profiles`](/reference/profiles/).

Profiles live in **profile groups** — containers that organize the accounts for one brand, client, or project. List groups with [`GET /api/profile_groups`](/reference/profile-groups/), and connect a new Pinterest profile with the [Initialize Connection](/reference/profile-groups/#initialize-connection) endpoint.

<details>
<summary>Example: get profiles and profile groups</summary>

List the profiles you can post to — `GET /api/profiles`:

```bash
curl -X GET "https://api.postproxy.dev/api/profiles" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    {
      "id": "prof_abc123",
      "name": "My Company",
      "platform": "pinterest",
      "status": "active",
      "profile_group_id": "grp_xyz789",
      "expires_at": null,
      "post_count": 64,
      "avatar_url": "https://cdn.postproxy.dev/uploads/avatar_prof_abc123.jpg"
    }
  ]
}
```

List your profile groups — `GET /api/profile_groups`:

```bash
curl -X GET "https://api.postproxy.dev/api/profile_groups" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    { "id": "grp_xyz789", "name": "Main Brand", "profiles_count": 5 },
    { "id": "grp_def456", "name": "Client Project", "profiles_count": 3 }
  ]
}
```

</details>

## At a glance

| | |
|---|---|
| **Platform ID** | `pinterest` |
| **Formats** | `pin` |
| **Character limit** | 500 (description); title 100 |
| **Media** | Required |
| **Placements** | Boards — selected with `board_id` |
| **Board management** | Create and delete boards — see [Board management](#board-management) |
| **Comments** | No |
| **Direct messages** | No |
| **Post chains** | No |

## Publishing

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `board_id` | string | Yes | Board to pin to — fetch from [placements](#placements) |
| `title` | string | No | Pin title (max 100 characters) |
| `destination_link` | string | No | Destination URL (max 2,048 characters) |
| `cover_url` / `cover_file` | string / file | No | Cover image (video Pins only) |
| `thumb_offset` | integer | No | Thumbnail offset in seconds (video Pins only) |
| `alt_text` | string | No | Alt text for image Pins (truncated to 500 characters) — see [Alt text](/reference/posts/#alt-text) |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Image | 32 MB | jpg, gif, png, webp | 1 | — |
| Video | 2 GB | mp4, mov | 1 | 4 s – 15 min |

- Media is **required**. The post `body` becomes the Pin description.

```bash
# Image Pin with a destination link
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "10 Tips for Better Photography" },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/image.jpg"],
       "platforms": {
         "pinterest": {
           "title": "10 Tips for Better Photography",
           "board_id": "987654321",
           "destination_link": "https://example.com/blog/photography-tips"
         }
       }
     }'
```

```bash
# Video Pin with a cover image
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Watch: editing a photo in 30 seconds" },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/video.mp4"],
       "platforms": {
         "pinterest": {
           "title": "30-Second Edit",
           "board_id": "987654321",
           "cover_url": "https://example.com/cover.jpg",
           "destination_link": "https://example.com/tutorials"
         }
       }
     }'
```

## Placements

A Pinterest profile pins to one of its **boards**. List them with the placements endpoint — each board's `id` is the `board_id` you pass when creating a Pin. `board_id` is always required.

```bash
# List boards (placements)
curl "https://api.postproxy.dev/api/profiles/prof_abc123/placements" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Board management

Create and delete boards on the connected Pinterest account. A new board shows up in [placements](#placements) right away, and its `id` is the `board_id` you publish to.

Every endpoint is scoped to one connected profile:

```
/api/profiles/:profile_id/pinterest/...
```

No extra connection or scope is needed: any Pinterest profile connected to Postproxy can use these endpoints.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/profiles/:profile_id/pinterest/create_board` | Create a board |
| `DELETE` | `/api/profiles/:profile_id/pinterest/delete_board` | Delete a board and every Pin on it |

### Create board

<span class="method post">POST</span> `/api/profiles/:profile_id/pinterest/create_board`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Board name. Must be unique among the account's boards |
| `description` | string | No | Board description |
| `privacy` | string | No | `PUBLIC` (default) or `PROTECTED` |

```bash
curl -X POST "https://api.postproxy.dev/api/profiles/prof_abc123/pinterest/create_board" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Summer Recipes",
       "description": "Light dinners for hot days",
       "privacy": "PUBLIC"
     }'
```

The response is the new placement, in the same shape as [List placements](/reference/profiles/#list-placements):

```json
{
  "id": "1022106146616799123",
  "name": "Summer Recipes",
  "avatar_url": null,
  "metadata": {}
}
```

### Delete board

<span class="method delete">DELETE</span> `/api/profiles/:profile_id/pinterest/delete_board`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `board_id` | string | Yes | Placement ID from [placements](#placements) |

```bash
curl -X DELETE "https://api.postproxy.dev/api/profiles/prof_abc123/pinterest/delete_board?board_id=1022106146616799123" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "deleted": true,
  "board_id": "1022106146616799123"
}
```

:::caution
Deleting a board also deletes every Pin on it, on Pinterest. This cannot be undone. The board is removed from the profile's placements.
:::

### Errors

| Status | Meaning |
|--------|---------|
| `400` | Missing `name` or `board_id`, or an unknown `privacy` value |
| `403` | The connection lacks permission to manage boards |
| `404` | Profile not found, or `board_id` isn't a placement of this profile |
| `422` | Profile is not a Pinterest profile, the connection needs re-authentication, or Pinterest rejected the request (e.g. duplicate board name) |
| `429` | Pinterest is rate-limiting; retry after the `Retry-After` header |
| `502` | Pinterest could not be reached |

## Comments

Not supported through the API.

## Direct messages

Not supported.

## Stats

Postproxy records periodic stat snapshots you can pull as a timeseries; field names pass through from Pinterest unchanged.

### Profile stats

Account-level metrics, refreshed roughly every 23 hours via the [Profile stats endpoint](/reference/profiles/#profile-stats) (`GET /api/profiles/:id/stats`).

**Fields:** `follower_count`, `following_count`, `pin_count`, `board_count`, `monthly_views`, `analytics_30d` (nested 30-day rollup)

```bash
# Fetch the profile stats timeseries
curl "https://api.postproxy.dev/api/profiles/prof_abc123/stats" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

### Post stats

Per-Pin engagement, captured after publish via the [Post stats endpoint](/reference/posts/#post-stats) (`GET /api/posts/stats`).

**Fields:** `impressions`, `likes`, `comments`, `saved`, `outbound_clicks`

```bash
# Fetch post stats
curl "https://api.postproxy.dev/api/posts/stats?post_ids=post_abc123&profiles=pinterest" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Webhooks

Subscribe with the Webhooks API:

```bash
curl -X POST "https://api.postproxy.dev/api/webhooks" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com/webhooks/postproxy",
       "events": ["platform_post.published", "platform_post.failed", "platform_post.insights"]
     }'
```

Events relevant to Pinterest:

| Event | When |
|-------|------|
| `post.processed` | A post is ready to publish |
| `platform_post.published` | A post was published to the platform |
| `platform_post.failed` | A post failed to publish (retries exhausted) |
| `platform_post.failed_waiting_for_retry` | A publish attempt failed; will retry |
| `platform_post.insights` | New analytics snapshot |
| `profile.connected` / `.disconnected` | Connection state changed |
| `profile.stats` | New profile stats snapshot |
| `media.failed` | A media attachment failed to process |

## What you can't do

Pinterest's API doesn't expose these features, so they aren't available through Postproxy:

- Carousels or multi-image Pins — each Pin carries a single image or video.
- Idea Pins (the multi-page story format).
- Rich Pins, which depend on meta tags published on your own site.
- Shopping catalogs and product feeds.
- Editing a Pin after it's been published.

## Notes

- `board_id` and media are both required on every Pin.
- `cover_url` / `cover_file` and `thumb_offset` apply to video Pins only.
- Add a `destination_link` to drive traffic from the Pin to your site.

---

# bluesky

:::tip[Building with an AI assistant?]
This page is the complete Bluesky API reference for Postproxy — every format, parameter, media limit, and example in one place. Click **Copy page** at the top to copy it as Markdown, then paste it into ChatGPT, Claude, Cursor, or any LLM and it'll have everything it needs to write your integration.
:::

Postproxy publishes feed posts and post chains to Bluesky over the AT Protocol, supports text direct messages through the Bluesky chat service, and syncs replies to your posts as read-only comments.

Every request below uses the base URL `https://api.postproxy.dev` and an `Authorization: Bearer YOUR_API_KEY` header. Replace `YOUR_API_KEY` and the example IDs with your own.

## Profiles and profile groups

Every post targets one or more **profiles**. A profile is one connected account — for Bluesky, a Bluesky account. Reference one in a request by its `id` (the `prof_abc123` in the examples below) or by the platform name `"bluesky"`, which selects the group's Bluesky profile (a group holds at most one profile per platform). List what's connected with [`GET /api/profiles`](/reference/profiles/).

Profiles live in **profile groups** — containers that organize the accounts for one brand, client, or project. List groups with [`GET /api/profile_groups`](/reference/profile-groups/), and connect a new Bluesky profile with the [Initialize Connection](/reference/profile-groups/#initialize-connection) endpoint (Bluesky uses an app-password flow — see [Connect Bluesky](/reference/profile-groups/#connect-bluesky-app-password)).

<details>
<summary>Example: get profiles and profile groups</summary>

List the profiles you can post to — `GET /api/profiles`:

```bash
curl -X GET "https://api.postproxy.dev/api/profiles" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    {
      "id": "prof_abc123",
      "name": "mycompany.bsky.social",
      "platform": "bluesky",
      "status": "active",
      "profile_group_id": "grp_xyz789",
      "expires_at": null,
      "post_count": 72,
      "avatar_url": "https://cdn.postproxy.dev/uploads/avatar_prof_abc123.jpg"
    }
  ]
}
```

List your profile groups — `GET /api/profile_groups`:

```bash
curl -X GET "https://api.postproxy.dev/api/profile_groups" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    { "id": "grp_xyz789", "name": "Main Brand", "profiles_count": 5 },
    { "id": "grp_def456", "name": "Client Project", "profiles_count": 3 }
  ]
}
```

</details>

## At a glance

| | |
|---|---|
| **Platform ID** | `bluesky` |
| **Formats** | `post` (default) |
| **Character limit** | 300 (graphemes) |
| **Media** | Optional |
| **Comments** | Read-only (synced replies) |
| **Direct messages** | Yes — text only |
| **Post chains** | Yes |

## Publishing

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt_text` | string or array | No | Alt text for images and video — see [Alt text](/reference/posts/#alt-text) |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Image | 1 MB | jpg, png, webp, gif | 4 | — |
| Video | 50 MB | mp4, mov | 1 | 1 s – 60 s |

- Text-only posts are allowed; media is optional.
- Images and video cannot be mixed.
- The 1 MB per-image limit is strict — compress images before uploading.

```bash
# Simple post
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Shipping a new feature today 🚀 https://example.com/launch" },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/image.jpg"],
       "platforms": { "bluesky": {} }
     }'
```

### Post chains

Bluesky supports thread conversations. Pass a `thread` array of follow-up posts; each child can carry its own `media`.

```bash
# A 2-post thread
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "1/ Quick thread on what we shipped 🧵" },
       "profiles": ["prof_abc123"],
       "thread": [
         { "body": "2/ Faster sync and a new webhook.", "media": ["https://example.com/shot.jpg"] }
       ]
     }'
```

## Comments

Replies to your Bluesky posts are synced as comments and exposed read-only through the Comments API. Postproxy polls each post's thread — roughly every 10 minutes while the post is fresh, tapering off as it ages — and walks nested replies up to 6 levels deep.

| Action | Supported |
|--------|-----------|
| List / read | Yes |
| Reply | No |
| Delete | No |
| Hide / unhide | No |
| Like / unlike | No |

- Replies to the post itself have `parent_id: null`; nested replies carry their parent comment's ID.
- Comment media comes through on `attachments` — image embeds (multiple per comment), video thumbnails / HLS playlists, and external link-preview cards.
- Ingestion is polled, so no `comment.created` webhook fires for Bluesky — list the comments to pick up new ones.

```bash
# List comments on a post
curl "https://api.postproxy.dev/api/posts/post_abc123/comments?profile_id=prof_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Direct messages

Bluesky DMs go through the AT Protocol chat service and are supported through the Direct Messages API, with some limits relative to the Meta networks.

| Capability | Supported |
|------------|-----------|
| Send / receive text | Yes |
| Attachments | No |
| Reactions | No |
| Edit outbound message | No |
| Delivery / read receipts | No |
| Archive (mute) chat | Yes |
| Inbound delivery | Poller (~5 min) |

- **No webhooks for inbound.** A per-profile poller runs every ~5 minutes; new inbound messages still fire `message.received`, with up to ~5 minutes of latency.
- **No messaging window**, but the recipient must have DMs enabled and allow messages from you, or the send fails with a Bluesky-side error.
- **Archive = mute** — archive / unarchive map to `muteConvo` / `unmuteConvo`.
- Start a chat with the recipient's **DID** as `participant_external_id`.

```bash
# Create or find a chat by DID
curl -X POST "https://api.postproxy.dev/api/profiles/prof_abc123/chats" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "participant_external_id": "did:plc:abcdefghijklmnopqrstuvwx" }'
```

```bash
# Send a text message (Bluesky is text-only)
curl -X POST "https://api.postproxy.dev/api/chats/chat_abc123/messages" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "body": "Thanks for following! Anything we can help with?" }'
```

```bash
# Archive (mute) / unarchive a chat
curl -X POST "https://api.postproxy.dev/api/chats/chat_abc123/archive" \
     -H "Authorization: Bearer YOUR_API_KEY"

curl -X DELETE "https://api.postproxy.dev/api/chats/chat_abc123/archive" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

:::caution
The Bluesky app password used when connecting the profile must have **"Allow access to your direct messages"** enabled, or the chat endpoints return 401 (surfaced as *Bluesky access revoked — please reconnect the profile*).
:::

## Stats

Postproxy records periodic stat snapshots you can pull as a timeseries; field names pass through from Bluesky unchanged.

### Profile stats

Account-level metrics, refreshed roughly every 23 hours via the [Profile stats endpoint](/reference/profiles/#profile-stats) (`GET /api/profiles/:id/stats`).

**Fields:** `followersCount`, `followsCount`, `postsCount`

```bash
# Fetch the profile stats timeseries
curl "https://api.postproxy.dev/api/profiles/prof_abc123/stats" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

### Post stats

Per-post engagement, captured after publish via the [Post stats endpoint](/reference/posts/#post-stats) (`GET /api/posts/stats`).

**Fields:** `likes`, `reposts`, `comments`, `quotes`

## Webhooks

Subscribe with the Webhooks API:

```bash
curl -X POST "https://api.postproxy.dev/api/webhooks" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com/webhooks/postproxy",
       "events": ["platform_post.published", "message.received"]
     }'
```

Events relevant to Bluesky:

| Event | When |
|-------|------|
| `post.processed` | A post is ready to publish |
| `platform_post.published` | A post was published to the platform |
| `platform_post.failed` | A post failed to publish (retries exhausted) |
| `platform_post.failed_waiting_for_retry` | A publish attempt failed; will retry |
| `platform_post.insights` | New analytics snapshot |
| `message.received` | Inbound DM (via the ~5 min poller) |
| `message.sent` | An outbound DM was accepted by the platform |
| `message.failed_waiting_for_retry` | An outbound DM failed; will retry |
| `message.failed` | An outbound DM failed permanently |
| `profile.connected` / `.disconnected` | Connection state changed |
| `profile.stats` | New profile stats snapshot |
| `media.failed` | A media attachment failed to process |

Bluesky does not expose delivery/read receipts, reactions, edits, or deletion events.

## What you can't do

Some capabilities sit outside what the AT Protocol exposes, so they aren't available through Postproxy:

- Publishing or managing custom feeds.
- Building lists or starter packs.
- Attaching content warnings or moderation labels to a post.
- Sending media in DMs — the Bluesky chat service is text-only.
- Getting profile insights.

## Notes

- The character limit is counted in **graphemes** — emoji and combining sequences count as one character.
- Images are capped at 1 MB each; plan to compress.

---

# telegram

:::tip[Building with an AI assistant?]
This page is the complete Telegram API reference for Postproxy — every format, parameter, media limit, and example in one place. Click **Copy page** at the top to copy it as Markdown, then paste it into ChatGPT, Claude, Cursor, or any LLM and it'll have everything it needs to write your integration.
:::

Telegram is a **bring-your-own-bot** integration: each connected profile is one bot (created via [@BotFather](https://t.me/BotFather)) that publishes to any channel where it's an administrator. The same bot also powers two-way direct messages. See the [Telegram BYO bot guide](/guides/telegram-byo-bot/) for setup.

Every request below uses the base URL `https://api.postproxy.dev` and an `Authorization: Bearer YOUR_API_KEY` header. Replace `YOUR_API_KEY` and the example IDs with your own.

## Profiles and profile groups

Every post targets one or more **profiles**. A profile is one connected account — for Telegram, a single bot that publishes to the channels where it's an administrator. Reference one in a request by its `id` (the `prof_abc123` in the examples below) or by the platform name `"telegram"`, which selects the group's Telegram profile (a group holds at most one profile per platform). List what's connected with [`GET /api/profiles`](/reference/profiles/).

Profiles live in **profile groups** — containers that organize the accounts for one brand, client, or project. List groups with [`GET /api/profile_groups`](/reference/profile-groups/), and connect a new bot with the [Initialize Connection](/reference/profile-groups/#initialize-connection) endpoint (Telegram is bring-your-own-bot — see [Connect Telegram](/reference/profile-groups/#connect-telegram-bring-your-own-bot)).

<details>
<summary>Example: get profiles and profile groups</summary>

List the profiles you can post to — `GET /api/profiles`:

```bash
curl -X GET "https://api.postproxy.dev/api/profiles" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    {
      "id": "prof_abc123",
      "name": "My Channel Bot",
      "platform": "telegram",
      "status": "active",
      "profile_group_id": "grp_xyz789",
      "expires_at": null,
      "post_count": 25,
      "avatar_url": "https://cdn.postproxy.dev/uploads/avatar_prof_abc123.jpg"
    }
  ]
}
```

List your profile groups — `GET /api/profile_groups`:

```bash
curl -X GET "https://api.postproxy.dev/api/profile_groups" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    { "id": "grp_xyz789", "name": "Main Brand", "profiles_count": 5 },
    { "id": "grp_def456", "name": "Client Project", "profiles_count": 3 }
  ]
}
```

</details>

## At a glance

| | |
|---|---|
| **Platform ID** | `telegram` |
| **Formats** | `post` (channel post) |
| **Character limit** | 4,096 |
| **Media** | Optional |
| **Placements** | Channels — selected with `chat_id` (required) |
| **Comments** | No |
| **Direct messages** | Yes — text, media, edits, keyboards |
| **Post chains** | No |

## Publishing

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chat_id` | string | Yes | Destination channel/group — fetch from [placements](#placements) |
| `parse_mode` | string | No | `HTML` or `MarkdownV2`. Omit for plain text |
| `disable_link_preview` | boolean | No | Don't render link previews |
| `disable_notification` | boolean | No | Send silently (no notification sound) |

| Media | Max size | Formats | Count | Duration |
|-------|----------|---------|-------|----------|
| Image | 10 MB | jpg, png, webp, gif | 10 | — |
| Video | 50 MB | mp4, mov | 10 | — |
| Document | 50 MB | pdf, doc, docx, zip, mp3, wav | 1 | — |

- Text-only posts are allowed; media is optional.
- Images and video can be mixed in one media group.

```bash
# HTML-formatted channel post with an image, link preview off
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "<b>New release</b> — read the changelog: https://example.com/changelog" },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/image.jpg"],
       "platforms": {
         "telegram": {
           "chat_id": "-1001234567890",
           "parse_mode": "HTML",
           "disable_link_preview": true
         }
       }
     }'
```

## Placements

Each placement is a **channel** the bot has been added to as administrator. List them with the placements endpoint — each placement's `id` is the `chat_id` you pass when creating a post. `chat_id` is always required.

```bash
# List channels (placements) the bot can post to
curl "https://api.postproxy.dev/api/profiles/prof_abc123/placements" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

The list is empty until the bot is added as a channel admin — Telegram pushes a `my_chat_member` event for each one, which Postproxy records. Poll the endpoint after connecting until the expected channels appear.

## Comments

Not supported through the API.

## Direct messages

Telegram DMs use the Bot API and offer richer features than the Meta networks in some areas. Supported through the Direct Messages API.

| Capability | Supported |
|------------|-----------|
| Send / receive text | Yes |
| Attachments | Yes — photo, video, document, GIF, audio, voice, sticker |
| Edit outbound message | Yes |
| Reply threading | Yes — `reply_to_external_id` |
| Inline / reply keyboards | Yes — `reply_markup` |
| Meta quick replies / buttons | No — `reply_markup` is the equivalent |
| Reactions | No |
| Private reply to a comment | No |
| Delivery / read receipts | No |
| Inbound delivery | Webhook |

- **Bot must be DM'd first.** A bot can only message a user after that user has messaged it at least once (typically via `/start`); otherwise the send returns `422`.
- **No messaging window** — once a user has DM'd the bot, it can reply at any time.
- **Callback queries** from inline-button taps arrive as inbound messages with [`tapped_action`](/reference/direct-messages/#receiving-taps) set to `{ "kind": "callback_query", "payload": "<callback_data>" }`; subscribe to `message.received` to react.
- **Keyboards are Telegram's own.** [`quick_replies` / `buttons` / `card`](/reference/direct-messages/#quick-replies-and-buttons) are Facebook and Instagram parameters and return `422` on a Telegram chat — use `reply_markup` instead.

```bash
# Create or find a chat by the user's Telegram ID
curl -X POST "https://api.postproxy.dev/api/profiles/prof_abc123/chats" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "participant_external_id": "8000000000" }'
```

```bash
# Send a text message with an inline keyboard
curl -X POST "https://api.postproxy.dev/api/chats/chat_abc123/messages" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "body": "Pick an option:",
       "reply_markup": {
         "inline_keyboard": [[
           { "text": "Plans", "callback_data": "plans" },
           { "text": "Docs", "url": "https://postproxy.dev" }
         ]]
       }
     }'
```

```bash
# Send a single media attachment
curl -X POST "https://api.postproxy.dev/api/chats/chat_abc123/messages" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "media": ["https://example.com/invoice.pdf"] }'
```

```bash
# Edit a previously sent message (Telegram only)
curl -X PATCH "https://api.postproxy.dev/api/messages/msg_abc123" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "body": "Updated: the sale ends tonight!" }'
```

## Stats

Postproxy records periodic stat snapshots you can pull as a timeseries; field names pass through from Telegram unchanged.

### Profile stats

Channel-level metrics, refreshed roughly every 23 hours and scoped per channel — pass the channel's `placement_id`. See the [Profile stats endpoint](/reference/profiles/#profile-stats) (`GET /api/profiles/:id/stats`).

**Fields:** `followers_count`, `channel_title`, `channel_username`

```bash
# Fetch the stats timeseries for one channel (placement_id is the chat_id)
curl "https://api.postproxy.dev/api/profiles/prof_abc123/stats?placement_id=-1001234567890" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

### Post stats

Telegram does not report per-post stats.

## Webhooks

Subscribe with the Webhooks API:

```bash
curl -X POST "https://api.postproxy.dev/api/webhooks" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com/webhooks/postproxy",
       "events": ["platform_post.published", "message.received", "message.edited"]
     }'
```

Events relevant to Telegram:

| Event | When |
|-------|------|
| `post.processed` | A post is ready to publish |
| `platform_post.published` | A post was published to the platform |
| `platform_post.failed` | A post failed to publish (retries exhausted) |
| `platform_post.failed_waiting_for_retry` | A publish attempt failed; will retry |
| `platform_post.insights` | New analytics snapshot |
| `message.received` / `.sent` | Inbound / outbound DM |
| `message.edited` | A message was edited (inbound, or outbound via the API) |
| `message.failed_waiting_for_retry` | An outbound DM failed; will retry |
| `message.failed` | An outbound DM failed permanently |
| `profile.connected` / `.disconnected` | Connection state changed |
| `profile.stats` | New profile stats snapshot — fires once per channel placement |
| `media.failed` | A media attachment failed to process |

Telegram does not expose delivery/read receipts, deletion events, or reactions.

## What you can't do

Telegram's Bot API doesn't expose these features, so they aren't available through Postproxy:

- Pinning a post or message in a channel.
- Posting polls or quizzes.
- Per-post engagement metrics.

## Notes

- Create the bot with [@BotFather](https://t.me/BotFather) and add it as an administrator to each channel — see the [Telegram BYO bot guide](/guides/telegram-byo-bot/).
- `chat_id` is required on every post; one bot can publish to many channels.
- Use `parse_mode` (`HTML` / `MarkdownV2`) for rich formatting.

---

# google-business

:::tip[Building with an AI assistant?]
This page is the complete Google Business API reference for Postproxy — every format, parameter, media limit, and example in one place. Click **Copy page** at the top to copy it as Markdown, then paste it into ChatGPT, Claude, Cursor, or any LLM and it'll have everything it needs to write your integration.
:::

Postproxy publishes local updates to a Google **Business Profile location** — standard posts, events, offers, and standalone gallery photos — and manages the [Business Profile itself](#business-profile-management): opening hours, attributes, services, food menus, place action links, and the photo gallery. Every request targets a specific location via `location_id`. Customer **reviews** are read and replied to through the Profile Comments API, and [location analytics](#stats) flow through profile stats.

Every request below uses the base URL `https://api.postproxy.dev` and an `Authorization: Bearer YOUR_API_KEY` header. Replace `YOUR_API_KEY` and the example IDs with your own.

## Profiles and profile groups

Every post targets one or more **profiles**. A profile is one connected account — for Google Business, a connected Business Profile account that publishes to its locations (each post picks a location via [placements](#placements)). Reference one in a request by its `id` (the `prof_abc123` in the examples below) or by the platform name `"google_business"`, which selects the group's Google Business profile (a group holds at most one profile per platform). List what's connected with [`GET /api/profiles`](/reference/profiles/).

Profiles live in **profile groups** — containers that organize the accounts for one brand, client, or project. List groups with [`GET /api/profile_groups`](/reference/profile-groups/), and connect a new Google Business profile with the [Initialize Connection](/reference/profile-groups/#initialize-connection) endpoint.

<details>
<summary>Example: get profiles and profile groups</summary>

List the profiles you can post to — `GET /api/profiles`:

```bash
curl -X GET "https://api.postproxy.dev/api/profiles" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    {
      "id": "prof_abc123",
      "name": "My Business",
      "platform": "google_business",
      "status": "active",
      "profile_group_id": "grp_xyz789",
      "expires_at": null,
      "post_count": 19,
      "avatar_url": "https://cdn.postproxy.dev/uploads/avatar_prof_abc123.jpg"
    }
  ]
}
```

List your profile groups — `GET /api/profile_groups`:

```bash
curl -X GET "https://api.postproxy.dev/api/profile_groups" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "data": [
    { "id": "grp_xyz789", "name": "Main Brand", "profiles_count": 5 },
    { "id": "grp_def456", "name": "Client Project", "profiles_count": 3 }
  ]
}
```

</details>

## At a glance

| | |
|---|---|
| **Platform ID** | `google_business` |
| **Formats** | `standard` (default), `event`, `offer`, `photo` |
| **Character limit** | 1,500 (Photo has no body) |
| **Media** | Optional (local posts); required (Photo). No video |
| **Placements** | Locations — `location_id` (required) |
| **Comments** | Reviews via [Profile Comments](/reference/profile-comments/) |
| **Profile management** | Hours, attributes, services, food menus, action links, profile media — see [Business Profile management](#business-profile-management) |
| **Direct messages** | No |
| **Post chains** | No |

## Publishing

### Formats

| Format | Description |
|--------|-------------|
| `standard` | Plain local post (default) |
| `event` | Event with a title and date range |
| `offer` | Promotion with a validity window and optional coupon |
| `photo` | Standalone photo uploaded to the location's gallery (no text, no CTA) |

### Shared parameters (`standard`, `event`, `offer`)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | `standard` (default), `event`, `offer`, or `photo` |
| `location_id` | string | Yes | Full location resource path (e.g. `accounts/123/locations/456`) |
| `language_code` | string | No | BCP 47 code (e.g. `en`, `de`). Defaults to `en`. Metadata only |
| `cta_action_type` | string | No | `LEARN_MORE`, `BOOK`, `ORDER`, `SHOP`, `SIGN_UP`, or `CALL` |
| `cta_url` | string | Conditional | HTTPS URL the CTA button opens. Required for every CTA except `CALL` |

### `event` — additional parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_title` | string | Yes | Event title shown on the card |
| `event_start_date` | string | Yes | `YYYY-MM-DD` |
| `event_end_date` | string | Yes | `YYYY-MM-DD` |
| `event_start_time` | string | No | `HH:MM` (24-hour) |
| `event_end_time` | string | No | `HH:MM` (24-hour) |

### `offer` — additional parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_start_date` | string | Yes | `YYYY-MM-DD` — start of validity |
| `event_end_date` | string | Yes | `YYYY-MM-DD` — end of validity |
| `event_start_time` / `event_end_time` | string | No | `HH:MM` (24-hour) |
| `event_title` | string | No | Offer headline (defaults to "Special Offer") |
| `offer_coupon_code` | string | No | Promo code shown with the offer |
| `offer_redeem_url` | string | No | URL where the offer can be redeemed |
| `offer_terms` | string | No | Terms and conditions |

### `photo` — parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Full location resource path |

`photo` uploads a single image to the location's gallery. The post body is ignored, and CTA / language parameters do not apply.

### Media

| Format | Image max | Formats | Count | Min dimensions |
|--------|-----------|---------|-------|----------------|
| `standard` / `event` / `offer` | 5 MB | jpg, png | 1 (optional) | 400×300 (recommended 1200×900, 4:3) |
| `photo` | 5 MB | jpg, png | 1 (required) | 250×250 |

- Local-post formats accept text-only posts; `photo` requires an image and ignores body text.
- **Video is not supported** by Google Business local posts or media.

```bash
# standard post with a CTA
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "We are now open on Sundays, 10am–4pm — come visit!" },
       "profiles": ["prof_abc123"],
       "platforms": {
         "google_business": {
           "format": "standard",
           "location_id": "accounts/123456789/locations/987654321",
           "cta_action_type": "LEARN_MORE",
           "cta_url": "https://acme.example.com/hours"
         }
       }
     }'
```

```bash
# event
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "Live music, free coffee, prizes." },
       "profiles": ["prof_abc123"],
       "platforms": {
         "google_business": {
           "format": "event",
           "location_id": "accounts/123456789/locations/987654321",
           "event_title": "5-Year Anniversary",
           "event_start_date": "2026-06-15",
           "event_end_date": "2026-06-15"
         }
       }
     }'
```

```bash
# offer with a coupon
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": { "body": "20% off all whole-bean coffee through the end of the month." },
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/offer.jpg"],
       "platforms": {
         "google_business": {
           "format": "offer",
           "location_id": "accounts/123456789/locations/987654321",
           "event_start_date": "2026-06-01",
           "event_end_date": "2026-06-30",
           "offer_coupon_code": "BEANS20",
           "cta_action_type": "SHOP",
           "cta_url": "https://example.com/shop"
         }
       }
     }'
```

```bash
# photo (uploads to the location gallery; body is ignored)
curl -X POST "https://api.postproxy.dev/api/posts" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "post": {},
       "profiles": ["prof_abc123"],
       "media": ["https://example.com/storefront.jpg"],
       "platforms": {
         "google_business": {
           "format": "photo",
           "location_id": "accounts/123456789/locations/987654321"
         }
       }
     }'
```

## Placements

A Google Business profile may manage multiple Google accounts and any number of **locations**. List them with the placements endpoint — each placement's `id` is the full resource path (e.g. `accounts/123456789/locations/987654321`) you pass as `location_id`. It is always required.

```bash
# List locations (placements)
curl "https://api.postproxy.dev/api/profiles/prof_abc123/placements" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

Each placement carries a `metadata.place_id` — the location's [Google Maps Place ID](https://developers.google.com/maps/documentation/places/web-service/place-id) — so you can cross-reference it against Google Maps / Places or build a reviews permalink without a separate lookup. It's omitted when Google returns no Place ID for the location.

```json
{
  "data": [
    {
      "id": "accounts/123456789/locations/987654321",
      "name": "Acme Coffee — Downtown",
      "avatar_url": null,
      "metadata": {
        "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4"
      }
    }
  ]
}
```

## Reviews

Google Business **reviews** live on a location, not on a post, so they surface through the Profile Comments API — not the post-level Comments API. Reviews sync hourly.

```bash
# List reviews (and your replies) for a profile
curl "https://api.postproxy.dev/api/profiles/prof_abc123/comments" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```bash
# Reply to a review — parent_id is the review's external ID
curl -X POST "https://api.postproxy.dev/api/profiles/prof_abc123/comments" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "body": "Thank you for the kind words — see you next time!",
       "parent_id": "accounts/123456789/locations/987654321/reviews/AbFvOq"
     }'
```

A `profile_comment.created` webhook fires for each new review (across all locations of the account), and `profile_comment.edited` fires when a reviewer changes the text or star rating of a review already synced.

## Business Profile management

Beyond publishing, Postproxy reads and updates the Business Profile data behind each location — opening hours, attributes, services, food menus, action links, and profile photos. This is separate from publishing local posts to that location.

Every endpoint is scoped to one connected profile and one location:

```
/api/profiles/:profile_id/google_business/...
```

No extra connection or scope is needed: any Google Business profile connected to Postproxy can use these endpoints. Step-by-step guides: [hours](/how-to/update-google-business-hours-api/), [attributes](/how-to/update-google-business-attributes-api/), [photos](/how-to/google-business-profile-photos-api/), [menus and services](/how-to/google-business-menu-services-api/), [place action links](/how-to/google-business-place-action-links-api/), and [location insights](/how-to/google-business-profile-insights-api/). The same endpoints are exposed as tools on the [MCP server](/automation/mcp-server/#google-business-profile-management) for [agent-driven management](/how-to/google-business-ai-agent-mcp/). **Every request requires `location_id`** — the location's full Google resource path (`accounts/{accountId}/locations/{locationId}`), exactly the placement `id` from [Placements](#placements). A `location_id` your profile can't reach returns `404`; a missing one returns `400`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profiles/:profile_id/google_business/location` | Get the location resource |
| `PATCH` | `/api/profiles/:profile_id/google_business/update_location` | Update location fields |
| `GET` | `/api/profiles/:profile_id/google_business/available_location_categories` | List valid location categories |
| `PATCH` | `/api/profiles/:profile_id/google_business/update_hours` | Update regular, special, or more hours |
| `GET` | `/api/profiles/:profile_id/google_business/attributes` | Get the location's attributes |
| `GET` | `/api/profiles/:profile_id/google_business/available_attributes` | List attributes the location can set |
| `PATCH` | `/api/profiles/:profile_id/google_business/update_attributes` | Update attributes |
| `GET` | `/api/profiles/:profile_id/google_business/service_list` | Get the service list |
| `PATCH` | `/api/profiles/:profile_id/google_business/update_service_list` | Replace the service list |
| `GET` | `/api/profiles/:profile_id/google_business/food_menus` | Get the food menus |
| `PATCH` | `/api/profiles/:profile_id/google_business/update_food_menus` | Replace the food menus |
| `GET` | `/api/profiles/:profile_id/google_business/place_action_links` | List place action links |
| `GET` | `/api/profiles/:profile_id/google_business/available_place_action_types` | List place action types the location accepts |
| `POST` | `/api/profiles/:profile_id/google_business/create_place_action_link` | Create a place action link |
| `PATCH` | `/api/profiles/:profile_id/google_business/update_place_action_link` | Update a place action link |
| `DELETE` | `/api/profiles/:profile_id/google_business/delete_place_action_link` | Delete a place action link |
| `GET` | `/api/profiles/:profile_id/google_business/media` | List profile media |
| `POST` | `/api/profiles/:profile_id/google_business/create_media` | Add a photo or video to the profile |
| `DELETE` | `/api/profiles/:profile_id/google_business/delete_media` | Delete a profile media item |
| `GET` | `/api/profiles/:profile_id/google_business/search_keywords` | Searches that showed the location, month by month — see [Search keywords](#search-keywords) |

### Read first, then patch

Google's update calls are **field-masked**: every PATCH here takes a `fields` array naming exactly which parts of the resource you're replacing, and anything named in `fields` but absent from the body is **cleared**. Nested objects are replaced wholesale, not merged.

So the reliable pattern for every write is:

1. `GET` the resource.
2. Edit the object you got back.
3. `PATCH` it with `fields` naming only what you changed.

Payloads use Google's own shapes and camelCased keys, unchanged in both directions, so a response can be sent straight back as a request body.

### Feature availability

Google does not offer every capability to every profile. What a location supports depends on its primary category, its country, and location-level eligibility:

| Surface | Gate |
|---------|------|
| Attributes | Valid attribute IDs depend on primary category and region — always list [available attributes](#list-available-attributes) first |
| Service list | Requires `metadata.canModifyServiceList` on the location |
| Food menus | Requires `metadata.canHaveFoodMenus` — mostly restaurant-like categories |
| Place action links | Which `placeActionType` values are accepted varies by profile setup |
| Profile media | Category relevance and moderation vary by profile type |

Requests blocked by one of these gates return `422` with a message naming the flag.

### Location

#### Get location

<span class="method get">GET</span> `/api/profiles/:profile_id/google_business/location`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID (see above) |
| `read_mask` | string | No | Comma-separated Google field paths. Defaults to the full profile-oriented set (name, title, website, phones, categories, address, hours, service area, service items, labels, latlng, openInfo, profile, metadata) |

```bash
curl -X GET "https://api.postproxy.dev/api/profiles/prof_abc123/google_business/location?location_id=accounts/113344/locations/558899" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "name": "locations/558899",
  "title": "Acme Coffee",
  "websiteUri": "https://acme.example",
  "phoneNumbers": { "primaryPhone": "+1 555-0100" },
  "categories": { "primaryCategory": { "name": "categories/gcid:coffee_shop", "displayName": "Coffee shop" } },
  "storefrontAddress": { "regionCode": "US", "locality": "San Francisco", "addressLines": ["1 Market Street"] },
  "regularHours": { "periods": [ { "openDay": "MONDAY", "openTime": { "hours": 9 }, "closeDay": "MONDAY", "closeTime": { "hours": 17 } } ] },
  "profile": { "description": "Neighbourhood coffee since 2009." },
  "metadata": { "canModifyServiceList": true, "canHaveFoodMenus": false, "placeId": "ChIJ..." }
}
```

#### Update location

<span class="method patch">PATCH</span> `/api/profiles/:profile_id/google_business/update_location`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `fields` | array | Yes | Which fields to replace |
| *(field values)* | — | Yes | One key per entry in `fields` |

Patchable fields: `title`, `storeCode`, `websiteUri`, `phoneNumbers`, `categories`, `storefrontAddress`, `serviceArea`, `labels`, `latlng`, `openInfo`, `profile`.

Hours and the service list live on the same Google resource but have their own endpoints below.

```bash
curl -X PATCH "https://api.postproxy.dev/api/profiles/prof_abc123/google_business/update_location" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "location_id": "accounts/113344/locations/558899",
       "fields": ["websiteUri", "profile"],
       "websiteUri": "https://acme.example/coffee",
       "profile": { "description": "Neighbourhood coffee since 2009. Now with a roastery." }
     }'
```

Naming a field in `fields` without sending a value returns `400` — that would otherwise silently clear it.

#### List available categories

Category values in a `categories` patch are Google resource names, not display names, and they differ per region. Resolve them here.

<span class="method get">GET</span> `/api/profiles/:profile_id/google_business/available_location_categories`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `region_code` | string | Yes | CLDR region, e.g. `US` |
| `language_code` | string | No | BCP-47 code for display names (default `en`) |
| `filter` | string | No | Google category filter expression |
| `view` | string | No | `BASIC` (default) or `FULL` |
| `page_size` | integer | No | 1–100 (default 100) |
| `page_token` | string | No | From the previous response |

### Hours

<span class="method patch">PATCH</span> `/api/profiles/:profile_id/google_business/update_hours`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `fields` | array | Yes | Any of `regularHours`, `specialHours`, `moreHours` |
| `regularHours` | object | Conditional | Weekly schedule |
| `specialHours` | object | Conditional | Date-specific overrides (holidays) |
| `moreHours` | array | Conditional | Named hour sets, e.g. kitchen or pickup hours |

At least one block matching `fields` must be present, or the request is a `400`.

Times accept either `"09:00"` / `"09:00:00"` **or** Google's `{ "hours": 9, "minutes": 0 }` object; both are normalised before the call. Days are `MONDAY`…`SUNDAY`; dates are `{ "year", "month", "day" }`.

Read current hours through [Get location](#get-location) — they are part of the location resource.

```bash
curl -X PATCH "https://api.postproxy.dev/api/profiles/prof_abc123/google_business/update_hours" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "location_id": "accounts/113344/locations/558899",
       "fields": ["regularHours"],
       "regularHours": {
         "periods": [
           { "openDay": "MONDAY", "openTime": "09:00", "closeDay": "MONDAY", "closeTime": "17:30" },
           { "openDay": "TUESDAY", "openTime": "09:00", "closeDay": "TUESDAY", "closeTime": "17:30" }
         ]
       }
     }'
```

### Attributes

Structured facts Google shows on the profile — payments accepted, accessibility, amenities, links.

#### Get attributes

<span class="method get">GET</span> `/api/profiles/:profile_id/google_business/attributes`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |

```json
{
  "name": "locations/558899/attributes",
  "attributes": [
    { "name": "attributes/has_wheelchair_accessible_entrance", "values": [true] },
    { "name": "attributes/url_menu", "uriValues": [{ "uri": "https://acme.example/menu" }] }
  ]
}
```

#### List available attributes

<span class="method get">GET</span> `/api/profiles/:profile_id/google_business/available_attributes`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `category_name` | string | No | Look up by category (`categories/gcid:...`) instead of by location |
| `region_code` | string | No | CLDR region, required alongside `category_name` |
| `language_code` | string | No | BCP-47 code for display names |
| `show_all` | boolean | No | Return metadata for every attribute Google knows |
| `page_size` | integer | No | 1–200 (default 200) |
| `page_token` | string | No | From the previous response |

Each entry carries a `valueType` telling you which value shape to send back.

#### Update attributes

<span class="method patch">PATCH</span> `/api/profiles/:profile_id/google_business/update_attributes`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `attributes` | array | Yes | Objects with a `name` and a type-specific value field |
| `attribute_mask` | array | No | Which attribute names to replace. Defaults to exactly the names in `attributes` |

Value shapes by type:

| Type | Shape |
|------|-------|
| Boolean | `"values": [true]` |
| Enum / multi-select | `"repeatedEnumValue": { "setValues": ["TOKEN"] }` |
| URL | `"uriValues": [{ "uri": "https://..." }]` |

`attribute_mask` defaults to the names you sent, so a partial update never clears attributes you left out. Widen it deliberately to remove one.

```bash
curl -X PATCH "https://api.postproxy.dev/api/profiles/prof_abc123/google_business/update_attributes" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "location_id": "accounts/113344/locations/558899",
       "attributes": [
         { "name": "attributes/pay_credit_card", "values": [true] },
         { "name": "attributes/url_menu", "uriValues": [{ "uri": "https://acme.example/menu" }] }
       ]
     }'
```

### Service list

#### Get service list

<span class="method get">GET</span> `/api/profiles/:profile_id/google_business/service_list`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |

```json
{
  "name": "locations/558899",
  "serviceItems": [
    { "freeFormServiceItem": {
        "category": "categories/gcid:coffee_shop",
        "label": { "displayName": "Espresso bar", "languageCode": "en" }
    } }
  ]
}
```

#### Update service list

<span class="method patch">PATCH</span> `/api/profiles/:profile_id/google_business/update_service_list`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `serviceItems` | array | Yes | The complete list — this replaces what's there |

Requires `metadata.canModifyServiceList` on the location; otherwise `422`. Item shapes are Google's, and which fields are accepted varies by location, so read the current list and edit those objects rather than building new ones.

### Food menus

#### Get food menus

<span class="method get">GET</span> `/api/profiles/:profile_id/google_business/food_menus`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `fields` | array | No | `name`, `menus` |

#### Update food menus

<span class="method patch">PATCH</span> `/api/profiles/:profile_id/google_business/update_food_menus`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `menus` | array | Yes | The complete menu list — this replaces what's there |

Requires `metadata.canHaveFoodMenus`; otherwise `422`. Structure is menu → sections → items, all labels carry a `languageCode`, and prices need `currencyCode` and `units`.

```bash
curl -X PATCH "https://api.postproxy.dev/api/profiles/prof_abc123/google_business/update_food_menus" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "location_id": "accounts/113344/locations/558899",
       "menus": [{
         "labels": [{ "displayName": "Main menu", "languageCode": "en" }],
         "sections": [{
           "labels": [{ "displayName": "Drinks", "languageCode": "en" }],
           "items": [{
             "labels": [{ "displayName": "Filter coffee", "languageCode": "en" }],
             "attributes": { "price": { "currencyCode": "USD", "units": "3" } }
           }]
         }]
       }]
     }'
```

### Place action links

The action buttons on the profile — "Order online", "Book", "Reserve a table".

#### List place action links

<span class="method get">GET</span> `/api/profiles/:profile_id/google_business/place_action_links`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `page_size` | integer | No | 1–100 (default 100) |
| `page_token` | string | No | From the previous response |

```json
{
  "placeActionLinks": [{
    "name": "locations/558899/placeActionLinks/12345",
    "uri": "https://acme.example/order",
    "placeActionType": "FOOD_ORDERING",
    "isPreferred": true,
    "isEditable": true,
    "providerType": "MERCHANT"
  }]
}
```

#### List available place action types

<span class="method get">GET</span> `/api/profiles/:profile_id/google_business/available_place_action_types`

The `placeActionType` values Google accepts for this location. They depend on the location's categories and setup, so check here first when a create returns `Request contains an invalid argument`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `language_code` | string | No | BCP 47 code for `displayName` (e.g. `en`) |
| `page_size` | integer | No | 1–100 (default 100) |
| `page_token` | string | No | From the previous response |

```json
{
  "placeActionTypeMetadata": [
    { "placeActionType": "APPOINTMENT", "displayName": "Book" }
  ]
}
```

#### Create place action link

<span class="method post">POST</span> `/api/profiles/:profile_id/google_business/create_place_action_link`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `uri` | string | Yes | Where the button goes |
| `place_action_type` | string | Yes | See below |
| `is_preferred` | boolean | No | Make this the preferred link for its type (one per type per location) |

`place_action_type`: `APPOINTMENT`, `ONLINE_APPOINTMENT`, `DINING_RESERVATION`, `FOOD_ORDERING`, `FOOD_DELIVERY`, `FOOD_TAKEOUT`, `SHOP_ONLINE`.

#### Update place action link

<span class="method patch">PATCH</span> `/api/profiles/:profile_id/google_business/update_place_action_link`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `name` | string | Yes | Full resource name from the list response |
| `fields` | array | Yes | Any of `uri`, `placeActionType`, `isPreferred` |
| `uri` / `place_action_type` / `is_preferred` | — | Conditional | One per entry in `fields` |

#### Delete place action link

<span class="method delete">DELETE</span> `/api/profiles/:profile_id/google_business/delete_place_action_link`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `name` | string | Yes | Full resource name |

```json
{ "success": true }
```

A `name` belonging to a different location returns `400`.

### Profile media

Photos and videos on the Business Profile itself — distinct from media attached to a local post.

#### List media

<span class="method get">GET</span> `/api/profiles/:profile_id/google_business/media`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `page_size` | integer | No | 1–250 (default 100) |
| `page_token` | string | No | From the previous response |

#### Add media

<span class="method post">POST</span> `/api/profiles/:profile_id/google_business/create_media`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `media_url` | string | Yes | Public `https` URL — Google fetches the file itself |
| `category` | string | No | Default `ADDITIONAL` |
| `media_format` | string | No | `PHOTO` (default) or `VIDEO` |
| `description` | string | No | Max 2000 characters |

`category`: `CATEGORY_UNSPECIFIED`, `COVER`, `PROFILE`, `LOGO`, `EXTERIOR`, `INTERIOR`, `PRODUCT`, `AT_WORK`, `FOOD_AND_DRINK`, `MENU`, `COMMON_AREA`, `ROOMS`, `TEAMS`, `ADDITIONAL`.

Google downloads the file from `media_url`, so it has to be publicly reachable — a signed URL that expires quickly, or a localhost address, will fail.

```bash
curl -X POST "https://api.postproxy.dev/api/profiles/prof_abc123/google_business/create_media" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "location_id": "accounts/113344/locations/558899",
       "media_url": "https://cdn.example.com/storefront.jpg",
       "category": "COVER",
       "description": "Our storefront on Market Street"
     }'
```

#### Delete media

<span class="method delete">DELETE</span> `/api/profiles/:profile_id/google_business/delete_media`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `media_name` | string | Yes | Full resource name from the list response |

### Business Profile errors

| Status | Meaning |
|--------|---------|
| `400` | Missing `location_id`, an unsupported `fields` entry, a `fields` entry with no value, a bad enum, or a `name` on another location |
| `403` | Google refused the operation for this account |
| `404` | The `location_id` isn't reachable from this profile |
| `422` | Not a `google_business` profile, the connection needs reconnecting, Google rejected the payload, or the location isn't eligible (`canModifyServiceList` / `canHaveFoodMenus`). When Google sends them, field violations and its error reason, domain and metadata are appended to `error` |
| `429` | Google is rate-limiting; retry after the `Retry-After` header |

## Direct messages

Not supported.

## Stats

Location performance comes through the standard [profile stats endpoint](/reference/profiles/#profile-stats), one series per location — pass the `location_id` as `placement_id`. Snapshots are trailing 30-day totals: Search and Maps impressions (summed into `views`), website clicks, call clicks, direction requests, conversations, bookings, and food orders. See [Stats fields by network](/reference/profiles/#stats-fields-by-network).

For one record per calendar day, use [daily stats](/reference/profiles/#daily-stats) with the same `placement_id`. Google keeps about 18 months of performance data, and Postproxy pulls that full history on a location's first daily sync, so `daily_stats` covers the period before you connected it too (up to 366 days per request). Days older than Google's window return empty rather than an error.

Google Business has no follower count, and Google exposes no per-post stats for local posts — customer engagement surfaces as **reviews** instead ([Reviews](#reviews)).

### Search keywords

<span class="method get">GET</span> `/api/profiles/:profile_id/google_business/search_keywords`

The searches that showed the location in Google Search and Maps, month by month.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location_id` | string | Yes | Placement ID |
| `from_month` | string | No | `YYYY-MM`. Default: two months before `to_month` |
| `to_month` | string | No | `YYYY-MM`. Default: the last complete month |

The range is at most 12 months, and Google keeps keywords for the last 18 months only; a range outside those limits returns `400`.

```bash
curl -X GET "https://api.postproxy.dev/api/profiles/prof_abc123/google_business/search_keywords?location_id=accounts/113344/locations/558899&from_month=2026-07&to_month=2026-09" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "months": [
    {
      "month": "2026-07",
      "keywords": [
        { "keyword": "coffee near me", "impressions": 245, "impressions_threshold": null },
        { "keyword": "acme coffee market street", "impressions": null, "impressions_threshold": 15 }
      ]
    }
  ]
}
```

Keywords are sorted by `impressions`, highest first. For low-volume keywords Google reports no exact count, only that it is below a threshold: `impressions` is `null` and `impressions_threshold` holds the bound. A month with no data returns an empty `keywords` array. Errors follow the [Business Profile errors](#business-profile-errors) table.

## Webhooks

Subscribe with the Webhooks API:

```bash
curl -X POST "https://api.postproxy.dev/api/webhooks" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com/webhooks/postproxy",
       "events": ["platform_post.published", "profile_comment.created"]
     }'
```

Events relevant to Google Business:

| Event | When |
|-------|------|
| `post.processed` | A post is ready to publish |
| `platform_post.published` | A post was published to the platform |
| `platform_post.failed` | A post failed to publish (retries exhausted) |
| `platform_post.failed_waiting_for_retry` | A publish attempt failed; will retry |
| `profile_comment.created` | A new review was synced, or a reply was published. Filter on `data.object.placement_id` per location |
| `profile_comment.edited` | A reviewer changed the text or star rating of a synced review |
| `profile.connected` / `.disconnected` | Connection state changed |
| `profile.stats` | New profile stats snapshot |
| `media.failed` | A media attachment failed to process |

## Notes

- `location_id` is required on every post; it is the full Business Profile resource path.
- Video is not supported — local posts and the gallery accept images only.
- Some verticals (e.g. lodging) have local posts disabled by Google and will return a validation error.

---

# calendar

The Calendar API provides a public social media event calendar for 2026, covering public holidays, awareness days, cultural events, commerce dates, and sensitive/no-post dates across the world's 20 largest economies.

:::tip
This is a public endpoint — no authentication required.
:::

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/calendar` | List calendar events |

---

## List calendar events

<span class="method get">GET</span> `/api/calendar`

Retrieves a filtered, paginated list of calendar events for 2026.

### Query parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | No | - | Filter by category. Comma-separated. Values: `post_trigger`, `sensitive`, `no_post` |
| `type` | string | No | - | Filter by event type. Comma-separated. Values: `public_holiday`, `fun_holiday`, `awareness_day`, `cultural_event`, `sporting_event`, `commerce_event`, `religious_event`, `seasonal`, `remembrance` |
| `country` | string | No | - | Filter by country code (ISO 3166-1 alpha-2). Comma-separated. Also includes global events |
| `tag` | string | No | - | Filter by tag. Comma-separated. Examples: `sports`, `food`, `pets`, `commerce`, `environment` |
| `month` | integer | No | - | Filter by month (1–12) |
| `q` | string | No | - | Search event names (case-insensitive) |
| `from` | string | No | - | Start of date range (YYYY-MM-DD) |
| `to` | string | No | - | End of date range (YYYY-MM-DD) |
| `page` | integer | No | `1` | Page number (1-based). Passing `0` returns page `1` |
| `per_page` | integer | No | `50` | Results per page (1–100) |

### Examples

**Get all events:**

```bash
curl -X GET "https://api.postproxy.dev/api/calendar"
```

**Get no-post / sensitive dates:**

```bash
curl -X GET "https://api.postproxy.dev/api/calendar?category=no_post,sensitive"
```

**Get Black Friday week events for US:**

```bash
curl -X GET "https://api.postproxy.dev/api/calendar?country=US&from=2026-11-25&to=2026-12-01"
```

**Get all sporting events:**

```bash
curl -X GET "https://api.postproxy.dev/api/calendar?type=sporting_event"
```

**Search by name:**

```bash
curl -X GET "https://api.postproxy.dev/api/calendar?q=coffee"
```

**Combine filters — fun holidays in December with food tag:**

```bash
curl -X GET "https://api.postproxy.dev/api/calendar?type=fun_holiday&month=12&tag=food"
```

### Response

```json
{
  "total": 284,
  "page": 1,
  "per_page": 50,
  "filters": {},
  "data": [
    {
      "date": "2026-01-01",
      "name": "New Year's Day",
      "type": "public_holiday",
      "category": "post_trigger",
      "countries": ["US", "CN", "DE", "JP", "FR", "IT", "CA", "BR", "KR", "AU", "MX", "ES", "ID", "NL", "TR", "CH"],
      "tags": []
    }
  ]
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total number of events matching the filters |
| `page` | integer | Current page number |
| `per_page` | integer | Number of results per page |
| `filters` | object | Echo of active filters applied to the request |
| `data` | array | Array of event objects |

### Event object

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | Event date (YYYY-MM-DD) |
| `name` | string | Event name |
| `type` | string | Event type (see values below) |
| `category` | string | One of `post_trigger`, `sensitive`, `no_post` |
| `countries` | array\|null | Country codes where applicable, or null for global events |
| `tags` | array | Descriptive tags for filtering |
| `posting_tip` | string\|null | Optional social media posting guidance |

---

## Event types

| Type | Description |
|------|-------------|
| `public_holiday` | Official government holidays |
| `fun_holiday` | Quirky/informal holidays (National Pizza Day, etc.) |
| `awareness_day` | Awareness and advocacy days (World Mental Health Day, etc.) |
| `cultural_event` | Cultural celebrations and awards (Oscars, Halloween, etc.) |
| `sporting_event` | Major sporting events (Super Bowl, FIFA World Cup, etc.) |
| `commerce_event` | Shopping/commerce events (Black Friday, Cyber Monday, etc.) |
| `religious_event` | Religious observances (Ramadan, Diwali, etc.) |
| `seasonal` | Seasonal markers (solstices, equinoxes, etc.) |
| `remembrance` | Memorial and remembrance dates |

---

## Categories

| Category | Description |
|----------|-------------|
| `post_trigger` | Good opportunity to post — plan content around these dates |
| `sensitive` | Post with care — be respectful, avoid commercial tie-ins |
| `no_post` | Brands should stay silent or share only respectful acknowledgment |

---

## Available countries

The calendar covers public holidays for 16 countries (top 20 economies; India and Saudi Arabia are not yet available):

`US`, `CN`, `DE`, `JP`, `GB`, `FR`, `IT`, `CA`, `BR`, `KR`, `AU`, `MX`, `ES`, `ID`, `NL`, `TR`, `CH`

---

# webhooks

Webhooks allow your application to receive real-time HTTP notifications when events occur in your Postproxy account, such as a post being processed, a platform post being published or failing, or a profile being disconnected.

When an event occurs, Postproxy sends a `POST` request to your configured URL with a JSON payload describing the event.

:::note
All API calls require authentication.
:::

## Event types

| Event | Description |
|-------|-------------|
| `post.processed` | A post has been processed and is ready for publishing |
| `post.imported` | A post was imported from a connected platform during sync |
| `platform_post.published` | A post was successfully published to a platform |
| `platform_post.failed` | A post failed to publish to a platform |
| `platform_post.failed_waiting_for_retry` | A post failed but will be retried |
| `platform_post.edited` | A published post's text was edited on a platform |
| `platform_post.edit_failed` | Editing a published post on a platform failed |
| `platform_post.insights` | New insights/analytics are available for a platform post |
| `profile.disconnected` | A connected social profile was disconnected |
| `profile.connected` | A new social profile was connected |
| `profile.stats` | A new profile stats snapshot was recorded (fires once per placement) |
| `profile.placements_synced` | A pull of a profile's placements finished — `placements_sync_status` is `synced` or `failed`. Fires after connect, on the periodic refresh, and on manual syncs |
| `placement.orphaned` | A placement's serving profile disconnected — the placement and its history remain, but collection and posting pause until a profile with access serves it again |
| `placement.restored` | An orphaned placement is served again — its original profile reconnected, or another connected profile with access took it over |
| `media.failed` | A media attachment failed to process or download |
| `comment.created` | A comment was successfully created on a platform post |
| `comment.failed` | An outgoing comment failed permanently. Payload `error` / `error_details` describe the platform error |
| `comment.failed_waiting_for_retry` | An outgoing comment failed and will be retried |
| `comment.delivery_unconfirmed` | An outgoing comment failed in a way that could mean it was posted. It is **not** sent again — Postproxy checks the platform for it instead. Not terminal; see [comment status lifecycle](/reference/comments/#comment-status-lifecycle) |
| `comment.edited` | A comment edit made through Postproxy was confirmed by the platform. `body` carries the new text and `external_edited_at` is set |
| `comment.edit_failed` | The platform rejected a comment edit. `body` is unchanged; `error` / `error_details` describe the rejection |
| `profile_comment.created` | A profile-scoped comment appeared (a new Google Business review, a Facebook Page recommendation, or a published reply). Fires for `google_business` and `facebook` profiles, once per new review across **all locations / Pages** of the account; filter on `data.object.placement_id` if you only care about a subset. |
| `profile_comment.edited` | A reviewer changed the text or star rating of a Google Business review Postproxy had already synced. `body` and `platform_data.star_rating` carry the new values, `platform_data.update_time` the edit time, and `posted_at` stays the original review time. `google_business` only |
| `profile_comment.failed` | An outgoing profile-comment reply failed permanently. Payload `error` / `error_details` describe the platform error |
| `profile_comment.failed_waiting_for_retry` | An outgoing profile-comment reply failed and will be retried |
| `profile_comment.deleted` | A previously synced Google Business review or owner reply no longer exists on Google (removed by the reviewer, by Google moderation, or by the owner). The row stays fetchable by id with `status: "deleted"` but drops out of list responses. `google_business` only |
| `message.received` | An inbound direct message arrived |
| `message.sent` | An outbound direct message was accepted by the platform |
| `message.delivered` | The platform confirmed delivery to the recipient (WhatsApp, Facebook & Instagram) |
| `message.read` | The recipient read the message (WhatsApp, Facebook & Instagram) |
| `message.edited` | A message was edited on the platform |
| `message.deleted` | A message was deleted/unsent on the platform (Instagram and WhatsApp) |
| `message.failed_waiting_for_retry` | An outbound message failed and will be retried. Payload `error_message` / `error_details` describe the platform error |
| `message.failed` | An outbound message failed permanently. Payload `error_message` / `error_details` describe the platform error |
| `reaction.received` | A reaction was added or removed on a message (WhatsApp, Facebook & Instagram) |
| `referral.received` | A participant entered a DM thread via an ig.me / m.me / `wa.me` link, or a Click-to-WhatsApp ad (WhatsApp, Facebook & Instagram) |
| `chat.thread_control_changed` | Another app passed or took a conversation — see [Thread control](/reference/direct-messages/#thread-control) (Facebook & Instagram) |
| `chat.thread_control_requested` | Another app asked Postproxy to pass a conversation (Facebook & Instagram) |
| `message_template.status_updated` | Meta approved, rejected, paused, disabled or re-enabled a WhatsApp [message template](/reference/platforms/whatsapp/#message-templates), or changed its quality score |
| `message_template.category_updated` | Meta recategorized a WhatsApp message template — e.g. `UTILITY` → `MARKETING` |
| `placement.name_status_updated` | Meta decided on a [display name change request](/reference/platforms/whatsapp/#display-name) for a WhatsApp number |
| `placement.quality_updated` | A WhatsApp number's [quality rating or messaging limit tier](/reference/platforms/whatsapp/#phone-numbers) changed |
| `whatsapp.automatic_event` | Meta detected a conversion (purchase, lead) in a [Click-to-WhatsApp](/reference/platforms/whatsapp/#click-to-whatsapp-conversions) conversation |

You can subscribe to all events using `*` or select individual event types.

The WhatsApp-specific events — `message_template.*`, `placement.name_status_updated`, `placement.quality_updated` and `whatsapp.automatic_event` — are documented with their payloads on the [WhatsApp platform page](/reference/platforms/whatsapp/#webhooks).

---

## Event payload

Every webhook delivery uses a consistent envelope structure:

```json
{
  "id": "whevt_a1b2c3d4e5",
  "object": "event",
  "type": "platform_post.published",
  "created_at": "2025-01-15T10:30:00Z",
  "data": {
    "object": {
      // Event-specific resource (Post, Platform Post, Comment, Message, etc.)
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Delivery ID, prefixed with `whevt_`. Matches the `X-Postproxy-Delivery` header. |
| `object` | string | Always `"event"`. |
| `type` | string | Event type (e.g. `platform_post.published`). Matches the `X-Postproxy-Event` header. |
| `created_at` | string | ISO 8601 timestamp of when the event was generated. |
| `data.object` | object | The event-specific resource — shape varies per event type (see [Payloads by event](#payloads-by-event)). |

### Headers

| Header | Description |
|--------|-------------|
| `Content-Type` | `application/json` |
| `User-Agent` | `Postproxy-Webhooks/1.0` |
| `X-Postproxy-Event` | The event type (e.g. `platform_post.published`) |
| `X-Postproxy-Delivery` | Unique delivery ID for this event |
| `X-Postproxy-Signature` | HMAC signature for verification |

### Payloads by event

#### `post.processed`

Uses the **Post** payload shape.

```json
{
  "id": "whevt_abc123",
  "object": "event",
  "type": "post.processed",
  "created_at": "2025-01-15T10:30:00Z",
  "data": {
    "object": {
      "id": "abc123xyz",
      "body": "Check out our latest update!",
      "status": "processed",
      "scheduled_at": null,
      "created_at": "2025-01-15T10:30:00Z",
      "platforms": [
        {
          "id": "prof_xyz",
          "platform": "twitter",
          "name": "My Twitter"
        }
      ]
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.id` | string | Post id |
| `data.object.body` | string | Post content |
| `data.object.status` | string | Post status |
| `data.object.scheduled_at` | string \| null | ISO 8601 scheduled time |
| `data.object.created_at` | string | ISO 8601 creation time |
| `data.object.platforms` | array | Profiles attached to the post |
| `data.object.platforms[].id` | string | Profile id |
| `data.object.platforms[].platform` | string | Network name (e.g. `twitter`, `linkedin`) |
| `data.object.platforms[].name` | string | Profile display name |

---

#### `post.imported`

Sent when Postproxy imports a post from a connected social platform (i.e. a post that was published outside Postproxy and discovered during a profile sync).

```json
{
  "id": "whevt_k9m2x7",
  "object": "event",
  "type": "post.imported",
  "created_at": "2025-01-15T10:30:00Z",
  "data": {
    "object": {
      "id": "q7d3k8",
      "body": "Check out our latest update!",
      "source": "imported",
      "posted_at": "2025-01-14T18:22:00Z",
      "created_at": "2025-01-15T10:30:00Z",
      "platform": "instagram",
      "profile": {
        "id": "m1x5b9",
        "name": "Acme Brand",
        "platform": "instagram"
      },
      "platform_post_id": "17841405822304914",
      "public_id": "DEF456abc"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.id` | string | Post ID |
| `data.object.body` | string | Post content |
| `data.object.source` | string | Always `"imported"` for imported posts |
| `data.object.posted_at` | string \| null | ISO 8601 timestamp the post was originally published on the platform |
| `data.object.created_at` | string | ISO 8601 timestamp the post was imported into Postproxy |
| `data.object.platform` | string | Network name (e.g. `instagram`, `twitter`) |
| `data.object.profile` | object | Profile the post was imported from |
| `data.object.profile.id` | string | Profile ID |
| `data.object.profile.name` | string | Profile display name |
| `data.object.profile.platform` | string | Network name |
| `data.object.platform_post_id` | string | Platform's internal post ID |
| `data.object.public_id` | string \| null | Platform's public-facing post ID/shortcode (used in permalinks) |

---

#### `platform_post.published`, `platform_post.failed`, `platform_post.failed_waiting_for_retry`, `platform_post.edited`, `platform_post.edit_failed`

These events share the **Platform Post** payload shape. The `status` and `error` fields reflect the outcome. For `platform_post.edited` and `platform_post.edit_failed`, `status` stays `published` and `error` is set on failure; on X, `platform_id` is the new ID of the edited post. See [Editing published posts](/reference/posts/#editing-published-posts).

```json
{
  "id": "whevt_def456",
  "object": "event",
  "type": "platform_post.published",
  "created_at": "2025-01-15T10:30:01Z",
  "data": {
    "object": {
      "id": "pp_abc123",
      "post_id": "abc123xyz",
      "platform": "twitter",
      "profile_id": "prof_xyz",
      "profile_name": "My Twitter",
      "status": "published",
      "error": null,
      "error_details": null,
      "platform_id": "1234567890"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.id` | string | Platform post id |
| `data.object.post_id` | string | Parent post id |
| `data.object.platform` | string | Network name |
| `data.object.profile_id` | string | Profile id |
| `data.object.profile_name` | string | Profile display name |
| `data.object.status` | string | `published`, `failed`, or `failed_waiting_for_retry` |
| `data.object.error` | string \| null | Error summary (null on success) |
| `data.object.error_details` | object \| null | Structured error details from the platform (null when no platform error info is available) |
| `data.object.error_details.platform_error_code` | string \| null | Error code returned by the platform API |
| `data.object.error_details.platform_error_subcode` | string \| null | Error subcode returned by the platform API |
| `data.object.error_details.platform_error_message` | string \| null | Error message returned by the platform API |
| `data.object.error_details.postproxy_note` | string \| null | Additional context from Postproxy about the error |
| `data.object.platform_id` | string \| null | External post ID on the platform (null until published) |

---

#### `platform_post.insights`

Uses the **Platform Post** payload shape plus an `insights` field containing the latest normalized analytics snapshot, and a `raw_stats` field with the same metrics under their original platform key names.

```json
{
  "id": "whevt_ins789",
  "object": "event",
  "type": "platform_post.insights",
  "created_at": "2025-01-15T18:00:00Z",
  "data": {
    "object": {
      "id": "pp_abc123",
      "post_id": "abc123xyz",
      "platform": "twitter",
      "profile_id": "prof_xyz",
      "profile_name": "My Twitter",
      "status": "published",
      "error": null,
      "error_details": null,
      "platform_id": "1234567890",
      "insights": {
        "impressions": 1523,
        "likes": 42,
        "comments": 7,
        "shares": 3
      },
      "raw_stats": {
        "impression_count": 1523,
        "like_count": 42,
        "reply_count": 7
      }
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.insights` | object | Normalized key-value stats from the platform (varies by network) |
| `data.object.raw_stats` | object \| null | The same metrics under their original platform key names (see [Stats fields by platform](/reference/posts/#stats-fields-by-platform)). `null` for snapshots recorded before July 20, 2026 |

All other fields are identical to the Platform Post shape above.

---

#### `profile.connected`, `profile.disconnected`

These two events share the **Profile** payload shape.

```json
{
  "id": "whevt_prof01",
  "object": "event",
  "type": "profile.disconnected",
  "created_at": "2025-01-15T12:00:00Z",
  "data": {
    "object": {
      "id": "prof_xyz",
      "name": "My Twitter",
      "platform": "twitter",
      "profile_group_id": "grp456xyz",
      "status": "disconnected",
      "uid": "twitter_456",
      "platform_id": "twitter_456",
      "username": "myhandle",
      "origin": "user"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.id` | string | Profile id |
| `data.object.name` | string | Profile display name |
| `data.object.platform` | string | Network name |
| `data.object.profile_group_id` | string | Profile group ID |
| `data.object.status` | string | `active` or `disconnected` |
| `data.object.uid` | string | External ID on the platform |
| `data.object.platform_id` | string | The account's ID on the platform — same value as `uid` |
| `data.object.username` | string \| null | External username on the platform |
| `data.object.origin` | string | `profile.disconnected` only. `user` when the profile was removed from the dashboard or the API, `automated` when Postproxy deactivated it after the platform rejected its credentials. Absent on `profile.connected` |
| `data.object.error` | string | `profile.disconnected` with `origin: "automated"` only. Why the profile was deactivated, e.g. `Twitter access revoked` |
| `data.object.error_details` | object \| null | The platform error behind the disconnect, when available: `platform_error_code`, `platform_error_subcode`, `platform_error_message`, `postproxy_note` (keys without a value are omitted) |

An automated disconnect looks like this:

```json
{
  "id": "prof_xyz",
  "name": "My Twitter",
  "platform": "twitter",
  "profile_group_id": "grp456xyz",
  "status": "inactive",
  "uid": "twitter_456",
  "platform_id": "twitter_456",
  "username": "myhandle",
  "origin": "automated",
  "error": "Twitter access revoked",
  "error_details": {
    "platform_error_message": "Twitter access revoked or account suspended — please reconnect the profile"
  }
}
```

---

#### `placement.orphaned`, `placement.restored`

Fired when a placement — a Facebook Page, LinkedIn organization, Pinterest board, Telegram channel, Google Business location — loses or regains a serving profile. `placement.orphaned` fires for each active placement a profile was serving when it disconnects (including via profile group deletion); the placement and all of its history remain readable, but stats collection, comment/DM ingestion and posting pause. `placement.restored` fires when the placement is served again — the same profile reconnected, or another connected profile with access to it took over (check `data.object.profile_id` to see which).

```json
{
  "id": "whevt_plc01",
  "object": "event",
  "type": "placement.orphaned",
  "created_at": "2026-08-26T12:00:00Z",
  "data": {
    "object": {
      "id": "967627696429808",
      "name": "My Page",
      "platform": "facebook",
      "profile_group_id": "grp456xyz",
      "profile_id": "prof_xyz",
      "profile_name": "John Doe",
      "metadata": {}
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.id` | string | Placement ID — the platform's own ID, stable across disconnects and handovers; the same value [List placements](/reference/profiles/#list-placements) returns |
| `data.object.name` | string | Placement display name |
| `data.object.platform` | string | Network name |
| `data.object.profile_group_id` | string \| null | Profile group the placement is assigned to; `null` when unassigned |
| `data.object.profile_id` | string | The serving profile — on `orphaned` the one that disconnected, on `restored` the one now serving it |
| `data.object.profile_name` | string | That profile's display name |
| `data.object.metadata` | object | Extra per-placement data, same as List placements |

---

#### `profile.placements_synced`

Sent when a pull of a profile's [placements](/reference/profiles/#list-placements) (Facebook Pages, LinkedIn organizations, Pinterest boards, Google Business locations) finishes. The first pull starts right after `profile.connected` and can take several minutes; later pulls run on the periodic refresh and when a sync is triggered manually. Only profiles on placement platforms emit it (`telegram` channels arrive via Telegram's own webhook and never do).

```json
{
  "id": "whevt_p4l2c9",
  "object": "event",
  "type": "profile.placements_synced",
  "created_at": "2025-01-15T12:06:41Z",
  "data": {
    "object": {
      "id": "m1x5b9",
      "name": "My Facebook",
      "platform": "facebook",
      "profile_group_id": "grp456xyz",
      "status": "active",
      "uid": "123456789012345",
      "platform_id": "123456789012345",
      "username": null,
      "placements_sync_status": "synced",
      "placements": [
        {
          "id": "967627696429808",
          "name": "Acme Store",
          "platform": "facebook",
          "profile_group_id": "grp456xyz",
          "profile_id": "m1x5b9",
          "profile_name": "My Facebook",
          "metadata": { "username": "acmestore" }
        },
        {
          "id": "104558291234567",
          "name": "Acme Outlet",
          "platform": "facebook",
          "profile_group_id": "grp456xyz",
          "profile_id": "m1x5b9",
          "profile_name": "My Facebook",
          "metadata": {}
        }
      ]
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.*` | | The [Profile](#profileconnected-profiledisconnected) fields (`id`, `name`, `platform`, `profile_group_id`, `status`, `uid`, `platform_id`, `username`) |
| `data.object.placements_sync_status` | string | `synced` when the pull completed, `failed` when the platform rejected it (expired token, quota, upstream error). The next scheduled or manual sync retries |
| `data.object.placements` | array | The full current list of placements this profile can post to — the same objects [List placements](/reference/profiles/#list-placements) returns, not a diff. Empty on `failed` unless an earlier pull already stored some. Can be long for multi-location Google Business accounts |

---

#### `profile.stats`

Sent each time a new profile stats snapshot is recorded for a profile. Snapshots are captured roughly every 23 hours per profile. For networks with placements (`facebook`, `linkedin`, `telegram`) the event fires once per placement on each polling cycle.

```json
{
  "id": "whevt_stats01",
  "object": "event",
  "type": "profile.stats",
  "created_at": "2026-05-11T08:00:00Z",
  "data": {
    "object": {
      "profile_id": "prof_xyz",
      "platform": "linkedin",
      "placement_id": "108520199",
      "stats": {
        "followerCount": 4567,
        "shareCount": 10,
        "likeCount": 99,
        "allPageViews": 12728
      },
      "recorded_at": "2026-05-11T08:00:00Z"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.profile_id` | string | Profile ID |
| `data.object.platform` | string | Network name (e.g. `linkedin`, `bluesky`) |
| `data.object.placement_id` | string \| null | Platform-specific placement ID. `null` for networks without placements. |
| `data.object.stats` | object | Platform-specific metrics. Shape varies by network — see [Profiles · Stats fields by network](/reference/profiles/#stats-fields-by-network). |
| `data.object.recorded_at` | string | ISO 8601 timestamp when the snapshot was captured |

---

#### `media.failed`

Uses the **Attachment** payload shape.

```json
{
  "id": "whevt_med01",
  "object": "event",
  "type": "media.failed",
  "created_at": "2025-01-15T10:30:02Z",
  "data": {
    "object": {
      "id": "att_xyz",
      "post_id": "abc123xyz",
      "content_type": "image/jpeg",
      "status": "failed",
      "error_message": "Media file not found"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.id` | string | Attachment id |
| `data.object.post_id` | string | Parent post id |
| `data.object.content_type` | string | MIME type of the attachment |
| `data.object.status` | string | Always `failed` for this event |
| `data.object.error_message` | string | Human-readable error description |

---

#### `comment.created`

Uses the **Comment** payload shape. `comment.failed`, `comment.failed_waiting_for_retry` and `comment.delivery_unconfirmed` use the same shape, with `status` set to the value the comment moved to. `comment.edited` and `comment.edit_failed` also use it; the comment stays `published` and `external_edited_at` marks the last confirmed edit.

```json
{
  "id": "whevt_h2c8f3",
  "object": "event",
  "type": "comment.created",
  "created_at": "2025-01-15T10:30:05Z",
  "data": {
    "object": {
      "id": "n5y1z7",
      "post_id": "q7d3k8",
      "platform_post_id": "j4r9v2",
      "platform": "instagram",
      "profile_id": "b8x2m4",
      "external_id": "ig_comment_456",
      "parent_external_id": null,
      "body": "Great post!",
      "status": "published",
      "error": null,
      "error_details": null,
      "author_external_id": "user_789",
      "author_name": "Jane Doe",
      "author_username": "janedoe",
      "author_avatar_url": "https://example.com/avatar.jpg",
      "like_count": 0,
      "reply_count": 0,
      "is_hidden": false,
      "permalink": "https://instagram.com/p/abc123/c/456",
      "platform_data": {},
      "external_edited_at": null,
      "posted_at": null,
      "created_at": "2025-01-15T10:30:05Z"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.id` | string | Comment ID |
| `data.object.post_id` | string | Parent post ID |
| `data.object.platform_post_id` | string | Platform post ID |
| `data.object.platform` | string | Network name (e.g. `instagram`, `facebook`) |
| `data.object.profile_id` | string | ID of the profile that owns the post |
| `data.object.external_id` | string \| null | Comment ID on the platform |
| `data.object.parent_external_id` | string \| null | Parent comment ID (null for top-level comments) |
| `data.object.body` | string | Comment text |
| `data.object.status` | string | `published`, `failed`, or `failed_waiting_for_retry` |
| `data.object.error` | string \| null | Error summary (null on success) |
| `data.object.error_details` | object \| null | Structured error details from the platform (null when no platform error info is available) |
| `data.object.error_details.platform_error_code` | string \| null | Error code returned by the platform API |
| `data.object.error_details.platform_error_subcode` | string \| null | Error subcode returned by the platform API |
| `data.object.error_details.platform_error_message` | string \| null | Error message returned by the platform API |
| `data.object.error_details.postproxy_note` | string \| null | Additional context from Postproxy about the error |
| `data.object.author_external_id` | string \| null | Author's ID on the platform |
| `data.object.author_name` | string \| null | Author's display name |
| `data.object.author_username` | string \| null | Author's username |
| `data.object.author_avatar_url` | string \| null | Stable Postproxy storage URL of the author's profile picture once mirrored; the platform URL until then |
| `data.object.like_count` | integer | Number of likes |
| `data.object.reply_count` | integer | Number of replies |
| `data.object.is_hidden` | boolean | Whether the comment is hidden |
| `data.object.permalink` | string \| null | Direct link to the comment |
| `data.object.platform_data` | object \| null | Platform-specific metadata |
| `data.object.external_edited_at` | string \| null | ISO 8601 time of the last edit confirmed through Postproxy (null if never edited) |
| `data.object.posted_at` | string \| null | ISO 8601 time when posted on the platform |
| `data.object.created_at` | string | ISO 8601 creation time |

---

#### `profile_comment.created`

Fires when a new profile-scoped comment appears — either a newly synced incoming review (a Google Business review or a Facebook Page recommendation) or an outgoing reply that has just been published. See the [Profile Comments API](/reference/profile-comments/) for the full resource.

Fires once per new review across **all locations / Pages** of the account. Webhook registration does not currently offer a placement filter — multi-location subscribers should filter on `data.object.placement_id` themselves.

```json
{
  "id": "whevt_pcm01",
  "object": "event",
  "type": "profile_comment.created",
  "created_at": "2026-05-13T06:00:01Z",
  "data": {
    "object": {
      "id": "abc123",
      "profile_id": "prof123abc",
      "platform": "google_business",
      "placement_id": "accounts/1234/locations/5678",
      "external_id": "accounts/1234/locations/5678/reviews/AbFvOq",
      "parent_external_id": null,
      "body": "Great coffee, friendly staff!",
      "status": "synced",
      "error": null,
      "error_details": null,
      "author_username": "Jane D.",
      "author_avatar_url": "https://lh3.googleusercontent.com/...",
      "platform_data": { "star_rating": 5, "update_time": "2026-05-10T12:00:00Z" },
      "posted_at": "2026-05-10T11:55:00Z",
      "created_at": "2026-05-13T06:00:01Z"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.id` | string | Profile comment ID |
| `data.object.profile_id` | string | Profile that owns the comment |
| `data.object.platform` | string | Network name (currently `google_business`) |
| `data.object.placement_id` | string | Location path (e.g. `accounts/X/locations/Y`) |
| `data.object.external_id` | string \| null | Platform's native resource ID |
| `data.object.parent_external_id` | string \| null | Parent review external ID (null for top-level reviews) |
| `data.object.body` | string | Comment/review text |
| `data.object.status` | string | `synced`, `published`, `pending`, `failed`, `failed_waiting_for_retry`, or `deleted` |
| `data.object.error` | string \| null | Error summary (null on success) |
| `data.object.error_details` | object \| null | Structured error details from the platform (null when no platform error info is available) |
| `data.object.error_details.platform_error_code` | string \| null | Error code returned by the platform API |
| `data.object.error_details.platform_error_subcode` | string \| null | Error subcode returned by the platform API |
| `data.object.error_details.platform_error_message` | string \| null | Error message returned by the platform API |
| `data.object.error_details.postproxy_note` | string \| null | Additional context from Postproxy about the error |
| `data.object.author_username` | string \| null | Reviewer display name (null for your own replies) |
| `data.object.author_avatar_url` | string \| null | Reviewer avatar URL |
| `data.object.platform_data` | object \| null | Platform-specific metadata (e.g. `star_rating`) |
| `data.object.posted_at` | string \| null | ISO 8601 time when posted on the platform |
| `data.object.created_at` | string | ISO 8601 creation time |

---

#### `profile_comment.edited`

Same payload shape as `profile_comment.created`, carrying the review's new `body` and `platform_data.star_rating`. Fires when a Google Business review that Postproxy had already synced comes back from Google with different text or a different rating, detected on the next hourly sync. `posted_at` keeps the review's original time, so an edited old review keeps its place in [`GET /api/profiles/:id/comments`](/reference/profile-comments/#list-comments); `platform_data.update_time` is when it was edited. Currently `google_business` only.

---

#### `profile_comment.deleted`

Same payload shape as `profile_comment.created`, with `status` set to `deleted`. Fires when a Google Business review that Postproxy had previously synced is no longer returned by Google (removed by the reviewer or by Google moderation), or when a review's owner reply was deleted outside Postproxy. Deleting a review cascades to its reply row, but only the review's event is sent. Currently `google_business` only — Facebook recommendation removals already arrive through Meta's ratings webhook.

Deleted rows drop out of [`GET /api/profiles/:id/comments`](/reference/profile-comments/#list-comments) but remain fetchable by id with `status: "deleted"`.

---

#### `message.received`, `message.sent`, `message.delivered`, `message.read`, `message.edited`, `message.deleted`, `message.failed_waiting_for_retry`, `message.failed`

All eight message events share the **Message** payload shape — `data.object` is the full [direct message object](/reference/direct-messages/#message-object-fields). The event type tells you what happened; inspect the message's fields for the details.

```json
{
  "id": "whevt_msg01",
  "object": "event",
  "type": "message.received",
  "created_at": "2026-06-01T15:02:00Z",
  "data": {
    "object": {
      "id": "msg_111",
      "chat_id": "chat_xyz789",
      "external_id": "mid.abc123",
      "direction": "inbound",
      "body": "Hey, do you ship internationally?",
      "status": "received",
      "external_comment_id": null,
      "error_message": null,
      "platform_data": null,
      "external_posted_at": "2026-06-01T15:02:00.000Z",
      "external_delivered_at": null,
      "external_read_at": null,
      "external_edited_at": null,
      "reply_to_external_id": null,
      "reply_markup": null,
      "quick_replies": null,
      "buttons": null,
      "card": null,
      "tapped_action": null,
      "story_reply": null,
      "external_deleted_at": null,
      "reactions": [],
      "attachments": [],
      "is_unsupported": false,
      "created_at": "2026-06-01T15:02:01.000Z"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object` | object | The full [message object](/reference/direct-messages/#message-object-fields), reflecting state after the event |

Per-platform firing rules:

- `message.delivered` / `message.read` fire on **Facebook & Instagram** only — Telegram and Bluesky do not expose delivery/read receipts to bots.
- `message.deleted` fires on **Instagram** only — Messenger has no reliable deletion webhook for Pages, and Telegram does not notify bots of user deletions.
- `message.edited` fires for inbound edits on Facebook, Instagram, and Telegram (via Telegram's `edited_message` update) and for outbound Telegram edits made via the API.
- A tapped [quick reply, button, or ice breaker](/reference/direct-messages/#quick-replies-and-buttons) arrives as `message.received` with `tapped_action` set to the `payload` you sent — no need to read `platform_data`.

---

#### `reaction.received`

Fires when a reaction is added or removed on a message — for inbound (participant) reactions and outbound (business-initiated) reactions via the [React API](/reference/direct-messages/#react-to-message). Facebook & Instagram only.

```json
{
  "id": "whevt_rxn01",
  "object": "event",
  "type": "reaction.received",
  "created_at": "2026-06-01T15:02:00Z",
  "data": {
    "object": {
      "message": {
        "id": "msg_111",
        "chat_id": "chat_xyz789",
        "direction": "inbound",
        "body": "Hey, do you ship internationally?",
        "reactions": [
          { "sender_external_id": "psid_123", "emoji": "❤️", "reaction": "love", "at": "2026-06-01T15:02:00.000Z" }
        ]
      },
      "sender_external_id": "psid_123",
      "action": "react",
      "reaction": "love",
      "emoji": "❤️",
      "occurred_at": "2026-06-01T15:02:00Z"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.message` | object | The full [message object](/reference/direct-messages/#message-object-fields), reflecting the post-reaction state (the `reactions` array already has the reactor added for `react`, or removed for `unreact`) |
| `data.object.sender_external_id` | string | Platform ID of whoever placed/removed the reaction (participant PSID/IGSID, or your own `profile.external_id` for business reactions) |
| `data.object.action` | string | `react` or `unreact` |
| `data.object.reaction` | string \| null | Named reaction (e.g. `love`) |
| `data.object.emoji` | string \| null | Unicode emoji; may be absent on Messenger and on unreact events |
| `data.object.occurred_at` | string \| null | ISO 8601 time the reaction occurred |

#### `referral.received`

Fires when a participant enters a DM thread via an [ig.me / m.me link](/reference/direct-messages/#igme--mme-link-referrals) carrying a `ref` parameter — whether the referral arrives standalone, embedded in the first inbound message, or inside an ice-breaker tap. Facebook & Instagram only; on Instagram, Meta only sends referrals for profiles with at least one [ice breaker](/reference/direct-messages/#ice-breakers) set. The referral is also stored on the chat under `metadata.referral`, and per Meta policy it opens the 24-hour messaging window.

```json
{
  "id": "whevt_ref01",
  "object": "event",
  "type": "referral.received",
  "created_at": "2026-06-10T12:00:00Z",
  "data": {
    "object": {
      "chat": {
        "id": "chat_xyz789",
        "profile_id": "prof_abc123",
        "platform": "instagram",
        "participant_external_id": "igsid_456",
        "metadata": {
          "referral": { "ref": "summer_promo", "source": "SHORTLINK", "type": "OPEN_THREAD", "received_at": "2026-06-10T12:00:00Z" },
          "last_referral_at": "2026-06-10T12:00:00Z"
        }
      },
      "ref": "summer_promo",
      "source": "SHORTLINK",
      "type": "OPEN_THREAD",
      "occurred_at": "2026-06-10T12:00:00Z"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.chat` | object | The full [chat object](/reference/direct-messages/#chat-object-fields), with the referral already stored under `metadata.referral` |
| `data.object.ref` | string | The `ref` parameter from the link |
| `data.object.source` | string | Where the referral came from (e.g. `SHORTLINK`) |
| `data.object.type` | string | Meta's referral type (e.g. `OPEN_THREAD`) |
| `data.object.occurred_at` | string \| null | ISO 8601 time the referral occurred |

#### `chat.thread_control_changed`

Fires when another app passed or took a Facebook or Instagram conversation (Meta's handover webhook). The chat's `metadata.thread_control` is updated before the event is sent. See [Thread control](/reference/direct-messages/#thread-control).

```json
{
  "id": "whevt_thc01",
  "object": "event",
  "type": "chat.thread_control_changed",
  "created_at": "2026-10-27T12:00:00Z",
  "data": {
    "object": {
      "chat": {
        "id": "chat_fb123",
        "profile_id": "prof_abc123",
        "platform": "facebook",
        "participant_external_id": "psid_123",
        "metadata": {
          "thread_control": { "owner_app_id": "263902037430900", "expires_at": null, "updated_at": "2026-10-27T12:00:00Z" }
        }
      },
      "previous_owner_app_id": "1234567890",
      "new_owner_app_id": "263902037430900",
      "metadata": "escalated to support",
      "occurred_at": "2026-10-27T12:00:00Z"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.chat` | object | The full [chat object](/reference/direct-messages/#chat-object-fields), with `metadata.thread_control` already updated |
| `data.object.previous_owner_app_id` | string | Meta app ID that held the conversation. Absent when the conversation was idle |
| `data.object.new_owner_app_id` | string | Meta app ID that now controls the conversation |
| `data.object.metadata` | string | Note the other app attached to the handover, when present |
| `data.object.occurred_at` | string | ISO 8601 time of the handover |

#### `chat.thread_control_requested`

Fires when another app asks Postproxy to pass a Facebook or Instagram conversation. Nothing changes until you call [`pass_thread_control`](/reference/direct-messages/#thread-control) or `release_thread_control`.

```json
{
  "id": "whevt_thr01",
  "object": "event",
  "type": "chat.thread_control_requested",
  "created_at": "2026-10-27T12:05:00Z",
  "data": {
    "object": {
      "chat": {
        "id": "chat_fb123",
        "profile_id": "prof_abc123",
        "platform": "facebook",
        "participant_external_id": "psid_123"
      },
      "requested_owner_app_id": "263902037430900",
      "metadata": "customer asked for a human",
      "occurred_at": "2026-10-27T12:05:00Z"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.object.chat` | object | The full [chat object](/reference/direct-messages/#chat-object-fields) |
| `data.object.requested_owner_app_id` | string | Meta app ID asking for control |
| `data.object.metadata` | string | Note the requesting app attached, when present |
| `data.object.occurred_at` | string | ISO 8601 time of the request |

---

## Signature verification

Every webhook request includes an `X-Postproxy-Signature` header for verifying that the request came from Postproxy.

The signature format is:

```
t=1705312200,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

- `t` — Unix timestamp when the signature was generated
- `v1` — HMAC-SHA256 hex digest

The signed payload is `{timestamp}.{body}` where `body` is the raw JSON request body.

### Verification examples

**Ruby**
```ruby
def verify_webhook(payload, signature_header, secret)
  parts = signature_header.split(",").map { |p| p.split("=", 2) }.to_h
  timestamp = parts["t"]
  expected = parts["v1"]

  signed_payload = "#{timestamp}.#{payload}"
  computed = OpenSSL::HMAC.hexdigest("SHA256", secret, signed_payload)

  ActiveSupport::SecurityUtils.secure_compare(computed, expected)
end
```

**Node.js**
```javascript
const crypto = require("crypto");

function verifyWebhook(payload, signatureHeader, secret) {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=", 2))
  );
  const timestamp = parts.t;
  const expected = parts.v1;

  const signedPayload = `${timestamp}.${payload}`;
  const computed = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(expected)
  );
}
```

**Python**
```python
import hmac
import hashlib

def verify_webhook(payload: str, signature_header: str, secret: str) -> bool:
    parts = dict(p.split("=", 1) for p in signature_header.split(","))
    timestamp = parts["t"]
    expected = parts["v1"]

    signed_payload = f"{timestamp}.{payload}"
    computed = hmac.new(
        secret.encode(), signed_payload.encode(), hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(computed, expected)
```

---

## Retry policy

If your endpoint returns a non-2xx status code or the request fails, Postproxy retries the delivery up to 5 times with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |

After all attempts are exhausted, the delivery is marked as failed. You can view delivery history via the API.

Your endpoint should return a `2xx` response within 30 seconds. Connections that take longer than 10 seconds to establish will time out.

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/webhooks` | List all webhooks |
| `GET` | `/api/webhooks/:id` | Get a single webhook |
| `POST` | `/api/webhooks` | Create a webhook |
| `PATCH` | `/api/webhooks/:id` | Update a webhook |
| `DELETE` | `/api/webhooks/:id` | Delete a webhook |
| `GET` | `/api/webhooks/:id/deliveries` | List delivery attempts |

---

## List webhooks

<span class="method get">GET</span> `/api/webhooks`

### Example

```bash
curl -X GET "https://api.postproxy.dev/api/webhooks" \
  -H "Authorization: Bearer your_api_key"
```

### Response

```json
{
  "data": [
    {
      "id": "wh_abc123",
      "url": "https://example.com/webhooks",
      "events": ["post.processed", "platform_post.published"],
      "enabled": true,
      "description": "Production webhook",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## Get webhook

<span class="method get">GET</span> `/api/webhooks/:id`

### Example

```bash
curl -X GET "https://api.postproxy.dev/api/webhooks/wh_abc123" \
  -H "Authorization: Bearer your_api_key"
```

### Response

```json
{
  "id": "wh_abc123",
  "url": "https://example.com/webhooks",
  "events": ["post.processed", "platform_post.published"],
  "enabled": true,
  "description": "Production webhook",
  "secret": "whsec_a1b2c3d4e5f6...",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

The `secret` field is only included when fetching a single webhook or immediately after creation.

---

## Create webhook

<span class="method post">POST</span> `/api/webhooks`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | HTTPS URL to receive webhook events |
| `events` | array | Yes | Event types to subscribe to (use `["*"]` for all) |
| `description` | string | No | Description for the webhook |

### Example

```bash
curl -X POST "https://api.postproxy.dev/api/webhooks" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/webhooks",
    "events": ["post.processed", "platform_post.published"],
    "description": "Production webhook"
  }'
```

### Response (201 Created)

```json
{
  "id": "wh_abc123",
  "url": "https://example.com/webhooks",
  "events": ["post.processed", "platform_post.published"],
  "enabled": true,
  "description": "Production webhook",
  "secret": "whsec_a1b2c3d4e5f6...",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

:::tip
Save the `secret` from the response — you'll need it to verify webhook signatures. It's only shown on creation and when fetching a single webhook.
:::

---

## Update webhook

<span class="method patch">PATCH</span> `/api/webhooks/:id`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | No | New HTTPS URL |
| `events` | array | No | New event types |
| `enabled` | boolean | No | Enable or disable the webhook |
| `description` | string | No | Updated description |

### Example

```bash
curl -X PATCH "https://api.postproxy.dev/api/webhooks/wh_abc123" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false
  }'
```

### Response

```json
{
  "id": "wh_abc123",
  "url": "https://example.com/webhooks",
  "events": ["post.processed", "platform_post.published"],
  "enabled": false,
  "description": "Production webhook",
  "secret": "whsec_a1b2c3d4e5f6...",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

---

## Delete webhook

<span class="method delete">DELETE</span> `/api/webhooks/:id`

### Example

```bash
curl -X DELETE "https://api.postproxy.dev/api/webhooks/wh_abc123" \
  -H "Authorization: Bearer your_api_key"
```

### Response

```json
{
  "deleted": true
}
```

---

## List deliveries

<span class="method get">GET</span> `/api/webhooks/:id/deliveries`

Retrieve delivery attempts for a specific webhook, useful for debugging.

### Query parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | `1` | Page number (1-based). Passing `0` returns page `1` |
| `per_page` | integer | No | `20` | Number of deliveries per page |

### Example

```bash
curl -X GET "https://api.postproxy.dev/api/webhooks/wh_abc123/deliveries" \
  -H "Authorization: Bearer your_api_key"
```

### Response

```json
{
  "total": 15,
  "page": 1,
  "per_page": 20,
  "data": [
    {
      "id": "abc123",
      "event_id": "whevt_abc123",
      "event_type": "post.processed",
      "response_status": 200,
      "attempt_number": 1,
      "success": true,
      "attempted_at": "2025-01-15T10:30:01Z",
      "created_at": "2025-01-15T10:30:01Z"
    }
  ]
}
```

---

# mcp-server

The Postproxy MCP Server provides tools for publishing posts, checking statuses, managing social media profiles, and retrieving post statistics. This server implements the Model Context Protocol (MCP) so AI clients—Claude, ChatGPT, Claude Code, and other MCP-aware tools—can drive your social workflow directly.

There are three ways to connect:

- **One-click connector** for Claude (Desktop, web & mobile) and ChatGPT — sign in with Postproxy, no API key.
- **Hosted remote MCP** for Claude Code and other CLIs — the same URL with your API key.
- **Local `postproxy-mcp` npm package** over stdio transport.

All three expose the same tools.

:::note
**Connector / remote MCP:** no Node.js or npm install required. The connector flow signs you in over OAuth; the Claude Code flow uses your API key. **Local package:** requires Node.js >= 18.0.0 and a valid Postproxy API key.
:::

---

## Connect Claude or ChatGPT (no API key)

Claude (Desktop, web, and mobile) and ChatGPT connect to Postproxy over OAuth—sign in with your Postproxy account and you're done. There's no API key to copy and nothing to install.

**Claude — Desktop, web & mobile**

Postproxy is listed in the Claude connector directory, so there's no custom connector to add.

1. Open [claude.ai/directory/connectors/postproxy](https://claude.ai/directory/connectors/postproxy).
2. Click **Connect** and sign in with Postproxy to authorize access.
3. Ask Claude: *"Connect my Instagram account"* — it returns a link to link the profile.

**ChatGPT**

Use the plugin URL:

<Code code={`https://mcp.postproxy.dev/mcp`} lang="text" />

1. Open **Settings → Security and login** and turn on **Developer mode**.
2. Go to [chatgpt.com/plugins](https://chatgpt.com/plugins), click **+**, and paste the URL above as the MCP server URL.
3. Sign in with Postproxy when prompted to authorize access.

:::note
This sign-in flow is for Claude apps and ChatGPT. **Claude Code** uses the API-key setup in [Remote MCP](#remote-mcp) below.
:::

Postproxy is also published in the official **MCP registry** as `dev.postproxy/postproxy`, so registry-aware clients can discover and add it directly.

---

## Remote MCP

Postproxy runs the MCP server for you at a public HTTPS endpoint. Point your client at that URL and authenticate with your API key. You skip installing Node, `postproxy-mcp`, and maintaining a local stdio process.

### Claude Code

Register the hosted server with HTTP transport:

<Code code={`claude mcp add --transport http postproxy \\
  https://mcp.postproxy.dev/mcp?api_key=YOUR_KEY`} lang="bash" />

Replace `YOUR_KEY` with your Postproxy API key.

### Authentication

- **Query parameter:** append `api_key=YOUR_KEY` to the MCP URL (as in the example above).
- **Header:** alternatively, many clients can send `X-Postproxy-API-Key: YOUR_KEY` instead of putting the key in the URL.

Use whichever method your MCP client supports.

### After connecting

1. Restart your Claude Code session if the client requires it.
2. Test with a prompt such as: “Check my Postproxy authentication status.”
3. If the Postproxy tools appear, you can publish and manage posts the same way as with the local server.

---

## Installation

### Global Installation

Install the MCP server globally using npm:

<Code code={`npm install -g postproxy-mcp`} lang="bash" />

### Local Installation

Install the MCP server locally in your project:

<Code code={`npm install postproxy-mcp`} lang="bash" />

Claude Code stores MCP server configuration under `~/.claude/plugins/`. After installing postproxy-mcp, Claude will automatically detect the server on restart.

---

## Configuration

The steps below apply to the **local** `postproxy-mcp` package (stdio transport). If you use the [hosted remote MCP](#remote-mcp) instead, you only need the HTTP URL and API key—no `npm install` or env vars on your machine.

### Register MCP Server

After installing postproxy-mcp, register it with Claude Code using the `claude mcp add` command:

<Code code={`claude mcp add --transport stdio postproxy-mcp --env POSTPROXY_API_KEY=your-api-key --env POSTPROXY_BASE_URL=https://api.postproxy.dev/api -- postproxy-mcp`} lang="bash" />

Replace `your-api-key` with your actual Postproxy API key.

The configuration will be automatically saved to `~/.claude/plugins/`. After running this command:

1. Restart your Claude Code session
2. Test the connection by asking Claude: "Check my Postproxy authentication status"
3. If tools are available, Claude will be able to use them automatically

### Alternative: Interactive Setup

For non-technical users, you can use the interactive setup command:

<Tabs>
  <TabItem label="Command">
    <Code code={`postproxy-mcp setup`} lang="bash" />
  </TabItem>
  <TabItem label="Alternative">
    <Code code={`postproxy-mcp-setup`} lang="bash" />
  </TabItem>
</Tabs>

This will guide you through the setup process step by step and register the server using `claude mcp add` automatically.

---

## Available Tools

The MCP server provides the following tools for interacting with Postproxy:

| Tool | Description |
|------|-------------|
| `auth_status` | Check authentication status and API configuration |
| `summary_get` | One activity snapshot: what went out, how it performed, what came in, what's awaiting a reply |
| `profile_groups_list` | List all profile groups accessible with your API key |
| `profiles_list` | List all available social media profiles |
| `profiles_placements` | List available placements for a profile (Facebook pages, LinkedIn orgs, Pinterest boards) |
| `profiles_stats` | Get follower/engagement timeseries (daily snapshots) for a profile |
| `post_publish` | Publish a post to specified profiles |
| `post_status` | Get status of a published post by post ID |
| `post_update` | Update an existing draft or scheduled post |
| `post_publish_draft` | Publish a draft post |
| `post_delete` | Delete a post by post ID |
| `post_delete_on_platform` | Delete a post from a specific platform without removing it from Postproxy |
| `post_stats` | Get stats snapshots for one or more posts |
| `queues_list` | List all posting queues |
| `queues_get` | Get details of a single posting queue |
| `queues_create` | Create a new posting queue with weekly timeslots |
| `queues_update` | Update a queue's settings, timeslots, or pause/unpause it |
| `queues_delete` | Delete a posting queue |
| `queues_next_slot` | Get the next available timeslot for a queue |
| `comments_list` | List comments on a published post |
| `comments_get` | Get a single comment with its replies |
| `comments_create` | Create a comment or reply on a published post |
| `comments_delete` | Delete a comment from the platform |
| `comments_hide` | Hide a comment on the platform |
| `comments_unhide` | Unhide a previously hidden comment |
| `comments_like` | Like a comment on the platform |
| `comments_unlike` | Remove a like from a comment |
| `dm_chats_list` | List direct-message chats for a profile |
| `dm_chat_create` | Find or create a chat with a participant |
| `dm_chat_get` | Get a single chat |
| `dm_messages_list` | List messages in a chat |
| `dm_message_send` | Send an outbound direct message |
| `dm_message_get` | Get a single message |
| `dm_message_edit` | Edit an outbound message (Telegram only) |
| `dm_message_react` | React to a message (Facebook & Instagram) |
| `dm_message_unreact` | Remove your reaction from a message |
| `dm_chat_archive` | Archive (mute) a chat (Bluesky only) |
| `dm_chat_unarchive` | Unarchive (unmute) a chat (Bluesky only) |
| `dm_comment_private_reply` | DM the author of a comment |
| `profile_comments_list` | List Google Business reviews for a profile, optionally one location |
| `profile_comments_get` | Get a single review or reply |
| `profile_comments_create` | Reply to a review |
| `profile_comments_delete` | Delete your reply to a review (the review stays) |
| `google_business_location_get` | Read a Business Profile location: name, description, phones, categories, address, hours, metadata |
| `google_business_location_update` | Update location fields (field-masked) |
| `google_business_categories_list` | Resolve category resource names for a region; `FULL` view includes service and hours types |
| `google_business_hours_update` | Set regular, special (holiday), or named extra hours |
| `google_business_attributes_available` | List the attributes a location can set, with value types |
| `google_business_attributes_get` | Read the attributes currently set |
| `google_business_attributes_update` | Set or clear attributes |
| `google_business_service_list_get` | Read the service list |
| `google_business_service_list_update` | Replace the service list |
| `google_business_food_menus_get` | Read food menus (restaurant-type locations) |
| `google_business_food_menus_update` | Replace food menus |
| `google_business_place_action_links_list` | List action buttons ("Order online", "Book") |
| `google_business_place_action_types_available` | List the action types the location accepts |
| `google_business_place_action_link_create` | Add an action button |
| `google_business_place_action_link_update` | Change an action button's URL, type, or preferred flag |
| `google_business_place_action_link_delete` | Remove an action button |
| `google_business_media_list` | List profile photos and videos |
| `google_business_media_create` | Add a photo or video by public URL, with a category |
| `google_business_media_delete` | Remove a profile photo or video |
| `history_list` | List recent post jobs |

---

## Authentication Tools

### `auth_status`

Check authentication status, API configuration, and workspace information.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| None | - | - | This tool requires no parameters |

#### Response

<Code code={`{
  "authenticated": true,
  "base_url": "https://api.postproxy.dev/api",
  "profile_groups_count": 2
}`} lang="json" />

#### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `authenticated` | boolean | Whether the API key is valid and authenticated |
| `base_url` | string | Base URL of the Postproxy API |
| `profile_groups_count` | integer | Number of profile groups in the account |

---

## Activity Summary

### `summary_get`

Answers "what's the status?" in one call, so an assistant doesn't have to fan out across `history_list`, `comments_list` and `dm_chats_list` and aggregate the pages itself. Returns, for a time window: posts published and failed (plus what's scheduled next), engagement totals, comments and reviews received, and DM volume — each broken down per network where that makes sense. Alongside the volume it returns what's still waiting on you: comments and reviews with no reply from you, and chats whose newest message is inbound.

Read-only, and scoped like every other tool — your key's profile group, or every group an account-wide key can reach.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `window` | string | No | Time window: `24h` (default), `7d`, or `30d` |
| `from` | string | No | Start of an explicit range (ISO 8601, or a bare date meaning that date's start of day). Overrides `window` |
| `to` | string | No | End of an explicit range. Defaults to now when only `from` is given |
| `profile_group_id` | string | No | Restrict to one profile group. Ignored by group-scoped keys, which are already restricted |

#### Response

<Code code={`{
  "window": {
    "label": "24h",
    "from": "2026-08-17T09:00:00Z",
    "to": "2026-08-18T09:00:00Z",
    "previous_from": "2026-08-16T09:00:00Z",
    "backlog_from": "2026-07-19T09:00:00Z"
  },
  "posts": {
    "published": 4,
    "published_previous": 3,
    "failed": 1,
    "scheduled_ahead": 6,
    "next_scheduled_at": "2026-08-18T14:00:00Z",
    "by_platform": {
      "instagram": { "published": 4, "failed": 0 },
      "linkedin": { "published": 3, "failed": 1 }
    }
  },
  "engagement": {
    "total": { "impressions": 48210, "likes": 1204, "comments": 96, "shares": 41 },
    "by_platform": {
      "instagram": { "impressions": 31002, "likes": 900, "comments": 61 },
      "linkedin": { "impressions": 17208, "likes": 304, "comments": 35 }
    },
    "posts_with_insights": 14
  },
  "comments": {
    "received": 96,
    "received_previous": 71,
    "awaiting_reply": 12,
    "by_platform": { "instagram": 61, "facebook": 35 }
  },
  "reviews": {
    "received": 7,
    "received_previous": 4,
    "awaiting_reply": 3
  },
  "dms": {
    "inbound": 41,
    "outbound": 33,
    "chats_awaiting_reply": 5,
    "reply_window_closing": 2
  },
  "api": {
    "calls": 812,
    "calls_previous": 640
  }
}`} lang="json" />

#### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `window.label` | string\|null | The `window` in effect, or `null` when you passed `from` / `to` |
| `window.from` / `window.to` | string | The range every windowed count covers |
| `window.previous_from` | string\|null | Start of the preceding window of equal length; `null` for an explicit range |
| `window.backlog_from` | string | How far back the `awaiting_reply` counts look (30 days) |
| `posts.published` / `posts.failed` | integer | Posts with at least one delivery that succeeded / failed in the window |
| `posts.scheduled_ahead` | integer | Non-draft posts scheduled after now. Looks forward, not window-bound |
| `posts.next_scheduled_at` | string\|null | When the soonest of those goes out |
| `posts.by_platform` | object | Per-network **deliveries**, not posts: a 3-item X thread is 3 under `twitter` |
| `engagement.total` | object | Every metric summed across networks. Metric names vary by network — treat it as an open map |
| `engagement.by_platform` | object | The same, split by network |
| `engagement.posts_with_insights` | integer | How many deliveries had a stats snapshot to contribute |
| `engagement.insights_capped_at` | integer | Only present when the window held more deliveries than are aggregated (500, newest first) |
| `comments.received` | integer | Comments received in the window, replies included, excluding your own |
| `comments.awaiting_reply` | integer | Top-level, non-hidden comments with no reply from you |
| `reviews.*` | object | Same shape for profile-level reviews (Google Business today) |
| `dms.inbound` / `dms.outbound` | integer | Messages received / sent in the window |
| `dms.chats_awaiting_reply` | integer | Chats whose newest message is inbound. Current state, not window-bound |
| `dms.reply_window_closing` | integer | Of those, how many have under 6 hours of [messaging window](/reference/direct-messages/#messaging-window) left |
| `api.calls` / `api.calls_previous` | integer | API requests your account made, this window and the preceding one |

Every `*_previous` field is a plain count over the preceding window of equal length — no percentages are computed for you. They are all `null` when you pass `from` / `to`, since an arbitrary range has no obvious predecessor.

#### Two things that read differently

- **`engagement` is lifetime-to-date for posts published in the window**, not engagement earned during it — it sums each post's latest stats snapshot. A post published an hour ago reports an hour of data; one published six days ago reports six days. `engagement` is `null` when insights are off for the account, and `dms` is `null` when DMs are.
- **The `awaiting_reply` counts describe current state**, so they don't move when you change `window` — `window=24h` still returns everything waiting on you, looking back 30 days (returned as `window.backlog_from`). There's no read/unread state, so a chat you've read and deliberately left alone still counts.

Post counts are posts — a post sent to three networks counts once, and a thread counts once — while `by_platform` counts per-network deliveries.

---

## Profile Management

### `profile_groups_list`

List all profile groups accessible with your API key. Profile groups are organizational containers (e.g. per brand or client) that hold related profiles. Use a group's `id` to filter `profiles_list` by `profile_group_id`.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| None | - | - | This tool requires no parameters |

#### Response

<Code code={`{
  "profile_groups": [
    {
      "id": "grp123abc",
      "name": "Main Brand",
      "profiles_count": 4
    }
  ]
}`} lang="json" />

---

### `profiles_list`

List all available social media profiles (targets) for posting.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_group_id` | string | No | If provided, only profiles in this group are returned (use `profile_groups_list` to find group IDs) |

#### Response

<Code code={`{
  "targets": [
    {
      "id": "profile-123",
      "name": "My Twitter Account",
      "platform": "twitter",
      "profile_group_id": 1
    }
  ]
}`} lang="json" />

#### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `targets` | array | Array of available profile objects |
| `targets[].id` | string | Unique profile identifier |
| `targets[].name` | string | Display name of the connected account |
| `targets[].platform` | string | Platform identifier (twitter, facebook, instagram, etc.) |
| `targets[].profile_group_id` | integer | ID of the profile group this profile belongs to |

---

### `profiles_placements`

List available placements for a profile. For Facebook profiles, placements are business pages. For LinkedIn profiles, placements include the personal profile and organizations. For Pinterest profiles, placements are boards. For Telegram profiles, placements are channels. For Google Business profiles, placements are locations, returned as full resource paths `accounts/X/locations/Y` to pass as `location_id`. Available for `facebook`, `linkedin`, `pinterest`, `telegram`, and `google_business` profiles.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |

#### Response (LinkedIn example)

<Code code={`{
  "placements": [
    {
      "id": null,
      "name": "Personal Profile"
    },
    {
      "id": "108520199",
      "name": "Acme Marketing"
    }
  ]
}`} lang="json" />

#### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `placements` | array | Array of placement objects |
| `placements[].id` | string\|null | Placement identifier (null for personal profiles) |
| `placements[].name` | string | Display name of the placement |

:::note
If no placement is specified when creating a post:
- **LinkedIn**: defaults to the personal profile
- **Facebook**: defaults to a random connected page (if only one page is connected, no need to set a placement ID)
- **Pinterest**: it fails
:::

---

## Post Management

### `post_publish`

Publish a post to specified social media profiles. Supports text content, media attachments, scheduling, drafts, threads (X and Threads only), and platform-specific customization.

#### Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `content` | string | Yes | - | Post content text |
| `profiles` | string[] | Yes | - | Array of profile IDs or platform names (e.g., `"linkedin"`, `"instagram"`, `"twitter"`). When using platform names, posts to the first connected profile for that platform. |
| `schedule` | string | No | - | ISO 8601 scheduled time. Do not use together with `queue_id`. |
| `media` | string[] | No | - | Array of media URLs or local file paths (absolute, relative, or `~/` paths) |
| `idempotency_key` | string | No | - | Idempotency key for deduplication |
| `require_confirmation` | boolean | No | `false` | If true, return summary without publishing (dry run) |
| `draft` | boolean | No | `false` | If true, creates a draft post that won't publish automatically |
| `thread` | array | No | - | Array of thread child posts (X/Twitter and Threads only). Each item has `body` (string, required) and `media` (string[], optional). The parent post is published first, then each child is published as a reply in order. |
| `queue_id` | string | No | - | Queue ID to add the post to. The queue will automatically assign a timeslot. Do not use together with `schedule`. |
| `queue_priority` | string | No | `"medium"` | Priority when adding to a queue: `"high"`, `"medium"`, or `"low"`. Higher priority posts get earlier timeslots. |
| `platforms` | object | No | - | Platform-specific parameters. Key is platform name (e.g., "instagram", "youtube", "tiktok"), value is object with platform-specific options. See [Platform Parameters Reference](/reference/platforms/) for full documentation. |

#### Platform Parameters Example

<Code code={`{
  "instagram": {
    "format": "reel",
    "collaborators": ["username1", "username2"],
    "first_comment": "Link in bio!"
  },
  "youtube": {
    "title": "My Video Title",
    "privacy_status": "public"
  },
  "tiktok": {
    "privacy_status": "PUBLIC_TO_EVERYONE",
    "auto_add_music": true
  }
}`} lang="json" />

#### Response

<Code code={`{
  "post_id": "job-123",
  "status": "pending",
  "draft": true,
  "scheduled_at": null,
  "created_at": "2024-01-01T12:00:00Z"
}`} lang="json" />

#### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `post_id` | string | Unique post identifier for tracking the post |
| `status` | string | Initial status of the post: `pending`, `processing`, `processed` |
| `draft` | boolean | Whether the post was created as a draft |
| `scheduled_at` | string\|null | ISO 8601 timestamp if scheduled |
| `created_at` | string | ISO 8601 timestamp when the post was created |
| `warning` | string\|null | Warning message if the API may have ignored the draft parameter |

:::note
If you request a draft post (`draft: true`) but the API returns `draft: false`, a `warning` field will be included in the response indicating that the API may have ignored the draft parameter. This can happen if the API does not support drafts with certain parameters (e.g., media attachments) or under specific conditions.
:::

---

### `post_status`

Get status of a published post by post ID.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_id` | string | Yes | Post ID from post.publish response |

#### Response

<Code code={`{
  "post_id": "job-123",
  "overall_status": "complete",
  "draft": false,
  "status": "processed",
  "platforms": [
    {
      "platform": "twitter",
      "status": "published",
      "url": "https://twitter.com/status/123",
      "post_id": "123",
      "error": null,
      "attempted_at": "2024-01-01T12:00:00Z"
    }
  ]
}`} lang="json" />

#### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `post_id` | string | Postproxy post identifier |
| `overall_status` | string | Overall status: `draft`, `pending`, `processing`, `complete`, `failed`, `media_processing_failed` |
| `draft` | boolean | Whether the post is a draft |
| `status` | string | Post status: `pending`, `processing`, `processed`, `draft`, `scheduled`, `media_processing_failed` |
| `platforms` | array | Array of platform-specific posting results |
| `platforms[].platform` | string | Platform identifier |
| `platforms[].status` | string | Platform posting status: `pending`, `processing`, `published`, `failed`, `deleted` |
| `platforms[].url` | string\|null | URL of the published post (if available) |
| `platforms[].post_id` | string\|null | Platform-specific post ID (if available) |
| `platforms[].error` | string\|null | Error message if publishing failed (null if successful) |
| `platforms[].attempted_at` | string | ISO 8601 timestamp when posting was attempted |
| `platforms[].insights` | object\|null | Platform-specific insights (if available) |
| `media` | array\|undefined | Array of media objects (only present if the post has media) |
| `thread` | array\|undefined | Array of thread child posts (only present if the post has thread children) |

---

### `post_update`

Update an existing post. Only drafts or scheduled posts (more than 5 minutes before publish) can be updated. Only send fields you want to change — omitted fields are left unchanged.

#### Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `post_id` | string | Yes | - | Post ID to update |
| `content` | string | No | - | Updated text content |
| `profiles` | string[] | No | - | Replace all profiles (array of profile IDs or platform names). Full replace — omit to keep existing. |
| `schedule` | string | No | - | Updated ISO 8601 scheduled time |
| `draft` | boolean | No | - | Set or unset draft status |
| `media` | string[] | No | - | Replace all media (array of media URLs). Full replace — send empty array to remove all. Omit to keep existing. |
| `platforms` | object | No | - | Platform-specific parameters (merged with existing). Same structure as `post_publish`. |
| `thread` | array | No | - | Replace all thread children (full replace). Send empty array to remove all. Omit to keep existing. |
| `queue_id` | string | No | - | Queue ID to assign the post to |
| `queue_priority` | string | No | - | Queue priority: `"high"`, `"medium"`, or `"low"` |

#### Response

<Code code={`{
  "post_id": "job-123",
  "status": "draft",
  "draft": true,
  "scheduled_at": null,
  "created_at": "2024-01-01T12:00:00Z",
  "message": "Post updated successfully"
}`} lang="json" />

#### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `post_id` | string | Post identifier |
| `status` | string | Post status after update |
| `draft` | boolean | Whether the post is a draft |
| `scheduled_at` | string\|null | ISO 8601 timestamp if scheduled |
| `created_at` | string | ISO 8601 timestamp when the post was created |
| `message` | string | Success message |

---

### `post_delete`

Delete a post by post ID.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_id` | string | Yes | Post ID to delete |

#### Response

<Code code={`{
  "post_id": "job-123",
  "deleted": true
}`} lang="json" />

#### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `post_id` | string | Post identifier that was deleted |
| `deleted` | boolean | Whether the deletion was successful |

---

### `post_publish_draft`

Publish a draft post. Only posts with `draft: true` status can be published using this endpoint.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_id` | string | Yes | Post ID of the draft post to publish |

#### Response

<Code code={`{
  "post_id": "job-123",
  "status": "processed",
  "draft": false,
  "scheduled_at": null,
  "created_at": "2024-01-01T12:00:00Z",
  "message": "Draft post published successfully"
}`} lang="json" />

#### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `post_id` | string | Post identifier |
| `status` | string | Post status after publishing |
| `draft` | boolean | Will be `false` after publishing |
| `scheduled_at` | string\|null | ISO 8601 timestamp if scheduled |
| `created_at` | string | ISO 8601 timestamp when the post was created |
| `message` | string | Success message |

---

### `post_stats`

Get stats snapshots for one or more posts. Returns all matching snapshots so you can see trends over time. Supports filtering by profiles/networks and timespan.

#### Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `post_ids` | string[] | Yes | - | Array of post IDs (max 50) |
| `profiles` | string | No | - | Comma-separated list of profile IDs or network names (e.g. `instagram,twitter` or `abc123,def456` or mixed) |
| `from` | string | No | - | ISO 8601 timestamp — only include snapshots recorded at or after this time |
| `to` | string | No | - | ISO 8601 timestamp — only include snapshots recorded at or before this time |

#### Response

<Code code={`{
  "data": {
    "abc123": {
      "platforms": [
        {
          "profile_id": "prof_abc",
          "platform": "instagram",
          "records": [
            {
              "stats": {
                "impressions": 1200,
                "likes": 85,
                "comments": 12,
                "saved": 8
              },
              "recorded_at": "2026-02-20T12:00:00Z"
            }
          ]
        }
      ]
    }
  }
}`} lang="json" />

#### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | object | Object keyed by post ID |
| `data[].platforms` | array | Array of platform-specific stats |
| `data[].platforms[].profile_id` | string | Profile identifier |
| `data[].platforms[].platform` | string | Platform name |
| `data[].platforms[].records` | array | Array of stat snapshots over time |
| `data[].platforms[].records[].stats` | object | Stats object (fields vary by platform) |
| `data[].platforms[].records[].recorded_at` | string | ISO 8601 timestamp when stats were recorded |

#### Stats fields by platform

| Platform | Available Fields |
|----------|-----------------|
| Instagram | `impressions`, `likes`, `comments`, `saved`, `profile_visits`, `follows` |
| Facebook | `impressions`, `clicks`, `likes` |
| Threads | `impressions`, `likes`, `replies`, `reposts`, `quotes`, `shares` |
| Twitter | `impressions`, `likes`, `retweets`, `comments`, `quotes`, `saved` |
| YouTube | `impressions`, `likes`, `comments`, `saved` |
| LinkedIn | `impressions` |
| TikTok | `impressions`, `likes`, `comments`, `shares` |
| Pinterest | `impressions`, `likes`, `comments`, `saved`, `outbound_clicks` |

:::note
Instagram stories do not return stats. TikTok stats require the post to have a public ID.
:::

---

## History

### `history_list`

List recent post jobs.

#### Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `limit` | number | No | `10` | Maximum number of jobs to return |

#### Response

<Code code={`{
  "jobs": [
    {
      "post_id": "job-123",
      "content_preview": "Post content preview...",
      "created_at": "2024-01-01T12:00:00Z",
      "overall_status": "complete",
      "draft": false,
      "platforms_count": 2
    }
  ]
}`} lang="json" />

#### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `jobs` | array | Array of job objects |
| `jobs[].post_id` | string | Unique post identifier |
| `jobs[].content_preview` | string | Preview of the post content |
| `jobs[].created_at` | string | ISO 8601 timestamp when the job was created |
| `jobs[].overall_status` | string | Overall status of the job |
| `jobs[].draft` | boolean | Whether the post is a draft |
| `jobs[].platforms_count` | integer | Number of platforms the post was published to |

---

## Queue Management

Queues automatically schedule posts into recurring weekly timeslots with priority-based ordering.

### `queues_list`

List all posting queues.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_group_id` | string | No | Filter queues by profile group |

#### Response

<Code code={`{
  "queues": [
    {
      "id": "q1abc",
      "name": "Morning Posts",
      "description": "Daily morning content",
      "timezone": "America/New_York",
      "enabled": true,
      "jitter": 10,
      "profile_group_id": "pg123",
      "timeslots": ["Monday at 09:00 (id: 1)", "Wednesday at 09:00 (id: 2)"],
      "posts_count": 5
    }
  ]
}`} lang="json" />

---

### `queues_get`

Get details of a single posting queue including its timeslots and post count.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `queue_id` | string | Yes | Queue ID |

---

### `queues_create`

Create a new posting queue with weekly timeslots.

#### Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `profile_group_id` | string | Yes | - | Profile group ID to connect the queue to (use `profiles_list` to find this) |
| `name` | string | Yes | - | Queue name |
| `description` | string | No | - | Optional description |
| `timezone` | string | No | `"UTC"` | IANA timezone name (e.g. `"America/New_York"`) |
| `jitter` | number | No | `0` | Random offset in minutes (0-60) applied to scheduled times for natural posting patterns |
| `timeslots` | array | No | - | Initial weekly timeslots. Each object has `day` (0=Sunday through 6=Saturday) and `time` (24-hour `HH:MM` format). |

#### Example

<Code code={`{
  "profile_group_id": "pg123",
  "name": "Weekday Mornings",
  "timezone": "America/New_York",
  "jitter": 10,
  "timeslots": [
    { "day": 1, "time": "09:00" },
    { "day": 2, "time": "09:00" },
    { "day": 3, "time": "09:00" },
    { "day": 4, "time": "09:00" },
    { "day": 5, "time": "09:00" }
  ]
}`} lang="json" />

---

### `queues_update`

Update a queue's settings, timeslots, or pause/unpause it. Changes to timezone or timeslots trigger rearrangement of all queued posts.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `queue_id` | string | Yes | Queue ID to update |
| `name` | string | No | New queue name |
| `description` | string | No | New description |
| `timezone` | string | No | IANA timezone name |
| `enabled` | boolean | No | Set to `false` to pause the queue, `true` to unpause |
| `jitter` | number | No | Random offset in minutes (0-60) |
| `timeslots` | array | No | Timeslots to add or remove. To add: `{ "day": 1, "time": "09:00" }`. To remove: `{ "id": 42, "_destroy": true }`. |

---

### `queues_delete`

Delete a posting queue. Posts in the queue will have their queue reference removed but will not be deleted.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `queue_id` | string | Yes | Queue ID to delete |

---

### `queues_next_slot`

Get the next available timeslot for a queue.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `queue_id` | string | Yes | Queue ID |

#### Response

<Code code={`{
  "next_slot": "2026-03-11T14:00:00Z"
}`} lang="json" />

---

### Adding Posts to a Queue

When publishing a post with `post_publish`, you can add it to a queue instead of scheduling it manually using the `queue_id` and `queue_priority` parameters:

<Code code={`{
  "content": "Queued post content",
  "profiles": ["twitter", "linkedin"],
  "queue_id": "q1abc",
  "queue_priority": "high"
}`} lang="json" />

---

## Comment Management

### `comments_list`

List comments on a published post. Returns paginated top-level comments with nested replies.

#### Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `post_id` | string | Yes | - | Post ID |
| `profile_id` | string | Yes | - | Profile ID to identify which platform's comments to retrieve |
| `page` | number | No | `1` | Page number, 1-based. Passing `0` returns page `1` |
| `per_page` | number | No | `20` | Number of top-level comments per page |

#### Response

<Code code={`{
  "total": 42,
  "page": 1,
  "per_page": 20,
  "data": [
    {
      "id": "cmt_abc123",
      "external_id": "17858893269123456",
      "body": "Great post!",
      "status": "synced",
      "author_username": "someuser",
      "like_count": 3,
      "is_hidden": false,
      "posted_at": "2026-03-25T10:00:00.000Z",
      "replies": [
        {
          "id": "cmt_def456",
          "body": "Thanks!",
          "author_username": "author",
          "parent_external_id": "17858893269123456"
        }
      ]
    }
  ]
}`} lang="json" />

Comment objects may also include a `metadata` object (author signals such as `follower_count` and verification, on Instagram) and an `attachments` array (media on the comment — `image`, `video`, `audio`, `gif`, `external`, `file` — each with `id`, `type`, `url`, `status`, `external_id`). Attachments are populated for Facebook, Threads, and Bluesky; Instagram, YouTube, and LinkedIn comments are text-only, so the array is empty.

---

### `comments_get`

Get a single comment with its replies.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_id` | string | Yes | Post ID |
| `comment_id` | string | Yes | Comment ID (Postproxy ID or platform external ID) |
| `profile_id` | string | Yes | Profile ID |

---

### `comments_create`

Create a comment or reply on a published post. The comment is published to the platform asynchronously.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_id` | string | Yes | Post ID |
| `profile_id` | string | Yes | Profile ID |
| `text` | string | Yes | Comment text content |
| `parent_id` | string | No | ID of comment to reply to (Postproxy ID or external ID). Omit to comment on the post itself. |

#### Response

<Code code={`{
  "id": "cmt_ghi789",
  "body": "Thanks for the feedback everyone!",
  "status": "pending",
  "external_id": null
}`} lang="json" />

The comment is created with `status: "pending"`. Once published to the platform, it becomes `"published"`. If publishing fails, it becomes `"failed"`.

---

### `comments_delete`

Delete a comment from the platform asynchronously. Supported on Instagram, Facebook, YouTube, and LinkedIn. Not supported on Threads.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_id` | string | Yes | Post ID |
| `comment_id` | string | Yes | Comment ID (Postproxy ID or external ID) |
| `profile_id` | string | Yes | Profile ID |

---

### `comments_hide`

Hide a comment on the platform asynchronously. Supported on Instagram, Facebook, and Threads.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_id` | string | Yes | Post ID |
| `comment_id` | string | Yes | Comment ID |
| `profile_id` | string | Yes | Profile ID |

---

### `comments_unhide`

Unhide a previously hidden comment. Supported on Instagram, Facebook, and Threads.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_id` | string | Yes | Post ID |
| `comment_id` | string | Yes | Comment ID |
| `profile_id` | string | Yes | Profile ID |

---

### `comments_like`

Like a comment on the platform asynchronously. Currently only supported on Facebook.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_id` | string | Yes | Post ID |
| `comment_id` | string | Yes | Comment ID |
| `profile_id` | string | Yes | Profile ID |

---

### `comments_unlike`

Remove a like from a comment. Currently only supported on Facebook.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_id` | string | Yes | Post ID |
| `comment_id` | string | Yes | Comment ID |
| `profile_id` | string | Yes | Profile ID |

---

### Comment Platform Support

| Action | Instagram | Facebook | Threads | YouTube | LinkedIn |
|--------|-----------|----------|---------|---------|----------|
| List | Yes | Yes | Yes | Yes | Yes |
| Reply | Yes | Yes | Yes | Yes | Yes |
| Delete | Yes | Yes | No | Yes | Yes |
| Hide/Unhide | Yes | Yes | Yes | No | No |
| Like/Unlike | No | Yes | No | No | No |

---

## Direct Messages

1:1 messaging (chats and messages) on DM-capable profiles — Facebook (Messenger), Instagram (DMs), Telegram (Bot DMs), and Bluesky. Outbound sends are processed asynchronously (returned with `status: "pending"`). See the [Direct Messages API reference](/reference/direct-messages/) for object shapes and platform details.

### `dm_chats_list`

List chats for a profile, ordered by most recent activity.

#### Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `profile_id` | string | Yes | - | Profile ID (Facebook, Instagram, Telegram, or Bluesky) |
| `page` | number | No | `1` | Page number, 1-based. Passing `0` returns page `1` |
| `per_page` | number | No | `20` | Items per page |
| `before` | string | No | - | ISO 8601 timestamp filter on `last_message_at` |
| `after` | string | No | - | ISO 8601 timestamp filter on `last_message_at` |

---

### `dm_chat_create`

Find or create a chat for a participant (idempotent — returns the existing chat if one exists). Use before messaging a participant the profile hasn't messaged yet.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `participant_external_id` | string | Yes | Platform participant ID (IG-scoped user ID, Facebook PSID, Telegram user ID, or Bluesky DID) |
| `participant_username` | string | No | Display username for the participant |
| `participant_name` | string | No | Display name for the participant |

---

### `dm_chat_get`

Get a single chat by Postproxy ID or platform `external_conversation_id`.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `chat_id` | string | Yes | Chat ID or external conversation ID |

---

### `dm_messages_list`

List messages in a chat, most recent first. Inbound messages created by a tap on an interactive element you sent — a quick reply, a button postback, an Instagram ice breaker, a Telegram callback query — carry [`tapped_action`](#quick-replies-and-buttons) with the payload you set.

#### Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `chat_id` | string | Yes | - | Chat ID or external conversation ID |
| `page` | number | No | `1` | Page number, 1-based. Passing `0` returns page `1` |
| `per_page` | number | No | `20` | Items per page |
| `direction` | string | No | - | `inbound` or `outbound` |
| `status` | string | No | - | Filter by message status |

---

### `dm_message_send`

Send an outbound message. Provide **either** `body` (text) **or** `media` (a single attachment), not both.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `chat_id` | string | Yes | Chat ID or external conversation ID |
| `body` | string | No | Message text (required when `media` is empty) |
| `media` | string[] | No | A single attachment as a URL or local file path. Not supported on Bluesky. (The remote/Worker MCP accepts URLs only.) |
| `reply_to_external_id` | string | No | **Telegram only** — message_id to thread under |
| `reply_markup` | object | No | **Telegram only** — inline/reply keyboard payload |
| `quick_replies` | object[] | No | **Facebook and Instagram only** — up to 13 tappable chips, each `{ title, payload }`. See [Quick replies and buttons](#quick-replies-and-buttons). |
| `buttons` | object[] | No | **Facebook and Instagram only** — up to 3 buttons, each `{ type: "web_url", title, url }` or `{ type: "postback", title, payload }` |
| `card` | object | No | **Facebook and Instagram only** — extra fields for the card carrying `buttons` (`subtitle`, `image_url`, `default_action`). Requires `buttons`. |

#### Quick replies and buttons

**Facebook Messenger and Instagram Direct only** — on Telegram use `reply_markup` instead; passing these on a Telegram or Bluesky chat returns `422`. Quick replies are chips above the participant's composer that vanish once one is tapped; buttons stay attached to the message in the thread.

| | `quick_replies` | `buttons` |
|---|---|---|
| Max per send | 13 | 3 |
| `title` | Required, ≤20 chars | Required, ≤20 chars |
| `payload` | Required, ≤1000 chars | Required for `postback`, ≤1000 chars |
| `url` | — | Required for `web_url`, `https://` only |
| Needs `body` | No | Yes, and `body` is capped at **80** chars |
| With `media` | Facebook only | Not allowed |

```json
{
  "chat_id": "chat_xyz789",
  "body": "What can I help with?",
  "quick_replies": [
    { "title": "Track order", "payload": "TRACK" },
    { "title": "Talk to support", "payload": "HELP" }
  ]
}
```

```json
{
  "chat_id": "chat_xyz789",
  "body": "Nike Air Max",
  "card": { "subtitle": "$129 · Arriving Friday", "image_url": "https://cdn.example.com/shoe.png" },
  "buttons": [
    { "type": "web_url", "title": "Buy now", "url": "https://shop.example.com/p/air-max" },
    { "type": "postback", "title": "Notify me", "payload": "NOTIFY:air-max" }
  ]
}
```

Buttons are delivered as a Meta generic template whose element title is your `body` — that's where the 80-character cap comes from. Instagram is stricter than Messenger: it delivers quick replies only on a plain-text message, so `quick_replies` with `media` or with `buttons` returns `422` there.

**Receiving taps.** A tapped chip or button postback arrives as an **inbound message** carrying `tapped_action` — `{ "kind": "quick_reply" | "postback" | "callback_query", "payload": "...", "title": "..." }`. Read it from `dm_messages_list` or `dm_message_get` instead of digging through `platform_data`. Instagram ice-breaker taps and Telegram callback queries normalize to the same field. Full details: [Quick replies and buttons](/reference/direct-messages/#quick-replies-and-buttons).

---

### `dm_message_get`

Get a single message by Postproxy ID or platform `external_id`. Outbound messages echo the `quick_replies` / `buttons` / `card` they were sent with; an inbound message created by a tap carries `tapped_action`.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `message_id` | string | Yes | Message ID or external ID |

---

### `dm_message_edit`

Edit a previously-sent outbound message. **Telegram only** — Facebook and Instagram do not expose outbound edits, so Meta `quick_replies` and `buttons` cannot be changed after sending. Provide `body` and/or `reply_markup` (pass `{}` to clear the keyboard); at least one is required.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `message_id` | string | Yes | Message ID or external ID |
| `body` | string | No | New text/caption |
| `reply_markup` | object | No | New keyboard (or `{}` to remove) |

---

### `dm_message_react` / `dm_message_unreact`

Add or remove your business account's reaction on a message. **Facebook Messenger and Instagram Direct only.**

#### Parameters (`dm_message_react`)

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `message_id` | string | Yes | Message ID or external ID |
| `reaction` | string | No | Named reaction (default `love`) |
| `emoji` | string | No | Unicode emoji |

#### Parameters (`dm_message_unreact`)

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `message_id` | string | Yes | Message ID or external ID |

---

### `dm_chat_archive` / `dm_chat_unarchive`

Archive (mute) or unarchive (unmute) a chat. **Bluesky only.** Returns the chat with `archived` set.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `chat_id` | string | Yes | Chat ID or external conversation ID |

---

### `dm_comment_private_reply`

Send a DM to the author of a comment, in reply to that comment (Meta "Private Replies"). Bypasses the 24h window (comments up to 7 days old) and creates/reuses a chat automatically. One private reply per comment, ever. **Instagram and Facebook only.**

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_id` | string | Yes | Post ID |
| `comment_id` | string | Yes | Comment ID or external ID |
| `profile_id` | string | Yes | Profile ID (Instagram or Facebook) |
| `text` | string | Yes | DM text |

---

### DM Platform Support

| Action | Facebook | Instagram | Telegram | Bluesky |
|--------|----------|-----------|----------|---------|
| List / Send / Get | Yes | Yes | Yes | Yes |
| Media attachment | Yes | Yes | Yes | No |
| Edit message | No | No | Yes | No |
| React / Unreact | Yes | Yes | No | No |
| Archive / Unarchive | No | No | No | Yes |
| Private reply to comment | Yes | Yes | No | No |
| `reply_to_external_id` / `reply_markup` | No | No | Yes | No |
| `quick_replies` / `buttons` / `card` | Yes | Yes — text-only | No | No |
| `tapped_action` on inbound taps | Yes | Yes | Yes | No |

---

## Google Business Reviews

Google Business reviews live on a **location**, not on a post, so they are not reachable through `comments_list`. They come through the profile-comments tools instead. Reviews sync from Google on a schedule; each new one also fires a `profile_comment.created` webhook.

### `profile_comments_list`

List reviews (with any replies nested) for a Google Business profile.

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID (a `google_business` profile) |
| `placement_id` | string | No | Filter to one location — the `accounts/X/locations/Y` path from `profiles_placements` |
| `page` | number | No | Zero-indexed page (default 0) |
| `per_page` | number | No | Items per page (default 20) |

Each review carries the reviewer name, the body, the star rating in `platform_data.star_rating`, `external_id`, and a `permalink` to the location's public reviews page. A rating with no text is still a review and arrives with an empty body.

### `profile_comments_get`

Get a single review or reply by Postproxy ID or Google's `external_id` (the full `accounts/…/reviews/…` path is accepted).

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `comment_id` | string | Yes | Postproxy ID or `external_id` |

### `profile_comments_create`

Reply to a review. Top-level comments cannot be created — reviews come from customers — so `parent_id` is required. The reply is returned with `status: "pending"` and moves to `published` or `failed` once Google accepts it. One owner reply per review: replying again updates the existing reply.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `parent_id` | string | Yes | Postproxy ID or `external_id` of the review |
| `text` | string | Yes | Reply body |

### `profile_comments_delete`

Delete your own reply. The underlying review is not deleted — Google does not let businesses remove reviews.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `comment_id` | string | Yes | Postproxy ID or `external_id` of **your reply** |

---

## Google Business Profile Management

These tools read and update the Business Profile listing behind each location — the business itself, not posts published to it. Every tool takes a `profile_id` (a `google_business` profile) and a `location_id`: the full Google resource path `accounts/X/locations/Y` returned by `profiles_placements`.

Two rules apply to every update tool:

- **Read first, then patch.** Updates are field-masked. `fields` names exactly the parts being replaced; anything named in `fields` but missing from the payload is cleared, and nested objects are replaced wholesale. Fetch with the matching `_get` tool, edit, send back.
- **Payloads are Google's own shapes.** Keys are camelCased exactly as Google returns them, so a `_get` response can be edited and passed straight to `_update`.

Google gates some surfaces by category and country: food menus need `metadata.canHaveFoodMenus`, the service list needs `metadata.canModifyServiceList`, valid attributes depend on the primary category. A blocked call returns `422` naming the flag, which is expected rather than an error to retry.

The task-level walkthrough is [How to Manage Google Business Profile from ChatGPT or Claude](/how-to/google-business-ai-agent-mcp/). REST equivalents with full response examples are on the [Google Business API reference](/reference/platforms/google-business/#business-profile-management).

### `google_business_location_get`

Read the location: name, description, website, phones, categories, address, hours, service area, service items, and metadata (including the eligibility flags above).

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `read_mask` | string | No | Comma-separated Google field paths, e.g. `name,title,regularHours,metadata`. Defaults to the full profile-oriented set |

### `google_business_location_update`

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `fields` | array | Yes | Any of `title`, `storeCode`, `websiteUri`, `phoneNumbers`, `categories`, `storefrontAddress`, `serviceArea`, `labels`, `latlng`, `openInfo`, `profile` |
| *(one key per entry in `fields`)* | — | Yes | The new value. `profile` is `{ description }` (max 750 characters); `openInfo` is `{ status }` (`OPEN`, `CLOSED_TEMPORARILY`, `CLOSED_PERMANENTLY`); `categories` uses resource names from `google_business_categories_list` |

Hours and the service list have their own tools.

### `google_business_categories_list`

Resolve category resource names (`categories/gcid:coffee_shop`) for a region. Use `filter` to search by display name instead of paging.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `region_code` | string | Yes | CLDR region, e.g. `US` |
| `filter` | string | No | Google filter expression, e.g. `displayName=coffee` |
| `language_code` | string | No | BCP-47 code for display names (default `en`) |
| `view` | string | No | `BASIC` (default) or `FULL` — `FULL` includes the category's `serviceTypes` and `moreHoursTypes` |
| `page_size` / `page_token` | — | No | 1–100; token from the previous response |

### `google_business_hours_update`

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `fields` | array | Yes | Any of `regularHours`, `specialHours`, `moreHours` |
| `regularHours` | object | Conditional | `{ periods: [{ openDay, openTime, closeDay, closeTime }] }`. Days `MONDAY`…`SUNDAY`; a day with no period is closed |
| `specialHours` | object | Conditional | `{ specialHourPeriods: [{ startDate: { year, month, day }, openTime, closeTime, closed }] }` |
| `moreHours` | array | Conditional | `[{ hoursTypeId, periods }]`; valid `hoursTypeId` values come from the category (`google_business_categories_list` with `view: FULL`) |

Times accept `"09:00"` strings or Google's `{ hours, minutes }` objects. Read current hours with `google_business_location_get`.

### `google_business_attributes_available`

List the attributes a location can set, with their `valueType`. Call this before `google_business_attributes_update`.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `category_name` | string | No | Look up by category instead (`categories/gcid:…`); requires `region_code` |
| `region_code` / `language_code` | string | No | Only with `category_name` |
| `show_all` | boolean | No | Every attribute Google knows, not just this location's |
| `page_size` / `page_token` | — | No | 1–200; token from the previous response |

### `google_business_attributes_get`

Read the attributes currently set. Google omits the `attributes` key entirely when none are set.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |

### `google_business_attributes_update`

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `attributes` | array | Yes | Objects with a `name` and a value field matching the type: `BOOL` → `values: [true]`, `URL` → `uriValues: [{ uri }]`, `ENUM` → `repeatedEnumValue: { setValues: [...] }` |
| `attribute_mask` | array | No | Names to replace. Defaults to the names in `attributes`, so untouched attributes are preserved. List a name here without sending it to clear it |

### `google_business_service_list_get` / `google_business_service_list_update`

Read and replace the service list. The update is a full replacement — send the complete list. Items are `{ structuredServiceItem: { serviceTypeId, price } }` (IDs from the category's `serviceTypes`) or `{ freeFormServiceItem: { category, label: { displayName, languageCode }, price } }`. Fails with `422` when `metadata.canModifyServiceList` is false.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `serviceItems` | array | Yes (update) | The complete service list |

### `google_business_food_menus_get` / `google_business_food_menus_update`

Read and replace food menus on restaurant-type locations. Structure is menus → sections → items; every label carries a `languageCode`, prices need `currencyCode` and `units`. Fails with `422` when `metadata.canHaveFoodMenus` is false.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `fields` | array | No (get) | `name`, `menus` |
| `menus` | array | Yes (update) | The complete menu list |

### `google_business_place_action_links_list`

List the action buttons ("Order online", "Book online", …). Google omits the `placeActionLinks` key when there are none. Links with `providerType: AGGREGATOR_3P` were pushed by a third-party platform and are not editable.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `page_size` / `page_token` | — | No | 1–100; token from the previous response |

### `google_business_place_action_types_available`

List the `place_action_type` values Google accepts for the location. They depend on its categories and setup, so check here first when `google_business_place_action_link_create` fails with `Request contains an invalid argument`.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `language_code` | string | No | BCP 47 code for `displayName`, e.g. `en` |
| `page_size` / `page_token` | — | No | 1–100; token from the previous response |

### `google_business_place_action_link_create`

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `uri` | string | Yes | Where the button goes |
| `place_action_type` | string | Yes | `APPOINTMENT`, `ONLINE_APPOINTMENT`, `DINING_RESERVATION`, `FOOD_ORDERING`, `FOOD_DELIVERY`, `FOOD_TAKEOUT`, `SHOP_ONLINE` — accepted types vary by category |
| `is_preferred` | boolean | No | Make this the preferred link for its type (one per type per location) |

Google keys links on (location, uri, type), so creating the same combination twice returns the existing link.

### `google_business_place_action_link_update`

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `name` | string | Yes | `locations/Y/placeActionLinks/Z` from the list |
| `fields` | array | Yes | Any of `uri`, `placeActionType`, `isPreferred` |
| `uri` / `place_action_type` / `is_preferred` | — | Conditional | One per entry in `fields` |

### `google_business_place_action_link_delete`

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `name` | string | Yes | `locations/Y/placeActionLinks/Z` |

### `google_business_media_list`

List the profile's photos and videos — distinct from media attached to a local post.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `page_size` / `page_token` | — | No | 1–250 (default 100); token from the previous response |

### `google_business_media_create`

Google downloads the file from `media_url` itself, so the URL must be publicly reachable HTTPS — not a short-lived signed URL, not localhost. Images need at least 250×250 px and at most 5 MB.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `media_url` | string | Yes | Public HTTPS URL |
| `category` | string | No | `COVER`, `PROFILE`, `LOGO`, `EXTERIOR`, `INTERIOR`, `PRODUCT`, `AT_WORK`, `FOOD_AND_DRINK`, `MENU`, `COMMON_AREA`, `ROOMS`, `TEAMS`, `ADDITIONAL` (default) |
| `media_format` | string | No | `PHOTO` (default) or `VIDEO` |
| `description` | string | No | Max 2,000 characters |

Use `COVER` or `LOGO` only to change the profile header or logo.

### `google_business_media_delete`

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `profile_id` | string | Yes | Profile ID |
| `location_id` | string | Yes | `accounts/X/locations/Y` |
| `media_name` | string | Yes | `accounts/X/locations/Y/media/Z` from the list |

---

## Platform Parameters

The `platforms` parameter in `post_publish` allows you to specify platform-specific options for each social media platform. This enables advanced features like Instagram Reels, YouTube video titles, TikTok privacy settings, and more.

### Instagram Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | Post format: `"post"`, `"reel"`, or `"story"` |
| `collaborators` | string[] | Array of usernames (max 10 for posts, 3 for reels) |
| `first_comment` | string | Comment to add after posting |
| `cover_url` | string | Thumbnail URL for reels |
| `audio_name` | string | Audio track name for reels |
| `trial_strategy` | string | Trial strategy for reels: `"MANUAL"` or `"SS_PERFORMANCE"` |
| `thumb_offset` | string | Thumbnail offset in milliseconds for reels |

#### Instagram Examples

<Code code={`{
  "content": "Amazing content!",
  "profiles": ["instagram"],
  "media": ["https://example.com/image.jpg"],
  "platforms": {
    "instagram": {
      "format": "post",
      "collaborators": ["username1", "username2"],
      "first_comment": "What do you think? 🔥"
    }
  }
}`} lang="json" />

<Code code={`{
  "content": "Check out this reel! #viral",
  "profiles": ["instagram"],
  "media": ["https://example.com/video.mp4"],
  "platforms": {
    "instagram": {
      "format": "reel",
      "collaborators": ["collaborator_username"],
      "cover_url": "https://example.com/thumbnail.jpg",
      "audio_name": "Trending Audio",
      "first_comment": "Link in bio!"
    }
  }
}`} lang="json" />

### YouTube Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `title` | string | Video title |
| `privacy_status` | string | Privacy setting: `"public"`, `"unlisted"`, or `"private"` |
| `cover_url` | string | Custom thumbnail URL |
| `made_for_kids` | boolean | Mark content as made for kids |

#### YouTube Examples

<Code code={`{
  "content": "This is the video description with links and details",
  "profiles": ["youtube"],
  "media": ["https://example.com/video.mp4"],
  "platforms": {
    "youtube": {
      "title": "My Tutorial: How to Build an API",
      "privacy_status": "public",
      "cover_url": "https://example.com/custom-thumbnail.jpg"
    }
  }
}`} lang="json" />

### TikTok Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | Content format: `"video"` or `"image"` |
| `privacy_status` | string | Privacy setting: `"PUBLIC_TO_EVERYONE"`, `"MUTUAL_FOLLOW_FRIENDS"`, `"FOLLOWER_OF_CREATOR"`, or `"SELF_ONLY"` |
| `photo_cover_index` | integer | Index of photo to use as cover (0-based, image only). Defaults to `0` |
| `auto_add_music` | boolean | Enable automatic music (image only). Defaults to `false` |
| `made_with_ai` | boolean | Mark content as AI-generated (video only). Defaults to `false` |
| `disable_comment` | boolean | Disable comments. Defaults to `true` — pass `false` to allow comments |
| `disable_duet` | boolean | Disable duets (video only). Defaults to `true` — pass `false` to allow duets |
| `disable_stitch` | boolean | Disable stitches (video only). Defaults to `true` — pass `false` to allow stitches |
| `brand_content_toggle` | boolean | Mark as paid partnership (third-party). Defaults to `false` |
| `brand_organic_toggle` | boolean | Mark as paid partnership (own brand). Defaults to `false` |

#### TikTok Examples

<Code code={`{
  "content": "Check this out! #fyp",
  "profiles": ["tiktok"],
  "media": ["https://example.com/video.mp4"],
  "platforms": {
    "tiktok": {
      "privacy_status": "PUBLIC_TO_EVERYONE",
      "auto_add_music": true,
      "disable_comment": false,
      "disable_duet": false,
      "disable_stitch": false
    }
  }
}`} lang="json" />

### Facebook Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | Post format: `"post"`, `"story"`, or `"reel"` |
| `title` | string | Title for reels (reel format only) |
| `first_comment` | string | Comment to add after posting |
| `page_id` | string | Page ID for posting to company pages (use `profiles_placements` to get available pages) |

#### Facebook Examples

<Code code={`{
  "content": "Check out our new product!",
  "profiles": ["facebook"],
  "media": ["https://example.com/product.jpg"],
  "platforms": {
    "facebook": {
      "format": "post",
      "first_comment": "Link to purchase: https://example.com/shop"
    }
  }
}`} lang="json" />

### LinkedIn Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `organization_id` | string | Organization ID for company page posts |

#### LinkedIn Examples

<Code code={`{
  "content": "We're hiring! Join our team",
  "profiles": ["linkedin"],
  "media": ["https://example.com/careers.jpg"],
  "platforms": {
    "linkedin": {
      "organization_id": "company-id-12345"
    }
  }
}`} lang="json" />

### Cross-Platform Example

<Code code={`{
  "content": "Product launch video",
  "profiles": ["instagram", "youtube", "tiktok"],
  "media": ["https://example.com/video.mp4"],
  "platforms": {
    "instagram": {
      "format": "reel",
      "first_comment": "Link in bio!"
    },
    "youtube": {
      "title": "Product Launch 2024",
      "privacy_status": "public",
      "cover_url": "https://example.com/yt-thumbnail.jpg"
    },
    "tiktok": {
      "privacy_status": "PUBLIC_TO_EVERYONE",
      "auto_add_music": true
    }
  }
}`} lang="json" />

:::note
Twitter/X and Threads do not have platform-specific parameters available.
:::

For complete documentation, see the [Platform Parameters Reference](/reference/platforms/).

---

## Example Prompts

Here are some example prompts you can use with Claude Code:

### Check Authentication

<Code code={`Check my Postproxy authentication status`} lang="text" />

### List Profiles

<Code code={`Show me all my available social media profiles`} lang="text" />

### Publish a Post

Using profile IDs:

<Code code={`Publish this post: "Check out our new product!" to profiles ["profile-123"]`} lang="text" />

Using platform names:

<Code code={`Publish "Exciting news!" to linkedin and twitter`} lang="text" />

### Create a Draft Post

<Code code={`Create a draft post: "Review this before publishing" to linkedin`} lang="text" />

### Publish a Draft Post

<Code code={`Publish draft post job-123`} lang="text" />

### Check Post Status

<Code code={`What's the status of post job-123?`} lang="text" />

This will show detailed status including draft status, platform-specific errors, and publishing results.

### Get Post Stats

<Code code={`Show me the stats for post abc123`} lang="text" />

<Code code={`Get stats for posts abc123 and def456 filtered to Instagram only, from February 1st to today`} lang="text" />

### List Placements

<Code code={`Show me the placements for my LinkedIn profile prof123`} lang="text" />

### Update a Post

<Code code={`Update the content of draft post job-123 to "Updated content here"`} lang="text" />

### Delete a Post

<Code code={`Delete post job-123`} lang="text" />

### Queue Management

<Code code={`Show me all my posting queues`} lang="text" />

<Code code={`Create a queue called "Weekday Mornings" for profile group pg123, timezone America/New_York, with timeslots Monday through Friday at 9am`} lang="text" />

<Code code={`Add a post to queue q1abc with high priority: "Check out our latest feature!"`} lang="text" />

<Code code={`Pause queue q1abc`} lang="text" />

<Code code={`What's the next available slot for queue q1abc?`} lang="text" />

### Comment Management

<Code code={`Show me the comments on post abc123 for my Instagram profile prof456`} lang="text" />

<Code code={`Reply to comment cmt_abc123 on post abc123 with "Thanks for the feedback!" using profile prof456`} lang="text" />

<Code code={`Hide comment cmt_abc123 on post abc123 for profile prof456`} lang="text" />

### Direct Messages

<Code code={`List the DM chats for my Instagram profile prof456`} lang="text" />

<Code code={`Reply "Yes, we ship worldwide!" in chat chat_xyz789`} lang="text" />

<Code code={`Send a DM to the author of comment cmt_abc123 on post abc123 from profile prof456 saying "DM-ing you the details"`} lang="text" />

### Google Business Reviews

<Code code={`List unanswered Google reviews for profile prof_abc123 across every location and reply to the 5-star ones`} lang="text" />

<Code code={`Reply to review accounts/113344/locations/558899/reviews/AbFvOq from profile prof_abc123: "Thanks Jane — see you again soon!"`} lang="text" />

### Google Business Profile Management

<Code code={`Set special hours on every location of profile prof_abc123: closed December 25 and 26, open 08:00–14:00 on December 24`} lang="text" />

<Code code={`Check which attributes the downtown location can set, then mark it wheelchair accessible and add our menu URL`} lang="text" />

<Code code={`Upload https://cdn.acme.example/cover-autumn.jpg as the cover photo on all locations and delete the previous cover photos`} lang="text" />

<Code code={`Add an "Order online" button pointing to https://order.acme.example on location accounts/113344/locations/558899 and make it preferred`} lang="text" />

<Code code={`Compare impressions, calls, and direction requests per location for the last 30 days and flag any location down more than 20%`} lang="text" />

### Publish a Thread

<Code code={`Publish a thread on Twitter: first post "Part 1: Introduction to our new feature", then "Part 2: Here's how it works", then "Part 3: Try it out today!"`} lang="text" />

### View History

<Code code={`Show me the last 5 posts I published`} lang="text" />

---

## Troubleshooting

### Server Won't Start

- **Check API Key**: Ensure `POSTPROXY_API_KEY` is set when registering with `claude mcp add`
- **Check Node Version**: Requires Node.js >= 18.0.0
- **Check Installation**: Verify `postproxy-mcp` is installed and in PATH
- **Check Registration**: Ensure the server is registered via `claude mcp add` and configuration is saved in `~/.claude/plugins/`

### Authentication Errors

- **AUTH_MISSING**: API key is not configured. Make sure you included `--env POSTPROXY_API_KEY=...` when running `claude mcp add`
- **AUTH_INVALID**: API key is invalid. Verify your API key is correct.

### Validation Errors

- **TARGET_NOT_FOUND**: One or more profile IDs don't exist. Use `profiles_list` to see available profiles.
- **VALIDATION_ERROR**: Post content or parameters are invalid. The API now returns detailed error messages:
  - **400 errors**: `{"status":400,"error":"Bad Request","message":"..."}`
  - **422 errors**: `{"errors": ["Error 1", "Error 2"]}` - Array of validation error messages
  - Check the error message for specific validation issues

### API Errors

- **API_ERROR**: Postproxy API returned an error. Check the error message for details.
- **Timeout**: Request took longer than 30 seconds. Check your network connection and API status.

### Platform Errors

When checking post status with `post_status`, platform-specific errors are now available in the `error` field of each platform object:
- `error: null` - Post published successfully
- `error: "Error message"` - Detailed error message from the platform API
- Common errors include authentication issues, rate limits, content violations, etc.

### Draft Post Issues

If you create a draft post (`draft: true`) but receive `draft: false` in the response:
- The response will include a `warning` field explaining that the API may have ignored the draft parameter
- This can happen if:
  - The API does not support drafts with media attachments
  - The API has specific limitations for draft posts under certain conditions
- Check the `warning` field in the response for details
- Enable debug mode (`POSTPROXY_MCP_DEBUG=1`) to see detailed logging about draft parameter handling

### Debug Mode

Enable debug logging by setting `POSTPROXY_MCP_DEBUG=1` when registering the server:

<Code code={`claude mcp add --transport stdio postproxy-mcp --env POSTPROXY_API_KEY=your-api-key --env POSTPROXY_BASE_URL=https://api.postproxy.dev/api --env POSTPROXY_MCP_DEBUG=1 -- postproxy-mcp`} lang="bash" />