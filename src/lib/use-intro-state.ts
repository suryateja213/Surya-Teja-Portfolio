"use client";

import { useSyncExternalStore } from "react";

const SESSION_KEY = "intro-played";

export type IntroState = "pending" | "play" | "skip";

// No-op subscribe: the decision is computed once and is stable thereafter.
const subscribe = () => () => {};

// Cache the decision for this page load so the snapshot is pure and stable
// (useSyncExternalStore may call it multiple times and requires consistency).
let decision: IntroState | null = null;

function getClientSnapshot(): IntroState {
  if (decision) return decision;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === "1";

  if (prefersReduced || alreadyPlayed) {
    decision = "skip";
  } else {
    sessionStorage.setItem(SESSION_KEY, "1");
    decision = "play";
  }
  return decision;
}

/**
 * Decides whether the hero intro animation should play.
 *
 * - "pending": server render + first client paint (server snapshot). The hero
 *   renders invisibly here to avoid a flash of the final state.
 * - "play":    first visit this session and motion is allowed — run the sequence.
 * - "skip":    returning this session, or prefers-reduced-motion — render the
 *   final state immediately, no animation.
 *
 * Using useSyncExternalStore keeps the server/client snapshots separate, so the
 * sessionStorage/matchMedia read never causes a hydration mismatch.
 */
export function useIntroState(): IntroState {
  return useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    () => "pending", // server snapshot
  );
}
