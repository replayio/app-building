import { neon } from "@neondatabase/serverless";

export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);

  // ===== PHASE 1: Create all tables =====

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

  await sql`
    CREATE TABLE IF NOT EXISTS email_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      email VARCHAR(255),
      token TEXT NOT NULL UNIQUE,
      type VARCHAR(50) NOT NULL CHECK (type IN ('confirmation', 'reset', 'notification')),
      expires_at TIMESTAMPTZ,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

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
      task_canceled BOOLEAN NOT NULL DEFAULT true,
      contact_added BOOLEAN NOT NULL DEFAULT true,
      note_added BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

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

  // ===== PHASE 2: Ensure all columns exist on existing tables (handles older schema versions) =====

  // Users
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN NOT NULL DEFAULT false`;

  // Email tokens
  await sql`ALTER TABLE email_tokens ADD COLUMN IF NOT EXISTS email VARCHAR(255)`;

  // Clients
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS source_type VARCHAR(100)`;
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS source_detail TEXT`;
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS campaign VARCHAR(255)`;
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS channel VARCHAR(255)`;
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS date_acquired DATE`;

  // Individuals
  await sql`ALTER TABLE individuals ADD COLUMN IF NOT EXISTS location VARCHAR(255)`;

  // Deals
  await sql`ALTER TABLE deals ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE deals ADD COLUMN IF NOT EXISTS probability INTEGER`;
  await sql`ALTER TABLE deals ADD COLUMN IF NOT EXISTS expected_close_date DATE`;
  await sql`ALTER TABLE deals ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'open'`;
  // Update deals stage CHECK constraint to include all stages (NOT VALID skips existing data check)
  await sql`DO $$ BEGIN
    ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_stage_check;
    ALTER TABLE deals ADD CONSTRAINT deals_stage_check CHECK (stage IN ('Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost')) NOT VALID;
  END $$`;
  // Update deals status CHECK constraint
  await sql`DO $$ BEGIN
    ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_status_check;
    ALTER TABLE deals ADD CONSTRAINT deals_status_check CHECK (status IN ('open', 'won', 'lost')) NOT VALID;
  END $$`;

  // Tasks
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'open'`;
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES deals(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id) ON DELETE SET NULL`;
  // Update tasks status CHECK constraint
  await sql`DO $$ BEGIN
    ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
    ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('open', 'in_progress', 'completed', 'canceled')) NOT VALID;
  END $$`;
  // Update tasks priority CHECK constraint
  await sql`DO $$ BEGIN
    ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
    ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent')) NOT VALID;
  END $$`;

  // Task Notes
  await sql`ALTER TABLE task_notes ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) NOT NULL DEFAULT 'System'`;

  // Contact History
  await sql`ALTER TABLE contact_history ADD COLUMN IF NOT EXISTS contact_date TIMESTAMPTZ NOT NULL DEFAULT NOW()`;
  await sql`ALTER TABLE contact_history ADD COLUMN IF NOT EXISTS performed_by VARCHAR(255) NOT NULL DEFAULT 'System'`;
  // Handle old 'date' column that may exist as NOT NULL (renamed to contact_date)
  await sql`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_history' AND column_name='date') THEN
      ALTER TABLE contact_history ALTER COLUMN date DROP NOT NULL;
    END IF;
  END $$`;
  // Update contact_history type CHECK constraint
  await sql`DO $$ BEGIN
    ALTER TABLE contact_history DROP CONSTRAINT IF EXISTS contact_history_type_check;
    ALTER TABLE contact_history ADD CONSTRAINT contact_history_type_check CHECK (type IN ('email', 'call', 'meeting', 'note')) NOT VALID;
  END $$`;

  // Attachments
  await sql`ALTER TABLE attachments ADD COLUMN IF NOT EXISTS file_type VARCHAR(100)`;
  await sql`ALTER TABLE attachments ADD COLUMN IF NOT EXISTS size INTEGER`;
  await sql`ALTER TABLE attachments ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES deals(id) ON DELETE SET NULL`;
  // Handle old 'type' column that may exist as NOT NULL
  await sql`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attachments' AND column_name='type') THEN
      ALTER TABLE attachments ALTER COLUMN type DROP NOT NULL;
    END IF;
  END $$`;

  // Deal History
  await sql`ALTER TABLE deal_history ADD COLUMN IF NOT EXISTS old_stage VARCHAR(50)`;
  await sql`ALTER TABLE deal_history ALTER COLUMN old_stage DROP NOT NULL`;
  await sql`ALTER TABLE deal_history ADD COLUMN IF NOT EXISTS changed_by VARCHAR(255) NOT NULL DEFAULT 'System'`;
  await sql`ALTER TABLE deal_history ADD COLUMN IF NOT EXISTS changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;

  // Writeups
  await sql`ALTER TABLE writeups ADD COLUMN IF NOT EXISTS author VARCHAR(255) NOT NULL DEFAULT 'System'`;

  // Timeline Events
  await sql`ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS related_entity_type VARCHAR(50)`;
  await sql`ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS related_entity_id UUID`;
  await sql`ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) NOT NULL DEFAULT 'System'`;

  // Notification Preferences
  await sql`ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS task_canceled BOOLEAN NOT NULL DEFAULT true`;

  // Webhooks
  await sql`ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS platform VARCHAR(50) NOT NULL DEFAULT 'custom'`;

  // Writeups
  await sql`ALTER TABLE writeups ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT ''`;

  // ===== PHASE 3: Create all indexes =====

  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_email_tokens_token ON email_tokens (token)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_tokens (user_id)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_clients_status ON clients (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_type ON clients (type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_name ON clients (name)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_individuals_name ON individuals (name)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_individuals_email ON individuals (email)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_client_individuals_client ON client_individuals (client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_client_individuals_individual ON client_individuals (individual_id)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_deals_client ON deals (client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals (stage)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals (owner_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_status ON deals (status)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_client ON tasks (client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_deal ON tasks (deal_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks (assignee_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_task_notes_task ON task_notes (task_id)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_attachments_client ON attachments (client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_attachments_deal ON attachments (deal_id)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_relationships_individual ON relationships (individual_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_relationships_related ON relationships (related_individual_id)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_contact_history_individual ON contact_history (individual_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_history_date ON contact_history (contact_date)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_deal_history_deal ON deal_history (deal_id)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_writeups_deal ON writeups (deal_id)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_writeup_versions_writeup ON writeup_versions (writeup_id)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_timeline_events_client ON timeline_events (client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_timeline_events_type ON timeline_events (event_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_timeline_events_created ON timeline_events (created_at)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_client_followers_user ON client_followers (user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_client_followers_client ON client_followers (client_id)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences (user_id)`;
}

export async function runMigrations(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);

  // Make user_id nullable on email_tokens for notification rows (idempotent)
  await sql`ALTER TABLE email_tokens ALTER COLUMN user_id DROP NOT NULL`;

  // Make expires_at nullable on email_tokens for notification rows (idempotent)
  await sql`ALTER TABLE email_tokens ALTER COLUMN expires_at DROP NOT NULL`;

  // Update type CHECK constraint to include 'notification' (idempotent)
  await sql`DO $$ BEGIN
    ALTER TABLE email_tokens DROP CONSTRAINT IF EXISTS email_tokens_type_check;
    ALTER TABLE email_tokens ADD CONSTRAINT email_tokens_type_check CHECK (type IN ('confirmation', 'reset', 'notification'));
  END $$`;
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
