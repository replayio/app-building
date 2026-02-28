import { neon } from '@neondatabase/serverless'

export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)

  await sql`
    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      progress INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      model TEXT,
      deployment_url TEXT,
      source_url TEXT
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS app_requests (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      rejection_reason TEXT,
      app_id TEXT REFERENCES apps(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS activity_log (
      id SERIAL PRIMARY KEY,
      app_id TEXT NOT NULL REFERENCES apps(id),
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      log_type TEXT NOT NULL,
      message TEXT NOT NULL,
      detail TEXT,
      expandable BOOLEAN NOT NULL DEFAULT FALSE
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status)
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_activity_log_app_id ON activity_log(app_id)
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(app_id, timestamp DESC)
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_app_requests_app_id ON app_requests(app_id)
  `
}
