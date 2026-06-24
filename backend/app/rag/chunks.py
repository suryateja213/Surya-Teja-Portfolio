"""Chunk the portfolio content into retrievable units for the RAG index.

One chunk per skill group, per experience (role + its highlights), per project
summary, and the about blurb. Each chunk carries a `source_ref` (a stable
pointer the API turns into a citation + a deep-link) and a human `source_title`.
This is the single definition of "what the AI can cite", used both by the
build-time index generator and (indirectly) by the answer formatter.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.content import portfolio


@dataclass(frozen=True)
class Chunk:
    id: str
    text: str
    # Stable reference, e.g. "experience:ge-healthcare", "project:<slug>",
    # "skill-group:distributed-systems", "about". Drives citations + related skills.
    source_ref: str
    source_title: str
    # On-site deep-link target for the citation.
    href: str


def build_chunks() -> list[Chunk]:
    chunks: list[Chunk] = []

    # Skill groups — one chunk each.
    for group in portfolio.SKILL_GROUPS:
        slug = portfolio.slugify(group.title)
        chunks.append(
            Chunk(
                id=f"skill-group:{slug}",
                text=f"{group.title}: {', '.join(group.items)}.",
                source_ref=f"skill-group:{slug}",
                source_title=f"Skills — {group.title}",
                href="#skills",
            )
        )

    # Experience — role summary + highlights as one chunk per role.
    for exp in portfolio.EXPERIENCE:
        body = " ".join(
            [
                f"{exp.role} at {exp.company} ({exp.period}).",
                exp.summary,
                *exp.highlights,
                f"Stack: {', '.join(exp.stack)}.",
            ]
        )
        chunks.append(
            Chunk(
                id=f"experience:{exp.id}",
                text=body,
                source_ref=f"experience:{exp.id}",
                source_title=f"{exp.company} — {exp.role}",
                href="#experience",
            )
        )

    # Projects — summary + stack.
    for project in portfolio.PROJECTS:
        chunks.append(
            Chunk(
                id=f"project:{project.slug}",
                text=f"{project.title}. {project.summary} Stack: {', '.join(project.stack)}.",
                source_ref=f"project:{project.slug}",
                source_title=project.title,
                href=f"/projects/{project.slug}",
            )
        )

    # About — one chunk for the whole blurb.
    chunks.append(
        Chunk(
            id="about",
            text=" ".join(portfolio.ABOUT),
            source_ref="about",
            source_title="About",
            href="#about",
        )
    )

    return chunks
