import { ArrowUpRight, Github } from "lucide-react";
import { featuredProjects } from "@/content/projects";
import { Section, SectionHeading } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";

export function Projects() {
  return (
    <Section id="projects">
      <SectionHeading
        title="Featured projects"
        lead="A few things I've built. Each one solved a concrete problem under real constraints."
      />
      <div className="grid gap-6 sm:grid-cols-2">
        {featuredProjects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.05}>
            <article className="border-border bg-card hover:border-accent/50 flex h-full flex-col rounded-lg border p-6 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
                {project.links?.repo ? (
                  <a
                    href={project.links.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} on GitHub`}
                    className="text-muted hover:text-foreground shrink-0 transition-colors"
                  >
                    <Github className="h-5 w-5" aria-hidden />
                  </a>
                ) : null}
              </div>

              <p className="text-muted mt-3 flex-1 text-sm">{project.summary}</p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <li key={tech}>
                    <Badge>{tech}</Badge>
                  </li>
                ))}
              </ul>

              {project.links?.demo ? (
                <a
                  href={project.links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent mt-5 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  Live demo
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              ) : null}
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
