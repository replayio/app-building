import { spawn } from "child_process";
import { existsSync, mkdirSync, renameSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const LOGS_DIR = "/repo/logs";

// Pre-create Claude CLI config to skip onboarding prompts (theme, login).
// The ANTHROPIC_API_KEY env var handles auth; we just need the settings file
// so Claude doesn't trigger the first-run flow.
const claudeDir = join(homedir(), ".claude");
mkdirSync(claudeDir, { recursive: true });
const settingsPath = join(claudeDir, "settings.json");
if (!existsSync(settingsPath)) {
  writeFileSync(settingsPath, JSON.stringify({ theme: "light" }, null, 2));
}

function formatTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function shellQuote(s: string): string {
  return "'" + s.replace(/'/g, "'\\''") + "'";
}

// Rotate existing worker log if present
mkdirSync(LOGS_DIR, { recursive: true });
const currentLog = join(LOGS_DIR, "worker-current.log");
if (existsSync(currentLog)) {
  const timestamp = formatTimestamp(new Date());
  renameSync(currentLog, join(LOGS_DIR, `worker-${timestamp}.log`));
}

// All args after this script are passed to claude
const claudeArgs = process.argv.slice(2);

// Build properly shell-quoted command string
let cmd = "claude";
for (const arg of claudeArgs) {
  cmd += " " + shellQuote(arg);
}

// Use `script` to create a pty for claude (so it detects a real TTY)
// while capturing all output to the log file.
const child = spawn("script", ["-q", "-f", "-c", cmd, currentLog], {
  stdio: "inherit",
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
