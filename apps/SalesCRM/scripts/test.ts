/**
 * test script: Runs Playwright tests for a single test file with Replay browser,
 * automatic database branch setup/teardown, and failed-recording upload.
 *
 * Usage: npm run test tests/auth.spec.ts
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { homedir } from 'os'
import { initSchema } from './schema.ts'
import { runMigrations } from './migrate-db.ts'
import { seedDatabase } from './seed-db.ts'
import { createTestBranch, cleanupStaleBranches, deleteBranch } from './neon-branch.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BRANCH_PREFIX = 'test-worker-'
const APP_DIR = resolve(__dirname, '..')
const REPLAY_CLI = process.env.REPLAY_CLI || 'replayio'

function readEnvFile(): Record<string, string> {
  const envPath = resolve(APP_DIR, '.env')
  const result: Record<string, string> = {}
  if (!existsSync(envPath)) return result
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) result[match[1].trim()] = match[2].trim()
  }
  return result
}

function writeEnvValue(key: string, value: string) {
  const envPath = resolve(APP_DIR, '.env')
  const content = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : ''
  const regex = new RegExp(`^${key}=.*$`, 'm')
  if (regex.test(content)) {
    writeFileSync(envPath, content.replace(regex, `${key}=${value}`))
  } else {
    writeFileSync(envPath, content + (content.endsWith('\n') ? '' : '\n') + `${key}=${value}\n`)
  }
}

function killStaleProcesses() {
  try {
    execSync('pkill -f "netlify dev" 2>/dev/null || true', { stdio: 'ignore' })
    execSync('pkill -f "vite" 2>/dev/null || true', { stdio: 'ignore' })
    execSync('sleep 1', { stdio: 'ignore' })
    execSync('pkill -9 -f "netlify dev" 2>/dev/null || true', { stdio: 'ignore' })
    execSync('pkill -9 -f "vite" 2>/dev/null || true', { stdio: 'ignore' })
    execSync('sleep 1', { stdio: 'ignore' })
  } catch {
    // ignore
  }
}

function removeStaleRecordings() {
  try {
    execSync(`${REPLAY_CLI} remove --all 2>/dev/null || true`, { stdio: 'inherit', cwd: APP_DIR })
  } catch {
    // ignore
  }
}

interface RecordingEntry {
  id: string
  date: number
  metadata: Record<string, unknown>
  recordingStatus: string
  duration: number
}

function parseRecordingsLog(): RecordingEntry[] {
  const logPath = resolve(homedir(), '.replay', 'recordings.log')
  if (!existsSync(logPath)) return []

  const content = readFileSync(logPath, 'utf-8')
  const recordings: Record<string, RecordingEntry> = {}
  const writeStarts: Record<string, number> = {}

  for (const line of content.split('\n')) {
    if (!line.trim()) continue
    let entry: Record<string, unknown>
    try {
      entry = JSON.parse(line)
    } catch {
      continue
    }
    const kind = entry.kind as string
    const rid = entry.id as string
    if (!rid) continue

    if (kind === 'createRecording') {
      recordings[rid] = {
        id: rid,
        date: (entry.timestamp as number) || 0,
        metadata: {},
        recordingStatus: 'recording',
        duration: 0,
      }
    } else if (kind === 'addMetadata' && recordings[rid]) {
      Object.assign(recordings[rid].metadata, entry.metadata as Record<string, unknown>)
    } else if (kind === 'writeStarted' && recordings[rid]) {
      writeStarts[rid] = (entry.timestamp as number) || 0
    } else if (kind === 'writeFinished' && recordings[rid]) {
      recordings[rid].recordingStatus = 'finished'
      const startTs = writeStarts[rid] || 0
      const endTs = (entry.timestamp as number) || 0
      if (startTs && endTs) recordings[rid].duration = endTs - startTs
    } else if (kind === 'crashed' && recordings[rid]) {
      recordings[rid].recordingStatus = 'crashed'
    } else if (kind === 'recordingUnusable' && recordings[rid]) {
      recordings[rid].recordingStatus = 'unusable'
    }
  }

  return Object.values(recordings)
}

function handleFailedRecordings() {
  const recordings = parseRecordingsLog()

  // Print metadata block
  console.log('')
  console.log('=== REPLAY RECORDINGS METADATA ===')
  for (const r of recordings) {
    const testMeta = r.metadata.test as Record<string, unknown> | undefined
    if (!testMeta) continue
    const source = testMeta.source as Record<string, unknown> | undefined
    const entry = {
      id: r.id,
      date: r.date ? new Date(r.date).toISOString() : '',
      duration: r.duration,
      uri: (r.metadata.uri as string) || '',
      recordingStatus: r.recordingStatus,
      testResult: (testMeta.result as string) || '',
      testTitle: source?.title || '',
      specFile: source?.path || '',
    }
    console.log(JSON.stringify(entry))
  }
  console.log('=== END REPLAY RECORDINGS METADATA ===')
  console.log('')

  // Find the single longest failed/timedOut recording to upload
  // Each test run produces multiple recordings (stubs + real); only upload the real one
  const failedRecordings = recordings.filter((r) => {
    if (r.recordingStatus !== 'finished') return false
    const testMeta = r.metadata.test as Record<string, unknown> | undefined
    const result = testMeta?.result as string | undefined
    return result === 'failed' || result === 'timedOut'
  })

  // Pick the one with the longest duration — that's the real recording
  const best = failedRecordings.sort((a, b) => b.duration - a.duration)[0]

  if (!best) {
    console.log('WARNING: No failed recordings found to upload.')
  } else {
    console.log(`Uploading recording: ${best.id} (duration: ${best.duration})`)
    try {
      execSync(`${REPLAY_CLI} upload ${best.id}`, {
        cwd: APP_DIR,
        stdio: 'inherit',
        timeout: 120_000,
      })
      console.log(`REPLAY UPLOADED: ${best.id}`)
    } catch (uploadErr: unknown) {
      const e = uploadErr as { status?: number }
      console.error(`Failed to upload recording ${best.id} (exit code ${e.status})`)
    }
  }

  // Clean up local recordings
  removeStaleRecordings()
}

async function main() {
  const testFile = process.argv[2]
  if (!testFile) {
    console.error('Usage: npm run test <testFile>')
    console.error('Example: npm run test tests/auth.spec.ts')
    process.exit(1)
  }

  const envVars = readEnvFile()
  const origDatabaseUrl = envVars.DATABASE_URL || process.env.DATABASE_URL || ''

  if (!origDatabaseUrl) {
    console.error('DATABASE_URL not found in .env or environment. Run npm run deploy first.')
    process.exit(1)
  }

  const runId = Date.now()
  let branchId: string | null = null

  try {
    // Step 1: Kill stale processes
    console.log('Killing stale dev server processes...')
    killStaleProcesses()

    // Step 2: Clean up stale Neon branches
    console.log('Cleaning up stale test branches...')
    await cleanupStaleBranches(BRANCH_PREFIX)

    // Step 3: Create ephemeral Neon branch
    const branchName = `${BRANCH_PREFIX}${runId}`
    console.log(`Creating test database branch: ${branchName}`)
    const branch = await createTestBranch(branchName)
    branchId = branch.branchId

    // Step 4: Initialize and seed
    console.log('Initializing schema on test branch...')
    await initSchema(branch.connectionUri)
    await runMigrations(branch.connectionUri)

    console.log('Seeding test branch...')
    await seedDatabase(branch.connectionUri)

    // Write branch data for the playwright config's webServer and globalSetup/Teardown
    const branchDataPath = resolve(APP_DIR, 'tests', 'test-branch-data.json')
    writeFileSync(branchDataPath, JSON.stringify({
      branchId: branch.branchId,
      connectionUri: branch.connectionUri,
    }, null, 2))

    // Update .env with test branch DATABASE_URL so netlify dev picks it up
    writeEnvValue('DATABASE_URL', branch.connectionUri)
    console.log('Updated .env with test branch DATABASE_URL')

    // Step 5: Remove stale recordings
    console.log('Cleaning up stale Replay recordings...')
    removeStaleRecordings()

    // Step 6: Run Playwright
    console.log(`\nRunning tests: ${testFile}\n`)
    let pwExitCode = 0
    try {
      execSync(
        `npx playwright test ${testFile} --retries 0`,
        { stdio: 'inherit', cwd: APP_DIR, env: { ...process.env } },
      )
    } catch (err: unknown) {
      const exitErr = err as { status?: number }
      pwExitCode = exitErr.status || 1
    }

    // Step 7: On failure, handle recordings
    if (pwExitCode !== 0) {
      console.log('\n=== Tests failed — processing Replay recordings ===')
      handleFailedRecordings()
    }

    // Step 8: Cleanup — restore .env and delete branch
    writeEnvValue('DATABASE_URL', origDatabaseUrl)
    console.log('Restored .env DATABASE_URL')

    if (branchId) {
      console.log(`Deleting test database branch: ${branchId}`)
      await deleteBranch(branchId)
    }

    // Clean up temp files
    try { unlinkSync(resolve(APP_DIR, 'tests', 'test-branch-data.json')) } catch { /* ignore */ }

    removeStaleRecordings()

    // Step 9: Exit with Playwright's exit code
    process.exit(pwExitCode)
  } catch (err) {
    // On unexpected error, still try to clean up
    console.error('Test script failed:', err)

    writeEnvValue('DATABASE_URL', origDatabaseUrl)
    if (branchId) {
      try { await deleteBranch(branchId) } catch { /* ignore */ }
    }
    try { unlinkSync(resolve(APP_DIR, 'tests', 'test-branch-data.json')) } catch { /* ignore */ }

    process.exit(1)
  }
}

main()
