import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type GlassPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Visual weight of the glass.
   * - "panel": full frosted surface (blur + highlight + shadow) — cards, menus.
   * - "subtle": translucent fill only, no blur — cheap enough for small,
   *   repeated elements like chips.
   */
  variant?: "panel" | "subtle";
  /** Render styles onto the child element instead of a wrapping <div>. */
  asChild?: boolean;
};

/**
 * The frosted-surface primitive. Wraps the `.glass` / `.glass-subtle` CSS
 * tokens (defined in globals.css) so surfaces share one recipe: translucent
 * fill over the ambient field, backdrop blur+saturate, bright top edge, soft
 * lift shadow. Solid-card fallbacks for no-backdrop-filter browsers and
 * `prefers-reduced-transparency` are handled in CSS.
 */
export function GlassPanel({
  variant = "panel",
  asChild = false,
  className,
  ...props
}: GlassPanelProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn(variant === "panel" ? "glass rounded-2xl" : "glass-subtle", className)}
      {...props}
    />
  );
}
