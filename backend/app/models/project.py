"""Mapping between Project domain data and DynamoDB items.

Keeps the raw PK/SK/GSI key strings out of the service layer.
"""

from typing import Any

from app.db.dynamodb import META_SK, project_pk
from app.schemas.project import ProjectCreate, ProjectLinks, ProjectRead

_GSI1PK_PROJECT = "PROJECT"


def project_to_item(project: ProjectCreate) -> dict[str, Any]:
    """Serialize a ProjectCreate into a DynamoDB item."""
    item: dict[str, Any] = {
        "PK": project_pk(project.slug),
        "SK": META_SK,
        "GSI1PK": _GSI1PK_PROJECT,
        # Zero-pad order so lexical GSI sort matches numeric order.
        "GSI1SK": f"{project.order:04d}#{project.slug}",
        "entity": "PROJECT",
        "slug": project.slug,
        "title": project.title,
        "summary": project.summary,
        "stack": project.stack,
        "featured": project.featured,
        "order": project.order,
    }
    if project.links is not None:
        item["links"] = project.links.model_dump(exclude_none=True)
    return item


def item_to_project(item: dict[str, Any]) -> ProjectRead:
    """Deserialize a DynamoDB item into a ProjectRead."""
    links_data = item.get("links")
    return ProjectRead(
        slug=str(item["slug"]),
        title=str(item["title"]),
        summary=str(item.get("summary", "")),
        stack=[str(s) for s in item.get("stack", [])],
        links=ProjectLinks(**links_data) if links_data else None,
        featured=bool(item.get("featured", False)),
        order=int(item.get("order", 999)),
    )
