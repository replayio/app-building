import { createServer, IncomingMessage, ServerResponse } from "http";
import { resolve } from "path";
import { cloneRepo, checkoutPushBranch, commitAndPush, getRevision, toTokenUrl } from "./git";
import {
  processMessage,
  processJobGroups,
  currentClaudeProcess,
  getPendingGroupCount,
  type ClaudeResult,
  type EventCallback,
} from "./worker";
import { createBufferedLogger } from "./log";

// --- Configuration from env ---

const PORT = parseInt(process.env.PORT ?? "3000", 10);
const REPO_URL = process.env.REPO_URL ?? "";
const CLONE_BRANCH = process.env.CLONE_BRANCH ?? "main";
const PUSH_BRANCH = process.env.PUSH_BRANCH ?? CLONE_BRANCH;
const CONTAINER_NAME = process.env.CONTAINER_NAME ?? "agent";
const REPO_DIR = "/repo";
const LOGS_DIR = resolve(REPO_DIR, "logs");

// Set CONTAINER_MODE so log.ts loads secrets from env vars
process.env.CONTAINER_MODE = "1";

// --- OffsetBuffer ---

class OffsetBuffer<T> {
  private items: T[] = [];

  append(item: T): void {
    this.items.push(item);
  }

  since(offset: number): { items: T[]; nextOffset: number } {
    const start = Math.max(0, Math.min(offset, this.items.length));
    return {
      items: this.items.slice(start),
      nextOffset: this.items.length,
    };
  }

  get length(): number {
    return this.items.length;
  }
}

// --- Message queue ---

interface MessageEntry {
  id: string;
  prompt: string;
  status: "queued" | "processing" | "done" | "error";
  result?: ClaudeResult;
  error?: string;
}

const messageQueue: string[] = [];
const messages = new Map<string, MessageEntry>();
const eventBuffer = new OffsetBuffer<string>();
const logBuffer = new OffsetBuffer<string>();

let nextMessageId = 1;
let totalCost = 0;
let iteration = 0;
let groupsProcessed = 0;

// --- Container state ---

type ContainerState = "starting" | "idle" | "processing" | "stopping";
let state: ContainerState = "starting";
let detachRequested = false;
let stopRequested = false;

// Wake signal for processing loop
let wakeResolve: (() => void) | null = null;

function wake(): void {
  if (wakeResolve) {
    wakeResolve();
    wakeResolve = null;
  }
}

function waitForWake(): Promise<void> {
  return new Promise((resolve) => {
    wakeResolve = resolve;
  });
}

// --- Claude extra args ---

function buildExtraArgs(): string[] {
  const args: string[] = [];
  args.push("--model", "claude-opus-4-6");
  args.push("--dangerously-skip-permissions");

  // Build MCP config if replay key is available
  const replayKey = process.env.RECORD_REPLAY_API_KEY;
  if (replayKey) {
    const mcpConfig = JSON.stringify({
      mcpServers: {
        replay: { type: "http", url: "https://dispatch.replay.io/nut/mcp" },
      },
    });
    args.push("--mcp-config", mcpConfig);
  }

  return args;
}

// --- Logger (initialized after clone) ---

let log: ReturnType<typeof createBufferedLogger>;

const onEvent: EventCallback = (rawLine) => {
  eventBuffer.append(rawLine);
};

// --- HTTP helpers ---

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown): void {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(data);
}

function routeMatch(url: string, pattern: string): string | null {
  // pattern like "/message/:id" matches "/message/abc" returning "abc"
  const patternParts = pattern.split("/");
  const urlParts = url.split("?")[0].split("/");
  if (patternParts.length !== urlParts.length) return null;
  let param: string | null = null;
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      param = urlParts[i];
    } else if (patternParts[i] !== urlParts[i]) {
      return null;
    }
  }
  return param;
}

function getQuery(url: string, key: string): string | null {
  const qIdx = url.indexOf("?");
  if (qIdx === -1) return null;
  const params = new URLSearchParams(url.slice(qIdx));
  return params.get(key);
}

// --- Processing loop ---

async function processLoop(): Promise<void> {
  const extraArgs = buildExtraArgs();
  // Track the Claude session ID across interactive messages so context is preserved
  let interactiveSessionId: string | undefined;

  while (true) {
    if (stopRequested) break;

    // Check for queued messages
    if (messageQueue.length > 0) {
      state = "processing";
      const msgId = messageQueue.shift()!;
      const entry = messages.get(msgId)!;
      entry.status = "processing";
      iteration++;

      log(`=== Message ${msgId} (iteration ${iteration}) ===`);
      log(`Initial revision: ${getRevision(REPO_DIR)}`);

      try {
        const result = await processMessage(entry.prompt, extraArgs, log, onEvent, interactiveSessionId);
        entry.result = result;
        entry.status = "done";

        // Capture session ID for resuming subsequent messages
        if (result.session_id) {
          interactiveSessionId = result.session_id;
        }

        if (result.cost_usd != null) {
          totalCost += result.cost_usd;
          log(`Cost: $${result.cost_usd.toFixed(4)} (total: $${totalCost.toFixed(4)})`);
        }
      } catch (e: any) {
        entry.status = "error";
        entry.error = e.message;
        log(`Error: ${e.message}`);
      }

      // After each message, process all pending job groups
      if (!stopRequested) {
        const jobResult = await processJobGroups(
          extraArgs,
          log,
          onEvent,
          () => stopRequested,
          (label) => commitAndPush(label, PUSH_BRANCH, log, REPO_DIR),
        );
        groupsProcessed += jobResult.groupsProcessed;
        totalCost += jobResult.totalCost;
      }

      // Final commit and push after message + jobs
      const summary = entry.prompt.length > 72 ? entry.prompt.slice(0, 69) + "..." : entry.prompt;
      commitAndPush(`${CONTAINER_NAME} iteration ${iteration}: ${summary}`, PUSH_BRANCH, log, REPO_DIR);
      log(`Final revision: ${getRevision(REPO_DIR)}`);

      state = "idle";
      continue;
    }

    // Check for detach: exit when queue is empty and no pending groups
    if (detachRequested && messageQueue.length === 0 && getPendingGroupCount() === 0) {
      log("Detach requested and all work complete. Shutting down.");
      break;
    }

    // Wait for something to happen
    state = "idle";
    await waitForWake();
  }

  state = "stopping";
  log("Server shutting down.");
  process.exit(0);
}

