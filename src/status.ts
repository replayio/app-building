import { readAgentState } from "./container";
import { httpGet } from "./http-client";
import { formatLogLine, RESET, DIM, BOLD, CYAN, GREEN, YELLOW, RED } from "./format";

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

async function showHttpStatus(baseUrl: string): Promise<void> {
  const status = await httpGet(`${baseUrl}/status`);

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
}

async function tailHttpLogs(baseUrl: string): Promise<void> {
  const data = await httpGet(`${baseUrl}/logs?offset=0`);
  const lines: string[] = data.items;
  const recent = lines.slice(-20);
  console.log(`\n${BOLD}${CYAN}--- Recent output ---${RESET}`);
  displayFormattedLines(recent);
  let offset = data.nextOffset;

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
    } catch (e) {
      clearInterval(poll);
      clearInterval(healthCheck);
      console.error(`\n${RED}Connection lost: ${e instanceof Error ? e.message : e}${RESET}\n`);
      process.exit(1);
    }
  }, 500);

  const healthCheck = setInterval(async () => {
    try {
      await httpGet(`${baseUrl}/status`);
    } catch {
      clearInterval(poll);
      clearInterval(healthCheck);
      console.log(`\n${DIM}Container stopped.${RESET}\n`);
      process.exit(0);
    }
  }, 3000);

  process.on("SIGINT", () => {
    clearInterval(poll);
    clearInterval(healthCheck);
    process.exit(0);
  });
}

// --- Main ---

async function main(): Promise<void> {
  const agentState = readAgentState();

  if (!agentState) {
    console.error(`${RED}No active agent found (no .agent-state.json).${RESET}`);
    process.exit(1);
  }

  await showHttpStatus(agentState.baseUrl);
  await tailHttpLogs(agentState.baseUrl);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
