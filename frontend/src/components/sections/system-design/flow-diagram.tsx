"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { SystemDiagram } from "@/content/system-design";

// Geometry constants for the horizontal pipeline layout (SVG user units).
const NODE_W = 150;
const NODE_H = 64;
const GAP = 56;
const PAD = 16;
const ROW_Y = 80;

/**
 * A hand-built SVG architecture diagram: a left-to-right pipeline of glass
 * nodes with labelled arrows and (reduced-motion-safe) animated flow dots.
 * Monochrome, themed via CSS vars. The SVG is decorative for assistive tech —
 * the equivalent ordered-list description (rendered by the parent) is the
 * accessible representation, so this carries role="img" + a summary label.
 */
export function FlowDiagram({ diagram }: { diagram: SystemDiagram }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");

  const n = diagram.nodes.length;
  const width = n * NODE_W + (n - 1) * GAP + PAD * 2;
  const height = ROW_Y + NODE_H + 64; // room for the arc edges below

  // Each node's top-left x, evenly spaced along the main row.
  const xOf = (index: number) => PAD + index * (NODE_W + GAP);
  const centerOf = (index: number) => ({
    x: xOf(index) + NODE_W / 2,
    y: ROW_Y + NODE_H / 2,
  });
  const indexById = new Map(diagram.nodes.map((node, i) => [node.id, i]));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full min-w-[640px]"
      role="img"
      aria-label={`Architecture diagram: ${diagram.title}. ${diagram.summary}`}
    >
      <defs>
        <marker
          id={`arrow-${uid}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="var(--border)" />
        </marker>
      </defs>

      {/* Edges first, under the nodes. */}
      <g aria-hidden>
        {diagram.edges.map((edge, i) => {
          const a = indexById.get(edge.from);
          const b = indexById.get(edge.to);
          if (a == null || b == null) return null;
          const ca = centerOf(a);
          const cb = centerOf(b);
          const adjacent = Math.abs(b - a) === 1 && b > a;

          // Adjacent forward edges are straight; longer/back edges arc below.
          let d: string;
          let labelX: number;
          let labelY: number;
          // Straight-edge endpoints, used to animate the flow dot on x only
          // (bulletproof across browsers — no offset-path dependency).
          let straight: { x1: number; x2: number; y: number } | null = null;
          if (adjacent) {
            const x1 = xOf(a) + NODE_W;
            const x2 = xOf(b);
            d = `M ${x1} ${ca.y} L ${x2} ${cb.y}`;
            labelX = (x1 + x2) / 2;
            labelY = ca.y - 8;
            straight = { x1, x2, y: ca.y };
          } else {
            const dipY = ROW_Y + NODE_H + 44;
            const sx = ca.x;
            const ex = cb.x;
            d = `M ${sx} ${ROW_Y + NODE_H} C ${sx} ${dipY}, ${ex} ${dipY}, ${ex} ${ROW_Y + NODE_H}`;
            labelX = (sx + ex) / 2;
            labelY = dipY + 4;
          }

          return (
            <g key={`${edge.from}-${edge.to}-${i}`}>
              <path
                d={d}
                fill="none"
                stroke="var(--border)"
                strokeWidth={1.5}
                markerEnd={`url(#arrow-${uid})`}
              />
              {edge.label ? (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  className="fill-muted font-mono"
                  style={{ fontSize: 10 }}
                >
                  {edge.label}
                </text>
              ) : null}
              {/* A single flow dot travelling each straight forward edge.
                  Animates cx only (edges are horizontal) — no offset-path, so
                  it works in every browser. Gated by reduced-motion. */}
              {straight && !reduce ? (
                <motion.circle
                  cy={straight.y}
                  r={2.5}
                  fill="var(--accent)"
                  initial={{ cx: straight.x1 }}
                  animate={{ cx: straight.x2 }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: a * 0.2,
                  }}
                />
              ) : null}
            </g>
          );
        })}
      </g>

      {/* Nodes. */}
      {diagram.nodes.map((node, i) => (
        <g key={node.id}>
          <rect
            x={xOf(i)}
            y={ROW_Y}
            width={NODE_W}
            height={NODE_H}
            rx={10}
            fill="var(--card)"
            stroke="var(--border)"
            strokeWidth={1}
          />
          <text
            x={xOf(i) + NODE_W / 2}
            y={ROW_Y + 24}
            textAnchor="middle"
            className="fill-foreground font-medium"
            style={{ fontSize: 12 }}
          >
            {node.label}
          </text>
          <text
            x={xOf(i) + NODE_W / 2}
            y={ROW_Y + 44}
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 9 }}
          >
            {truncate(node.detail, 26)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
