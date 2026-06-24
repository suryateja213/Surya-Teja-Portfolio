"use client";

import { Section, SectionHeading } from "@/components/ui/section";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { systemDiagrams, type SystemDiagram } from "@/content/system-design";
import { FlowDiagram } from "@/components/sections/system-design/flow-diagram";

/**
 * System Design — hand-built SVG architecture diagrams of how THIS site works.
 * Each diagram pairs the visual flow with an accessible ordered-list of steps
 * (the SVG is role="img", the list is the real a11y representation) and a
 * "why it's built this way" note — the senior signal.
 */
export function SystemDesign() {
  return (
    <Section id="system-design" tone="tinted">
      <SectionHeading
        eyebrow="System design"
        title="How this site works"
        displayClass="font-display-projects"
        lead="This portfolio is its own case study. These are the real architectures running behind it."
      />

      <Tabs defaultValue={systemDiagrams[0].id} className="w-full">
        <TabsList aria-label="System design diagrams">
          {systemDiagrams.map((d) => (
            <TabsTrigger key={d.id} value={d.id}>
              {shortTitle(d)}
            </TabsTrigger>
          ))}
        </TabsList>

        {systemDiagrams.map((diagram) => (
          <TabsContent key={diagram.id} value={diagram.id}>
            <DiagramPanel diagram={diagram} />
          </TabsContent>
        ))}
      </Tabs>
    </Section>
  );
}

function DiagramPanel({ diagram }: { diagram: SystemDiagram }) {
  return (
    <div className="space-y-4">
      <p className="text-muted max-w-2xl text-sm">{diagram.summary}</p>

      <GlassPanel className="overflow-x-auto p-4 sm:p-6">
        <FlowDiagram diagram={diagram} />
      </GlassPanel>

      {/* Accessible, always-present step description (and a clean read on mobile). */}
      <GlassPanel variant="subtle" className="rounded-2xl p-5">
        <h3 className="text-muted font-mono text-[0.65rem] tracking-[0.18em] uppercase">
          The flow
        </h3>
        <ol className="mt-3 space-y-2">
          {diagram.nodes.map((node, i) => (
            <li key={node.id} className="flex gap-3 text-sm">
              <span className="text-muted shrink-0 font-mono text-xs">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="text-foreground font-medium">{node.label}</span>
                <span className="text-muted"> — {node.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </GlassPanel>

      <GlassPanel variant="subtle" className="border-accent/20 rounded-2xl border p-5">
        <h3 className="text-muted font-mono text-[0.65rem] tracking-[0.18em] uppercase">
          Why this way
        </h3>
        <p className="text-foreground mt-2 text-sm leading-relaxed">{diagram.why}</p>
      </GlassPanel>
    </div>
  );
}

/** A short tab label from the diagram title (text before the em-dash). */
function shortTitle(d: SystemDiagram): string {
  return d.title.split("—")[0].trim();
}
