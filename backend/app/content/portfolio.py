"""Backend mirror of the user's portfolio content.

This is the single source of truth on the backend for the *static* parts of the
portfolio — skills, experience, and the about blurb. It deliberately mirrors the
typed frontend content (``frontend/src/content/skills.ts`` and
``experience.ts``, plus the About section copy) so the skill-graph endpoint, the
RAG index build, and the AI prompt all read the same vocabulary.

Why mirror instead of moving content into DynamoDB: the corpus is tiny and the
"resume becomes live data" story is carried by serving the graph and AI live
over the backend (and over the real DynamoDB projects), not by relocating these
small static lists. Keep this in sync when the frontend content changes.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field


def slugify(value: str) -> str:
    """Stable, url-safe id for a skill/label (e.g. "Apache Kafka" -> "apache-kafka")."""
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug


@dataclass(frozen=True)
class SkillGroup:
    title: str
    items: tuple[str, ...]


@dataclass(frozen=True)
class Experience:
    company: str
    role: str
    period: str
    location: str
    summary: str
    highlights: tuple[str, ...]
    stack: tuple[str, ...]

    @property
    def id(self) -> str:
        return slugify(self.company)


# ---- Skills (mirror of frontend/src/content/skills.ts) ----

SKILL_GROUPS: tuple[SkillGroup, ...] = (
    SkillGroup("Languages", ("Python", "Java", "TypeScript", "SQL", "Bash")),
    SkillGroup(
        "Backend & APIs",
        ("FastAPI", "Django", "Spring Boot", "Node.js", "REST", "GraphQL"),
    ),
    SkillGroup(
        "Distributed Systems",
        ("Apache Kafka", "RabbitMQ", "Redis", "Celery", "Event-driven design"),
    ),
    SkillGroup(
        "Observability",
        ("OpenTelemetry", "Datadog APM", "Prometheus", "Grafana", "ELK Stack"),
    ),
    SkillGroup(
        "Cloud & DevOps",
        ("AWS (EKS, EC2, S3, RDS)", "Docker", "Kubernetes", "Helm", "GitHub Actions"),
    ),
    SkillGroup("Data", ("PostgreSQL", "MySQL", "MongoDB", "Elasticsearch")),
)


# ---- Experience (mirror of frontend/src/content/experience.ts) ----

EXPERIENCE: tuple[Experience, ...] = (
    Experience(
        company="GE HealthCare",
        role="Software Engineer II — Platform Engineering",
        period="Aug 2025 — Present",
        location="United States",
        summary=(
            "Platform services behind mission-critical diagnostic imaging workflows: "
            "high-volume device telemetry, real-time ingestion, and downstream clinical "
            "integrations."
        ),
        highlights=(
            "Architected Kafka event streaming for device telemetry — 120K+ msgs/sec "
            "sustained at sub-100ms p99",
            "Cut end-to-end pipeline latency 38% with an async FastAPI refactor and a "
            "Redis caching layer",
            "Instrumented tracing across 6 services with OpenTelemetry + Datadog — 52% "
            "faster incident detection",
            "Shipped LangChain summarization in the clinical report pipeline — 20% less "
            "radiologist review time",
        ),
        stack=(
            "Python",
            "FastAPI",
            "Kafka",
            "Redis",
            "AWS EKS",
            "Kubernetes",
            "Helm",
            "OpenTelemetry",
            "Datadog",
        ),
    ),
    Experience(
        company="HealthPlix Technologies",
        role="Full-Stack Software Engineer — EHR Platform",
        period="Apr 2021 — Dec 2023",
        location="India",
        summary=(
            "Built MedAssist and CareCoordinator, EHR products used by clinicians across "
            "partner hospital networks — backend services, React frontends, and FHIR "
            "integrations."
        ),
        highlights=(
            "Built prescription + SOAP note modules in Django — 2M+ monthly prescriptions "
            "at 99.9% uptime",
            "Took API response times from 420ms to 95ms via PostgreSQL query optimization "
            "and index tuning",
            "Migrated a monolithic patient-record service to event-driven RabbitMQ — "
            "decoupled 5 consumers",
            "Integrated FHIR R4 across 3 partner hospital networks — 65% less manual data " "sync",
        ),
        stack=(
            "Python",
            "Django",
            "React",
            "TypeScript",
            "PostgreSQL",
            "RabbitMQ",
            "Redis",
            "ELK",
            "GitHub Actions",
        ),
    ),
)


# ---- Projects (mirror of the MDX case-study frontmatter) ----
# The full case studies live in the frontend MDX; this is the summary-level
# mirror the RAG index and graph fallback read. Keep slugs in sync.


@dataclass(frozen=True)
class Project:
    slug: str
    title: str
    summary: str
    stack: tuple[str, ...]


PROJECTS: tuple[Project, ...] = (
    Project(
        slug="telemetry-streaming-pipeline",
        title="Device Telemetry Streaming Pipeline",
        summary=(
            "An event-driven pipeline that ingests high-volume device telemetry and "
            "fans it out to downstream consumers without coupling them to the producer."
        ),
        stack=("Python", "Apache Kafka", "Redis", "Kubernetes"),
    ),
    Project(
        slug="service-observability-layer",
        title="Service Observability Layer",
        summary=(
            "A shared tracing and metrics layer across a fleet of platform services, "
            "built so on-call engineers can find the failing hop in minutes, not hours."
        ),
        stack=("OpenTelemetry", "Datadog APM", "Grafana", "Python"),
    ),
    Project(
        slug="ehr-prescription-service",
        title="EHR Prescription Service",
        summary=(
            "A high-uptime prescription and clinical-note service for an EHR platform, "
            "with a REST layer tuned for fast mobile clients and strict data-access "
            "controls."
        ),
        stack=("Django", "PostgreSQL", "FHIR R4", "REST"),
    ),
)


# ---- About (mirror of the About section copy) ----

ABOUT: tuple[str, ...] = (
    "I'm a backend engineer who likes the unglamorous parts of software: the queues, "
    "the indexes, the traces that tell you what actually happened at 3am. Most of my "
    "work sits behind the UI, where correctness and latency are the whole job.",
    "I've spent the last few years on distributed, event-driven systems in healthcare "
    "and platform domains — designing services that stay fast under load and stay "
    "debuggable when they don't. I care about clear interfaces, honest observability, "
    "and code the next person can change without fear.",
    "I'm currently open to software engineering roles across the stack — backend, "
    "full-stack, or frontend — anywhere the problems are real and the bar for "
    "engineering is high.",
)


@dataclass(frozen=True)
class Skill:
    """A single skill, flattened from its group, with a stable id."""

    label: str
    group: str
    id: str = field(default="")

    def __post_init__(self) -> None:
        if not self.id:
            object.__setattr__(self, "id", slugify(self.label))


def all_skills() -> list[Skill]:
    """Every skill across groups, flattened, with stable ids."""
    return [Skill(label=item, group=group.title) for group in SKILL_GROUPS for item in group.items]
