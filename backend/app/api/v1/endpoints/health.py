from fastapi import APIRouter

router = APIRouter()


@router.get("/health", summary="Liveness check")
def health() -> dict[str, str]:
    """Cheap health check — no DB. Also a Lambda warmer target."""
    return {"status": "ok"}
