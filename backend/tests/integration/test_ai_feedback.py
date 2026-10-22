import json
from datetime import datetime, timedelta, timezone

from sqlalchemy import update

from app.models.ai_feedback import AIFeedback



async def test_feedback_captured_without_any_staff_interaction(client, tenant):
    response = await client.post(
        "/api/ai/feedback",
        json={
            "business_id": tenant["business_id"],
            "message": "Where is my refund? Mail me at ada@example.com",
            "suggested_reply": "We are checking your refund now.",
            "final_reply": "We are checking your refund now.",
            "intent": "refund_request",
            "intent_confidence": 0.93,
            "sentiment": "negative",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["outcome"] == "accepted"
    assert "ada@example.com" not in response.text


async def test_feedback_outcome_is_derived_from_sent_text(client, tenant):
    response = await client.post(
        "/api/ai/feedback",
        json={
            "business_id": tenant["business_id"],
            "message": "Still waiting",
            "suggested_reply": "Sorry for the wait.",
            "final_reply": "Sorry for the wait, you are next in line.",
        },
    )

    assert response.status_code == 201
    assert response.json()["outcome"] == "edited"


async def test_feedback_is_tenant_scoped(client, tenant, other_tenant):
    await client.post(
        "/api/ai/feedback",
        json={
            "business_id": tenant["business_id"],
            "message": "Tenant A message",
            "suggested_reply": "A",
            "final_reply": "A",
        },
    )
    await client.post(
        "/api/ai/feedback",
        json={
            "business_id": other_tenant["business_id"],
            "message": "Tenant B message",
            "suggested_reply": "B",
            "final_reply": "B",
        },
    )

    response = await client.get(
        "/api/ai/feedback", params={"business_id": tenant["business_id"]}
    )

    assert response.status_code == 200
    rows = response.json()
    assert len(rows) == 1
    assert rows[0]["business_id"] == tenant["business_id"]


async def test_export_writes_versioned_jsonl_and_registers_it(
    client, tenant, session_factory, tmp_path, monkeypatch
):
    from app.core.config import settings

    monkeypatch.setattr(settings, "AI_TRAINING_EXPORT_DIR", str(tmp_path))

    await client.post(
        "/api/ai/feedback",
        json={
            "business_id": tenant["business_id"],
            "message": "I want a refund",
            "suggested_reply": "Let me check that for you.",
            "final_reply": "Let me check your refund right away.",
            "intent": "refund_request",
            "intent_confidence": 0.95,
        },
    )
    await client.post(
        "/api/ai/feedback",
        json={
            "business_id": tenant["business_id"],
            "message": "Unclear message",
            "suggested_reply": "Can you share more?",
            "final_reply": "Can you share more?",
            "intent": "other",
            "intent_confidence": 0.3,
        },
    )

    reply_export = await client.post(
        "/api/ai/training/export",
        json={"kind": "reply_pairs", "business_id": tenant["business_id"]},
    )
    intent_export = await client.post(
        "/api/ai/training/export",
        json={
            "kind": "intent_distill",
            "business_id": tenant["business_id"],
            "min_confidence": 0.85,
        },
    )

    assert reply_export.status_code == 201
    assert intent_export.status_code == 201
    assert reply_export.json()["version"] == "reply_pairs-v1"
    assert reply_export.json()["sample_count"] == 2
    assert intent_export.json()["sample_count"] == 1

    path = reply_export.json()["storage_path"]
    lines = [
        json.loads(line)
        for line in open(path, encoding="utf-8").read().splitlines()
        if line
    ]
    assert lines[0]["reply"] == "Let me check your refund right away."

    second_export = await client.post(
        "/api/ai/training/export",
        json={"kind": "reply_pairs", "business_id": tenant["business_id"]},
    )
    assert second_export.json()["version"] == "reply_pairs-v2"

    listing = await client.get("/api/ai/training/datasets", params={"kind": "reply_pairs"})
    assert listing.status_code == 200
    versions = [item["version"] for item in listing.json()]
    assert "reply_pairs-v1" in versions


async def test_purge_removes_rows_older_than_retention(
    client, tenant, session_factory
):
    created = await client.post(
        "/api/ai/feedback",
        json={
            "business_id": tenant["business_id"],
            "message": "Old message",
            "suggested_reply": "Hi",
            "final_reply": "Hi",
        },
    )
    feedback_id = created.json()["id"]

    async with session_factory() as session:
        await session.execute(
            update(AIFeedback)
            .where(AIFeedback.id == feedback_id)
            .values(created_at=datetime.now(timezone.utc) - timedelta(days=400))
        )
        await session.commit()

    response = await client.delete("/api/ai/feedback/expired")

    assert response.status_code == 200
    assert response.json()["deleted"] >= 1
