import { execFileSync } from "child_process";
import { readFileSync, readdirSync, existsSync, statSync, openSync, readSync, closeSync } from "fs";
import { join, resolve } from "path";
import { formatLogLine, RESET, DIM, BOLD, CYAN, GREEN, YELLOW, RED } from "./format";

// --- Log discovery ---

function getLogFile(logsDir: string): string | null {
  // Check for active worker log first
  const workerCurrent = join(logsDir, "worker-current.log");
  if (existsSync(workerCurrent) && statSync(workerCurrent).size > 0) {
    return workerCurrent;
  }

  // Fall back to most recent completed log (worker-* or legacy iteration-*)
  const files: string[] = [];
  for (const dir of [logsDir, join(logsDir, "reviewed")]) {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const f of entries) {
      if (/^(worker|iteration)-.*\.log$/.test(f) && !f.endsWith("-current.log")) {
        files.push(join(dir, f));
      }
    }
  }

  files.sort();
  return files.length > 0 ? files[files.length - 1] : null;
}

// --- Log parsing ---

interface LogInfo {
  containerName: string | null;
  currentIteration: number | null;
  maxIterations: string | null;
  completedIterations: number;
  totalCost: number;
  finished: boolean;
  finishReason: string | null;
  lastError: string | null;
  lastActivity: string | null;
}

function parseLogFile(logPath: string): LogInfo {
  const content = readFileSync(logPath, "utf-8");
  const lines = content.split("\n");

  const info: LogInfo = {
    containerName: null,
    currentIteration: null,
    maxIterations: null,
    completedIterations: 0,
    totalCost: 0,
    finished: false,
    finishReason: null,
    lastError: null,
    lastActivity: null,
  };

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;

    const tsMatch = rawLine.match(/^\[(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\]\s*(.*)/);
    const timestamp = tsMatch ? tsMatch[1] : null;
    const line = tsMatch ? tsMatch[2] : rawLine;

    if (timestamp) info.lastActivity = timestamp;

    if (line.startsWith("Container:")) {
      info.containerName = line.replace("Container:", "").trim();
    }

    const iterMatch = line.match(/^=== Iteration (\d+) ===/);
    if (iterMatch) {
      info.currentIteration = parseInt(iterMatch[1], 10);
    }

    if (line.startsWith("Max iterations:")) {
      info.maxIterations = line.replace("Max iterations:", "").trim();
    }

    if (line.startsWith("Committed iteration")) {
      info.completedIterations++;
    }

    const costMatch = line.match(/Cost: \$[\d.]+ \(total: \$([\d.]+)\)/);
    if (costMatch) {
      info.totalCost = parseFloat(costMatch[1]);
    }

    if (line.includes("Agent signaled <DONE/>")) {
      info.finished = true;
      info.finishReason = "done";
    } else if (line.startsWith("Reached max iterations")) {
      info.finished = true;
      info.finishReason = "max iterations";
    } else if (line.startsWith("Finished after")) {
      info.finished = true;
      if (!info.finishReason) info.finishReason = "finished";
    }

    if (line.startsWith("Error running") || line.startsWith("[claude:err]")) {
      info.lastError = line;
    }
  }

  return info;
}

// --- Container check ---

function isContainerRunning(containerName: string): boolean {
  try {
    const out = execFileSync(
      "docker",
      ["ps", "--filter", `name=^${containerName}$`, "--format", "{{.Names}}"],
      { encoding: "utf-8", timeout: 5000 },
    ).trim();
    return out === containerName;
  } catch {
    return false;
  }
}

// --- Display helpers ---

function formatTimeSince(isoTimestamp: string): string {
  const then = new Date(isoTimestamp).getTime();
  const now = Date.now();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ${Math.floor((diffSec % 3600) / 60)}m ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function stripTimestamp(rawLine: string): string {
  const tsMatch = rawLine.match(/^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\]\s*(.*)/);
  return tsMatch ? tsMatch[1] : rawLine;
}

function getLastNLines(logPath: string, n: number): string[] {
  const content = readFileSync(logPath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());
  return lines.slice(-n);
}

function displayFormattedLines(rawLines: string[]): void {
  for (const rawLine of rawLines) {
    const line = stripTimestamp(rawLine);
    const formatted = formatLogLine(line);
    if (formatted) console.log(formatted);
  }
}

