from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai.models.sentiment import SentimentClassifier
from ai.models.intent import IntentClassifier
from ai.pipelines.keyword_trends import TrendExtractor

router = APIRouter(prefix="/api/v1/ai", tags=["AI & Intelligence Engine"])

# Lazy / singleton initializations
sentiment_model = SentimentClassifier()
intent_model = IntentClassifier()
trend_extractor = TrendExtractor()

class TextPayload(BaseModel):
    text: str

class BatchTextPayload(BaseModel):
    messages: list[str]

@router.post("/sentiment")
async def get_sentiment(payload: TextPayload):
    return sentiment_model.analyze(payload.text)

@router.post("/intent")
async def get_intent(payload: TextPayload):
    return intent_model.classify(payload.text)

@router.post("/trends")
async def get_trends(payload: BatchTextPayload):
    return {"trends": trend_extractor.extract_top_issues(payload.messages)}