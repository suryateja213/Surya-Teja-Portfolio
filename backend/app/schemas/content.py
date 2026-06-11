"""Editable site-content singletons — FUTURE FEATURE seam.

Skills and About are currently static TS on the frontend. When the dashboard
takes them over, they become DB-managed singletons keyed CONTENT#skills /
CONTENT#about (see app/db/dynamodb.py:content_pk). Kept dashboard-only, like
the MDX-vs-DB projects split.
"""

from typing import Any

from pydantic import BaseModel


class ContentBlock(BaseModel):
    """A named blob of structured content (JSON value)."""

    key: str
    value: dict[str, Any]
    updated_at: str | None = None
