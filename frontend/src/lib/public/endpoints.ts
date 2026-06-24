/** Public API endpoint accessors, mirroring `src/lib/admin/endpoints.ts`. */

import { publicFetch } from "@/lib/public/api";
import type { ActivityEvent, AskAnswer, Page, SkillGraph } from "@/lib/public/types";

export const skillGraphApi = {
  get: () => publicFetch<SkillGraph>("/v1/skill-graph"),
};

export const askApi = {
  ask: (question: string) =>
    publicFetch<AskAnswer>("/v1/ask", {
      method: "POST",
      body: JSON.stringify({ question }),
      // The backend does a Claude call; allow longer than the default.
      timeoutMs: 20000,
    }),
};

export const eventsApi = {
  recent: (limit = 12) =>
    publicFetch<Page<ActivityEvent>>(`/v1/events/recent?limit=${limit}`, {
      timeoutMs: 6000,
    }),
};
