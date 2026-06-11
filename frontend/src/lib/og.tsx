import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/** Standard OG image dimensions. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/**
 * Shared OG image template. Dark, minimal, on-brand — an eyebrow, a large title,
 * and a footer with name + role. Used by the home and project OG routes.
 */
export function renderOgImage({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#0f1115",
        color: "#f5f5f5",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {eyebrow ? (
          <div style={{ fontSize: 30, color: "#7aa2f7", marginBottom: 24 }}>{eyebrow}</div>
        ) : null}
        <div style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.1, maxWidth: 960 }}>{title}</div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 28,
          color: "#a1a1aa",
        }}
      >
        <span>{site.name}</span>
        <span>{site.role}</span>
      </div>
    </div>,
    { ...OG_SIZE },
  );
}
