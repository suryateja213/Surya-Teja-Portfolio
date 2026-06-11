"use server";

import { contactSchema } from "@/lib/contact-schema";
import { site } from "@/content/site";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level errors keyed by field name. */
  errors?: Record<string, string>;
};

/**
 * Contact form server action.
 *
 * - Validates with the shared Zod schema and a honeypot field.
 * - If RESEND_API_KEY is set, sends an email via Resend (dynamically imported,
 *   so Resend isn't a build dependency for local work).
 * - Otherwise logs the submission server-side — useful in local development.
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    company: formData.get("company"), // honeypot
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return { status: "error", message: "Please fix the errors below.", errors };
  }

  // Honeypot tripped — pretend success, drop silently.
  if (parsed.data.company) {
    return { status: "success", message: "Thanks — I'll be in touch." };
  }

  const { name, email, message } = parsed.data;

  try {
    if (process.env.RESEND_API_KEY) {
      // `resend` is an optional dependency, not installed for local dev. Run
      // `npm i resend` before deploying with a real key — then remove this
      // directive (the import will resolve and the error will be gone).
      // @ts-expect-error optional dependency, not installed for local dev
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `Portfolio <onboarding@resend.dev>`,
        to: site.email,
        replyTo: email,
        subject: `Portfolio contact from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      });
    } else {
      // Local development: no key configured, so just log it.
      console.log("[contact] new submission (no RESEND_API_KEY set):", {
        name,
        email,
        message,
      });
    }

    return { status: "success", message: "Thanks — I'll be in touch." };
  } catch (err) {
    console.error("[contact] send failed:", err);
    return {
      status: "error",
      message: "Something went wrong sending your message. Try email directly.",
    };
  }
}
