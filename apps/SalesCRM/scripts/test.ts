import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { initSchema } from './schema.js'

const APP_DIR = resolve(import.meta.dirname, '..')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadEnv(): Record<string, string> {
  const envPath = resolve(APP_DIR, '.env')
  const vars: Record<string, string> = {}
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      vars[key] = val
    }
  }
  return vars
}

function required(name: string): string {
  const val = process.env[name]
  if (!val) {
    console.error(`Missing required environment variable: ${name}`)
    process.exit(1)
  }
  return val
}

function killStaleProcesses(): void {
  for (const pattern of ['netlify', 'vite']) {
    try {
      execSync(`pkill -f "${pattern}"`, { stdio: 'ignore' })
    } catch {
      // no matching processes — fine
    }
  }
  // small grace period for ports to free up
  execSync('sleep 1', { stdio: 'ignore' })
}

// ---------------------------------------------------------------------------
// Neon branch helpers
// ---------------------------------------------------------------------------

const NEON_API = 'https://console.neon.tech/api/v2'

interface NeonBranch {
  id: string
  name: string
}

interface NeonEndpoint {
  host: string
}

async function neonFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const apiKey = required('NEON_API_KEY')
  const res = await fetch(`${NEON_API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(opts.headers as Record<string, string> | undefined),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Neon API ${opts.method ?? 'GET'} ${path} failed (${res.status}): ${text}`)
  }
  return res
}

async function listBranches(projectId: string): Promise<NeonBranch[]> {
  const res = await neonFetch(`/projects/${projectId}/branches`)
  const data = (await res.json()) as { branches: NeonBranch[] }
  return data.branches
}

async function deleteBranch(projectId: string, branchId: string): Promise<void> {
  await neonFetch(`/projects/${projectId}/branches/${branchId}`, { method: 'DELETE' })
}

async function createBranch(
  projectId: string,
  branchName: string,
): Promise<{ branchId: string; host: string }> {
  const res = await neonFetch(`/projects/${projectId}/branches`, {
    method: 'POST',
    body: JSON.stringify({
      branch: { name: branchName },
      endpoints: [{ type: 'read_write' }],
    }),
  })
  const data = (await res.json()) as {
    branch: { id: string }
    endpoints: NeonEndpoint[]
  }
  return { branchId: data.branch.id, host: data.endpoints[0].host }
}

function buildDatabaseUrl(templateUrl: string, newHost: string): string {
  // Replace the host portion of the template DATABASE_URL with the new branch's host
  const url = new URL(templateUrl)
  url.hostname = newHost
  return url.toString()
}

// ---------------------------------------------------------------------------
// Replay recordings.log parser
// ---------------------------------------------------------------------------

interface RecordingEntry {
  id: string
  kind: string
  timestamp?: string
  metadata?: Record<string, unknown>
  duration?: number
}

interface ParsedRecording {
  id: string
  testResult?: string
  testTitle?: string
  specFile?: string
  duration: number
  writeFinished: boolean
}

