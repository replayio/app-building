/**
 * deploy script: Creates and/or syncs the production Neon database,
 * creates and/or updates the Netlify site, builds, and deploys.
 *
 * Project info (NEON_PROJECT_ID, DATABASE_URL, NETLIFY_SITE_ID) is stored
 * in .env so subsequent runs reuse existing resources.
 *
 * Usage: npm run deploy
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { initSchema } from './schema.ts'
import { runMigrations } from './migrate-db.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const APP_DIR = resolve(__dirname, '..')
const ENV_PATH = resolve(APP_DIR, '.env')

function readEnvFile(): Record<string, string> {
  const result: Record<string, string> = {}
  if (!existsSync(ENV_PATH)) return result
  const content = readFileSync(ENV_PATH, 'utf-8')
  for (const line of content.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) result[match[1].trim()] = match[2].trim()
  }
  return result
}

function writeEnvValue(key: string, value: string) {
  const content = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf-8') : ''
  const regex = new RegExp(`^${key}=.*$`, 'm')
  if (regex.test(content)) {
    writeFileSync(ENV_PATH, content.replace(regex, `${key}=${value}`))
  } else {
    writeFileSync(ENV_PATH, content + (content.endsWith('\n') ? '' : '\n') + `${key}=${value}\n`)
  }
}

function requireEnv(name: string): string {
  const val = process.env[name]
  if (!val) {
    console.error(`Error: ${name} environment variable is required`)
    process.exit(1)
  }
  return val
}

async function ensureNeonProject(neonApiKey: string): Promise<{ projectId: string; databaseUrl: string }> {
  const envVars = readEnvFile()

  if (envVars.NEON_PROJECT_ID && envVars.DATABASE_URL) {
    console.log(`Using existing Neon project: ${envVars.NEON_PROJECT_ID}`)
    return { projectId: envVars.NEON_PROJECT_ID, databaseUrl: envVars.DATABASE_URL }
  }

  console.log('Creating new Neon project...')
  const res = await fetch('https://console.neon.tech/api/v2/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${neonApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project: {
        name: `sales-crm-${Date.now()}`,
        pg_version: 16,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`Failed to create Neon project: ${res.status} ${err}`)
    process.exit(1)
  }

  const data = await res.json() as {
    project: { id: string }
    connection_uris: Array<{ connection_uri: string }>
  }

  const projectId = data.project.id
  const databaseUrl = data.connection_uris[0].connection_uri

  writeEnvValue('NEON_PROJECT_ID', projectId)
  writeEnvValue('DATABASE_URL', databaseUrl)
  console.log(`Created Neon project: ${projectId}`)

  return { projectId, databaseUrl }
}

function ensureNetlifySite(netlifyAccountSlug: string): string {
  const envVars = readEnvFile()

  if (envVars.NETLIFY_SITE_ID) {
    console.log(`Using existing Netlify site: ${envVars.NETLIFY_SITE_ID}`)
    return envVars.NETLIFY_SITE_ID
  }

  console.log('Creating new Netlify site...')
  const output = execSync(
    `npx netlify sites:create --account-slug ${netlifyAccountSlug} --json`,
    { cwd: APP_DIR, encoding: 'utf-8' },
  )

  const siteData = JSON.parse(output) as { id: string; ssl_url?: string; url?: string }
  const siteId = siteData.id

  writeEnvValue('NETLIFY_SITE_ID', siteId)
  console.log(`Created Netlify site: ${siteId}`)

  return siteId
}

async function main() {
  const neonApiKey = requireEnv('NEON_API_KEY')
  requireEnv('NETLIFY_AUTH_TOKEN')
  const netlifyAccountSlug = requireEnv('NETLIFY_ACCOUNT_SLUG')

  // Step 1-2: Database setup and schema sync
  const { databaseUrl } = await ensureNeonProject(neonApiKey)

  console.log('Syncing production database schema...')
  await initSchema(databaseUrl)
  await runMigrations(databaseUrl)
  console.log('Schema sync complete.')

  // Step 3: Netlify site setup
  const siteId = ensureNetlifySite(netlifyAccountSlug)

  // Step 4: Build
  console.log('Building app...')
  execSync('npx vite build', { stdio: 'inherit', cwd: APP_DIR })

  // Step 5: Deploy
  console.log('Deploying to Netlify...')
  const deployOutput = execSync(
    `npx netlify deploy --prod --dir dist --functions ./netlify/functions --site ${siteId} --json`,
    { cwd: APP_DIR, encoding: 'utf-8' },
  )

  const deployData = JSON.parse(deployOutput) as { ssl_url?: string; deploy_ssl_url?: string; url?: string }
  const deployedUrl = deployData.ssl_url || deployData.deploy_ssl_url || deployData.url || ''

  // Step 6: Write deployment.txt
  const deploymentInfo = [
    `url=${deployedUrl}`,
    `site_id=${siteId}`,
    `deployed_at=${new Date().toISOString()}`,
  ].join('\n') + '\n'

  writeFileSync(resolve(APP_DIR, 'deployment.txt'), deploymentInfo)
  console.log(`\nDeployment complete: ${deployedUrl}`)
  console.log('Deployment info written to deployment.txt')
}

main().catch((err) => {
  console.error('Deployment failed:', err)
  process.exit(1)
})
