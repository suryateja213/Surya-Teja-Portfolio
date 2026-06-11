/**
 * Technical strengths, grouped for scanning. Keep groups tight and honest —
 * a recruiter's engineer should be able to read this in a few seconds.
 */

export type SkillGroup = {
  title: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    items: ["Python", "Java", "TypeScript", "SQL", "Bash"],
  },
  {
    title: "Backend & APIs",
    items: ["FastAPI", "Django", "Spring Boot", "Node.js", "REST", "GraphQL"],
  },
  {
    title: "Distributed Systems",
    items: ["Apache Kafka", "RabbitMQ", "Redis", "Celery", "Event-driven design"],
  },
  {
    title: "Observability",
    items: ["OpenTelemetry", "Datadog APM", "Prometheus", "Grafana", "ELK Stack"],
  },
  {
    title: "Cloud & DevOps",
    items: ["AWS (EKS, EC2, S3, RDS)", "Docker", "Kubernetes", "Helm", "GitHub Actions"],
  },
  {
    title: "Data",
    items: ["PostgreSQL", "MySQL", "MongoDB", "Elasticsearch"],
  },
];
