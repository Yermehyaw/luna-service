# Deployment Runbook (AI)

Two Modal apps + one Render service. Free tier throughout; no credit card.

## 0. Prerequisites

- Python 3.12 and `pip`
- Accounts: [modal.com](https://modal.com) (free, no card), [render.com](https://render.com) (free)
- Repo checkout on branch `Daniel`

## 1. Backend tests (local)

```powershell
cd backend
python -m pip install -r requirements.txt
python -m pytest
```

Expected: `115 passed`.

## 2. Deploy model apps (Modal)

```powershell
pip install modal
modal setup          # opens browser, creates ~/.modal.toml
modal deploy Modal/modal_app.py
modal deploy Modal/ollama_app.py
```

Deploy prints two URLs:

```
https://<workspace>--luna-ai-api.modal.run          # classifiers + transformers chat
https://<workspace>--luna-ollama-serve.modal.run    # Ollama server
```

Smoke test (first call warms model caches and can take a minute):

```powershell
curl.exe -X POST https://<workspace>--luna-ai-api.modal.run/sentiment `
  -H "Content-Type: application/json" -d '{"text":"I love this service"}'

curl.exe -X POST https://<workspace>--luna-ollama-serve.modal.run/v1/chat/completions `
  -H "Content-Type: application/json" `
  -d '{"model":"qwen2.5:3b","messages":[{"role":"user","content":"Say hi in 5 words"}]}'
```

Monitor logs while testing:

```powershell
modal app logs luna-ai
modal app logs luna-ollama
```

## 3. Deploy backend (Render)

`render.yaml` at the repo root already defines the service:

- `rootDir: backend`, `plan: free`
- `buildCommand: pip install -r requirements.txt`
- `startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- `healthCheckPath: /health`

Set these environment variables in the Render dashboard:

| Variable | Value |
|---|---|
| `LUNA_CLASSIFIER_URL` | `https://<workspace>--luna-ai-api.modal.run` |
| `LUNA_MODEL_URL` | `https://<workspace>--luna-ollama-serve.modal.run/v1` |
| `LUNA_MODEL_NAME` | `qwen2.5:3b` |
| `LUNA_MODEL_API_KEY` | *(leave empty — Ollama needs no key)* |
| `ENVIRONMENT` | `production` |
| `CORS_ORIGINS` | frontend URL(s), JSON list or comma-separated per `config.py` |
| `DATABASE_URL` | existing database configuration (queue routes/health) |

Deploy, then wait for `/health` to report `healthy`.

## 4. Verify all six endpoints against Render

```powershell
$api = "https://<render-service>.onrender.com"
curl.exe -X POST $api/api/ai/sentiment -H "Content-Type: application/json" -d '{"text":"Great service"}'
curl.exe -X POST $api/api/ai/intent -H "Content-Type: application/json" -d '{"text":"I have been waiting for 40 minutes"}'
curl.exe -X POST $api/api/ai/trends -H "Content-Type: application/json" -d '{"messages":["long wait time","wait time too long"]}'
curl.exe -X POST $api/api/ai/suggested-reply -H "Content-Type: application/json" -d '{"text":"Still waiting","sentiment":"NEGATIVE","intent":"Queue Booking and Delay"}'
curl.exe -X POST $api/api/ai/content-ideas -H "Content-Type: application/json" -d '{"topic":"fast check-in","count":3}'
curl.exe -X POST $api/api/ai/analytics -H "Content-Type: application/json" -d '{"ticket_logs":[{"check_in":"2026-10-16T09:00:00","served_at":"2026-10-16T09:15:00","completed_at":"2026-10-16T09:25:00"}]}'
```

Expected: five `200`s with bodies matching `docs/AI_API.md`; analytics fields
`avg_wait_mins`, `max_wait_mins`, `avg_service_mins`, `total_tickets`.

## 5. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `503` on sentiment/intent | Modal app asleep/cold, or URL wrong | Wait 60 s, retry; check `modal app logs luna-ai` |
| `503` on reply/ideas | Ollama app asleep or model not pulled | Check logs; ensure `qwen2.5:3b` pull finished |
| `422` | Payload validation | See `docs/AI_API.md` limits |
| Very slow first call | Model cache cold (first deploy) | Expected; subsequent calls fast |
| Render build slow | Installing pandas/sklearn | Normal on free tier |
| `502` from Modal URL | Container crashed | `modal app logs <app>` |

## 6. Redeploy / rollback

- Code change: `modal deploy Modal/modal_app.py` (or `ollama_app.py`) — image rebuilds only when the image definition changes.
- Backend change: push to `Daniel` (or `main`) — Render redeploys automatically.
- Rollback: `git revert <commit>` and push; Modal keeps previous deployments in the dashboard for one-click rollback.
