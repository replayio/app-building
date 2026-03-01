import { execSync, spawnSync } from 'child_process'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { initSchema } from './schema.js'
import { runMigrations } from './migrate.js'
import { seedTestData } from './seed-db.js'

const appDir = join(import.meta.dirname, '..')
const logDir = join(appDir, 'logs')
mkdirSync(logDir, { recursive: true })

const testFile = process.argv[2]
if (!testFile) {
  console.error('Usage: npm run test <test-file>')
  process.exit(1)
}

// Read .env if present
const envPath = join(appDir, '.env')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) {
      process.env[key] = val
    }
  }
}

const NEON_API_KEY = process.env.NEON_API_KEY
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID
const DATABASE_URL = process.env.DATABASE_URL
const REPLAY_CLI = process.env.REPLAY_CLI || 'replayio'

if (!NEON_API_KEY) { console.error('Missing NEON_API_KEY'); process.exit(1) }
if (!NEON_PROJECT_ID) { console.error('Missing NEON_PROJECT_ID'); process.exit(1) }
if (!DATABASE_URL) { console.error('Missing DATABASE_URL'); process.exit(1) }

const runId = randomUUID().slice(0, 8)
const branchName = `test-worker-${runId}`

// Determine log file number
const existingLogs = readdirSync(logDir).filter(f => /^test-run-\d+\.log$/.test(f))
const maxNum = existingLogs.reduce((max, f) => {
  const n = parseInt(f.match(/test-run-(\d+)\.log/)?.[1] || '0', 10)
  return n > max ? n : max
}, 0)
const logNum = maxNum + 1
const logFile = join(logDir, `test-run-${logNum}.log`)

let log = ''
function appendLog(text: string) {
  log += text + '\n'
}

const neonHeaders = {
  'Authorization': `Bearer ${NEON_API_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}

async function neonApi(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`https://console.neon.tech/api/v2${path}`, {
    ...options,
    headers: { ...neonHeaders, ...options.headers as Record<string, string> },
  })
}

function killStaleProcesses() {
  try { execSync('pkill -f "netlify dev"', { stdio: 'ignore' }) } catch { /* no-op */ }
  try { execSync('pkill -f "vite"', { stdio: 'ignore' }) } catch { /* no-op */ }
}

async function cleanupStaleBranches() {
  const res = await neonApi(`/projects/${NEON_PROJECT_ID}/branches`)
  if (!res.ok) return
  const data = await res.json() as { branches: Array<{ id: string; name: string }> }
  for (const branch of data.branches) {
    if (branch.name.startsWith('test-worker-')) {
      await neonApi(`/projects/${NEON_PROJECT_ID}/branches/${branch.id}`, { method: 'DELETE' })
    }
  }
}

