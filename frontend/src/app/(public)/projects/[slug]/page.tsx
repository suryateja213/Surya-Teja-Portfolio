import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { getProjectMeta, getProjectSlugs } from "@/content/projects";
import { Badge } from "@/components/ui/badge";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectMeta(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary, type: "article" },
    twitter: { card: "summary_large_image", title: project.title, description: project.summary },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProjectMeta(slug);
  if (!project) notFound();

  // Import the MDX body for this slug. Only matched static params reach here.
  const { default: Body } = await import(`@/content/projects/${slug}.mdx`);

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
      <Link
        href="/#projects"
        className="text-muted hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to projects
      </Link>

      <header className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}</h1>
        <p className="text-muted mt-4 text-lg">{project.summary}</p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <li key={tech}>
              <Badge>{tech}</Badge>
            </li>
          ))}
        </ul>

        {project.links?.repo || project.links?.demo ? (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {project.links?.repo ? (
              <a
                href={project.links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent inline-flex items-center gap-2 text-sm font-medium hover:underline"
              >
                <Github className="h-4 w-4" aria-hidden />
                Source
              </a>
            ) : null}
            {project.links?.demo ? (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                Live demo
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="border-border mt-12 border-t pt-10">
        <Body />
      </div>
    </article>
  );
}
