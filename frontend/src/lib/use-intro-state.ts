"use client";

import { useSyncExternalStore } from "react";

const SESSION_KEY = "intro-played";

export type IntroState = "pending" | "play" | "skip";
export type HeroNameFx = "pending" | "particles" | "plain";

// No-op subscribe: the decision is computed once and is stable thereafter.
const subscribe = () => () => {};

// Cache the decision for this page load so the snapshot is pure and stable
// (useSyncExternalStore may call it multiple times and requires consistency).
let decision: IntroState | null = null;
let nameFx: HeroNameFx | null = null;

// Both decisions live in one place because ordering matters: the first read
// writes SESSION_KEY, so a second independent reader would see "already
// played" on the very first visit.
function decide(): void {
  if (decision) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === "1";

  if (prefersReduced || alreadyPlayed) {
    decision = "skip";
  } else {
    sessionStorage.setItem(SESSION_KEY, "1");
    decision = "play";
  }

  // Particle name assembly is a first-visit, sm+ effect; mobile keeps the
  // word-by-word reveal (multi-line glyph sampling isn't worth it at 375px).
  nameFx =
    decision === "play" && window.matchMedia("(min-width: 640px)").matches
      ? "particles"
      : "plain";
}

function getClientSnapshot(): IntroState {
  decide();
  return decision as IntroState;
}

function getNameFxSnapshot(): HeroNameFx {
  decide();
  return nameFx as HeroNameFx;
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

/**
 * Decides how the hero name enters, locked for the page load (a resize after
 * the decision is handled by the effect itself, which fast-forwards to text).
 *
 * - "pending":   server render — keep the name invisible.
 * - "particles": first visit on sm+ — particles assemble, then cross-fade to
 *   the real h1.
 * - "plain":     mobile, reduced motion, or a repeat visit — the regular
 *   word-reveal (or instant text on skip).
 */
export function useHeroNameFx(): HeroNameFx {
  return useSyncExternalStore(
    subscribe,
    getNameFxSnapshot,
    () => "pending", // server snapshot
  );
}
