import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          // Never retry auth failures; retry transient errors a couple times.
          if (error instanceof ApiError && error.status === 401) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
}
