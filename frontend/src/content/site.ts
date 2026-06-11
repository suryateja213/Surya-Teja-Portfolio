/**
 * Single source of truth for site-wide identity, navigation, and SEO defaults.
 * Edit values here; components read from this object.
 */

export const site = {
  name: "Surya Teja Kommuguri",
  // Short, recruiter-facing positioning. One line, no buzzwords.
  role: "Backend Software Engineer",
  tagline:
    "I build distributed, event-driven backends that stay fast and observable under real load.",
  // Used in <title> templates and structured data.
  url: "https://suryakommuguri.com",
  location: "Tempe, AZ",
  email: "surya.t@techsmail.com",
  // Longer description for meta tags (~150–160 chars).
  description:
    "Backend engineer focused on distributed systems, event-driven architecture, and observability. Building reliable, high-throughput services in Python and Java.",
} as const;

export const nav = [
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;
