"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import { submitContact, type ContactState } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initialState: ContactState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Sending…" : "Send message"}
      <Send className="h-4 w-4" aria-hidden />
    </Button>
  );
}

const fieldClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="border-accent/40 bg-card text-foreground rounded-md border px-4 py-3 text-sm"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-lg space-y-4" noValidate>
      {/* Honeypot: visually hidden, off the tab order. */}
      <div aria-hidden className="absolute left-[-9999px]">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Name
        </label>
        <input id="name" name="name" type="text" autoComplete="name" className={fieldClass} />
        {state.errors?.name ? (
          <p className="mt-1 text-xs text-red-500">{state.errors.name}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" className={fieldClass} />
        {state.errors?.email ? (
          <p className="mt-1 text-xs text-red-500">{state.errors.email}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea id="message" name="message" rows={5} className={cn(fieldClass, "resize-y")} />
        {state.errors?.message ? (
          <p className="mt-1 text-xs text-red-500">{state.errors.message}</p>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm text-red-500">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
