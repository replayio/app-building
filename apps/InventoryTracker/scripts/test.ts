import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { initSchema } from "./schema.js";

const appDir = path.resolve(__dirname, "..");
const envPath = path.join(appDir, ".env");
const recordingsLogPath = path.join(
  process.env.HOME || "~",
  ".replay",
  "recordings.log"
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readEnv(): Record<string, string> {
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  const env: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

function requireEnvOrFile(name: string): string {
  const value = process.env[name] || readEnv()[name];
  if (!value) {
    console.error(
      `Missing required environment variable: ${name} (checked process.env and .env)`
    );
    process.exit(1);
  }
  return value;
}

function runSafe(command: string, options?: { cwd?: string; env?: NodeJS.ProcessEnv }): void {
  try {
    execSync(command, { stdio: "inherit", cwd: options?.cwd ?? appDir, env: options?.env });
  } catch {
    // Ignore errors for cleanup commands
  }
}

// ---------------------------------------------------------------------------
// Process cleanup
// ---------------------------------------------------------------------------

function killStaleProcesses(): void {
  console.log("Killing stale dev server processes...");
  runSafe("pkill -f 'netlify dev' || true");
  runSafe("pkill -f 'vite' || true");
  // Give processes a moment to exit
  try {
    execSync("sleep 1");
  } catch {
    // Ignore
  }
}

// ---------------------------------------------------------------------------
// Neon branch management
// ---------------------------------------------------------------------------

async function cleanupStaleBranches(
  apiKey: string,
  projectId: string
): Promise<void> {
  console.log("Cleaning up stale test branches...");
  const res = await fetch(
    `https://console.neon.tech/api/v2/projects/${projectId}/branches`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  if (!res.ok) {
    console.warn(`Warning: could not list branches (${res.status})`);
    return;
  }
  const data = await res.json();
  const staleBranches = (data.branches || []).filter(
    (b: { name: string; id: string }) => b.name.startsWith("test-worker-")
  );
  for (const branch of staleBranches) {
    console.log(`  Deleting stale branch: ${branch.name}`);
    await fetch(
      `https://console.neon.tech/api/v2/projects/${projectId}/branches/${branch.id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${apiKey}` } }
    );
  }
}

async function createTestBranch(
  apiKey: string,
  projectId: string,
  runId: string
): Promise<{ branchId: string; connectionUri: string }> {
  const branchName = `test-worker-${runId}`;
  console.log(`Creating ephemeral Neon branch: ${branchName}...`);
  const res = await fetch(
    `https://console.neon.tech/api/v2/projects/${projectId}/branches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        branch: { name: branchName },
        endpoints: [{ type: "read_write" }],
      }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    console.error(`Branch creation failed (${res.status}): ${text}`);
    process.exit(1);
  }
  const data = await res.json();
  const branchId: string = data.branch.id;
  const connectionUri: string = data.connection_uris[0].connection_uri;
  console.log(`Created branch: ${branchId}`);
  return { branchId, connectionUri };
}

async function deleteBranch(
  apiKey: string,
  projectId: string,
  branchId: string
): Promise<void> {
  console.log(`Deleting ephemeral branch: ${branchId}...`);
  await fetch(
    `https://console.neon.tech/api/v2/projects/${projectId}/branches/${branchId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${apiKey}` } }
  );
}

// ---------------------------------------------------------------------------
// Schema + seed
// ---------------------------------------------------------------------------

async function initAndSeed(databaseUrl: string): Promise<void> {
  console.log("Initializing schema...");
  await initSchema(databaseUrl);

  // Run migrations if migrate-db.ts exists
  const migratePath = path.join(appDir, "scripts", "migrate-db.ts");
  if (fs.existsSync(migratePath)) {
    console.log("Running migrations...");
    execSync("npx tsx scripts/migrate-db.ts", {
      cwd: appDir,
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
  }

  // Seed test data
  console.log("Seeding test data...");
  execSync("npx tsx scripts/seed-db.ts", {
    cwd: appDir,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

// ---------------------------------------------------------------------------
// Replay recordings parsing
// ---------------------------------------------------------------------------

interface RecordingEntry {
  id: string;
  kind: string;
  metadata?: {
    test?: {
      result?: string;
      title?: string;
    };
    uri?: string;
    sourcemaps?: unknown;
  };
  timestamp?: number;
  duration?: number;
}

function parseRecordingsLog(): RecordingEntry[] {
  if (!fs.existsSync(recordingsLogPath)) return [];

  const content = fs.readFileSync(recordingsLogPath, "utf-8");
  const entries: RecordingEntry[] = [];

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      entries.push(JSON.parse(trimmed));
    } catch {
      // Skip malformed lines
    }
  }
  return entries;
}

function handleFailedRecordings(replayCli: string): void {
  const entries = parseRecordingsLog();

  // Build a map of recording id -> merged metadata
  const recordings = new Map<string, RecordingEntry>();
  for (const entry of entries) {
    if (entry.kind === "createRecording" && entry.id) {
      recordings.set(entry.id, { ...entry });
    } else if (entry.kind === "addMetadata" && entry.id) {
      const existing = recordings.get(entry.id);
      if (existing) {
        existing.metadata = {
          ...existing.metadata,
          ...entry.metadata,
          test: { ...existing.metadata?.test, ...entry.metadata?.test },
        };
      }
    } else if (entry.kind === "writeFinished" && entry.id) {
      const existing = recordings.get(entry.id);
      if (existing) {
        existing.duration = entry.duration;
      }
    }
  }

  // Find recordings with test metadata
  const withTestMeta = Array.from(recordings.values()).filter(
    (r) => r.metadata?.test
  );

  // Log metadata block
  console.log("\n=== REPLAY RECORDINGS METADATA ===");
  for (const r of withTestMeta) {
    console.log(
      JSON.stringify({
        id: r.id,
        testResult: r.metadata?.test?.result,
        testTitle: r.metadata?.test?.title,
      })
    );
  }
  console.log("=== END REPLAY RECORDINGS METADATA ===\n");

  // Find failed/timedOut recordings that finished, pick longest duration
  const failedRecordings = withTestMeta.filter(
    (r) =>
      (r.metadata?.test?.result === "failed" ||
        r.metadata?.test?.result === "timedOut") &&
      r.duration !== undefined
  );

  if (failedRecordings.length === 0) {
    console.log("No failed recordings found to upload.");
    return;
  }

  failedRecordings.sort((a, b) => (b.duration || 0) - (a.duration || 0));
  const toUpload = failedRecordings[0];

  console.log(`Uploading recording: ${toUpload.id}...`);
  try {
    execSync(`npx ${replayCli} upload ${toUpload.id}`, {
      cwd: appDir,
      stdio: "inherit",
    });
    console.log(`REPLAY UPLOADED: ${toUpload.id}`);
  } catch (err) {
    const exitCode = (err as { status?: number }).status ?? 1;
    console.error(`Upload failed with exit code: ${exitCode}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const testFile = process.argv[2];
  if (!testFile) {
    console.error("Usage: tsx scripts/test.ts <test-file>");
    console.error("Example: tsx scripts/test.ts tests/auth.spec.ts");
    process.exit(1);
  }

  const neonApiKey = requireEnvOrFile("NEON_API_KEY");
  const projectId = requireEnvOrFile("NEON_PROJECT_ID");
  const replayCli = process.env.REPLAY_CLI || "replayio";
  const runId = Date.now().toString(36);

  let branchId: string | undefined;
  let playwrightExitCode = 1;

  try {
    // 1. Kill stale processes
    killStaleProcesses();

    // 2. Clean up stale branches
    await cleanupStaleBranches(neonApiKey, projectId);

    // 3. Create ephemeral branch
    const branch = await createTestBranch(neonApiKey, projectId, runId);
    branchId = branch.branchId;

    // 4. Initialize schema and seed
    await initAndSeed(branch.connectionUri);

    // 5. Remove stale recordings
    console.log("\nRemoving stale recordings...");
    runSafe(`npx ${replayCli} remove --all`);

    // 6. Run Playwright
    console.log(`\nRunning Playwright tests: ${testFile}\n`);
    try {
      execSync(`npx playwright test ${testFile} --retries 0`, {
        cwd: appDir,
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: branch.connectionUri },
      });
      playwrightExitCode = 0;
    } catch (err) {
      playwrightExitCode = (err as { status?: number }).status ?? 1;
      console.error(`\nPlaywright exited with code: ${playwrightExitCode}`);
    }

    // 7. On failure, handle recordings
    if (playwrightExitCode !== 0) {
      handleFailedRecordings(replayCli);
    }
  } finally {
    // 8. Cleanup
    if (branchId) {
      await deleteBranch(neonApiKey, projectId, branchId).catch((err) =>
        console.warn(`Warning: branch cleanup failed: ${err}`)
      );
    }
    runSafe(`npx ${replayCli} remove --all`);
  }

  // 9. Exit with Playwright's exit code
  process.exit(playwrightExitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
