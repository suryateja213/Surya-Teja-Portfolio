"use client";

import { useEffect, useMemo, useState } from "react";
import { fallbackSkillGraph } from "@/content/skill-graph";
import { skillGraphApi } from "@/lib/public/endpoints";
import type { SkillGraph, SkillGraphNode } from "@/lib/public/types";

/**
 * Static-first skill graph: returns the static fallback immediately (so the
 * section paints fully offline) and silently replaces it with the live graph
 * once `enabled` flips true (on viewport entry) and the fetch succeeds. Any
 * failure keeps the static graph — the recruiter never sees a broken state.
 */
export function useSkillGraph(enabled: boolean): { graph: SkillGraph; live: boolean } {
  const [graph, setGraph] = useState<SkillGraph>(fallbackSkillGraph);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!enabled || live) return;
    let cancelled = false;
    skillGraphApi
      .get()
      .then((fresh) => {
        if (!cancelled && fresh.nodes.length > 0) {
          setGraph(fresh);
          setLive(true);
        }
      })
      .catch(() => {
        /* keep the static fallback silently */
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, live]);

  return { graph, live };
}

/** The nodes directly connected to `nodeId`, with the relation that links them. */
export function relatedNodes(
  graph: SkillGraph,
  nodeId: string,
): { node: SkillGraphNode; relation: string }[] {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const out: { node: SkillGraphNode; relation: string }[] = [];
  const seen = new Set<string>();
  for (const edge of graph.edges) {
    let otherId: string | null = null;
    if (edge.source === nodeId) otherId = edge.target;
    else if (edge.target === nodeId) otherId = edge.source;
    if (!otherId || seen.has(otherId)) continue;
    const node = byId.get(otherId);
    if (node) {
      seen.add(otherId);
      out.push({ node, relation: edge.relation });
    }
  }
  return out;
}

/** Degree (edge count) per node id — used to size/emphasize hub skills. */
export function nodeDegrees(graph: SkillGraph): Map<string, number> {
  const deg = new Map<string, number>();
  for (const edge of graph.edges) {
    deg.set(edge.source, (deg.get(edge.source) ?? 0) + 1);
    deg.set(edge.target, (deg.get(edge.target) ?? 0) + 1);
  }
  return deg;
}

export type LaidOutNode = SkillGraphNode & { x: number; y: number };

/**
 * Deterministic radial layout around a selected node — no runtime physics.
 *
 * The selected node sits at center; its related nodes are placed on a ring,
 * spaced evenly by angle with a stable per-node offset so it reads as organic
 * but is identical on every render (SSR-safe, no layout shift). All unrelated
 * nodes are placed on a faint outer ring. Coordinates are in a 0..`size` box.
 */
export function radialLayout(
  graph: SkillGraph,
  selectedId: string | null,
  size: number,
): { nodes: LaidOutNode[]; center: { x: number; y: number } } {
  const center = { x: size / 2, y: size / 2 };
  const innerR = size * 0.3;
  const outerR = size * 0.46;

  if (!selectedId) {
    // No selection: arrange skills on an inner ring, the rest on an outer ring.
    const skills = graph.nodes.filter((n) => n.kind === "skill");
    const others = graph.nodes.filter((n) => n.kind !== "skill");
    const laid: LaidOutNode[] = [];
    skills.forEach((node, i) => {
      const a = (i / Math.max(skills.length, 1)) * Math.PI * 2 - Math.PI / 2;
      laid.push({ ...node, x: center.x + Math.cos(a) * innerR, y: center.y + Math.sin(a) * innerR });
    });
    others.forEach((node, i) => {
      const a = (i / Math.max(others.length, 1)) * Math.PI * 2 - Math.PI / 2 + 0.4;
      laid.push({ ...node, x: center.x + Math.cos(a) * outerR, y: center.y + Math.sin(a) * outerR });
    });
    return { nodes: laid, center };
  }

  const related = new Set(relatedNodes(graph, selectedId).map((r) => r.node.id));
  const relatedList = graph.nodes.filter((n) => related.has(n.id));
  const restList = graph.nodes.filter((n) => n.id !== selectedId && !related.has(n.id));

  const laid: LaidOutNode[] = [];
  const selected = graph.nodes.find((n) => n.id === selectedId);
  if (selected) laid.push({ ...selected, x: center.x, y: center.y });

  relatedList.forEach((node, i) => {
    const a = (i / Math.max(relatedList.length, 1)) * Math.PI * 2 - Math.PI / 2;
    laid.push({ ...node, x: center.x + Math.cos(a) * innerR, y: center.y + Math.sin(a) * innerR });
  });
  restList.forEach((node, i) => {
    const a = (i / Math.max(restList.length, 1)) * Math.PI * 2 - Math.PI / 2 + 0.25;
    laid.push({ ...node, x: center.x + Math.cos(a) * outerR, y: center.y + Math.sin(a) * outerR });
  });

  return { nodes: laid, center };
}

/** Convenience: the skill nodes only, sorted by degree (for the list view). */
export function useSkillNodesByDegree(graph: SkillGraph): SkillGraphNode[] {
  return useMemo(() => {
    const deg = nodeDegrees(graph);
    return graph.nodes
      .filter((n) => n.kind === "skill")
      .sort((a, b) => (deg.get(b.id) ?? 0) - (deg.get(a.id) ?? 0));
  }, [graph]);
}
