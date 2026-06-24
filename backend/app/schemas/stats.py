"""Schema for the PUBLIC observability stats endpoint.

Deliberately a subset of the admin metrics — it exposes aggregate activity and
real AI latency, but never the spend cap, raw questions, or any per-visitor
data. Safe to render on the public site.
"""

from pydantic import BaseModel


class LatencyStats(BaseModel):
    """AI response latency over recent queries (milliseconds)."""

    p50: int
    p95: int
    samples: int


class PublicStats(BaseModel):
    day: str
    # Total interactions tracked today through the event pipeline.
    events_total: int
    # Per-type counts, e.g. {"skill.viewed": 12, "ai.asked": 4}.
    by_type: dict[str, int]
    # AI questions answered today (count only — never the cap).
    ai_queries_today: int
    # Real AI latency from recent queries.
    ai_latency: LatencyStats
