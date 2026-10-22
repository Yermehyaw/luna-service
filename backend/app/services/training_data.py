import hashlib
import json
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_feedback import (
    AIFeedback,
    AITrainingDataset,
    DatasetKind,
    FeedbackOutcome,
)
from app.services.pii import scrub_pii

REPLY_TRAINING_OUTCOMES = (
    FeedbackOutcome.ACCEPTED.value,
    FeedbackOutcome.EDITED.value,
)


def build_export_rows(
    kind: DatasetKind,
    feedback_rows: list[AIFeedback],
    min_confidence: float = 0.85,
) -> list[dict]:
    """Turn stored feedback into training records, with no human labeling step.

    Reply pairs use the text staff actually sent; the edit itself is the label.
    Intent rows are the high-confidence classifier outputs we trust as a teacher.
    """
    records: list[dict] = []
    for row in feedback_rows:
        if kind is DatasetKind.REPLY_PAIRS:
            reply = (row.final_reply or "").strip()
            if row.outcome not in REPLY_TRAINING_OUTCOMES or not reply:
                continue
            records.append(
                {
                    "text": scrub_pii(row.message_text),
                    "reply": scrub_pii(reply),
                    "outcome": row.outcome,
                    "intent": row.intent,
                }
            )
        else:
            if row.intent is None or row.intent_confidence is None:
                continue
            if row.intent_confidence < min_confidence:
                continue
            records.append(
                {
                    "text": scrub_pii(row.message_text),
                    "intent": row.intent,
                    "confidence": row.intent_confidence,
                }
            )
    return records


async def export_dataset(
    db: AsyncSession,
    *,
    kind: DatasetKind,
    output_dir: str,
    min_confidence: float = 0.85,
    business_id: str | None = None,
) -> AITrainingDataset:
    statement = select(AIFeedback)
    if business_id is not None:
        statement = statement.where(AIFeedback.business_id == business_id)

    feedback_rows = list((await db.execute(statement)).scalars().all())
    records = build_export_rows(kind, feedback_rows, min_confidence)

    existing = await db.scalar(
        select(func.count())
        .select_from(AITrainingDataset)
        .where(AITrainingDataset.kind == kind.value)
    )
    version = f"{kind.value}-v{(existing or 0) + 1}"

    directory = Path(output_dir)
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{version}.jsonl"
    with path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")

    dataset = AITrainingDataset(
        kind=kind.value,
        version=version,
        sample_count=len(records),
        checksum=hashlib.sha256(path.read_bytes()).hexdigest(),
        storage_path=str(path),
        business_id=business_id,
    )
    db.add(dataset)
    await db.flush()
    return dataset


async def list_datasets(
    db: AsyncSession,
    *,
    kind: DatasetKind | None = None,
    limit: int = 50,
) -> list[AITrainingDataset]:
    statement = select(AITrainingDataset)
    if kind is not None:
        statement = statement.where(AITrainingDataset.kind == kind.value)
    result = await db.execute(
        statement.order_by(AITrainingDataset.created_at.desc()).limit(limit)
    )
    return list(result.scalars().all())
