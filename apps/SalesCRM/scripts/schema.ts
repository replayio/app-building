import { neon } from "@neondatabase/serverless";

export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);

  // --- Users & Auth ---

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

  // --- Clients ---

  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'organization' CHECK (type IN ('organization', 'individual')),
      status VARCHAR(50) NOT NULL DEFAULT 'prospect' CHECK (status IN ('active', 'inactive', 'prospect', 'churned')),
      tags TEXT[] NOT NULL DEFAULT '{}',
      source_type VARCHAR(100),
      source_detail TEXT,
      campaign VARCHAR(255),
      channel VARCHAR(255),
      date_acquired DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_clients_status ON clients (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_type ON clients (type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_name ON clients (name)`;

  // --- Individuals (People / Contacts) ---

  await sql`
    CREATE TABLE IF NOT EXISTS individuals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(100),
      location VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_individuals_name ON individuals (name)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_individuals_email ON individuals (email)`;

  // --- Client-Individual Junction ---

  await sql`
    CREATE TABLE IF NOT EXISTS client_individuals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      role VARCHAR(255),
      is_primary BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(client_id, individual_id)
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_client_individuals_client ON client_individuals (client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_client_individuals_individual ON client_individuals (individual_id)`;

  // --- Deals ---

  await sql`
    CREATE TABLE IF NOT EXISTS deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      value NUMERIC(15, 2),
      stage VARCHAR(50) NOT NULL DEFAULT 'Lead' CHECK (stage IN ('Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost')),
      owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
      probability INTEGER CHECK (probability >= 0 AND probability <= 100),
      expected_close_date DATE,
      status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_deals_client ON deals (client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals (stage)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals (owner_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_status ON deals (status)`;

  // --- Tasks ---

  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      due_date DATE,
      priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'canceled')),
      client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_client ON tasks (client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_deal ON tasks (deal_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks (assignee_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date)`;

  // --- Task Notes ---

  await sql`
    CREATE TABLE IF NOT EXISTS task_notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_by VARCHAR(255) NOT NULL DEFAULT 'System',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_task_notes_task ON task_notes (task_id)`;

  // --- Attachments ---

  await sql`
    CREATE TABLE IF NOT EXISTS attachments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename VARCHAR(255) NOT NULL,
      file_type VARCHAR(100),
      url TEXT NOT NULL,
      size INTEGER,
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_attachments_client ON attachments (client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_attachments_deal ON attachments (deal_id)`;

  // --- Relationships (between individuals) ---

  await sql`
    CREATE TABLE IF NOT EXISTS relationships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      related_individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      relationship_type VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(individual_id, related_individual_id)
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_relationships_individual ON relationships (individual_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_relationships_related ON relationships (related_individual_id)`;

  // --- Contact History (interactions with individuals) ---

  await sql`
    CREATE TABLE IF NOT EXISTS contact_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'note')),
      summary TEXT NOT NULL,
      contact_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      performed_by VARCHAR(255) NOT NULL DEFAULT 'System',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_contact_history_individual ON contact_history (individual_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_history_date ON contact_history (contact_date)`;

  // --- Deal History (stage changes) ---

  await sql`
    CREATE TABLE IF NOT EXISTS deal_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      old_stage VARCHAR(50),
      new_stage VARCHAR(50) NOT NULL,
      changed_by VARCHAR(255) NOT NULL DEFAULT 'System',
      changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_deal_history_deal ON deal_history (deal_id)`;

  // --- Writeups (deal notes/strategies) ---

  await sql`
    CREATE TABLE IF NOT EXISTS writeups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      author VARCHAR(255) NOT NULL DEFAULT 'System',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_writeups_deal ON writeups (deal_id)`;

  // --- Writeup Versions (version history for writeups) ---

  await sql`
    CREATE TABLE IF NOT EXISTS writeup_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      writeup_id UUID NOT NULL REFERENCES writeups(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      author VARCHAR(255) NOT NULL DEFAULT 'System',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_writeup_versions_writeup ON writeup_versions (writeup_id)`;

  // --- Timeline Events (consolidated activity feed) ---

  await sql`
    CREATE TABLE IF NOT EXISTS timeline_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      event_type VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      related_entity_type VARCHAR(50),
      related_entity_id UUID,
      created_by VARCHAR(255) NOT NULL DEFAULT 'System',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_timeline_events_client ON timeline_events (client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_timeline_events_type ON timeline_events (event_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_timeline_events_created ON timeline_events (created_at)`;

  // --- Client Followers (user follow/unfollow clients) ---

  await sql`
    CREATE TABLE IF NOT EXISTS client_followers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, client_id)
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_client_followers_user ON client_followers (user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_client_followers_client ON client_followers (client_id)`;

  // --- Notification Preferences ---

  await sql`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      client_updated BOOLEAN NOT NULL DEFAULT true,
      deal_created BOOLEAN NOT NULL DEFAULT true,
      deal_stage_changed BOOLEAN NOT NULL DEFAULT true,
      task_created BOOLEAN NOT NULL DEFAULT true,
      task_completed BOOLEAN NOT NULL DEFAULT true,
      contact_added BOOLEAN NOT NULL DEFAULT true,
      note_added BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences (user_id)`;

  // --- Webhooks ---

  await sql`
    CREATE TABLE IF NOT EXISTS webhooks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      events TEXT[] NOT NULL DEFAULT '{}',
      platform VARCHAR(50) NOT NULL DEFAULT 'custom',
      enabled BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function runMigrations(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);

  // Add title column to writeups (idempotent)
  await sql`ALTER TABLE writeups ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT ''`;

  // Create writeup_versions table (idempotent via CREATE TABLE IF NOT EXISTS in initSchema)

  // Add platform column to webhooks (idempotent)
  await sql`ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS platform VARCHAR(50) NOT NULL DEFAULT 'custom'`;
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
