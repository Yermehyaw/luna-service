# Luna AI on Modal (100% free tier)

Two Modal apps, both free-tier:

- `modal_app.py` — FastAPI: DistilBERT, BART and Qwen2.5-3B via transformers.
- `ollama_app.py` — Ollama server (OpenAI-compatible) hosting `qwen2.5:3b`.

Deploy from the repo root:

```powershell
pip install modal
modal setup
modal deploy Modal/modal_app.py
modal deploy Modal/ollama_app.py
```

## Routes

### `modal_app.py` (`luna-ai`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Health probe |
| GET | `/v1/models` | OpenAI-compatible model list |
| POST | `/sentiment` | DistilBERT SST-2 sentiment |
| POST | `/intent` | BART-large-MNLI zero-shot intent |
| POST | `/v1/chat/completions` | Qwen2.5-3B-Instruct generated replies/ideas |

### `ollama_app.py` (`luna-ollama`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/tags` | Ollama model list |
| POST | `/api/chat` | Ollama native chat |
| POST | `/v1/chat/completions` | OpenAI-compatible chat (used by backend) |
| POST | `/api/generate` | Ollama native generation |

## Backend env (Render) — Ollama generation

```
LUNA_CLASSIFIER_URL=https://<workspace>--luna-ai-api.modal.run
LUNA_MODEL_URL=https://<workspace>--luna-ollama-serve.modal.run/v1
LUNA_MODEL_NAME=qwen2.5:3b
LUNA_MODEL_API_KEY=
```

`LUNA_MODEL_API_KEY` can stay empty — the backend only sends the header when set.
Ollama's OpenAI-compatible endpoint ignores the key anyway.

Model weights are cached in Modal Volumes (`luna-hf-cache`, `luna-ollama-models`), so the
first call after a deploy warms the cache (slower) and later cold starts are fast.
Containers scale to zero when idle.
