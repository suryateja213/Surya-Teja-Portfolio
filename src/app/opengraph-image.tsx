import { site } from "@/content/site";
import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${site.name} — ${site.role}`;

export default function Image() {
  return renderOgImage({ eyebrow: site.role, title: site.tagline });
}
