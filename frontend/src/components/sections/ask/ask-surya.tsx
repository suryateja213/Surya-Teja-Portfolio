"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { useAsk } from "@/lib/public/ask";
import { useTrack } from "@/lib/analytics/use-track";
import { suggestedQuestions } from "@/content/ask";
import { AskAnswerCard } from "@/components/sections/ask/ask-answer";

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

/**
 * Ask Surya AI — a single-turn "ask my resume" panel (deliberately NOT a
 * floating chatbot bubble, which CLAUDE.md bans). RAG runs on the backend; this
 * only POSTs to /v1/ask via `useAsk` and renders the answer + citations. Every
 * failure path degrades to a quiet "reach Surya directly" message, so the
 * section is useful even before the backend is live.
 */
export function AskSurya() {
  const { state, ask } = useAsk();
  const track = useTrack();
  const [value, setValue] = useState("");

  const loading = state.status === "loading";

  function submit(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    track({
      name: "ai.asked",
      props: { questionLength: q.length, suggested: suggestedQuestions.includes(question) },
    });
    void ask(q);
  }

  return (
    <Section id="ask" tone="default">
      <SectionHeading
        eyebrow="Ask AI"
        title="Ask Surya AI"
        lead="Ask about Surya's experience, projects, or stack — answered from his background, with sources."
      />

      <GlassPanel className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="ask-input" className="sr-only">
            Ask a question about Surya
          </label>
          <input
            id="ask-input"
            name="question"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={loading}
            placeholder="e.g. Has Surya worked with distributed systems?"
            className={inputClass}
            autoComplete="off"
            maxLength={500}
          />
          <Button type="submit" disabled={loading} className="shrink-0">
            <Sparkles className="h-4 w-4" aria-hidden />
            {loading ? "Thinking…" : "Ask"}
          </Button>
        </form>

        {/* Suggested questions double as the empty state. */}
        {state.status === "idle" ? (
          <div className="mt-4">
            <p className="text-muted font-mono text-[0.65rem] tracking-[0.18em] uppercase">
              Try asking
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => {
                      setValue(q);
                      submit(q);
                    }}
                    className="glass-subtle text-muted hover:text-foreground hover:border-accent/40 rounded-full border border-transparent px-3 py-1 text-xs transition-colors"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </GlassPanel>

      {/* Async answers + errors are announced to assistive tech. */}
      <div aria-live="polite" aria-atomic="false">
        {loading ? (
          <GlassPanel className="text-muted mt-6 p-6 text-sm">
            <span className="inline-flex items-center gap-2">
              Thinking
              <span className="animate-pulse motion-reduce:animate-none" aria-hidden>
                …
              </span>
            </span>
          </GlassPanel>
        ) : null}

        {state.status === "answered" ? <AskAnswerCard answer={state.answer} /> : null}

        {state.status === "error" ? (
          <GlassPanel className="mt-6 p-6 text-sm" role="alert">
            <p className="text-foreground">{state.message}</p>
            <a
              href="#contact"
              className="text-accent mt-2 inline-block underline-offset-2 hover:underline"
            >
              Go to contact
            </a>
          </GlassPanel>
        ) : null}
      </div>
    </Section>
  );
}
