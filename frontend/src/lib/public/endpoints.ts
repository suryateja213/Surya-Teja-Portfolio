/** Public API endpoint accessors, mirroring `src/lib/admin/endpoints.ts`. */

import { publicFetch } from "@/lib/public/api";
import type { AskAnswer, SkillGraph } from "@/lib/public/types";

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
