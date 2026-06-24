"""Tests for recruiter-journey event ingest and recent-stream read."""

import json


def _beacon(client, payload: dict) -> object:  # type: ignore[no-untyped-def]
    """POST an event the way the frontend beacon does: text/plain raw body."""
    return client.post(
        "/v1/events",
        content=json.dumps(payload),
        headers={"Content-Type": "text/plain"},
    )


def test_ingest_then_recent_roundtrip(client) -> None:  # type: ignore[no-untyped-def]
    resp = _beacon(
        client,
        {"name": "skill.viewed", "props": {"skillId": "skill:apache-kafka", "via": "graph"}},
    )
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}

    recent = client.get("/v1/events/recent")
    assert recent.status_code == 200
    items = recent.json()["items"]
    assert len(items) == 1
    assert items[0]["type"] == "skill.viewed"
    assert items[0]["target"] == "skill:apache-kafka"


def test_recent_redacts_ip_and_user_agent(client) -> None:  # type: ignore[no-untyped-def]
    _beacon(client, {"name": "ai.asked", "props": {"questionLength": 12, "suggested": True}})
    item = client.get("/v1/events/recent").json()["items"][0]
    assert "ip" not in item
    assert "userAgent" not in item
    assert "meta" not in item  # raw props not exposed publicly


def test_unknown_event_name_is_dropped_silently(client) -> None:  # type: ignore[no-untyped-def]
    resp = _beacon(client, {"name": "totally.bogus", "props": {}})
    assert resp.status_code == 200  # still ok — fire-and-forget
    assert client.get("/v1/events/recent").json()["items"] == []


def test_malformed_body_does_not_error(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.post(
        "/v1/events",
        content="not json at all",
        headers={"Content-Type": "text/plain"},
    )
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}


def test_events_rejected_cross_origin(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.post(
        "/v1/events",
        content=json.dumps({"name": "skill.viewed", "props": {}}),
        headers={"Content-Type": "text/plain", "Origin": "https://evil.example"},
    )
    assert resp.status_code == 403
