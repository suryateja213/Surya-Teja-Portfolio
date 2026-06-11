import { getProjectMeta, getProjectSlugs } from "@/content/projects";
import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectMeta(slug);
  return renderOgImage({
    eyebrow: "Case study",
    title: project?.title ?? "Project",
  });
}
