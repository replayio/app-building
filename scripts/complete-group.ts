/**
 * complete-group: Removes the first group from the queue after successful completion.
 *
 * Usage: npx tsx /repo/scripts/complete-group.ts
 *
 * Called by the worker when Claude signals <DONE> for a group.
 * Dequeues the first group and appends it to the completed log.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const JOBS_FILE = resolve("/repo/jobs/jobs.json");

interface Group {
  strategy: string;
  jobs: string[];
  timestamp: string;
}

interface JobsFile {
  groups: Group[];
}

function readJobsFile(): JobsFile {
  if (!existsSync(JOBS_FILE)) return { groups: [] };
  const content = readFileSync(JOBS_FILE, "utf-8").trim();
  if (!content) return { groups: [] };
  return JSON.parse(content);
}

function writeJobsFile(data: JobsFile): void {
  mkdirSync(resolve("/repo/jobs"), { recursive: true });
  writeFileSync(JOBS_FILE, JSON.stringify(data, null, 2) + "\n");
}

function main() {
  const data = readJobsFile();
  if (data.groups.length === 0) {
    console.log("No groups to complete.");
    return;
  }

  const completed = data.groups.shift()!;
  writeJobsFile(data);
  console.log(`Completed group: ${completed.jobs.length} job(s) (strategy: ${completed.strategy})`);
  for (const job of completed.jobs) {
    console.log(`  - ${job}`);
  }
  console.log(`Queue now has ${data.groups.length} group(s) remaining.`);
}

main();
