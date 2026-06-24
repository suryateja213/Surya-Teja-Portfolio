"""BM25 retrieval over the build-time portfolio index.

Why BM25 and not embeddings: the corpus is ~15 short chunks. Anthropic has no
embeddings API, and pulling in Voyage (an extra key + per-build spend) or
sentence-transformers (torch — hundreds of MB, blows the Lambda size limit) is
disproportionate. BM25 is pure-Python, runs in microseconds, and retrieves well
at this size. `retrieve()` is the seam: swapping in embeddings later is an
internal change behind this interface.

The index JSON is produced by `scripts/build_rag_index.py`, committed, and
bundled into the Lambda zip. It is loaded once at import (warm-invocation reuse).
"""

from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

_INDEX_PATH = Path(__file__).with_name("index.json")

# A small term-expansion map so a query word also matches a close synonym in the
# corpus (BM25's blind spot vs embeddings). Lowercase, both directions applied.
SYNONYMS: dict[str, list[str]] = {
    "streaming": ["kafka", "event", "telemetry"],
    "distributed": ["kafka", "rabbitmq", "event", "microservices"],
    "queue": ["kafka", "rabbitmq", "celery"],
    "observability": ["opentelemetry", "datadog", "tracing", "metrics", "grafana"],
    "tracing": ["opentelemetry", "datadog"],
    "database": ["postgresql", "mysql", "mongodb", "dynamodb"],
    "frontend": ["react", "typescript"],
    "ai": ["langchain", "llm", "summarization"],
    "ml": ["langchain", "llm"],
}

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall(text.lower())


def expand(tokens: list[str]) -> list[str]:
    """Add synonym terms for query expansion."""
    out = list(tokens)
    for tok in tokens:
        out.extend(SYNONYMS.get(tok, []))
    return out


@dataclass(frozen=True)
class RetrievedChunk:
    id: str
    text: str
    source_ref: str
    source_title: str
    href: str
    score: float


@lru_cache(maxsize=1)
def _load_index() -> dict[str, Any]:
    """Load and cache the committed index (one parse per warm Lambda)."""
    with _INDEX_PATH.open("r", encoding="utf-8") as fh:
        data: dict[str, Any] = json.load(fh)
    return data


def retrieve(question: str, k: int = 4) -> list[RetrievedChunk]:
    """Return the top-k chunks for a question by BM25 score (descending)."""
    index = _load_index()
    docs: list[dict[str, Any]] = index["chunks"]
    if not docs:
        return []

    df: dict[str, int] = index["df"]
    avgdl: float = index["avgdl"]
    n_docs: int = len(docs)
    k1, b = 1.5, 0.75

    q_terms = expand(tokenize(question))

    scored: list[RetrievedChunk] = []
    for doc in docs:
        tf: dict[str, int] = doc["tf"]
        dl: int = doc["len"]
        score = 0.0
        for term in q_terms:
            f = tf.get(term, 0)
            if f == 0:
                continue
            n_q = df.get(term, 0)
            idf = math.log(1 + (n_docs - n_q + 0.5) / (n_q + 0.5))
            score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * dl / avgdl))
        if score > 0:
            scored.append(
                RetrievedChunk(
                    id=doc["id"],
                    text=doc["text"],
                    source_ref=doc["source_ref"],
                    source_title=doc["source_title"],
                    href=doc["href"],
                    score=score,
                )
            )

    scored.sort(key=lambda c: c.score, reverse=True)
    return scored[:k]
