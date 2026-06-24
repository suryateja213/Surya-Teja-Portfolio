"""Compute the skill graph from static portfolio content + live projects.

Nodes: skills (from ``content/portfolio.py``), experiences (same), and projects
(live from DynamoDB). Edges: a skill connects to an experience/project when the
skill appears in that item's stack. The graph is derived on every request — it's
cheap (a few dozen nodes) and adds no new DynamoDB items.
"""

from __future__ import annotations

import re

from app.content import portfolio
from app.schemas.skill_graph import SkillGraph, SkillGraphEdge, SkillGraphNode
from app.services import project_service

# Aliases let a skill match stack entries that name it differently
# (e.g. the "Apache Kafka" skill should match a "Kafka" stack tag, and the
# "AWS (EKS, EC2, S3, RDS)" skill should match an "AWS EKS" tag). Keyed by skill
# id; values are alternate *names* for the same skill (e.g. a stack tag may say
# "Kafka" where the skill is "Apache Kafka", or "AWS EKS" where the skill is the
# combined "AWS (EKS, EC2, S3, RDS)"). Each alias is matched as a token-set.
_SKILL_ALIASES: dict[str, tuple[str, ...]] = {
    "apache-kafka": ("kafka",),
    "aws-eks-ec2-s3-rds": ("aws eks", "aws ec2", "aws s3", "aws rds", "aws"),
    "datadog-apm": ("datadog",),
    "elk-stack": ("elk",),
    "event-driven-design": ("event-driven", "event driven"),
    "opentelemetry": ("otel",),
}


def _tokens(value: str) -> set[str]:
    """Lowercase word tokens of a label/stack entry, for loose matching."""
    return {tok for tok in re.split(r"[^a-z0-9]+", value.lower()) if tok}


def _skill_anchors(skill: portfolio.Skill) -> list[set[str]]:
    """The token-sets that each name this skill (its label + any aliases)."""
    anchors = [_tokens(skill.label)]
    anchors.extend(_tokens(alias) for alias in _SKILL_ALIASES.get(skill.id, ()))
    return [a for a in anchors if a]


def _skill_matches_stack(skill: portfolio.Skill, stack: list[str]) -> bool:
    """True if this skill is named anywhere in a stack list.

    A match is a name-to-name correspondence, not a loose token overlap:
      - an anchor's tokens are all present in the entry  ("Kafka" anchor ⊆ "Apache Kafka")
      - or the entry's tokens are all present in the label ("Apache Kafka" entry ⊆ label)
    This avoids false positives (e.g. "Redis" never matching "RabbitMQ").
    """
    label_tokens = _tokens(skill.label)
    anchors = _skill_anchors(skill)
    for entry in stack:
        entry_tokens = _tokens(entry)
        if not entry_tokens:
            continue
        if any(anchor <= entry_tokens for anchor in anchors):
            return True
        if entry_tokens <= label_tokens:
            return True
    return False


def build_skill_graph() -> SkillGraph:
    skills = portfolio.all_skills()
    nodes: list[SkillGraphNode] = []
    edges: list[SkillGraphEdge] = []

    # Skill nodes.
    for skill in skills:
        nodes.append(
            SkillGraphNode(
                id=f"skill:{skill.id}",
                label=skill.label,
                kind="skill",
                group=skill.group,
                href="#skills",
            )
        )

    # Experience nodes + skill→experience edges.
    for exp in portfolio.EXPERIENCE:
        exp_node_id = f"experience:{exp.id}"
        nodes.append(
            SkillGraphNode(
                id=exp_node_id,
                label=exp.company,
                kind="experience",
                group=exp.role,
                href="#experience",
            )
        )
        stack = list(exp.stack)
        for skill in skills:
            if _skill_matches_stack(skill, stack):
                edges.append(
                    SkillGraphEdge(
                        source=f"skill:{skill.id}",
                        target=exp_node_id,
                        relation="used-in",
                    )
                )

    # Project nodes (live) + skill→project edges.
    for project in project_service.list_projects():
        proj_node_id = f"project:{project.slug}"
        nodes.append(
            SkillGraphNode(
                id=proj_node_id,
                label=project.title,
                kind="project",
                href=f"/projects/{project.slug}",
            )
        )
        for skill in skills:
            if _skill_matches_stack(skill, project.stack):
                edges.append(
                    SkillGraphEdge(
                        source=f"skill:{skill.id}",
                        target=proj_node_id,
                        relation="used-in",
                    )
                )

    return SkillGraph(nodes=nodes, edges=edges)
