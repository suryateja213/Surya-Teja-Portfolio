"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSkillGraph } from "@/lib/public/skill-graph";
import { SkillGraphView } from "@/components/sections/skill-graph/skill-graph-view";
import { SkillGraphList } from "@/components/sections/skill-graph/skill-graph-list";

// Probe reduced-motion / reduced-transparency once, read via
// useSyncExternalStore so the snapshot is stable and SSR-safe (the calm value
// drives only the default sub-view, so a static `true` on the server — and on
// first client paint — biases toward the accessible list, then settles).
const calmSubscribe = () => () => {};

function getPrefersCalm(): boolean {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(prefers-reduced-transparency: reduce)").matches
  );
}

/**
 * The interactive skill graph, presented as a unified toggle alongside the
 * static skill badges: Groups (badges) · Constellation (SVG) · List
 * (accessible). Defers the live graph fetch until the panel scrolls into view,
 * and selects the accessible List by default under reduced motion/transparency.
 * `groupsSlot` is the existing badge grid, rendered as the default tab.
 */
export function SkillGraphPanel({ groupsSlot }: { groupsSlot: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const calm = useSyncExternalStore(calmSubscribe, getPrefersCalm, () => true);
  const { graph } = useSkillGraph(visible);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisible(true);
      },
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  // Groups (badges) is always the skimmable default. The second tab is the
  // accessible List under reduced motion/transparency, otherwise the SVG
  // Constellation — one toggle, not a nested control.
  return (
    <div ref={ref}>
      <Tabs defaultValue="groups" className="w-full">
        <TabsList aria-label="Skills view">
          <TabsTrigger value="groups">Groups</TabsTrigger>
          {calm ? (
            <TabsTrigger value="graph">List</TabsTrigger>
          ) : (
            <TabsTrigger value="graph">Constellation</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="groups">{groupsSlot}</TabsContent>
        <TabsContent value="graph">
          {calm ? <SkillGraphList graph={graph} /> : <SkillGraphView graph={graph} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
