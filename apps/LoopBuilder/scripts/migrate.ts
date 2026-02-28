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
    // Future migrations go here. Example:
    // {
    //   name: '001_add_column',
    //   up: async () => {
    //     await sql`ALTER TABLE apps ADD COLUMN IF NOT EXISTS new_col TEXT`
    //   },
    // },
  ]

  for (const migration of migrations) {
    if (!appliedNames.has(migration.name)) {
      await migration.up()
      await sql`INSERT INTO schema_migrations (name) VALUES (${migration.name})`
    }
  }
}
