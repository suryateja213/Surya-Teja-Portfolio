#!/usr/bin/env node
// PostToolUse hook: format the file Claude just edited with Prettier.
// Silent no-op until Prettier is installed, so it never blocks early scaffolding.
// Reads the hook payload from stdin; only acts on supported source files.

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|css|md|mdx)$/;

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
  if (!existsSync("node_modules/.bin/prettier") && !existsSync("node_modules/prettier")) {
    process.exit(0); // deps not installed yet
  }
  try {
    execSync(`npx prettier --write "${file}"`, { stdio: "ignore" });
  } catch {
    // formatting failure should never block the edit
  }
  process.exit(0);
});
