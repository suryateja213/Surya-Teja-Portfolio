"""Blog/post schemas — FUTURE FEATURE seam (not yet wired to a router).

Mirrors the project schema shape. The DynamoDB design already reserves
POST#<slug> with GSI1PK="POST" (see app/db/dynamodb.py:post_pk).
"""

from pydantic import BaseModel, Field


class PostBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    summary: str = Field(min_length=1, max_length=400)
    body: str = ""
    tags: list[str] = Field(default_factory=list)
    published: bool = False


class PostCreate(PostBase):
    slug: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class PostRead(PostBase):
    slug: str
    published_at: str | None = None
