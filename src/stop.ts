import { readAgentState, stopContainer, clearAgentState } from "./container";
import { httpPost } from "./http-client";

async function main(): Promise<void> {
  const agentState = readAgentState();

  if (!agentState) {
    console.error("No active agent found (no .agent-state.json).");
    process.exit(1);
  }

  console.log(`Stopping container ${agentState.containerName}...`);

  // Try HTTP stop first
  try {
    await httpPost(`${agentState.baseUrl}/stop`);
    console.log("Stop signal sent.");
  } catch {
    console.log("HTTP stop failed, falling back to docker stop...");
    stopContainer(agentState.containerName);
  }

  // Wait for container to disappear
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      await fetch(`${agentState.baseUrl}/status`);
      // Still running, keep waiting
    } catch {
      // Connection refused = container is gone
      console.log("Container stopped.");
      clearAgentState();
      return;
    }
  }

  // Force stop
  console.log("Container still running, forcing docker stop...");
  stopContainer(agentState.containerName);
  clearAgentState();
  console.log("Container stopped.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
