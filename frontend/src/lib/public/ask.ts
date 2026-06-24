"use client";

import { useCallback, useState } from "react";
import { askApi } from "@/lib/public/endpoints";
import { PublicApiError } from "@/lib/public/api";
import { askSchema } from "@/lib/public/ask-schema";
import type { AskAnswer } from "@/lib/public/types";

export type AskState =
  | { status: "idle" }
  | { status: "loading"; question: string }
  | { status: "answered"; question: string; answer: AskAnswer }
  | { status: "error"; question: string; message: string };

/**
 * One-shot "ask my resume" hook, modeled on `submitContact` — a small custom
 * hook over `publicFetch`, not react-query (this is a single mutation; the
 * public bundle stays react-query-free). Every failure resolves to a graceful
 * `error` state with on-brand copy; it never throws into the UI, so the section
 * is shippable before the backend exists.
 */
export function useAsk() {
  const [state, setState] = useState<AskState>({ status: "idle" });

  const ask = useCallback(async (raw: string) => {
    const parsed = askSchema.safeParse({ question: raw });
    if (!parsed.success) {
      setState({
        status: "error",
        question: raw,
        message: parsed.error.issues[0]?.message ?? "Please rephrase your question.",
      });
      return;
    }
    const question = parsed.data.question;
    setState({ status: "loading", question });

    try {
      const answer = await askApi.ask(question);
      setState({ status: "answered", question, answer });
    } catch (err) {
      setState({ status: "error", question, message: messageFor(err) });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, ask, reset };
}

/** Map an error to recruiter-facing copy — never a stack trace. */
function messageFor(err: unknown): string {
  if (err instanceof PublicApiError) {
    if (err.kind === "unconfigured") {
      return "The assistant isn't connected here yet — reach Surya directly below.";
    }
    if (err.status === 429) {
      return "The assistant has hit its daily limit. Try again tomorrow, or reach Surya directly below.";
    }
    if (err.status === 503) {
      return "The assistant is offline right now — reach Surya directly below.";
    }
  }
  return "I couldn't answer that live — reach Surya directly below.";
}
