import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
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

function setEnvValue(filePath: string, key: string, value: string) {
  let content = ''
  if (existsSync(filePath)) {
    content = readFileSync(filePath, 'utf-8')
  }
  const lines = content.split('\n')
  let found = false
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const lineKey = trimmed.slice(0, eqIndex).trim()
    if (lineKey === key) {
      lines[i] = `${key}=${value}`
      found = true
      break
    }
  }
  if (!found) {
    if (content && !content.endsWith('\n')) {
      lines.push('')
    }
    lines.push(`${key}=${value}`)
  }
  writeFileSync(filePath, lines.join('\n'))
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

function populateEnvFromDeployment(envPath: string, deploymentPath: string) {
  if (existsSync(envPath)) {
    const env = parseEnvFile(envPath)
    if (env.NEON_PROJECT_ID && env.NETLIFY_SITE_ID && env.DATABASE_URL) return
  }
  if (!existsSync(deploymentPath)) return

  console.log('Populating .env from deployment.txt...')
  const content = readFileSync(deploymentPath, 'utf-8')
  const values: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()
    values[key] = value
  }

  if (values.neon_project_id) setEnvValue(envPath, 'NEON_PROJECT_ID', values.neon_project_id)
  if (values.database_url) setEnvValue(envPath, 'DATABASE_URL', values.database_url)
  if (values.site_id) setEnvValue(envPath, 'NETLIFY_SITE_ID', values.site_id)
}

async function main() {
  const envPath = resolve('.env')
  const deploymentPath = resolve('deployment.txt')

  // Required environment variables
  const neonApiKey = process.env.NEON_API_KEY
  const netlifyAuthToken = process.env.NETLIFY_AUTH_TOKEN
  const netlifyAccountSlug = process.env.NETLIFY_ACCOUNT_SLUG

  if (!neonApiKey) { console.error('Missing NEON_API_KEY env var'); process.exit(1) }
  if (!netlifyAuthToken) { console.error('Missing NETLIFY_AUTH_TOKEN env var'); process.exit(1) }
  if (!netlifyAccountSlug) { console.error('Missing NETLIFY_ACCOUNT_SLUG env var'); process.exit(1) }

  // Populate .env from deployment.txt if needed
  populateEnvFromDeployment(envPath, deploymentPath)

  let env = parseEnvFile(envPath)

  // --- Database setup ---
  if (!env.NEON_PROJECT_ID) {
    console.log('Creating Neon project...')
    const data = await neonApi('/projects', neonApiKey, {
      method: 'POST',
      body: { project: { name: 'sales-crm' } },
    })
    const result = data as {
      project: { id: string }
      connection_uris: Array<{ connection_uri: string }>
    }
    const projectId = result.project.id
    const databaseUrl = result.connection_uris[0].connection_uri

    setEnvValue(envPath, 'NEON_PROJECT_ID', projectId)
    setEnvValue(envPath, 'DATABASE_URL', databaseUrl)
    env = parseEnvFile(envPath)
    console.log(`Created Neon project: ${projectId}`)
  }

  const databaseUrl = env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL not found in .env after project setup')
    process.exit(1)
  }

  // --- Database schema sync ---
  console.log('Syncing database schema...')
  await initSchema(databaseUrl)
  console.log('Running migrations...')
  await runMigrations(databaseUrl)

  // --- Netlify site setup ---
  if (!env.NETLIFY_SITE_ID) {
    console.log('Creating Netlify site...')
    const siteName = `sales-crm-${Date.now().toString(36)}`
    const siteRes = await fetch(`https://api.netlify.com/api/v1/${netlifyAccountSlug}/sites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyAuthToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: siteName }),
    })
    if (!siteRes.ok) {
      const text = await siteRes.text()
      throw new Error(`Netlify API error ${siteRes.status}: ${text}`)
    }
    const siteData = await siteRes.json() as { id: string }
    setEnvValue(envPath, 'NETLIFY_SITE_ID', siteData.id)
    env = parseEnvFile(envPath)
    console.log(`Created Netlify site: ${siteData.id} (${siteName})`)
  }

  const siteId = env.NETLIFY_SITE_ID!

  // --- Set Netlify environment variables ---
  console.log('Setting Netlify environment variables...')
  execSync(
    `netlify env:set DATABASE_URL "${databaseUrl}"`,
    { stdio: 'inherit', env: { ...process.env, NETLIFY_AUTH_TOKEN: netlifyAuthToken, NETLIFY_SITE_ID: siteId } }
  )

  // --- Build ---
  console.log('Building app...')
  execSync('npx vite build', { stdio: 'inherit' })

  // --- Deploy ---
  console.log('Deploying to Netlify...')
  const deployOutput = execSync(
    `netlify deploy --prod --no-build --dir dist --functions ./netlify/functions --site ${siteId} --json`,
    { encoding: 'utf-8', env: { ...process.env, NETLIFY_AUTH_TOKEN: netlifyAuthToken } }
  )
  const deployData = JSON.parse(deployOutput) as { deploy_url?: string; url?: string; ssl_url?: string }
  const deployedUrl = deployData.ssl_url || deployData.url || deployData.deploy_url || ''

  console.log(`Deployed to: ${deployedUrl}`)

  // --- Write deployment.txt ---
  const deploymentContent = [
    `deployed_url=${deployedUrl}`,
    `site_id=${siteId}`,
    `neon_project_id=${env.NEON_PROJECT_ID}`,
    `database_url=${databaseUrl}`,
    '',
  ].join('\n')
  writeFileSync(deploymentPath, deploymentContent)
  console.log('Wrote deployment.txt')

  console.log('Deployment complete.')
}

main().catch(err => {
  console.error('Deploy failed:', err)
  process.exit(1)
})
