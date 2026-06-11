import { site } from "@/content/site";
import { socials } from "@/content/socials";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/sections/contact-form";

export function Contact() {
  return (
    <Section id="contact">
      <Reveal>
        <div className="flex flex-col items-start gap-8">
          <SectionHeading
            title="Get in touch"
            lead="Have a role or a problem worth solving? Send a note, or email me directly."
          />

          <ContactForm />

          <div className="flex flex-col gap-3">
            <a
              href={`mailto:${site.email}`}
              className="text-muted hover:text-foreground text-sm transition-colors"
            >
              {site.email}
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
        </div>
      </Reveal>
    </Section>
  );
}
