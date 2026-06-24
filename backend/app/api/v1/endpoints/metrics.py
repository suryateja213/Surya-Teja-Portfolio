from fastapi import APIRouter

from app.api.deps import CurrentAdmin
from app.core.config import get_settings
from app.schemas.metric import AiMetrics
from app.services import metric_service

router = APIRouter()


@router.get(
    "/ai-metrics",
    response_model=AiMetrics,
    summary="Today's portfolio activity + AI budget (admin)",
)
def get_ai_metrics(_admin: CurrentAdmin) -> AiMetrics:
    settings = get_settings()
    return metric_service.get_today_metrics(daily_ai_cap=settings.ai_daily_cap)
