import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Allow .mdx alongside .ts/.tsx pages and imports.
  pageExtensions: ["ts", "tsx", "mdx"],
};

const withMDX = createMDX({
  // Add remark/rehype plugins here if needed later (e.g. syntax highlighting).
  options: {},
});

export default withMDX(nextConfig);
