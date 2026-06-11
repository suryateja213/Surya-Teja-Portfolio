"""Shared schema utilities — pagination envelope and cursor codec."""

import base64
import json
from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    """A page of results plus an opaque cursor to fetch the next page.

    `next_cursor` is None when there are no more results.
    """

    items: list[T]
    next_cursor: str | None = None


def encode_cursor(key: dict[str, Any] | None) -> str | None:
    """Encode a DynamoDB LastEvaluatedKey into an opaque, URL-safe cursor."""
    if not key:
        return None
    raw = json.dumps(key, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("ascii")


def decode_cursor(cursor: str | None) -> dict[str, Any] | None:
    """Decode an opaque cursor back into a DynamoDB ExclusiveStartKey."""
    if not cursor:
        return None
    try:
        raw = base64.urlsafe_b64decode(cursor.encode("ascii"))
        decoded = json.loads(raw)
    except (ValueError, json.JSONDecodeError):
        return None
    return decoded if isinstance(decoded, dict) else None
