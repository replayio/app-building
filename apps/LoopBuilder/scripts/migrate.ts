import { neon } from '@neondatabase/serverless'

export async function runMigrations(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)

  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `

  const applied = await sql`SELECT name FROM schema_migrations`
  const appliedNames = new Set(applied.map((r) => r.name))

  const migrations: { name: string; up: () => Promise<void> }[] = [
    {
      name: '001_create_containers',
      up: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS containers (
            container_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'starting',
            prompt TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            last_event_at TIMESTAMP
          )
        `
        await sql`CREATE INDEX IF NOT EXISTS idx_containers_status ON containers(status)`
      },
    },
    {
      name: '002_create_webhook_events',
      up: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS webhook_events (
            id SERIAL PRIMARY KEY,
            container_id TEXT NOT NULL REFERENCES containers(container_id),
            event_type TEXT NOT NULL,
            payload JSONB NOT NULL DEFAULT '{}',
            received_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `
        await sql`CREATE INDEX IF NOT EXISTS idx_webhook_events_container_id ON webhook_events(container_id)`
        await sql`CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON webhook_events(received_at DESC)`
        await sql`CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type)`
      },
    },
    {
      name: '003_create_settings',
      up: async () => {
        await sql`
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          )
        `
      },
    },
  ]

  for (const migration of migrations) {
    if (!appliedNames.has(migration.name)) {
      await migration.up()
      await sql`INSERT INTO schema_migrations (name) VALUES (${migration.name})`
    }
  }
}
