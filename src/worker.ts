import { spawn, execFileSync } from "child_process";
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import { createLogFile, archiveCurrentLog } from "./log";

const REPO_ROOT = "/repo";
const LOGS_DIR = resolve(REPO_ROOT, "logs");
const JOBS_FILE = resolve(REPO_ROOT, "jobs/jobs.json");
const MAX_ITERATIONS = process.env.MAX_ITERATIONS ? parseInt(process.env.MAX_ITERATIONS) : null;
const MAX_GROUP_RETRIES = 3;
const DEBUG = !!process.env.DEBUG;
const DEBUG_LOG = resolve(LOGS_DIR, "worker-debug.log");

function debug(msg: string): void {
  if (!DEBUG) return;
  mkdirSync(LOGS_DIR, { recursive: true });
  appendFileSync(DEBUG_LOG, `[${new Date().toISOString()}] ${msg}\n`);
}

// --- Types ---

interface Group {
  strategy: string;
  jobs: string[];
  timestamp: string;
}

interface JobsFile {
  groups: Group[];
}

// --- Git helpers ---

function getGitRevision(): string {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf-8",
      timeout: 10000,
    }).trim();
  } catch {
    return "(unknown)";
  }
}

function gitCommit(label: string, log: (msg: string) => void): void {
  try {
    execFileSync("git", ["add", "-A"], { encoding: "utf-8", timeout: 30000 });
    execFileSync("git", ["commit", "-m", label, "--allow-empty"], {
      encoding: "utf-8",
      timeout: 30000,
    });
  } catch (e: any) {
    log(`Warning: git commit failed: ${e.message}`);
  }
}

// --- Claude invocation ---

interface ClaudeResult {
  result: string;
  cost_usd?: number;
  duration_ms?: number;
  num_turns?: number;
  doneSignaled: boolean;
}

function hasDoneSignal(source: string, text: string): boolean {
  const match = /<DONE[\s/>]/.test(text);
  debug(`hasDoneSignal(${source}): match=${match} text=${JSON.stringify(text.slice(0, 200))}`);
  return match;
}

function runClaude(claudeArgs: string[], log: (msg: string) => void): Promise<ClaudeResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", claudeArgs, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let resultEvent: ClaudeResult | null = null;
    let doneSignaled = false;
    let buffer = "";

    child.stdout!.on("data", (data: Buffer) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        log(line);
        try {
          const event = JSON.parse(line);
          debug(`event type=${event.type} subtype=${event.subtype ?? ""}`);
          if (event.type === "result") {
            debug(`result event: result=${JSON.stringify((event.result ?? "").slice(0, 500))}`);
            resultEvent = {
              result: event.result ?? "",
              cost_usd: event.total_cost_usd,
              duration_ms: event.duration_ms,
              num_turns: event.num_turns,
              doneSignaled: false,
            };
            if (hasDoneSignal("result", event.result ?? "")) doneSignaled = true;
          }
          // Check assistant message content blocks for <DONE>
          if (event.type === "assistant" && event.message?.content) {
            for (const block of event.message.content) {
              if (block.type === "text") {
                if (hasDoneSignal("assistant-text", block.text ?? "")) doneSignaled = true;
              }
            }
          }
          // Check content_block_delta for streamed text
          if (event.type === "content_block_delta" && event.delta?.text) {
            if (hasDoneSignal("content-delta", event.delta.text)) doneSignaled = true;
          }
        } catch {}
      }
    });

    child.stderr!.on("data", (data: Buffer) => {
      for (const line of data.toString().split("\n")) {
        if (line.trim()) log(`[claude:err] ${line}`);
      }
    });

    child.on("error", reject);

    child.on("close", (code) => {
      debug(`claude process closed with code=${code}`);
      if (buffer.trim()) {
        debug(`final buffer: ${buffer.slice(0, 300)}`);
        log(buffer);
        try {
          const event = JSON.parse(buffer);
          if (event.type === "result") {
            debug(`result event (final buffer): result=${JSON.stringify((event.result ?? "").slice(0, 500))}`);
            resultEvent = {
              result: event.result ?? "",
              cost_usd: event.total_cost_usd,
              duration_ms: event.duration_ms,
              num_turns: event.num_turns,
              doneSignaled: false,
            };
            if (hasDoneSignal("result-final", event.result ?? "")) doneSignaled = true;
          }
        } catch {}
      }
      debug(`runClaude finished: doneSignaled=${doneSignaled} hasResultEvent=${!!resultEvent}`);
      if (code !== 0 && !resultEvent) {
        reject(new Error(`claude exited with code ${code}`));
        return;
      }
      const result = resultEvent ?? { result: "", doneSignaled: false };
      result.doneSignaled = doneSignaled;
      resolve(result);
    });
  });
}

