import { cn } from "@/lib/utils";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  /** Anchor id for in-page navigation. */
  id?: string;
};

/** Consistent vertical rhythm and max-width container for page sections. */
export function Section({ id, className, children, ...props }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("border-border scroll-mt-20 border-t py-20 sm:py-28", className)}
      {...props}
    >
      <div className="mx-auto w-full max-w-5xl px-6">{children}</div>
    </section>
  );
}

/** Section heading with an optional short lead. */
export function SectionHeading({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="mb-12 max-w-2xl">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {lead ? <p className="text-muted mt-3">{lead}</p> : null}
    </div>
  );
}
