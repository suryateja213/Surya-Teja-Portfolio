"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { setUnauthorizedHandler } from "@/lib/admin/api";
import { useMe } from "@/lib/admin/hooks/use-auth";
import type { MeResponse } from "@/lib/admin/types";

type AuthContextValue = {
  admin: MeResponse | null;
  isLoading: boolean;
};

const AuthContext = React.createContext<AuthContextValue>({ admin: null, isLoading: true });

export function useAdmin() {
  return React.useContext(AuthContext);
}

/**
 * Probes the session via /v1/auth/me. Registers a global 401 handler so any
 * expired-session response anywhere redirects to the login page.
 */
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, isError } = useMe();

  React.useEffect(() => {
    setUnauthorizedHandler(() => {
      // trailingSlash:true → pathname may be "/admin/login/"; normalize.
      if (pathname.replace(/\/$/, "") !== "/admin/login") router.replace("/admin/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [router, pathname]);

  const admin = !isError && data ? data : null;

  return (
    <AuthContext.Provider value={{ admin, isLoading }}>{children}</AuthContext.Provider>
  );
}