async function createBranch(): Promise<{ branchId: string; host: string }> {
  const res = await neonApi(`/projects/${NEON_PROJECT_ID}/branches`, {
    method: 'POST',
    body: JSON.stringify({
      branch: { name: branchName },
      endpoints: [{ type: 'read_write' }],
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create Neon branch: ${res.status} ${text}`)
  }
  const data = await res.json() as {
    branch: { id: string }
    endpoints: Array<{ host: string }>
  }
  return { branchId: data.branch.id, host: data.endpoints[0].host }
}

function buildDatabaseUrl(host: string): string {
  const url = new URL(DATABASE_URL!)
  url.hostname = host
  return url.toString()
}

async function deleteBranch(branchId: string) {
  await neonApi(`/projects/${NEON_PROJECT_ID}/branches/${branchId}`, { method: 'DELETE' })
}

function removeRecordings() {
  try {
    execSync(`npx ${REPLAY_CLI} remove --all`, { cwd: appDir, stdio: 'ignore' })
  } catch { /* no-op */ }
}

interface RecordingsLogEntry {
  kind: string
  id?: string
  metadata?: {
    test?: {
      result?: string
      title?: string
      path?: string[]
    }
  }
  recordingId?: string
  duration?: number
}

function parseRecordingsLog(): RecordingsLogEntry[] {
  const logPath = join(process.env.HOME || '~', '.replay', 'recordings.log')
  if (!existsSync(logPath)) return []
  const content = readFileSync(logPath, 'utf-8')
  const entries: RecordingsLogEntry[] = []
  for (const line of content.split('\n')) {
    if (!line.trim()) continue
    try {
      entries.push(JSON.parse(line))
    } catch { /* skip malformed lines */ }
  }
  return entries
}

interface RecordingInfo {
  id: string
  testResult: string
  testTitle: string
  specFile: string
  duration: number
}

function extractRecordingMetadata(entries: RecordingsLogEntry[]): RecordingInfo[] {
  const recordingMap = new Map<string, RecordingInfo>()

  // First pass: collect createRecording entries
  for (const entry of entries) {
    if (entry.kind === 'createRecording' && entry.id) {
      recordingMap.set(entry.id, {
        id: entry.id,
        testResult: '',
        testTitle: '',
        specFile: '',
        duration: 0,
      })
    }
  }

  // Second pass: enrich with metadata
  for (const entry of entries) {
    if (entry.kind === 'addMetadata' && entry.id && entry.metadata?.test) {
      const rec = recordingMap.get(entry.id)
      if (rec) {
        rec.testResult = entry.metadata.test.result || ''
        rec.testTitle = entry.metadata.test.title || ''
        rec.specFile = entry.metadata.test.path?.join('/') || ''
      }
    }
    if (entry.kind === 'writeFinished' && entry.id) {
      const rec = recordingMap.get(entry.id)
      if (rec && entry.duration) {
        rec.duration = entry.duration
      }
    }
  }

  return [...recordingMap.values()].filter(r => r.testResult)
}

interface PlaywrightResults {
  passed: number
  failed: number
  skipped: number
}

interface SuiteData {
  specs?: Array<{
    tests?: Array<{ results?: Array<{ status?: string }> }>
  }>
  suites?: SuiteData[]
}

function countResults(suites: SuiteData[], counts: { passed: number; failed: number; skipped: number }) {
  for (const suite of suites) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          if (result.status === 'passed') counts.passed++
          else if (result.status === 'skipped') counts.skipped++
          else counts.failed++
        }
      }
    }
    if (suite.suites) {
      countResults(suite.suites, counts)
    }
  }
}

function parsePlaywrightResults(): PlaywrightResults {
  const resultsPath = join(appDir, 'test-results', 'results.json')
  if (!existsSync(resultsPath)) return { passed: 0, failed: 0, skipped: 0 }
  const data = JSON.parse(readFileSync(resultsPath, 'utf-8')) as { suites?: SuiteData[] }
  const counts = { passed: 0, failed: 0, skipped: 0 }
  countResults(data.suites || [], counts)
  return counts
}

async function main() {
  let branchId = ''
  let playwrightExitCode = 1

  try {
    // Step 1: Kill stale processes
    killStaleProcesses()

    // Step 2: Clean up stale Neon branches
    await cleanupStaleBranches()

    // Step 3: Create ephemeral Neon branch
    appendLog(`Creating Neon branch: ${branchName}`)
    const branch = await createBranch()
    branchId = branch.branchId
    const branchDatabaseUrl = buildDatabaseUrl(branch.host)
    appendLog(`Branch created: ${branchId} (host: ${branch.host})`)

    // Step 4: Initialize schema, run migrations, seed data
    appendLog('Initializing schema...')
    await initSchema(branchDatabaseUrl)
    appendLog('Running migrations...')
    await runMigrations(branchDatabaseUrl)
    appendLog('Seeding test data...')
    await seedTestData(branchDatabaseUrl)
    appendLog('Database ready.')

    // Step 5: Remove stale recordings
    removeRecordings()

    // Step 6: Run Playwright
    appendLog(`Running: npx playwright test ${testFile} --retries 0`)
    const pw = spawnSync('npx', ['playwright', 'test', testFile, '--retries', '0'], {
      cwd: appDir,
      env: { ...process.env, DATABASE_URL: branchDatabaseUrl },
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf-8',
      timeout: 600_000,
    })
    appendLog('=== PLAYWRIGHT STDOUT ===')
    appendLog(pw.stdout || '')
    appendLog('=== PLAYWRIGHT STDERR ===')
    appendLog(pw.stderr || '')
    playwrightExitCode = pw.status ?? 1

    // Step 7: Parse results
    const results = parsePlaywrightResults()
    appendLog(`Results: ${results.passed} passed, ${results.failed} failed, ${results.skipped} skipped`)

    // Step 8: On failure — handle recordings
    let uploadedId = ''
    if (playwrightExitCode !== 0) {
      const entries = parseRecordingsLog()
      const recordings = extractRecordingMetadata(entries)

      if (recordings.length > 0) {
        appendLog('=== REPLAY RECORDINGS METADATA ===')
        for (const rec of recordings) {
          appendLog(JSON.stringify(rec))
        }
        appendLog('=== END REPLAY RECORDINGS METADATA ===')

        // Pick longest-duration failed recording
        const failedRecs = recordings.filter(
          r => r.testResult === 'failed' || r.testResult === 'timedOut'
        )
        if (failedRecs.length > 0) {
          const best = failedRecs.reduce((a, b) => a.duration > b.duration ? a : b)
          appendLog(`Uploading recording: ${best.id}`)
          const upload = spawnSync('npx', [REPLAY_CLI, 'upload', best.id], {
            cwd: appDir,
            env: process.env,
            stdio: ['ignore', 'pipe', 'pipe'],
            encoding: 'utf-8',
            timeout: 120_000,
          })
          if (upload.status === 0) {
            // Extract the recording ID from upload output
            const match = (upload.stdout || '').match(/([a-f0-9-]{36})/)
            uploadedId = match ? match[1] : best.id
            appendLog(`REPLAY UPLOADED: ${uploadedId}`)
          } else {
            appendLog(`Upload failed with exit code: ${upload.status}`)
            appendLog(upload.stdout || '')
            appendLog(upload.stderr || '')
          }
        }
      }
    }

    // Step 10: Print summary
    const parts: string[] = []
    if (results.passed > 0) parts.push(`${results.passed} passed`)
    if (results.failed > 0) parts.push(`${results.failed} failed`)
    if (results.skipped > 0) parts.push(`${results.skipped} skipped`)
    let summary = parts.join(', ') || '0 tests'
    if (uploadedId) summary += ` (recording: ${uploadedId})`
    if (playwrightExitCode !== 0) summary += ` — see logs/test-run-${logNum}.log`
    console.log(summary)
  } catch (err) {
    appendLog(`Fatal error: ${err}`)
    console.error(`test failed — see logs/test-run-${logNum}.log`)
    playwrightExitCode = 1
  } finally {
    // Step 9: Clean up
    if (branchId) {
      try { await deleteBranch(branchId) } catch { /* no-op */ }
    }
    removeRecordings()
    writeFileSync(logFile, log)
  }

  process.exit(playwrightExitCode)
}

main()
