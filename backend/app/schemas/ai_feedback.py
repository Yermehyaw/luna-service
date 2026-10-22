from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.ai_feedback import DatasetKind


class FeedbackCreate(BaseModel):
    business_id: str = Field(min_length=1, max_length=36)
    message: str = Field(min_length=1, max_length=8000)
    suggested_reply: str | None = Field(default=None, max_length=8000)
    final_reply: str | None = Field(default=None, max_length=8000)
    source: str = Field(default="social_query", max_length=32)
    intent: str | None = Field(default=None, max_length=64)
    intent_confidence: float | None = Field(default=None, ge=0, le=1)
    sentiment: str | None = Field(default=None, max_length=16)
    sentiment_score: float | None = Field(default=None, ge=0, le=1)


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    business_id: str
    outcome: str
    intent: str | None
    created_at: datetime


class DatasetExportRequest(BaseModel):
    kind: DatasetKind
    business_id: str | None = Field(default=None, max_length=36)
    min_confidence: float = Field(default=0.85, ge=0, le=1)


class DatasetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    kind: str
    version: str
    sample_count: int
    checksum: str
    storage_path: str
    business_id: str | None
    created_at: datetime


class PurgeResponse(BaseModel):
    deleted: int
