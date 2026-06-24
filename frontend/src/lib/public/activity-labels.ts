/**
 * Turn a raw activity event into a human one-liner for the live feed.
 *
 * The copy is deliberately system-flavored — it reads as a platform heartbeat
 * ("AI query processed", "Skill viewed"), never as visitor surveillance, and
 * never exposes who did anything (events are already PII-free server-side).
 */

import type { ActivityEvent } from "@/lib/public/types";

/** A relative, human time like "just now" / "2m ago". */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

/** Prettify a skill node id / slug into a label ("skill:apache-kafka" → "Apache Kafka"). */
function pretty(target: string): string {
  return target
    .replace(/^skill:/, "")
    .split(/[-_]/)
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

export function labelForEvent(event: ActivityEvent): string {
  const target = event.target ? pretty(event.target) : null;
  switch (event.type) {
    case "skill.viewed":
      return target ? `Skill explored — ${target}` : "Skill explored";
    case "ai.asked":
      return "AI query processed";
    case "project.opened":
      return target ? `Case study opened — ${target}` : "Case study opened";
    case "contact.submitted":
      return "Contact message received";
    default:
      return "Activity";
  }
}
