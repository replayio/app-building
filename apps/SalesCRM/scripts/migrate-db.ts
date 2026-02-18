/**
 * migrate-db script: Applies schema migrations to an existing database.
 * Usage: DATABASE_URL=... npx tsx scripts/migrate-db.ts
 *
 * Run this before the app starts in any environment (dev, test, prod).
 * All statements are idempotent and safe to re-run.
 */

import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

let DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  try {
    const env = readFileSync('.env', 'utf-8')
    const match = env.match(/DATABASE_URL=(.+)/)
    if (match) DATABASE_URL = match[1].trim()
  } catch {
    // ignore
  }
}

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is required')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function main() {
  console.log('Running database migrations...')

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`
  try { await sql`ALTER TABLE users ALTER COLUMN auth_user_id SET DEFAULT gen_random_uuid()` } catch { /* already set */ }
  try { await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email)` } catch { /* already exists */ }

  await sql`
    CREATE TABLE IF NOT EXISTS webhooks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      events TEXT[] NOT NULL DEFAULT '{}',
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  console.log('Migrations applied successfully.')
}

main().catch((err) => {
  console.error('Failed to run migrations:', err)
  process.exit(1)
})
