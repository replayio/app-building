/**
 * add-trailing-job: Adds a job to the END of the queue.
 *
 * Usage: npx tsx /repo/scripts/add-trailing-job.ts --strategy <path> --description <text>
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const JOBS_FILE = resolve("/repo/jobs/jobs.json");

interface Job {
  strategy: string;
  description: string;
  timestamp: string;
}

function parseArgs(): { strategy: string; description: string } {
  const args = process.argv.slice(2);
  let strategy = "";
  let description = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--strategy" && i + 1 < args.length) {
      strategy = args[i + 1];
      i++;
    } else if (args[i] === "--description" && i + 1 < args.length) {
      description = args[i + 1];
      i++;
    }
  }
  if (!strategy || !description) {
    console.error('Usage: add-trailing-job --strategy "<path>" --description "<text>"');
    process.exit(1);
  }
  return { strategy, description };
}

function readJobs(): Job[] {
  if (!existsSync(JOBS_FILE)) return [];
  const content = readFileSync(JOBS_FILE, "utf-8").trim();
  if (!content) return [];
  return JSON.parse(content);
}

function writeJobs(jobs: Job[]): void {
  mkdirSync(resolve("/repo/jobs"), { recursive: true });
  writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2) + "\n");
}

function main() {
  const { strategy, description } = parseArgs();
  const jobs = readJobs();
  const newJob: Job = { strategy, description, timestamp: new Date().toISOString() };
  jobs.push(newJob);
  writeJobs(jobs);
  console.log(`Added job at end: "${description}" (strategy: ${strategy})`);
  console.log(`Queue now has ${jobs.length} job${jobs.length === 1 ? "" : "s"}.`);
}

main();
