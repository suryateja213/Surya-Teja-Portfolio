"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import type { AskAnswer } from "@/lib/public/types";

/**
 * The answer card: the generated answer, a mono "Sources" subhead with cited
 * sections as deep-links, and related skill chips that jump into the graph.
 * Purely presentational — the live region lives on the parent so async and
 * (future) streamed answers are announced.
 */
export function AskAnswerCard({ answer }: { answer: AskAnswer }) {
  return (
    <GlassPanel className="mt-6 p-6">
      <p className="text-foreground leading-relaxed text-pretty">{answer.answer}</p>

      {answer.sources.length > 0 ? (
        <div className="mt-5">
          <p className="text-muted font-mono text-[0.65rem] tracking-[0.18em] uppercase">Sources</p>
          <ul className="mt-2 space-y-1.5">
            {answer.sources.map((source) => (
              <li key={source.ref}>
                {source.href ? (
                  <Link
                    href={source.href}
                    className="group text-foreground hover:text-accent inline-flex items-center gap-1 text-sm transition-colors"
                  >
                    {source.title}
                    <ArrowUpRight className="h-3 w-3" aria-hidden />
                  </Link>
                ) : (
                  <span className="text-foreground text-sm">{source.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {answer.relatedSkills.length > 0 ? (
        <div className="mt-5">
          <p className="text-muted font-mono text-[0.65rem] tracking-[0.18em] uppercase">
            Related skills
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {answer.relatedSkills.map((id) => (
              <li key={id}>
                <Link href="#skills">
                  <Badge className="hover:border-accent/40 transition-colors">
                    {labelFromNodeId(id)}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </GlassPanel>
  );
}

/** "skill:apache-kafka" -> "Apache Kafka" for chip display. */
function labelFromNodeId(id: string): string {
  const slug = id.replace(/^skill:/, "");
  return slug
    .split("-")
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}
