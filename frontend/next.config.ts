import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Static export: emit a fully static site into `out/` for S3 + CloudFront.
  // No server runtime — the contact form POSTs to the FastAPI backend instead.
  output: "export",
  // Each route emits `route/index.html`, which maps cleanly to S3 object keys
  // and avoids most CloudFront directory-resolution 404s.
  trailingSlash: true,
  // The default Image Optimization API needs a server; disable it for export.
  images: { unoptimized: true },
  // Allow .mdx alongside .ts/.tsx pages and imports.
  pageExtensions: ["ts", "tsx", "mdx"],
};

const withMDX = createMDX({
  // Add remark/rehype plugins here if needed later (e.g. syntax highlighting).
  options: {},
});

export default withMDX(nextConfig);
