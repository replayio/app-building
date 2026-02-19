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

function findWorkerPid(containerName: string): number | null {
  try {
    const out = execFileSync(
      "docker",
      ["exec", containerName, "ps", "aux"],
      { encoding: "utf-8", timeout: 5000 },
    );
    for (const line of out.split("\n")) {
      if (line.includes("/app-building/src/worker.ts") && line.includes("/usr/local/bin/node")) {
        const parts = line.trim().split(/\s+/);
        const pid = parseInt(parts[1], 10);
        if (!isNaN(pid)) return pid;
      }
    }
  } catch {}
  return null;
}

function main(): void {
  const logsDir = resolve(__dirname, "..", "logs");
  const containerName = getContainerFromLog(logsDir);

  if (!containerName) {
    console.error("No active worker found (no container name in worker-current.log).");
    process.exit(1);
  }

  const pid = findWorkerPid(containerName);
  if (pid === null) {
    console.error(`No worker.ts node process found in container ${containerName}.`);
    process.exit(1);
  }

  console.log(`Killing worker.ts node process (PID ${pid}) in ${containerName}`);
  try {
    execFileSync("docker", ["exec", containerName, "kill", String(pid)], {
      encoding: "utf-8",
      timeout: 5000,
    });
    console.log("Done.");
  } catch (e: any) {
    console.error(`Failed to kill PID ${pid}: ${e.message}`);
    process.exit(1);
  }
}

main();
