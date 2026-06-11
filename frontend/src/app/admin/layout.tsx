"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/admin/query-client";
import { AdminAuthProvider } from "@/components/admin/auth/admin-auth-provider";
import { RequireAuth } from "@/components/admin/auth/require-auth";
import { AdminShell } from "@/components/admin/shell/admin-shell";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(makeQueryClient);
  const pathname = usePathname();
  // trailingSlash:true means pathname can be "/admin/login/" — normalize it.
  const isLogin = pathname.replace(/\/$/, "") === "/admin/login";

  return (
    <QueryClientProvider client={queryClient}>
      {/* Keep the admin area out of search indexes. */}
      <meta name="robots" content="noindex, nofollow" />
      <AdminAuthProvider>
        {isLogin ? (
          children
        ) : (
          <RequireAuth>
            <AdminShell>{children}</AdminShell>
          </RequireAuth>
        )}
      </AdminAuthProvider>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
