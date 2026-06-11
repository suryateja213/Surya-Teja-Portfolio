import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * Single-page site for now. When `/projects/[slug]` pages land,
 * map over `projects` and append their URLs here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
