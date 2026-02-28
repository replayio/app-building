import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import type { AgentState } from "./container";
import { probeAlive } from "./container-utils";

export interface RegistryEntry extends AgentState {
  startedAt: string;
  stoppedAt?: string;
}

export interface ContainerRegistry {
  log(state: AgentState): void;
  markStopped(containerName?: string): void;
  clearStopped(containerName: string): void;
  getRecent(limit?: number): RegistryEntry[];
  find(containerName: string): RegistryEntry | null;
  findAlive(): Promise<RegistryEntry[]>;
}

export class FileContainerRegistry implements ContainerRegistry {
  constructor(private filePath: string) {}

  private readRegistry(): { lines: string[]; entries: (RegistryEntry | null)[] } {
    if (!existsSync(this.filePath)) return { lines: [], entries: [] };
    const lines = readFileSync(this.filePath, "utf-8").split("\n").filter((l) => l.trim());
    const entries = lines.map((line) => {
      try { return JSON.parse(line) as RegistryEntry; }
      catch { return null; }
    });
    return { lines, entries };
  }

  private updateEntry(
    match: (entry: RegistryEntry) => boolean,
    update: (entry: RegistryEntry) => void,
  ): void {
    const { lines, entries } = this.readRegistry();
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry && match(entry)) {
        update(entry);
        lines[i] = JSON.stringify(entry);
        writeFileSync(this.filePath, lines.join("\n") + "\n");
        return;
      }
    }
  }

  log(state: AgentState): void {
    const entry: RegistryEntry = {
      ...state,
      startedAt: new Date().toISOString(),
    };
    appendFileSync(this.filePath, JSON.stringify(entry) + "\n");
  }

  markStopped(containerName?: string): void {
    this.updateEntry(
      (e) => !e.stoppedAt && (!containerName || e.containerName === containerName),
      (e) => { e.stoppedAt = new Date().toISOString(); },
    );
  }

  clearStopped(containerName: string): void {
    this.updateEntry(
      (e) => e.containerName === containerName && !!e.stoppedAt,
      (e) => { delete e.stoppedAt; },
    );
  }

  getRecent(limit = 20): RegistryEntry[] {
    const { entries } = this.readRegistry();
    return entries.filter((e): e is RegistryEntry => e !== null).slice(-limit);
  }

  find(containerName: string): RegistryEntry | null {
    const entries = this.getRecent(100);
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].containerName === containerName) {
        return entries[i];
      }
    }
    return null;
  }

  async findAlive(): Promise<RegistryEntry[]> {
    const entries = this.getRecent();
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const candidates = entries.filter((e) => new Date(e.startedAt).getTime() > oneDayAgo);

    const aliveResults = await Promise.all(
      candidates.map(async (entry) => ({
        entry,
        alive: await probeAlive(entry),
      })),
    );

    for (const r of aliveResults) {
      if (r.alive && r.entry.stoppedAt) {
        this.clearStopped(r.entry.containerName);
      } else if (!r.alive && !r.entry.stoppedAt) {
        this.markStopped(r.entry.containerName);
      }
    }

    return aliveResults.filter((r) => r.alive).map((r) => r.entry);
  }
}
