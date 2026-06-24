"""Schemas for Ask Surya AI (RAG over portfolio content)."""

from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=500)


class AskCitation(BaseModel):
    """A cited source chunk, with a deep-link back into the site."""

    ref: str
    title: str
    snippet: str
    href: str | None = None


class AskResponse(BaseModel):
    answer: str
    sources: list[AskCitation]
    # Skill-graph node ids the answer relates to (for highlighting/jumping).
    relatedSkills: list[str]


class AiQueryRead(BaseModel):
    """Admin-only log view of a past AI query (no answer text stored)."""

    id: str
    question: str
    sources: list[str]
    answer_chars: int
    latency_ms: int
    model: str
    created_at: str
