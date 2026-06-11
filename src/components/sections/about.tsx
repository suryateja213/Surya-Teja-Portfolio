import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function About() {
  return (
    <Section id="about">
      <SectionHeading title="About" />
      <Reveal>
        <div className="text-muted max-w-2xl space-y-4">
          <p>
            I&apos;m a backend engineer who likes the unglamorous parts of software: the queues, the
            indexes, the traces that tell you what actually happened at 3am. Most of my work sits
            behind the UI, where correctness and latency are the whole job.
          </p>
          <p>
            I&apos;ve spent the last few years on distributed, event-driven systems in healthcare
            and platform domains &mdash; designing services that stay fast under load and stay
            debuggable when they don&apos;t. I care about clear interfaces, honest observability,
            and code the next person can change without fear.
          </p>
          <p>
            I&apos;m currently open to backend and platform roles where the problems are real and
            the bar for engineering is high.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
