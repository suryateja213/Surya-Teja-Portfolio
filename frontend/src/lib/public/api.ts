/**
 * Public API client for the static site.
 *
 * Mirrors the *structure* of the admin client (`src/lib/admin/api.ts`) but
 * deliberately drops the cookie/401 machinery: these calls are unauthenticated,
 * and — because the site is a static export served independently of the API —
 * they must degrade gracefully when the backend is unconfigured or down. The
 * site never throws a raw network error into the UI; callers convert a thrown
 * `PublicApiError` into an on-brand fallback state (see `useSkillGraph`,
 * `useAsk`).
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/** Default per-request timeout — the static site must never hang on a dead API. */
const DEFAULT_TIMEOUT_MS = 8000;

export class PublicApiError extends Error {
  constructor(
    message: string,
    /** "unconfigured" when no base URL is set; "network"/"http" otherwise. */
    readonly kind: "unconfigured" | "network" | "http",
    readonly status?: number,
  ) {
    super(message);
    this.name = "PublicApiError";
  }
}

/** True when the API base URL is configured at build time. */
export function isApiConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

type PublicFetchOptions = RequestInit & { timeoutMs?: number };

/**
 * Fetch JSON from the public API. Throws `PublicApiError` on any failure so
 * callers can branch on `.kind` for a graceful UI.
 */
export async function publicFetch<T>(
  path: string,
  options: PublicFetchOptions = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new PublicApiError("API is not configured", "unconfigured");
  }

  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...init } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init.headers },
    });

    if (!res.ok) {
      throw new PublicApiError(`Request failed (${res.status})`, "http", res.status);
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof PublicApiError) throw err;
    // AbortError, TypeError (offline), JSON parse — all surface as "network".
    throw new PublicApiError("Network error", "network");
  } finally {
    clearTimeout(timer);
  }
}
