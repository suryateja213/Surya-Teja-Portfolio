import { ArrowUpRight } from "lucide-react";
import { site } from "@/content/site";
import { socials } from "@/content/socials";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function Contact() {
  return (
    <Section id="contact">
      <Reveal>
        <div className="flex flex-col items-start gap-6">
          <SectionHeading
            title="Get in touch"
            lead="The fastest way to reach me is email. I read everything and reply to anything concrete."
          />
          <a
            href={`mailto:${site.email}`}
            className="bg-accent text-accent-foreground focus-visible:ring-accent focus-visible:ring-offset-background inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {site.email}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>

          <ul className="flex flex-wrap items-center gap-4">
            {socials
              .filter((s) => s.label !== "Email")
              .map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </Reveal>
    </Section>
  );
}
