"use client";

import * as React from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { SidebarNav } from "./sidebar";
import { Topbar } from "./topbar";

function SidebarBrand() {
  return (
    <Link href="/admin" className="flex h-14 items-center px-6 text-sm font-semibold">
      Surya Teja
      <span className="text-muted ml-1.5 font-normal">/ admin</span>
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="bg-background text-foreground min-h-screen md:grid md:grid-cols-[15rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="border-border bg-background hidden border-r md:flex md:flex-col">
        <SidebarBrand />
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <SidebarNav />
        </div>
      </aside>

      {/* Mobile drawer */}
      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/50 md:hidden" />
          <DialogPrimitive.Content className="border-border bg-background fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r md:hidden">
            <div className="flex items-center justify-between pr-3">
              <SidebarBrand />
              <DialogPrimitive.Close aria-label="Close menu">
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>
            <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
            <div className="flex-1 overflow-y-auto px-3 py-2">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <div className="flex min-h-screen flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
