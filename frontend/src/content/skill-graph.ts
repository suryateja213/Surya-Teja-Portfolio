/**
 * Static fallback for the skill graph.
 *
 * The graph is normally served live from `GET /v1/skill-graph`, but the site is
 * a static export that must render fully even when the API is unconfigured or
 * down. This module derives the same graph shape from the existing typed
 * content (skills + experience + a small projects mirror) so the Skills section
 * always has a complete, correct graph to paint on first render. The live fetch
 * is a silent enhancement layered on top (see `useSkillGraph`).
 *
 * Node id convention matches the backend exactly: `skill:<slug>`,
 * `experience:<company-slug>`, `project:<slug>`.
 */

import { skillGroups } from "@/content/skills";
import { experience } from "@/content/experience";
import type { SkillGraph, SkillGraphEdge, SkillGraphNode } from "@/lib/public/types";

/** Stable url-safe id, matching the backend `slugify`. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A minimal projects mirror for the fallback (slug + title + stack only). */
const fallbackProjects: { slug: string; title: string; stack: string[] }[] = [
  {
    slug: "telemetry-streaming-pipeline",
    title: "Device Telemetry Streaming Pipeline",
    stack: ["Python", "Apache Kafka", "Redis", "Kubernetes"],
  },
  {
    slug: "service-observability-layer",
    title: "Service Observability Layer",
    stack: ["OpenTelemetry", "Datadog APM", "Grafana", "Python"],
  },
  {
    slug: "ehr-prescription-service",
    title: "EHR Prescription Service",
    stack: ["Django", "PostgreSQL", "FHIR R4", "REST"],
  },
];

/** Alternate names a stack tag may use for a skill (keyed by skill slug). */
const skillAliases: Record<string, string[]> = {
  "apache-kafka": ["kafka"],
  "aws-eks-ec2-s3-rds": ["aws eks", "aws ec2", "aws s3", "aws rds", "aws"],
  "datadog-apm": ["datadog"],
  "elk-stack": ["elk"],
  "event-driven-design": ["event-driven", "event driven"],
};

function tokens(value: string): Set<string> {
  return new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
}

function isSubset(a: Set<string>, b: Set<string>): boolean {
  for (const t of a) if (!b.has(t)) return false;
  return a.size > 0;
}

function skillMatchesStack(skillLabel: string, skillSlug: string, stack: string[]): boolean {
  const labelTokens = tokens(skillLabel);
  const anchors = [labelTokens, ...(skillAliases[skillSlug] ?? []).map(tokens)].filter(
    (s) => s.size > 0,
  );
  return stack.some((entry) => {
    const entryTokens = tokens(entry);
    if (entryTokens.size === 0) return false;
    if (anchors.some((anchor) => isSubset(anchor, entryTokens))) return true;
    return isSubset(entryTokens, labelTokens);
  });
}

function buildFallbackGraph(): SkillGraph {
  const nodes: SkillGraphNode[] = [];
  const edges: SkillGraphEdge[] = [];

  const skills = skillGroups.flatMap((group) =>
    group.items.map((label) => ({ label, slug: slugify(label), group: group.title })),
  );

  for (const skill of skills) {
    nodes.push({
      id: `skill:${skill.slug}`,
      label: skill.label,
      kind: "skill",
      group: skill.group,
      href: "#skills",
    });
  }

  for (const exp of experience) {
    const expId = `experience:${slugify(exp.company)}`;
    nodes.push({
      id: expId,
      label: exp.company,
      kind: "experience",
      group: exp.role,
      href: "#experience",
    });
    for (const skill of skills) {
      if (skillMatchesStack(skill.label, skill.slug, exp.stack)) {
        edges.push({ source: `skill:${skill.slug}`, target: expId, relation: "used-in" });
      }
    }
  }

  for (const project of fallbackProjects) {
    const projId = `project:${project.slug}`;
    nodes.push({
      id: projId,
      label: project.title,
      kind: "project",
      href: `/projects/${project.slug}`,
    });
    for (const skill of skills) {
      if (skillMatchesStack(skill.label, skill.slug, project.stack)) {
        edges.push({ source: `skill:${skill.slug}`, target: projId, relation: "used-in" });
      }
    }
  }

  return { nodes, edges };
}

/** The static graph, computed once at module load. */
export const fallbackSkillGraph: SkillGraph = buildFallbackGraph();
