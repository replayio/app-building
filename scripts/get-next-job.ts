/**
 * get-next-job: Returns instructions for the agent's next action.
 *
 * Usage: npx tsx /repo/scripts/get-next-job.ts [--last-strategy <path>]
 *
 * Checks for unreviewed logs first, then reads the job queue.
 * Handles strategy switching: if the next job uses a different strategy
 * than --last-strategy, outputs commit-and-exit instructions without
 * dequeuing the job.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { resolve, join } from "path";

const REPO_ROOT = "/repo";
const JOBS_FILE = resolve(REPO_ROOT, "jobs/jobs.json");
const LOGS_DIR = resolve(REPO_ROOT, "logs");
const REVIEWED_DIR = resolve(LOGS_DIR, "reviewed");

interface Job {
  strategy: string;
  description: string;
  timestamp: string;
}

function parseArgs(): { lastStrategy: string | null } {
  const args = process.argv.slice(2);
  let lastStrategy: string | null = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--last-strategy" && i + 1 < args.length) {
      lastStrategy = args[i + 1];
      i++;
    }
  }
  return { lastStrategy };
}

function getUnreviewedLogs(): string[] {
  if (!existsSync(LOGS_DIR)) return [];
  const files = readdirSync(LOGS_DIR);
  return files.filter(
    (f) =>
      (f.startsWith("worker-") || f.startsWith("iteration-")) &&
      f.endsWith(".log") &&
      !f.includes("-current")
  );
}

function readJobs(): Job[] {
  if (!existsSync(JOBS_FILE)) return [];
  const content = readFileSync(JOBS_FILE, "utf-8").trim();
  if (!content) return [];
  return JSON.parse(content);
}

function writeJobs(jobs: Job[]): void {
  mkdirSync(resolve(REPO_ROOT, "jobs"), { recursive: true });
  writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2) + "\n");
}

function main() {
  const { lastStrategy } = parseArgs();

  // Step 1: Check for unreviewed logs
  const unreviewedLogs = getUnreviewedLogs();
  if (unreviewedLogs.length > 0) {
    const logPaths = unreviewedLogs.map((f) => join(LOGS_DIR, f)).join("\n  ");
    console.log(
      `There are unreviewed iteration logs that need to be processed first.\n` +
        `\n` +
        `Unreviewed logs:\n  ${logPaths}\n` +
        `\n` +
        `Read /repo/strategies/jobs/reviewChanges.md and follow the instructions to review these logs.\n` +
        `After reviewing, commit your changes and exit.`
    );
    return;
  }

  // Step 2: Read job queue
  const jobs = readJobs();
  if (jobs.length === 0) {
    console.log("No jobs remaining.\n<DONE/>");
    return;
  }

  // Step 3: Check for strategy switch
  const nextJob = jobs[0];
  if (lastStrategy && nextJob.strategy !== lastStrategy) {
    console.log(
      `The next job uses a different strategy than the previous one.\n` +
        `Previous: ${lastStrategy}\n` +
        `Next: ${nextJob.strategy}\n` +
        `\n` +
        `Commit any uncommitted changes and exit immediately so the next iteration starts fresh.`
    );
    return;
  }

  // Step 4: Dequeue and output instructions
  jobs.shift();
  writeJobs(jobs);

  console.log(
    `Read strategy file: ${nextJob.strategy}\n` +
      `\n` +
      `Job description: ${nextJob.description}\n` +
      `\n` +
      `When you need to add sub-jobs, use these commands:\n` +
      `- Add to front of queue: npx tsx /repo/scripts/add-next-job.ts --strategy "<path>" --description "<text>"\n` +
      `- Add to end of queue: npx tsx /repo/scripts/add-trailing-job.ts --strategy "<path>" --description "<text>"\n` +
      `\n` +
      `After completing this job, commit your changes and exit.`
  );
}

main();
