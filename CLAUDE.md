# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio website for job hunting. The audience is **recruiters, hiring managers, engineering managers, and startup founders** — people who skim. The site must communicate competence in seconds.

**This is NOT a resume.** Lead with **skills, featured projects, technical strengths, and problem-solving ability**. Sections, in priority order:

> **Do not add, ever (unless the user explicitly reverses this):**
> - A résumé/CV **download or PDF**. The user tailors their résumé per job description, so a static file would always be stale. The site is the evergreen version; the résumé travels with each application.

> **Experience section — allowed in one format only** (user reversed the original
> ban in June 2026): **impact cards**, not a chronological timeline. Each role is a
> glass card with company, role, period, a one-line summary, 3–4 bullets that lead
> with verifiable numbers, and a stack row. Content lives in
> `src/content/experience.ts`. No "responsibilities included…" prose, no month-by-month
> job-history dump.

1. Hero — name, one-line positioning, primary CTA, terminal identity card (right column, lg+)
2. Featured projects — case studies that show depth, not screenshots-and-links
3. Skills / technical strengths — grouped, scannable, honest
4. Experience — impact cards (see format rule above)
5. Education — compact and factual (`src/content/education.ts`)
6. About / personal brand — short, human, specific
7. Contact — frictionless

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

## Design system (locked — June 2026)

The visual language is **Apple-style fluid glass**: a fixed, slowly drifting ambient
field of soft color blooms (`body::before` in `globals.css`) refracted through frosted
surfaces. Everything below is settled; extend it, don't reinvent it.

- **Glass surfaces**: `glass` (full frosted panel: blur + saturate, inset top highlight,
  lift shadow) and `glass-subtle` (translucent fill only, for small repeated chips).
  Both are Tailwind v4 **`@utility`** classes — keep them that way so single-property
  utilities (`hover:border-accent/40`) can override them. React wrapper:
  `<GlassPanel variant="panel|subtle">` in `src/components/ui/glass-panel.tsx`;
  `Card` consumes it.
- **Radius scale** (only these stops): `rounded-md` controls · `rounded-2xl` glass
  panels · `rounded-full` pills (nav, avatar).
- **Typography**: Space Grotesk (`font-display`) for the hero name and section
  headings; Geist Sans for text; Geist Mono for eyebrows, status lines, the terminal
  card. Section headings use a mono uppercase accent eyebrow via `SectionHeading`'s
  `eyebrow` prop.
- **Hero is role-agnostic**: the user targets *all* SDE tracks (backend / full-stack /
  frontend). Never pin a single role; disciplines render as a hairline-separated line.
  No pill-shaped wrappers around content (status lines, labels) — flat typographic
  treatment. Floating glass nav pills are the approved exception.
- **Proof over adjectives**: verifiable production numbers live in the Experience
  impact cards (the user removed the hero metrics strip — don't reintroduce it).
- **Section rhythm**: sections alternate `tone="default"` / `tone="tinted"` down the
  page (Section's `tone` prop, a translucent `bg-card/40` band) so each reads as its
  own layer over the ambient field.
- **Nav active state**: a single accent-tinted glass chip slides between links via
  Framer Motion `layoutId` as the active section changes (scroll-spy).
- **Glass performance rules** (these caused real jank when violated):
  - Never animate `transform` on an element that has `backdrop-filter` — it forces a
    re-blur every frame. Hover states on glass animate `border-color`/`color` only.
    (Transforming *children* of a glass element is fine.)
  - No `background-attachment: fixed` on animated layers — repaints every scroll frame.
  - Small repeated elements (badges) use `glass-subtle` — never per-chip blur.
  - Fallbacks exist for no-`backdrop-filter` browsers and
    `prefers-reduced-transparency` (both map glass → solid `--card`); keep them working.

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
