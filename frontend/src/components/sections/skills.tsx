import { skillGroups } from "@/content/skills";
import { Section, SectionHeading } from "@/components/ui/section";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { SkillGraphPanel } from "@/components/sections/skill-graph/skill-graph-panel";

/** The static badge grid — the always-works, skimmable baseline view. */
function SkillGroups() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skillGroups.map((group, i) => (
        <Reveal key={group.title} delay={i * 0.04} className="h-full">
          <GlassPanel className="h-full p-6">
            <h3 className="text-muted font-mono text-xs font-medium tracking-[0.15em] uppercase">
              {group.title}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item}>
                  <Badge>{item}</Badge>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </Reveal>
      ))}
    </div>
  );
}

export function Skills() {
  return (
    <Section id="skills" tone="tinted">
      <SectionHeading
        eyebrow="Capabilities"
        title="Skills"
        displayClass="font-display-skills"
        lead="The tools I reach for — as groups, or as a graph of where they connect across my work."
      />
      {/* Badges stay the default; the graph is an interactive enhancement. */}
      <SkillGraphPanel groupsSlot={<SkillGroups />} />
    </Section>
  );
}
