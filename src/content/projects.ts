/**
 * Featured projects. Each entry is a self-contained case study source.
 *
 * The home page renders the summary fields (card view). The optional `caseStudy`
 * block is scaffolding for future `/projects/[slug]` detail pages — it is NOT
 * rendered yet, so leaving it undefined is fine.
 *
 * Rules for good entries: show problem → approach → impact. Prefer real numbers.
 * Replace placeholder links and confirm any metric before publishing.
 */

export type Project = {
  slug: string;
  title: string;
  /** One line: what it is and why it's interesting. */
  summary: string;
  /** 3–6 tags, most important first. */
  stack: string[];
  /** Optional outward links. Omit what you don't have. */
  links?: {
    repo?: string;
    demo?: string;
  };
  /** Surface on the home grid. */
  featured: boolean;
  /** Optional long-form content for a future detail page. Not rendered yet. */
  caseStudy?: {
    problem: string;
    approach: string;
    outcome: string;
  };
};

export const projects: Project[] = [
  {
    slug: "telemetry-streaming-pipeline",
    title: "Device Telemetry Streaming Pipeline",
    summary:
      "An event-driven pipeline that ingests high-volume device telemetry and fans it out to downstream consumers without coupling them to the producer.",
    stack: ["Python", "Apache Kafka", "Redis", "Kubernetes"],
    links: { repo: "https://github.com/your-handle/telemetry-pipeline" },
    featured: true,
    caseStudy: {
      problem:
        "Downstream services shared state through a single bottleneck, so one slow consumer stalled the rest and made backpressure impossible to reason about.",
      approach:
        "Moved to a Kafka-based event log with independent consumer groups, added a Redis caching layer for hot reads, and tuned async I/O to keep tail latency flat under burst load.",
      outcome:
        "Sustained 120K+ messages/sec at sub-100ms p99, and new consumers could be added without touching the producer.",
    },
  },
  {
    slug: "service-observability-layer",
    title: "Service Observability Layer",
    summary:
      "A shared tracing and metrics layer across a fleet of platform services, built so on-call engineers can find the failing hop in minutes, not hours.",
    stack: ["OpenTelemetry", "Datadog APM", "Grafana", "Python"],
    links: { repo: "https://github.com/your-handle/observability-layer" },
    featured: true,
    caseStudy: {
      problem:
        "Incidents were slow to diagnose because traces stopped at service boundaries and alerts were too noisy to trust.",
      approach:
        "Instrumented distributed tracing end to end with OpenTelemetry, standardized span conventions, and replaced threshold alerts with SLI/SLO-based signals surfaced in Grafana.",
      outcome:
        "Cut mean time to detect on production incidents by ~52% and reduced alert noise by ~40%.",
    },
  },
  {
    slug: "ehr-prescription-service",
    title: "EHR Prescription Service",
    summary:
      "A high-uptime prescription and clinical-note service for an EHR platform, with a REST layer tuned for fast mobile clients and strict data-access controls.",
    stack: ["Django", "PostgreSQL", "FHIR R4", "REST"],
    links: { repo: "https://github.com/your-handle/ehr-prescription-service" },
    featured: true,
    caseStudy: {
      problem:
        "A monolithic patient-record service coupled five downstream consumers and slow queries pushed API responses well past acceptable mobile latency.",
      approach:
        "Decoupled consumers behind a message queue, tuned PostgreSQL indexes and queries, and adopted FHIR R4 to make patient data interoperable across partner systems.",
      outcome:
        "Brought average API response from ~420ms to ~95ms and processed 2M+ monthly prescriptions at a 99.9% uptime SLA.",
    },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
