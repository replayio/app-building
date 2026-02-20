import { spawn, execFileSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "fs";
import { resolve, join } from "path";
import { createLogFile, archiveCurrentLog } from "./log";

const REPO_ROOT = "/repo";
const LOGS_DIR = resolve(REPO_ROOT, "logs");
const JOBS_FILE = resolve(REPO_ROOT, "jobs/jobs.json");
const MAX_ITERATIONS = process.env.MAX_ITERATIONS ? parseInt(process.env.MAX_ITERATIONS) : null;
const MAX_GROUP_RETRIES = 3;

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
}

function runClaude(claudeArgs: string[], log: (msg: string) => void): Promise<ClaudeResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", claudeArgs, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let resultEvent: ClaudeResult | null = null;
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
          if (event.type === "result") {
            resultEvent = {
              result: event.result ?? "",
              cost_usd: event.total_cost_usd,
              duration_ms: event.duration_ms,
              num_turns: event.num_turns,
            };
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
      if (buffer.trim()) {
        log(buffer);
        try {
          const event = JSON.parse(buffer);
          if (event.type === "result") {
            resultEvent = {
              result: event.result ?? "",
              cost_usd: event.total_cost_usd,
              duration_ms: event.duration_ms,
              num_turns: event.num_turns,
            };
          }
        } catch {}
      }
      if (code !== 0 && !resultEvent) {
        reject(new Error(`claude exited with code ${code}`));
        return;
      }
      resolve(resultEvent ?? { result: "" });
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

function getUnreviewedLogs(): string[] {
  if (!existsSync(LOGS_DIR)) return [];
  const files = readdirSync(LOGS_DIR);
  return files.filter(
    (f) =>
      (f.startsWith("worker-") || f.startsWith("iteration-")) &&
      f.endsWith(".log") &&
      !f.includes("-current")
  );
}

function completeGroup(log: (msg: string) => void): void {
  const data = readJobsFile();
  if (data.groups.length === 0) return;
  const completed = data.groups.shift()!;
  writeJobsFile(data);
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

function buildReviewPrompt(unreviewedLogs: string[]): string {
  const logPaths = unreviewedLogs.map((f) => join(LOGS_DIR, f)).join("\n  ");
  return (
    `There are unreviewed iteration logs that need to be processed first.\n` +
    `\n` +
    `Unreviewed logs:\n  ${logPaths}\n` +
    `\n` +
    `Read /repo/strategies/jobs/reviewChanges.md and follow the instructions to review these logs.\n` +
    `After reviewing, commit your changes and exit.`
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
    let isGroup = false;

    if (iteration === 1 && initialPrompt) {
      prompt = initialPrompt;
      log(`Running initial prompt`);
    } else {
      // Check for unreviewed logs first
      const unreviewedLogs = getUnreviewedLogs();
      if (unreviewedLogs.length > 0) {
        prompt = buildReviewPrompt(unreviewedLogs);
        log(`Running log review (${unreviewedLogs.length} unreviewed logs)`);
      } else {
        // Read next group from jobs.json
        const data = readJobsFile();
        if (data.groups.length === 0) {
          log("No groups remaining. Exiting.");
          archiveCurrentLog(LOGS_DIR);
          break;
        }

        const group = data.groups[0];
        prompt = buildGroupPrompt(group);
        isGroup = true;
        log(`Running group: ${group.jobs.length} job(s) (strategy: ${group.strategy})`);
        for (const job of group.jobs) {
          log(`  - ${job}`);
        }
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

    // Check for <DONE> signal
    const done = response.result?.includes("<DONE");

    if (isGroup) {
      if (done) {
        log(`Group signaled <DONE>. Completing group.`);
        completeGroup(log);
        consecutiveRetries = 0;
      } else {
        consecutiveRetries++;
        if (consecutiveRetries >= MAX_GROUP_RETRIES) {
          log(`Group failed ${MAX_GROUP_RETRIES} times. Skipping.`);
          completeGroup(log);
          consecutiveRetries = 0;
        } else {
          log(`Group did NOT signal <DONE>. Retry ${consecutiveRetries}/${MAX_GROUP_RETRIES}.`);
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
