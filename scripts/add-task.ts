/**
 * add-task: Adds a task to the queue.
 *
 * Usage: npx tsx /repo/scripts/add-task.ts --strategy <path> --subtask "desc1" --subtask "desc2" [--trailing]
 *
 * By default, adds to the FRONT of the queue (next to be processed).
 * With --trailing, adds to the END of the queue.
 *
 * All --subtask values become the subtasks array within the task. Subtasks execute in the
 * order listed.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const TASKS_FILE = resolve("/repo/tasks/tasks.json");

interface Task {
  strategy: string;
  subtasks: string[];
  timestamp: string;
}

interface TasksFile {
  tasks: Task[];
}

function parseArgs(): { strategy: string; subtasks: string[]; trailing: boolean } {
  const args = process.argv.slice(2);
  let strategy = "";
  let trailing = false;
  const subtasks: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--strategy" && i + 1 < args.length) {
      strategy = args[i + 1];
      i++;
    } else if (args[i] === "--subtask" && i + 1 < args.length) {
      subtasks.push(args[i + 1]);
      i++;
    } else if (args[i] === "--trailing") {
      trailing = true;
    }
  }
  if (!strategy || subtasks.length === 0) {
    console.error('Usage: add-task --strategy "<path>" --subtask "desc1" [--subtask "desc2" ...] [--trailing]');
    process.exit(1);
  }
  return { strategy, subtasks, trailing };
}

function readTasksFile(): TasksFile {
  if (!existsSync(TASKS_FILE)) return { tasks: [] };
  const content = readFileSync(TASKS_FILE, "utf-8").trim();
  if (!content) return { tasks: [] };
  return JSON.parse(content);
}

function writeTasksFile(data: TasksFile): void {
  mkdirSync(resolve("/repo/tasks"), { recursive: true });
  writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2) + "\n");
}

function main() {
  const { strategy, subtasks, trailing } = parseArgs();
  const data = readTasksFile();
  const newTask: Task = { strategy, subtasks, timestamp: new Date().toISOString() };

  if (trailing) {
    data.tasks.push(newTask);
  } else {
    data.tasks.unshift(newTask);
  }

  writeTasksFile(data);
  const position = trailing ? "end" : "front";
  console.log(`Added task at ${position}: ${subtasks.length} subtask(s) (strategy: ${strategy})`);
  for (const subtask of subtasks) {
    console.log(`  - ${subtask}`);
  }
  console.log(`Queue now has ${data.tasks.length} task(s).`);
}

main();
