# AI API Reference (Luna Backend)

Base URL (local): `http://localhost:8000`
Base URL (deployed): `https://<render-service>.onrender.com`

All endpoints are served by the FastAPI backend (`backend/`). Interactive Swagger UI
is available at `/docs` on any running instance.

## Endpoints

| Method | Path | Engine | Typical latency |
|---|---|---|---|
| POST | `/api/ai/sentiment` | DistilBERT SST-2 | < 1 s (warm) |
| POST | `/api/ai/intent` | BART-large-MNLI | 1–3 s (warm) |
| POST | `/api/ai/trends` | scikit-learn TF-IDF | < 1 s |
| POST | `/api/ai/suggested-reply` | Ollama `qwen2.5:3b` | 3–10 s |
| POST | `/api/ai/content-ideas` | Ollama `qwen2.5:3b` | 3–10 s |
| POST | `/api/ai/analytics` | pandas | < 1 s |

## 1. Sentiment

`POST /api/ai/sentiment`

Analyzes one customer message with DistilBERT fine-tuned on SST-2. Labels are
`POSITIVE` or `NEGATIVE`; `score` is model confidence (0–1).

Request:
```json
{ "text": "The service was excellent!" }
```

Response `200`:
```json
{ "label": "POSITIVE", "score": 0.9876 }
```

## 2. Intent

`POST /api/ai/intent`

Zero-shot classification with BART-large-MNLI — no training data required. The label
set is defined in `Modal/modal_app.py` (`CANDIDATE_LABELS`):

- Billing and Payment
- Queue Booking and Delay
- Document Verification Issue
- General Inquiry
- Technical Bug

Request:
```json
{ "text": "I have been waiting for 40 minutes" }
```

Response `200`:
```json
{ "intent": "Queue Booking and Delay", "confidence": 0.9321 }
```

## 3. Trends

`POST /api/ai/trends`

Extracts the top keywords/issues across a batch of messages using TF-IDF
(1–500 messages).

Request:
```json
{
  "messages": [
    "The wait time at this branch is far too long",
    "I waited an hour, the wait time is unacceptable"
  ]
}
```

Response `200`:
```json
{
  "trends": [
    { "keyword": "wait", "score": 0.6123 },
    { "keyword": "time", "score": 0.5311 }
  ]
}
```

Returns `{"trends": []}` when no meaningful tokens remain (e.g. stopwords only).

## 4. Suggested Reply

`POST /api/ai/suggested-reply`

Generates an agent-ready reply via Ollama. `sentiment` and `intent` are optional
context from the two endpoints above.

Request:
```json
{
  "text": "Still waiting in line",
  "sentiment": "NEGATIVE",
  "intent": "Queue Booking and Delay"
}
```

Response `200`:
```json
{ "reply": "I'm sorry for the wait — we're moving as fast as we can. You're next in line." }
```

## 5. Content Ideas

`POST /api/ai/content-ideas`

Generates social post ideas for the Social Studio. `count` must be 1–10 (default 3).

Request:
```json
{ "topic": "fast check-in", "count": 3 }
```

Response `200`:
```json
{
  "ideas": [
    "3 things customers notice when check-in takes under a minute",
    "Behind the scenes: our fastest check-in yet",
    "What to bring to make your visit instant"
  ]
}
```

If the model output cannot be parsed, the backend falls back to five built-in
templates (`IDEA_FALLBACKS` in `backend/app/ai/client.py`).

## 6. Queue Analytics

`POST /api/ai/analytics`

Computes wait/service metrics from ticket timestamps (ISO 8601).

Request:
```json
{
  "ticket_logs": [
    {
      "check_in": "2026-10-16T09:00:00",
      "served_at": "2026-10-16T09:15:00",
      "completed_at": "2026-10-16T09:25:00"
    },
    {
      "check_in": "2026-10-16T09:10:00",
      "served_at": "2026-10-16T09:30:00",
      "completed_at": "2026-10-16T09:40:00"
    }
  ]
}
```

Response `200`:
```json
{
  "avg_wait_mins": 17.5,
  "max_wait_mins": 20.0,
  "avg_service_mins": 10.0,
  "total_tickets": 2
}
```

## Validation and errors

| Status | Meaning |
|---|---|
| 200 | Success |
| 422 | Invalid payload (empty text, empty batch, `count` out of range, empty `ticket_logs`, malformed timestamps) |
| 503 | Model host unreachable or model failed (`ClassifierServiceError` / `LunaModelError`) |

`text` limits: 1–4000 chars. `topic` limit: 1–500 chars.

## Quick tests (PowerShell)

```powershell
curl.exe -X POST http://localhost:8000/api/ai/sentiment `
  -H "Content-Type: application/json" `
  -d '{"text":"The service was excellent!"}'

curl.exe -X POST http://localhost:8000/api/ai/intent `
  -H "Content-Type: application/json" `
  -d '{"text":"I have been waiting for 40 minutes"}'
```

## Test coverage

`backend/tests/test_ai_router.py` — 12 tests covering happy paths, validation,
model-down (503) behavior, trend extraction and analytics math. Full suite: 115 tests
passing on branch `Daniel`.
