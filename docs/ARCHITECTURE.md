# Architecture

## Overview

Three independent pieces, connected only by HTTP. The backend knows nothing about
model loading; the model apps know nothing about Luna data.

```
Clients (frontend / Postman)
        |
        v
Render backend (FastAPI, free tier, no ML deps)
        |
        +--------------------+--------------------+
        |                    |                    |
        v                    v                    v
Modal: luna-ai        Modal: luna-ollama    Local in-process
- /sentiment          - /v1/chat/completions - /trends (TF-IDF)
- /intent             - /api/chat           - /analytics (pandas)
- /v1/chat/completions - /api/generate
```

## Model choices

| Task | Model | Why |
|---|---|---|
| Sentiment | `distilbert-base-uncased-finetuned-sst-2-english` | 66M params, ~270 MB, purpose-built for sentiment, fast on CPU |
| Intent | `facebook/bart-large-mnli` | Zero-shot NLI — Luna's label set works with no training data |
| Generation | `qwen2.5:3b` via Ollama | Small, instruction-tuned, runs on CPU, OpenAI-compatible API |
| Trends | scikit-learn TF-IDF | Deterministic, explainable, no model hosting needed |
| Analytics | pandas / NumPy | Pure arithmetic over ticket timestamps |

The classification models are specialized models, not prompt-engineered chat LLMs:
DistilBERT outputs a sentiment probability directly, and BART-MNLI scores each
candidate intent label against the message (entailment). Both run through the
`transformers` pipeline API inside the `luna-ai` Modal app.

## Request flow: suggested reply

1. Frontend calls `/api/ai/sentiment` and `/api/ai/intent` (optionally, in parallel).
2. Frontend sends the message plus those results to `/api/ai/suggested-reply`.
3. Backend builds a system prompt + context and forwards an OpenAI-style
   `chat/completions` request to `LUNA_MODEL_URL` (Ollama on Modal).
4. Ollama returns the completion; the backend extracts
   `choices[0].message.content` and returns `{"reply": ...}`.

## Configuration surface

Only two variables decide where AI work happens:

- `LUNA_CLASSIFIER_URL` — base URL of the transformers app (`luna-ai`).
- `LUNA_MODEL_URL` / `LUNA_MODEL_NAME` / `LUNA_MODEL_API_KEY` — any
  OpenAI-compatible endpoint (Ollama on Modal, HF Inference Providers, Groq, OpenAI).

Swapping providers requires no code changes. `LUNA_MODEL_API_KEY` is optional — the
`Authorization` header is only sent when a key is configured (Ollama needs none).

## Failure behavior

- Model host unreachable → endpoint returns `503` with a human-readable detail; the
  rest of the API stays healthy.
- Classifiers load lazily on first request; the first call may be slow (cache warm).
- Content idea parsing failure → built-in template fallback (never returns an empty list).
- Analytics with malformed timestamps → `422`.

## Scaling and cost

- Both Modal apps scale to zero when idle (free-tier friendly).
- Weights persist in Modal Volumes (`luna-hf-cache`, `luna-ollama-models`), so cold
  starts read from disk, not from the internet.
- Render only hosts the thin backend; it needs no torch, transformers, or model files.

## Security

- No secrets in the repo; all keys via environment variables.
- Backend CORS origins come from `CORS_ORIGINS` settings.
- Public model URLs accept anonymous calls for the demo. For production, put Modal
  behind a proxy/secret or switch `LUNA_CLASSIFIER_URL` to an authenticated endpoint.

## Limitations (documented, accepted for MVP)

- Sentiment model is English-only.
- Intent labels are fixed at deploy time; adding labels means redeploying `luna-ai`.
- CPU generation is slow (seconds per reply), acceptable for agent-assist UI.
- Cold starts after long idle periods add 20–60 s to the first request.
