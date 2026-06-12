import { cn } from "@/lib/utils";

/** Small, neutral pill for skills and tech tags. */
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "glass-subtle text-muted inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}
