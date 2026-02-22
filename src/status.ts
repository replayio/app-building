import { readAgentState } from "./container";
import { httpGet } from "./http-client";
import { formatLogLine, RESET, DIM, BOLD, CYAN, GREEN, YELLOW, RED } from "./format";

// --- Local log fallback (when container is unreachable) ---

import { readFileSync, readdirSync, existsSync, statSync, openSync, readSync, closeSync } from "fs";
import { join, resolve } from "path";
import { execFileSync } from "child_process";

function getLogFile(logsDir: string): string | null {
  const workerCurrent = join(logsDir, "worker-current.log");
  if (existsSync(workerCurrent) && statSync(workerCurrent).size > 0) {
    return workerCurrent;
  }
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

function stripTimestamp(rawLine: string): string {
  const tsMatch = rawLine.match(/^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\]\s*(.*)/);
  return tsMatch ? tsMatch[1] : rawLine;
}

function displayFormattedLines(rawLines: string[]): void {
  for (const rawLine of rawLines) {
    const line = stripTimestamp(rawLine);
    const formatted = formatLogLine(line);
    if (formatted) console.log(formatted);
  }
}

// --- HTTP-based status ---

async function showHttpStatus(baseUrl: string): Promise<boolean> {
  try {
    const status = await httpGet(`${baseUrl}/status`);

    // State label
    let stateLabel: string;
    if (status.state === "processing") {
      stateLabel = `${BOLD}${GREEN}PROCESSING${RESET}`;
    } else if (status.state === "idle") {
      stateLabel = `${BOLD}${GREEN}IDLE${RESET}`;
    } else if (status.state === "starting") {
      stateLabel = `${BOLD}${YELLOW}STARTING${RESET}`;
    } else if (status.state === "stopping") {
      stateLabel = `${YELLOW}STOPPING${RESET}`;
    } else {
      stateLabel = `${DIM}${status.state}${RESET}`;
    }

    console.log(`\n  ${stateLabel}`);
    console.log(`  ${DIM}Server:${RESET}    ${baseUrl}`);
    console.log(`  ${DIM}Revision:${RESET}  ${status.revision}`);

    const queueInfo = `${status.queueLength} queued, ${status.pendingGroups} groups pending`;
    console.log(`  ${DIM}Queue:${RESET}     ${queueInfo}`);
    console.log(`  ${DIM}Progress:${RESET}  ${status.groupsProcessed} groups processed, iteration ${status.iteration}`);

    if (status.totalCost > 0) {
      console.log(`  ${DIM}Cost:${RESET}      $${status.totalCost.toFixed(4)}`);
    }

    if (status.detachRequested) {
      console.log(`  ${YELLOW}Detach requested — will exit when work complete${RESET}`);
    }

    return true;
  } catch {
    return false;
  }
}

async function tailHttpLogs(baseUrl: string): Promise<void> {
  let offset = 0;

  // First, get recent logs
  try {
    const data = await httpGet(`${baseUrl}/logs?offset=0`);
    // Show last 20 lines
    const lines: string[] = data.items;
    const recent = lines.slice(-20);
    console.log(`\n${BOLD}${CYAN}--- Recent output ---${RESET}`);
    displayFormattedLines(recent);
    offset = data.nextOffset;
  } catch {
    console.log(`\n${DIM}Could not fetch logs${RESET}`);
    return;
  }

  console.log(`\n${DIM}Tailing logs (Ctrl+C to stop)...${RESET}\n`);

  const poll = setInterval(async () => {
    try {
      const data = await httpGet(`${baseUrl}/logs?offset=${offset}`);
      for (const line of data.items) {
        const stripped = stripTimestamp(line);
        const formatted = formatLogLine(stripped);
        if (formatted) console.log(formatted);
      }
      offset = data.nextOffset;
    } catch {
      clearInterval(poll);
      console.log(`\n${DIM}Connection lost.${RESET}\n`);
    }
  }, 500);

  // Also check if container is still alive
  const healthCheck = setInterval(async () => {
    try {
      await httpGet(`${baseUrl}/status`);
    } catch {
      clearInterval(poll);
      clearInterval(healthCheck);
      console.log(`\n${DIM}Container stopped.${RESET}\n`);
    }
  }, 3000);

  process.on("SIGINT", () => {
    clearInterval(poll);
    clearInterval(healthCheck);
    process.exit(0);
  });
}

// --- Fallback: local log file status (same as before) ---

function showLocalStatus(): void {
  const projectRoot = resolve(__dirname, "..");
  const logsDir = join(projectRoot, "logs");
  const logFile = getLogFile(logsDir);

  if (!logFile) {
    console.log(`${DIM}No log files found in ${logsDir}/${RESET}`);
    return;
  }

  console.log(`\n  ${RED}NOT RUNNING${RESET} ${DIM}(no container endpoint found)${RESET}`);
  console.log(`  ${DIM}Log: ${logFile}${RESET}`);

  const content = readFileSync(logFile, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());
  const lastLines = lines.slice(-20);

  console.log(`\n${BOLD}${CYAN}--- Recent output ---${RESET}`);
  displayFormattedLines(lastLines);
  console.log();
}

// --- Main ---

async function main(): Promise<void> {
  const agentState = readAgentState();

  if (agentState) {
    // Try HTTP-based status
    const ok = await showHttpStatus(agentState.baseUrl);
    if (ok) {
      await tailHttpLogs(agentState.baseUrl);
      return;
    }
    // Container not reachable, fall through to local
    console.log(`${DIM}Container at ${agentState.baseUrl} not reachable${RESET}`);
  }

  showLocalStatus();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
