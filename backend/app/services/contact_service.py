"""Persist contact submissions and (optionally) notify."""

import logging

from boto3.dynamodb.conditions import Key

from app.db.dynamodb import GSI1_NAME, get_table
from app.models.contact import item_to_contact, new_contact_item
from app.schemas.contact import ContactCreate, ContactRead

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
