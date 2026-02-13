import { execFileSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { basename, join } from "path";
import { loadConfig } from "./config";

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";

interface TargetStatus {
  name: string;
  dir: string;
  containerRunning: boolean;
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

function isContainerRunning(dirName: string): boolean {
  try {
    const out = execFileSync(
      "docker",
      ["ps", "--filter", `name=app-building-${dirName}`, "--format", "{{.Names}}"],
      { encoding: "utf-8", timeout: 5000 },
    ).trim();
    return out.includes(`app-building-${dirName}`);
  } catch {
    return false;
  }
}

function getIterationLogFiles(targetDir: string): string[] {
  const logsDir = join(targetDir, "logs");
  let entries: string[];
  try {
    entries = readdirSync(logsDir);
  } catch {
    return [];
  }

  return entries
    .filter((f) => /^iteration-.*\.log$/.test(f))
    .sort()
    .map((f) => join(logsDir, f));
}

function parseIterationLogs(logPaths: string[]): Omit<TargetStatus, "name" | "dir" | "containerRunning" | "logFile"> {
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

function printStatus(status: TargetStatus): void {
  const nameLabel = `${BOLD}${CYAN}${status.name}${RESET}`;

  let stateLabel: string;
  if (status.finished && status.finishReason === "done") {
    stateLabel = `${BOLD}${GREEN}DONE${RESET}`;
  } else if (status.finished) {
    stateLabel = `${YELLOW}STOPPED${RESET} ${DIM}(${status.finishReason})${RESET}`;
  } else if (status.containerRunning) {
    stateLabel = `${BOLD}${GREEN}RUNNING${RESET}`;
  } else if (status.logFile) {
    stateLabel = `${RED}NOT RUNNING${RESET}`;
  } else {
    stateLabel = `${DIM}NO LOGS${RESET}`;
  }

  console.log(`\n${nameLabel}  ${stateLabel}`);

  if (!status.logFile) {
    console.log(`  ${DIM}No log files found in ${status.dir}/logs/${RESET}`);
    return;
  }

  const iterInfo = status.maxIterations
    ? `${status.completedIterations}/${status.maxIterations} iterations`
    : `${status.completedIterations} iterations`;

  console.log(`  ${DIM}Progress:${RESET}  ${iterInfo}`);

  if (status.totalCost > 0) {
    console.log(`  ${DIM}Cost:${RESET}      $${status.totalCost.toFixed(4)}`);
  }

  if (status.lastActivity) {
    console.log(`  ${DIM}Last log:${RESET}  ${formatTimeSince(status.lastActivity)}`);
  }

  if (status.containerRunning && status.currentIteration != null) {
    console.log(`  ${DIM}Working on:${RESET} iteration ${status.currentIteration}`);
  }

  if (status.lastError) {
    console.log(`  ${RED}Last error: ${status.lastError}${RESET}`);
  }

  console.log(`  ${DIM}Log: ${status.logFile}${RESET}`);
}

function main(): void {
  const configPath = process.argv[2];
  if (!configPath) {
    console.error("Usage: npm run status -- <config.json>");
    process.exit(1);
  }

  const config = loadConfig(configPath);

  console.log(`${BOLD}Container Status${RESET}`);

  for (const target of config.targets) {
    const dirName = basename(target.dir);
    const running = isContainerRunning(dirName);
    const logFiles = getIterationLogFiles(target.dir);

    let status: TargetStatus;
    if (logFiles.length > 0) {
      const parsed = parseIterationLogs(logFiles);
      status = {
        name: dirName,
        dir: target.dir,
        containerRunning: running,
        logFile: logFiles[logFiles.length - 1],
        ...parsed,
      };
    } else {
      status = {
        name: dirName,
        dir: target.dir,
        containerRunning: running,
        logFile: null,
        completedIterations: 0,
        currentIteration: null,
        maxIterations: null,
        totalCost: 0,
        finished: false,
        finishReason: null,
        lastError: null,
        lastActivity: null,
      };
    }

    printStatus(status);
  }

  console.log();
}

main();
