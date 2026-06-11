import { z } from "zod";

/** Shared contact-form schema. Used by the client form and the server action. */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email"),
  message: z.string().trim().min(10, "Tell me a bit more (10+ characters)").max(2000),
  /** Honeypot: real users leave this empty; bots fill it. */
  company: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
