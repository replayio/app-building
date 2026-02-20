import { Command } from "commander";
import { resolve } from "path";
import { readFileSync, existsSync } from "fs";
import {
  spawnContainer,
  startInteractiveContainer,
  execInContainer,
  stopContainer,
} from "./container";
import { formatEvent } from "./format";
import { createLogFile } from "./log";

const LOGS_DIR = resolve(__dirname, "..", "logs");
const JOBS_FILE = resolve(__dirname, "..", "jobs", "jobs.json");

// Reads input using raw mode. Enter submits, pasted text (which arrives
// as a single chunk with embedded newlines) is preserved as multi-line.
function readInput(): Promise<string | null> {
  return new Promise((resolve) => {
    let buffer = "";
    let resolved = false;

    const finish = (result: string | null) => {
      if (resolved) return;
      resolved = true;
      process.stdin.removeListener("data", onData);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
      resolve(result);
    };

    process.stdout.write("> ");

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();

    const onData = (data: Buffer) => {
      const str = data.toString("utf-8");

      // Ctrl+C or Ctrl+D → EOF
      if (data.length === 1 && (data[0] === 0x03 || data[0] === 0x04)) {
        process.stdout.write("\n");
        finish(null);
        return;
      }

      // A lone Enter keypress → submit
      if (str === "\r" || str === "\n" || str === "\r\n") {
        process.stdout.write("\n");
        finish(buffer);
        return;
      }

      // Backspace
      if (data.length === 1 && (data[0] === 0x7f || data[0] === 0x08)) {
        if (buffer.length > 0) {
          buffer = buffer.slice(0, -1);
          process.stdout.write("\b \b");
        }
        return;
      }

      // Ignore escape sequences (arrows, etc.)
      if (data[0] === 0x1b) {
        return;
      }

      // Regular input or paste — normalize newlines, append and echo
      const normalized = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      buffer += normalized;
      process.stdout.write(normalized);
    };

    process.stdin.on("data", onData);
  });
}

function countPendingGroups(): number {
  if (!existsSync(JOBS_FILE)) return 0;
  try {
    const content = readFileSync(JOBS_FILE, "utf-8").trim();
    if (!content) return 0;
    const data = JSON.parse(content);
    return data.groups?.length ?? 0;
  } catch {
    return 0;
  }
}

async function runInteractive(sessionId?: string): Promise<void> {
  const { containerName, mcpConfig } = startInteractiveContainer();
  console.log(`Container started: ${containerName}`);
  const log = createLogFile(LOGS_DIR);
  log(`Container: ${containerName}`);
  log(`Mode: interactive`);

  let messagesSent = 0;

  process.on("SIGINT", () => {
    stopContainer(containerName);
    process.exit(0);
  });

  try {
    while (true) {
      const input = await readInput();
      if (input === null) break;
      if (!input.trim()) continue;

      console.log("...");

      const claudeArgs: string[] = [];
      if (messagesSent > 0) {
        claudeArgs.push("-c");
      } else if (sessionId) {
        claudeArgs.push("--resume", sessionId);
      }
      claudeArgs.push("-p", input);
      claudeArgs.push("--model", "claude-opus-4-6");
      claudeArgs.push("--output-format", "stream-json");
      claudeArgs.push("--verbose");
      claudeArgs.push("--dangerously-skip-permissions");
      claudeArgs.push("--mcp-config", mcpConfig);

      try {
        const child = execInContainer(containerName, claudeArgs);

        // Listen for ESC in raw mode to interrupt claude
        let interrupted = false;
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(true);
        }
        process.stdin.resume();
        const onKey = (data: Buffer) => {
          if (data[0] === 0x1b) {
            interrupted = true;
            child.kill("SIGINT");
            console.log("\nInterrupted.");
          }
        };
        process.stdin.on("data", onKey);

        let buffer = "";
        child.stdout!.on("data", (data: Buffer) => {
          buffer += data.toString();
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            log(line);
            try {
              const event = JSON.parse(line);
              const formatted = formatEvent(event);
              if (formatted) console.log(formatted);
            } catch {
              console.log(line);
            }
          }
        });

        await new Promise<void>((resolve, reject) => {
          child.on("close", (code) => {
            // Tear down raw mode ESC listener
            process.stdin.removeListener("data", onKey);
            if (process.stdin.isTTY) {
              process.stdin.setRawMode(false);
            }
            process.stdin.pause();

            if (buffer.trim()) {
              log(buffer);
              try {
                const event = JSON.parse(buffer);
                const formatted = formatEvent(event);
                if (formatted) console.log(formatted);
              } catch {
                console.log(buffer);
              }
            }
            if (interrupted || code === 0) resolve();
            else reject(new Error(`claude exited with code ${code}`));
          });
          child.on("error", reject);
        });
      } catch (e) {
        console.error(e instanceof Error ? e.message : e);
      }
      messagesSent++;
    }
  } finally {
    stopContainer(containerName);
  }
}

async function main(): Promise<void> {
  const program = new Command();
  program
    .option("-i, --interactive", "interactive mode")
    .option("-p, --prompt <text>", "handle a prompt, then consume pending job groups")
    .option("-n, --max-iterations <n>", "max iterations", parseInt)
    .option("-r, --resume <id>", "resume a claude session (interactive mode)")
    .allowUnknownOption(false)
    .allowExcessArguments(false)
    .parse();

  const opts = program.opts();

  if (opts.interactive) {
    await runInteractive(opts.resume);
  } else {
    // Default mode or -p mode: consume pending job groups
    if (!opts.prompt) {
      const pending = countPendingGroups();
      if (pending === 0) {
        console.error("No pending job groups in jobs/jobs.json");
        process.exit(1);
      }
      console.log(`${pending} pending job group(s)`);
    }
    await spawnContainer({ prompt: opts.prompt, maxIterations: opts.maxIterations });
  }
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