// --- Arg parsing ---

const incomingArgs = process.argv.slice(2);

function parseArgs(args: string[]): { prompt: string; baseArgs: string[] } {
  const baseArgs: string[] = [];
  let prompt = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-p" && i + 1 < args.length) {
      prompt = args[i + 1];
      i++;
    } else {
      baseArgs.push(args[i]);
    }
  }
  return { prompt, baseArgs };
}

const { prompt: initialPrompt, baseArgs } = parseArgs(incomingArgs);

function buildClaudeArgs(prompt: string): string[] {
  const args: string[] = [];
  args.push("-p", prompt);
  args.push(...baseArgs);
  args.push("--output-format", "stream-json", "--verbose");
  return args;
}

// --- Job system ---

function readJobsFile(): JobsFile {
  if (!existsSync(JOBS_FILE)) return { groups: [] };
  const content = readFileSync(JOBS_FILE, "utf-8").trim();
  if (!content) return { groups: [] };
  return JSON.parse(content);
}

function writeJobsFile(data: JobsFile): void {
  mkdirSync(resolve(REPO_ROOT, "jobs"), { recursive: true });
  writeFileSync(JOBS_FILE, JSON.stringify(data, null, 2) + "\n");
}

function groupsMatch(a: Group, b: Group): boolean {
  return a.strategy === b.strategy && a.timestamp === b.timestamp &&
    a.jobs.length === b.jobs.length && a.jobs.every((j, i) => j === b.jobs[i]);
}

function completeGroup(assignedGroup: Group, log: (msg: string) => void): void {
  const data = readJobsFile();
  const idx = data.groups.findIndex((g) => groupsMatch(g, assignedGroup));
  if (idx === -1) {
    debug(`completeGroup: assigned group not found in jobs.json (strategy=${assignedGroup.strategy})`);
    log(`Warning: assigned group not found in jobs.json, may have already been removed`);
    return;
  }
  const [completed] = data.groups.splice(idx, 1);
  writeJobsFile(data);
  debug(`completeGroup: removed group at index ${idx} (strategy=${completed.strategy})`);
  log(`Dequeued group: ${completed.jobs.length} job(s) (strategy: ${completed.strategy})`);
}

function buildGroupPrompt(group: Group): string {
  const jobList = group.jobs.map((j, i) => `${i + 1}. ${j}`).join("\n");
  return (
    `Read strategy file: ${group.strategy}\n` +
    `\n` +
    `Jobs to complete:\n${jobList}\n` +
    `\n` +
    `Work through each job following the strategy. When you have completed ALL jobs,\n` +
    `output <DONE> to signal completion.\n` +
    `\n` +
    `When you need to add new job groups, use:\n` +
    `- Add to front (default): npx tsx /repo/scripts/add-group.ts --strategy "<path>" --job "desc1" --job "desc2"\n` +
    `- Add to end: npx tsx /repo/scripts/add-group.ts --strategy "<path>" --job "desc1" --job "desc2" --trailing`
  );
}

// --- Main loop ---

