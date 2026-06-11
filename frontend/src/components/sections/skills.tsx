import { skillGroups } from "@/content/skills";
import { Section, SectionHeading } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";

export function Skills() {
  return (
    <Section id="skills">
      <SectionHeading
        title="Skills"
        lead="The tools I reach for, grouped by where they fit in a system."
      />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group, i) => (
          <Reveal key={group.title} delay={i * 0.04}>
            <div>
              <h3 className="text-muted text-sm font-medium">{group.title}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item}>
                    <Badge>{item}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
