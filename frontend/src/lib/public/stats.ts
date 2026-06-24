"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { statsApi } from "@/lib/public/endpoints";
import type { PublicStats } from "@/lib/public/types";

/** Stats change slowly; poll less often than the activity feed. */
const POLL_MS = 10000;

type StatsState = {
  stats: PublicStats | null;
  loaded: boolean;
};

/**
 * Visibility-aware poll of the public observability stats. Same graceful,
 * static-export-friendly pattern as the activity stream: polls while `active`
 * and the tab is visible, swallows failures (keeps last data), never surfaces
 * an error to the recruiter.
 */
export function useStats(active: boolean): StatsState {
  const [state, setState] = useState<StatsState>({ stats: null, loaded: false });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = useCallback(async () => {
    try {
      const stats = await statsApi.get();
      setState({ stats, loaded: true });
    } catch {
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