// --- Tailing ---

function tailLog(logPath: string): void {
  let offset = existsSync(logPath) ? statSync(logPath).size : 0;
  let partial = "";

  const poll = setInterval(() => {
    let size: number;
    try {
      size = statSync(logPath).size;
    } catch {
      return;
    }

    if (size <= offset) return;

    const fd = openSync(logPath, "r");
    const buf = Buffer.alloc(size - offset);
    readSync(fd, buf, 0, buf.length, offset);
    closeSync(fd);
    offset = size;

    const chunk = partial + buf.toString();
    const lines = chunk.split("\n");
    partial = lines.pop() ?? "";

    for (const rawLine of lines) {
      if (!rawLine.trim()) continue;
      const line = stripTimestamp(rawLine);
      const formatted = formatLogLine(line);
      if (formatted) console.log(formatted);
    }
  }, 500);

  // Also check if container is still running; stop tailing when it exits
  const containerCheck = setInterval(() => {
    // Re-read the log to check if it signals completion
    try {
      const content = readFileSync(logPath, "utf-8");
      if (
        content.includes("Agent signaled <DONE/>") ||
        content.includes("Reached max iterations") ||
        content.includes("Finished after")
      ) {
        // Flush remaining
        if (partial.trim()) {
          const line = stripTimestamp(partial);
          const formatted = formatLogLine(line);
          if (formatted) console.log(formatted);
        }
        clearInterval(poll);
        clearInterval(containerCheck);

        // The log file may have been renamed (worker-current.log -> worker-*.log),
        // which means the run completed.
      }
    } catch {
      // File may have been renamed
      clearInterval(poll);
      clearInterval(containerCheck);
    }
  }, 3000);

  process.on("SIGINT", () => {
    clearInterval(poll);
    clearInterval(containerCheck);
    process.exit(0);
  });
}

// --- Main ---

function main(): void {
  const projectRoot = resolve(__dirname, "..");
  const logsDir = join(projectRoot, "logs");

  const logFile = getLogFile(logsDir);

  if (!logFile) {
    console.log(`${DIM}No log files found in ${logsDir}/${RESET}`);
    return;
  }

  const info = parseLogFile(logFile);
  const running = info.containerName ? isContainerRunning(info.containerName) : false;

  // --- Status header ---
  let stateLabel: string;
  if (info.finished && info.finishReason === "done") {
    stateLabel = `${BOLD}${GREEN}DONE${RESET}`;
  } else if (info.finished) {
    stateLabel = `${YELLOW}STOPPED${RESET} ${DIM}(${info.finishReason})${RESET}`;
  } else if (running) {
    stateLabel = `${BOLD}${GREEN}RUNNING${RESET}`;
  } else {
    stateLabel = `${RED}NOT RUNNING${RESET}`;
  }

  console.log(`\n  ${stateLabel}`);

  if (info.containerName) {
    console.log(`  ${DIM}Container:${RESET} ${info.containerName}`);
  }

  const iterInfo = info.maxIterations
    ? `${info.completedIterations}/${info.maxIterations} iterations`
    : `${info.completedIterations} iterations`;
  console.log(`  ${DIM}Progress:${RESET}  ${iterInfo}`);

  if (info.totalCost > 0) {
    console.log(`  ${DIM}Cost:${RESET}      $${info.totalCost.toFixed(4)}`);
  }

  if (info.lastActivity) {
    console.log(`  ${DIM}Last log:${RESET}  ${formatTimeSince(info.lastActivity)}`);
  }

  if (running && info.currentIteration != null) {
    console.log(`  ${DIM}Working on:${RESET} iteration ${info.currentIteration}`);
  }

  if (info.lastError) {
    console.log(`  ${RED}Last error: ${info.lastError}${RESET}`);
  }

  console.log(`  ${DIM}Log: ${logFile}${RESET}`);

  // --- Last 20 lines ---
  console.log(`\n${BOLD}${CYAN}--- Recent output ---${RESET}`);
  const lastLines = getLastNLines(logFile, 20);
  displayFormattedLines(lastLines);

  // --- Tail if running ---
  if (running) {
    console.log(`\n${DIM}Tailing log (Ctrl+C to stop)...${RESET}\n`);
    tailLog(logFile);
  } else {
    console.log();
  }
}

main();
