"use client";

import { useEffect, useRef, useState } from "react";
import { Section, SectionHeading } from "@/components/ui/section";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useStats } from "@/lib/public/stats";
import type { PublicStats } from "@/lib/public/types";

// Below this many tracked interactions today, the section stays hidden — a
// dashboard reading "2 requests" looks worse than no dashboard.
const MIN_EVENTS = 5;

const TYPE_LABELS: Record<string, string> = {
  "skill.viewed": "Skills explored",
  "ai.asked": "AI queries",
  "project.opened": "Case studies opened",
  "contact.submitted": "Messages received",
};

/**
 * Observability dashboard — real, public-safe platform metrics for THIS site:
 * interactions tracked through the event pipeline, AI queries answered, and
 * genuine AI response latency (p50/p95 from logged queries). No charting lib
 * (hand-rolled monochrome bars), no sensitive data (never the spend cap), and
 * self-hides until there's enough real activity to be worth showing.
 */
export function Observability() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const { stats, loaded } = useStats(active);

  useEffect(() => {
    const el = ref.current;
    if (!el || active) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setActive(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  const show = loaded && stats !== null && stats.events_total >= MIN_EVENTS;

  return (
    <div ref={ref} aria-hidden={!show}>
      {show && stats ? (
        <Section id="observability" tone="default">
          <SectionHeading
            eyebrow="Observability"
            title="System health"
            displayClass="font-display-skills"
            lead="The same platform thinking I apply at work, pointed at this site. These numbers are live."
          />
          <Dashboard stats={stats} />
        </Section>
      ) : null}
    </div>
  );
}

function Dashboard({ stats }: { stats: PublicStats }) {
  const hasLatency = stats.ai_latency.samples > 0;
  const maxCount = Math.max(1, ...Object.values(stats.by_type));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <StatCard label="Interactions today" value={stats.events_total.toLocaleString()} />
      <StatCard label="AI queries today" value={stats.ai_queries_today.toLocaleString()} />
      <StatCard
        label="AI latency"
        value={hasLatency ? `${stats.ai_latency.p50}ms` : "—"}
        sub={
          hasLatency
            ? `p50 · ${stats.ai_latency.p95}ms p95 · ${stats.ai_latency.samples} samples`
            : "no queries yet"
        }
      />

      {Object.keys(stats.by_type).length > 0 ? (
        <GlassPanel className="p-6 lg:col-span-3">
          <p className="text-muted font-mono text-[0.65rem] tracking-[0.18em] uppercase">
            Activity breakdown
          </p>
          <ul className="mt-4 space-y-3">
            {Object.entries(stats.by_type)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <li key={type} className="flex items-center gap-3 text-sm">
                  <span className="text-muted w-40 shrink-0">{TYPE_LABELS[type] ?? type}</span>
                  <span className="bg-border/40 h-2 flex-1 overflow-hidden rounded-full">
                    <span
                      className="bg-accent/70 block h-full rounded-full"
                      style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                    />
                  </span>
                  <span className="text-foreground w-8 shrink-0 text-right font-mono text-xs">
                    {count}
                  </span>
                </li>
              ))}
          </ul>
        </GlassPanel>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <GlassPanel className="p-6">
      <p className="text-muted font-mono text-[0.65rem] tracking-[0.18em] uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {sub ? <p className="text-muted mt-1 font-mono text-xs">{sub}</p> : null}
    </GlassPanel>
  );
}
