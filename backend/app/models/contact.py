"""Mapping between contact submissions and DynamoDB items."""

from datetime import UTC, datetime
from typing import Any

from ulid import ULID

from app.db.dynamodb import META_SK, contact_pk
from app.schemas.contact import ContactCreate, ContactRead

_GSI1PK_CONTACT = "CONTACT"


def new_contact_item(
    payload: ContactCreate,
    *,
    ip: str | None = None,
    user_agent: str | None = None,
) -> dict[str, Any]:
    """Build a DynamoDB item for a new contact submission."""
    contact_id = str(ULID())
    created_at = datetime.now(UTC).isoformat()
    item: dict[str, Any] = {
        "PK": contact_pk(contact_id),
        "SK": META_SK,
        "GSI1PK": _GSI1PK_CONTACT,
        "GSI1SK": created_at,
        "entity": "CONTACT",
        "id": contact_id,
        "name": payload.name,
        "email": str(payload.email),
        "message": payload.message,
        "createdAt": created_at,
    }
    if ip:
        item["ip"] = ip
    if user_agent:
        item["userAgent"] = user_agent
    return item


def item_to_contact(item: dict[str, Any]) -> ContactRead:
    return ContactRead(
        id=str(item["id"]),
        name=str(item["name"]),
        email=str(item["email"]),
        message=str(item["message"]),
        created_at=str(item["createdAt"]),
    )
