/**
 * Single source of truth for site-wide identity, navigation, and SEO defaults.
 * Edit values here; components read from this object.
 */

export const site = {
  name: "Surya Teja Kommuguri",
  // Short, recruiter-facing positioning. One line, no buzzwords.
  // Kept broad for SEO/structured data; the hero shows disciplines instead.
  role: "Software Engineer",
  // Shown as a live "open to work" status line in the hero.
  availability: "Open to Software Engineer roles",
  // Shown under the name, hairline-separated. Role-agnostic on purpose —
  // open to all SDE tracks. Order signals strength.
  disciplines: ["Backend", "Full-Stack", "Frontend", "SDE"] as string[],
  tagline:
    "Software Engineer at GE HealthCare. I build distributed, event-driven backends for healthcare platforms — where latency, reliability, and compliance all matter at once.",
  // Used in <title> templates and structured data.
  url: "https://kommugurisuryateja.com",
  location: "Tempe, AZ",
  email: "surya.t@techsmail.com",
  // Longer description for meta tags (~150–160 chars).
  description:
    "Backend engineer focused on distributed systems, event-driven architecture, and observability. Building reliable, high-throughput services in Python and Java.",
} as const;

export const nav = [
  { label: "Ask AI", href: "#ask" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Education", href: "#education" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;
