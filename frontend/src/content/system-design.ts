/**
 * System-design diagrams — how THIS site actually works.
 *
 * These describe real systems built into the portfolio (the Ask Surya AI RAG
 * flow and the serverless-native event pipeline), so they double as honest
 * proof of architecture thinking. The shape is a simple left-to-right pipeline
 * of nodes with labelled edges; the `FlowDiagram` component lays it out as SVG
 * and the same data drives the accessible step-by-step description.
 */

export type FlowNodeKind = "client" | "compute" | "store" | "external" | "output";

export type FlowNode = {
  id: string;
  /** Short label shown in the box. */
  label: string;
  /** One-line role, shown under the label / in the accessible list. */
  detail: string;
  kind: FlowNodeKind;
};

export type FlowEdge = {
  from: string;
  to: string;
  /** Optional label on the arrow (e.g. "stream", "sendBeacon"). */
  label?: string;
};

export type SystemDiagram = {
  id: string;
  title: string;
  summary: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  /** The senior signal — why it's built this way. */
  why: string;
};

export const systemDiagrams: SystemDiagram[] = [
  {
    id: "ask-rag",
    title: "Ask Surya AI — retrieval-augmented answers",
    summary:
      "A recruiter's question is answered from my real background, with citations — not a generic chatbot.",
    nodes: [
      {
        id: "browser",
        label: "Browser",
        detail: "Recruiter asks a question",
        kind: "client",
      },
      {
        id: "api",
        label: "FastAPI / Lambda",
        detail: "POST /v1/ask — validates, rate-limits",
        kind: "compute",
      },
      {
        id: "retriever",
        label: "BM25 retriever",
        detail: "Top chunks from a build-time index",
        kind: "store",
      },
      {
        id: "claude",
        label: "Claude Haiku",
        detail: "Grounded answer from retrieved context",
        kind: "external",
      },
      {
        id: "answer",
        label: "Answer + sources",
        detail: "Cited sections, related skills",
        kind: "output",
      },
    ],
    edges: [
      { from: "browser", to: "api", label: "question" },
      { from: "api", to: "retriever", label: "retrieve" },
      { from: "retriever", to: "claude", label: "context" },
      { from: "claude", to: "answer", label: "generate" },
      { from: "answer", to: "browser", label: "render" },
    ],
    why: "Retrieval keeps answers grounded in real facts and citable; a build-time index (no vector DB) and one Haiku call keep it cheap, and a DynamoDB daily counter hard-caps spend.",
  },
  {
    id: "event-pipeline",
    title: "Event pipeline — serverless-native, event-driven",
    summary:
      "Every interaction flows through a real event pipeline that powers the live activity feed and the metrics dashboard.",
    nodes: [
      {
        id: "client",
        label: "Browser",
        detail: "sendBeacon, fire-and-forget",
        kind: "client",
      },
      {
        id: "ingest",
        label: "POST /v1/events",
        detail: "FastAPI / Lambda ingest",
        kind: "compute",
      },
      {
        id: "table",
        label: "DynamoDB",
        detail: "EVENT item, TTL-expiring",
        kind: "store",
      },
      {
        id: "stream",
        label: "DynamoDB Stream",
        detail: "Filtered to EVENT inserts",
        kind: "compute",
      },
      {
        id: "worker",
        label: "Worker Lambda",
        detail: "Aggregates daily METRIC counters",
        kind: "compute",
      },
      {
        id: "surface",
        label: "Feed + dashboard",
        detail: "Live activity & system health",
        kind: "output",
      },
    ],
    edges: [
      { from: "client", to: "ingest", label: "beacon" },
      { from: "ingest", to: "table", label: "put" },
      { from: "table", to: "stream", label: "change" },
      { from: "stream", to: "worker", label: "trigger" },
      { from: "worker", to: "surface", label: "metrics" },
      { from: "table", to: "surface", label: "recent" },
    ],
    why: "DynamoDB Streams + a worker Lambda give the same event-driven decoupling as Kafka — independent producer and consumer, retry, ordering — but serverless and ~$0 at idle, the right tool at portfolio scale.",
  },
];
