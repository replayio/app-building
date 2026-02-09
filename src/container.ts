import { execFileSync, spawn } from "child_process";
import { readFileSync } from "fs";
import { basename, resolve } from "path";
import { Config, TargetConfig, getStrategyDir, getStrategyMountPaths } from "./config";

const IMAGE_NAME = "app-building";

export function buildImage(): void {
  const contextDir = resolve(__dirname, "..");
  console.log("Building Docker image...");
  execFileSync("docker", ["build", "-t", IMAGE_NAME, contextDir], {
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
  envVars: string[],
): Promise<ContainerResult> {
  return new Promise((resolvePromise, reject) => {
    const dirName = basename(target.dir);
    const containerName = `app-building-${dirName}`;
    const strategyMountPaths = getStrategyMountPaths(target, strategiesDir);

    // Build docker run args
    const args: string[] = [
      "run",
      "--rm",
      "--name", containerName,
      "-v", `${target.dir}:/workspace`,
      "-v", `${strategiesDir}:/strategies:ro`,
      "--user", `${process.getuid!()}:${process.getgid!()}`,
    ];

    // Pass env vars
    const allEnvVars = ["ANTHROPIC_API_KEY", ...envVars];
    for (const v of allEnvVars) {
      if (process.env[v]) {
        args.push("--env", `${v}=${process.env[v]}`);
      }
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
  const allStrategyFiles = config.targets.flatMap((t) => t.strategies);
  const envVars = extractRequiredEnvVars(allStrategyFiles);

  // Check required env vars
  const missing = [...envVars, "ANTHROPIC_API_KEY"].filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  const results = await Promise.all(
    config.targets.map((target) =>
      spawnContainer(target, config, strategiesDir, envVars)
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
