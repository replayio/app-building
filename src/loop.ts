import { execFileSync, spawn } from "child_process";
import { readFileSync, existsSync, readdirSync, statSync, openSync, appendFileSync, mkdirSync } from "fs";
import { join, resolve, basename } from "path";
import { Command } from "commander";

// --- CLI Arg Parsing ---

interface Args {
  dirs: string[];
  strategyFiles: string[];
  maxIterations: number | null;
  promptText: string | null;
  foreground: boolean;
}

function parseArgs(): Args {
  const program = new Command();
  program
    .requiredOption("--dir <paths...>", "target git repository directories")
    .requiredOption("--load <files...>", "strategy files (.md) to guide the agent")
    .option("--max-iterations <n>", "maximum number of iterations to run", parseInt)
    .option("--prompt <text>", "additional prompt text to include in each iteration")
    .option("--foreground", "run in foreground (used internally)", false)
    .parse();

  const opts = program.opts();

  return {
    dirs: opts.dir.map((d: string) => resolve(d)),
    strategyFiles: opts.load.map((f: string) => resolve(f)),
    maxIterations: opts.maxIterations ?? null,
    promptText: opts.prompt ?? null,
    foreground: opts.foreground,
  };
}

function getLogFile(targetDir: string): string {
  const logsDir = join(targetDir, "logs");
  mkdirSync(logsDir, { recursive: true });

  let n = 1;
  const existing = readdirSync(logsDir)
    .filter((f) => /^loop-(\d+)\.log$/.test(f))
    .map((f) => parseInt(f.match(/^loop-(\d+)\.log$/)![1], 10));
  if (existing.length > 0) {
    n = Math.max(...existing) + 1;
  }

  return join(logsDir, `loop-${n}.log`);
}

// --- Logging ---

function createLogger(logFilePath: string) {
  return (message: string): void => {
    const line = `[${new Date().toISOString()}] ${message}\n`;
    appendFileSync(logFilePath, line);
  };
}

// --- Context Gathering ---

function readFileIfExists(path: string): string | null {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

function getFileTree(dir: string, prefix = "", maxDepth = 3, depth = 0): string {
  if (depth >= maxDepth) return "";
  const lines: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return "";
  }
  const filtered = entries.filter(
    (e) => !e.startsWith(".") && e !== "node_modules" && e !== "dist"
  );
  for (const entry of filtered) {
    const fullPath = join(dir, entry);
    let isDir = false;
    try {
      isDir = statSync(fullPath).isDirectory();
    } catch {
      continue;
    }
    lines.push(`${prefix}${entry}${isDir ? "/" : ""}`);
    if (isDir) {
      lines.push(getFileTree(fullPath, prefix + "  ", maxDepth, depth + 1));
    }
  }
  return lines.filter(Boolean).join("\n");
}

function getGitLog(targetDir: string): string {
  try {
    return execFileSync("git", ["-C", targetDir, "log", "--oneline", "-20"], {
      encoding: "utf-8",
      timeout: 10000,
    }).trim();
  } catch {
    return "(no git history)";
  }
}

function readDocsFolder(targetDir: string): string {
  const docsDir = join(targetDir, "docs");
  if (!existsSync(docsDir)) return "";
  const parts: string[] = [];
  function walk(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (entry.endsWith(".md") || entry.endsWith(".txt")) {
        const rel = full.slice(targetDir.length + 1);
        const content = readFileSync(full, "utf-8");
        parts.push(`--- ${rel} ---\n${content}`);
      }
    }
  }
  try {
    walk(docsDir);
  } catch {
    // ignore read errors
  }
  return parts.join("\n\n");
}

function gatherContext(targetDir: string): string {
  const sections: string[] = [];

  const appSpec = readFileIfExists(join(targetDir, "AppSpec.md"));
  if (appSpec) {
    sections.push(`## AppSpec.md\n\n${appSpec}`);
  }

  const docs = readDocsFolder(targetDir);
  if (docs) {
    sections.push(`## docs/\n\n${docs}`);
  }

  const gitLog = getGitLog(targetDir);
  sections.push(`## Recent Git History\n\n${gitLog}`);

  const tree = getFileTree(targetDir);
  sections.push(`## File Tree\n\n${tree}`);

  return sections.join("\n\n---\n\n");
}

// --- Agent Invocation ---

interface ClaudeResponse {
  result: string;
  cost_usd?: number;
  duration_ms?: number;
  num_turns?: number;
  session_id?: string;
}

