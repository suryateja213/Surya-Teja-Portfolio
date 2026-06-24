"""Schema for the admin observability metrics endpoint."""

from pydantic import BaseModel


class AiMetrics(BaseModel):
    """Today's portfolio activity, derived from the event stream + AI budget."""

    day: str
    events_total: int
    # Counts per event type, e.g. {"skill.viewed": 12, "ai.asked": 4}.
    by_type: dict[str, int]
    # AI questions answered today and the configured daily spend cap.
    ai_queries_today: int
    ai_daily_cap: int
