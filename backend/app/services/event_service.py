"""Ingest recruiter-journey events and read the recent stream.

Writing an EVENT item is the twin of `contact_service.submit_contact`. The
write triggers a DynamoDB Stream that fans out to the worker Lambda (see
`app/worker/`), which derives the daily METRIC counters — the serverless-native
event pipeline. Reads here power the (later) live activity stream.
"""

import logging
from typing import Any

from boto3.dynamodb.conditions import Key

from app.db.dynamodb import GSI1_NAME, get_table
from app.models.event import item_to_event_read, new_event_item
from app.schemas.common import Page, decode_cursor, encode_cursor
from app.schemas.event import ALLOWED_EVENT_NAMES, EventCreate, EventRead

logger = logging.getLogger(__name__)

_GSI1PK_EVENT = "EVENT"


def ingest_event(
    payload: EventCreate,
    *,
    ip: str | None = None,
    user_agent: str | None = None,
) -> str | None:
    """Persist an event and return its id.

    Unknown event names are dropped silently (return None) — the endpoint is
    public and fire-and-forget, so we never error on unexpected input, but we
    also don't store junk. Known names are written as EVENT items.
    """
    if payload.name not in ALLOWED_EVENT_NAMES:
        logger.info("dropped unknown event name: %s", payload.name)
        return None
    item = new_event_item(payload, ip=ip, user_agent=user_agent)
    get_table().put_item(Item=item)
    return str(item["id"])


def list_recent_events(limit: int = 25, cursor: str | None = None) -> Page[EventRead]:
    """A page of events, newest first, with an opaque next-page cursor."""
    table = get_table()
    query_args: dict[str, Any] = {
        "IndexName": GSI1_NAME,
        "KeyConditionExpression": Key("GSI1PK").eq(_GSI1PK_EVENT),
        "ScanIndexForward": False,
        "Limit": limit,
    }
    start_key = decode_cursor(cursor)
    if start_key:
        query_args["ExclusiveStartKey"] = start_key

    response = table.query(**query_args)
    items = [item_to_event_read(item) for item in response.get("Items", [])]
    return Page(items=items, next_cursor=encode_cursor(response.get("LastEvaluatedKey")))
