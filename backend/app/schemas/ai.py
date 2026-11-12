from datetime import datetime

from pydantic import BaseModel, Field


class TextPayload(BaseModel):
    text: str = Field(min_length=1, max_length=4000)


class BatchTextPayload(BaseModel):
    messages: list[str] = Field(min_length=1, max_length=500)


class SentimentResponse(BaseModel):
    label: str
    score: float


class IntentResponse(BaseModel):
    intent: str
    confidence: float


class KeywordTrend(BaseModel):
    keyword: str
    score: float


class TrendsResponse(BaseModel):
    trends: list[KeywordTrend]


class SuggestedReplyRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    sentiment: str = ""
    intent: str = ""


class SuggestedReplyResponse(BaseModel):
    reply: str


class ContentIdeasRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=500)
    count: int = Field(default=3, ge=1, le=10)


class ContentIdeasResponse(BaseModel):
    ideas: list[str]


class TicketLog(BaseModel):
    check_in: datetime
    served_at: datetime
    completed_at: datetime


class QueueAnalyticsRequest(BaseModel):
    ticket_logs: list[TicketLog] = Field(min_length=1)


class QueueAnalyticsResponse(BaseModel):
    avg_wait_mins: float
    max_wait_mins: float
    avg_service_mins: float
    total_tickets: int
