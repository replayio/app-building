/**
 * Shared database schema initialization.
 * Single source of truth for all table definitions.
 *
 * This function is called by:
 * - scripts/test.ts (test branch initialization)
 * - scripts/deploy.ts (production schema sync)
 *
 * All statements use CREATE TABLE IF NOT EXISTS for idempotency.
 */

import { neon } from '@neondatabase/serverless'

export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)

  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('organization', 'individual')),
      status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('active', 'inactive', 'prospect', 'churned')),
      tags TEXT[] DEFAULT '{}',
      source_type TEXT,
      source_detail TEXT,
      campaign TEXT,
      channel TEXT,
      date_acquired DATE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS individuals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      title TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS client_individuals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      role TEXT,
      industry TEXT,
      is_primary BOOLEAN DEFAULT false,
      UNIQUE(client_id, individual_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS individual_relationships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      related_individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      relationship_type TEXT NOT NULL CHECK (relationship_type IN ('colleague', 'decision_maker', 'influencer', 'manager', 'report', 'other')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(individual_id, related_individual_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS contact_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      date TIMESTAMPTZ NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('email', 'phone_call', 'video_call', 'meeting', 'note')),
      summary TEXT NOT NULL,
      team_member TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      value NUMERIC(12, 2) DEFAULT 0,
      stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'qualification', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
      status TEXT NOT NULL DEFAULT 'active',
      owner TEXT,
      probability INTEGER DEFAULT 0,
      expected_close_date DATE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS deal_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      old_stage TEXT NOT NULL,
      new_stage TEXT NOT NULL,
      changed_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS deal_contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'influencer',
      UNIQUE(deal_id, individual_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS writeups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      version INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS writeup_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      writeup_id UUID NOT NULL REFERENCES writeups(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      version INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      due_date TIMESTAMPTZ,
      priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('high', 'medium', 'low', 'normal')),
      completed BOOLEAN DEFAULT false,
      completed_at TIMESTAMPTZ,
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      assignee_name TEXT,
      assignee_role TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS task_notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'System',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS attachments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('document', 'link')),
      url TEXT NOT NULL,
      size INTEGER,
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS timeline_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      description TEXT NOT NULL,
      user_name TEXT,
      related_entity_id UUID,
      related_entity_type TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      auth_user_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT,
      provider TEXT DEFAULT 'email',
      avatar_url TEXT DEFAULT '',
      email_confirmed BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

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
