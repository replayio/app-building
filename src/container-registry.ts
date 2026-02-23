import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { resolve } from "path";
import type { AgentState } from "./container";

const REGISTRY_FILE = resolve(__dirname, "..", ".container-registry.jsonl");

export interface RegistryEntry extends AgentState {
  startedAt: string;
  stoppedAt?: string;
}

export function logContainer(state: AgentState): void {
  const entry: RegistryEntry = {
    ...state,
    startedAt: new Date().toISOString(),
  };
  appendFileSync(REGISTRY_FILE, JSON.stringify(entry) + "\n");
}

export function markStopped(containerName?: string): void {
  if (!existsSync(REGISTRY_FILE)) return;

  const lines = readFileSync(REGISTRY_FILE, "utf-8")
    .split("\n")
    .filter((l) => l.trim());

  // Find the last entry matching containerName (or last entry if no name given)
  let targetIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const entry: RegistryEntry = JSON.parse(lines[i]);
      if (!entry.stoppedAt && (!containerName || entry.containerName === containerName)) {
        targetIdx = i;
        break;
      }
    } catch {
      // Skip malformed lines
    }
  }

  if (targetIdx === -1) return;

  const entry: RegistryEntry = JSON.parse(lines[targetIdx]);
  entry.stoppedAt = new Date().toISOString();
  lines[targetIdx] = JSON.stringify(entry);

  writeFileSync(REGISTRY_FILE, lines.join("\n") + "\n");
}

export function getRecentContainers(limit = 20): RegistryEntry[] {
  if (!existsSync(REGISTRY_FILE)) return [];

  const lines = readFileSync(REGISTRY_FILE, "utf-8")
    .split("\n")
    .filter((l) => l.trim());

  const entries: RegistryEntry[] = [];
  for (const line of lines) {
    try {
      entries.push(JSON.parse(line));
    } catch {
      // Skip malformed lines
    }
  }

  return entries.slice(-limit);
}

export function findContainer(containerName: string): RegistryEntry | null {
  const entries = getRecentContainers(100);
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].containerName === containerName) {
      return entries[i];
    }
  }
  return null;
}
