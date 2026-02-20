/**
 * Database migrations module.
 * Applies ALTER TABLE changes that initSchema's CREATE TABLE IF NOT EXISTS cannot detect.
 * Run after initSchema in all contexts (testing, deployment).
 *
 * All statements are idempotent and safe to re-run.
 */

import { neon } from '@neondatabase/serverless'

export async function runMigrations(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false`
  try { await sql`ALTER TABLE users ALTER COLUMN auth_user_id SET DEFAULT gen_random_uuid()` } catch { /* already set */ }
  try { await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email)` } catch { /* already exists */ }

  await sql`
    CREATE TABLE IF NOT EXISTS email_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('confirm', 'reset')),
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

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

  await sql`
    CREATE TABLE IF NOT EXISTS client_followers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, client_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      notify_client_updated BOOLEAN DEFAULT true,
      notify_deal_created BOOLEAN DEFAULT true,
      notify_deal_stage_changed BOOLEAN DEFAULT true,
      notify_task_created BOOLEAN DEFAULT true,
      notify_task_completed BOOLEAN DEFAULT true,
      notify_contact_added BOOLEAN DEFAULT true,
      notify_note_added BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
}
