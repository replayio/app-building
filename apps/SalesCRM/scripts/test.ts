import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { homedir } from 'os'
import { initSchema, runMigrations } from './schema.ts'

const NEON_API_BASE = 'https://console.neon.tech/api/v2'

function parseEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {}
  if (!existsSync(filePath)) return env
  const content = readFileSync(filePath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

async function neonApi(path: string, apiKey: string, options?: { method?: string; body?: unknown }) {
  const res = await fetch(`${NEON_API_BASE}${path}`, {
    method: options?.method || 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Neon API error ${res.status}: ${text}`)
  }
  if (res.status === 204) return null
  return res.json()
}

function killStaleProcesses() {
  try { execSync('pkill -f "netlify" 2>/dev/null || true', { stdio: 'ignore' }) } catch { /* ok */ }
  try { execSync('pkill -f "vite" 2>/dev/null || true', { stdio: 'ignore' }) } catch { /* ok */ }
}

async function cleanupStaleBranches(projectId: string, apiKey: string) {
  const data = await neonApi(`/projects/${projectId}/branches`, apiKey)
  const branches = (data as { branches: Array<{ id: string; name: string }> }).branches
  for (const branch of branches) {
    if (branch.name.startsWith('test-worker-')) {
      console.log(`Deleting stale branch: ${branch.name}`)
      await neonApi(`/projects/${projectId}/branches/${branch.id}`, apiKey, { method: 'DELETE' })
    }
  }
}

async function createEphemeralBranch(projectId: string, apiKey: string): Promise<{ branchId: string; databaseUrl: string }> {
  const runId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  const branchName = `test-worker-${runId}`

  const data = await neonApi(`/projects/${projectId}/branches`, apiKey, {
    method: 'POST',
    body: {
      branch: { name: branchName },
      endpoints: [{ type: 'read_write' }],
    },
  })

  const result = data as {
    branch: { id: string }
    connection_uris: Array<{ connection_uri: string }>
  }
  const branchId = result.branch.id
  const connectionUri = result.connection_uris[0].connection_uri

  console.log(`Created ephemeral branch: ${branchName} (${branchId})`)
  return { branchId, databaseUrl: connectionUri }
}

async function deleteBranch(projectId: string, branchId: string, apiKey: string) {
  try {
    await neonApi(`/projects/${projectId}/branches/${branchId}`, apiKey, { method: 'DELETE' })
    console.log(`Deleted ephemeral branch: ${branchId}`)
  } catch (err) {
    console.error(`Failed to delete branch ${branchId}:`, err)
  }
}

interface RecordingInfo {
  id: string
  metadata?: { test?: { result?: string; title?: string; file?: string } }
  duration: number
  writeFinished: boolean
}

function parseRecordingsLog(): RecordingInfo[] {
  const logPath = join(homedir(), '.replay', 'recordings.log')
  if (!existsSync(logPath)) return []
  const content = readFileSync(logPath, 'utf-8')
  const recordings = new Map<string, RecordingInfo>()

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      const entry = JSON.parse(trimmed) as {
        kind: string
        id?: string
        metadata?: RecordingInfo['metadata']
        duration?: number
      }
      if (!entry.id) continue

      if (entry.kind === 'createRecording') {
        recordings.set(entry.id, { id: entry.id, duration: entry.duration ?? 0, writeFinished: false })
      } else if (entry.kind === 'addMetadata') {
        const rec = recordings.get(entry.id)
        if (rec && entry.metadata) {
          rec.metadata = { ...rec.metadata, ...entry.metadata }
        }
      } else if (entry.kind === 'writeFinished') {
        const rec = recordings.get(entry.id)
        if (rec) {
          rec.writeFinished = true
          if (entry.duration !== undefined) rec.duration = entry.duration
        }
      }
    } catch { /* skip malformed lines */ }
  }

  return [...recordings.values()]
}

function handleFailedRecordings() {
  const recordings = parseRecordingsLog()

  const withTestMetadata = recordings.filter(r => r.metadata?.test)
  if (withTestMetadata.length > 0) {
    console.log('=== REPLAY RECORDINGS METADATA ===')
    for (const rec of withTestMetadata) {
      console.log(JSON.stringify({
        id: rec.id,
        testResult: rec.metadata?.test?.result,
        testTitle: rec.metadata?.test?.title,
        specFile: rec.metadata?.test?.file,
      }))
    }
    console.log('=== END REPLAY RECORDINGS METADATA ===')
  }

  const failedRecordings = recordings
    .filter(r => r.writeFinished && (r.metadata?.test?.result === 'failed' || r.metadata?.test?.result === 'timedOut'))
    .sort((a, b) => b.duration - a.duration)

  if (failedRecordings.length > 0) {
    const toUpload = failedRecordings[0]
    console.log(`Uploading recording ${toUpload.id}...`)
    try {
      execSync(`npx replayio upload ${toUpload.id}`, { stdio: 'inherit' })
      console.log(`REPLAY UPLOADED: ${toUpload.id}`)
    } catch (err) {
      const exitCode = (err as { status?: number }).status ?? 1
      console.error(`Upload failed with exit code ${exitCode}`)
    }
  }
}

async function main() {
  const testFile = process.argv[2]
  if (!testFile) {
    console.error('Usage: npm run test <test-file>')
    process.exit(1)
  }

  const envVars = parseEnvFile(resolve('.env'))
  const neonApiKey = process.env.NEON_API_KEY
  const projectId = envVars.NEON_PROJECT_ID || process.env.NEON_PROJECT_ID

  if (!neonApiKey) { console.error('Missing NEON_API_KEY env var'); process.exit(1) }
  if (!process.env.RECORD_REPLAY_API_KEY) { console.error('Missing RECORD_REPLAY_API_KEY env var'); process.exit(1) }
  if (!projectId) { console.error('Missing NEON_PROJECT_ID in .env'); process.exit(1) }

  // Step 1: Kill stale processes
  console.log('Killing stale processes...')
  killStaleProcesses()

  // Step 2: Clean up stale Neon branches
  console.log('Cleaning up stale Neon branches...')
  await cleanupStaleBranches(projectId, neonApiKey)

  // Step 3: Create ephemeral Neon branch
  console.log('Creating ephemeral Neon branch...')
  const { branchId, databaseUrl } = await createEphemeralBranch(projectId, neonApiKey)

  let playwrightExitCode = 0

  try {
    // Step 4: Initialize schema, run migrations, seed
    console.log('Initializing schema...')
    await initSchema(databaseUrl)
    await runMigrations(databaseUrl)

    try {
      const seedModule = await import('./seed-db.ts') as { seed?: (url: string) => Promise<void> }
      if (seedModule.seed) {
        console.log('Seeding test data...')
        await seedModule.seed(databaseUrl)
      }
    } catch { /* seed-db not available, skip seeding */ }

    // Step 5: Remove stale recordings
    console.log('Removing stale recordings...')
    try { execSync('npx replayio remove --all', { stdio: 'inherit' }) } catch { /* ok */ }

    // Step 6: Run Playwright
    console.log(`Running Playwright tests: ${testFile}`)
    try {
      execSync(`npx playwright test ${testFile} --retries 0`, {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: databaseUrl },
      })
    } catch (err) {
      playwrightExitCode = (err as { status?: number }).status || 1
    }

    // Step 7: On failure, handle recordings
    if (playwrightExitCode !== 0) {
      console.log('Tests failed. Processing recordings...')
      handleFailedRecordings()
    }
  } finally {
    // Step 8: Clean up
    console.log('Cleaning up...')
    await deleteBranch(projectId, branchId, neonApiKey)
    try { execSync('npx replayio remove --all', { stdio: 'inherit' }) } catch { /* ok */ }
  }

  // Step 9: Exit with Playwright exit code
  process.exit(playwrightExitCode)
}

main().catch(err => {
  console.error('Test script failed:', err)
  process.exit(1)
})
