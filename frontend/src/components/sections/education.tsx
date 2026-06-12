import { GraduationCap } from "lucide-react";
import { education } from "@/content/education";
import { Section, SectionHeading } from "@/components/ui/section";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Reveal } from "@/components/ui/reveal";

export function Education() {
  return (
    <Section id="education">
      <SectionHeading eyebrow="Education" title="Education" />
      <div className="flex flex-col gap-4">
        {education.map((entry) => (
          <Reveal key={entry.school}>
            <GlassPanel className="flex items-start gap-4 p-6 sm:items-center sm:p-7">
              <span
                className="bg-accent/10 text-accent flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                aria-hidden
              >
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div>
                  <h3 className="font-semibold tracking-tight">{entry.school}</h3>
                  <p className="text-muted mt-0.5 text-sm">
                    {entry.degree}
                    {entry.detail ? ` · ${entry.detail}` : null}
                  </p>
                </div>
                <p className="text-muted font-mono text-sm">{entry.period}</p>
              </div>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
