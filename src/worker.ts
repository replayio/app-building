import { spawn } from "child_process";
import { existsSync, mkdirSync, renameSync, createWriteStream } from "fs";
import { join } from "path";

const LOGS_DIR = "/repo/logs";

function formatTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
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

const logStream = createWriteStream(currentLog);

const child = spawn("claude", claudeArgs, {
  stdio: ["inherit", "pipe", "pipe"],
});

child.stdout!.on("data", (data: Buffer) => {
  process.stdout.write(data);
  logStream.write(data);
});

child.stderr!.on("data", (data: Buffer) => {
  process.stderr.write(data);
  logStream.write(data);
});

child.on("close", (code) => {
  logStream.end();
  process.exit(code ?? 0);
});

child.on("error", (err) => {
  console.error("Failed to start claude:", err);
  logStream.end();
  process.exit(1);
});
