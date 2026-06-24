"""Tests for the metric worker and the admin metrics endpoint."""

from app.services import metric_service
from app.worker.handler import handler


def _stream_event(event_type: str) -> dict:
    """A DynamoDB Streams INSERT record for an EVENT item (typed NewImage)."""
    return {
        "Records": [
            {
                "eventName": "INSERT",
                "dynamodb": {
                    "NewImage": {
                        "entity": {"S": "EVENT"},
                        "type": {"S": event_type},
                        "id": {"S": "01TESTID"},
                    }
                },
            }
        ]
    }


def test_worker_increments_metric_counters(dynamodb_table) -> None:  # type: ignore[no-untyped-def]
    result = handler(_stream_event("skill.viewed"))
    assert result == {"processed": 1}
    handler(_stream_event("skill.viewed"))
    handler(_stream_event("ai.asked"))

    metrics = metric_service.get_today_metrics(daily_ai_cap=200)
    assert metrics.events_total == 3
    assert metrics.by_type["skill.viewed"] == 2
    assert metrics.by_type["ai.asked"] == 1


def test_worker_ignores_non_event_items(dynamodb_table) -> None:  # type: ignore[no-untyped-def]
    record = {
        "Records": [
            {
                "eventName": "INSERT",
                "dynamodb": {"NewImage": {"entity": {"S": "CONTACT"}, "id": {"S": "x"}}},
            }
        ]
    }
    assert handler(record) == {"processed": 0}


def test_worker_tolerates_empty_batch() -> None:
    assert handler({"Records": []}) == {"processed": 0}


def test_ai_metrics_requires_admin(client) -> None:  # type: ignore[no-untyped-def]
    assert client.get("/v1/ai-metrics").status_code == 401


def test_ai_metrics_returns_zeroed_today(admin_client) -> None:  # type: ignore[no-untyped-def]
    resp = admin_client.get("/v1/ai-metrics")
    assert resp.status_code == 200
    body = resp.json()
    assert body["events_total"] == 0
    assert body["ai_daily_cap"] == 200
    assert body["by_type"] == {}
