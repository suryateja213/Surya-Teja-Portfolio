"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { relatedNodes } from "@/lib/public/skill-graph";
import type { SkillGraph, SkillGraphNode } from "@/lib/public/types";

const KIND_LABEL: Record<SkillGraphNode["kind"], string> = {
  skill: "Skill",
  experience: "Experience",
  project: "Project",
};

/**
 * Reveals the work connected to the selected graph node — the experiences and
 * projects a skill was used in, with deep-links into those sections. Rendered
 * beside the SVG view; updates as the selection changes.
 */
export function SkillNodeDetail({
  graph,
  selected,
}: {
  graph: SkillGraph;
  selected: SkillGraphNode | null;
}) {
  if (!selected) {
    return (
      <GlassPanel className="text-muted flex h-full items-center justify-center p-6 text-center text-sm">
        Select a skill to see where it shows up across my experience and projects.
      </GlassPanel>
    );
  }

  const related = relatedNodes(graph, selected.id);

  return (
    <GlassPanel className="h-full p-6">
      <p className="text-muted font-mono text-[0.65rem] tracking-[0.18em] uppercase">
        {KIND_LABEL[selected.kind]}
      </p>
      <h3 className="mt-1 text-lg font-semibold tracking-tight">{selected.label}</h3>
      {selected.group ? <p className="text-muted mt-1 text-sm">{selected.group}</p> : null}

      {related.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {related.map(({ node }) => (
            <li key={node.id}>
              {node.href ? (
                <Link
                  href={node.href}
                  className="group hover:border-accent/40 flex items-center justify-between rounded-md border border-transparent px-1 py-1 text-sm transition-colors"
                >
                  <span className="text-foreground group-hover:text-accent transition-colors">
                    {node.label}
                  </span>
                  <ArrowUpRight className="text-muted h-3.5 w-3.5 shrink-0" aria-hidden />
                </Link>
              ) : (
                <span className="text-foreground block px-1 py-1 text-sm">{node.label}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted mt-5 text-sm">No linked work yet.</p>
      )}
    </GlassPanel>
  );
}
