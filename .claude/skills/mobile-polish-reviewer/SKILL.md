---
name: mobile-polish-reviewer
description: Review and fix responsive/mobile behavior of a component or page at real breakpoints. Use after building a section to catch layout breakage before shipping.
---

# Mobile polish review

Check responsive integrity at 375px, 768px, 1280px. Mobile-first mindset.

Checklist:
- No horizontal overflow / no content clipped at 375px.
- Tap targets ≥ 44px; adequate spacing between them.
- Readable line length (~45–75 chars) and font sizes on mobile.
- Stacking order makes sense when columns collapse.
- Images scale correctly (`next/image` with proper `sizes`); no layout shift.
- Sticky/fixed elements (nav, CTAs) don't cover content or break on small screens.
- Touch-friendly menus; hover-only interactions have a tap/focus equivalent.
- Spacing rhythm holds across breakpoints (no cramped or huge gaps).

Output: prioritized issues with file:line and the Tailwind/responsive fix. Verify the fix doesn't regress desktop or dark mode.
