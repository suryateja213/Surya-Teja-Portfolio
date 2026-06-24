import json

from fastapi import APIRouter, Depends, Request
from pydantic import ValidationError

from app.api.deps import require_same_origin
from app.schemas.common import Page
from app.schemas.event import EventCreate, EventRead
from app.services import event_service

router = APIRouter()


@router.post(
    "/events",
    summary="Ingest a recruiter-journey event",
    # Same-origin only: the public site emits these; other origins can't spam us.
    dependencies=[Depends(require_same_origin)],
)
async def create_event(request: Request) -> dict[str, bool]:
    """Fire-and-forget event intake from the frontend `track()`.

    The body is parsed manually rather than via a typed parameter because the
    client sends it via `navigator.sendBeacon` as `text/plain` (an application/
    json beacon would require a CORS preflight, which beacons can't perform).
    Always returns 200 {"ok": true} — the client never reads the response, and
    malformed or unknown events are dropped silently rather than erroring.
    """
    try:
        raw = await request.body()
        payload = EventCreate.model_validate_json(raw)
    except (ValidationError, ValueError, json.JSONDecodeError):
        return {"ok": True}

    event_service.ingest_event(
        payload,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return {"ok": True}


@router.get(
    "/events/recent",
    response_model=Page[EventRead],
    summary="Recent events (public, redacted)",
)
def list_recent_events(limit: int = 25, cursor: str | None = None) -> Page[EventRead]:
    limit = max(1, min(limit, 50))
    return event_service.list_recent_events(limit=limit, cursor=cursor)
