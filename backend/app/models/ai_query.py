"""Mapping for AI-query log items (admin observability)."""

from datetime import UTC, datetime, timedelta
from typing import Any

from ulid import ULID

from app.db.dynamodb import META_SK, aiquery_pk
from app.schemas.ask import AiQueryRead

_GSI1PK_AIQUERY = "AIQUERY"
_TTL_DAYS = 180


def new_ai_query_item(
    *,
    question: str,
    sources: list[str],
    answer_chars: int,
    latency_ms: int,
    model: str,
    input_tokens: int = 0,
    output_tokens: int = 0,
) -> dict[str, Any]:
    """Build a log item for one answered AI query.

    The full answer text is intentionally NOT stored (privacy + size);
    `answer_chars` plus the retrieved `sources` are enough for later quality and
    cost analysis.
    """
    query_id = str(ULID())
    now = datetime.now(UTC)
    created_at = now.isoformat()
    return {
        "PK": aiquery_pk(query_id),
        "SK": META_SK,
        "GSI1PK": _GSI1PK_AIQUERY,
        "GSI1SK": created_at,
        "entity": "AIQUERY",
        "id": query_id,
        "question": question[:500],
        "sources": sources,
        "answerChars": answer_chars,
        "latencyMs": latency_ms,
        "model": model,
        "inputTokens": input_tokens,
        "outputTokens": output_tokens,
        "createdAt": created_at,
        "expiresAt": int((now + timedelta(days=_TTL_DAYS)).timestamp()),
    }


def item_to_ai_query_read(item: dict[str, Any]) -> AiQueryRead:
    sources = item.get("sources") or []
    return AiQueryRead(
        id=str(item["id"]),
        question=str(item["question"]),
        sources=[str(s) for s in sources],
        answer_chars=int(item.get("answerChars", 0)),
        latency_ms=int(item.get("latencyMs", 0)),
        model=str(item.get("model", "")),
        created_at=str(item["createdAt"]),
    )
