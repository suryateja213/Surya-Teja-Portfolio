/**
 * DTOs for the public (unauthenticated) portfolio API. These mirror the backend
 * Pydantic schemas (`app/schemas/skill_graph.py`, etc.) so the static site and
 * the API speak the same vocabulary.
 */

export type SkillGraphNodeKind = "skill" | "experience" | "project";
export type SkillGraphRelation = "used-in" | "related-to";

export type SkillGraphNode = {
  id: string;
  label: string;
  kind: SkillGraphNodeKind;
  /** Skill group title or experience role — optional context. */
  group?: string;
  /** Deep-link target on the site, e.g. "#experience" or "/projects/<slug>". */
  href?: string;
};

export type SkillGraphEdge = {
  source: string;
  target: string;
  relation: SkillGraphRelation;
};

export type SkillGraph = {
  nodes: SkillGraphNode[];
  edges: SkillGraphEdge[];
};

/** Answer payload from `POST /v1/ask`. */
export type AskCitation = {
  ref: string;
  title: string;
  snippet: string;
  /** Optional deep-link to the cited section/project. */
  href?: string;
};

export type AskAnswer = {
  answer: string;
  sources: AskCitation[];
  relatedSkills: string[];
};

/** A public-safe event from `GET /v1/events/recent` (no PII). */
export type ActivityEvent = {
  id: string;
  type: string;
  target?: string | null;
  created_at: string;
};

/** A page envelope from the API (mirrors backend `Page[T]`). */
export type Page<T> = {
  items: T[];
  next_cursor: string | null;
};

/** AI latency stats from `GET /v1/stats` (milliseconds). */
export type LatencyStats = {
  p50: number;
  p95: number;
  samples: number;
};

/** Public observability stats — safe to render on the site (no spend cap, no PII). */
export type PublicStats = {
  day: string;
  events_total: number;
  by_type: Record<string, number>;
  ai_queries_today: number;
  ai_latency: LatencyStats;
};
