import { ChildProcess, spawn } from "child_process";
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import type { Logger } from "./log";

const REPO_ROOT = "/repo";
const LOGS_DIR = resolve(REPO_ROOT, "logs");
const JOBS_FILE = resolve(REPO_ROOT, "jobs/jobs.json");
const MAX_GROUP_RETRIES = 3;
const DEBUG = !!process.env.DEBUG;
const DEBUG_LOG = resolve(LOGS_DIR, "worker-debug.log");

function debug(msg: string): void {
  if (!DEBUG) return;
  mkdirSync(LOGS_DIR, { recursive: true });
  appendFileSync(DEBUG_LOG, `[${new Date().toISOString()}] ${msg}\n`);
}

// --- Types ---

export interface Group {
  strategy: string;
  jobs: string[];
  timestamp: string;
}

interface JobsFile {
  groups: Group[];
}

// --- Claude invocation ---

export interface ClaudeResult {
  result: string;
  cost_usd?: number;
  duration_ms?: number;
  num_turns?: number;
  doneSignaled: boolean;
}

export type EventCallback = (line: string) => void;

/** Reference to the currently running Claude child process, if any. */
export let currentClaudeProcess: ChildProcess | null = null;

function hasDoneSignal(source: string, text: string): boolean {
  const match = /<DONE[\s/>]/.test(text);
  debug(`hasDoneSignal(${source}): match=${match} text=${JSON.stringify(text.slice(0, 200))}`);
  return match;
}

function buildClaudeArgs(prompt: string, extraArgs: string[]): string[] {
  const args: string[] = [];
  args.push("-p", prompt);
  args.push(...extraArgs);
  args.push("--output-format", "stream-json", "--verbose");
  return args;
}

function runClaude(
  claudeArgs: string[],
  log: Logger,
  onEvent?: EventCallback,
): Promise<ClaudeResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", claudeArgs, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    currentClaudeProcess = child;

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
        onEvent?.(line);
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
          if (event.type === "assistant" && event.message?.content) {
            for (const block of event.message.content) {
              if (block.type === "text") {
                if (hasDoneSignal("assistant-text", block.text ?? "")) doneSignaled = true;
              }
            }
          }
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

    child.on("error", (err) => {
      currentClaudeProcess = null;
      reject(err);
    });

    child.on("close", (code) => {
      currentClaudeProcess = null;
      debug(`claude process closed with code=${code}`);
      if (buffer.trim()) {
        debug(`final buffer: ${buffer.slice(0, 300)}`);
        log(buffer);
        onEvent?.(buffer);
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

// --- Job system helpers ---

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
  return (
    a.strategy === b.strategy &&
    a.timestamp === b.timestamp &&
    a.jobs.length === b.jobs.length &&
    a.jobs.every((j, i) => j === b.jobs[i])
  );
}

function completeGroup(assignedGroup: Group, log: Logger): void {
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

export function getPendingGroupCount(): number {
  return readJobsFile().groups.length;
}

// --- Exported API ---

/**
 * Run a single prompt through Claude and return the result.
 */
export async function processMessage(
  prompt: string,
  extraArgs: string[],
  log: Logger,
  onEvent?: EventCallback,
): Promise<ClaudeResult> {
  const claudeArgs = buildClaudeArgs(prompt, extraArgs);
  log(`Running Claude...`);
  return runClaude(claudeArgs, log, onEvent);
}

/**
 * Process all pending job groups until the queue is empty.
 * Calls commitFn after each group completes.
 * Returns the number of groups processed.
 */
export async function processJobGroups(
  extraArgs: string[],
  log: Logger,
  onEvent?: EventCallback,
  shouldStop?: () => boolean,
  commitFn?: (label: string) => void,
): Promise<{ groupsProcessed: number; totalCost: number }> {
  let groupsProcessed = 0;
  let totalCost = 0;
  let consecutiveRetries = 0;

  while (true) {
    if (shouldStop?.()) break;

    const data = readJobsFile();
    debug(`processJobGroups: jobs.json has ${data.groups.length} group(s)`);
    if (data.groups.length === 0) {
      log("No groups remaining.");
      break;
    }

    const assignedGroup = { ...data.groups[0], jobs: [...data.groups[0].jobs] };
    const prompt = buildGroupPrompt(assignedGroup);
    log(`Running group: ${assignedGroup.jobs.length} job(s) (strategy: ${assignedGroup.strategy})`);
    for (const job of assignedGroup.jobs) {
      log(`  - ${job}`);
    }

    let response: ClaudeResult;
    try {
      response = await processMessage(prompt, extraArgs, log, onEvent);
    } catch (e: any) {
      log(`Error running claude: ${e.message}`);
      commitFn?.("Agent error recovery");
      continue;
    }

    if (response.cost_usd != null) {
      totalCost += response.cost_usd;
      log(`Cost: $${response.cost_usd.toFixed(4)} (total: $${totalCost.toFixed(4)})`);
    }
    if (response.num_turns != null) {
      log(`Turns: ${response.num_turns}`);
    }

    const done = response.doneSignaled;
    debug(`processJobGroups: done=${done} assignedGroup strategy=${assignedGroup.strategy}`);

    if (done) {
      log(`Group signaled <DONE>. Completing group.`);
      completeGroup(assignedGroup, log);
      consecutiveRetries = 0;
    } else {
      consecutiveRetries++;
      if (consecutiveRetries >= MAX_GROUP_RETRIES) {
        log(`Group failed ${MAX_GROUP_RETRIES} times. Skipping.`);
        completeGroup(assignedGroup, log);
        consecutiveRetries = 0;
      } else {
        log(`Group did NOT signal <DONE>. Retry ${consecutiveRetries}/${MAX_GROUP_RETRIES}.`);
      }
    }

    groupsProcessed++;
    commitFn?.(`Agent iteration (group ${groupsProcessed})`);
  }

  return { groupsProcessed, totalCost };
}
