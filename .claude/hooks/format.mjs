#!/usr/bin/env node
// PostToolUse hook: format the file Claude just edited with Prettier.
// Silent no-op until Prettier is installed, so it never blocks early scaffolding.
// Reads the hook payload from stdin; only acts on supported source files.
//
// Monorepo note: the Next.js app (and its Prettier install) lives in frontend/.
// We only format files under frontend/ here; backend/ uses its own tooling (ruff).

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { relative, isAbsolute, sep } from "node:path";

const EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|css|md|mdx)$/;
const FRONTEND_DIR = "frontend";

let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  let file;
  try {
    file = JSON.parse(input)?.tool_input?.file_path;
  } catch {
    process.exit(0);
  }
  if (!file || !EXT.test(file) || !existsSync(file)) process.exit(0);

  // Only format files inside frontend/ (where Prettier is installed).
  const rel = isAbsolute(file) ? relative(process.cwd(), file) : file;
  const normalized = rel.split(sep).join("/");
  if (!normalized.startsWith(`${FRONTEND_DIR}/`)) process.exit(0);

  if (
    !existsSync(`${FRONTEND_DIR}/node_modules/.bin/prettier`) &&
    !existsSync(`${FRONTEND_DIR}/node_modules/prettier`)
  ) {
    process.exit(0); // deps not installed yet
  }
  try {
    // Run from frontend/ so Prettier resolves its config and the file path.
    const fileInFrontend = normalized.slice(`${FRONTEND_DIR}/`.length);
    execSync(`npx prettier --write "${fileInFrontend}"`, {
      stdio: "ignore",
      cwd: FRONTEND_DIR,
    });
  } catch {
    // formatting failure should never block the edit
  }
  process.exit(0);
});
