# AI Integration — Backend Notes

Written from the backend's side of the wall. @Daniel owns the model work; this is how
the API talks to it, what the team needs to agree on, and where the seams are.

Two separate problems are bundled under "AI" here, and conflating them is how projects
pick the wrong tool:

- **Classification** — sentiment, intent, keyword/trend extraction. Small models, fast,
  cheap, deterministic-ish. Lives in `transformers` / `scikit-learn`, already in
  `requirements.txt`.
- **Generation** — suggested replies, content-idea generation. Large language models.
  Non-deterministic, per-token cost, a third-party data boundary.

The README pushes local models for the privacy story and the schedule pushes a hosted
inference API. Both are right for different halves of that list. See §3.

---

## 1. What actually needs AI

| Feature | Kind | Module | Tier |
|---|---|---|---|
| Sentiment flagging on inbound messages | Classification | Social Studio | Basic+ |
| Intent categorisation | Classification | Social Studio | Pro |
| Suggested replies | Generation | Social Studio | Pro |
| Content-idea generation | Generation | Social Studio | Basic (credits) |
| Complaint trend extraction | Classification | Intelligence Dashboard | Pro |
| Document OCR / pre-verification | Vision + classification | Document Verification | Enterprise |

Anything not in that table is not AI, no matter what the pitch deck says. "Average wait
time" is arithmetic — `app/services/wait_time.py` already does it with no model involved.

---

## 2. The seam: one interface, swappable providers

The worst outcome is calling the OpenAI SDK directly from a router, because then the
provider is welded into every endpoint and the privacy tier can't be honoured. Instead:

```
app/ai/
  __init__.py
  base.py          # AIProvider protocol: classify_intent(), suggest_reply(), ...
  openai_provider.py
  local_provider.py   # HuggingFace, the privacy-safe path
  cache.py         # Redis response cache (schedule Week 3)
  factory.py       # picks a provider from settings
```

Routers depend on `factory.get_provider()`, never on `openai`. Swapping OpenAI for a
local model, or for a fake in tests, becomes a settings change.

**This folder does not exist yet.** It is proposed here, not built — @Daniel and I
should agree it's the right shape before either of us writes into it, because two people
scaffolding the same package is the same collision as `models/`.

---

## 3. OpenAI backend integration

### Client

Use the official `openai` SDK (Python) with the **async** client, because the app is
async and a blocking call in a FastAPI route stalls the event loop:

```python
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key=settings.OPENAI_API_KEY,
    timeout=settings.OPENAI_TIMEOUT,
    max_retries=settings.OPENAI_MAX_RETRIES,
)
```

Build it **once** at startup (lifespan), not per request. Per-request construction
re-creates the connection pool every time and is a common, invisible slowdown.

### Config additions

These belong in `app/core/config.py`, alongside the existing settings:

```python
OPENAI_API_KEY: str = ""            # empty means the provider is unavailable, not broken
OPENAI_MODEL: str = "gpt-4o-mini"   # cost default; bump per-tenant only if justified
OPENAI_TIMEOUT: float = 20.0
OPENAI_MAX_RETRIES: int = 2
AI_PROVIDER: str = "auto"           # openai | local | auto | disabled
```

`AI_PROVIDER="auto"` is important: it means "use OpenAI if a key is present, else fall
back to local, else degrade to no suggestion." It makes the app runnable on a laptop
with no key and in CI with no key, instead of 500-ing.

### Where it's used

- `POST /api/social/{message_id}/suggest-reply` → generation
- `POST /api/social/content-ideas` → generation, gated by `ContentCredit`
- Classification stays local — see §4

### Cost controls (do these before the demo, not after)

1. **Redis cache.** Hash the normalized prompt and cache the completion. The schedule
   already calls for this in Week 3; it matters most for content ideas, which repeat.
   `ContentCredit` should be debited on a cache *miss*, not on every request.
2. **Hard `max_tokens` per call.** Suggested replies are short; unbounded output is
   where the bill comes from.
3. **Per-tenant budget.** A cheap abuse guard: cap generations per tenant per day.
   Ties directly into the credit system the README already promises.
