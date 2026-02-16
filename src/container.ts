import { ChildProcess, execFileSync, spawn } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const IMAGE_NAME = "app-building";
const ReplayMCPServer = "https://dispatch.replay.io/nut/mcp";

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
    // Strip surrounding quotes
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

function buildMCPConfig(envVars: Record<string, string>): string {
  const mcpConfig: Record<string, any> = { mcpServers: {} };
  if (envVars.RECORD_REPLAY_API_KEY) {
    mcpConfig.mcpServers.replay = { type: "http", url: ReplayMCPServer };
  }
  return JSON.stringify(mcpConfig);
}

interface ContainerSetup {
  args: string[];
  containerName: string;
  envVars: Record<string, string>;
  mcpConfig: string;
}

function setupContainer(mode: "interactive" | "detached" | "attached"): ContainerSetup {
  const projectRoot = resolve(__dirname, "..");

  ensureImageExists();

  const envVars = loadDotEnv(projectRoot);

  // Check required env vars from .env.example
  const requiredVars = loadRequiredEnvVars(projectRoot);
  const missing = requiredVars.filter((v) => !envVars[v]);
  if (missing.length > 0) {
    console.error(`Missing required env vars in .env: ${missing.join(", ")}`);
    process.exit(1);
  }

  const uniqueId = Math.random().toString(36).slice(2, 8);
  const containerName = `app-building-${uniqueId}`;

  const mcpConfig = buildMCPConfig(envVars);

  // Build docker run args
  const args: string[] = ["run"];

  if (mode === "detached") {
    args.push("-d");
  } else if (mode === "interactive") {
    args.push("-it");
  }
  // "attached" mode: no -d, no -it — runs in foreground

  args.push("--rm", "--name", containerName);
  args.push("-v", `${projectRoot}:/repo`);
  args.push("-w", "/repo");
  args.push("--network", "host");
  args.push("--user", `${process.getuid!()}:${process.getgid!()}`);

  // Writable HOME that persists across container runs (for claude -c)
  args.push("--env", "HOME=/repo/.agent-home");

  // Git identity (system gitconfig not visible to non-root user)
  args.push("--env", "GIT_AUTHOR_NAME=App Builder");
  args.push("--env", "GIT_AUTHOR_EMAIL=app-builder@localhost");
  args.push("--env", "GIT_COMMITTER_NAME=App Builder");
  args.push("--env", "GIT_COMMITTER_EMAIL=app-builder@localhost");

  // Playwright browsers installed at shared path
  args.push("--env", "PLAYWRIGHT_BROWSERS_PATH=/opt/playwright");

  // Pass env vars from .env
  for (const [k, v] of Object.entries(envVars)) {
    args.push("--env", `${k}=${v}`);
  }

  // Image name
  args.push(IMAGE_NAME);

  return { args, containerName, envVars, mcpConfig };
}

export function spawnContainer(prompt: string, options?: { maxIterations?: number }): Promise<void> {
  const { args, containerName, mcpConfig } = setupContainer("detached");

  if (options?.maxIterations) {
    args.splice(args.indexOf(IMAGE_NAME), 0, "--env", `MAX_ITERATIONS=${options.maxIterations}`);
  }

  // Worker loop (iterates claude, logs, git commits, checks for <DONE/>)
  args.push("npx", "tsx", "/app-building/src/worker.ts");
  args.push("-p", prompt);
  args.push("--model", "claude-opus-4-6");
  args.push("--dangerously-skip-permissions");
  args.push("--mcp-config", mcpConfig);

  const containerId = execFileSync("docker", args, {
    encoding: "utf-8",
    timeout: 30000,
  }).trim();

  console.log(`Container started: ${containerId.slice(0, 12)}`);
  console.log(`Logs: docker logs -f ${containerName}`);
  return Promise.resolve();
}

export function startInteractiveContainer(): { containerName: string; mcpConfig: string } {
  const { args, containerName, mcpConfig } = setupContainer("detached");
  args.push("sleep", "infinity");

  execFileSync("docker", args, { encoding: "utf-8", timeout: 30000 });

  return { containerName, mcpConfig };
}

export function execInContainer(containerName: string, claudeArgs: string[]): ChildProcess {
  return spawn("docker", ["exec", containerName, "claude", ...claudeArgs], {
    stdio: ["ignore", "pipe", "inherit"],
  });
}

export function stopContainer(containerName: string): void {
  try {
    execFileSync("docker", ["stop", containerName], { stdio: "ignore", timeout: 30000 });
  } catch {
    // Container may already be stopped
  }
}

export function spawnTestContainer(): Promise<void> {
  const { args } = setupContainer("interactive");

  // Just start bash — no worker script
  args.push("bash");

  return new Promise((resolve, reject) => {
    const child = spawn("docker", args, { stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Container exited with code ${code}`));
    });
    child.on("error", reject);
  });
}