// --- HTTP server ---

const server = createServer(async (req, res) => {
  const url = req.url ?? "/";
  const method = req.method ?? "GET";

  try {
    // POST /message
    if (method === "POST" && url === "/message") {
      const body = JSON.parse(await readBody(req));
      const prompt = body.prompt;
      if (!prompt || typeof prompt !== "string") {
        json(res, 400, { error: "prompt is required" });
        return;
      }
      const id = String(nextMessageId++);
      const entry: MessageEntry = { id, prompt, status: "queued" };
      messages.set(id, entry);
      messageQueue.push(id);
      wake();
      json(res, 200, { id });
      return;
    }

    // GET /message/:id
    const msgId = routeMatch(url, "/message/:id");
    if (method === "GET" && msgId !== null) {
      const entry = messages.get(msgId);
      if (!entry) {
        json(res, 404, { error: "message not found" });
        return;
      }
      json(res, 200, {
        id: entry.id,
        status: entry.status,
        result: entry.result ?? null,
        error: entry.error ?? null,
      });
      return;
    }

    // GET /events?offset=N
    if (method === "GET" && url.startsWith("/events")) {
      const offset = parseInt(getQuery(url, "offset") ?? "0", 10);
      const result = eventBuffer.since(offset);
      json(res, 200, { items: result.items, nextOffset: result.nextOffset });
      return;
    }

    // GET /logs?offset=N
    if (method === "GET" && url.startsWith("/logs")) {
      const offset = parseInt(getQuery(url, "offset") ?? "0", 10);
      const result = logBuffer.since(offset);
      json(res, 200, { items: result.items, nextOffset: result.nextOffset });
      return;
    }

    // POST /interrupt
    if (method === "POST" && url === "/interrupt") {
      if (currentClaudeProcess) {
        currentClaudeProcess.kill("SIGINT");
        json(res, 200, { interrupted: true });
      } else {
        json(res, 200, { interrupted: false, message: "no active process" });
      }
      return;
    }

    // POST /detach
    if (method === "POST" && url === "/detach") {
      detachRequested = true;
      wake();
      json(res, 200, { detaching: true });
      return;
    }

    // POST /stop
    if (method === "POST" && url === "/stop") {
      stopRequested = true;
      // Kill any running claude process
      if (currentClaudeProcess) {
        currentClaudeProcess.kill("SIGINT");
      }
      wake();
      json(res, 200, { stopping: true });
      // Give time for the response to flush, then exit
      setTimeout(() => process.exit(0), 500);
      return;
    }

    // GET /status
    if (method === "GET" && url === "/status") {
      json(res, 200, {
        state,
        queueLength: messageQueue.length,
        pendingGroups: getPendingGroupCount(),
        groupsProcessed,
        totalCost,
        iteration,
        detachRequested,
        revision: getRevision(REPO_DIR),
      });
      return;
    }

    json(res, 404, { error: "not found" });
  } catch (e: any) {
    json(res, 500, { error: e.message });
  }
});

// --- Startup ---

async function main(): Promise<void> {
  console.log("=== Container starting ===");

  // Clone repo
  if (!REPO_URL) {
    console.error("REPO_URL environment variable is required");
    process.exit(1);
  }

  const cloneUrl = toTokenUrl(REPO_URL, process.env.GITHUB_TOKEN);
  console.log(`Cloning ${REPO_URL} (branch: ${CLONE_BRANCH})...`);
  try {
    cloneRepo(cloneUrl, CLONE_BRANCH, REPO_DIR);
    console.log("Clone complete.");
  } catch (e: any) {
    console.error(`Fatal: clone failed: ${e.message}`);
    process.exit(1);
  }

  // Checkout push branch if different from clone branch
  if (PUSH_BRANCH !== CLONE_BRANCH) {
    console.log(`Checking out push branch: ${PUSH_BRANCH}`);
    try {
      checkoutPushBranch(PUSH_BRANCH, REPO_DIR);
    } catch (e: any) {
      console.error(`Warning: checkout push branch failed: ${e.message}`);
    }
  }

  // Now that /repo exists, initialize the logger
  log = createBufferedLogger(LOGS_DIR, (line) => {
    logBuffer.append(line);
  });

  log(`Revision: ${getRevision(REPO_DIR)}`);
  log(`Push branch: ${PUSH_BRANCH}`);

  // Change working directory to repo
  process.chdir(REPO_DIR);

  // Start HTTP server
  server.listen(PORT, () => {
    log(`HTTP server listening on port ${PORT}`);
    console.log(`Server listening on port ${PORT}`);
    state = "idle";
  });

  // Start processing loop
  processLoop();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
