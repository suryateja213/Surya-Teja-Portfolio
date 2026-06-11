import json
import logging
import sys


class JsonFormatter(logging.Formatter):
    """Minimal structured JSON formatter so CloudWatch parses log fields."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload)


def configure_logging() -> None:
    """Install the JSON formatter on the root logger (idempotent)."""
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    if root.handlers:
        for handler in root.handlers:
            handler.setFormatter(JsonFormatter())
        return
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root.addHandler(handler)
