from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentAdmin
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.services import project_service

router = APIRouter()


@router.get("/projects", response_model=list[ProjectRead], summary="List projects")
def list_projects() -> list[ProjectRead]:
    return project_service.list_projects()


@router.get("/projects/{slug}", response_model=ProjectRead, summary="Get a project")
def get_project(slug: str) -> ProjectRead:
    project = project_service.get_project(slug)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.post(
    "/projects",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a project (admin)",
)
def create_project(payload: ProjectCreate, _admin: CurrentAdmin) -> ProjectRead:
    try:
        return project_service.create_project(payload)
    except ClientError as err:
        if err.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A project with this slug already exists",
            ) from None
        raise


@router.put("/projects/{slug}", response_model=ProjectRead, summary="Update a project (admin)")
def update_project(slug: str, payload: ProjectUpdate, _admin: CurrentAdmin) -> ProjectRead:
    updated = project_service.update_project(slug, payload)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return updated


@router.delete(
    "/projects/{slug}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a project (admin)",
)
def delete_project(slug: str, _admin: CurrentAdmin) -> None:
    if not project_service.delete_project(slug):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
