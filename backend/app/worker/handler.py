"""DynamoDB Streams worker — the serverless-native event pipeline.

Triggered by inserts into the single table (filtered to ``entity = EVENT`` by
the event-source mapping), this derives the daily METRIC#<day> counters from the
recruiter-journey events. It is the equivalent of a Kafka consumer in this
serverless design: the table is the log, the stream is the broker, this Lambda
is the worker.

Idempotent: METRIC counters use DynamoDB ADD, so the stream's at-least-once
delivery (and partial-batch retries) can't double-count beyond a single ADD.
Failures are swallowed per-record so one bad record never blocks the batch — the
metrics are derived/best-effort, not the source of truth (the EVENT items are).
"""

import logging
from typing import Any

from boto3.dynamodb.types import TypeDeserializer

from app.core.logging import configure_logging
from app.services import metric_service

configure_logging()
logger = logging.getLogger(__name__)

_deserializer = TypeDeserializer()


def _deserialize(image: dict[str, Any]) -> dict[str, Any]:
    """Convert a DynamoDB-Streams NewImage (typed) into a plain dict."""
    return {key: _deserializer.deserialize(value) for key, value in image.items()}


def handler(event: dict[str, Any], _context: Any = None) -> dict[str, int]:
    """Process a batch of stream records; return a simple processed count."""
    processed = 0
    for record in event.get("Records", []):
        if record.get("eventName") not in ("INSERT", "MODIFY"):
            continue
        image = record.get("dynamodb", {}).get("NewImage")
        if not image:
            continue
        try:
            item = _deserialize(image)
            if item.get("entity") != "EVENT":
                continue
            event_type = item.get("type")
            if not isinstance(event_type, str) or not event_type:
                continue
            metric_service.record_event(event_type)
            processed += 1
        except Exception:  # noqa: BLE001 — best-effort; never fail the batch
            logger.exception("worker failed to process a record")
            continue

    return {"processed": processed}