function parseRecordingsLog(): ParsedRecording[] {
  const logPath = resolve(process.env.HOME ?? '~', '.replay/recordings.log')
  if (!existsSync(logPath)) return []

  const content = readFileSync(logPath, 'utf-8')
  const lines = content.split('\n').filter((l) => l.trim())

  const recordings = new Map<string, ParsedRecording>()

  for (const line of lines) {
    let entry: RecordingEntry
    try {
      entry = JSON.parse(line) as RecordingEntry
    } catch {
      continue
    }

    if (entry.kind === 'createRecording' && entry.id) {
      recordings.set(entry.id, {
        id: entry.id,
        duration: 0,
        writeFinished: false,
      })
    }

    if (entry.kind === 'addMetadata' && entry.id) {
      const rec = recordings.get(entry.id)
      if (rec && entry.metadata) {
        const test = entry.metadata.test as
          | { result?: string; title?: string; path?: string[] }
          | undefined
        if (test) {
          rec.testResult = test.result
          rec.testTitle = test.title
          if (test.path) rec.specFile = test.path[0]
        }
      }
    }

    if (entry.kind === 'writeFinished' && entry.id) {
      const rec = recordings.get(entry.id)
      if (rec) {
        rec.writeFinished = true
        if (entry.duration != null) rec.duration = entry.duration
      }
    }
  }

  return Array.from(recordings.values())
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const testFile = process.argv[2]
  if (!testFile) {
    console.error('Usage: tsx scripts/test.ts <testFile>')
    console.error('Example: npm run test tests/auth.spec.ts')
    process.exit(1)
  }

  // Load .env into process.env so child processes inherit them
  const envVars = loadEnv()
  for (const [k, v] of Object.entries(envVars)) {
    if (!process.env[k]) process.env[k] = v
  }

  const neonProjectId = required('NEON_PROJECT_ID')
  const templateDbUrl = required('DATABASE_URL')
  required('NEON_API_KEY')

  // 1. Kill stale processes
  console.log('Killing stale processes...')
  killStaleProcesses()

  // 2. Clean up stale Neon branches
  console.log('Cleaning up stale Neon branches...')
  const branches = await listBranches(neonProjectId)
  for (const branch of branches) {
    if (branch.name.startsWith('test-worker-')) {
      console.log(`  Deleting stale branch: ${branch.name}`)
      await deleteBranch(neonProjectId, branch.id)
    }
  }

  // 3. Create ephemeral Neon branch
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const branchName = `test-worker-${runId}`
  console.log(`Creating ephemeral branch: ${branchName}`)
  const { branchId, host } = await createBranch(neonProjectId, branchName)
  const databaseUrl = buildDatabaseUrl(templateDbUrl, host)

  let playwrightExitCode = 1

  try {
    // 4. Initialize schema and seed
    console.log('Initializing schema...')
    await initSchema(databaseUrl)

    // Seed test data if seed module exists
    const seedPath = resolve(APP_DIR, 'scripts/seed-db.ts')
    if (existsSync(seedPath)) {
      console.log('Seeding test data...')
      execSync(`npx tsx scripts/seed-db.ts`, {
        stdio: 'inherit',
        cwd: APP_DIR,
        env: { ...process.env, DATABASE_URL: databaseUrl },
      })
    }

    // 5. Remove stale recordings
    console.log('Removing stale recordings...')
    try {
      execSync('npx replayio remove --all', { stdio: 'inherit', cwd: APP_DIR })
    } catch {
      // may fail if no recordings exist
    }

    // 6. Run Playwright
    console.log(`\nRunning tests: ${testFile}\n`)
    try {
      execSync(`npx playwright test ${testFile} --retries 0`, {
        stdio: 'inherit',
        cwd: APP_DIR,
        env: { ...process.env, DATABASE_URL: databaseUrl },
      })
      playwrightExitCode = 0
    } catch (err) {
      const error = err as { status?: number }
      playwrightExitCode = error.status ?? 1
    }

    // 7. On failure — parse recordings and upload
    if (playwrightExitCode !== 0) {
      console.log('\nTests failed. Processing recordings...\n')

      const recordings = parseRecordingsLog()

      // Log metadata block
      const recordingsWithMeta = recordings.filter((r) => r.testResult)
      if (recordingsWithMeta.length > 0) {
        console.log('=== REPLAY RECORDINGS METADATA ===')
        for (const rec of recordingsWithMeta) {
          console.log(
            JSON.stringify({
              id: rec.id,
              testResult: rec.testResult,
              testTitle: rec.testTitle,
              specFile: rec.specFile,
              duration: rec.duration,
            }),
          )
        }
        console.log('=== END REPLAY RECORDINGS METADATA ===')
      }

      // Upload exactly ONE recording: failed/timedOut with longest duration
      const failedRecordings = recordings.filter(
        (r) =>
          r.writeFinished &&
          (r.testResult === 'failed' || r.testResult === 'timedOut'),
      )
      failedRecordings.sort((a, b) => b.duration - a.duration)

      if (failedRecordings.length > 0) {
        const toUpload = failedRecordings[0]
        console.log(
          `\nUploading recording ${toUpload.id} (${toUpload.testTitle}, duration: ${toUpload.duration}ms)...`,
        )
        try {
          execSync(`npx replayio upload ${toUpload.id}`, {
            stdio: 'inherit',
            cwd: APP_DIR,
          })
          console.log(`REPLAY UPLOADED: ${toUpload.id}`)
        } catch (err) {
          const error = err as { status?: number }
          console.error(`Recording upload failed with exit code: ${error.status ?? 'unknown'}`)
        }
      } else {
        console.log('No failed recordings found to upload.')
      }
    }
  } finally {
    // 8. Clean up
    console.log('\nCleaning up...')

    // Delete ephemeral branch
    try {
      console.log(`Deleting branch: ${branchName}`)
      await deleteBranch(neonProjectId, branchId)
    } catch (err) {
      console.error(`Failed to delete branch: ${err}`)
    }

    // Remove local recordings
    try {
      execSync('npx replayio remove --all', { stdio: 'inherit', cwd: APP_DIR })
    } catch {
      // ignore
    }
  }

  // 9. Exit with Playwright's exit code
  process.exit(playwrightExitCode)
}

main().catch((err) => {
  console.error('Test script failed:', err)
  process.exit(1)
})
