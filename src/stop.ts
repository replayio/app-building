import { readAgentState, clearAgentState, stopRemoteContainer } from "./container";
import { findContainer } from "./container-registry";
import { httpGet, httpPost } from "./http-client";
import type { AgentState } from "./container";
import { RED, RESET } from "./format";

async function waitForStopped(baseUrl: string, timeoutMs: number = 120000): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const status = await httpGet(`${baseUrl}/status`, { timeout: 5000 });
      if (status.state === "stopped") {
        return status.unmergedBranch ?? null;
      }
    } catch {
      // Server may have already exited
      return null;
    }
  }
  return null;
}

async function stopByState(agentState: AgentState): Promise<void> {
  console.log(`Stopping container ${agentState.containerName}...`);

  // Send HTTP stop signal to the container's server
  try {
    await httpPost(`${agentState.baseUrl}/stop`);
    console.log("Stop signal sent. Waiting for graceful shutdown...");
  } catch {
    console.log("Could not reach container (may already be stopped).");
  }

  // Wait for the server to reach "stopped" state (it commits+pushes unmerged work)
  const branch = await waitForStopped(agentState.baseUrl);
  if (branch) {
    console.log(`Unmerged branch: ${branch}`);
  }

  if (agentState.type === "remote") {
    // Destroy the Fly machine so it doesn't sit idle and cost money
    await stopRemoteContainer(agentState);
    return;
  }

  // Wait for local container to exit
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      await fetch(`${agentState.baseUrl}/status`);
      // Still running, keep waiting
    } catch {
      // Connection refused = container is gone
      console.log("Container stopped.");
      clearAgentState(agentState.containerName);
      return;
    }
  }

  console.error("Container did not stop within 5 seconds.");
  process.exit(1);
}

async function main(): Promise<void> {
  const targetName = process.argv[2];

  if (targetName) {
    // Stop a specific container by name from the registry
    const entry = findContainer(targetName);
    if (!entry) {
      console.error(`${RED}Container "${targetName}" not found in registry.${RESET}`);
      process.exit(1);
    }
    await stopByState(entry);
    return;
  }

  // Default: stop the current container from .agent-state.json
  const agentState = readAgentState();

  if (!agentState) {
    console.error("No active agent found (no .agent-state.json).");
    process.exit(1);
  }

  await stopByState(agentState);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
