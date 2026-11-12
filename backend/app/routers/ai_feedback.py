from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.ai_feedback import DatasetKind
from app.schemas.ai_feedback import (
    DatasetExportRequest,
    DatasetResponse,
    FeedbackCreate,
    FeedbackResponse,
    PurgeResponse,
)
from app.services import ai_feedback, training_data

router = APIRouter(prefix="/api/ai", tags=["AI Training"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.post(
    "/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED
)
async def create_feedback(payload: FeedbackCreate, db: DbSession) -> FeedbackResponse:
    feedback = await ai_feedback.record_feedback(
        db,
        business_id=payload.business_id,
        message=payload.message,
        suggested_reply=payload.suggested_reply,
        final_reply=payload.final_reply,
        source=payload.source,
        intent=payload.intent,
        intent_confidence=payload.intent_confidence,
        sentiment=payload.sentiment,
        sentiment_score=payload.sentiment_score,
    )
    await db.commit()
    await db.refresh(feedback)
    return FeedbackResponse.model_validate(feedback)


@router.get("/feedback", response_model=list[FeedbackResponse])
async def read_feedback(
    db: DbSession,
    business_id: str = Query(min_length=1),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> list[FeedbackResponse]:
    rows = await ai_feedback.list_feedback(
        db, business_id=business_id, limit=limit, offset=offset
    )
    return [FeedbackResponse.model_validate(row) for row in rows]


@router.delete("/feedback/expired", response_model=PurgeResponse)
async def purge_feedback(db: DbSession) -> PurgeResponse:
    deleted = await ai_feedback.purge_expired_feedback(
        db, settings.AI_FEEDBACK_RETENTION_DAYS
    )
    await db.commit()
    return PurgeResponse(deleted=deleted)


@router.post(
    "/training/export",
    response_model=DatasetResponse,
    status_code=status.HTTP_201_CREATED,
)
async def export_training_dataset(
    payload: DatasetExportRequest, db: DbSession
) -> DatasetResponse:
    try:
        dataset = await training_data.export_dataset(
            db,
            kind=payload.kind,
            output_dir=settings.AI_TRAINING_EXPORT_DIR,
            min_confidence=payload.min_confidence,
            business_id=payload.business_id,
        )
    except OSError as error:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Training export directory is not writable",
        ) from error

    await db.commit()
    await db.refresh(dataset)
    return DatasetResponse.model_validate(dataset)


@router.get("/training/datasets", response_model=list[DatasetResponse])
async def read_datasets(
    db: DbSession,
    kind: DatasetKind | None = None,
    limit: int = Query(default=50, ge=1, le=500),
) -> list[DatasetResponse]:
    datasets = await training_data.list_datasets(db, kind=kind, limit=limit)
    return [DatasetResponse.model_validate(dataset) for dataset in datasets]
