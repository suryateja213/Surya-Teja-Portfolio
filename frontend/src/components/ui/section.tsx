import { cn } from "@/lib/utils";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  /** Anchor id for in-page navigation. */
  id?: string;
  /**
   * Background band. Sections alternate default/tinted down the page so each
   * one reads as its own layer over the ambient field.
   */
  tone?: "default" | "tinted";
};

/** Consistent vertical rhythm and max-width container for page sections. */
export function Section({ id, tone = "default", className, children, ...props }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "border-border/50 scroll-mt-20 border-t py-20 sm:py-28",
        tone === "tinted" && "bg-card/40",
        className,
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-5xl px-6">{children}</div>
    </section>
  );
}

/** Section heading: mono accent eyebrow, display-weight title, optional lead. */
export function SectionHeading({
  title,
  lead,
  eyebrow,
  displayClass,
}: {
  title: string;
  lead?: string;
  eyebrow?: string;
  /**
   * Per-section display face for the title (e.g. "font-display-projects"),
   * may include weight/style tweaks the face needs ("font-normal", "italic").
   * Defaults to the site-wide display face. Heading only — body copy never
   * changes family.
   */
  displayClass?: string;
}) {
  return (
    <div className="mb-12 max-w-2xl">
      {eyebrow ? (
        <p className="text-accent font-mono text-xs font-medium tracking-[0.2em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-display text-3xl font-semibold tracking-tight sm:text-4xl",
          displayClass,
          eyebrow && "mt-3",
        )}
      >
        {title}
      </h2>
      {lead ? <p className="text-muted mt-4 text-lg text-pretty">{lead}</p> : null}
    </div>
  );
}
