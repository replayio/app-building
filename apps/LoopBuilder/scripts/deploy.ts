import { spawnSync } from 'child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { initSchema } from './schema.js'
import { runMigrations } from './migrate.js'

const appDir = join(import.meta.dirname, '..')
const logDir = join(appDir, 'logs')
const logFile = join(logDir, 'deploy.log')
const envPath = join(appDir, '.env')
const deploymentPath = join(appDir, 'deployment.txt')

mkdirSync(logDir, { recursive: true })

let log = ''
function appendLog(text: string) {
  log += text + '\n'
}

// --- .env helpers ---

function readEnvFile(): Record<string, string> {
  if (!existsSync(envPath)) return {}
  const content = readFileSync(envPath, 'utf-8')
  const vars: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    vars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim()
  }
  return vars
}

function writeEnvVar(key: string, value: string) {
  const vars = readEnvFile()
  if (vars[key]) return // don't clobber existing
  const line = `${key}=${value}\n`
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8')
    writeFileSync(envPath, content.endsWith('\n') ? content + line : content + '\n' + line)
  } else {
    writeFileSync(envPath, line)
  }
}

// --- Load .env into process.env ---

function loadEnv() {
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
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
}

// --- Populate .env from deployment.txt ---

function populateEnvFromDeployment() {
  if (!existsSync(deploymentPath)) return
  const content = readFileSync(deploymentPath, 'utf-8')
  const fields: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const match = line.match(/^(\w+):\s*(.+)$/)
    if (match) {
      fields[match[1]] = match[2].trim()
    }
    // Stop at the first history separator
    if (line.startsWith('---')) break
  }
  if (fields['site_id'] && !readEnvFile()['NETLIFY_SITE_ID']) {
    writeEnvVar('NETLIFY_SITE_ID', fields['site_id'])
  }
  if (fields['neon_project_id'] && !readEnvFile()['NEON_PROJECT_ID']) {
    writeEnvVar('NEON_PROJECT_ID', fields['neon_project_id'])
  }
  if (fields['database_url'] && !readEnvFile()['DATABASE_URL']) {
    writeEnvVar('DATABASE_URL', fields['database_url'])
  }
}

// --- Neon API ---

function getNeonHeaders() {
  return {
    'Authorization': `Bearer ${process.env.NEON_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

async function neonApi(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`https://console.neon.tech/api/v2${path}`, {
    ...options,
    headers: { ...getNeonHeaders(), ...options.headers as Record<string, string> },
  })
}

