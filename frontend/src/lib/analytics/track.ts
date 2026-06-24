/**
 * Recruiter Journey Tracker — fire-and-forget event emit.
 *
 * Design rules (do not relax without reason):
 *  - NON-BLOCKING: uses `navigator.sendBeacon` (off the main render path), with
 *    a `fetch(..., { keepalive: true })` fallback. Never awaited, returns void.
 *  - SILENT: any failure (no API base URL, network down, beacon refused) is a
 *    no-op. The page must never know or break — this powers a later activity
 *    stream, not core UX.
 *  - PRIVACY-FIRST: honors `navigator.doNotTrack`. No PII in payloads (see
 *    `events.ts`). The only identifier is a per-tab random `sessionId` in
 *    `sessionStorage` — not a cookie, not cross-site, gone when the tab closes.
 *    First-party only, no third-party scripts, no fingerprinting → no cookie
 *    banner required.
 */

import type { TrackEnvelope, TrackEvent } from "@/lib/analytics/events";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const SESSION_KEY = "sj_sid";

/** True only in a browser that hasn't asked us not to track. */
function trackingAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (!API_BASE_URL) return false;
  // Respect Do Not Track across the (historically inconsistent) surfaces.
  const dnt = navigator.doNotTrack ?? (window as unknown as { doNotTrack?: string }).doNotTrack;
  if (dnt === "1" || dnt === "yes") return false;
  return true;
}

/** Per-tab anonymous id; created lazily, scoped to sessionStorage. */
function getSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    // `randomUUID` is available in all browsers we target (secure contexts).
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // sessionStorage can throw (privacy mode); degrade to an ephemeral id.
    return "ephemeral";
  }
}

/**
 * Emit a tracked interaction. Fire-and-forget — call it and move on.
 *
 * @example track({ name: "skill.viewed", props: { skillId: "kafka", via: "graph" } })
 */
export function track(event: TrackEvent): void {
  if (!trackingAllowed()) return;

  const envelope: TrackEnvelope = {
    name: event.name,
    props: event.props,
    sessionId: getSessionId(),
    path: window.location.pathname,
    ts: new Date().toISOString(),
  };

  const url = `${API_BASE_URL}/v1/events`;
  const body = JSON.stringify(envelope);

  // Send as text/plain (a CORS-safe content type) so the request is "simple"
  // and never triggers a preflight — `sendBeacon` can't perform one, and a
  // preflight would also defeat keepalive on unload. The backend parses the
  // JSON body explicitly regardless of content type.
  try {
    // Preferred path: purpose-built for analytics, survives page unload.
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "text/plain" });
      if (navigator.sendBeacon(url, blob)) return;
    }
    // Fallback: keepalive lets the request outlive the document.
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
      keepalive: true,
    }).catch(() => {
      /* silent */
    });
  } catch {
    /* silent — tracking must never throw into the UI */
  }
}
