import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { resolve } from "path";
import type { AgentState } from "./container";

const REGISTRY_FILE = resolve(__dirname, "../..", ".container-registry.jsonl");

export interface RegistryEntry extends AgentState {
  startedAt: string;
  stoppedAt?: string;
}

function readRegistry(): { lines: string[]; entries: (RegistryEntry | null)[] } {
  if (!existsSync(REGISTRY_FILE)) return { lines: [], entries: [] };
  const lines = readFileSync(REGISTRY_FILE, "utf-8").split("\n").filter((l) => l.trim());
  const entries = lines.map((line) => {
    try { return JSON.parse(line) as RegistryEntry; }
    catch { return null; }
  });
  return { lines, entries };
}

function updateEntry(
  match: (entry: RegistryEntry) => boolean,
  update: (entry: RegistryEntry) => void,
): void {
  const { lines, entries } = readRegistry();
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (entry && match(entry)) {
      update(entry);
      lines[i] = JSON.stringify(entry);
      writeFileSync(REGISTRY_FILE, lines.join("\n") + "\n");
      return;
    }
  }
}

export function logContainer(state: AgentState): void {
  const entry: RegistryEntry = {
    ...state,
    startedAt: new Date().toISOString(),
  };
  appendFileSync(REGISTRY_FILE, JSON.stringify(entry) + "\n");
}

export function markStopped(containerName?: string): void {
  updateEntry(
    (e) => !e.stoppedAt && (!containerName || e.containerName === containerName),
    (e) => { e.stoppedAt = new Date().toISOString(); },
  );
}

export function clearStopped(containerName: string): void {
  updateEntry(
    (e) => e.containerName === containerName && !!e.stoppedAt,
    (e) => { delete e.stoppedAt; },
  );
}

export function getRecentContainers(limit = 20): RegistryEntry[] {
  const { entries } = readRegistry();
  return entries.filter((e): e is RegistryEntry => e !== null).slice(-limit);
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
