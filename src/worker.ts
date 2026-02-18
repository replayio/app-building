import { spawn, execFileSync } from "child_process";
import { createLogFile, archiveCurrentLog } from "./log";

const LOGS_DIR = "/repo/logs";
const MAX_ITERATIONS = process.env.MAX_ITERATIONS ? parseInt(process.env.MAX_ITERATIONS) : null;
const PERFORM_TASKS_PROMPT = "Read /repo/strategies/tasks/performTasks.md and follow the instructions exactly.";

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

function gitCommit(iteration: number, log: (msg: string) => void): void {
  try {
    execFileSync("git", ["add", "-A"], { encoding: "utf-8", timeout: 30000 });
    execFileSync("git", ["commit", "-m", `Agent iteration ${iteration}`, "--allow-empty"], {
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

// Incoming args: -p <prompt> --model ... --dangerously-skip-permissions --mcp-config ...
// We extract the prompt and treat the rest as base claude args.
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

// --- Main loop ---

async function runLoop(): Promise<void> {
  const containerName = process.env.CONTAINER_NAME ?? "(unknown)";
  let iteration = 0;
  let totalCost = 0;

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

    // First iteration uses the provided prompt, subsequent use performTasks
    const prompt = iteration === 1 ? initialPrompt : PERFORM_TASKS_PROMPT;
    const claudeArgs = buildClaudeArgs(prompt);
    log(`Running Claude...`);

    const startTime = Date.now();

    let response: ClaudeResult;
    try {
      response = await runClaude(claudeArgs, log);
    } catch (e: any) {
      log(`Error running claude: ${e.message}`);
      if (MAX_ITERATIONS !== null) {
        log(`Have remaining iterations, retrying...`);
        continue;
      }
      break;
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

    // Commit code changes while log is still worker-current.log (gitignored)
    gitCommit(iteration, log);
    log(`Committed iteration ${iteration}`);
    log(`Final revision: ${getGitRevision()}`);

    // Rename log to timestamped file so future iterations can review it
    archiveCurrentLog(LOGS_DIR);

    if (response.result && response.result.includes("<DONE/>")) {
      break;
    }
  }
}

runLoop().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
