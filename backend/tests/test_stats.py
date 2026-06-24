"""Tests for the public observability stats endpoint."""

from app.models.ai_query import new_ai_query_item
from app.services.stats_service import _percentile, get_public_stats
from app.worker.handler import handler


def _event(event_type: str) -> dict:
    return {
        "Records": [
            {
                "eventName": "INSERT",
                "dynamodb": {
                    "NewImage": {
                        "entity": {"S": "EVENT"},
                        "type": {"S": event_type},
                        "id": {"S": "x"},
                    }
                },
            }
        ]
    }


def test_percentile_nearest_rank() -> None:
    values = [10, 20, 30, 40, 100]
    assert _percentile(values, 50) == 30
    assert _percentile(values, 95) == 100
    assert _percentile([], 50) == 0


def test_stats_is_public_and_zeroed(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.get("/v1/stats")
    assert resp.status_code == 200
    body = resp.json()
    assert body["events_total"] == 0
    assert body["ai_latency"]["samples"] == 0
    # Never leaks the spend cap.
    assert "ai_daily_cap" not in body


def test_stats_reflects_events_and_latency(dynamodb_table) -> None:  # type: ignore[no-untyped-def]
    from app.db.dynamodb import get_table

    # Seed some events through the worker.
    handler(_event("skill.viewed"))
    handler(_event("skill.viewed"))
    handler(_event("ai.asked"))

    # Seed AIQUERY items with known latencies.
    table = get_table()
    for ms in (100, 200, 900):
        table.put_item(
            Item=new_ai_query_item(
                question="q",
                sources=["about"],
                answer_chars=10,
                latency_ms=ms,
                model="claude-haiku-4-5",
            )
        )

    stats = get_public_stats()
    assert stats.events_total == 3
    assert stats.by_type["skill.viewed"] == 2
    assert stats.ai_latency.samples == 3
    assert stats.ai_latency.p50 == 200
    assert stats.ai_latency.p95 == 900
