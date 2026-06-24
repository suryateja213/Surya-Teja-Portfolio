"use client";

import { useCallback } from "react";
import { track } from "@/lib/analytics/track";
import type { TrackEvent } from "@/lib/analytics/events";

/**
 * Stable accessor to the fire-and-forget `track()` for use in client
 * components. The returned function has a constant identity, so passing it to
 * `onClick`/effects won't trigger re-renders. `track` already no-ops on the
 * server and when tracking is disallowed, so this is safe to call anywhere.
 */
export function useTrack(): (event: TrackEvent) => void {
  return useCallback((event: TrackEvent) => track(event), []);
}
