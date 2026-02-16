import { execFileSync, spawn } from "child_process";
import { writeFileSync, appendFileSync, mkdirSync, renameSync } from "fs";
import { join, basename } from "path";

const REPO_ROOT = "/repo";
const STRATEGY_FILE = join(REPO_ROOT, "strategies", "tasks", "performTasks.md");
const LOGS_DIR = join(REPO_ROOT, "logs");
const ReplayMCPServer = "https://dispatch.replay.io/nut/mcp";

// --- Args ---

const appDir = process.argv[2];
if (!appDir) {
  console.error("Usage: npx tsx src/performTasks.ts <appDir>");
  process.exit(1);
}

const maxIterations = process.env.MAX_ITERATIONS ? parseInt(process.env.MAX_ITERATIONS) : null;

// --- Helpers ---

function formatTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function getGitRevision(targetDir: string): string {
  try {
    return execFileSync("git", ["-C", targetDir, "rev-parse", "HEAD"], {
      encoding: "utf-8",
      timeout: 10000,
    }).trim();
  } catch {
    return "(unknown)";
  }
}

// --- Logging ---

function createLogger(logFilePath: string) {
  return (message: string): void => {
    const line = `[${new Date().toISOString()}] ${message}\n`;
    appendFileSync(logFilePath, line);
  };
}

// --- Agent Invocation ---

interface ClaudeResponse {
  result: string;
  cost_usd?: number;
  duration_ms?: number;
  num_turns?: number;
  session_id?: string;
}

function runClaude(targetDir: string, log: (msg: string) => void): Promise<ClaudeResponse> {
  return new Promise((resolvePromise, reject) => {
    const prompt = `Read ${STRATEGY_FILE} and follow the instructions exactly.`;

    const mcpConfig: Record<string, any> = {
      mcpServers: {},
    };

    if (process.env.RECORD_REPLAY_API_KEY) {
      mcpConfig.mcpServers.replay = {
        type: "http",
        url: ReplayMCPServer,
      };
    }

    const child = spawn("claude", [
      "-p", prompt,
      "--model", "claude-opus-4-6",
      "--output-format", "stream-json",
      "--verbose",
      "--dangerously-skip-permissions",
      "--mcp-config", JSON.stringify(mcpConfig),
    ], {
      cwd: targetDir,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let resultEvent: ClaudeResponse | null = null;
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
              session_id: event.session_id,
            };
          }
        } catch {
          // not JSON, already logged
        }
      }
    });

    child.stderr!.on("data", (data: Buffer) => {
      const text = data.toString();
      for (const line of text.split("\n")) {
        if (line.trim()) log(`[claude:err] ${line}`);
      }
    });

    child.on("error", (err) => reject(err));

    child.on("close", (code) => {
      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer);
          if (event.type === "result") {
            resultEvent = {
              result: event.result ?? "",
              cost_usd: event.total_cost_usd,
              duration_ms: event.duration_ms,
              num_turns: event.num_turns,
              session_id: event.session_id,
            };
          }
        } catch {
          // ignore
        }
      }

      if (code !== 0 && !resultEvent) {
        reject(new Error(`claude exited with code ${code}`));
        return;
      }
      resolvePromise(resultEvent ?? { result: "" });
    });
  });
}

// --- Git Operations ---

function gitCommit(targetDir: string, iteration: number, log: (msg: string) => void): void {
  try {
    execFileSync("git", ["-C", targetDir, "add", "-A"], {
      encoding: "utf-8",
      timeout: 30000,
    });
    execFileSync(
      "git",
      ["-C", targetDir, "commit", "-m", `Agent iteration ${iteration}`, "--allow-empty"],
      { encoding: "utf-8", timeout: 30000 }
    );
  } catch (e: any) {
    log(`Warning: git commit failed: ${e.message}`);
  }
}

// --- Run Loop ---

async function runLoop(): Promise<void> {
  mkdirSync(LOGS_DIR, { recursive: true });

  let iteration = 0;
  let totalCost = 0;
  let log: ((msg: string) => void) | null = null;

  while (true) {
    iteration++;

    if (maxIterations !== null && iteration > maxIterations) {
      if (log) log(`Reached max iterations (${maxIterations}). Stopping.`);
      break;
    }

    const currentLogFile = join(LOGS_DIR, "iteration-current.log");
    writeFileSync(currentLogFile, ""); // truncate
    log = createLogger(currentLogFile);

    const containerName = process.env.CONTAINER_NAME ?? "(unknown)";
    const initialRevision = getGitRevision(appDir);
    log(`Container: ${containerName}`);
    log(`Initial revision: ${initialRevision}`);

    log(`Target: ${appDir}`);
    log(`Strategy: ${basename(STRATEGY_FILE)}`);
    log(`Max iterations: ${maxIterations ?? "unlimited"}`);

    console.log(`[${basename(appDir)}] iteration ${iteration}, logging to ${currentLogFile}`);

    log(`=== Iteration ${iteration} ===`);
    log(`Running Claude...`);
    const startTime = Date.now();

    let response: ClaudeResponse;
    try {
      response = await runClaude(appDir, log);
    } catch (e: any) {
      log(`Error running claude: ${e} ${e.message}`);
      if (maxIterations !== null) {
        log(`Have remaining iterations, retrying...`);
        continue;
      }
      log(`Max iterations not set, stopping.`);
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

    // Commit code changes while log is still iteration-current.log (gitignored)
    gitCommit(appDir, iteration, log);
    log(`Committed iteration ${iteration}`);

    const finalRevision = getGitRevision(appDir);
    log(`Final revision: ${finalRevision}`);

    // Rename log to timestamped file
    const timestamp = formatTimestamp(new Date());
    const finalLogFile = join(LOGS_DIR, `iteration-${timestamp}.log`);
    renameSync(currentLogFile, finalLogFile);
    log = createLogger(finalLogFile);

    if (response.result && response.result.includes("<DONE/>")) {
      log(`Agent signaled <DONE/>. Stopping.`);
      break;
    }
  }

  if (log) log(`Finished after ${iteration} iteration(s).`);
}

// --- Main ---

runLoop().catch((e) => {
  console.error(e);
  process.exit(1);
});
