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
