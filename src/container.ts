import { execFileSync, spawn } from "child_process";
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { resolve } from "path";
import { remoteBuildAndPush, createApp, createMachine, waitForMachine, destroyMachine, listMachines } from "./fly";
import { logContainer, markStopped } from "./container-registry";

const IMAGE_NAME = "app-building";
const CONTAINER_PORT = 3000;
const STATE_FILE = resolve(__dirname, "..", ".agent-state.json");

export interface AgentState {
  type: "local" | "remote";
  containerName: string;
  port: number;
  baseUrl: string;
  flyApp?: string;
  flyMachineId?: string;
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

export function loadDotEnv(projectRoot: string): Record<string, string> {
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
    .filter((line) => line && !line.startsWith("#") && !line.includes("# optional"))
    .map((line) => line.split("=")[0].trim())
    .filter((key) => key.length > 0);
}

function findFreePort(): number {
  let port = 3100;
  try {
    // With --network host, docker doesn't track port mappings.
    // Check actual listening ports on the host via ss.
    const out = execFileSync("ss", ["-tlnH"], {
      encoding: "utf-8",
      timeout: 5000,
    });
    const usedPorts = new Set<number>();
    for (const match of out.matchAll(/:(\d+)\s/g)) {
      usedPorts.add(parseInt(match[1], 10));
    }
    while (usedPorts.has(port)) port++;
  } catch {
    // ss not available, just use default
  }
  return port;
}

export function writeAgentState(state: AgentState): void {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
  logContainer(state);
}

export function readAgentState(): AgentState | null {
  if (!existsSync(STATE_FILE)) return null;
  try {
    const state = JSON.parse(readFileSync(STATE_FILE, "utf-8"));
    if (!state.type) state.type = "local";
    return state;
  } catch {
    return null;
  }
}

export function clearAgentState(containerName?: string): void {
  if (containerName) {
    markStopped(containerName);
  } else {
    // Try to read the current state to get the container name before clearing
    const state = readAgentState();
    if (state) {
      markStopped(state.containerName);
    }
  }
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

function buildContainerEnv(
  opts: StartContainerOptions,
  envVars: Record<string, string>,
  extra: Record<string, string> = {},
): Record<string, string> {
  const env: Record<string, string> = {
    REPO_URL: opts.repoUrl,
    CLONE_BRANCH: opts.cloneBranch,
    PUSH_BRANCH: opts.pushBranch,
    GIT_AUTHOR_NAME: "App Builder",
    GIT_AUTHOR_EMAIL: "app-builder@localhost",
    GIT_COMMITTER_NAME: "App Builder",
    GIT_COMMITTER_EMAIL: "app-builder@localhost",
    PLAYWRIGHT_BROWSERS_PATH: "/opt/playwright",
    ...envVars,
    ...extra,
  };
  if (process.env.DEBUG) {
    env.DEBUG = process.env.DEBUG;
  }
  return env;
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

  const containerEnv = buildContainerEnv(opts, envVars, {
    PORT: String(hostPort),
    CONTAINER_NAME: containerName,
  });

  // Build docker run args
  const args: string[] = ["run", "-d", "--rm", "--name", containerName];

  // --network host: container shares host network stack (no -p needed)
  args.push("--network", "host");

  for (const [k, v] of Object.entries(containerEnv)) {
    args.push("--env", `${k}=${v}`);
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
    // Check if the container is still alive (--rm removes it on exit)
    try {
      execFileSync(
        "docker",
        ["inspect", "--format", "{{.State.Running}}", containerName],
        { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], timeout: 5000 },
      );
    } catch {
      // Container is gone — grab logs from docker if possible, otherwise just report
      let logs = "";
      try {
        logs = execFileSync("docker", ["logs", "--tail", "30", containerName], {
          encoding: "utf-8",
          timeout: 5000,
        });
      } catch {
        // Container already removed (--rm)
      }
      throw new Error(
        `Container exited during startup.${logs ? `\n\n--- container logs ---\n${logs}` : " (no logs available, container was removed)"}`,
      );
    }

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
    throw new Error("Container did not become ready within timeout");
  }

  const agentState: AgentState = { type: "local", containerName, port: hostPort, baseUrl };
  writeAgentState(agentState);

  return agentState;
}

export async function startRemoteContainer(
  opts: StartContainerOptions,
): Promise<AgentState> {
  const projectRoot = resolve(__dirname, "..");

  const envVars = loadDotEnv(projectRoot);

  const flyToken = envVars.FLY_API_TOKEN ?? process.env.FLY_API_TOKEN;
  let flyApp = envVars.FLY_APP_NAME ?? process.env.FLY_APP_NAME;

  if (!flyToken) throw new Error("FLY_API_TOKEN is required for --remote");

  if (!flyApp) {
    const randomId = Math.random().toString(36).slice(2, 8);
    flyApp = `app-building-${randomId}`;
    console.log(`No FLY_APP_NAME set. Creating Fly app "${flyApp}"...`);
    await createApp(flyToken, flyApp);
    const envPath = resolve(projectRoot, ".env");
    appendFileSync(envPath, `\nFLY_APP_NAME=${flyApp}\n`);
    console.log(`Fly app created and saved to .env as FLY_APP_NAME=${flyApp}`);
  }

  // Build remotely on Fly and push to registry (no local Docker needed)
  console.log("Building and pushing image via Fly remote builder...");
  const imageRef = remoteBuildAndPush(flyApp, flyToken);

  // Build env vars for the machine
  const containerEnv = buildContainerEnv(opts, envVars, {
    PORT: "3000",
  });
  // Remove Fly-specific vars from container env (not needed inside)
  delete containerEnv.FLY_API_TOKEN;
  delete containerEnv.FLY_APP_NAME;

  // Destroy any stale machines from previous runs
  const existing = await listMachines(flyApp, flyToken);
  for (const m of existing) {
    console.log(`Destroying stale machine ${m.id} (${m.name})...`);
    await destroyMachine(flyApp, flyToken, m.id).catch(() => {});
  }

  const uniqueId = Math.random().toString(36).slice(2, 8);
  const machineName = `app-building-${uniqueId}`;

  // Retry machine creation — the registry tag may take a moment to propagate
  console.log("Creating Fly machine...");
  let machineId = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      machineId = await createMachine(flyApp, flyToken, imageRef, containerEnv, machineName);
      break;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("MANIFEST_UNKNOWN") && attempt < 4) {
        console.log("Image not yet available in registry, retrying in 5s...");
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      throw err;
    }
  }
  console.log(`Machine created: ${machineId}`);

  console.log("Waiting for machine to start...");
  await waitForMachine(flyApp, flyToken, machineId);
  console.log("Machine started.");

  // Poll the public URL until the HTTP server is ready
  const baseUrl = `https://${flyApp}.fly.dev`;
  const maxWait = 180000;
  const interval = 2000;
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
    // Clean up machine if we can't reach it
    console.log("Timed out waiting for machine, destroying...");
    await destroyMachine(flyApp, flyToken, machineId).catch(() => {});
    throw new Error("Remote container did not become ready within timeout");
  }

  const agentState: AgentState = {
    type: "remote",
    containerName: machineName,
    port: 443,
    baseUrl,
    flyApp,
    flyMachineId: machineId,
  };
  writeAgentState(agentState);

  return agentState;
}

export async function stopRemoteContainer(state: AgentState): Promise<void> {
  if (!state.flyApp || !state.flyMachineId) {
    throw new Error("Missing flyApp or flyMachineId in agent state");
  }

  const projectRoot = resolve(__dirname, "..");
  const envVars = loadDotEnv(projectRoot);
  const flyToken = envVars.FLY_API_TOKEN ?? process.env.FLY_API_TOKEN;

  if (!flyToken) throw new Error("FLY_API_TOKEN is required to stop remote container");

  console.log(`Destroying Fly machine ${state.flyMachineId}...`);
  await destroyMachine(state.flyApp, flyToken, state.flyMachineId);
  console.log("Machine destroyed.");
  clearAgentState();
}

export function stopContainer(containerName: string): void {
  try {
    execFileSync("docker", ["stop", containerName], { stdio: "ignore", timeout: 30000 });
  } catch {
    // Container may already be stopped
  }
  clearAgentState(containerName);
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