4. **Model default is `gpt-4o-mini`.** Reserve larger models for a paid tier only.

### Reliability

- Timeout (20s above) and bounded retries with backoff.
- **Graceful degradation over errors.** If the provider fails, return
  `suggestion: null` with a reason — the Social Studio UI should show "no suggestion
  available" rather than a 500. An AI feature failing must not take the inbox down.
- Log token usage per tenant so cost is visible before it's a surprise.

### Security and privacy — read this bit

- The key lives in `.env` only, server-side. **It must never reach the frontend**, not
  even in a build-time env var.
- Never log raw prompts. Customer messages are the payload and they contain names,
  account numbers, complaints. Log a request id, tenant, model, token counts — not text.
- **The enterprise conflict.** The README sells data privacy for institutional clients.
  Sending their customers' messages to OpenAI is a data-transfer decision those clients
  will ask about. This needs a per-tier policy: Enterprise defaults to local-only,
  Basic/Pro may use hosted. That's a product call, not a code detail.

---

## 4. Why classification stays local

Sentiment and intent are small, high-volume, low-latency, and repetitive. That is the
exact profile where a local DistilBERT beats an API: no per-call cost, no network hop,
no data leaving the box, and the privacy claim stays true.

Generation is the opposite — creative, variable, low-volume — which is why it's the one
place a hosted LLM earns its cost.

So the split is: **local for classify, OpenAI for generate.** The `AIProvider` interface
in §2 is what lets that split change later without touching routers.

---

## 5. The puter.js fallback idea

### What it is

`puter.js` is a **browser** library from Puter that exposes free AI calls
(`puter.ai.chat(...)`) under a "user pays" model — the end user's Puter account covers
the inference, so the app owner pays nothing and manages no key. It's genuinely useful
for a hackathon: live AI in a demo with no billing setup and no backend load.

### The idea

When the backend can't serve AI — no `OPENAI_API_KEY`, quota hit, provider outage — the
frontend falls back to calling puter.js directly instead of showing an error. The
backend cooperates by advertising its AI capability, so the frontend knows which path to
take:

```
GET /api/ai/status
{ "available": true, "provider": "openai", "degraded": false, "reason": null }
```

Frontend logic: `available → call backend; unavailable → puter.ai.chat() locally.`
`/api/ai/status` is trivial to add and costs nothing — it's also how §3's graceful
degradation becomes visible to the UI instead of silent.

### Why it's only a fallback, in plain terms

- **It runs in the browser, not the backend.** So it cannot serve Document OCR, batch
  trend extraction, or anything server-side. Those features have no puter.js fallback —
  they just have no fallback.
- **Data leaves through a boundary we don't control.** The customer's message goes from
  their browser to Puter. For an Enterprise tenant claiming privacy, that's a
  non-starter. Restrict it to Basic/Pro, if it's used at all.
- **It needs the user present and possibly signed in.** A Puter prompt mid-demo is a
  demo that dies on stage.
- **No SLA, unclear rate limits, not for production.** This is a demo-resilience trick,
  not an architecture.

### My read

Worth building as a **demo safety net** and nothing more. If the OpenAI key is missing or
the wifi drops during the pitch, a frontend puter.js fallback keeps the Social Studio
alive instead of showing a spinner. But it should be gated to non-Enterprise and clearly
labelled as a fallback in the UI — not quietly used as the primary path, because the
privacy claim and a browser-side third-party call cannot both be true.

Because it's frontend work, it's @Peter / @Asher's call; this is the backend's contract
for it: expose `/api/ai/status`, and never proxy puter.js calls through the API.

---

## 6. Open questions for the team

1. Does `app/ai/` become shared backend code, or does @Daniel keep models in a separate
   `ai/` service? (§2 assumes shared — needs agreement.)
2. Per-tier AI policy once auth lands: Enterprise local-only? (Q28-adjacent.)
3. Does `ContentCredit` debit on generation attempts or on cache misses? (Affects billing.)
4. Is the puter.js fallback actually wanted, or is it a nice-sounding idea that adds a
   second AI path to maintain?
