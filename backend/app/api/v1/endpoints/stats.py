from fastapi import APIRouter

from app.schemas.stats import PublicStats
from app.services import stats_service

router = APIRouter()


@router.get(
    "/stats",
    response_model=PublicStats,
    summary="Public observability stats (activity + AI latency)",
)
def get_stats() -> PublicStats:
    return stats_service.get_public_stats()
