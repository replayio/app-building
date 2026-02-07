import { execFileSync, execSync } from "child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { join, resolve, basename } from "path";

// --- CLI Arg Parsing ---

function printUsage(): void {
  console.log(`Usage: npx tsx src/loop.ts <target-dir> [--max-iterations N] <strategy1.md> [strategy2.md ...]

Arguments:
  target-dir       Path to the target git repository
  strategy1.md     One or more strategy files (.md) to guide the agent

Options:
  --max-iterations N   Maximum number of iterations to run (default: unlimited)
  --help               Show this help message`);
}

interface Args {
  targetDir: string;
  strategyFiles: string[];
  maxIterations: number | null;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    printUsage();
    process.exit(0);
  }

  const targetDir = resolve(args[0]);
  let maxIterations: number | null = null;
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
    } else {
      strategyFiles.push(resolve(args[i]));
    }
    i++;
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

  return { targetDir, strategyFiles, maxIterations };
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
  const result = execFileSync("claude", ["-p", prompt, "--output-format", "json"], {
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
    console.warn(`Warning: git commit failed: ${e.message}`);
  }
}

// --- Iteration Output ---

function saveIteration(
  targetDir: string,
  iteration: number,
  response: ClaudeResponse,
  strategyNames: string[]
): void {
  const iterDir = join(targetDir, "docs", "iterations");
  mkdirSync(iterDir, { recursive: true });

  const output = {
    iteration,
    timestamp: new Date().toISOString(),
    strategies: strategyNames,
    response: response.result,
    cost_usd: response.cost_usd ?? null,
    duration_ms: response.duration_ms ?? null,
    num_turns: response.num_turns ?? null,
    session_id: response.session_id ?? null,
  };

  writeFileSync(
    join(iterDir, `iteration-${iteration}.json`),
    JSON.stringify(output, null, 2) + "\n"
  );
}

// --- Main Loop ---

function main(): void {
  const { targetDir, strategyFiles, maxIterations } = parseArgs();

  const strategyContents = strategyFiles.map((f) => readFileSync(f, "utf-8"));
  const strategyNames = strategyFiles.map((f) => basename(f));

  console.log(`Target: ${targetDir}`);
  console.log(`Strategies: ${strategyNames.join(", ")}`);
  console.log(`Max iterations: ${maxIterations ?? "unlimited"}`);
  console.log();

  let iteration = 0;

  while (true) {
    iteration++;

    if (maxIterations !== null && iteration > maxIterations) {
      console.log(`Reached max iterations (${maxIterations}). Stopping.`);
      break;
    }

    console.log(`=== Iteration ${iteration} ===`);

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

    console.log(`Running Claude... (prompt length: ${prompt.length} chars)`);
    const startTime = Date.now();

    let response: ClaudeResponse;
    try {
      response = runClaude(prompt, targetDir);
    } catch (e: any) {
      console.error(`Error running Claude: ${e.message}`);
      break;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Completed in ${elapsed}s`);
    if (response.cost_usd != null) {
      console.log(`Cost: $${response.cost_usd.toFixed(4)}`);
    }

    // Save iteration output
    saveIteration(targetDir, iteration, response, strategyNames);

    // Git commit
    gitCommit(targetDir, iteration);
    console.log(`Committed iteration ${iteration}`);

    // Check for done signal
    if (response.result && response.result.includes("<DONE/>")) {
      console.log(`\nAgent signaled <DONE/>. Stopping.`);
      break;
    }

    console.log();
  }

  console.log(`\nFinished after ${iteration} iteration(s).`);
}

main();
