"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { eventsApi } from "@/lib/public/endpoints";
import type { ActivityEvent } from "@/lib/public/types";

/** How often to poll while the tab is visible and the section is in view. */
const POLL_MS = 5000;

type ActivityState = {
  events: ActivityEvent[];
  /** True once at least one successful fetch returned data. */
  loaded: boolean;
};

/**
 * Visibility-aware short-poll of the recent activity stream. No WebSockets
 * (static-export friendly): polls every few seconds while `active` and the tab
 * is visible, pauses otherwise. Failures are swallowed — the feed just keeps
 * its last data (or stays empty), never surfacing an error to the recruiter.
 */
export function useActivityStream(active: boolean): ActivityState {
  const [state, setState] = useState<ActivityState>({ events: [], loaded: false });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = useCallback(async () => {
    try {
      const page = await eventsApi.recent(12);
      setState({ events: page.items, loaded: true });
    } catch {
      // keep last data; mark loaded so the section can decide to hide gracefully
      setState((s) => ({ ...s, loaded: true }));
    }
  }, []);

  useEffect(() => {
    if (!active) return;

    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        await poll();
      }
      if (!stopped) timer.current = setTimeout(tick, POLL_MS);
    };

    void tick();

    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      stopped = true;
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [active, poll]);

  return state;
}
