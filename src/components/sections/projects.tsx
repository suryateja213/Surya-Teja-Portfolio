import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import { getFeaturedProjects } from "@/content/projects";
import { Section, SectionHeading } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";

export function Projects() {
  const featured = getFeaturedProjects();

  return (
    <Section id="projects">
      <SectionHeading
        title="Featured projects"
        lead="A few things I've built. Each one solved a concrete problem under real constraints."
      />
      <div className="grid gap-6 sm:grid-cols-2">
        {featured.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.05}>
            <article className="group relative flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/50">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold tracking-tight">
                  {/* Whole card is clickable via this stretched link. */}
                  <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
                    {project.title}
                  </Link>
                </h3>
                {project.links?.repo ? (
                  <a
                    href={project.links.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} on GitHub`}
                    // relative z-10 keeps this above the stretched link.
                    className="relative z-10 shrink-0 text-muted transition-colors hover:text-foreground"
                  >
                    <Github className="h-5 w-5" aria-hidden />
                  </a>
                ) : null}
              </div>

              <p className="mt-3 flex-1 text-sm text-muted">{project.summary}</p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <li key={tech}>
                    <Badge>{tech}</Badge>
                  </li>
                ))}
              </ul>

              <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-accent">
                Read case study
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
