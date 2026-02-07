import { execFileSync, spawn } from "child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, openSync, appendFileSync } from "fs";
import { join, resolve, basename } from "path";

// --- CLI Arg Parsing ---

function printUsage(): void {
  console.log(`Usage: npx tsx src/loop.ts <target-dir> --log <logfile> [--max-iterations N] <strategy1.md> [strategy2.md ...]

Arguments:
  target-dir       Path to the target git repository
  strategy1.md     One or more strategy files (.md) to guide the agent

Options:
  --log <file>         Log file for all output (required)
  --max-iterations N   Maximum number of iterations to run (default: unlimited)
  --help               Show this help message`);
}

interface Args {
  targetDir: string;
  strategyFiles: string[];
  maxIterations: number | null;
  logFile: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    printUsage();
    process.exit(0);
  }

  // Remove --foreground flag (used internally for detached re-spawn)
  const foregroundIdx = args.indexOf("--foreground");
  if (foregroundIdx !== -1) args.splice(foregroundIdx, 1);

  const targetDir = resolve(args[0]);
  let maxIterations: number | null = null;
  let logFile: string | null = null;
  const strategyFiles: string[] = [];

  let i = 1;
  while (i < args.length) {
    if (args[i] === "--max-iterations") {
      i++;
      if (i >= args.length) {
        console.error("Error: --max-iterations requires a number");
        process.exit(1);
      }
      maxIterations = parseInt(args[i], 10);
      if (isNaN(maxIterations) || maxIterations < 1) {
        console.error("Error: --max-iterations must be a positive integer");
        process.exit(1);
      }
    } else if (args[i] === "--log") {
      i++;
      if (i >= args.length) {
        console.error("Error: --log requires a file path");
        process.exit(1);
      }
      logFile = resolve(args[i]);
    } else {
      strategyFiles.push(resolve(args[i]));
    }
    i++;
  }

  if (!logFile) {
    console.error("Error: --log is required");
    printUsage();
    process.exit(1);
  }

  if (strategyFiles.length === 0) {
    console.error("Error: at least one strategy file is required");
    printUsage();
    process.exit(1);
  }

  if (!existsSync(targetDir) || !statSync(targetDir).isDirectory()) {
    console.error(`Error: target directory does not exist: ${targetDir}`);
    process.exit(1);
  }

  for (const f of strategyFiles) {
    if (!existsSync(f)) {
      console.error(`Error: strategy file not found: ${f}`);
      process.exit(1);
    }
  }

  return { targetDir, strategyFiles, maxIterations, logFile };
}

// --- Logging ---

let logFilePath: string | null = null;

function log(message: string): void {
  const line = `[${new Date().toISOString()}] ${message}`;
  if (logFilePath) {
    appendFileSync(logFilePath, line + "\n");
  }
  console.log(line);
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

function runClaude(prompt: string, targetDir: string): ClaudeResponse {
  const result = execFileSync("claude", ["-p", prompt, "--output-format", "json", "--dangerously-skip-permissions"], {
    cwd: targetDir,
    encoding: "utf-8",
    maxBuffer: 50 * 1024 * 1024,
    timeout: 30 * 60 * 1000, // 30 minutes
  });

  try {
    return JSON.parse(result);
  } catch {
    return { result };
  }
}

// --- Git Operations ---

function gitCommit(targetDir: string, iteration: number): void {
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

function detach(logFile: string): void {
  const fd = openSync(logFile, "a");
  const child = spawn(process.execPath, [...process.execArgv, ...process.argv.slice(1), "--foreground"], {
    detached: true,
    stdio: ["ignore", fd, fd],
    env: process.env,
  });
  child.unref();
  console.log(`Started background process (pid ${child.pid}), logging to ${logFile}`);
}

// --- Main Loop ---

function main(): void {
  const { targetDir, strategyFiles, maxIterations, logFile } = parseArgs();

  // If not already running as the detached child, re-spawn detached
  if (!process.argv.includes("--foreground")) {
    detach(logFile);
    return;
  }

  logFilePath = logFile;

  const strategyContents = strategyFiles.map((f) => readFileSync(f, "utf-8"));
  const strategyNames = strategyFiles.map((f) => basename(f));

  log(`Target: ${targetDir}`);
  log(`Strategies: ${strategyNames.join(", ")}`);
  log(`Max iterations: ${maxIterations ?? "unlimited"}`);

  let iteration = 0;

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
    ];

    const prompt = promptParts.join("\n");

    log(`Running Claude... (prompt length: ${prompt.length} chars)`);
    const startTime = Date.now();

    let response: ClaudeResponse;
    try {
      response = runClaude(prompt, targetDir);
    } catch (e: any) {
      log(`Error running Claude: ${e.message}`);
      break;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`Completed in ${elapsed}s`);
    if (response.cost_usd != null) {
      log(`Cost: $${response.cost_usd.toFixed(4)}`);
    }
    if (response.num_turns != null) {
      log(`Turns: ${response.num_turns}`);
    }

    // Log Claude's response
    log(`--- Claude response ---`);
    log(response.result ?? "(no result)");
    log(`--- End response ---`);

    // Git commit
    gitCommit(targetDir, iteration);
    log(`Committed iteration ${iteration}`);

    // Check for done signal
    if (response.result && response.result.includes("<DONE/>")) {
      log(`Agent signaled <DONE/>. Stopping.`);
      break;
    }
  }

  log(`Finished after ${iteration} iteration(s).`);
}

main();
