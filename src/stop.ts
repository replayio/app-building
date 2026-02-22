import { readAgentState, clearAgentState, stopRemoteContainer } from "./container";
import { httpPost } from "./http-client";

async function main(): Promise<void> {
  const agentState = readAgentState();

  if (!agentState) {
    console.error("No active agent found (no .agent-state.json).");
    process.exit(1);
  }

  console.log(`Stopping container ${agentState.containerName}...`);

  // Send HTTP stop signal to the container's server
  try {
    await httpPost(`${agentState.baseUrl}/stop`);
    console.log("Stop signal sent.");
  } catch {
    console.log("Could not reach container (may already be stopped).");
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
      clearAgentState();
      return;
    }
  }

  console.error("Container did not stop within 5 seconds.");
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
