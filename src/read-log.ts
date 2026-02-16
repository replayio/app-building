import { readFileSync } from "fs";
import { resolve } from "path";
import { Command } from "commander";
import { formatLogLine } from "./format";

const program = new Command();
program
  .argument("<logfile>", "path to an iteration log file")
  .parse();

const logFile = resolve(program.args[0]);
const content = readFileSync(logFile, "utf-8");

for (const rawLine of content.split("\n")) {
  if (!rawLine.trim()) continue;

  // Strip timestamp prefix: [2026-02-07T16:24:03.590Z]
  const tsMatch = rawLine.match(/^\[(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\]\s*(.*)/);
  const line = tsMatch ? tsMatch[2] : rawLine;

  const formatted = formatLogLine(line);
  if (formatted) console.log(formatted);
}
