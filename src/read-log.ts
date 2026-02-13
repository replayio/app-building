import { readFileSync } from "fs";
import { resolve } from "path";
import { Command } from "commander";

const program = new Command();
program
  .argument("<logfile>", "path to an iteration log file")
  .parse();

const logFile = resolve(program.args[0]);
const content = readFileSync(logFile, "utf-8");

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const MAGENTA = "\x1b[35m";

for (const rawLine of content.split("\n")) {
  if (!rawLine.trim()) continue;

  // Strip timestamp prefix: [2026-02-07T16:24:03.590Z]
  const tsMatch = rawLine.match(/^\[(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\]\s*(.*)/);
  const timestamp = tsMatch ? tsMatch[1] : null;
  const line = tsMatch ? tsMatch[2] : rawLine;

  // Loop control lines
  if (line.startsWith("=== Iteration")) {
    console.log(`\n${BOLD}${CYAN}${line}${RESET}`);
    continue;
  }
  if (line.startsWith("Initial revision:") || line.startsWith("Final revision:")) {
    console.log(`${BOLD}${line}${RESET}`);
    continue;
  }
  if (line.startsWith("Target:") || line.startsWith("Strategies:") || line.startsWith("Max iterations:") || line.startsWith("Log file:")) {
    console.log(`${DIM}${line}${RESET}`);
    continue;
  }
  if (line.startsWith("Running Claude")) {
    console.log(`${DIM}${line}${RESET}`);
    continue;
  }
  if (line.startsWith("Completed in")) {
    console.log(`${GREEN}${line}${RESET}`);
    continue;
  }
  if (line.startsWith("Cost:")) {
    console.log(`${YELLOW}${line}${RESET}`);
    continue;
  }
  if (line.startsWith("Turns:")) {
    console.log(`${DIM}${line}${RESET}`);
    continue;
  }
  if (line.startsWith("Committed iteration")) {
    console.log(`${DIM}${line}${RESET}`);
    continue;
  }
  if (line.startsWith("Reached max iterations") || line.startsWith("Finished after") || line.includes("Agent signaled <DONE/>")) {
    console.log(`${BOLD}${GREEN}${line}${RESET}`);
    continue;
  }
  if (line.startsWith("Error running") || line.startsWith("Warning:") || line.startsWith("[claude:err]")) {
    console.log(`${RED}${line}${RESET}`);
    continue;
  }
  if (line === "--- Prompt ---" || line === "--- End prompt ---") {
    continue; // skip prompt delimiters, prompt content is noisy
  }

  // Try parsing as JSON stream event
  let event: any;
  try {
    event = JSON.parse(line);
  } catch {
    // Not JSON — might be prompt content between delimiters, skip it
    continue;
  }

  if (event.type === "system" && event.subtype === "init") {
    console.log(`${DIM}Session: ${event.session_id} | Model: ${event.model}${RESET}`);
    continue;
  }

  if (event.type === "assistant") {
    const content = event.message?.content;
    if (!Array.isArray(content)) continue;

    for (const block of content) {
      if (block.type === "text" && block.text) {
        console.log(block.text);
      } else if (block.type === "tool_use") {
        const input = block.input;
        if (block.name === "Bash" && input?.command) {
          console.log(`${MAGENTA}$ ${input.command}${RESET}`);
        } else if (block.name === "Edit" && input?.file_path) {
          console.log(`${MAGENTA}[edit] ${input.file_path}${RESET}`);
        } else if (block.name === "Write" && input?.file_path) {
          console.log(`${MAGENTA}[write] ${input.file_path}${RESET}`);
        } else if (block.name === "Read" && input?.file_path) {
          console.log(`${MAGENTA}[read] ${input.file_path}${RESET}`);
        } else if (block.name === "Glob" && input?.pattern) {
          console.log(`${MAGENTA}[glob] ${input.pattern}${RESET}`);
        } else if (block.name === "Grep" && input?.pattern) {
          console.log(`${MAGENTA}[grep] ${input.pattern}${RESET}`);
        } else {
          console.log(`${MAGENTA}[${block.name}]${RESET}`);
        }
      }
    }
    continue;
  }

  if (event.type === "user" && event.tool_use_result) {
    const result = event.tool_use_result;
    const stdout = result.stdout ?? "";
    const stderr = result.stderr ?? "";
    if (stdout) {
      const lines = stdout.split("\n");
      const display = lines.length > 20 ? [...lines.slice(0, 20), `${DIM}... (${lines.length - 20} more lines)${RESET}`] : lines;
      console.log(`${DIM}${display.join("\n")}${RESET}`);
    }
    if (stderr) {
      console.log(`${RED}${stderr}${RESET}`);
    }
    continue;
  }

  if (event.type === "result") {
    console.log(`\n${BOLD}${GREEN}--- Result ---${RESET}`);
    console.log(`${DIM}Duration: ${event.duration_ms}ms | Turns: ${event.num_turns} | Cost: $${event.total_cost_usd?.toFixed(4)}${RESET}`);
    continue;
  }
}
