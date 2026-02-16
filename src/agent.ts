import { createInterface, Interface } from "readline";
import { Command } from "commander";
import {
  spawnContainer,
  startInteractiveContainer,
  execInContainer,
  stopContainer,
} from "./container";
import { formatEvent } from "./format";

function askQuestion(rl: Interface): Promise<string | null> {
  return new Promise((resolve) => {
    rl.question("> ", resolve);
    rl.once("close", () => resolve(null));
  });
}

async function runInteractive(): Promise<void> {
  const { containerName, mcpConfig } = startInteractiveContainer();
  console.log(`Container started: ${containerName}`);

  let messagesSent = 0;

  process.on("SIGINT", () => {
    stopContainer(containerName);
    process.exit(0);
  });

  try {
    while (true) {
      // Create a fresh readline for each prompt
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      const input = await askQuestion(rl);
      rl.close();

      if (input === null) break;
      if (!input.trim()) continue;

      console.log("...");

      const claudeArgs: string[] = [];
      if (messagesSent > 0) {
        claudeArgs.push("-c");
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
    .argument("[prompt]", "prompt to pass to claude (omit for interactive mode)")
    .option("-n, --max-iterations <n>", "max iterations for detached mode", parseInt)
    .parse();

  const promptArg = program.args[0] || null;
  const opts = program.opts();

  if (promptArg) {
    await spawnContainer(promptArg, { maxIterations: opts.maxIterations });
  } else {
    await runInteractive();
  }
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
