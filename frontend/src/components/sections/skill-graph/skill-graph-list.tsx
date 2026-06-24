"use client";

import Link from "next/link";
import { relatedNodes, useSkillNodesByDegree } from "@/lib/public/skill-graph";
import { useTrack } from "@/lib/analytics/use-track";
import type { SkillGraph, SkillGraphNode } from "@/lib/public/types";

/**
 * The accessible, always-in-the-DOM representation of the skill graph: a list
 * of skills, each expanding to the experience and projects it appears in. This
 * is the canonical keyboard/screen-reader equivalent of the SVG constellation,
 * and the default under reduced-motion / reduced-transparency.
 */
export function SkillGraphList({ graph }: { graph: SkillGraph }) {
  const skills = useSkillNodesByDegree(graph);
  const track = useTrack();

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {skills.map((skill) => {
        const related = relatedNodes(graph, skill.id);
        return (
          <li key={skill.id}>
            <details
              className="glass-subtle group rounded-md px-4 py-3"
              onToggle={(e) => {
                if ((e.currentTarget as HTMLDetailsElement).open) {
                  track({ name: "skill.viewed", props: { skillId: skill.id, via: "list" } });
                }
              }}
            >
              <summary className="focus-visible:ring-accent/40 flex cursor-pointer items-center justify-between rounded-sm text-sm font-medium focus-visible:outline-none focus-visible:ring-2">
                <span>{skill.label}</span>
                <span className="text-muted font-mono text-xs">{related.length}</span>
              </summary>
              {related.length > 0 ? (
                <div className="mt-3 space-y-2 text-sm">
                  <RelatedGroup label="Used in" nodes={related.map((r) => r.node)} />
                </div>
              ) : (
                <p className="text-muted mt-3 text-sm">No linked work yet.</p>
              )}
            </details>
          </li>
        );
      })}
    </ul>
  );
}

function RelatedGroup({ label, nodes }: { label: string; nodes: SkillGraphNode[] }) {
  const experiences = nodes.filter((n) => n.kind === "experience");
  const projects = nodes.filter((n) => n.kind === "project");
  if (experiences.length === 0 && projects.length === 0) return null;

  return (
    <div>
      <p className="text-muted font-mono text-[0.65rem] tracking-[0.15em] uppercase">{label}</p>
      <ul className="mt-1.5 flex flex-wrap gap-2">
        {[...experiences, ...projects].map((node) => (
          <li key={node.id}>
            {node.href ? (
              <Link
                href={node.href}
                className="text-foreground hover:text-accent underline-offset-2 hover:underline"
              >
                {node.label}
              </Link>
            ) : (
              <span className="text-foreground">{node.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