function runClaude(prompt: string, targetDir: string, log: (msg: string) => void): Promise<ClaudeResponse> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn("claude", [
      "-p", prompt,
      "--output-format", "stream-json",
      "--verbose",
      "--dangerously-skip-permissions",
    ], {
      cwd: targetDir,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let resultEvent: ClaudeResponse | null = null;
    let buffer = "";

    child.stdout.on("data", (data: Buffer) => {
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

    child.stderr.on("data", (data: Buffer) => {
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

// --- Detach ---

function detach(): void {
  const child = spawn(process.execPath, [...process.execArgv, ...process.argv.slice(1), "--foreground"], {
    detached: true,
    stdio: "ignore",
    env: process.env,
  });
  child.unref();
  console.log(`Started background process (pid ${child.pid})`);
}

// --- Env Var Check ---

function checkEnvVars(strategyFiles: string[]): void {
  const allVars: string[] = [];

  for (const f of strategyFiles) {
    const content = readFileSync(f, "utf-8");
    // Look for a "Required Environment Variables" section with a code block
    const sectionMatch = content.match(/## Required Environment Variables\s*\n+```\n([\s\S]*?)\n```/);
    if (!sectionMatch) continue;

    const vars = sectionMatch[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    allVars.push(...vars);
  }

  if (allVars.length === 0) return;

  const missing = allVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}

// --- Run Loop for a Single Directory ---

async function runLoop(
  targetDir: string,
  strategyContents: string[],
  strategyNames: string[],
  maxIterations: number | null,
  promptText: string | null,
): Promise<void> {
  const logFile = getLogFile(targetDir);
  const log = createLogger(logFile);

  log(`Target: ${targetDir}`);
  log(`Log file: ${logFile}`);
  log(`Strategies: ${strategyNames.join(", ")}`);
  log(`Max iterations: ${maxIterations ?? "unlimited"}`);

  console.log(`[${basename(targetDir)}] logging to ${logFile}`);

  let iteration = 0;
  let totalCost = 0;

  while (true) {
    iteration++;

    if (maxIterations !== null && iteration > maxIterations) {
      log(`Reached max iterations (${maxIterations}). Stopping.`);
      break;
    }

    log(`=== Iteration ${iteration} ===`);

    // Gather fresh context each iteration
    const context = gatherContext(targetDir);

    // Build prompt
    const promptParts = [
      `# Agent Loop — Iteration ${iteration}`,
      "",
      "## Strategy Instructions",
      "",
      ...strategyContents.map((content, i) => `### ${strategyNames[i]}\n\n${content}`),
      ...(promptText ? ["", "## Additional Instructions", "", promptText] : []),
      "",
      "## Current Repository Context",
      "",
      context,
      "",
      "## Instructions",
      "",
      "Follow the strategy instructions above. Work on the target repository.",
      "When all work described in the strategy is complete, include `<DONE/>` in your response.",
      "If more work remains, describe what was accomplished and what still needs to be done.",
      "",
      "IMPORTANT: Monitor your context window usage. When you are running low on context,",
      "wrap up your current task cleanly — commit your work, update docs/plan.md, and exit.",
      "The next iteration of the loop will pick up where you left off with fresh context.",
    ];

    const prompt = promptParts.join("\n");

    log(`--- Prompt ---`);
    log(prompt);
    log(`--- End prompt ---`);
    log(`Running Claude... (prompt length: ${prompt.length} chars)`);
    const startTime = Date.now();

    let response: ClaudeResponse;
    try {
      response = await runClaude(prompt, targetDir, log);
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

    // Git commit
    gitCommit(targetDir, iteration, log);
    log(`Committed iteration ${iteration}`);

    // Check for done signal
    if (response.result && response.result.includes("<DONE/>")) {
      log(`Agent signaled <DONE/>. Stopping.`);
      break;
    }
  }

  log(`Finished after ${iteration} iteration(s).`);
}

// --- Main ---

async function main(): Promise<void> {
  const { dirs, strategyFiles, maxIterations, promptText, foreground } = parseArgs();
  checkEnvVars(strategyFiles);

  // If not already running as the detached child, re-spawn detached
  if (!foreground) {
    detach();
    return;
  }

  const strategyContents = strategyFiles.map((f) => readFileSync(f, "utf-8"));
  const strategyNames = strategyFiles.map((f) => basename(f));

  // Run all directories in parallel
  await Promise.all(
    dirs.map((dir) => runLoop(dir, strategyContents, strategyNames, maxIterations, promptText))
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
