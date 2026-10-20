from functools import lru_cache

from fastapi import APIRouter, HTTPException, status

from app.ai.client import LunaModelClient
from app.ai.pipelines.keyword_trends import TrendExtractor
from app.ai.pipelines.queue_analytics import QueueAnalyticsEngine
from app.schemas.ai import (
    BatchTextPayload,
    ContentIdeasRequest,
    ContentIdeasResponse,
    IntentResponse,
    KeywordTrend,
    QueueAnalyticsRequest,
    QueueAnalyticsResponse,
    SentimentResponse,
    SuggestedReplyRequest,
    SuggestedReplyResponse,
    TextPayload,
    TrendsResponse,
)

router = APIRouter(prefix="/api/ai", tags=["AI & Intelligence"])


@lru_cache(maxsize=1)
def get_luna_client() -> LunaModelClient:
    return LunaModelClient()


@router.post("/sentiment", response_model=SentimentResponse)
def analyze_sentiment(payload: TextPayload) -> SentimentResponse:
    try:
        result = get_luna_client().sentiment(payload.text)
    except Exception as error:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Sentiment analysis is unavailable",
        ) from error
    return SentimentResponse(label=result.label, score=result.score)


@router.post("/intent", response_model=IntentResponse)
def classify_intent(payload: TextPayload) -> IntentResponse:
    try:
        result = get_luna_client().intent(payload.text)
    except Exception as error:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Intent classification is unavailable",
        ) from error
    return IntentResponse(intent=result.intent, confidence=result.confidence)


@router.post("/trends", response_model=TrendsResponse)
def extract_trends(payload: BatchTextPayload) -> TrendsResponse:
    try:
        trends = TrendExtractor.extract_top_issues(payload.messages)
    except Exception as error:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Trend extraction is unavailable",
        ) from error
    return TrendsResponse(
        trends=[KeywordTrend(keyword=keyword, score=score) for keyword, score in trends]
    )


@router.post("/suggested-reply", response_model=SuggestedReplyResponse)
def suggest_reply(payload: SuggestedReplyRequest) -> SuggestedReplyResponse:
    try:
        reply = get_luna_client().suggest_reply(
            payload.text,
            sentiment=payload.sentiment,
            intent=payload.intent,
        )
    except Exception as error:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Suggested reply service is unavailable",
        ) from error
    return SuggestedReplyResponse(reply=reply)


@router.post("/content-ideas", response_model=ContentIdeasResponse)
def generate_content_ideas(payload: ContentIdeasRequest) -> ContentIdeasResponse:
    try:
        ideas = get_luna_client().content_ideas(payload.topic, count=payload.count)
    except Exception as error:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Content ideas service is unavailable",
        ) from error
    return ContentIdeasResponse(ideas=ideas)


@router.post("/analytics", response_model=QueueAnalyticsResponse)
def queue_analytics(payload: QueueAnalyticsRequest) -> QueueAnalyticsResponse:
    try:
        metrics = QueueAnalyticsEngine.calculate_metrics(
            [log.model_dump() for log in payload.ticket_logs]
        )
    except Exception as error:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "Could not compute analytics for the supplied ticket logs",
        ) from error
    return QueueAnalyticsResponse(**metrics)
