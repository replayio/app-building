import { readFileSync } from "fs";
import { resolve, dirname, basename } from "path";

export interface TargetConfig {
  dir: string;
  strategies: string[];
}

export interface Config {
  maxIterations: number | null;
  env: Record<string, string>;
  targets: TargetConfig[];
}

interface RawConfig {
  maxIterations?: number;
  env?: Record<string, string>;
  targets?: Array<{
    dir?: string;
    strategies?: string[];
  }>;
}

export function loadConfig(configPath: string): Config {
  const absPath = resolve(configPath);
  const configDir = dirname(absPath);

  let raw: RawConfig;
  try {
    raw = JSON.parse(readFileSync(absPath, "utf-8"));
  } catch (e: any) {
    throw new Error(`Failed to read config file ${absPath}: ${e.message}`);
  }

  if (!raw.targets || !Array.isArray(raw.targets) || raw.targets.length === 0) {
    throw new Error("Config must have a non-empty 'targets' array");
  }

  const targets: TargetConfig[] = raw.targets.map((t, i) => {
    if (!t.dir || typeof t.dir !== "string") {
      throw new Error(`Target ${i}: 'dir' is required and must be a string`);
    }
    if (!t.strategies || !Array.isArray(t.strategies) || t.strategies.length === 0) {
      throw new Error(`Target ${i}: 'strategies' must be a non-empty array`);
    }

    return {
      dir: resolve(configDir, t.dir),
      strategies: t.strategies.map((s) => resolve(configDir, s)),
    };
  });

  return {
    maxIterations: raw.maxIterations ?? null,
    env: raw.env ?? {},
    targets,
  };
}

export function getStrategyDir(config: Config): string {
  // Find a common parent directory for all strategy files.
  // For simplicity, use the directory of the first strategy file's parent.
  const allStrategies = config.targets.flatMap((t) => t.strategies);
  if (allStrategies.length === 0) {
    throw new Error("No strategy files found in config");
  }

  const allDirs = Array.from(new Set(allStrategies.map((s) => dirname(s))));
  if (allDirs.length === 1) {
    return allDirs[0];
  }

  // Find common prefix directory
  const parts = allDirs.map((d) => d.split("/"));
  const minLen = Math.min(...parts.map((p) => p.length));
  let commonParts: string[] = [];
  for (let i = 0; i < minLen; i++) {
    const seg = parts[0][i];
    if (parts.every((p) => p[i] === seg)) {
      commonParts.push(seg);
    } else {
      break;
    }
  }
  return commonParts.join("/") || "/";
}

export function getStrategyMountPaths(
  target: TargetConfig,
  strategiesDir: string
): string[] {
  return target.strategies.map((s) => {
    const rel = s.startsWith(strategiesDir)
      ? s.slice(strategiesDir.length)
      : "/" + basename(s);
    return `/strategies${rel}`;
  });
}