async function createNeonProject(): Promise<{ projectId: string; databaseUrl: string }> {
  const appName = JSON.parse(readFileSync(join(appDir, 'package.json'), 'utf-8')).name as string
  const res = await neonApi('/projects', {
    method: 'POST',
    body: JSON.stringify({
      project: { name: appName },
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create Neon project: ${res.status} ${text}`)
  }
  const data = await res.json() as {
    project: { id: string }
    connection_uris: Array<{ connection_uri: string }>
  }
  return {
    projectId: data.project.id,
    databaseUrl: data.connection_uris[0].connection_uri,
  }
}

// --- deployment.txt helpers ---

function updateDeploymentTxt(url: string, siteId: string, neonProjectId: string, databaseUrl: string) {
  const resourceBlock = [
    `url: ${url}`,
    `site_id: ${siteId}`,
    `neon_project_id: ${neonProjectId}`,
    `database_url: ${databaseUrl}`,
    `deployed_at: ${new Date().toISOString()}`,
  ].join('\n')

  let historySection = ''
  if (existsSync(deploymentPath)) {
    const existing = readFileSync(deploymentPath, 'utf-8')
    const historyIdx = existing.indexOf('\n---')
    if (historyIdx !== -1) {
      historySection = existing.slice(historyIdx)
    }
  }

  writeFileSync(deploymentPath, resourceBlock + '\n' + historySection)
}

// --- Main ---

async function main() {
  // Step 0: Populate .env from deployment.txt if needed
  populateEnvFromDeployment()
  loadEnv()

  // Validate required env vars
  if (!process.env.NEON_API_KEY) { console.error('Missing NEON_API_KEY'); process.exit(1) }
  if (!process.env.NETLIFY_AUTH_TOKEN) { console.error('Missing NETLIFY_AUTH_TOKEN'); process.exit(1) }
  if (!process.env.NETLIFY_ACCOUNT_SLUG) { console.error('Missing NETLIFY_ACCOUNT_SLUG'); process.exit(1) }

  try {
    // Step 1: Database setup
    let neonProjectId = process.env.NEON_PROJECT_ID || ''
    let databaseUrl = process.env.DATABASE_URL || ''

    if (!neonProjectId) {
      appendLog('Creating new Neon project...')
      const neon = await createNeonProject()
      neonProjectId = neon.projectId
      databaseUrl = neon.databaseUrl
      writeEnvVar('NEON_PROJECT_ID', neonProjectId)
      writeEnvVar('DATABASE_URL', databaseUrl)
      // Reload env so subsequent steps see the new values
      process.env.NEON_PROJECT_ID = neonProjectId
      process.env.DATABASE_URL = databaseUrl
      appendLog(`Neon project created: ${neonProjectId}`)
    }

    if (!databaseUrl) {
      console.error('Missing DATABASE_URL — set it in .env or deployment.txt')
      process.exit(1)
    }

    // Step 2: Schema sync
    appendLog('Syncing database schema...')
    await initSchema(databaseUrl)
    appendLog('Schema synced.')

    // Step 3: Run migrations
    appendLog('Running migrations...')
    await runMigrations(databaseUrl)
    appendLog('Migrations complete.')

    // Step 4: Netlify site setup
    let siteId = process.env.NETLIFY_SITE_ID || ''

    if (!siteId) {
      appendLog('Creating new Netlify site...')
      const appName = JSON.parse(readFileSync(join(appDir, 'package.json'), 'utf-8')).name as string
      const siteName = `${appName}-${Date.now()}`
      const create = spawnSync('npx', [
        'netlify', 'sites:create',
        '--account-slug', process.env.NETLIFY_ACCOUNT_SLUG!,
        '--name', siteName,
        '--disable-linking',
      ], {
        cwd: appDir,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf-8',
        timeout: 60_000,
      })
      appendLog('=== NETLIFY SITES:CREATE STDOUT ===')
      appendLog(create.stdout || '')
      appendLog('=== NETLIFY SITES:CREATE STDERR ===')
      appendLog(create.stderr || '')

      if (create.status !== 0) {
        throw new Error('Failed to create Netlify site')
      }

      // Parse site ID from output (format: "Project ID: <id>" or "Site ID: <id>")
      // eslint-disable-next-line no-control-regex
      const plain = (create.stdout || '').replace(/\x1b\[\d+m/g, '')
      const idMatch = plain.match(/(?:Project|Site) ID:\s*([a-f0-9-]+)/)
      if (!idMatch) {
        appendLog('Could not parse site ID from netlify output')
        throw new Error('Failed to parse Netlify site ID')
      }
      siteId = idMatch[1]
      writeEnvVar('NETLIFY_SITE_ID', siteId)
      process.env.NETLIFY_SITE_ID = siteId
      appendLog(`Netlify site created: ${siteId}`)
    }

    // Step 5: Build
    appendLog('Building app...')
    const build = spawnSync('npx', ['vite', 'build'], {
      cwd: appDir,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf-8',
      timeout: 120_000,
    })
    appendLog('=== BUILD STDOUT ===')
    appendLog(build.stdout || '')
    appendLog('=== BUILD STDERR ===')
    appendLog(build.stderr || '')

    if (build.status !== 0) {
      throw new Error('build')
    }

    // Step 6: Deploy to Netlify
    appendLog('Deploying to Netlify...')
    const deploy = spawnSync('npx', [
      'netlify', 'deploy', '--prod',
      '--no-build',
      '--dir', 'dist',
      '--functions', './netlify/functions',
      '--site', siteId,
    ], {
      cwd: appDir,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf-8',
      timeout: 180_000,
    })
    appendLog('=== DEPLOY STDOUT ===')
    appendLog(deploy.stdout || '')
    appendLog('=== DEPLOY STDERR ===')
    appendLog(deploy.stderr || '')

    if (deploy.status !== 0) {
      throw new Error('netlify')
    }

    // Extract deployed URL from output
    let deployedUrl = ''
    const urlMatch = (deploy.stdout || '').match(/https:\/\/[^\s]+\.netlify\.app[^\s]*/)
    if (urlMatch) {
      deployedUrl = urlMatch[0]
    }

    // Step 7: Update deployment.txt
    updateDeploymentTxt(deployedUrl || `https://${siteId}.netlify.app`, siteId, neonProjectId, databaseUrl)

    // Step 8: Print summary
    console.log(`Deployed to ${deployedUrl || siteId}`)
  } catch (err) {
    const step = err instanceof Error && (err.message === 'build' || err.message === 'netlify')
      ? err.message
      : 'unknown'
    appendLog(`Deploy failed: ${err}`)
    console.log(`Deploy failed (${step}) — see logs/deploy.log`)
    writeFileSync(logFile, log)
    process.exit(1)
  }

  writeFileSync(logFile, log)
}

main()
