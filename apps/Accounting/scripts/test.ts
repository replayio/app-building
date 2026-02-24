import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { initSchema } from "./schema.js";

const appDir = path.resolve(import.meta.dirname, "..");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function env(key: string): string {
  const val = process.env[key];
  if (!val) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return val;
}

function readEnvFile(): Record<string, string> {
  const envPath = path.join(appDir, ".env");
  if (!existsSync(envPath)) return {};
  const lines = readFileSync(envPath, "utf-8").split("\n");
  const result: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    result[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return result;
}

function tryExec(cmd: string, opts?: { cwd?: string; encoding?: BufferEncoding }) {
  try {
    return execSync(cmd, { encoding: "utf-8", ...opts });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Neon branch helpers
// ---------------------------------------------------------------------------

async function neonFetch(apiPath: string, options: RequestInit = {}): Promise<Response> {
  const neonApiKey = env("NEON_API_KEY");
  return fetch(`https://console.neon.tech/api/v2${apiPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${neonApiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

interface NeonBranch {
  id: string;
  name: string;
}

async function listBranches(projectId: string): Promise<NeonBranch[]> {
  const res = await neonFetch(`/projects/${projectId}/branches`);
  if (!res.ok) {
    console.error("Failed to list Neon branches:", await res.text());
    return [];
  }
  const data = await res.json();
  return data.branches;
}

async function deleteBranch(projectId: string, branchId: string) {
  const res = await neonFetch(`/projects/${projectId}/branches/${branchId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    console.error(`Failed to delete branch ${branchId}:`, await res.text());
  }
}

interface CreatedBranch {
  branchId: string;
  connectionUri: string;
}

async function createBranch(projectId: string, branchName: string): Promise<CreatedBranch> {
  const res = await neonFetch(`/projects/${projectId}/branches`, {
    method: "POST",
    body: JSON.stringify({
      branch: { name: branchName },
      endpoints: [{ type: "read_write" }],
    }),
  });
  if (!res.ok) {
    console.error("Failed to create Neon branch:", await res.text());
    process.exit(1);
  }
  const data = await res.json();
  return {
    branchId: data.branch.id,
    connectionUri: data.connection_uris[0].connection_uri,
  };
}

// ---------------------------------------------------------------------------
// Replay recording helpers
// ---------------------------------------------------------------------------

interface RecordingEntry {
  kind: string;
  id?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
  duration?: number;
}

function parseRecordingsLog(): RecordingEntry[] {
  const logPath = path.join(process.env.HOME || "~", ".replay", "recordings.log");
  if (!existsSync(logPath)) return [];
  const entries: RecordingEntry[] = [];
  for (const line of readFileSync(logPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      entries.push(JSON.parse(trimmed));
    } catch {
      // skip malformed lines
    }
  }
  return entries;
}

interface RecordingInfo {
  id: string;
  testResult?: string;
  testTitle?: string;
  specFile?: string;
  duration: number;
  finished: boolean;
}

function buildRecordingMap(entries: RecordingEntry[]): Map<string, RecordingInfo> {
  const recordings = new Map<string, RecordingInfo>();

  for (const entry of entries) {
    if (entry.kind === "createRecording" && entry.id) {
      recordings.set(entry.id, {
        id: entry.id,
        duration: 0,
        finished: false,
      });
    }
    if (entry.kind === "addMetadata" && entry.id) {
      const rec = recordings.get(entry.id);
      if (rec && entry.metadata) {
        const test = entry.metadata.test as
          | { result?: string; title?: string; path?: string[] }
          | undefined;
        if (test) {
          rec.testResult = test.result;
          rec.testTitle = test.title;
          if (test.path) rec.specFile = test.path.join("/");
        }
      }
    }
    if (entry.kind === "writeFinished" && entry.id) {
      const rec = recordings.get(entry.id);
      if (rec) {
        rec.finished = true;
        if (entry.duration != null) rec.duration = entry.duration;
      }
    }
  }

  return recordings;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const testFile = process.argv[2];
  if (!testFile) {
    console.error("Usage: npm run test <test-file>");
    console.error("Example: npm run test tests/auth.spec.ts");
    process.exit(1);
  }

  const neonApiKey = env("NEON_API_KEY");
  void neonApiKey; // used via neonFetch

  const replayCli = process.env.REPLAY_CLI || "replayio";

  const envVals = readEnvFile();
  const neonProjectId = envVals["NEON_PROJECT_ID"] || env("NEON_PROJECT_ID");

  // 1. Kill stale processes
  console.log("\n--- Killing stale processes ---");
  tryExec("pkill -f 'netlify dev' || true", { cwd: appDir });
  tryExec("pkill -f 'vite' || true", { cwd: appDir });

  // 2. Clean up stale Neon branches
  console.log("\n--- Cleaning up stale test branches ---");
  const branches = await listBranches(neonProjectId);
  for (const branch of branches) {
    if (branch.name.startsWith("test-worker-")) {
      console.log(`Deleting stale branch: ${branch.name}`);
      await deleteBranch(neonProjectId, branch.id);
    }
  }

  // 3. Create ephemeral Neon branch
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const branchName = `test-worker-${runId}`;
  console.log(`\n--- Creating ephemeral branch: ${branchName} ---`);
  const { branchId, connectionUri } = await createBranch(neonProjectId, branchName);
  console.log(`Branch created: ${branchId}`);

  let playwrightExitCode = 1;

  try {
    // 4. Initialize and seed
    console.log("\n--- Initializing schema on test branch ---");
    await initSchema(connectionUri);
    console.log("Schema initialized.");

    // Run migrations if migrate-db.ts exists
    const migrateScript = path.join(appDir, "scripts", "migrate-db.ts");
    if (existsSync(migrateScript)) {
      console.log("\n--- Running migrations ---");
      execSync(`npx tsx scripts/migrate-db.ts "${connectionUri}"`, {
        stdio: "inherit",
        cwd: appDir,
      });
    }

    // Seed test data if seed-db.ts exists
    const seedScript = path.join(appDir, "scripts", "seed-db.ts");
    if (existsSync(seedScript)) {
      console.log("\n--- Seeding test data ---");
      execSync(`npx tsx scripts/seed-db.ts "${connectionUri}"`, {
        stdio: "inherit",
        cwd: appDir,
      });
    }

    // 5. Remove stale recordings
    console.log("\n--- Removing stale recordings ---");
    tryExec(`npx ${replayCli} remove --all`, { cwd: appDir });

    // 6. Run Playwright
    console.log(`\n--- Running Playwright: ${testFile} ---`);
    try {
      execSync(`npx playwright test ${testFile} --retries 0`, {
        stdio: "inherit",
        cwd: appDir,
        env: { ...process.env, DATABASE_URL: connectionUri },
      });
      playwrightExitCode = 0;
    } catch (err: unknown) {
      const exitErr = err as { status?: number };
      playwrightExitCode = exitErr.status ?? 1;
      console.error(`\nPlaywright exited with code ${playwrightExitCode}`);
    }

    // 7. On failure — parse recordings and upload
    if (playwrightExitCode !== 0) {
      const entries = parseRecordingsLog();
      const recordings = buildRecordingMap(entries);

      // Log metadata for all recordings with test metadata
      const withTestMeta = [...recordings.values()].filter((r) => r.testResult);
      if (withTestMeta.length > 0) {
        console.log("\n=== REPLAY RECORDINGS METADATA ===");
        for (const rec of withTestMeta) {
          console.log(
            JSON.stringify({
              id: rec.id,
              testResult: rec.testResult,
              testTitle: rec.testTitle,
              specFile: rec.specFile,
            })
          );
        }
        console.log("=== END REPLAY RECORDINGS METADATA ===");
      }

      // Upload one failed recording with longest duration
      const failedRecordings = [...recordings.values()].filter(
        (r) =>
          r.finished &&
          (r.testResult === "failed" || r.testResult === "timedOut")
      );
      failedRecordings.sort((a, b) => b.duration - a.duration);

      if (failedRecordings.length > 0) {
        const toUpload = failedRecordings[0];
        console.log(`\nUploading recording ${toUpload.id} (duration: ${toUpload.duration})...`);
        try {
          execSync(`npx ${replayCli} upload ${toUpload.id}`, {
            stdio: "inherit",
            cwd: appDir,
          });
          console.log(`REPLAY UPLOADED: ${toUpload.id}`);
        } catch (uploadErr: unknown) {
          const exitErr = uploadErr as { status?: number };
          console.error(`Upload failed with exit code ${exitErr.status ?? "unknown"}`);
        }
      }
    }
  } finally {
    // 8. Clean up
    console.log("\n--- Cleaning up ---");
    console.log(`Deleting ephemeral branch: ${branchName}`);
    await deleteBranch(neonProjectId, branchId);
    tryExec(`npx ${replayCli} remove --all`, { cwd: appDir });
  }

  // 9. Exit with original Playwright exit code
  process.exit(playwrightExitCode);
}

main().catch((err) => {
  console.error("Test script failed:", err);
  process.exit(1);
});
