# LUNA AI — Learning Plan (Feedback Capture + Training Assets)

Goal: Luna gets better as it is used, without adding a single step to staff workflow.
Staff keep serving customers exactly as they do today; the backend captures what
already happens and turns it into versioned training data.

No retagging, no accept/edit/reject buttons, no extra UI. Everything below is
server-side.

---

## 1. Signals we already have

| Signal | Source | Used for |
|---|---|---|
| Inbound message text | Social Studio queries / API | Training input |
| Suggested reply | AI generation layer | Baseline for comparison |
| Reply actually sent | Staff sending a normal reply | Ground-truth target for replies |
| Suggestion vs sent text | Derived on write | Outcome: accepted / edited / unused (edit = the label) |
| Intent + confidence | Classifier on ingest | Distillation teacher labels |
| Sentiment + score | Classifier on ingest | Triage stats, later sentiment distillation |
| Follow-up complaint / reopen | Queue + query state | Weak "bad reply" signal |
| Clean close | Queue + query state | Weak "good reply" signal |

The customer never tags anything. Staff never tag anything. The only human action
recorded is the reply the staff already sends.

## 2. Item 1 — Feedback capture (implemented)

Tables:

- `ai_feedback` — tenant-scoped row per suggestion: scrubbed message text, suggested
  reply, final reply, derived outcome, intent/confidence, sentiment/score.
- `ai_training_datasets` — registry for exported, versioned datasets.

Behaviour:

- `POST /api/ai/feedback` — records the pair and derives the outcome from the texts.
- `GET /api/ai/feedback?business_id=` — tenant-scoped retrieval.
- `DELETE /api/ai/feedback/expired` — enforces retention (default 180 days).
- PII (emails, phone numbers, 10+ digit identifiers) is redacted at ingest and again
  at export. Raw text never leaves the database unscrubbed.

Derivation rule:

- final sent text equals suggestion → `accepted`
- final sent text differs → `edited` (final text becomes the training target)
- nothing sent → `unused` (not exported as a reply pair)

## 3. Item 4 — Versioned training assets (implemented)

- `POST /api/ai/training/export` with `kind`:
  - `reply_pairs` — `{text, reply, outcome, intent}` from accepted/edited rows.
  - `intent_distill` — `{text, intent, confidence}` from rows at or above
    `AI_DISTILL_MIN_CONFIDENCE` (default 0.85).
- Each export writes `training_exports/<kind>-v<n>.jsonl`, computes a SHA-256
  checksum, and inserts a registry row (kind, version, sample count, checksum, path,
  tenant).
- `GET /api/ai/training/datasets` lists exports so a fine-tune run is reproducible
  by version, not by "the file someone had on their laptop".
- Assets live in our storage (later: blob bucket), never on the model host — moving
  to a self-hosted model is a copy, not a migration.

## 4. What we do with the exports

1. **Intent distillation:** BART labels traffic; exports keep high-confidence rows;
   a small DistilBERT student is trained on them. Target: same accuracy, 5–10× lower
   cost and latency. No human labels required.
2. **Reply quality:** accepted/edited pairs fine-tune the generation model (LoRA),
   starting with edited pairs because they show what staff consider better.
3. **Weak reward signal:** later, clean-close vs follow-up-complaint becomes a
   preference signal for ranking suggestions.
4. **Evaluation:** a small hand-built holdout (under an hour, once) is used only to
   measure, never as training data. Chat exports remain self-labelled.

## 5. Privacy

- Feedback rows are not customer records; they expire after the retention window.
- Exports are scrubbed a second time, so old rows cannot sneak PII in.
- Exports are tenant-filterable (`business_id`), so a business's data can be
  excluded or deleted independently.
- No third-party model sees raw traffic in this loop: labels come from our own
  classifier and from the replies our staff send.

## 6. Non-goals

- No UI changes for staff.
- No manual labelling queue.
- No conversation history storage on the model host.

## 7. Open items

- Schema is created from models today (`app/create_tables.py`); add the Alembic
  revision once the migrations baseline lands, then this table follows the same flow.
- Follow-up-complaint scoring depends on queue/query lifecycle hooks; phase 3.
- Export directory should move to object storage before real traffic
  (`AI_TRAINING_EXPORT_DIR`).
- Authentication on the feedback/training routes follows the platform auth work
  (same gap as the rest of the API).
