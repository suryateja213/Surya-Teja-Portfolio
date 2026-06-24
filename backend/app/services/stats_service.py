"""Public observability stats — aggregate activity + real AI latency.

Counts come from the daily METRIC item (worker-aggregated, O(1) read). Latency
percentiles are computed from the most recent AIQUERY log items (a small bounded
query, newest-first). Nothing sensitive is exposed — no spend cap, no question
text, no per-visitor data.
"""

from __future__ import annotations

import math
from datetime import UTC, datetime
from typing import Any

from boto3.dynamodb.conditions import Key

from app.db.dynamodb import GSI1_NAME, META_SK, aibudget_pk, get_table, metric_pk
from app.schemas.stats import LatencyStats, PublicStats

_GSI1PK_AIQUERY = "AIQUERY"
_TYPE_ATTR_PREFIX = "type#"
# Latency percentiles are computed over at most this many recent queries.
_LATENCY_SAMPLE = 50


def _today() -> str:
    return datetime.now(UTC).strftime("%Y-%m-%d")


def _as_int(value: object) -> int:
    if value is None:
        return 0
    try:
        return int(float(str(value)))
    except (TypeError, ValueError):
        return 0


def _percentile(sorted_values: list[int], pct: float) -> int:
    """Nearest-rank percentile of a pre-sorted list (ceil of pct·N)."""
    if not sorted_values:
        return 0
    rank = max(1, math.ceil(pct / 100 * len(sorted_values)))
    return sorted_values[min(rank, len(sorted_values)) - 1]


def _recent_latencies() -> list[int]:
    """Latency (ms) of the most recent AIQUERY items, newest-first."""
    table = get_table()
    response = table.query(
        IndexName=GSI1_NAME,
        KeyConditionExpression=Key("GSI1PK").eq(_GSI1PK_AIQUERY),
        ScanIndexForward=False,
        Limit=_LATENCY_SAMPLE,
        ProjectionExpression="latencyMs",
    )
    return [
        _as_int(item.get("latencyMs"))
        for item in response.get("Items", [])
        if _as_int(item.get("latencyMs")) > 0
    ]


def get_public_stats() -> PublicStats:
    table = get_table()
    day = _today()

    metric: dict[str, Any] = (
        table.get_item(Key={"PK": metric_pk(day), "SK": META_SK}).get("Item") or {}
    )
    budget: dict[str, Any] = (
        table.get_item(Key={"PK": aibudget_pk(day), "SK": META_SK}).get("Item") or {}
    )

    by_type = {
        key[len(_TYPE_ATTR_PREFIX) :]: _as_int(value)
        for key, value in metric.items()
        if key.startswith(_TYPE_ATTR_PREFIX)
    }

    latencies = sorted(_recent_latencies())
    latency = LatencyStats(
        p50=_percentile(latencies, 50),
        p95=_percentile(latencies, 95),
        samples=len(latencies),
    )

    return PublicStats(
        day=day,
        events_total=_as_int(metric.get("events_total")),
        by_type=by_type,
        ai_queries_today=_as_int(budget.get("count")),
        ai_latency=latency,
    )
