/**
 * add-trailing-group: Adds a job group to the END of the queue.
 *
 * Usage: npx tsx /repo/scripts/add-trailing-group.ts --strategy <path> --job "desc1" --job "desc2"
 *
 * All --job values become the jobs array within the group. Jobs execute in the
 * order listed (no reverse-order trick needed).
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

function parseArgs(): { strategy: string; jobs: string[] } {
  const args = process.argv.slice(2);
  let strategy = "";
  const jobs: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--strategy" && i + 1 < args.length) {
      strategy = args[i + 1];
      i++;
    } else if (args[i] === "--job" && i + 1 < args.length) {
      jobs.push(args[i + 1]);
      i++;
    }
  }
  if (!strategy || jobs.length === 0) {
    console.error('Usage: add-trailing-group --strategy "<path>" --job "desc1" [--job "desc2" ...]');
    process.exit(1);
  }
  return { strategy, jobs };
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
  const { strategy, jobs } = parseArgs();
  const data = readJobsFile();
  const newGroup: Group = { strategy, jobs, timestamp: new Date().toISOString() };
  data.groups.push(newGroup);
  writeJobsFile(data);
  console.log(`Added group at end: ${jobs.length} job(s) (strategy: ${strategy})`);
  for (const job of jobs) {
    console.log(`  - ${job}`);
  }
  console.log(`Queue now has ${data.groups.length} group(s).`);
}

main();
