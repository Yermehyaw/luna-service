# Luna AI on Modal (100% free tier)

Single FastAPI app hosting all model traffic for the Luna backend. Deploy from the repo root:

```powershell
pip install modal
modal setup
modal deploy Modal/modal_app.py
```

## Routes

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Health probe |
| GET | `/v1/models` | OpenAI-compatible model list |
| POST | `/sentiment` | DistilBERT SST-2 sentiment |
| POST | `/intent` | BART-large-MNLI zero-shot intent |
| POST | `/v1/chat/completions` | Qwen2.5-3B-Instruct generated replies/ideas |

## Backend env (Render)

```
LUNA_CLASSIFIER_URL=https://<workspace>--luna-ai-api.modal.run
LUNA_MODEL_URL=https://<workspace>--luna-ai-api.modal.run/v1
LUNA_MODEL_NAME=Qwen/Qwen2.5-3B-Instruct
LUNA_MODEL_API_KEY=
```

`LUNA_MODEL_API_KEY` can stay empty — the backend only sends the header when set.

Model weights are cached in the `luna-hf-cache` Modal Volume, so the first call after a deploy warms the cache (slower) and later cold starts are fast. Containers scale to zero when idle.
