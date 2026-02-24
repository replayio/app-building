import { neon } from '@neondatabase/serverless'

export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)

  // Drop all tables in reverse dependency order so ephemeral branches start clean
  await sql`DROP TABLE IF EXISTS timeline_events CASCADE`
  await sql`DROP TABLE IF EXISTS attachments CASCADE`
  await sql`DROP TABLE IF EXISTS tasks CASCADE`
  await sql`DROP TABLE IF EXISTS deal_contacts CASCADE`
  await sql`DROP TABLE IF EXISTS deal_writeups CASCADE`
  await sql`DROP TABLE IF EXISTS deal_stage_history CASCADE`
  await sql`DROP TABLE IF EXISTS deals CASCADE`
  await sql`DROP TABLE IF EXISTS contact_history CASCADE`
  await sql`DROP TABLE IF EXISTS relationships CASCADE`
  await sql`DROP TABLE IF EXISTS client_individuals CASCADE`
  await sql`DROP TABLE IF EXISTS individuals CASCADE`
  await sql`DROP TABLE IF EXISTS client_tags CASCADE`
  await sql`DROP TABLE IF EXISTS tags CASCADE`
  await sql`DROP TABLE IF EXISTS clients CASCADE`

  // Clients table - organizations or individuals
  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('Organization', 'Individual')),
      status TEXT NOT NULL DEFAULT 'Prospect' CHECK (status IN ('Active', 'Inactive', 'Prospect', 'Churned')),
      source TEXT,
      source_detail TEXT,
      campaign TEXT,
      channel TEXT,
      date_acquired DATE,
      industry TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  // Tags table
  await sql`
    CREATE TABLE IF NOT EXISTS tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  // Client-Tags join table
  await sql`
    CREATE TABLE IF NOT EXISTS client_tags (
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (client_id, tag_id)
    )
  `

  // Individuals table - people associated with clients
  await sql`
    CREATE TABLE IF NOT EXISTS individuals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      title TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  // Client-Individuals join table
  await sql`
    CREATE TABLE IF NOT EXISTS client_individuals (
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      role TEXT,
      is_primary BOOLEAN NOT NULL DEFAULT false,
      PRIMARY KEY (client_id, individual_id)
    )
  `

  // Relationships between individuals
  await sql`
    CREATE TABLE IF NOT EXISTS relationships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      related_individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      relationship_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  // Contact history for individuals
  await sql`
    CREATE TABLE IF NOT EXISTS contact_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      interaction_type TEXT NOT NULL,
      summary TEXT,
      team_member TEXT,
      contact_date TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  // Deals table
  await sql`
    CREATE TABLE IF NOT EXISTS deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      stage TEXT NOT NULL DEFAULT 'Lead' CHECK (stage IN ('Lead', 'Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost')),
      value NUMERIC(15,2),
      owner TEXT,
      status TEXT NOT NULL DEFAULT 'On Track' CHECK (status IN ('On Track', 'Needs Attention', 'At Risk', 'Won', 'Lost')),
      probability INTEGER,
      expected_close_date DATE,
      close_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  // Deal stage history
  await sql`
    CREATE TABLE IF NOT EXISTS deal_stage_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      old_stage TEXT,
      new_stage TEXT NOT NULL,
      changed_by TEXT,
      changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  // Deal writeups
  await sql`
    CREATE TABLE IF NOT EXISTS deal_writeups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT,
      author TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  // Deal-Contacts join table (individuals involved in a deal)
  await sql`
    CREATE TABLE IF NOT EXISTS deal_contacts (
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      role TEXT,
      PRIMARY KEY (deal_id, individual_id)
    )
  `

  // Tasks table
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      assignee TEXT,
      assignee_role TEXT,
      priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('High', 'Medium', 'Low', 'Normal')),
      completed BOOLEAN NOT NULL DEFAULT false,
      due_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  // Attachments table
  await sql`
    CREATE TABLE IF NOT EXISTS attachments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      filename TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_url TEXT,
      file_size TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  // Timeline events
  await sql`
    CREATE TABLE IF NOT EXISTS timeline_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      actor TEXT,
      reference_id UUID,
      reference_type TEXT,
      event_date TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  // Indices for common queries
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type)`
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_updated_at ON clients(updated_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_client_tags_client ON client_tags(client_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_client_tags_tag ON client_tags(tag_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_client_individuals_client ON client_individuals(client_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_client_individuals_individual ON client_individuals(individual_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_relationships_individual ON relationships(individual_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_relationships_related ON relationships(related_individual_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_history_individual ON contact_history(individual_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_client ON deals(client_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deal_stage_history_deal ON deal_stage_history(deal_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deal_writeups_deal ON deal_writeups(deal_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deal_contacts_deal ON deal_contacts(deal_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_deal_contacts_individual ON deal_contacts(individual_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_client ON tasks(client_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_deal ON tasks(deal_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed)`
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)`
  await sql`CREATE INDEX IF NOT EXISTS idx_attachments_client ON attachments(client_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_attachments_deal ON attachments(deal_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_timeline_events_client ON timeline_events(client_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_timeline_events_date ON timeline_events(event_date DESC)`
}
