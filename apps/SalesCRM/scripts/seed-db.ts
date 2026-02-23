/**
 * Database seed module.
 * Populates the database with realistic sample data required by the Playwright test suite.
 */

import { neon } from '@neondatabase/serverless'

export async function seedDatabase(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)

  console.log('Seeding database with test data...')

  // Clear existing data (reverse order of foreign keys)
  await sql`DELETE FROM writeup_versions`
  await sql`DELETE FROM writeups`
  await sql`DELETE FROM deal_history`
  await sql`DELETE FROM deal_contacts`
  await sql`DELETE FROM timeline_events`
  await sql`DELETE FROM attachments`
  await sql`DELETE FROM task_notes`
  await sql`DELETE FROM tasks`
  await sql`DELETE FROM contact_history`
  await sql`DELETE FROM individual_relationships`
  await sql`DELETE FROM client_individuals`
  await sql`DELETE FROM deals`
  await sql`DELETE FROM individuals`
  await sql`DELETE FROM clients`
  await sql`DELETE FROM webhooks`
  await sql`DELETE FROM users`

  // ============================================================
  // USERS (team members)
  // ============================================================
  await sql`
    INSERT INTO users (email, name, avatar_url) VALUES
    ('sarah.lee@salescrm.com', 'Sarah Lee', ''),
    ('john.doe@salescrm.com', 'John Doe', ''),
    ('sarah.k@salescrm.com', 'Sarah K.', ''),
    ('chris.b@salescrm.com', 'Chris B.', ''),
    ('maria.r@salescrm.com', 'Maria R.', ''),
    ('john.d@salescrm.com', 'John D.', ''),
    ('sarah.j@salescrm.com', 'Sarah J.', ''),
    ('michael.b@salescrm.com', 'Michael B.', ''),
    ('emily.d@salescrm.com', 'Emily D.', '')
  `
  console.log('  Created 9 users')

  // ============================================================
  // CLIENTS
  // ============================================================
  const [client1] = await sql`
    INSERT INTO clients (name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired)
    VALUES ('Acme Corp', 'organization', 'active', ARRAY['Enterprise', 'SaaS', 'Q3-Target'], 'Referral', 'John Smith', 'None', 'Direct Sales', '2023-01-15')
    RETURNING id
  `
  const [client2] = await sql`
    INSERT INTO clients (name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired)
    VALUES ('Globex Solutions', 'organization', 'prospect', ARRAY['SaaS', 'Partner'], 'Campaign', 'Google Ads', 'Q3 Campaign', 'Digital Marketing', '2023-03-20')
    RETURNING id
  `
  const [client3] = await sql`
    INSERT INTO clients (name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired)
    VALUES ('Wayne Enterprises', 'organization', 'churned', ARRAY['Enterprise', 'Legacy'], 'Direct Sales', NULL, NULL, 'Direct Sales', '2022-06-10')
    RETURNING id
  `
  const [client4] = await sql`
    INSERT INTO clients (name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired)
    VALUES ('Jane Doe', 'individual', 'active', ARRAY['VIP', 'Consulting'], 'Referral', 'Conference', NULL, 'Partner Referral', '2023-05-01')
    RETURNING id
  `
  const [client5] = await sql`
    INSERT INTO clients (name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired)
    VALUES ('Delta Systems', 'organization', 'inactive', ARRAY['Enterprise', 'Hardware'], 'Campaign', 'LinkedIn Ads', 'Q2 Campaign', 'Social Media', '2023-02-28')
    RETURNING id
  `
  console.log('  Created 5 clients')

  // ============================================================
  // INDIVIDUALS
  // ============================================================
  const [person1] = await sql`
    INSERT INTO individuals (name, title, email, phone, location)
    VALUES ('Sarah Johnson', 'CEO', 'sarah.johnson@acmecorp.com', '+1 (555) 100-0001', 'New York, NY')
    RETURNING id
  `
  const [person2] = await sql`
    INSERT INTO individuals (name, title, email, phone, location)
    VALUES ('Michael Chen', 'CTO', 'michael.chen@acmecorp.com', '+1 (555) 100-0002', 'San Francisco, CA')
    RETURNING id
  `
  const [person3] = await sql`
    INSERT INTO individuals (name, title, email, phone, location)
    VALUES ('Emily Davis', 'Project Manager', 'emily.davis@globex.com', '+1 (555) 200-0001', 'Austin, TX')
    RETURNING id
  `
  const [person4] = await sql`
    INSERT INTO individuals (name, title, email, phone, location)
    VALUES ('David Chen', 'V.P. Engineering', 'david.chen@globex.com', '+1 (555) 200-0002', 'Seattle, WA')
    RETURNING id
  `
  const [person5] = await sql`
    INSERT INTO individuals (name, title, email, phone, location)
    VALUES ('Maria Rodriguez', 'Director of Sales', 'maria.r@delta.com', '+1 (555) 300-0001', 'Chicago, IL')
    RETURNING id
  `
  console.log('  Created 5 individuals')

  // ============================================================
  // CLIENT-INDIVIDUAL ASSOCIATIONS
  // ============================================================
  await sql`
    INSERT INTO client_individuals (client_id, individual_id, role, industry, is_primary) VALUES
    (${client1.id}, ${person1.id}, 'CEO', 'Software', true),
    (${client1.id}, ${person2.id}, 'CTO', 'Software', false),
    (${client2.id}, ${person3.id}, 'Project Manager', 'Technology', true),
    (${client2.id}, ${person4.id}, 'V.P. Engineering', 'Technology', false),
    (${client5.id}, ${person5.id}, 'Director of Sales', 'Hardware', true)
  `
  console.log('  Created 5 client-individual associations')

  // ============================================================
  // INDIVIDUAL RELATIONSHIPS
  // ============================================================
  await sql`
    INSERT INTO individual_relationships (individual_id, related_individual_id, relationship_type) VALUES
    (${person1.id}, ${person2.id}, 'colleague'),
    (${person3.id}, ${person4.id}, 'colleague'),
    (${person1.id}, ${person5.id}, 'decision_maker')
  `
  console.log('  Created 3 individual relationships')

  // ============================================================
  // CONTACT HISTORY
  // ============================================================
  await sql`
    INSERT INTO contact_history (individual_id, date, type, summary, team_member) VALUES
    (${person1.id}, '2023-10-26 14:30:00+00', 'video_call', 'Discussed Q4 roadmap integration. Action items assigned.', 'Michael B. (Sales Lead)'),
    (${person1.id}, '2023-10-24 10:15:00+00', 'email', 'Sent follow-up on pricing proposal.', 'Sarah K. (Account Exec)'),
    (${person1.id}, '2023-10-20 11:00:00+00', 'meeting', 'In-person meeting at client HQ to review contract terms.', 'John D. (VP Sales)'),
    (${person2.id}, '2023-10-18 16:45:00+00', 'note', 'Internal note: Michael expressed interest in API integrations.', 'Lisa T. (Solutions Architect)'),
    (${person3.id}, '2023-10-25 09:00:00+00', 'phone_call', 'Discovery call about new project requirements.', 'Chris B. (BDR)')
  `
  console.log('  Created 5 contact history entries')

  // ============================================================
  // DEALS
  // ============================================================
  const [deal1] = await sql`
    INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
    VALUES ('Acme Software License', ${client1.id}, 50000, 'proposal', 'active', 'Sarah Lee', 40, '2023-12-15')
    RETURNING id
  `
  await sql`
    INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
    VALUES ('Additional Services', ${client1.id}, 10000, 'qualification', 'active', 'John Doe', 20, '2024-01-31')
    RETURNING id
  `
  const [deal3] = await sql`
    INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
    VALUES ('Project Alpha Expansion', ${client1.id}, 250000, 'discovery', 'active', 'Sarah K.', 35, '2023-11-15')
    RETURNING id
  `
  const [deal4] = await sql`
    INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
    VALUES ('Globex Platform Migration', ${client2.id}, 180000, 'lead', 'active', 'Chris B.', 10, '2024-03-15')
    RETURNING id
  `
  const [deal5] = await sql`
    INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
    VALUES ('Delta Hardware Upgrade', ${client5.id}, 75000, 'negotiation', 'active', 'Maria R.', 60, '2023-11-30')
    RETURNING id
  `
  await sql`
    INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
    VALUES ('Wayne Legacy Migration', ${client3.id}, 120000, 'closed_won', 'won', 'John D.', 100, '2023-09-30')
    RETURNING id
  `
  await sql`
    INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
    VALUES ('Wayne Cloud Transition', ${client3.id}, 95000, 'closed_lost', 'lost', 'Sarah K.', 0, '2023-08-15')
    RETURNING id
  `
  console.log('  Created 7 deals')

  // ============================================================
  // DEAL HISTORY
  // ============================================================
  await sql`
    INSERT INTO deal_history (deal_id, old_stage, new_stage, changed_by, created_at) VALUES
    (${deal1.id}, 'lead', 'qualification', 'John Doe', '2023-10-18 10:15:00+00'),
    (${deal1.id}, 'qualification', 'proposal', 'Sarah Lee', '2023-10-25 14:30:00+00'),
    (${deal3.id}, 'lead', 'qualification', 'Sarah K.', '2023-10-10 09:00:00+00'),
    (${deal3.id}, 'qualification', 'discovery', 'Sarah K.', '2023-10-20 11:00:00+00'),
    (${deal5.id}, 'lead', 'qualification', 'Maria R.', '2023-09-15 08:00:00+00'),
    (${deal5.id}, 'qualification', 'discovery', 'Maria R.', '2023-09-25 10:00:00+00'),
    (${deal5.id}, 'discovery', 'proposal', 'Maria R.', '2023-10-05 14:00:00+00'),
    (${deal5.id}, 'proposal', 'negotiation', 'Maria R.', '2023-10-15 16:00:00+00')
  `
  console.log('  Created 8 deal history entries')

  // ============================================================
  // DEAL CONTACTS
  // ============================================================
  await sql`
    INSERT INTO deal_contacts (deal_id, individual_id, role) VALUES
    (${deal1.id}, ${person1.id}, 'decision_maker'),
    (${deal1.id}, ${person2.id}, 'influencer'),
    (${deal3.id}, ${person1.id}, 'decision_maker'),
    (${deal4.id}, ${person3.id}, 'influencer'),
    (${deal5.id}, ${person5.id}, 'decision_maker')
  `
  console.log('  Created 5 deal contacts')

  // ============================================================
  // WRITEUPS
  // ============================================================
  const [writeup1] = await sql`
    INSERT INTO writeups (deal_id, title, content, author, version, created_at)
    VALUES (${deal1.id}, 'Strategy Update', 'Emphasizing our cloud integration capabilities to align with Acme''s digital transformation goals. Key differentiators include our API-first architecture and enterprise-grade security.', 'Sarah Lee', 1, '2023-10-20 09:00:00+00')
    RETURNING id
  `
  await sql`
    INSERT INTO writeups (deal_id, title, content, author, version, created_at)
    VALUES (${deal1.id}, 'Needs Analysis', 'Client requires scalability and enhanced security features. They are currently using a legacy system and need migration support. Budget approved for Q4.', 'John Doe', 1, '2023-10-15 14:00:00+00')
  `
  await sql`
    INSERT INTO writeup_versions (writeup_id, title, content, author, version, created_at)
    VALUES (${writeup1.id}, 'Strategy Update', 'Initial strategy focusing on cloud integration.', 'Sarah Lee', 1, '2023-10-20 09:00:00+00')
  `
  console.log('  Created 2 writeups with version history')

  // ============================================================
  // TASKS
  // ============================================================
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const today = new Date()

  await sql`
    INSERT INTO tasks (title, description, due_date, priority, completed, client_id, deal_id, assignee_name, assignee_role) VALUES
    ('Follow up on proposal', 'Send follow-up email regarding the software license proposal', ${today.toISOString()}, 'high', false, ${client1.id}, ${deal1.id}, 'Sarah J.', 'PM'),
    ('Schedule onboarding call', 'Set up onboarding call with the technical team', ${tomorrow.toISOString()}, 'medium', false, ${client1.id}, NULL, 'Michael B.', 'Sales Lead'),
    ('Prepare Q3 Review', 'Compile Q3 performance metrics and prepare presentation', ${nextWeek.toISOString()}, 'normal', false, ${client1.id}, NULL, 'Sarah K.', 'Account Exec'),
    ('Review Globex proposal', 'Review and finalize the Globex platform migration proposal', ${tomorrow.toISOString()}, 'high', false, ${client2.id}, ${deal4.id}, 'Chris B.', 'BDR'),
    ('Update Delta pricing', 'Revise pricing sheet for Delta hardware upgrade', ${today.toISOString()}, 'medium', false, ${client5.id}, ${deal5.id}, 'Maria R.', 'Director'),
    ('Finalize Q3 Marketing Plan', 'Complete the marketing plan for Q3 campaigns', ${today.toISOString()}, 'high', false, ${client1.id}, NULL, 'Sarah J.', 'PM'),
    ('Review Client Proposal Draft', 'Check and approve the latest draft of the client proposal', ${tomorrow.toISOString()}, 'low', false, ${client2.id}, NULL, 'Emily D.', 'Coordinator'),
    ('Send quarterly report', 'Prepare and send the quarterly business report', ${nextWeek.toISOString()}, 'normal', false, ${client1.id}, NULL, 'John D.', 'VP Sales')
  `
  console.log('  Created 8 tasks')

  // ============================================================
  // ATTACHMENTS
  // ============================================================
  await sql`
    INSERT INTO attachments (filename, type, url, size, client_id, deal_id, created_at) VALUES
    ('Service Agreement.pdf', 'document', 'https://example.com/files/service-agreement.pdf', 245000, ${client1.id}, ${deal1.id}, '2023-02-01'),
    ('Project Scope.docx', 'document', 'https://example.com/files/project-scope.docx', 128000, ${client1.id}, NULL, '2023-02-10'),
    ('Client Website', 'link', 'https://acmecorp.example.com', NULL, ${client1.id}, NULL, '2023-01-15'),
    ('Acme_Requirements.pdf', 'document', 'https://example.com/files/acme-requirements.pdf', 2400000, ${client1.id}, ${deal3.id}, '2023-10-15'),
    ('Meeting_Notes_Oct18.docx', 'document', 'https://example.com/files/meeting-notes.docx', 50000, ${client1.id}, ${deal3.id}, '2023-10-18')
  `
  console.log('  Created 5 attachments')

  // ============================================================
  // TIMELINE EVENTS
  // ============================================================
  await sql`
    INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type, created_at) VALUES
    (${client1.id}, 'task_created', 'Task Created: ''Follow up on proposal''', 'User A', NULL, 'task', NOW()),
    (${client1.id}, 'note_added', 'Note Added: ''Client mentioned interest in new features.''', 'User B', NULL, 'note', NOW() - INTERVAL '1 day'),
    (${client1.id}, 'deal_stage_changed', 'Deal Stage Changed: ''Acme Software License'' from ''Qualification'' to ''Proposal Sent''', 'User A', ${deal1.id}, 'deal', NOW() - INTERVAL '2 days'),
    (${client1.id}, 'email_sent', 'Email Sent: ''Meeting Confirmation'' to Sarah Johnson', NULL, ${person1.id}, 'email', NOW() - INTERVAL '7 days'),
    (${client1.id}, 'contact_added', 'Contact Added: ''Michael Chen''', 'User C', ${person2.id}, 'individual', NOW() - INTERVAL '30 days'),
    (${client2.id}, 'task_created', 'Task Created: ''Review Globex proposal''', 'Chris B.', NULL, 'task', NOW()),
    (${client5.id}, 'deal_stage_changed', 'Deal Stage Changed: ''Delta Hardware Upgrade'' from ''Proposal'' to ''Negotiation''', 'Maria R.', ${deal5.id}, 'deal', NOW() - INTERVAL '3 days')
  `
  console.log('  Created 7 timeline events')

  console.log('')
  console.log('Database seeded successfully!')
  console.log(`  Clients: 5 (IDs: ${client1.id}, ${client2.id}, ${client3.id}, ${client4.id}, ${client5.id})`)
  console.log(`  Individuals: 5`)
  console.log(`  Deals: 7`)
  console.log(`  Tasks: 8`)
}
