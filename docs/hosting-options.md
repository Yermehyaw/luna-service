# Luna AI — Hosting Options (Pros & Cons)

Decision doc for where the AI models run. Covers every path considered for
DistilBERT (sentiment), BART-large-MNLI (intent), and Qwen2.5 (replies/content ideas).

## Requirements the host must meet

| Constraint | Value |
|---|---|
| RAM for BART-large + DistilBERT + Qwen2.5-3B | ~8–12 GB |
| Disk for model weights | ~8 GB |
| Process lifetime | Long-running HTTP service (not serverless 10s functions) |
| CPU inference | Acceptable; GPU not required |
| Cost | Ideally $0 for the demo |

## Options at a glance

| Option | Cost | Card needed | Fits models | Cold start | Demo risk |
|---|---|---|---|---|---|
| Modal (free tier) | $0 ($30/mo credits) | No | Yes | ~20–60 s after idle | Low (credits run out only under heavy use) |
| HF PRO Space (Docker) | $9/mo | Yes | Yes | ~60–120 s build/first boot | Low |
| Google Cloud Run | $0 within free quota | Yes | Yes (2–4 GB) | ~5–15 s | Low |
| Oracle Cloud Always Free | $0 | Yes | Yes (24 GB ARM) | ~1 min boot | Medium (signup rejections, ARM wheels) |
| Render Free (backend only) | $0 | No | **No** (512 MB) | n/a | Classification 503 |
| Render Standard 2 GB (all-in-one) | $7/mo | Yes | Yes (tight) | 0 (always on) | Low |
| Local laptop demo | $0 | No | Yes | 0 | Medium (network/laptop failure) |
| "Unlimited RAM" free hosts | "Free" | No | Claimed | Unknown | **Unacceptable** |

## 1. Modal — chosen

Runs `Modal/modal_app.py` on Modal's serverless infrastructure with scale-to-zero.
Weights cached in a Modal Volume.

**Pros**
- $0 upfront: starter plan includes $30/month of compute, no credit card.
- Handles the full stack: both classifiers and Qwen2.5-3B in one deployment.
- Backend on Render stays tiny — no torch, no model downloads at build time.
- Scale-to-zero: costs near zero when the demo is idle.
- Simple deploy: `modal deploy Modal/modal_app.py`.
- Volumes persist model weights, so cold starts load from disk instead of HF.
- No lock-in at the API level: OpenAI-compatible `/v1/chat/completions`.

**Cons**
- Cold start (20–60 s) after idle — first request of the demo is slow.
- Not strictly "HuggingFace-hosted" if the grader interprets the requirement literally.
- Qwen2.5-3B on CPU generates ~1–3 tokens/sec; replies take several seconds.
- Free credits are usage-based; a careless load test could burn them.
- Vendor-specific deploy CLI (not git-push like Vercel).

**Verdict:** best free path to a working, testable deployment today.

### 1a. Ollama on Modal (generation)

`Modal/ollama_app.py` runs `ollama serve` on CPU with `qwen2.5:3b` cached in a Modal
Volume and exposes Ollama's OpenAI-compatible `/v1/chat/completions`, so the backend
uses it with no code changes.

**Pros**
- Satisfies the team's Ollama requirement while staying on the free Modal tier.
- One command deploy; models persist in a Volume between cold starts.
- Backend is provider-agnostic: swaps between Ollama and Qwen/transformers by URL.
- Native Ollama endpoints (`/api/chat`, `/api/generate`) are also available for manual testing.

**Cons**
- Ollama cannot serve DistilBERT or BART classifiers — those stay in `modal_app.py`
  (transformers). Ollama only covers generation (replies/content ideas).
- Larger cold-start download (~2 GB) the first time the volume is empty.
- CPU-only generation is slow (~1–3 tokens/sec); replies take a few seconds.
- Same vendor caveat as Modal itself.

