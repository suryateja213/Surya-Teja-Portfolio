---
name: accessibility-reviewer
description: Audit a component or page for accessibility — semantics, keyboard, focus, contrast, reduced motion, labels. Use before considering UI work done.
---

# Accessibility review

Audit the changed/specified UI and report prioritized findings with file:line.

Checklist:
- **Semantics** — correct elements (`button` vs `div`, `nav`, `main`, `header`, lists); one `h1`; logical heading order.
- **Keyboard** — every interactive element reachable and operable; visible focus ring; no focus traps; logical tab order.
- **Labels** — inputs labeled; icon-only buttons have `aria-label`; images have meaningful `alt` (or `alt=""` if decorative).
- **Contrast** — text and UI meet WCAG AA in BOTH light and dark mode.
- **Motion** — every animation honors `prefers-reduced-motion`.
- **Color** — information not conveyed by color alone.

Output: Blocker / Should-fix / Nice-to-have, each with file:line and a concrete fix. For a full pre-ship audit, use the `qa-reviewer` agent.
