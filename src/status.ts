import { execFileSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";

interface Status {
  containerRunning: boolean;
  containerName: string | null;
  logFile: string | null;
  completedIterations: number;
  currentIteration: number | null;
  maxIterations: string | null;
  totalCost: number;
  finished: boolean;
  finishReason: string | null;
  lastError: string | null;
  lastActivity: string | null;
}

function getRunningContainers(): string[] {
  try {
    const out = execFileSync(
      "docker",
      ["ps", "--filter", "name=app-building-", "--format", "{{.Names}}"],
      { encoding: "utf-8", timeout: 5000 },
    ).trim();
    return out ? out.split("\n").filter(Boolean) : [];
  } catch {
    return [];
  }
}

function getIterationLogFiles(logsDir: string): string[] {
  const files: string[] = [];

  for (const dir of [logsDir, join(logsDir, "reviewed")]) {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const f of entries) {
      if (/^iteration-.*\.log$/.test(f)) {
        files.push(join(dir, f));
      }
    }
  }

  return files.sort();
}

function parseIterationLogs(logPaths: string[]): Omit<Status, "containerRunning" | "containerName" | "logFile"> {
  let completedIterations = 0;
  let currentIteration: number | null = null;
  let maxIterations: string | null = null;
  let totalCost = 0;
  let finished = false;
  let finishReason: string | null = null;
  let lastError: string | null = null;
  let lastActivity: string | null = null;

  for (const logPath of logPaths) {
    const content = readFileSync(logPath, "utf-8");
    const lines = content.split("\n");

    for (const rawLine of lines) {
      if (!rawLine.trim()) continue;

      const tsMatch = rawLine.match(/^\[(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\]\s*(.*)/);
      const timestamp = tsMatch ? tsMatch[1] : null;
      const line = tsMatch ? tsMatch[2] : rawLine;

      if (timestamp) lastActivity = timestamp;

      const iterMatch = line.match(/^=== Iteration (\d+) ===/);
      if (iterMatch) {
        currentIteration = parseInt(iterMatch[1], 10);
      }

      if (line.startsWith("Max iterations:")) {
        maxIterations = line.replace("Max iterations:", "").trim();
      }

      if (line.startsWith("Committed iteration")) {
        completedIterations++;
      }

      const costMatch = line.match(/Cost: \$[\d.]+ \(total: \$([\d.]+)\)/);
      if (costMatch) {
        totalCost = parseFloat(costMatch[1]);
      }

      if (line.includes("Agent signaled <DONE/>")) {
        finished = true;
        finishReason = "done";
      } else if (line.startsWith("Reached max iterations")) {
        finished = true;
        finishReason = "max iterations";
      } else if (line.startsWith("Finished after")) {
        finished = true;
        if (!finishReason) finishReason = "finished";
      }

      if (line.startsWith("Error running") || line.startsWith("[claude:err]")) {
        lastError = line;
      }
    }
  }

  return {
    completedIterations,
    currentIteration,
    maxIterations,
    totalCost,
    finished,
    finishReason,
    lastError,
    lastActivity,
  };
}

function formatTimeSince(isoTimestamp: string): string {
  const then = new Date(isoTimestamp).getTime();
  const now = Date.now();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ${Math.floor((diffSec % 3600) / 60)}m ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function main(): void {
  const projectRoot = resolve(__dirname, "..");
  const logsDir = join(projectRoot, "logs");

  console.log(`${BOLD}Container Status${RESET}`);

  // Check running containers
  const running = getRunningContainers();

  // Read logs
  const logFiles = getIterationLogFiles(logsDir);

  let stateLabel: string;
  if (logFiles.length === 0 && running.length === 0) {
    stateLabel = `${DIM}NO LOGS${RESET}`;
    console.log(`\n  ${stateLabel}`);
    console.log(`  ${DIM}No log files found in ${logsDir}/${RESET}`);
    console.log();
    return;
  }

  const parsed = logFiles.length > 0
    ? parseIterationLogs(logFiles)
    : {
        completedIterations: 0,
        currentIteration: null,
        maxIterations: null,
        totalCost: 0,
        finished: false,
        finishReason: null,
        lastError: null,
        lastActivity: null,
      };

  if (parsed.finished && parsed.finishReason === "done") {
    stateLabel = `${BOLD}${GREEN}DONE${RESET}`;
  } else if (parsed.finished) {
    stateLabel = `${YELLOW}STOPPED${RESET} ${DIM}(${parsed.finishReason})${RESET}`;
  } else if (running.length > 0) {
    stateLabel = `${BOLD}${GREEN}RUNNING${RESET}`;
  } else if (logFiles.length > 0) {
    stateLabel = `${RED}NOT RUNNING${RESET}`;
  } else {
    stateLabel = `${DIM}NO LOGS${RESET}`;
  }

  console.log(`\n  ${stateLabel}`);

  if (running.length > 0) {
    console.log(`  ${DIM}Containers:${RESET} ${running.join(", ")}`);
  }

  const iterInfo = parsed.maxIterations
    ? `${parsed.completedIterations}/${parsed.maxIterations} iterations`
    : `${parsed.completedIterations} iterations`;

  console.log(`  ${DIM}Progress:${RESET}  ${iterInfo}`);

  if (parsed.totalCost > 0) {
    console.log(`  ${DIM}Cost:${RESET}      $${parsed.totalCost.toFixed(4)}`);
  }

  if (parsed.lastActivity) {
    console.log(`  ${DIM}Last log:${RESET}  ${formatTimeSince(parsed.lastActivity)}`);
  }

  if (running.length > 0 && parsed.currentIteration != null) {
    console.log(`  ${DIM}Working on:${RESET} iteration ${parsed.currentIteration}`);
  }

  if (parsed.lastError) {
    console.log(`  ${RED}Last error: ${parsed.lastError}${RESET}`);
  }

  if (logFiles.length > 0) {
    console.log(`  ${DIM}Log: ${logFiles[logFiles.length - 1]}${RESET}`);
  }

  console.log();
}

main();
