import { execSync } from "child_process";

function run(command: string, label: string): void {
  console.log(`\n=== ${label} ===\n`);
  try {
    execSync(command, { stdio: "inherit" });
  } catch {
    console.error(`\n${label} failed.`);
    process.exit(1);
  }
}

run("npx tsc --noEmit", "Typecheck");
run("npx eslint . --fix", "Lint");

console.log("\nAll checks passed.");
