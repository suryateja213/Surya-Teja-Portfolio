/**
 * Work experience as impact cards — not a chronological résumé dump.
 * Each role carries 3–4 bullets with verifiable numbers; the case studies
 * under /projects tell the deeper stories.
 */

export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  /** One line of context for the role. */
  summary: string;
  /** Impact bullets — lead with the number. */
  highlights: string[];
  stack: string[];
};

export const experience: Experience[] = [
  {
    company: "GE HealthCare",
    role: "Software Engineer II — Platform Engineering",
    period: "Aug 2025 — Present",
    location: "United States",
    summary:
      "Platform services behind mission-critical diagnostic imaging workflows: high-volume device telemetry, real-time ingestion, and downstream clinical integrations.",
    highlights: [
      "Architected Kafka event streaming for device telemetry — 120K+ msgs/sec sustained at sub-100ms p99",
      "Cut end-to-end pipeline latency 38% with an async FastAPI refactor and a Redis caching layer",
      "Instrumented tracing across 6 services with OpenTelemetry + Datadog — 52% faster incident detection",
      "Shipped LangChain summarization in the clinical report pipeline — 20% less radiologist review time",
    ],
    stack: [
      "Python",
      "FastAPI",
      "Kafka",
      "Redis",
      "AWS EKS",
      "Kubernetes",
      "Helm",
      "OpenTelemetry",
      "Datadog",
    ],
  },
  {
    company: "HealthPlix Technologies",
    role: "Full-Stack Software Engineer — EHR Platform",
    period: "Apr 2021 — Dec 2023",
    location: "India",
    summary:
      "Built MedAssist and CareCoordinator, EHR products used by clinicians across partner hospital networks — backend services, React frontends, and FHIR integrations.",
    highlights: [
      "Built prescription + SOAP note modules in Django — 2M+ monthly prescriptions at 99.9% uptime",
      "Took API response times from 420ms to 95ms via PostgreSQL query optimization and index tuning",
      "Migrated a monolithic patient-record service to event-driven RabbitMQ — decoupled 5 consumers",
      "Integrated FHIR R4 across 3 partner hospital networks — 65% less manual data sync",
    ],
    stack: [
      "Python",
      "Django",
      "React",
      "TypeScript",
      "PostgreSQL",
      "RabbitMQ",
      "Redis",
      "ELK",
      "GitHub Actions",
    ],
  },
];
