import { contactSchema, type ContactInput } from "@/lib/contact-schema";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level errors keyed by field name. */
  errors?: Record<string, string>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/**
 * Submit the contact form to the FastAPI backend.
 *
 * The site is a static export, so there is no server action — this runs in the
 * browser and POSTs to `${NEXT_PUBLIC_API_BASE_URL}/v1/contact`. We validate
 * client-side first (fast feedback); the backend re-validates and is the source
 * of truth for delivery. The honeypot is dropped silently on the client too.
 */
export async function submitContact(input: ContactInput): Promise<ContactState> {
  const parsed = contactSchema.safeParse(input);

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

  if (!API_BASE_URL) {
    return {
      status: "error",
      message: "Contact is not configured yet. Please email me directly.",
    };
  }

  const { name, email, message } = parsed.data;

  try {
    const res = await fetch(`${API_BASE_URL}/v1/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    if (!res.ok) {
      return {
        status: "error",
        message: "Something went wrong sending your message. Try email directly.",
      };
    }

    return { status: "success", message: "Thanks — I'll be in touch." };
  } catch {
    return {
      status: "error",
      message: "Something went wrong sending your message. Try email directly.",
    };
  }
}
