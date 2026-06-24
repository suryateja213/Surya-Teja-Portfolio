"use client";

import { useMemo, useState } from "react";
import { radialLayout, relatedNodes } from "@/lib/public/skill-graph";
import { useTrack } from "@/lib/analytics/use-track";
import { SkillNodeDetail } from "@/components/sections/skill-graph/skill-node-detail";
import type { SkillGraph, SkillGraphNode } from "@/lib/public/types";

const SIZE = 520;

/** Per-kind node radius and fill token. */
function nodeRadius(kind: SkillGraphNode["kind"], selected: boolean): number {
  if (selected) return 9;
  return kind === "skill" ? 5 : 7;
}

/**
 * The SVG "constellation" view of the skill graph. Deterministic radial layout
 * (no physics loop), real focusable DOM nodes for keyboard + screen-reader
 * access, and color-only hover/selection states (the surrounding glass panel's
 * transform is never animated; these SVG children are free to change fill).
 */
export function SkillGraphView({ graph }: { graph: SkillGraph }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const track = useTrack();

  const { nodes } = useMemo(
    () => radialLayout(graph, selectedId, SIZE),
    [graph, selectedId],
  );
  const posById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const selected = selectedId ? (graph.nodes.find((n) => n.id === selectedId) ?? null) : null;
  const relatedIds = useMemo(
    () => new Set(selectedId ? relatedNodes(graph, selectedId).map((r) => r.node.id) : []),
    [graph, selectedId],
  );

  function selectNode(node: SkillGraphNode) {
    const next = node.id === selectedId ? null : node.id;
    setSelectedId(next);
    if (next && node.kind === "skill") {
      track({ name: "skill.viewed", props: { skillId: node.id, via: "graph" } });
    }
  }

  // Only draw edges incident to the selection (or all, faintly, when idle).
  const visibleEdges = graph.edges.filter((e) => {
    if (!selectedId) return false;
    return e.source === selectedId || e.target === selectedId;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-auto w-full"
          role="group"
          aria-label="Skill relationship graph. Activate a skill to see related experience and projects."
        >
          {/* Edges sit under the nodes and are decorative for assistive tech. */}
          <g aria-hidden>
            {visibleEdges.map((edge, i) => {
              const a = posById.get(edge.source);
              const b = posById.get(edge.target);
              if (!a || !b) return null;
              return (
                <line
                  key={`${edge.source}-${edge.target}-${i}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="var(--accent)"
                  strokeOpacity={0.35}
                  strokeWidth={1}
                />
              );
            })}
          </g>

          {nodes.map((node) => {
            const isSelected = node.id === selectedId;
            const isRelated = relatedIds.has(node.id);
            const dim = selectedId !== null && !isSelected && !isRelated;
            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${node.label}${node.kind === "skill" ? "" : ` (${node.kind})`}`}
                className="focus-visible:outline-accent cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => selectNode(node)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectNode(node);
                  }
                }}
                style={{ opacity: dim ? 0.3 : 1, transition: "opacity 0.25s ease" }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius(node.kind, isSelected)}
                  fill={isSelected || isRelated ? "var(--accent)" : "var(--card)"}
                  stroke="var(--accent)"
                  strokeOpacity={isSelected || isRelated ? 1 : 0.5}
                  strokeWidth={node.kind === "skill" ? 1 : 1.5}
                  style={{ transition: "fill 0.2s ease, stroke-opacity 0.2s ease" }}
                />
                {/* Label only for the selected node + its neighbours, to avoid clutter. */}
                {isSelected || isRelated || node.kind !== "skill" ? (
                  <text
                    x={node.x}
                    y={node.y - nodeRadius(node.kind, isSelected) - 5}
                    textAnchor="middle"
                    className="fill-muted font-mono"
                    style={{ fontSize: 9 }}
                  >
                    {node.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        {/* Selection announcer for screen-reader users of the SVG view. */}
        <p className="sr-only" aria-live="polite">
          {selected
            ? `${selected.label} selected. ${relatedIds.size} related items.`
            : "No skill selected."}
        </p>
      </div>

      <SkillNodeDetail graph={graph} selected={selected} />
    </div>
  );
}
