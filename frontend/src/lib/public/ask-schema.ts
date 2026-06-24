import { z } from "zod";

/** Mirrors the backend `AskRequest` constraints (3–500 chars). */
export const askSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "Ask a slightly longer question.")
    .max(500, "That question is a bit too long."),
});

export type AskInput = z.infer<typeof askSchema>;
