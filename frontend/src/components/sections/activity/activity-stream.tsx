"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/section";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useActivityStream } from "@/lib/public/activity";
import { labelForEvent, relativeTime } from "@/lib/public/activity-labels";

// Below this many recent events, the section stays hidden entirely — a recruiter
// never sees a sparse/dead feed. The stream is a "look under the hood" moment,
// shown only when there's a real heartbeat to show.
const MIN_EVENTS = 5;

/**
 * Live Activity Stream — a tasteful glass feed of real, PII-free portfolio
 * events polled from `/v1/events/recent`. Renders ONLY when there's enough
 * recent activity; otherwise it's invisible (an always-present sentinel keeps
 * polling so it can appear once activity picks up). No WebSockets — short-poll,
 * paused when the tab is hidden.
 */
export function ActivityStream() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const reduce = useReducedMotion();
  const { events, loaded } = useActivityStream(active);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || active) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setActive(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  const show = loaded && events.length >= MIN_EVENTS;

  // Always render the sentinel so polling can start; only render the visible
  // section once the activity threshold is met.
  return (
    <div ref={sentinelRef} aria-hidden={!show}>
      {show ? (
        <Section id="activity" tone="tinted">
          <SectionHeading
            eyebrow="Under the hood"
            title="Live activity"
            lead="This site runs its own event pipeline. These are real, anonymous interactions flowing through it right now."
          />
          <GlassPanel className="p-2 sm:p-3">
            <ul className="divide-border/60 divide-y" aria-live="polite">
              {events.map((event, i) => (
                <motion.li
                  key={event.id}
                  initial={reduce ? false : { opacity: 0, y: -6 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex items-center justify-between gap-4 px-3 py-2.5"
                >
                  <span className="flex items-center gap-2.5 text-sm">
                    {/* The one allowed chroma: a status dot, dim after the first row. */}
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        i === 0 ? "bg-success" : "bg-muted/50"
                      }`}
                      aria-hidden
                    />
                    <span className="text-foreground">{labelForEvent(event)}</span>
                  </span>
                  <time
                    dateTime={event.created_at}
                    className="text-muted shrink-0 font-mono text-xs"
                  >
                    {relativeTime(event.created_at)}
                  </time>
                </motion.li>
              ))}
            </ul>
          </GlassPanel>
        </Section>
      ) : null}
    </div>
  );
}
