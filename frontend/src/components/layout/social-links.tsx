import { socials } from "@/content/socials";
import { cn } from "@/lib/utils";

type SocialLinksProps = {
  /**
   * - "icons": square icon buttons (hero, footer).
   * - "labels": icon + text rows (contact section).
   */
  variant?: "icons" | "labels";
  /** Omit entries by label, e.g. ["Email"] where the address is shown separately. */
  exclude?: string[];
  className?: string;
};

/** The one place social profile links are rendered. Data lives in content/socials.ts. */
export function SocialLinks({ variant = "icons", exclude = [], className }: SocialLinksProps) {
  const items = socials.filter((s) => !exclude.includes(s.label));

  return (
    <ul
      className={cn(
        "flex items-center",
        variant === "icons" ? "gap-1" : "flex-wrap gap-4",
        className,
      )}
    >
      {items.map(({ label, href, icon: Icon }) => {
        const external = href.startsWith("http");
        return (
          <li key={label}>
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              aria-label={variant === "icons" ? label : undefined}
              className={cn(
                "text-muted hover:text-foreground transition-colors",
                variant === "icons"
                  ? "hover:bg-card/60 inline-flex h-10 w-10 items-center justify-center rounded-md"
                  : "inline-flex items-center gap-2 text-sm",
              )}
            >
              <Icon className={variant === "icons" ? "h-5 w-5" : "h-4 w-4"} aria-hidden />
              {variant === "labels" ? label : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
