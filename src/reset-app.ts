import { execFileSync } from "child_process";
import { existsSync, readdirSync, rmSync } from "fs";
import { join, resolve } from "path";

const projectRoot = resolve(__dirname, "..");
const appName = process.argv[2];

if (!appName) {
  console.error("Usage: npm run reset-app -- <appName>");
  process.exit(1);
}

const appDir = join(projectRoot, "apps", appName);
if (!existsSync(appDir)) {
  console.error(`App directory does not exist: ${appDir}`);
  process.exit(1);
}

const keep = new Set(["AppSpec.md", "AppStyle.md", ".git"]);

for (const entry of readdirSync(appDir)) {
  if (keep.has(entry)) continue;
  const fullPath = join(appDir, entry);
  rmSync(fullPath, { recursive: true, force: true });
  console.log(`Removed ${entry}`);
}

execFileSync("git", ["-C", appDir, "add", "-A"], { stdio: "inherit" });
execFileSync("git", ["-C", appDir, "commit", "-m", "Reset app"], { stdio: "inherit" });
console.log(`Reset ${appName}`);
