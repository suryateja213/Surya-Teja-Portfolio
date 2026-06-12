import { experience } from "@/content/experience";
import { Section, SectionHeading } from "@/components/ui/section";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";

export function Experience() {
  return (
    <Section id="experience" tone="tinted">
      <SectionHeading
        eyebrow="Experience"
        title="Where I've shipped"
        lead="Impact, not job descriptions — the numbers are verifiable against the case studies."
      />
      <div className="flex flex-col gap-6">
        {experience.map((job, i) => (
          <Reveal key={job.company} delay={i * 0.05}>
            <GlassPanel className="p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-xl font-semibold tracking-tight">{job.company}</h3>
                <p className="text-muted font-mono text-sm">{job.period}</p>
              </div>
              <p className="text-accent mt-1 text-sm font-medium">{job.role}</p>
              <p className="text-muted mt-4 max-w-3xl text-sm leading-relaxed">{job.summary}</p>

              <ul className="mt-5 space-y-2.5">
                {job.highlights.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed">
                    <span className="bg-accent mt-2 h-1 w-1 shrink-0 rounded-full" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>

              <ul className="mt-6 flex flex-wrap gap-2">
                {job.stack.map((tech) => (
                  <li key={tech}>
                    <Badge>{tech}</Badge>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
