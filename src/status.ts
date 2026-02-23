import { httpGet, type HttpOptions } from "./http-client";
import { getRecentContainers, markStopped, RegistryEntry } from "./container-registry";
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

function formatAge(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function httpOptsFor(entry: RegistryEntry): HttpOptions {
  if (entry.type === "remote" && entry.flyMachineId) {
    return { headers: { "fly-force-instance-id": entry.flyMachineId } };
  }
  return {};
}

async function probeAlive(entry: RegistryEntry): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    if (entry.type === "remote" && entry.flyMachineId) {
      headers["fly-force-instance-id"] = entry.flyMachineId;
    }
    const res = await fetch(`${entry.baseUrl}/status`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function showHttpStatus(baseUrl: string, containerName: string, httpOpts: HttpOptions = {}): Promise<void> {
  const status = await httpGet(`${baseUrl}/status`, httpOpts);

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

  console.log(`\n  ${stateLabel}  ${DIM}(${containerName})${RESET}`);
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

async function tailHttpLogs(baseUrl: string, httpOpts: HttpOptions = {}): Promise<void> {
  const data = await httpGet(`${baseUrl}/logs?offset=0`, httpOpts);
  const lines: string[] = data.items;
  const recent = lines.slice(-20);
  console.log(`\n${BOLD}${CYAN}--- Recent output ---${RESET}`);
  displayFormattedLines(recent);
  let offset = data.nextOffset;

  console.log(`\n${DIM}Tailing logs (Ctrl+C to stop)...${RESET}\n`);

  const poll = setInterval(async () => {
    try {
      const data = await httpGet(`${baseUrl}/logs?offset=${offset}`, httpOpts);
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
      await httpGet(`${baseUrl}/status`, httpOpts);
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

function showStoppedEntries(entries: RegistryEntry[]): void {
  console.log(`\n${DIM}No running containers.${RESET}`);
  if (entries.length === 0) {
    console.log(`${DIM}No container history found.${RESET}`);
    return;
  }
  console.log(`\n${BOLD}Recent containers:${RESET}\n`);
  for (const entry of entries.slice(-10).reverse()) {
    const started = formatAge(entry.startedAt);
    const stopped = entry.stoppedAt ? formatAge(entry.stoppedAt) : "unknown";
    console.log(`  ${DIM}${entry.containerName}${RESET}  ${entry.type}  started ${started}  stopped ${stopped}`);
  }
}

function showAliveList(alive: RegistryEntry[]): void {
  console.log(`\n${BOLD}${alive.length} running containers:${RESET}\n`);
  for (const entry of alive) {
    const started = formatAge(entry.startedAt);
    console.log(`  ${GREEN}●${RESET} ${entry.containerName}  ${DIM}${entry.type}${RESET}  ${entry.baseUrl}  started ${started}`);
  }
  console.log(`\n${DIM}Use: npm run status -- --tail <containerName> to tail a specific container${RESET}`);
}

// --- Main ---

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const tailIdx = args.indexOf("--tail");
  const tailTarget = tailIdx !== -1 ? args[tailIdx + 1] : null;

  const entries = getRecentContainers();

  // If --tail <name>, find that container and tail it
  if (tailTarget) {
    const entry = entries.find((e) => e.containerName === tailTarget);
    if (!entry) {
      console.error(`${RED}Container "${tailTarget}" not found in registry.${RESET}`);
      process.exit(1);
    }
    const opts = httpOptsFor(entry);
    try {
      await showHttpStatus(entry.baseUrl, entry.containerName, opts);
    } catch {
      console.error(`${RED}Cannot reach container "${tailTarget}" at ${entry.baseUrl} — may be stopped.${RESET}`);
      process.exit(1);
    }
    await tailHttpLogs(entry.baseUrl, opts);
    return;
  }

  // Probe all entries without stoppedAt to find alive containers
  const candidates = entries.filter((e) => !e.stoppedAt);
  const aliveResults = await Promise.all(
    candidates.map(async (entry) => ({
      entry,
      alive: await probeAlive(entry),
    })),
  );

  // Mark dead entries as stopped so they don't get probed again
  for (const r of aliveResults) {
    if (!r.alive) markStopped(r.entry.containerName);
  }

  const alive = aliveResults.filter((r) => r.alive).map((r) => r.entry);

  if (alive.length === 0) {
    showStoppedEntries(entries);
  } else if (alive.length === 1) {
    // Single alive container — show status and tail logs (original behavior)
    const opts = httpOptsFor(alive[0]);
    try {
      await showHttpStatus(alive[0].baseUrl, alive[0].containerName, opts);
    } catch {
      console.error(`${RED}Cannot reach agent at ${alive[0].baseUrl} — container may be stopped.${RESET}`);
      process.exit(1);
    }
    await tailHttpLogs(alive[0].baseUrl, opts);
  } else {
    // Multiple alive — list them, no tailing
    showAliveList(alive);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
