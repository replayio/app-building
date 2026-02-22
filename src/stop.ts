import { readAgentState, clearAgentState } from "./container";
import { httpPost } from "./http-client";

async function main(): Promise<void> {
  const agentState = readAgentState();

  if (!agentState) {
    console.error("No active agent found (no .agent-state.json).");
    process.exit(1);
  }

  console.log(`Stopping container ${agentState.containerName}...`);

  await httpPost(`${agentState.baseUrl}/stop`);
  console.log("Stop signal sent.");

  // Wait for container to exit
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
