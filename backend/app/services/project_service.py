"""CRUD over the projects partition of the single table."""

from boto3.dynamodb.conditions import Key

from app.db.dynamodb import GSI1_NAME, META_SK, get_table, project_pk
from app.models.project import item_to_project, project_to_item
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate

_GSI1PK_PROJECT = "PROJECT"


def list_projects() -> list[ProjectRead]:
    """All projects, ordered by `order` (via GSI1SK)."""
    table = get_table()
    response = table.query(
        IndexName=GSI1_NAME,
        KeyConditionExpression=Key("GSI1PK").eq(_GSI1PK_PROJECT),
    )
    return [item_to_project(item) for item in response.get("Items", [])]


def get_project(slug: str) -> ProjectRead | None:
    table = get_table()
    response = table.get_item(Key={"PK": project_pk(slug), "SK": META_SK})
    item = response.get("Item")
    return item_to_project(item) if item else None


def create_project(project: ProjectCreate) -> ProjectRead:
    table = get_table()
    item = project_to_item(project)
    # Fail if the slug already exists.
    table.put_item(Item=item, ConditionExpression="attribute_not_exists(PK)")
    return item_to_project(item)


def update_project(slug: str, patch: ProjectUpdate) -> ProjectRead | None:
    existing = get_project(slug)
    if existing is None:
        return None
    merged = existing.model_copy(
        update=patch.model_dump(exclude_none=True),
    )
    create = ProjectCreate(**merged.model_dump())
    table = get_table()
    table.put_item(Item=project_to_item(create))
    return ProjectRead(**create.model_dump())


def delete_project(slug: str) -> bool:
    table = get_table()
    response = table.delete_item(
        Key={"PK": project_pk(slug), "SK": META_SK},
        ReturnValues="ALL_OLD",
    )
    return "Attributes" in response
