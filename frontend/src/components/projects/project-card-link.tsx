"use client";

import Link from "next/link";
import { useTrack } from "@/lib/analytics/use-track";

type ProjectOpenSource = "home" | "index" | "ai" | "graph";

/**
 * The stretched, whole-card link for a project, split into a tiny client
 * component so it can emit a `project.opened` event on activation while
 * `ProjectCard` itself stays a server component. Fire-and-forget — the
 * navigation is never blocked by tracking.
 */
export function ProjectCardLink({
  slug,
  from,
  className,
  children,
}: {
  slug: string;
  from: ProjectOpenSource;
  className?: string;
  children: React.ReactNode;
}) {
  const track = useTrack();
  return (
    <Link
      href={`/projects/${slug}`}
      className={className}
      onClick={() => track({ name: "project.opened", props: { slug, from } })}
    >
      {children}
    </Link>
  );
}
