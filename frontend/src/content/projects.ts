import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Project case studies live as MDX files in `src/content/projects/<slug>.mdx`.
 * Frontmatter carries the typed metadata used by cards, listings, SEO, and the
 * sitemap. The MDX body is the case study, rendered on the detail page.
 *
 * This module is server-only (it reads the filesystem). Import it from Server
 * Components, `generateStaticParams`, `generateMetadata`, sitemap, etc. — never
 * from a `"use client"` file.
 */

export type ProjectMeta = {
  slug: string;
  title: string;
  /** One line: what it is and why it's interesting. Used on cards + meta description. */
  summary: string;
  /** 3–6 tags, most important first. */
  stack: string[];
  /** Optional outward links. */
  links?: {
    repo?: string;
    demo?: string;
  };
  /** Surface on the home grid. */
  featured: boolean;
  /** Lower numbers sort first. */
  order: number;
};

const PROJECTS_DIR = path.join(process.cwd(), "src/content/projects");

function readProjectFile(fileName: string): ProjectMeta {
  const slug = fileName.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(PROJECTS_DIR, fileName), "utf8");
  const { data } = matter(raw);

  return {
    slug,
    title: String(data.title ?? slug),
    summary: String(data.summary ?? ""),
    stack: Array.isArray(data.stack) ? data.stack.map(String) : [],
    links: data.links ?? undefined,
    featured: Boolean(data.featured),
    order: typeof data.order === "number" ? data.order : 999,
  };
}

/** All projects, sorted by `order`. */
export function getAllProjects(): ProjectMeta[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(readProjectFile)
    .sort((a, b) => a.order - b.order);
}

/** Projects flagged `featured`, for the home grid. */
export function getFeaturedProjects(): ProjectMeta[] {
  return getAllProjects().filter((p) => p.featured);
}

/** Single project's metadata, or null if the slug doesn't exist. */
export function getProjectMeta(slug: string): ProjectMeta | null {
  return getAllProjects().find((p) => p.slug === slug) ?? null;
}

/** Slugs for `generateStaticParams`. */
export function getProjectSlugs(): string[] {
  return getAllProjects().map((p) => p.slug);
}
