"""Tests for Ask Surya AI — RAG orchestration, spend cap, and the endpoints.

The Anthropic call (`_generate_answer`) is always mocked, so no key or network
is needed; we verify the orchestration, citations, related-skill mapping, the
daily cap (429), and the unavailable path (503).
"""

import os

import pytest
from app.services import ask_service


@pytest.fixture
def with_ai_key():
    """Configure an API key and reset the cached settings so /ask is enabled."""
    os.environ["ANTHROPIC_API_KEY"] = "sk-test-key"
    from app.core.config import get_settings

    get_settings.cache_clear()
    yield
    os.environ.pop("ANTHROPIC_API_KEY", None)
    get_settings.cache_clear()


@pytest.fixture
def mock_generate(monkeypatch):
    """Replace the Claude call with a deterministic stub."""

    def _fake(question, chunks):
        return (f"Answer about: {question[:30]}", 100, 50)

    monkeypatch.setattr(ask_service, "_generate_answer", _fake)


def test_ask_unavailable_without_key(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.post("/v1/ask", json={"question": "Has Surya used Kafka?"})
    assert resp.status_code == 503


def test_ask_returns_answer_with_citations(client, with_ai_key, mock_generate) -> None:  # type: ignore[no-untyped-def]
    resp = client.post(
        "/v1/ask",
        json={"question": "Has Surya worked with distributed systems?"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["answer"].startswith("Answer about:")
    assert len(body["sources"]) > 0
    assert all("ref" in s and "href" in s for s in body["sources"])
    # Distributed-systems question should relate to some skill nodes.
    assert any(s.startswith("skill:") for s in body["relatedSkills"])


def test_ask_logs_query_for_admin(client, admin_client, with_ai_key, mock_generate) -> None:  # type: ignore[no-untyped-def]
    client.post("/v1/ask", json={"question": "Tell me about his observability work"})
    listed = admin_client.get("/v1/ai-queries")
    assert listed.status_code == 200
    items = listed.json()["items"]
    assert len(items) == 1
    assert items[0]["question"].startswith("Tell me about")
    # The full answer text is never stored — only its length.
    assert items[0]["answer_chars"] > 0
    assert "answer" not in items[0]


def test_ask_enforces_daily_cap(client, with_ai_key, mock_generate, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    # Force a cap of 2 so the third call is rejected.
    from app.core.config import get_settings

    settings = get_settings()
    monkeypatch.setattr(settings, "ai_daily_cap", 2)

    q = {"question": "What is his strongest project?"}
    assert client.post("/v1/ask", json=q).status_code == 200
    assert client.post("/v1/ask", json=q).status_code == 200
    assert client.post("/v1/ask", json=q).status_code == 429


def test_ask_requires_same_origin(client, with_ai_key, mock_generate) -> None:  # type: ignore[no-untyped-def]
    resp = client.post(
        "/v1/ask",
        json={"question": "Has Surya used Kafka?"},
        headers={"Origin": "https://evil.example"},
    )
    assert resp.status_code == 403


def test_ai_queries_requires_admin(client) -> None:  # type: ignore[no-untyped-def]
    assert client.get("/v1/ai-queries").status_code == 401
