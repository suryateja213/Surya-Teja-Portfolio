import { site } from "@/content/site";
import { SocialLinks } from "@/components/layout/social-links";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/sections/contact-form";

export function Contact() {
  return (
    <Section id="contact">
      <Reveal>
        <div className="flex flex-col items-start gap-8">
          <SectionHeading
            eyebrow="Contact"
            title="Get in touch"
            lead="Have a role or a problem worth solving? Send a note, or email me directly."
          />

          <GlassPanel className="w-full max-w-lg p-6 sm:p-8">
            <ContactForm />
          </GlassPanel>

          <div className="flex flex-col gap-3">
            <a
              href={`mailto:${site.email}`}
              className="text-muted hover:text-foreground text-sm transition-colors"
            >
              {site.email}
            </a>
            <SocialLinks variant="labels" exclude={["Email"]} />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
