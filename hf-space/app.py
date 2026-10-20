from functools import lru_cache

from fastapi import FastAPI
from pydantic import BaseModel

SENTIMENT_MODEL = "distilbert-base-uncased-finetuned-sst-2-english"
INTENT_MODEL = "facebook/bart-large-mnli"

CANDIDATE_LABELS = [
    "Billing and Payment",
    "Queue Booking and Delay",
    "Document Verification Issue",
    "General Inquiry",
    "Technical Bug",
]

app = FastAPI(title="Luna Classifier VM")


class TextPayload(BaseModel):
    text: str


@lru_cache(maxsize=1)
def sentiment_pipeline():
    from transformers import pipeline

    return pipeline("sentiment-analysis", model=SENTIMENT_MODEL)


@lru_cache(maxsize=1)
def intent_pipeline():
    from transformers import pipeline

    return pipeline("zero-shot-classification", model=INTENT_MODEL)


@app.get("/")
def root():
    return {"status": "ok", "service": "luna-classifier"}


@app.post("/sentiment")
def sentiment(payload: TextPayload):
    result = sentiment_pipeline()(payload.text)[0]
    return {"label": result["label"], "score": round(float(result["score"]), 4)}


@app.post("/intent")
def intent(payload: TextPayload):
    result = intent_pipeline()(payload.text, candidate_labels=CANDIDATE_LABELS)
    return {
        "intent": result["labels"][0],
        "confidence": round(float(result["scores"][0]), 4),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=7860)
