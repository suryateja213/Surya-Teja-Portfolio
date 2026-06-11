"""DynamoDB access for the single-table design.

Single table, on-demand billing, with one GSI for "list by type" access:

    Project   PK=PROJECT#<slug>   SK=META   GSI1PK=PROJECT   GSI1SK=<order>
    Contact   PK=CONTACT#<ulid>   SK=META   GSI1PK=CONTACT   GSI1SK=<createdAt>

The boto3 resource is created once at module scope so it is reused across warm
Lambda invocations.
"""

from functools import lru_cache
from typing import TYPE_CHECKING

import boto3

from app.core.config import get_settings

if TYPE_CHECKING:
    from mypy_boto3_dynamodb.service_resource import Table

GSI1_NAME = "GSI1"


@lru_cache
def get_table() -> "Table":
    """Return the cached DynamoDB Table resource."""
    settings = get_settings()
    resource = boto3.resource(
        "dynamodb",
        region_name=settings.aws_region,
        endpoint_url=settings.dynamodb_endpoint_url or None,
    )
    return resource.Table(settings.table_name)


# ---- Key helpers (one place that knows the key strings) ----


def project_pk(slug: str) -> str:
    return f"PROJECT#{slug}"


def contact_pk(contact_id: str) -> str:
    return f"CONTACT#{contact_id}"


META_SK = "META"
