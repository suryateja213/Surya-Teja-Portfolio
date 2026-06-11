# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio website for job hunting. The audience is **recruiters, hiring managers, engineering managers, and startup founders** — people who skim. The site must communicate competence in seconds.

**This is NOT a resume.** Do not build a chronological experience timeline or dump job history. Lead with **skills, featured projects, technical strengths, and problem-solving ability**. Sections, in priority order:

1. Hero — name, one-line positioning, primary CTA
2. Featured projects — case studies that show depth, not screenshots-and-links
3. Skills / technical strengths — grouped, scannable, honest
4. About / personal brand — short, human, specific
5. Contact — frictionless

Tone: confident, specific, no buzzwords. Every line earns its place.

## Stack

- **Next.js (App Router)** + **TypeScript** (strict)
- **Tailwind CSS** for styling
- **shadcn/ui** for primitives (Radix under the hood — accessible by default)
- **Framer Motion** for motion
- **Lucide** for icons
- Backend stays minimal. Add a route handler or server action only when a feature genuinely needs it (e.g. contact form). Do not introduce a database, auth, or CMS without a concrete reason.

## Non-negotiables

- **Accessibility**: semantic HTML, keyboard-navigable, visible focus states, `alt` text, color contrast ≥ WCAG AA, `prefers-reduced-motion` respected in all Framer Motion.
- **Dark mode**: design every component for both themes from the start, not as a retrofit. Use CSS variables / Tailwind `dark:`.
- **Responsive**: mobile-first. Test layouts at 375px, 768px, 1280px.
- **SEO**: use the App Router `metadata` API, per-route titles/descriptions, Open Graph + Twitter cards, `sitemap.ts`, `robots.ts`, JSON-LD `Person` schema.
- **Performance**: target Lighthouse ≥ 95 across the board. `next/image` for all images, `next/font` for fonts, lazy-load below the fold.

## Design principles

Premium, minimal, product-quality, developer-centric. Think Linear / Vercel / Stripe docs — not a template marketplace theme.

- Restrained palette, generous whitespace, strong typographic hierarchy.
- Motion is purposeful and subtle (entrance fades, micro-interactions) — never decorative noise.
- **Avoid generic AI-portfolio clichés**: gratuitous gradient blobs, glassmorphism everywhere, "Hi, I'm [name] 👋" with a waving emoji, animated particle backgrounds, neon-on-black, fake testimonials.

## Conventions

- Uses the `src/` directory. Path alias `@/*` → `src/*`.
- Components in `src/components/` (`layout/`, `sections/`, `ui/`, `seo/`); route-specific UI co-located under the route. shadcn-style primitives live in `src/components/ui/`.
- Typed content in `src/content/`; shared helpers in `src/lib/`.
- Tailwind v4 (CSS-first config in `globals.css`, no `tailwind.config.ts`). Dark mode is class-based via `next-themes`.
- Server Components by default; add `"use client"` only when you need interactivity, state, or browser APIs. Keep client boundaries low in the tree.
- Tailwind utilities over custom CSS. Share repeated patterns via `cn()` + variants (cva), not copy-paste.
- Content (project case studies, copy) lives as typed data in `content/` (TS or MDX), separate from presentation — so copy can be edited without touching components.
- Prefer composition over props explosion. Keep components small and single-purpose.

## Commands

> Established once the app is scaffolded. Expected:

- `npm run dev` — local dev server
- `npm run build` — production build (must pass before shipping)
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run format` — Prettier

## Definition of done

Before considering any feature complete: `build`, `lint`, and `typecheck` pass; works in light + dark; responsive at the three breakpoints; keyboard-accessible; no console errors.
