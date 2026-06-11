"""Persist contact submissions and (optionally) notify."""

import logging
from typing import Any

from boto3.dynamodb.conditions import Key

from app.db.dynamodb import GSI1_NAME, META_SK, contact_pk, get_table
from app.models.contact import (
    item_to_contact,
    item_to_contact_detail,
    new_contact_item,
)
from app.schemas.common import Page, decode_cursor, encode_cursor
from app.schemas.contact import ContactCreate, ContactDetail, ContactRead

logger = logging.getLogger(__name__)

_GSI1PK_CONTACT = "CONTACT"


def submit_contact(
    payload: ContactCreate,
    *,
    ip: str | None = None,
    user_agent: str | None = None,
) -> str:
    """Persist a submission and return its id.

    Email notification is intentionally left as a TODO hook — wire SES or
    Resend here once a sender identity is configured. The store is the source
    of truth so no submission is lost if notification fails.
    """
    item = new_contact_item(payload, ip=ip, user_agent=user_agent)
    get_table().put_item(Item=item)
    logger.info("contact submission stored: %s", item["id"])
    return str(item["id"])


def list_contacts() -> list[ContactRead]:
    """All submissions, newest first (admin only)."""
    table = get_table()
    response = table.query(
        IndexName=GSI1_NAME,
        KeyConditionExpression=Key("GSI1PK").eq(_GSI1PK_CONTACT),
        ScanIndexForward=False,
    )
    return [item_to_contact(item) for item in response.get("Items", [])]


def list_contacts_page(limit: int = 25, cursor: str | None = None) -> Page[ContactRead]:
    """A page of submissions, newest first, with an opaque next-page cursor."""
    table = get_table()
    query_args: dict[str, Any] = {
        "IndexName": GSI1_NAME,
        "KeyConditionExpression": Key("GSI1PK").eq(_GSI1PK_CONTACT),
        "ScanIndexForward": False,
        "Limit": limit,
    }
    start_key = decode_cursor(cursor)
    if start_key:
        query_args["ExclusiveStartKey"] = start_key

    response = table.query(**query_args)
    items = [item_to_contact(item) for item in response.get("Items", [])]
    return Page(items=items, next_cursor=encode_cursor(response.get("LastEvaluatedKey")))


def get_contact(contact_id: str) -> ContactDetail | None:
    """A single submission with full metadata, or None if missing."""
    table = get_table()
    response = table.get_item(Key={"PK": contact_pk(contact_id), "SK": META_SK})
    item = response.get("Item")
    return item_to_contact_detail(item) if item else None


def delete_contact(contact_id: str) -> bool:
    """Delete a submission; return False if it didn't exist."""
    table = get_table()
    response = table.delete_item(
        Key={"PK": contact_pk(contact_id), "SK": META_SK},
        ReturnValues="ALL_OLD",
    )
    return "Attributes" in response
