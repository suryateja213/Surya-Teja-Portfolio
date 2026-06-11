import { ArrowDown } from "lucide-react";
import { site } from "@/content/site";
import { socials } from "@/content/socials";
import { Reveal } from "@/components/ui/reveal";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-24 sm:py-32">
      <Reveal>
        <p className="text-accent font-mono text-sm">{site.role}</p>
      </Reveal>

      <Reveal delay={0.05}>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          {site.name}
        </h1>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="text-muted mt-6 max-w-2xl text-lg">{site.tagline}</p>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#projects"
            className="bg-accent text-accent-foreground focus-visible:ring-accent focus-visible:ring-offset-background inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            View work
            <ArrowDown className="h-4 w-4" aria-hidden />
          </a>
          <a
            href="#contact"
            className="border-border hover:bg-card focus-visible:ring-accent focus-visible:ring-offset-background inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Get in touch
          </a>

          <div className="ml-auto flex items-center gap-1">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={label}
                className="text-muted hover:bg-card hover:text-foreground inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors"
              >
                <Icon className="h-5 w-5" aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
