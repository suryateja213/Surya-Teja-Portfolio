from pydantic import BaseModel, Field

# Mirrors the frontend ProjectMeta shape (frontend/src/content/projects.ts) so
# the API and the static site speak the same project vocabulary.


class ProjectLinks(BaseModel):
    repo: str | None = None
    demo: str | None = None


class ProjectBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    summary: str = Field(min_length=1, max_length=400)
    stack: list[str] = Field(default_factory=list)
    links: ProjectLinks | None = None
    featured: bool = False
    order: int = 999


class ProjectCreate(ProjectBase):
    slug: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    summary: str | None = Field(default=None, min_length=1, max_length=400)
    stack: list[str] | None = None
    links: ProjectLinks | None = None
    featured: bool | None = None
    order: int | None = None


class ProjectRead(ProjectBase):
    slug: str
