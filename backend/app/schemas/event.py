"""Schemas for recruiter-journey events.

The public frontend emits lightweight, PII-free interaction events to
`POST /v1/events` (fire-and-forget via sendBeacon). They feed a later live
activity stream and the observability metrics. The accepted event names mirror
the frontend taxonomy in `frontend/src/lib/analytics/events.ts`.
"""

from typing import Any

from pydantic import BaseModel, Field

# Allowed event names — kept in sync with the frontend `TrackEvent` union.
ALLOWED_EVENT_NAMES: frozenset[str] = frozenset(
    {
        "skill.viewed",
        "ai.asked",
        "project.opened",
        "contact.submitted",
    }
)


class EventCreate(BaseModel):
    """The envelope the frontend `track()` sends. Extra/unknown fields ignored."""

    name: str = Field(min_length=1, max_length=64)
    props: dict[str, Any] = Field(default_factory=dict)
    # Per-tab anonymous id (sessionStorage on the client). Not a stable user id.
    sessionId: str | None = Field(default=None, max_length=64)
    # Pathname only (no query string), enforced loosely.
    path: str | None = Field(default=None, max_length=256)


class EventRead(BaseModel):
    """Public-safe view of an event — request metadata (ip/userAgent) redacted."""

    id: str
    type: str
    target: str | None = None
    created_at: str
