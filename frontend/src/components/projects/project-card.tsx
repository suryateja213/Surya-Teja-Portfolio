import { ArrowUpRight, Github } from "lucide-react";
import type { ProjectMeta } from "@/content/projects";
import { Badge } from "@/components/ui/badge";
import { ProjectCardLink } from "@/components/projects/project-card-link";

/** Shared project card used on the home grid and the /projects index. */
export function ProjectCard({
  project,
  from = "home",
}: {
  project: ProjectMeta;
  /** Which surface the card is on — flows into the `project.opened` event. */
  from?: "home" | "index";
}) {
  return (
    <article className="group glass hover:border-accent/50 relative flex h-full flex-col rounded-2xl p-6 transition-[border-color] duration-300">
      <div className="flex items-start justify-between gap-4">
        <h3 className="group-hover:text-accent text-lg font-semibold tracking-tight transition-colors duration-300">
          {/* Whole card is clickable via this stretched link. */}
          <ProjectCardLink slug={project.slug} from={from} className="after:absolute after:inset-0">
            {project.title}
          </ProjectCardLink>
        </h3>
        {project.links?.repo ? (
          <a
            href={project.links.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} on GitHub`}
            className="text-muted hover:text-foreground relative z-10 shrink-0 transition-colors"
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

      <span className="text-accent mt-5 inline-flex items-center gap-1 text-sm font-medium">
        Read case study
        <ArrowUpRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </article>
  );
}