async function runLoop(): Promise<void> {
  const containerName = process.env.CONTAINER_NAME ?? "(unknown)";
  let iteration = 0;
  let totalCost = 0;
  let consecutiveRetries = 0;

  while (true) {
    iteration++;

    if (MAX_ITERATIONS !== null && iteration > MAX_ITERATIONS) {
      break;
    }

    const log = createLogFile(LOGS_DIR);

    log(`Container: ${containerName}`);
    log(`Max iterations: ${MAX_ITERATIONS ?? "unlimited"}`);
    log(`=== Iteration ${iteration} ===`);
    log(`Initial revision: ${getGitRevision()}`);

    // First iteration uses the provided prompt; subsequent iterations consume job groups
    let prompt: string;
    let assignedGroup: Group | null = null;

    if (iteration === 1 && initialPrompt) {
      prompt = initialPrompt;
      log(`Running initial prompt`);
      debug(`iteration ${iteration}: using initial prompt`);
    } else {
      // Read next group from jobs.json
      const data = readJobsFile();
      debug(`iteration ${iteration}: jobs.json has ${data.groups.length} group(s)`);
      if (data.groups.length > 0) {
        debug(`iteration ${iteration}: first group strategy=${data.groups[0].strategy} jobs=${JSON.stringify(data.groups[0].jobs)}`);
      }
      if (data.groups.length === 0) {
        log("No groups remaining. Exiting.");
        debug(`iteration ${iteration}: no groups, exiting`);
        archiveCurrentLog(LOGS_DIR);
        break;
      }

      // Snapshot the group we're assigning so we can remove it by identity later
      // (Claude may prepend new groups to the queue during its run via add-group)
      assignedGroup = { ...data.groups[0], jobs: [...data.groups[0].jobs] };
      prompt = buildGroupPrompt(assignedGroup);
      log(`Running group: ${assignedGroup.jobs.length} job(s) (strategy: ${assignedGroup.strategy})`);
      for (const job of assignedGroup.jobs) {
        log(`  - ${job}`);
      }
    }

    // Run Claude
    const claudeArgs = buildClaudeArgs(prompt);
    log(`Running Claude...`);
    const startTime = Date.now();

    let response: ClaudeResult;
    try {
      response = await runClaude(claudeArgs, log);
    } catch (e: any) {
      log(`Error running claude: ${e.message}`);
      gitCommit("Agent error recovery", log);
      archiveCurrentLog(LOGS_DIR);
      continue;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`Completed in ${elapsed}s`);
    if (response.cost_usd != null) {
      totalCost += response.cost_usd;
      log(`Cost: $${response.cost_usd.toFixed(4)} (total: $${totalCost.toFixed(4)})`);
    }
    if (response.num_turns != null) {
      log(`Turns: ${response.num_turns}`);
    }

    // Check for <DONE> signal (scanned across all streamed output, not just the result summary)
    const done = response.doneSignaled;
    debug(`iteration ${iteration}: done=${done} assignedGroup=${!!assignedGroup} result.length=${response.result.length}`);
    debug(`iteration ${iteration}: response.result first 500 chars: ${JSON.stringify(response.result.slice(0, 500))}`);

    if (assignedGroup) {
      if (done) {
        log(`Group signaled <DONE>. Completing group.`);
        debug(`iteration ${iteration}: completing group`);
        completeGroup(assignedGroup, log);
        consecutiveRetries = 0;
      } else {
        consecutiveRetries++;
        if (consecutiveRetries >= MAX_GROUP_RETRIES) {
          log(`Group failed ${MAX_GROUP_RETRIES} times. Skipping.`);
          debug(`iteration ${iteration}: max retries reached, skipping group`);
          completeGroup(assignedGroup, log);
          consecutiveRetries = 0;
        } else {
          log(`Group did NOT signal <DONE>. Retry ${consecutiveRetries}/${MAX_GROUP_RETRIES}.`);
          debug(`iteration ${iteration}: no DONE, retry ${consecutiveRetries}/${MAX_GROUP_RETRIES}`);
        }
      }
    }

    // Commit and archive
    gitCommit(`Agent iteration ${iteration}`, log);
    log(`Final revision: ${getGitRevision()}`);
    archiveCurrentLog(LOGS_DIR);
  }
}

runLoop().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