**Verdict:** use `ollama_app.py` for generation and `modal_app.py` for classification —
both free, both deployed from the `Modal/` folder.

## 2. HF PRO Docker Space — strict-HF path

`hf-space/` is already written for this: Docker Space serving `/sentiment` and `/intent`,
plus generation through HF Inference Providers.

**Pros**
- Literally "models run on HuggingFace" — safest interpretation of the requirement.
- Direct URL (`https://<user>-luna-classifier.hf.space`), no extra accounts.
- Inference Providers monthly credits cover replies/ideas for a demo.
- Weights and compute in one place; familiar to the team lead.

**Cons**
- **$9/month PRO required** — free tier permits neither Docker Spaces nor inference (verified: 402/410 responses, static-SDK constraints).
- One more paid subscription for a class project.
- Space sleeping/cold builds can be slow on free CPU tier.
- The 3B generation model is not included; generation depends on Inference credits.

**Verdict:** adopt if the lead insists on strict HuggingFace hosting and someone funds PRO.

## 3. Google Cloud Run

Matches the build schedule ("Cloud Run for FastAPI").

**Pros**
- Free monthly quota is generous for demo traffic.
- Container-based: same image as the HF Space works with minimal changes.
- Scales to zero; up to 4–8 GB RAM per instance.
- Keeps everything on one cloud provider with a credible "production" story.

**Cons**
- **Billing account/card required**, even inside the free tier.
- Per-request cold starts unless a minimum instance is paid for.
- Dockerfile + Artifact Registry + IAM setup is more ceremony than Modal.
- Easy to accidentally exceed quota with a 12 GB container.

**Verdict:** best free-*quota* option when a card is available; strongest technical story.

## 4. Oracle Cloud Always Free

**Pros**
- 24 GB RAM ARM VM free forever — huge headroom.
- Full VM: SSH, systemd, Ollama if ever needed.
- No per-request cold starts.

**Cons**
- Signup frequently rejected; card required for verification.
- ARM compatibility friction (torch wheels are fine now, but ARM builds can be slower).
- You own patching, TLS, firewall, restarts — an outage is your fault.
- Setup time is hours, not minutes.

**Verdict:** only if someone already has an Oracle account with a running VM.

## 5. Render — backend host (used regardless)

**Pros**
- Already deployed there; `render.yaml` is committed.
- Free tier is enough because it only hosts the thin FastAPI backend.
- Git-push deploys.

**Cons**
- 512 MB free instance cannot run BART — this is why models moved off Render.
- Free instances sleep after inactivity (~50 s wake).
- Paid 2 GB instance ($7/mo) is the fallback if we ever want an all-in-one deploy.

## 6. Local laptop demo

**Pros**
- Zero cost, zero latency, full control.
- Easy to show the models loading and answering in real time.

**Cons**
- Demo depends on one machine and one network.
- Not a deployed URL, weaker for the "it's live" criterion.
- Installs torch + ~8 GB of weights on the presenter's disk.

## 7. "Unlimited/40 TB RAM" free hosts — rejected

Advertised free RAM far beyond physical reality is a scam signal: crypto-mining
panels, credential harvesters, trial-cycling farms, or services that vanish mid-demo.

- Risks: leaked HF/Render tokens, account bans, silent data loss, no reproducibility.
- They also solve a problem we do not have: BART needs 1.6 GB, not terabytes.
- A graded deliverable must point at infrastructure that can be audited.

## Recommendation

1. **Now:** deploy `Modal/modal_app.py` (free, no card) → set `LUNA_CLASSIFIER_URL`
   and `LUNA_MODEL_URL` on Render. This is the demo path.
2. **If the lead requires strict HuggingFace:** buy HF PRO ($9) and deploy `hf-space/`;
   only two env vars change.
3. **If a card is acceptable and a more "production" story is wanted:** move the same
   container to Cloud Run.

The backend never changes between paths — `LUNA_CLASSIFIER_URL` and `LUNA_MODEL_URL`
are the only switches.
