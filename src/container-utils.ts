import type { AgentState } from "./container";
import type { RegistryEntry } from "./container-registry";
import type { HttpOptions } from "./http-client";
import { getRecentContainers, markStopped } from "./container-registry";

export function httpOptsFor(state: AgentState): HttpOptions {
  if (state.type === "remote" && state.flyMachineId) {
    return { headers: { "fly-force-instance-id": state.flyMachineId } };
  }
  return {};
}

export async function probeAlive(entry: RegistryEntry): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    if (entry.type === "remote" && entry.flyMachineId) {
      headers["fly-force-instance-id"] = entry.flyMachineId;
    }
    const res = await fetch(`${entry.baseUrl}/status`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    // Verify the response is actually from the expected container,
    // not a different machine on the same Fly app.
    const body = await res.json() as { containerName?: string };
    if (body.containerName && body.containerName !== entry.containerName) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function findAliveContainers(): Promise<RegistryEntry[]> {
  const entries = getRecentContainers();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const candidates = entries.filter((e) => !e.stoppedAt && new Date(e.startedAt).getTime() > oneDayAgo);

  const aliveResults = await Promise.all(
    candidates.map(async (entry) => ({
      entry,
      alive: await probeAlive(entry),
    })),
  );

  for (const r of aliveResults) {
    if (!r.alive) markStopped(r.entry.containerName);
  }

  return aliveResults.filter((r) => r.alive).map((r) => r.entry);
}
