"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAdmin } from "./admin-auth-provider";

/**
 * Cosmetic client-side guard. The backend cookie check is the real gate; this
 * just avoids flashing protected UI and bounces unauthenticated users to login.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAdmin();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !admin) router.replace("/admin/login");
  }, [isLoading, admin, router]);

  if (isLoading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted h-6 w-6 animate-spin" aria-label="Loading" />
      </div>
    );
  }

  return <>{children}</>;
}
