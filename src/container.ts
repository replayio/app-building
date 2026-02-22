import { execFileSync, spawn } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const IMAGE_NAME = "app-building";
const CONTAINER_PORT = 3000;
const STATE_FILE = resolve(__dirname, "..", ".agent-state.json");

export interface AgentState {
  containerName: string;
  port: number;
  baseUrl: string;
}

export function buildImage(): void {
  const contextDir = resolve(__dirname, "..");
  console.log("Building Docker image...");
  execFileSync("docker", ["build", "--network", "host", "-t", IMAGE_NAME, contextDir], {
    stdio: "inherit",
    timeout: 600000,
  });
  console.log("Docker image built successfully.");
}

function ensureImageExists(): void {
  try {
    execFileSync("docker", ["image", "inspect", IMAGE_NAME], {
      stdio: "ignore",
    });
  } catch {
    buildImage();
  }
}

function loadDotEnv(projectRoot: string): Record<string, string> {
  const envPath = resolve(projectRoot, ".env");
  if (!existsSync(envPath)) {
    return {};
  }
  const content = readFileSync(envPath, "utf-8");
  const vars: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function loadRequiredEnvVars(projectRoot: string): string[] {
  const examplePath = resolve(projectRoot, ".env.example");
  if (!existsSync(examplePath)) return [];
  const content = readFileSync(examplePath, "utf-8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0].trim())
    .filter((key) => key.length > 0);
}

function findFreePort(): number {
  // Use a simple incrementing scheme based on existing containers
  // Start from 3100 to avoid conflicts
  let port = 3100;
  try {
    const out = execFileSync("docker", ["ps", "--format", "{{.Ports}}"], {
      encoding: "utf-8",
      timeout: 5000,
    });
    const usedPorts = new Set<number>();
    for (const match of out.matchAll(/0\.0\.0\.0:(\d+)->/g)) {
      usedPorts.add(parseInt(match[1], 10));
    }
    while (usedPorts.has(port)) port++;
  } catch {
    // If docker ps fails, just use default
  }
  return port;
}

export function writeAgentState(state: AgentState): void {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
}

export function readAgentState(): AgentState | null {
  if (!existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return null;
  }
}

export function clearAgentState(): void {
  try {
    const { unlinkSync } = require("fs");
    unlinkSync(STATE_FILE);
  } catch {
    // Already gone
  }
}

export interface StartContainerOptions {
  repoUrl: string;
  cloneBranch: string;
  pushBranch: string;
}

export async function startContainer(
  opts: StartContainerOptions,
): Promise<AgentState> {
  const projectRoot = resolve(__dirname, "..");

  ensureImageExists();

  const envVars = loadDotEnv(projectRoot);

  // Check required env vars from .env.example
  const requiredVars = loadRequiredEnvVars(projectRoot);
  const missing = requiredVars.filter((v) => !envVars[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars in .env: ${missing.join(", ")}`);
  }

  const uniqueId = Math.random().toString(36).slice(2, 8);
  const containerName = `app-building-${uniqueId}`;
  const hostPort = findFreePort();

  // Build docker run args
  const args: string[] = ["run", "-d", "--rm", "--name", containerName];

  // Port mapping: host -> container
  args.push("-p", `${hostPort}:${CONTAINER_PORT}`);

  // Network for outbound access
  args.push("--network", "host");

  // Git env vars for repo clone
  args.push("--env", `REPO_URL=${opts.repoUrl}`);
  args.push("--env", `CLONE_BRANCH=${opts.cloneBranch}`);
  args.push("--env", `PUSH_BRANCH=${opts.pushBranch}`);

  // When using --network host, the container uses the host's network stack,
  // so we need to tell the server to use a specific port
  args.push("--env", `PORT=${hostPort}`);

  // Container name for logging
  args.push("--env", `CONTAINER_NAME=${containerName}`);

  // Writable HOME for claude -c
  args.push("--env", "HOME=/root");

  // Git identity
  args.push("--env", "GIT_AUTHOR_NAME=App Builder");
  args.push("--env", "GIT_AUTHOR_EMAIL=app-builder@localhost");
  args.push("--env", "GIT_COMMITTER_NAME=App Builder");
  args.push("--env", "GIT_COMMITTER_EMAIL=app-builder@localhost");

  // Playwright
  args.push("--env", "PLAYWRIGHT_BROWSERS_PATH=/opt/playwright");

  // Pass all .env vars (includes API keys, tokens, etc.)
  for (const [k, v] of Object.entries(envVars)) {
    args.push("--env", `${k}=${v}`);
  }

  // Forward DEBUG flag
  if (process.env.DEBUG) {
    args.push("--env", `DEBUG=${process.env.DEBUG}`);
  }

  // Image name — CMD is baked in (server.ts)
  args.push(IMAGE_NAME);

  const containerId = execFileSync("docker", args, {
    encoding: "utf-8",
    timeout: 30000,
  }).trim();

  console.log(`Container started: ${containerId.slice(0, 12)} (${containerName})`);

  // Wait for the HTTP server to become ready
  const baseUrl = `http://127.0.0.1:${hostPort}`;
  const maxWait = 120000; // clone can take a while
  const interval = 1000;
  const start = Date.now();
  let ready = false;

  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(`${baseUrl}/status`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      // Not ready yet
    }
    await new Promise((r) => setTimeout(r, interval));
  }

  if (!ready) {
    // Check if container is still running
    try {
      const status = execFileSync(
        "docker",
        ["inspect", "--format", "{{.State.Running}}", containerName],
        { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], timeout: 5000 },
      ).trim();
      if (status !== "true") {
        const logs = execFileSync("docker", ["logs", "--tail", "20", containerName], {
          encoding: "utf-8",
          timeout: 5000,
        });
        throw new Error(`Container exited before becoming ready:\n${logs}`);
      }
    } catch (e: any) {
      if (e.message.includes("Container exited")) throw e;
    }
    throw new Error("Container did not become ready within timeout");
  }

  const agentState: AgentState = { containerName, port: hostPort, baseUrl };
  writeAgentState(agentState);

  return agentState;
}

export function stopContainer(containerName: string): void {
  try {
    execFileSync("docker", ["stop", containerName], { stdio: "ignore", timeout: 30000 });
  } catch {
    // Container may already be stopped
  }
  clearAgentState();
}

export function spawnTestContainer(): Promise<void> {
  const projectRoot = resolve(__dirname, "..");
  ensureImageExists();

  const envVars = loadDotEnv(projectRoot);
  const uniqueId = Math.random().toString(36).slice(2, 8);
  const containerName = `app-building-test-${uniqueId}`;

  const args: string[] = ["run", "-it", "--rm", "--name", containerName];
  args.push("-v", `${projectRoot}:/repo`);
  args.push("-w", "/repo");
  args.push("--network", "host");
  args.push("--user", `${process.getuid!()}:${process.getgid!()}`);
  args.push("--env", "HOME=/repo/.agent-home");
  args.push("--env", "PLAYWRIGHT_BROWSERS_PATH=/opt/playwright");
  for (const [k, v] of Object.entries(envVars)) {
    args.push("--env", `${k}=${v}`);
  }
  args.push(IMAGE_NAME, "bash");

  return new Promise((resolve, reject) => {
    const child = spawn("docker", args, { stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Container exited with code ${code}`));
    });
    child.on("error", reject);
  });
}
