import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getProjectSlugs } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const home: MetadataRoute.Sitemap[number] = {
    url: site.url,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
  };

  const projects: MetadataRoute.Sitemap = getProjectSlugs().map((slug) => ({
    url: `${site.url}/projects/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [home, ...projects];
}
