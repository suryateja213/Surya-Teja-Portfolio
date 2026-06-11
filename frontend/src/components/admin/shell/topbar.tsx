"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAdmin } from "@/components/admin/auth/admin-auth-provider";
import { useLogout } from "@/lib/admin/hooks/use-auth";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { admin } = useAdmin();
  const router = useRouter();
  const logout = useLogout();

  async function handleLogout() {
    try {
      await logout.mutateAsync();
    } catch {
      // even if the call fails, drop the client session
    }
    router.replace("/admin/login");
    toast.success("Signed out");
  }

  return (
    <header className="border-border bg-background sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <span className="text-sm font-semibold">Admin</span>

      <div className="ml-auto flex items-center gap-2">
        {admin && <span className="text-muted hidden text-sm sm:inline">{admin.email}</span>}
        <ThemeToggle />
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
}
