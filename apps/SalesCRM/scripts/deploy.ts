import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
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

function writeEnvVar(key: string, value: string): void {
  const envPath = resolve(APP_DIR, '.env')
  const existing = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : ''
  const lines = existing.split('\n')

  // Check if key already exists
  const idx = lines.findIndex((l) => {
    const trimmed = l.trim()
    if (!trimmed || trimmed.startsWith('#')) return false
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) return false
    return trimmed.slice(0, eqIdx).trim() === key
  })

  if (idx !== -1) {
    lines[idx] = `${key}=${value}`
  } else {
    // Append, ensuring there's a newline before if file doesn't end with one
    if (existing && !existing.endsWith('\n')) {
      lines.push('')
    }
    lines.push(`${key}=${value}`)
  }

  writeFileSync(envPath, lines.join('\n'))
}

function required(name: string): string {
  const val = process.env[name]
  if (!val) {
    console.error(`Missing required environment variable: ${name}`)
    process.exit(1)
  }
  return val
}

// ---------------------------------------------------------------------------
// Neon API helpers
// ---------------------------------------------------------------------------

const NEON_API = 'https://console.neon.tech/api/v2'

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

interface NeonProject {
  id: string
  name: string
}

interface NeonConnectionUri {
  connection_uri: string
}

async function createNeonProject(name: string): Promise<{ projectId: string; databaseUrl: string }> {
  const res = await neonFetch('/projects', {
    method: 'POST',
    body: JSON.stringify({
      project: { name },
    }),
  })
  const data = (await res.json()) as {
    project: NeonProject
    connection_uris: NeonConnectionUri[]
  }
  return {
    projectId: data.project.id,
    databaseUrl: data.connection_uris[0].connection_uri,
  }
}

// ---------------------------------------------------------------------------
// Deployment.txt helpers
// ---------------------------------------------------------------------------

function loadDeploymentTxt(): Record<string, string> {
  const path = resolve(APP_DIR, 'deployment.txt')
  const vars: Record<string, string> = {}
  if (existsSync(path)) {
    const lines = readFileSync(path, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      vars[key] = val
    }
  }
  return vars
}

function writeDeploymentTxt(vars: Record<string, string>): void {
  const path = resolve(APP_DIR, 'deployment.txt')
  const lines = Object.entries(vars).map(([k, v]) => `${k}=${v}`)
  writeFileSync(path, lines.join('\n') + '\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // Load .env into process.env
  const envVars = loadEnv()
  for (const [k, v] of Object.entries(envVars)) {
    if (!process.env[k]) process.env[k] = v
  }

  // Also populate from deployment.txt if .env is missing key values
  const deploymentVars = loadDeploymentTxt()
  const envMapping: Record<string, string> = {
    site_id: 'NETLIFY_SITE_ID',
    neon_project_id: 'NEON_PROJECT_ID',
    database_url: 'DATABASE_URL',
  }
  for (const [deployKey, envKey] of Object.entries(envMapping)) {
    if (!process.env[envKey] && deploymentVars[deployKey]) {
      process.env[envKey] = deploymentVars[deployKey]
      writeEnvVar(envKey, deploymentVars[deployKey])
      console.log(`Restored ${envKey} from deployment.txt`)
    }
  }

  // Check required env vars
  required('NEON_API_KEY')
  required('NETLIFY_AUTH_TOKEN')
  required('NETLIFY_ACCOUNT_SLUG')

  // -------------------------------------------------------------------------
  // 1. Database setup
  // -------------------------------------------------------------------------
  let neonProjectId = process.env.NEON_PROJECT_ID
  let databaseUrl = process.env.DATABASE_URL

  if (!neonProjectId) {
    console.log('Creating new Neon project...')
    const result = await createNeonProject('salescrm-production')
    neonProjectId = result.projectId
    databaseUrl = result.databaseUrl
    writeEnvVar('NEON_PROJECT_ID', neonProjectId)
    writeEnvVar('DATABASE_URL', databaseUrl)
    process.env.NEON_PROJECT_ID = neonProjectId
    process.env.DATABASE_URL = databaseUrl
    console.log(`Created Neon project: ${neonProjectId}`)
  }

  if (!databaseUrl) {
    console.error('DATABASE_URL is missing. Set it in .env or deployment.txt.')
    process.exit(1)
  }

  // -------------------------------------------------------------------------
  // 2. Database schema sync
  // -------------------------------------------------------------------------
  console.log('Syncing database schema...')
  await initSchema(databaseUrl)
  console.log('Schema sync complete.')

  // Run migrations if migrate-db script exists
  const migratePath = resolve(APP_DIR, 'scripts/migrate-db.ts')
  if (existsSync(migratePath)) {
    console.log('Running database migrations...')
    execSync('npx tsx scripts/migrate-db.ts', {
      stdio: 'inherit',
      cwd: APP_DIR,
      env: { ...process.env, DATABASE_URL: databaseUrl },
    })
    console.log('Migrations complete.')
  }

  // -------------------------------------------------------------------------
  // 3. Netlify site setup
  // -------------------------------------------------------------------------
  let siteId = process.env.NETLIFY_SITE_ID

  if (!siteId) {
    console.log('Creating new Netlify site...')
    const output = execSync(
      `npx netlify sites:create --account-slug ${process.env.NETLIFY_ACCOUNT_SLUG} --json`,
      {
        cwd: APP_DIR,
        env: { ...process.env },
        encoding: 'utf-8',
      },
    )
    const siteData = JSON.parse(output) as { id: string; ssl_url?: string; url?: string }
    siteId = siteData.id
    writeEnvVar('NETLIFY_SITE_ID', siteId)
    process.env.NETLIFY_SITE_ID = siteId
    console.log(`Created Netlify site: ${siteId}`)
  }

  // Set environment variables on the Netlify site
  console.log('Setting Netlify environment variables...')
  execSync(
    `npx netlify env:set DATABASE_URL "${databaseUrl}" --site ${siteId}`,
    { stdio: 'inherit', cwd: APP_DIR, env: { ...process.env } },
  )

  // -------------------------------------------------------------------------
  // 4. Build and deploy
  // -------------------------------------------------------------------------
  console.log('\nBuilding app...')
  execSync('npx vite build', {
    stdio: 'inherit',
    cwd: APP_DIR,
    env: { ...process.env },
  })

  console.log('\nDeploying to Netlify...')
  const deployOutput = execSync(
    `npx netlify deploy --prod --dir dist --functions ./netlify/functions --site ${siteId} --json`,
    {
      cwd: APP_DIR,
      env: { ...process.env },
      encoding: 'utf-8',
    },
  )
  const deployData = JSON.parse(deployOutput) as { deploy_url?: string; url?: string; ssl_url?: string }
  const deployedUrl = deployData.ssl_url ?? deployData.url ?? deployData.deploy_url ?? 'unknown'

  console.log(`\nDeployed to: ${deployedUrl}`)

  // -------------------------------------------------------------------------
  // 5. Write deployment.txt
  // -------------------------------------------------------------------------
  writeDeploymentTxt({
    url: deployedUrl,
    site_id: siteId,
    neon_project_id: neonProjectId,
    database_url: databaseUrl,
  })
  console.log('Updated deployment.txt')

  console.log('\nDeployment complete!')
}

main().catch((err) => {
  console.error('Deploy failed:', err)
  process.exit(1)
})
