import { execFileSync, spawn } from "child_process";
import { readFileSync } from "fs";
import { basename, resolve } from "path";
import { Config, TargetConfig, getStrategyDir, getStrategyMountPaths } from "./config";

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

export interface ContainerResult {
  dir: string;
  exitCode: number;
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
  target: TargetConfig,
  config: Config,
  strategiesDir: string,
): Promise<ContainerResult> {
  return new Promise((resolvePromise, reject) => {
    const dirName = basename(target.dir);
    const containerName = `app-building-${dirName}`;
    const strategyMountPaths = getStrategyMountPaths(target, strategiesDir);

    // Stop any existing container with the same name
    try {
      execFileSync("docker", ["rm", "-f", containerName], { stdio: "ignore" });
    } catch {}

    // Build docker run args
    const args: string[] = [
      "run",
      "--rm",
      "--name", containerName,
      "-v", `${target.dir}:/workspace`,
      "-v", `${strategiesDir}:/strategies:ro`,
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

    // Pass env vars from config
    for (const [k, v] of Object.entries(config.env)) {
      args.push("--env", `${k}=${v}`);
    }

    // Image name
    args.push(IMAGE_NAME);

    // Container args (passed to entrypoint)
    args.push("--dir", "/workspace");
    for (const mp of strategyMountPaths) {
      args.push("--load", mp);
    }
    if (config.maxIterations != null) {
      args.push("--max-iterations", String(config.maxIterations));
    }

    console.log(`[${dirName}] Starting container ${containerName}...`);

    const child = spawn("docker", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout!.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          console.log(`[${dirName}] ${line}`);
        }
      }
    });

    child.stderr!.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          console.error(`[${dirName}] ${line}`);
        }
      }
    });

    child.on("error", (err) => reject(err));

    child.on("close", (code) => {
      const exitCode = code ?? 1;
      console.log(`[${dirName}] Container exited with code ${exitCode}`);
      resolvePromise({ dir: target.dir, exitCode });
    });
  });
}

export async function runContainers(config: Config): Promise<void> {
  ensureImageExists();

  const strategiesDir = getStrategyDir(config);

  // Check required env vars from strategy files
  const allStrategyFiles = config.targets.flatMap((t) => t.strategies);
  const requiredVars = [...extractRequiredEnvVars(allStrategyFiles), "ANTHROPIC_API_KEY"];
  const missing = requiredVars.filter((v) => !config.env[v]);
  if (missing.length > 0) {
    console.error(`Missing required env vars in config: ${missing.join(", ")}`);
    process.exit(1);
  }

  const results = await Promise.all(
    config.targets.map((target) =>
      spawnContainer(target, config, strategiesDir)
    )
  );

  // Report results
  console.log("\n--- Results ---");
  let hasFailure = false;
  for (const r of results) {
    const status = r.exitCode === 0 ? "SUCCESS" : "FAILED";
    console.log(`  ${basename(r.dir)}: ${status} (exit code ${r.exitCode})`);
    if (r.exitCode !== 0) hasFailure = true;
  }

  if (hasFailure) {
    process.exit(1);
  }
}
