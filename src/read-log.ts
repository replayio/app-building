import { readFileSync } from "fs";
import { resolve } from "path";
import { Command } from "commander";
import { formatEvent } from "./format";

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

for (const rawLine of content.split("\n")) {
  if (!rawLine.trim()) continue;

  // Strip timestamp prefix: [2026-02-07T16:24:03.590Z]
  const tsMatch = rawLine.match(/^\[(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\]\s*(.*)/);
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
  if (line.startsWith("Target:") || line.startsWith("Strategy:") || line.startsWith("Strategies:") || line.startsWith("Max iterations:") || line.startsWith("Log file:")) {
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
    continue;
  }

  // Try parsing as JSON stream event
  let event: any;
  try {
    event = JSON.parse(line);
  } catch {
    console.log(line);
    continue;
  }

  const formatted = formatEvent(event);
  if (formatted) console.log(formatted);
}
