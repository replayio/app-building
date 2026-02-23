/**
 * Seed the production database with demo / manual-testing data.
 *
 * This is intentionally SEPARATE from seed-db.ts (which is used by the
 * Playwright test suite and must not be modified for production purposes).
 *
 * The SQL lives in scripts/production-seed.sql so it can be reviewed,
 * diffed, and iterated on independently.
 *
 * Usage:
 *   npm run seed-production          # reads DATABASE_URL from .env
 *   DATABASE_URL=… npx tsx scripts/seed-production.ts   # explicit URL
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { neon } from '@neondatabase/serverless'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const APP_DIR = resolve(__dirname, '..')
const SQL_PATH = resolve(__dirname, 'production-seed.sql')

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

async function main() {
  const envVars = readEnvFile()
  const databaseUrl = process.env.DATABASE_URL || envVars.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL not found. Set it in .env or pass it as an environment variable.')
    process.exit(1)
  }

  const sqlContent = readFileSync(SQL_PATH, 'utf-8')

  // Strip SQL comments, then split on semicolons.
  const stripped = sqlContent.replace(/--[^\n]*/g, '')
  const statements = stripped
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  const sql = neon(databaseUrl)

  console.log(`Seeding production database (${statements.length} statements)…`)

  for (const stmt of statements) {
    try {
      await sql(stmt)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const preview = stmt.replace(/\s+/g, ' ').slice(0, 120)
      console.error(`\nERROR executing statement:\n  ${preview}…\n  ${msg}\n`)
      process.exit(1)
    }
  }

  console.log('Production database seeded successfully!')
}

main().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
