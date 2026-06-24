/**
 * Recruiter Journey Tracker — the typed event taxonomy.
 *
 * These names + payloads are the contract with the backend ingest endpoint
 * (`POST /v1/events`). Keep them in sync with the backend EVENT item `type`
 * field. Payloads carry NO PII: never the raw question text, a name, or an
 * email — only shapes/counts/flags safe to log. See `track.ts` for the
 * privacy and transport rules.
 */

/** Discriminated union of every trackable interaction. */
export type TrackEvent =
  | { name: "skill.viewed"; props: { skillId: string; via: "graph" | "list" } }
  | { name: "ai.asked"; props: { questionLength: number; suggested: boolean } }
  | {
      name: "project.opened";
      props: { slug: string; from: "home" | "index" | "ai" | "graph" };
    }
  | { name: "contact.submitted"; props: { ok: boolean } };

/** Event name literals, for narrowing and call sites. */
export type TrackEventName = TrackEvent["name"];

/**
 * The wire envelope sent to the backend. `track()` builds this from a
 * `TrackEvent` plus ambient context (session, path, timestamp).
 */
export type TrackEnvelope = {
  /** Maps to the backend EVENT `type` (e.g. "skill.viewed"). */
  name: TrackEventName;
  /** Event-specific, PII-free payload. */
  props: TrackEvent["props"];
  /** Per-tab anonymous id (sessionStorage), not a cross-site cookie. */
  sessionId: string;
  /** Pathname only — never query string. */
  path: string;
  /** Client timestamp (ISO-8601); the backend stamps its own authoritative one too. */
  ts: string;
};
