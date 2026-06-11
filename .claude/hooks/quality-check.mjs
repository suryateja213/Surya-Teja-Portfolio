#!/usr/bin/env node
// Stop hook: remind to run typecheck/lint/build after a work session.
// Non-blocking — prints a short note and exits 0. Skips until package.json exists.

import { existsSync } from "node:fs";

if (!existsSync("package.json")) process.exit(0);

process.stderr.write(
  "\n[quality] Before shipping, confirm: npm run typecheck && npm run lint && npm run build — and check light/dark + 375/768/1280.\n"
);
process.exit(0);
