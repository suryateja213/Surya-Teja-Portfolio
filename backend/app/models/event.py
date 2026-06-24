"""Mapping between recruiter-journey events and DynamoDB items."""

from datetime import UTC, datetime, timedelta
from typing import Any

from ulid import ULID

from app.db.dynamodb import META_SK, event_pk
from app.schemas.event import EventCreate, EventRead

_GSI1PK_EVENT = "EVENT"
# Events auto-expire after 90 days via the table's `expiresAt` TTL attribute.
_TTL_DAYS = 90


def _derive_target(payload: EventCreate) -> str | None:
    """A short, human-readable subject for the event, pulled from its props.

    e.g. the skill id for skill.viewed, the slug for project.opened. Kept as a
    plain string so the activity stream can render a one-liner without knowing
    each event's prop shape.
    """
    props = payload.props or {}
    for key in ("skillId", "slug", "section"):
        value = props.get(key)
        if isinstance(value, str) and value:
            return value[:120]
    return None


def new_event_item(
    payload: EventCreate,
    *,
    ip: str | None = None,
    user_agent: str | None = None,
) -> dict[str, Any]:
    """Build a DynamoDB item for a new event."""
    event_id = str(ULID())
    now = datetime.now(UTC)
    created_at = now.isoformat()
    expires_at = int((now + timedelta(days=_TTL_DAYS)).timestamp())

    item: dict[str, Any] = {
        "PK": event_pk(event_id),
        "SK": META_SK,
        "GSI1PK": _GSI1PK_EVENT,
        "GSI1SK": created_at,
        "entity": "EVENT",
        "id": event_id,
        "type": payload.name,
        "createdAt": created_at,
        "expiresAt": expires_at,
    }
    target = _derive_target(payload)
    if target:
        item["target"] = target
    if payload.sessionId:
        item["sessionId"] = payload.sessionId
    if payload.path:
        item["path"] = payload.path
    if payload.props:
        item["meta"] = payload.props
    if ip:
        item["ip"] = ip
    if user_agent:
        item["userAgent"] = user_agent
    return item


def item_to_event_read(item: dict[str, Any]) -> EventRead:
    """Public-safe projection — ip/userAgent are intentionally omitted."""
    target = item.get("target")
    return EventRead(
        id=str(item["id"]),
        type=str(item["type"]),
        target=str(target) if target else None,
        created_at=str(item["createdAt"]),
    )
