from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import CurrentAdmin, require_same_origin
from app.schemas.ask import AiQueryRead, AskRequest, AskResponse
from app.schemas.common import Page
from app.services import ask_service
from app.services.ask_service import AiRateLimited, AiUnavailable

router = APIRouter()


@router.post(
    "/ask",
    response_model=AskResponse,
    summary="Ask Surya AI a question about Surya's background",
    # Same-origin only — the public site is the only legitimate caller.
    dependencies=[Depends(require_same_origin)],
)
def ask(payload: AskRequest) -> AskResponse:
    try:
        return ask_service.ask(payload.question)
    except AiUnavailable:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The assistant is unavailable right now.",
        ) from None
    except AiRateLimited:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="The assistant has answered its daily limit of questions. Try again tomorrow.",
        ) from None


@router.get(
    "/ai-queries",
    response_model=Page[AiQueryRead],
    summary="Recent AI queries (admin)",
)
def list_ai_queries(
    _admin: CurrentAdmin,
    limit: int = 25,
    cursor: str | None = None,
) -> Page[AiQueryRead]:
    limit = max(1, min(limit, 100))
    return ask_service.list_ai_queries(limit=limit, cursor=cursor)
