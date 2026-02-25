import { execSync } from "child_process";
import { existsSync } from "fs";

try {
  console.log("Running typecheck...");
  execSync("npx tsc --noEmit", { stdio: "inherit" });
  console.log("Typecheck passed.");
} catch {
  console.error("Typecheck failed.");
  process.exit(1);
}

const hasEslintConfig =
  existsSync("eslint.config.js") ||
  existsSync("eslint.config.mjs") ||
  existsSync("eslint.config.cjs");

if (hasEslintConfig) {
  try {
    console.log("Running lint with autofix...");
    execSync("npx eslint . --fix", { stdio: "inherit" });
    console.log("Lint passed.");
  } catch {
    console.error("Lint failed.");
    process.exit(1);
  }
} else {
  console.log("No eslint config found, skipping lint.");
}

console.log("All checks passed.");
