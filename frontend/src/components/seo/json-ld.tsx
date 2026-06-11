import { site } from "@/content/site";
import { socials } from "@/content/socials";

/**
 * Person structured data for richer search results.
 * Rendered once on the home page.
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    description: site.description,
    url: site.url,
    email: `mailto:${site.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location,
    },
    sameAs: socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
  };

  return (
    <script
      type="application/ld+json"
      // Data is static and trusted; safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
