import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllProjects } from "@/content/projects";
import { ProjectCard } from "@/components/projects/project-card";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected engineering projects and case studies.",
};

export default function ProjectsIndexPage() {
  const projects = getAllProjects();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
      <Link
        href="/"
        className="text-muted hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back home
      </Link>

      <header className="mt-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Projects</h1>
        <p className="text-muted mt-3">
          Each one started as a concrete problem. The case studies cover the decisions and the
          tradeoffs, not just the outcome.
        </p>
      </header>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
