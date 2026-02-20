/**
 * add-group: Adds a job group to the queue.
 *
 * Usage: npx tsx /repo/scripts/add-group.ts --strategy <path> --job "desc1" --job "desc2" [--trailing]
 *
 * By default, adds to the FRONT of the queue (next to be processed).
 * With --trailing, adds to the END of the queue.
 *
 * All --job values become the jobs array within the group. Jobs execute in the
 * order listed.
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

function parseArgs(): { strategy: string; jobs: string[]; trailing: boolean } {
  const args = process.argv.slice(2);
  let strategy = "";
  let trailing = false;
  const jobs: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--strategy" && i + 1 < args.length) {
      strategy = args[i + 1];
      i++;
    } else if (args[i] === "--job" && i + 1 < args.length) {
      jobs.push(args[i + 1]);
      i++;
    } else if (args[i] === "--trailing") {
      trailing = true;
    }
  }
  if (!strategy || jobs.length === 0) {
    console.error('Usage: add-group --strategy "<path>" --job "desc1" [--job "desc2" ...] [--trailing]');
    process.exit(1);
  }
  return { strategy, jobs, trailing };
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
  const { strategy, jobs, trailing } = parseArgs();
  const data = readJobsFile();
  const newGroup: Group = { strategy, jobs, timestamp: new Date().toISOString() };

  if (trailing) {
    data.groups.push(newGroup);
  } else {
    data.groups.unshift(newGroup);
  }

  writeJobsFile(data);
  const position = trailing ? "end" : "front";
  console.log(`Added group at ${position}: ${jobs.length} job(s) (strategy: ${strategy})`);
  for (const job of jobs) {
    console.log(`  - ${job}`);
  }
  console.log(`Queue now has ${data.groups.length} group(s).`);
}

main();
