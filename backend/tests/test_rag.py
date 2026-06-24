"""Tests for the RAG chunking + BM25 retrieval."""

from app.rag.chunks import build_chunks
from app.rag.retriever import retrieve, tokenize


def test_chunks_cover_all_content_types() -> None:
    refs = {c.source_ref for c in build_chunks()}
    assert any(r.startswith("skill-group:") for r in refs)
    assert any(r.startswith("experience:") for r in refs)
    assert any(r.startswith("project:") for r in refs)
    assert "about" in refs


def test_tokenize_lowercases_and_splits() -> None:
    assert tokenize("Apache Kafka, 120K msgs/sec!") == [
        "apache",
        "kafka",
        "120k",
        "msgs",
        "sec",
    ]


def test_retrieve_distributed_systems_surfaces_relevant_chunks() -> None:
    results = retrieve("Has Surya worked with distributed systems?", k=4)
    refs = {r.source_ref for r in results}
    assert "skill-group:distributed-systems" in refs
    # GE HealthCare is where the distributed/Kafka work happened.
    assert "experience:ge-healthcare" in refs


def test_retrieve_observability_surfaces_observability() -> None:
    results = retrieve("What observability and tracing tools does he use?", k=3)
    refs = {r.source_ref for r in results}
    assert "skill-group:observability" in refs or "project:service-observability-layer" in refs


def test_retrieve_returns_sorted_by_score() -> None:
    results = retrieve("Kafka event streaming pipeline", k=5)
    scores = [r.score for r in results]
    assert scores == sorted(scores, reverse=True)
    assert all(s > 0 for s in scores)


def test_retrieve_empty_question_returns_nothing() -> None:
    assert retrieve("", k=4) == []
