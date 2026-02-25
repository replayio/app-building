import { neon } from "@neondatabase/serverless";

export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      email_confirmed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`;

  await sql`
    CREATE TABLE IF NOT EXISTS email_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      type VARCHAR(50) NOT NULL CHECK (type IN ('confirmation', 'reset')),
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_email_tokens_token ON email_tokens (token)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_tokens (user_id)`;
}

export async function runMigrations(databaseUrl: string): Promise<void> {
  // No migrations needed yet beyond initial schema
  void databaseUrl;
}

async function main() {
  const databaseUrl = process.argv[2] || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  console.log("Initializing schema...");
  await initSchema(databaseUrl);
  await runMigrations(databaseUrl);
  console.log("Schema initialized.");
}

if (process.argv[1]?.endsWith("schema.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
