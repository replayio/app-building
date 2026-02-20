import { execFileSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";

function getContainerFromLog(logsDir: string): string | null {
  const currentLog = join(logsDir, "worker-current.log");
  if (!existsSync(currentLog)) return null;

  const content = readFileSync(currentLog, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/Container:\s*(\S+)/);
    if (match) return match[1];
  }
  return null;
}

function isContainerRunning(containerName: string): boolean {
  try {
    const out = execFileSync(
      "docker",
      ["inspect", "-f", "{{.State.Running}}", containerName],
      { encoding: "utf-8", timeout: 5000, stdio: ["pipe", "pipe", "pipe"] },
    );
    return out.trim() === "true";
  } catch {
    return false;
  }
}

function getContainerPid(containerName: string): number | null {
  try {
    const out = execFileSync(
      "docker",
      ["inspect", "-f", "{{.State.Pid}}", containerName],
      { encoding: "utf-8", timeout: 5000 },
    );
    const pid = parseInt(out.trim(), 10);
    return pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function main(): void {
  const logsDir = resolve(__dirname, "..", "logs");
  const containerName = getContainerFromLog(logsDir);

  if (!containerName) {
    console.error("No active worker found (no container name in worker-current.log).");
    process.exit(1);
  }

  if (!isContainerRunning(containerName)) {
    console.log(`Container ${containerName} is not running.`);
    return;
  }

  const pid = getContainerPid(containerName);
  if (pid === null) {
    console.error(`Could not find host PID for container ${containerName}.`);
    process.exit(1);
  }

  console.log(`Killing container ${containerName} (host PID ${pid})...`);
  try {
    process.kill(pid, "SIGKILL");
  } catch (e: any) {
    console.error(`Failed to kill PID ${pid}: ${e.message}`);
    process.exit(1);
  }

  // Wait for container to disappear
  for (let i = 0; i < 10; i++) {
    if (!isContainerRunning(containerName)) {
      console.log("Container stopped.");
      return;
    }
    execFileSync("sleep", ["0.5"]);
  }

  console.error("Container did not stop within 5 seconds.");
  process.exit(1);
}

main();
