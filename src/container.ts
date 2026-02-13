import { execFileSync, spawn } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const IMAGE_NAME = "app-building";

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

function extractRequiredEnvVars(strategyFiles: string[]): string[] {
  const allVars: string[] = [];
  for (const file of strategyFiles) {
    const content = readFileSync(file, "utf-8");
    const sectionMatch = content.match(/## Required Environment Variables\s*\n+```\n([\s\S]*?)\n```/);
    if (!sectionMatch) continue;
    const vars = sectionMatch[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    allVars.push(...vars);
  }
  return Array.from(new Set(allVars));
}

export function spawnContainer(
  appName: string,
  strategyBasenames: string[],
  maxIterations?: number,
): Promise<number> {
  const projectRoot = resolve(__dirname, "..");

  ensureImageExists();

  const envVars = loadDotEnv(projectRoot);

  // Check required env vars from strategy files
  const strategyFiles = strategyBasenames.map((s) => resolve(projectRoot, "strategies", s));
  const requiredVars = [...extractRequiredEnvVars(strategyFiles), "ANTHROPIC_API_KEY"];
  const missing = requiredVars.filter((v) => !envVars[v]);
  if (missing.length > 0) {
    console.error(`Missing required env vars in .env: ${missing.join(", ")}`);
    process.exit(1);
  }

  const containerName = `app-building-${appName}`;

  // Stop any existing container with the same name
  try {
    execFileSync("docker", ["rm", "-f", containerName], { stdio: "ignore" });
  } catch {}

  // Build docker run args
  const args: string[] = [
    "run",
    "--rm",
    "--name", containerName,
    "-v", `${projectRoot}:/repo`,
    "--network", "host",
    "--user", `${process.getuid!()}:${process.getgid!()}`,
  ];

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

  // Container args (passed to entrypoint)
  args.push("--app", appName);
  args.push("--repo-root", "/repo");
  for (const s of strategyBasenames) {
    args.push("--load", s);
  }
  if (maxIterations != null) {
    args.push("--max-iterations", String(maxIterations));
  }

  console.log(`[${appName}] Starting container ${containerName}...`);

  return new Promise((resolvePromise, reject) => {
    const child = spawn("docker", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout!.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          console.log(`[${appName}] ${line}`);
        }
      }
    });

    child.stderr!.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          console.error(`[${appName}] ${line}`);
        }
      }
    });

    child.on("error", (err) => reject(err));

    child.on("close", (code) => {
      const exitCode = code ?? 1;
      console.log(`[${appName}] Container exited with code ${exitCode}`);
      resolvePromise(exitCode);
    });
  });
}
