"""Schemas for the public skill-graph endpoint.

The graph connects skills to the experiences and projects where they appear, so
the frontend can render a "constellation" and reveal related work on click. The
shape is intentionally identical to the frontend's static fallback
(``frontend/src/content/skill-graph.ts``) so the API is a drop-in upgrade.
"""

from typing import Literal

from pydantic import BaseModel

NodeKind = Literal["skill", "experience", "project"]
EdgeRelation = Literal["used-in", "related-to"]


class SkillGraphNode(BaseModel):
    id: str
    label: str
    kind: NodeKind
    # For skills: the group title. For experience: the role. Optional context.
    group: str | None = None
    # Deep-link target on the site, e.g. "#experience" or "/projects/<slug>".
    href: str | None = None


class SkillGraphEdge(BaseModel):
    source: str
    target: str
    relation: EdgeRelation


class SkillGraph(BaseModel):
    nodes: list[SkillGraphNode]
    edges: list[SkillGraphEdge]
