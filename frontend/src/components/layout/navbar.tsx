"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useActiveSection } from "@/lib/use-active-section";
import { cn } from "@/lib/utils";

const sectionIds = nav.map((item) => item.href.replace("#", ""));

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const active = useActiveSection(isHome ? sectionIds : []);

  // On the home page, anchors are in-page; elsewhere they jump to home + anchor.
  const linkHref = (href: string) => (isHome ? href : `/${href}`);
  const isActive = (href: string) => isHome && active === href.replace("#", "");

  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6"
      >
        <Link href="/" className="font-mono text-sm font-medium tracking-tight">
          {site.name.split(" ")[0].toLowerCase()}
          <span className="text-accent">.</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={linkHref(item.href)}
              aria-current={isActive(item.href) ? "true" : undefined}
              className={cn(
                "hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors",
                isActive(item.href) ? "text-foreground" : "text-muted",
              )}
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn("border-border border-t md:hidden", open ? "block" : "hidden")}
      >
        <ul className="mx-auto flex max-w-5xl flex-col px-4 py-2">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={linkHref(item.href)}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "true" : undefined}
                className={cn(
                  "hover:bg-card hover:text-foreground block rounded-md px-3 py-3 text-sm transition-colors",
                  isActive(item.href) ? "text-foreground" : "text-muted",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
