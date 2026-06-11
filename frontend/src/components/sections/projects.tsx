import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllProjects, getFeaturedProjects } from "@/content/projects";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { ProjectCard } from "@/components/projects/project-card";

export function Projects() {
  const featured = getFeaturedProjects();
  const hasMore = getAllProjects().length > featured.length;

  return (
    <Section id="projects">
      <SectionHeading
        title="Featured projects"
        lead="A few things I've built. Each one solved a concrete problem under real constraints."
      />
      <div className="grid gap-6 sm:grid-cols-2">
        {featured.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.05}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>

      {hasMore ? (
        <Link
          href="/projects"
          className="text-accent mt-8 inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          View all projects
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </Section>
  );
}
