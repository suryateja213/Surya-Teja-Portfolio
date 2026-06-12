"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();
  const isHome = pathname === "/";
  const active = useActiveSection(isHome ? sectionIds : []);

  // On the home page, anchors are in-page; elsewhere they jump to home + anchor.
  const linkHref = (href: string) => (isHome ? href : `/${href}`);
  const isActive = (href: string) => isHome && active === href.replace("#", "");

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 px-4 sm:top-6">
      <nav
        aria-label="Primary"
        className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3"
      >
        {/* Wordmark — avatar + name, no container. Clickable, returns home. */}
        <Link
          href="/"
          aria-label={`${site.name} — home`}
          className="text-foreground/80 hover:text-foreground focus-visible:ring-accent focus-visible:ring-offset-background group pointer-events-auto inline-flex items-center gap-2.5 rounded-full text-sm font-medium tracking-tight transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Image
            src="/avatar.svg"
            alt=""
            width={32}
            height={32}
            priority
            className="ring-border/50 h-8 w-8 shrink-0 rounded-full ring-1 transition-transform group-hover:scale-105"
          />
          {site.name.split(" ").slice(0, 2).join(" ")}
        </Link>

        {/* Right-aligned navigation pill, Apple-style frosted glass. The
            active chip is a single shared element that slides between links
            (layoutId) as the active section changes. */}
        <div className="glass pointer-events-auto hidden items-center rounded-full p-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={linkHref(item.href)}
              aria-current={isActive(item.href) ? "true" : undefined}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-sm transition-colors",
                isActive(item.href)
                  ? "text-accent font-medium"
                  : "text-muted hover:text-foreground",
              )}
            >
              {isActive(item.href) && (
                <motion.span
                  layoutId="nav-active-chip"
                  className="bg-accent/12 ring-accent/25 absolute inset-0 rounded-full shadow-sm ring-1"
                  transition={
                    reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 34 }
                  }
                  aria-hidden
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
          <div className="bg-border/70 mx-1 h-5 w-px" aria-hidden />
          <ThemeToggle />
        </div>

        {/* Mobile controls — compact pill. */}
        <div className="glass pointer-events-auto flex items-center gap-1 rounded-full p-1 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
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

      {/* Mobile menu — drops below the pill as its own floating card. */}
      <div
        id="mobile-menu"
        className={cn(
          "glass pointer-events-auto mx-auto mt-2 max-w-5xl overflow-hidden rounded-2xl md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <ul className="flex flex-col p-2">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={linkHref(item.href)}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "true" : undefined}
                className={cn(
                  "hover:bg-card hover:text-foreground block rounded-xl px-4 py-3 text-sm transition-colors",
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
