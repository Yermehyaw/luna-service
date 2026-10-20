from unittest.mock import MagicMock, patch

from httpx import AsyncClient

from app.ai.client import LunaModelClient, LunaModelError
from app.ai.models.intent import IntentClassifier, IntentResult
from app.ai.models.sentiment import SentimentClassifier, SentimentResult

SENTIMENT_GETTER = "app.routers.ai.get_sentiment_classifier"
INTENT_GETTER = "app.routers.ai.get_intent_classifier"
LUNA_CLIENT_GETTER = "app.routers.ai.get_luna_client"


async def test_sentiment_endpoint_returns_model_output(client: AsyncClient):
    model = MagicMock(spec=SentimentClassifier)
    model.analyze.return_value = SentimentResult(label="POSITIVE", score=0.9876)

    with patch(SENTIMENT_GETTER, return_value=model):
        response = await client.post(
            "/api/ai/sentiment", json={"text": "The service was excellent!"}
        )

    assert response.status_code == 200
    assert response.json() == {"label": "POSITIVE", "score": 0.9876}
    model.analyze.assert_called_once_with("The service was excellent!")


async def test_sentiment_endpoint_returns_503_when_model_is_down(client: AsyncClient):
    with patch(SENTIMENT_GETTER, side_effect=RuntimeError("weights missing")):
        response = await client.post("/api/ai/sentiment", json={"text": "hello"})

    assert response.status_code == 503
    assert response.json()["detail"] == "Sentiment analysis is unavailable"


async def test_sentiment_endpoint_rejects_empty_text(client: AsyncClient):
    response = await client.post("/api/ai/sentiment", json={"text": ""})

    assert response.status_code == 422


async def test_intent_endpoint_returns_model_output(client: AsyncClient):
    model = MagicMock(spec=IntentClassifier)
    model.classify.return_value = IntentResult(
        intent="Queue Booking and Delay", confidence=0.9321
    )

    with patch(INTENT_GETTER, return_value=model):
        response = await client.post(
            "/api/ai/intent", json={"text": "I have been waiting for 40 minutes"}
        )

    assert response.status_code == 200
    assert response.json() == {
        "intent": "Queue Booking and Delay",
        "confidence": 0.9321,
    }
    model.classify.assert_called_once_with("I have been waiting for 40 minutes")


async def test_intent_endpoint_returns_503_when_model_is_down(client: AsyncClient):
    with patch(INTENT_GETTER, side_effect=RuntimeError("weights missing")):
        response = await client.post("/api/ai/intent", json={"text": "hello"})

    assert response.status_code == 503


async def test_trends_endpoint_extracts_keywords_with_tfidf(client: AsyncClient):
    response = await client.post(
        "/api/ai/trends",
        json={
            "messages": [
                "The wait time at this branch is far too long",
                "I waited an hour, the wait time is unacceptable",
                "Long wait time again today",
            ]
        },
    )

    assert response.status_code == 200
    trends = response.json()["trends"]
    assert trends
    keywords = [trend["keyword"] for trend in trends]
    assert any("wait" in keyword for keyword in keywords)


async def test_trends_endpoint_returns_empty_list_without_meaningful_text(
    client: AsyncClient,
):
    response = await client.post("/api/ai/trends", json={"messages": ["the and of"]})

    assert response.status_code == 200
    assert response.json() == {"trends": []}


async def test_suggested_reply_endpoint_passes_context(client: AsyncClient):
    model = MagicMock(spec=LunaModelClient)
    model.suggest_reply.return_value = "Sorry for the wait. We are serving you now."

    with patch(LUNA_CLIENT_GETTER, return_value=model):
        response = await client.post(
            "/api/ai/suggested-reply",
            json={
                "text": "Still waiting in line",
                "sentiment": "NEGATIVE",
                "intent": "Queue Booking and Delay",
            },
        )

    assert response.status_code == 200
    assert response.json() == {
        "reply": "Sorry for the wait. We are serving you now."
    }
    model.suggest_reply.assert_called_once_with(
        "Still waiting in line",
        sentiment="NEGATIVE",
        intent="Queue Booking and Delay",
    )


async def test_suggested_reply_endpoint_returns_503_when_model_is_down(
    client: AsyncClient,
):
    model = MagicMock(spec=LunaModelClient)
    model.suggest_reply.side_effect = LunaModelError("provider down")

    with patch(LUNA_CLIENT_GETTER, return_value=model):
        response = await client.post(
            "/api/ai/suggested-reply", json={"text": "Still waiting"}
        )

    assert response.status_code == 503


async def test_content_ideas_endpoint_respects_count(client: AsyncClient):
    model = MagicMock(spec=LunaModelClient)
    model.content_ideas.return_value = ["idea one", "idea two"]

    with patch(LUNA_CLIENT_GETTER, return_value=model):
        response = await client.post(
            "/api/ai/content-ideas", json={"topic": "fast check-in", "count": 2}
        )

    assert response.status_code == 200
    assert response.json() == {"ideas": ["idea one", "idea two"]}
    model.content_ideas.assert_called_once_with("fast check-in", count=2)


async def test_analytics_endpoint_computes_wait_metrics(client: AsyncClient):
    payload = {
        "ticket_logs": [
            {
                "check_in": "2026-10-16 09:00:00",
                "served_at": "2026-10-16 09:15:00",
                "completed_at": "2026-10-16 09:25:00",
            },
            {
                "check_in": "2026-10-16 09:10:00",
                "served_at": "2026-10-16 09:30:00",
                "completed_at": "2026-10-16 09:40:00",
            },
        ]
    }

    response = await client.post("/api/ai/analytics", json=payload)

    assert response.status_code == 200
    assert response.json() == {
        "avg_wait_mins": 17.5,
        "max_wait_mins": 20.0,
        "avg_service_mins": 10.0,
        "total_tickets": 2,
    }


async def test_analytics_endpoint_rejects_empty_logs(client: AsyncClient):
    response = await client.post("/api/ai/analytics", json={"ticket_logs": []})

    assert response.status_code == 422
