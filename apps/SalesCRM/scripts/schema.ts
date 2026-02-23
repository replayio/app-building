import { neon } from '@neondatabase/serverless'

export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)

  // Users table - for authentication and team management
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Email tokens table - for email confirmation and password reset
  await sql`
    CREATE TABLE IF NOT EXISTS email_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('confirmation', 'reset')),
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Clients table - organizations or individuals being tracked
  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('organization', 'individual')) DEFAULT 'organization',
      status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'prospect', 'churned')) DEFAULT 'prospect',
      tags TEXT[] NOT NULL DEFAULT '{}',
      source_type TEXT,
      source_detail TEXT,
      campaign TEXT,
      channel TEXT,
      date_acquired DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Individuals table - people/contacts
  await sql`
    CREATE TABLE IF NOT EXISTS individuals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      title TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Client-individual junction table
  await sql`
    CREATE TABLE IF NOT EXISTS client_individuals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      role TEXT,
      is_primary BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (client_id, individual_id)
    )
  `

  // Individual relationships table
  await sql`
    CREATE TABLE IF NOT EXISTS individual_relationships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      related_individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      relationship_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (individual_id, related_individual_id)
    )
  `

  // Contact history table - interactions with individuals
  await sql`
    CREATE TABLE IF NOT EXISTS contact_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'note', 'other')),
      summary TEXT NOT NULL,
      notes TEXT,
      performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
      contact_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Deals table
  await sql`
    CREATE TABLE IF NOT EXISTS deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      value NUMERIC(12, 2),
      stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
      owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
      probability INTEGER CHECK (probability >= 0 AND probability <= 100),
      expected_close_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Deal stage history table
  await sql`
    CREATE TABLE IF NOT EXISTS deal_stage_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      old_stage TEXT,
      new_stage TEXT NOT NULL,
      changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Deal writeups table
  await sql`
    CREATE TABLE IF NOT EXISTS deal_writeups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      author_id UUID REFERENCES users(id) ON DELETE SET NULL,
      author_name TEXT NOT NULL DEFAULT 'System',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Deal-individual junction table
  await sql`
    CREATE TABLE IF NOT EXISTS deal_individuals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      role TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (deal_id, individual_id)
    )
  `

  // Tasks table
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      due_date DATE,
      priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed', 'cancelled')),
      client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Task notes table
  await sql`
    CREATE TABLE IF NOT EXISTS task_notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      author_id UUID REFERENCES users(id) ON DELETE SET NULL,
      author_name TEXT NOT NULL DEFAULT 'System',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Attachments table
  await sql`
    CREATE TABLE IF NOT EXISTS attachments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Timeline events table - consolidated activity feed
  await sql`
    CREATE TABLE IF NOT EXISTS timeline_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
      individual_id UUID REFERENCES individuals(id) ON DELETE SET NULL,
      event_type TEXT NOT NULL,
      description TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      actor_name TEXT NOT NULL DEFAULT 'System',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Client followers table - for email notifications
  await sql`
    CREATE TABLE IF NOT EXISTS client_followers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (client_id, user_id)
    )
  `

  // Notification preferences table
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
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Webhooks table
  await sql`
    CREATE TABLE IF NOT EXISTS webhooks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      events TEXT[] NOT NULL DEFAULT '{}',
      enabled BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Create indices for frequently queried columns
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name)`
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at)`

  await sql`CREATE INDEX IF NOT EXISTS idx_individuals_name ON individuals(name)`
  await sql`CREATE INDEX IF NOT EXISTS idx_individuals_email ON individuals(email)`

  await sql`CREATE INDEX IF NOT EXISTS idx_client_individuals_client ON client_individuals(client_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_client_individuals_individual ON client_individuals(individual_id)`

  await sql`CREATE INDEX IF NOT EXISTS idx_deals_client ON deals(client_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals(owner_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at)`

  await sql`CREATE INDEX IF NOT EXISTS idx_deal_stage_history_deal ON deal_stage_history(deal_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deal_writeups_deal ON deal_writeups(deal_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deal_individuals_deal ON deal_individuals(deal_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deal_individuals_individual ON deal_individuals(individual_id)`

  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_client ON tasks(client_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_deal ON tasks(deal_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)`

  await sql`CREATE INDEX IF NOT EXISTS idx_task_notes_task ON task_notes(task_id)`

  await sql`CREATE INDEX IF NOT EXISTS idx_attachments_client ON attachments(client_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_attachments_deal ON attachments(deal_id)`

  await sql`CREATE INDEX IF NOT EXISTS idx_timeline_events_client ON timeline_events(client_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_timeline_events_deal ON timeline_events(deal_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_timeline_events_created_at ON timeline_events(created_at)`

  await sql`CREATE INDEX IF NOT EXISTS idx_contact_history_individual ON contact_history(individual_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_history_date ON contact_history(contact_date)`

  await sql`CREATE INDEX IF NOT EXISTS idx_individual_relationships_individual ON individual_relationships(individual_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_individual_relationships_related ON individual_relationships(related_individual_id)`

  await sql`CREATE INDEX IF NOT EXISTS idx_client_followers_client ON client_followers(client_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_client_followers_user ON client_followers(user_id)`

  await sql`CREATE INDEX IF NOT EXISTS idx_email_tokens_token ON email_tokens(token)`
  await sql`CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_tokens(user_id)`
}

export async function runMigrations(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)

  // Migration: Add any ALTER TABLE statements here for schema changes
  // that CREATE TABLE IF NOT EXISTS cannot detect.

  // Example pattern:
  // try {
  //   await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS new_column TEXT`
  // } catch { /* column may already exist */ }

  // Ensure users table has necessary columns
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`
  } catch { /* already exists */ }

  // Ensure webhooks table has enabled column
  try {
    await sql`ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT true`
  } catch { /* already exists */ }
}
