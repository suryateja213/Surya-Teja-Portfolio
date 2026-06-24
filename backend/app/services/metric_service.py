"""Daily metric counters derived from the event stream.

The worker Lambda (`app/worker/`) calls `record_event` for each streamed EVENT,
atomically bumping the day's METRIC#<day> counters. The admin `/ai-metrics`
endpoint reads them back. Counters use DynamoDB ADD so the worker is idempotent
under the stream's at-least-once delivery.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from app.db.dynamodb import META_SK, aibudget_pk, metric_pk
from app.schemas.metric import AiMetrics

# Metric items keep a short TTL so the table stays tidy; the dashboard only
# needs recent days.
_METRIC_TTL_DAYS = 120


def _today() -> str:
    return datetime.now(UTC).strftime("%Y-%m-%d")


# Per-type counters are stored as top-level attributes "type#<name>" rather than
# a nested map, so each counter is a plain top-level ADD (always valid and
# idempotent — a nested-map ADD would fail when the map doesn't exist yet).
_TYPE_ATTR_PREFIX = "type#"


def record_event(event_type: str, *, day: str | None = None) -> None:
    """Increment the day's total and per-type counters for one event."""
    from app.db.dynamodb import get_table  # local import keeps worker cold-start lean

    day = day or _today()
    expires_at = int((datetime.now(UTC) + timedelta(days=_METRIC_TTL_DAYS)).timestamp())
    get_table().update_item(
        Key={"PK": metric_pk(day), "SK": META_SK},
        UpdateExpression=(
            "ADD events_total :one, #typeattr :one "
            "SET entity = :entity, updatedAt = :now, "
            "expiresAt = if_not_exists(expiresAt, :exp)"
        ),
        ExpressionAttributeNames={"#typeattr": f"{_TYPE_ATTR_PREFIX}{event_type}"},
        ExpressionAttributeValues={
            ":one": 1,
            ":entity": "METRIC",
            ":now": datetime.now(UTC).isoformat(),
            ":exp": expires_at,
        },
    )


def get_today_metrics(daily_ai_cap: int) -> AiMetrics:
    """Read today's metric + AI-budget counters for the admin dashboard."""
    from app.db.dynamodb import get_table

    day = _today()
    table = get_table()

    metric = table.get_item(Key={"PK": metric_pk(day), "SK": META_SK}).get("Item") or {}
    budget = table.get_item(Key={"PK": aibudget_pk(day), "SK": META_SK}).get("Item") or {}

    # Reconstruct the per-type map from the "type#<name>" counter attributes.
    by_type: dict[str, int] = {
        key[len(_TYPE_ATTR_PREFIX) :]: _as_int(value)
        for key, value in metric.items()
        if key.startswith(_TYPE_ATTR_PREFIX)
    }

    return AiMetrics(
        day=day,
        events_total=_as_int(metric.get("events_total")),
        by_type=by_type,
        ai_queries_today=_as_int(budget.get("count")),
        ai_daily_cap=daily_ai_cap,
    )


def _as_int(value: object) -> int:
    """Coerce a DynamoDB numeric attribute (Decimal/str/None) to int."""
    if value is None:
        return 0
    try:
        # DynamoDB returns numbers as Decimal; str() then int() handles all cases.
        return int(float(str(value)))
    except (TypeError, ValueError):
        return 0
