import { Command } from "commander";
import { startContainer, stopContainer, readAgentState } from "./container";
import { getLocalRemoteUrl, getLocalBranch } from "./git";
import { httpGet, httpPost } from "./http-client";
import { formatEvent } from "./format";

// --- Input helpers ---

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

      // Ctrl+C or Ctrl+D -> EOF
      if (data.length === 1 && (data[0] === 0x03 || data[0] === 0x04)) {
        process.stdout.write("\n");
        finish(null);
        return;
      }

      // Enter -> submit
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

      // Regular input or paste
      const normalized = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      buffer += normalized;
      process.stdout.write(normalized);
    };

    process.stdin.on("data", onData);
  });
}

// --- Event polling ---

async function pollEvents(
  baseUrl: string,
  startOffset: number,
  signal: AbortSignal,
): Promise<number> {
  let offset = startOffset;

  while (!signal.aborted) {
    try {
      const data = await httpGet(`${baseUrl}/events?offset=${offset}`);
      for (const line of data.items) {
        try {
          const event = JSON.parse(line);
          const formatted = formatEvent(event);
          if (formatted) console.log(formatted);
        } catch {
          // not JSON, skip
        }
      }
      offset = data.nextOffset;
    } catch {
      // Server may be busy, retry
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  return offset;
}

// --- Wait for message to complete ---

async function waitForMessage(
  baseUrl: string,
  messageId: string,
  signal: AbortSignal,
): Promise<void> {
  while (!signal.aborted) {
    try {
      const data = await httpGet(`${baseUrl}/message/${messageId}`);
      if (data.status === "done" || data.status === "error") {
        if (data.error) {
          console.error(`Error: ${data.error}`);
        }
        return;
      }
    } catch {
      // Retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

// --- Interactive mode ---

async function runInteractive(opts: {
  repo: string;
  branch: string;
  pushBranch: string;
}): Promise<void> {
  const { containerName, baseUrl } = await startContainer({
    repoUrl: opts.repo,
    cloneBranch: opts.branch,
    pushBranch: opts.pushBranch,
  });

  console.log(`Container: ${containerName}`);
  console.log(`Server: ${baseUrl}`);

  process.on("SIGINT", () => {
    stopContainer(containerName);
    process.exit(0);
  });

  let eventOffset = 0;

  try {
    while (true) {
      const input = await readInput();
      if (input === null) break;
      if (!input.trim()) continue;

      console.log("...");

      // Send message
      const { id } = await httpPost(`${baseUrl}/message`, { prompt: input });

      // Poll events in background while waiting
      const abortController = new AbortController();

      // Listen for ESC to interrupt
      let interrupted = false;
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
      }
      process.stdin.resume();
      const onKey = (data: Buffer) => {
        if (data[0] === 0x1b) {
          interrupted = true;
          httpPost(`${baseUrl}/interrupt`).catch(() => {});
          console.log("\nInterrupted.");
        }
      };
      process.stdin.on("data", onKey);

      // Poll events and wait for completion concurrently
      const eventPoll = pollEvents(baseUrl, eventOffset, abortController.signal);
      await waitForMessage(baseUrl, id, abortController.signal);

      // Stop event polling and capture final offset
      abortController.abort();
      eventOffset = await eventPoll.catch(() => eventOffset);

      // Tear down ESC listener
      process.stdin.removeListener("data", onKey);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
    }
  } finally {
    // Send detach so container finishes any remaining work and exits
    try {
      await httpPost(`${baseUrl}/detach`);
      console.log("Detached from container. It will exit when work completes.");
    } catch {
      stopContainer(containerName);
    }
  }
}

// --- Detached mode ---

async function runDetached(opts: {
  repo: string;
  branch: string;
  pushBranch: string;
  prompt?: string;
}): Promise<void> {
  const { containerName, baseUrl } = await startContainer({
    repoUrl: opts.repo,
    cloneBranch: opts.branch,
    pushBranch: opts.pushBranch,
  });

  console.log(`Container: ${containerName}`);
  console.log(`Server: ${baseUrl}`);

  // Optionally send an initial message
  if (opts.prompt) {
    const { id } = await httpPost(`${baseUrl}/message`, { prompt: opts.prompt });
    console.log(`Message queued: ${id}`);
  }

  // Detach — container will process message + job groups, then exit
  await httpPost(`${baseUrl}/detach`);
  console.log("Detached. Container will exit when all work is complete.");
  console.log(`Monitor: npm run status`);
  console.log(`Stop: npm run stop`);
}

// --- Main ---

async function main(): Promise<void> {
  const program = new Command();
  program
    .option("-i, --interactive", "interactive mode")
    .option("-p, --prompt <text>", "handle a prompt before consuming jobs")
    .option("--repo <url>", "git repo URL to clone")
    .option("--branch <name>", "branch to clone")
    .option("--push-branch <name>", "branch to push to")
    .allowUnknownOption(false)
    .allowExcessArguments(false)
    .parse();

  const opts = program.opts();

  const repo = opts.repo ?? process.env.REPO_URL ?? getLocalRemoteUrl();
  const branch = opts.branch ?? process.env.CLONE_BRANCH ?? getLocalBranch();
  const pushBranch = opts.pushBranch ?? branch;

  if (opts.interactive) {
    await runInteractive({ repo, branch, pushBranch });
  } else {
    await runDetached({ repo, branch, pushBranch, prompt: opts.prompt });
  }
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
