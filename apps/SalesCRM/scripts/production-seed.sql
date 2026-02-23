-- =============================================================================
-- Production seed data for Sales CRM.
-- This file is SEPARATE from seed-db.ts (which is used by Playwright tests).
-- Run via: npm run seed-production
-- =============================================================================

-- Clear existing data (reverse FK order) so re-runs are idempotent.
DELETE FROM writeup_versions;
DELETE FROM writeups;
DELETE FROM deal_history;
DELETE FROM deal_contacts;
DELETE FROM timeline_events;
DELETE FROM attachments;
DELETE FROM task_notes;
DELETE FROM tasks;
DELETE FROM contact_history;
DELETE FROM individual_relationships;
DELETE FROM client_individuals;
DELETE FROM deals;
DELETE FROM individuals;
DELETE FROM clients;
DELETE FROM client_followers;
DELETE FROM notification_preferences;
DELETE FROM webhooks;
DELETE FROM email_tokens;
DELETE FROM users;

-- ============================================================
-- USERS  (team members)
-- ============================================================
INSERT INTO users (email, name, avatar_url) VALUES
  ('sarah.lee@salescrm.com',    'Sarah Lee',     ''),
  ('john.doe@salescrm.com',     'John Doe',      ''),
  ('sarah.kim@salescrm.com',    'Sarah Kim',     ''),
  ('chris.brooks@salescrm.com', 'Chris Brooks',  ''),
  ('maria.reyes@salescrm.com',  'Maria Reyes',   ''),
  ('john.dunn@salescrm.com',    'John Dunn',     ''),
  ('sarah.james@salescrm.com',  'Sarah James',   ''),
  ('michael.bell@salescrm.com', 'Michael Bell',  ''),
  ('emily.dorsey@salescrm.com', 'Emily Dorsey',  ''),
  ('alex.turner@salescrm.com',  'Alex Turner',   ''),
  ('lisa.tran@salescrm.com',    'Lisa Tran',     ''),
  ('david.park@salescrm.com',   'David Park',    '');

-- ============================================================
-- CLIENTS  (12 — covers every status and both types)
-- ============================================================
INSERT INTO clients (name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired) VALUES
  ('Acme Corp',             'organization', 'active',   ARRAY['Enterprise','SaaS','Q3-Target'],   'Referral',      'John Smith',     NULL,            'Direct Sales',      '2025-01-15'),
  ('Globex Solutions',      'organization', 'prospect', ARRAY['SaaS','Partner'],                  'Campaign',      'Google Ads',     'Q1 2026',       'Digital Marketing',  '2025-09-20'),
  ('Wayne Enterprises',     'organization', 'churned',  ARRAY['Enterprise','Legacy'],              'Direct Sales',  NULL,             NULL,            'Direct Sales',      '2024-06-10'),
  ('Jane Doe Consulting',   'individual',   'active',   ARRAY['VIP','Consulting'],                'Referral',      'Conference',     NULL,            'Partner Referral',  '2025-05-01'),
  ('Delta Systems',         'organization', 'inactive', ARRAY['Enterprise','Hardware'],            'Campaign',      'LinkedIn Ads',   'Q2 2025',       'Social Media',      '2025-02-28'),
  ('Pinnacle Health',       'organization', 'active',   ARRAY['Healthcare','Enterprise'],          'Direct Sales',  'VP Sales intro', NULL,            'Direct Sales',      '2025-11-04'),
  ('Brightwave Media',      'organization', 'prospect', ARRAY['Media','Startup'],                  'Campaign',      'Facebook Ads',   'Brand Launch',  'Social Media',      '2026-01-10'),
  ('Redwood Financial',     'organization', 'active',   ARRAY['Finance','Enterprise','VIP'],       'Referral',      'Board Member',   NULL,            'Partner Referral',  '2025-07-22'),
  ('NovaTech AI',           'organization', 'prospect', ARRAY['AI/ML','Startup','SaaS'],           'Campaign',      'Webinar',        'AI Summit 26',  'Digital Marketing',  '2026-02-01'),
  ('Sam Rivera Freelance',  'individual',   'active',   ARRAY['Freelance','Design'],               'Referral',      'Dribbble',       NULL,            'Organic',           '2025-08-15'),
  ('Orion Logistics',       'organization', 'active',   ARRAY['Logistics','Mid-Market'],           'Campaign',      'Trade Show',     'LogiExpo 25',   'Events',            '2025-04-12'),
  ('Cascade Manufacturing', 'organization', 'churned',  ARRAY['Manufacturing','Legacy','Hardware'],'Direct Sales',  NULL,             NULL,            'Direct Sales',      '2024-03-01');

-- ============================================================
-- INDIVIDUALS  (20 contacts across the client base)
-- ============================================================
INSERT INTO individuals (name, title, email, phone, location) VALUES
  ('Sarah Johnson',    'CEO',                    'sarah.johnson@acmecorp.com',    '+1 (555) 100-0001', 'New York, NY'),
  ('Michael Chen',     'CTO',                    'michael.chen@acmecorp.com',     '+1 (555) 100-0002', 'San Francisco, CA'),
  ('Emily Davis',      'Project Manager',        'emily.davis@globex.com',        '+1 (555) 200-0001', 'Austin, TX'),
  ('David Chen',       'V.P. Engineering',       'david.chen@globex.com',         '+1 (555) 200-0002', 'Seattle, WA'),
  ('Maria Rodriguez',  'Director of Sales',      'maria.r@delta.com',             '+1 (555) 300-0001', 'Chicago, IL'),
  ('Bruce Wayne',      'CEO',                    'bruce@wayne-ent.com',           '+1 (555) 400-0001', 'Gotham, NJ'),
  ('Lucius Fox',       'Head of R&D',            'lfox@wayne-ent.com',            '+1 (555) 400-0002', 'Gotham, NJ'),
  ('Alice Nguyen',     'VP Operations',          'alice.n@pinnaclehealth.com',    '+1 (555) 500-0001', 'Boston, MA'),
  ('Carlos Mendez',    'Chief Medical Officer',  'carlos.m@pinnaclehealth.com',   '+1 (555) 500-0002', 'Boston, MA'),
  ('Jordan Blake',     'Creative Director',      'jordan@brightwave.io',          '+1 (555) 600-0001', 'Los Angeles, CA'),
  ('Patricia Wells',   'CFO',                    'pwells@redwoodfinancial.com',   '+1 (555) 700-0001', 'Denver, CO'),
  ('Thomas Grant',     'Head of IT',             'tgrant@redwoodfinancial.com',   '+1 (555) 700-0002', 'Denver, CO'),
  ('Nina Patel',       'Co-Founder & CEO',       'nina@novatech.ai',             '+1 (555) 800-0001', 'San Jose, CA'),
  ('Omar Hassan',      'Lead ML Engineer',       'omar@novatech.ai',             '+1 (555) 800-0002', 'San Jose, CA'),
  ('Sam Rivera',       'Independent Designer',   'sam.rivera@freelance.com',      '+1 (555) 900-0001', 'Portland, OR'),
  ('Rachel Kim',       'Logistics Coordinator',  'rkim@orionlogistics.com',       '+1 (555) 110-0001', 'Dallas, TX'),
  ('Frank Russo',      'Operations Manager',     'frusso@orionlogistics.com',     '+1 (555) 110-0002', 'Dallas, TX'),
  ('Irene Castillo',   'Plant Manager',          'icastillo@cascademfg.com',      '+1 (555) 120-0001', 'Detroit, MI'),
  ('Priya Sharma',     'VP Business Dev',        'psharma@acmecorp.com',          '+1 (555) 100-0003', 'New York, NY'),
  ('James Whitfield',  'Account Director',       'jwhitfield@globex.com',         '+1 (555) 200-0003', 'Austin, TX');

-- ============================================================
-- CLIENT – INDIVIDUAL  links
-- ============================================================
-- We need the generated IDs.  Use a CTE approach so everything stays in SQL.
-- Because UUIDs are auto-generated we match by name.

INSERT INTO client_individuals (client_id, individual_id, role, industry, is_primary)
SELECT c.id, i.id, v.role, v.industry, v.is_primary
FROM (VALUES
  ('Acme Corp',             'Sarah Johnson',    'CEO',                   'Software',      true),
  ('Acme Corp',             'Michael Chen',     'CTO',                   'Software',      false),
  ('Acme Corp',             'Priya Sharma',     'VP Business Dev',       'Software',      false),
  ('Globex Solutions',      'Emily Davis',      'Project Manager',       'Technology',    true),
  ('Globex Solutions',      'David Chen',       'V.P. Engineering',      'Technology',    false),
  ('Globex Solutions',      'James Whitfield',  'Account Director',      'Technology',    false),
  ('Wayne Enterprises',     'Bruce Wayne',      'CEO',                   'Conglomerate',  true),
  ('Wayne Enterprises',     'Lucius Fox',       'Head of R&D',           'Conglomerate',  false),
  ('Delta Systems',         'Maria Rodriguez',  'Director of Sales',     'Hardware',      true),
  ('Pinnacle Health',       'Alice Nguyen',     'VP Operations',         'Healthcare',    true),
  ('Pinnacle Health',       'Carlos Mendez',    'Chief Medical Officer', 'Healthcare',    false),
  ('Brightwave Media',      'Jordan Blake',     'Creative Director',     'Media',         true),
  ('Redwood Financial',     'Patricia Wells',   'CFO',                   'Finance',       true),
  ('Redwood Financial',     'Thomas Grant',     'Head of IT',            'Finance',       false),
  ('NovaTech AI',           'Nina Patel',       'Co-Founder & CEO',      'AI/ML',         true),
  ('NovaTech AI',           'Omar Hassan',      'Lead ML Engineer',      'AI/ML',         false),
  ('Sam Rivera Freelance',  'Sam Rivera',       'Independent Designer',  'Design',        true),
  ('Orion Logistics',       'Rachel Kim',       'Logistics Coordinator', 'Logistics',     true),
  ('Orion Logistics',       'Frank Russo',      'Operations Manager',    'Logistics',     false),
  ('Cascade Manufacturing', 'Irene Castillo',   'Plant Manager',         'Manufacturing', true)
) AS v(client_name, individual_name, role, industry, is_primary)
JOIN clients     c ON c.name = v.client_name
JOIN individuals i ON i.name = v.individual_name;

-- ============================================================
-- INDIVIDUAL RELATIONSHIPS
-- ============================================================
INSERT INTO individual_relationships (individual_id, related_individual_id, relationship_type)
SELECT i1.id, i2.id, v.rel
FROM (VALUES
  ('Sarah Johnson',   'Michael Chen',     'colleague'),
  ('Sarah Johnson',   'Priya Sharma',     'colleague'),
  ('Emily Davis',     'David Chen',       'colleague'),
  ('Emily Davis',     'James Whitfield',  'colleague'),
  ('Bruce Wayne',     'Lucius Fox',       'manager'),
  ('Alice Nguyen',    'Carlos Mendez',    'colleague'),
  ('Nina Patel',      'Omar Hassan',      'manager'),
  ('Rachel Kim',      'Frank Russo',      'colleague'),
  ('Sarah Johnson',   'Patricia Wells',   'decision_maker'),
  ('Sarah Johnson',   'Nina Patel',       'influencer')
) AS v(name1, name2, rel)
JOIN individuals i1 ON i1.name = v.name1
JOIN individuals i2 ON i2.name = v.name2;

-- ============================================================
-- CONTACT HISTORY
-- ============================================================
INSERT INTO contact_history (individual_id, date, type, summary, team_member)
SELECT i.id, v.date::timestamptz, v.type, v.summary, v.team_member
FROM (VALUES
  ('Sarah Johnson',   '2026-02-20 14:30:00+00', 'video_call',  'Discussed Q1 roadmap integration. Action items assigned for API review.',              'Michael Bell (Sales Lead)'),
  ('Sarah Johnson',   '2026-02-18 10:15:00+00', 'email',       'Sent follow-up on pricing proposal with updated discount tiers.',                       'Sarah Kim (Account Exec)'),
  ('Sarah Johnson',   '2026-02-14 11:00:00+00', 'meeting',     'In-person meeting at Acme HQ to review contract terms and SLA details.',               'John Dunn (VP Sales)'),
  ('Michael Chen',    '2026-02-12 16:45:00+00', 'note',        'Internal note: Michael expressed interest in API integrations and webhook support.',    'Lisa Tran (Solutions Architect)'),
  ('Emily Davis',     '2026-02-19 09:00:00+00', 'phone_call',  'Discovery call about new project requirements and migration timeline.',                 'Chris Brooks (BDR)'),
  ('Bruce Wayne',     '2026-01-25 10:00:00+00', 'meeting',     'Exit interview — discussed reasons for churning and potential re-engagement path.',     'John Dunn (VP Sales)'),
  ('Alice Nguyen',    '2026-02-21 13:00:00+00', 'video_call',  'Walked through compliance requirements for healthcare module deployment.',              'Sarah Lee (Account Exec)'),
  ('Alice Nguyen',    '2026-02-15 09:30:00+00', 'email',       'Shared security whitepaper and SOC 2 certification details.',                           'Emily Dorsey (Pre-Sales)'),
  ('Patricia Wells',  '2026-02-17 15:00:00+00', 'phone_call',  'Budget discussion for Q2 expansion — approved for up to $200K additional spend.',       'Maria Reyes (Director)'),
  ('Nina Patel',      '2026-02-22 11:00:00+00', 'video_call',  'Demo of ML pipeline integration features. Very positive reception.',                    'Alex Turner (Solutions Eng)'),
  ('Nina Patel',      '2026-02-10 14:00:00+00', 'email',       'Sent case study on similar AI/ML customer deployments.',                                'Chris Brooks (BDR)'),
  ('Rachel Kim',      '2026-02-16 08:30:00+00', 'phone_call',  'Discussed fleet management integration and real-time tracking requirements.',           'David Park (Account Mgr)'),
  ('Jordan Blake',    '2026-02-08 10:00:00+00', 'email',       'Introductory email with product overview and pricing sheet.',                           'Sarah James (BDR)'),
  ('Sam Rivera',      '2026-02-13 16:00:00+00', 'note',        'Sam prefers async communication. Slack or email only — no calls.',                      'Emily Dorsey (Coordinator)'),
  ('Priya Sharma',    '2026-02-20 09:00:00+00', 'meeting',     'Quarterly business review — discussed upsell opportunities and customer health.',       'Sarah Lee (Account Exec)')
) AS v(individual_name, date, type, summary, team_member)
JOIN individuals i ON i.name = v.individual_name;

-- ============================================================
-- DEALS  (15 deals across all 7 stages)
-- ============================================================
-- We need client IDs; join by name.

-- lead (2)
INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
SELECT v.name, c.id, v.value, v.stage, v.status, v.owner, v.probability, v.close_date::date
FROM (VALUES
  ('Globex Platform Migration',    'Globex Solutions',  180000, 'lead',          'active', 'Chris Brooks',  10, '2026-06-15'),
  ('Brightwave Brand Analytics',   'Brightwave Media',   45000, 'lead',          'active', 'Sarah James',    5, '2026-07-01')
) AS v(name, client_name, value, stage, status, owner, probability, close_date)
JOIN clients c ON c.name = v.client_name;

-- qualification (2)
INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
SELECT v.name, c.id, v.value, v.stage, v.status, v.owner, v.probability, v.close_date::date
FROM (VALUES
  ('Acme Additional Services',  'Acme Corp',     10000, 'qualification', 'active', 'John Doe',      20, '2026-04-30'),
  ('NovaTech ML Platform',      'NovaTech AI',  320000, 'qualification', 'active', 'Alex Turner',   25, '2026-08-01')
) AS v(name, client_name, value, stage, status, owner, probability, close_date)
JOIN clients c ON c.name = v.client_name;

-- discovery (2)
INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
SELECT v.name, c.id, v.value, v.stage, v.status, v.owner, v.probability, v.close_date::date
FROM (VALUES
  ('Acme Project Alpha Expansion',  'Acme Corp',        250000, 'discovery', 'active', 'Sarah Kim',     35, '2026-05-15'),
  ('Pinnacle Patient Portal',       'Pinnacle Health',   95000, 'discovery', 'active', 'Sarah Lee',     30, '2026-06-30')
) AS v(name, client_name, value, stage, status, owner, probability, close_date)
JOIN clients c ON c.name = v.client_name;

-- proposal (2)
INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
SELECT v.name, c.id, v.value, v.stage, v.status, v.owner, v.probability, v.close_date::date
FROM (VALUES
  ('Acme Software License',        'Acme Corp',           50000, 'proposal',  'active', 'Sarah Lee',    40, '2026-04-15'),
  ('Redwood Risk Analytics Suite',  'Redwood Financial',  210000, 'proposal',  'active', 'Maria Reyes',  50, '2026-05-01')
) AS v(name, client_name, value, stage, status, owner, probability, close_date)
JOIN clients c ON c.name = v.client_name;

-- negotiation (2)
INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
SELECT v.name, c.id, v.value, v.stage, v.status, v.owner, v.probability, v.close_date::date
FROM (VALUES
  ('Delta Hardware Upgrade',       'Delta Systems',      75000, 'negotiation', 'active', 'Maria Reyes',  60, '2026-03-31'),
  ('Orion Fleet Management SaaS',  'Orion Logistics',   140000, 'negotiation', 'active', 'David Park',   65, '2026-04-01')
) AS v(name, client_name, value, stage, status, owner, probability, close_date)
JOIN clients c ON c.name = v.client_name;

-- closed_won (3)
INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
SELECT v.name, c.id, v.value, v.stage, v.status, v.owner, v.probability, v.close_date::date
FROM (VALUES
  ('Wayne Legacy Migration',       'Wayne Enterprises',  120000, 'closed_won', 'won',  'John Dunn',     100, '2025-09-30'),
  ('Redwood Compliance Module',    'Redwood Financial',   85000, 'closed_won', 'won',  'Maria Reyes',   100, '2025-12-15'),
  ('Sam Rivera Design Retainer',   'Sam Rivera Freelance', 24000, 'closed_won', 'won',  'Emily Dorsey',  100, '2025-11-01')
) AS v(name, client_name, value, stage, status, owner, probability, close_date)
JOIN clients c ON c.name = v.client_name;

-- closed_lost (2)
INSERT INTO deals (name, client_id, value, stage, status, owner, probability, expected_close_date)
SELECT v.name, c.id, v.value, v.stage, v.status, v.owner, v.probability, v.close_date::date
FROM (VALUES
  ('Wayne Cloud Transition',       'Wayne Enterprises',       95000, 'closed_lost', 'lost', 'Sarah Kim',    0, '2025-08-15'),
  ('Cascade Modernization Plan',   'Cascade Manufacturing',  310000, 'closed_lost', 'lost', 'John Dunn',    0, '2025-10-01')
) AS v(name, client_name, value, stage, status, owner, probability, close_date)
JOIN clients c ON c.name = v.client_name;

-- ============================================================
-- DEAL HISTORY  (stage progression audit trail)
-- ============================================================
INSERT INTO deal_history (deal_id, old_stage, new_stage, changed_by, created_at)
SELECT d.id, v.old_stage, v.new_stage, v.changed_by, v.created_at::timestamptz
FROM (VALUES
  -- Acme Software License: lead → qualification → proposal
  ('Acme Software License',       'lead',          'qualification', 'John Doe',      '2026-01-18 10:15:00+00'),
  ('Acme Software License',       'qualification', 'proposal',      'Sarah Lee',     '2026-02-05 14:30:00+00'),
  -- Acme Project Alpha: lead → qualification → discovery
  ('Acme Project Alpha Expansion', 'lead',          'qualification', 'Sarah Kim',     '2025-12-10 09:00:00+00'),
  ('Acme Project Alpha Expansion', 'qualification', 'discovery',     'Sarah Kim',     '2026-01-20 11:00:00+00'),
  -- Delta Hardware: lead → qualification → discovery → proposal → negotiation
  ('Delta Hardware Upgrade',       'lead',          'qualification', 'Maria Reyes',   '2025-10-15 08:00:00+00'),
  ('Delta Hardware Upgrade',       'qualification', 'discovery',     'Maria Reyes',   '2025-11-25 10:00:00+00'),
  ('Delta Hardware Upgrade',       'discovery',     'proposal',      'Maria Reyes',   '2026-01-05 14:00:00+00'),
  ('Delta Hardware Upgrade',       'proposal',      'negotiation',   'Maria Reyes',   '2026-02-15 16:00:00+00'),
  -- Orion Fleet: lead → qualification → discovery → proposal → negotiation
  ('Orion Fleet Management SaaS',  'lead',          'qualification', 'David Park',    '2025-11-01 09:00:00+00'),
  ('Orion Fleet Management SaaS',  'qualification', 'discovery',     'David Park',    '2025-12-05 10:30:00+00'),
  ('Orion Fleet Management SaaS',  'discovery',     'proposal',      'David Park',    '2026-01-15 13:00:00+00'),
  ('Orion Fleet Management SaaS',  'proposal',      'negotiation',   'David Park',    '2026-02-10 15:00:00+00'),
  -- Redwood Risk Analytics: lead → qualification → discovery → proposal
  ('Redwood Risk Analytics Suite', 'lead',          'qualification', 'Maria Reyes',   '2025-12-01 10:00:00+00'),
  ('Redwood Risk Analytics Suite', 'qualification', 'discovery',     'Maria Reyes',   '2026-01-08 11:00:00+00'),
  ('Redwood Risk Analytics Suite', 'discovery',     'proposal',      'Maria Reyes',   '2026-02-03 14:00:00+00'),
  -- NovaTech ML: lead → qualification
  ('NovaTech ML Platform',        'lead',          'qualification', 'Alex Turner',   '2026-02-12 10:00:00+00'),
  -- Wayne Legacy: full journey to closed_won
  ('Wayne Legacy Migration',      'lead',          'qualification', 'John Dunn',     '2025-04-01 09:00:00+00'),
  ('Wayne Legacy Migration',      'qualification', 'discovery',     'John Dunn',     '2025-05-15 11:00:00+00'),
  ('Wayne Legacy Migration',      'discovery',     'proposal',      'John Dunn',     '2025-06-20 14:00:00+00'),
  ('Wayne Legacy Migration',      'proposal',      'negotiation',   'John Dunn',     '2025-07-25 10:00:00+00'),
  ('Wayne Legacy Migration',      'negotiation',   'closed_won',    'John Dunn',     '2025-09-30 16:00:00+00'),
  -- Pinnacle Patient Portal: lead → qualification → discovery
  ('Pinnacle Patient Portal',     'lead',          'qualification', 'Sarah Lee',     '2026-01-05 09:00:00+00'),
  ('Pinnacle Patient Portal',     'qualification', 'discovery',     'Sarah Lee',     '2026-02-01 11:00:00+00')
) AS v(deal_name, old_stage, new_stage, changed_by, created_at)
JOIN deals d ON d.name = v.deal_name;

-- ============================================================
-- DEAL CONTACTS
-- ============================================================
INSERT INTO deal_contacts (deal_id, individual_id, role)
SELECT d.id, i.id, v.role
FROM (VALUES
  ('Acme Software License',        'Sarah Johnson',   'decision_maker'),
  ('Acme Software License',        'Michael Chen',    'influencer'),
  ('Acme Project Alpha Expansion',  'Sarah Johnson',   'decision_maker'),
  ('Acme Project Alpha Expansion',  'Priya Sharma',    'influencer'),
  ('Globex Platform Migration',    'Emily Davis',     'influencer'),
  ('Globex Platform Migration',    'David Chen',      'decision_maker'),
  ('Delta Hardware Upgrade',       'Maria Rodriguez', 'decision_maker'),
  ('Pinnacle Patient Portal',      'Alice Nguyen',    'decision_maker'),
  ('Pinnacle Patient Portal',      'Carlos Mendez',   'influencer'),
  ('Redwood Risk Analytics Suite', 'Patricia Wells',  'decision_maker'),
  ('Redwood Risk Analytics Suite', 'Thomas Grant',    'influencer'),
  ('NovaTech ML Platform',        'Nina Patel',      'decision_maker'),
  ('NovaTech ML Platform',        'Omar Hassan',     'influencer'),
  ('Orion Fleet Management SaaS',  'Rachel Kim',      'influencer'),
  ('Orion Fleet Management SaaS',  'Frank Russo',     'decision_maker'),
  ('Wayne Legacy Migration',      'Bruce Wayne',     'decision_maker'),
  ('Wayne Legacy Migration',      'Lucius Fox',      'influencer')
) AS v(deal_name, individual_name, role)
JOIN deals       d ON d.name = v.deal_name
JOIN individuals i ON i.name = v.individual_name;

-- ============================================================
-- WRITEUPS
-- ============================================================
INSERT INTO writeups (deal_id, title, content, author, version, created_at)
SELECT d.id, v.title, v.content, v.author, v.version, v.created_at::timestamptz
FROM (VALUES
  ('Acme Software License',
   'Strategy Update',
   'Emphasizing our cloud integration capabilities to align with Acme''s digital transformation goals. Key differentiators include our API-first architecture and enterprise-grade security. Next step: schedule executive sponsor meeting before end of Q1.',
   'Sarah Lee', 2, '2026-02-10 09:00:00+00'),
  ('Acme Software License',
   'Needs Analysis',
   'Client requires scalability and enhanced security features. They are currently using a legacy system and need migration support. Budget approved for Q2. Stakeholder buy-in confirmed from CTO and VP Engineering.',
   'John Doe', 1, '2026-01-15 14:00:00+00'),
  ('Redwood Risk Analytics Suite',
   'Competitive Analysis',
   'Redwood evaluated three vendors. Our real-time risk scoring and compliance automation are unique differentiators. Main competitor (FinServe Pro) lacks API integration depth. Pricing is within 5% of their budget ceiling.',
   'Maria Reyes', 1, '2026-02-03 10:00:00+00'),
  ('Pinnacle Patient Portal',
   'Technical Requirements',
   'HIPAA compliance is non-negotiable. Must support SSO via SAML, audit logging, and role-based access. Integration with Epic EHR system via HL7 FHIR. Target go-live: Q3 2026.',
   'Sarah Lee', 1, '2026-02-01 15:00:00+00'),
  ('Orion Fleet Management SaaS',
   'Deal Summary',
   'Orion wants real-time GPS tracking, route optimization, and driver performance dashboards. 200+ vehicle fleet. Current solution is spreadsheet-based. High urgency — contract with current provider expires April 2026.',
   'David Park', 1, '2026-02-10 11:00:00+00')
) AS v(deal_name, title, content, author, version, created_at)
JOIN deals d ON d.name = v.deal_name;

-- Version history for the Strategy Update writeup
INSERT INTO writeup_versions (writeup_id, title, content, author, version, created_at)
SELECT w.id, v.title, v.content, v.author, v.version, v.created_at::timestamptz
FROM (VALUES
  ('Strategy Update',
   'Strategy Update',
   'Initial strategy focusing on cloud integration and API-first positioning.',
   'Sarah Lee', 1, '2026-01-20 09:00:00+00')
) AS v(writeup_title, title, content, author, version, created_at)
JOIN writeups w ON w.title = v.writeup_title AND w.version = 2;

-- ============================================================
-- TASKS  (20 tasks — mix of priorities, due dates, and statuses)
-- ============================================================
INSERT INTO tasks (title, description, due_date, priority, completed, completed_at, client_id, deal_id, assignee_name, assignee_role)
SELECT v.title, v.description,
       CASE WHEN v.due_offset IS NOT NULL THEN (CURRENT_DATE + v.due_offset * INTERVAL '1 day') ELSE NULL END,
       v.priority, v.completed,
       CASE WHEN v.completed THEN NOW() - INTERVAL '2 days' ELSE NULL END,
       c.id,
       d.id,
       v.assignee_name, v.assignee_role
FROM (VALUES
  -- Acme tasks
  ('Follow up on proposal',          'Send follow-up email regarding the software license proposal',            0,  'high',   false, 'Acme Corp', 'Acme Software License',        'Sarah James',  'PM'),
  ('Schedule onboarding call',       'Set up onboarding call with the technical team',                          1,  'medium', false, 'Acme Corp', NULL,                           'Michael Bell', 'Sales Lead'),
  ('Prepare Q1 Review',              'Compile Q1 performance metrics and prepare presentation',                 7,  'normal', false, 'Acme Corp', NULL,                           'Sarah Kim',    'Account Exec'),
  ('Send updated SOW to Acme',       'Incorporate legal feedback and send revised Statement of Work',          2,  'high',   false, 'Acme Corp', 'Acme Project Alpha Expansion',  'Sarah Kim',    'Account Exec'),
  -- Globex tasks
  ('Review Globex proposal',         'Review and finalize the Globex platform migration proposal',              1,  'high',   false, 'Globex Solutions', 'Globex Platform Migration', 'Chris Brooks', 'BDR'),
  ('Globex technical deep-dive',     'Schedule architecture review with Globex engineering team',               5,  'medium', false, 'Globex Solutions', 'Globex Platform Migration', 'Alex Turner',  'Solutions Eng'),
  -- Delta tasks
  ('Update Delta pricing',           'Revise pricing sheet for Delta hardware upgrade',                         0,  'medium', false, 'Delta Systems', 'Delta Hardware Upgrade',       'Maria Reyes',  'Director'),
  -- Pinnacle tasks
  ('HIPAA compliance checklist',     'Complete internal HIPAA compliance checklist before Pinnacle proposal',    3,  'high',   false, 'Pinnacle Health', 'Pinnacle Patient Portal',    'Sarah Lee',    'Account Exec'),
  ('Pinnacle security review',       'Coordinate SOC 2 documentation review with InfoSec team',                 5,  'medium', false, 'Pinnacle Health', NULL,                         'Emily Dorsey', 'Pre-Sales'),
  -- Redwood tasks
  ('Redwood executive presentation', 'Prepare board-level presentation for Redwood CFO meeting',                4,  'high',   false, 'Redwood Financial', 'Redwood Risk Analytics Suite', 'Maria Reyes', 'Director'),
  ('Finalize Redwood pricing',       'Lock in final pricing with 15% volume discount per CFO request',          2,  'high',   false, 'Redwood Financial', 'Redwood Risk Analytics Suite', 'John Dunn',   'VP Sales'),
  -- NovaTech tasks
  ('NovaTech demo environment',      'Spin up sandbox environment with sample ML pipeline data',                3,  'medium', false, 'NovaTech AI', 'NovaTech ML Platform',          'Alex Turner',  'Solutions Eng'),
  -- Orion tasks
  ('Orion POC kick-off',             'Schedule proof-of-concept kick-off meeting with Orion ops team',          1,  'high',   false, 'Orion Logistics', 'Orion Fleet Management SaaS', 'David Park',   'Account Mgr'),
  -- Brightwave tasks
  ('Brightwave intro deck',          'Create customized intro deck for Brightwave creative team',               6,  'low',    false, 'Brightwave Media', NULL,                         'Sarah James',  'BDR'),
  -- General / completed tasks
  ('Finalize Q4 Marketing Plan',     'Complete the marketing plan for Q4 campaigns',                           -5,  'high',   true,  'Acme Corp', NULL,                           'Sarah James',  'PM'),
  ('Review Client Proposal Draft',   'Check and approve the latest draft of the client proposal',              -3,  'low',    true,  'Globex Solutions', NULL,                    'Emily Dorsey', 'Coordinator'),
  ('Send quarterly report',          'Prepare and send the quarterly business report to all active clients',    7,  'normal', false, 'Acme Corp', NULL,                           'John Dunn',    'VP Sales'),
  ('Update CRM contact records',     'Verify and update contact info for all Redwood stakeholders',            -1,  'normal', true,  'Redwood Financial', NULL,                   'Lisa Tran',    'Ops'),
  ('Cascade post-mortem',            'Document lessons learned from Cascade Manufacturing lost deal',           -7,  'low',    true,  'Cascade Manufacturing', 'Cascade Modernization Plan', 'John Dunn', 'VP Sales'),
  ('Wayne re-engagement check-in',   'Check if Wayne Enterprises is open to re-engagement after 6 months',    14,  'low',    false, 'Wayne Enterprises', NULL,                    'John Dunn',    'VP Sales')
) AS v(title, description, due_offset, priority, completed, client_name, deal_name, assignee_name, assignee_role)
JOIN clients c ON c.name = v.client_name
LEFT JOIN deals d ON d.name = v.deal_name;

-- ============================================================
-- TASK NOTES
-- ============================================================
INSERT INTO task_notes (task_id, content, author, created_at)
SELECT t.id, v.content, v.author, v.created_at::timestamptz
FROM (VALUES
  ('Follow up on proposal',          'Called Sarah J. — she''s reviewing internally, expects a decision by Friday.',     'Sarah Lee',    '2026-02-21 10:00:00+00'),
  ('Follow up on proposal',          'Sent follow-up with updated pricing PDF attached.',                                'Sarah James',  '2026-02-22 14:00:00+00'),
  ('HIPAA compliance checklist',     'InfoSec team confirmed BAA template is ready. Need legal sign-off.',              'Emily Dorsey', '2026-02-20 09:30:00+00'),
  ('Redwood executive presentation', 'Added ROI slide based on Patricia''s feedback from last call.',                    'Maria Reyes',  '2026-02-19 16:00:00+00'),
  ('Orion POC kick-off',             'Frank confirmed Thursday 2pm works for the kick-off. Sent calendar invite.',      'David Park',   '2026-02-22 11:00:00+00'),
  ('Cascade post-mortem',            'Root cause: pricing was 40% above their budget. Should have done discovery earlier.', 'John Dunn', '2026-02-16 15:00:00+00'),
  ('NovaTech demo environment',      'Sandbox spun up at demo.novatech-sandbox.internal. Shared creds with Nina.',      'Alex Turner',  '2026-02-21 17:00:00+00'),
  ('Globex technical deep-dive',     'David Chen wants to see load testing results. Coordinating with QA.',             'Alex Turner',  '2026-02-22 09:00:00+00')
) AS v(task_title, content, author, created_at)
JOIN tasks t ON t.title = v.task_title;

-- ============================================================
-- ATTACHMENTS
-- ============================================================
INSERT INTO attachments (filename, type, url, size, client_id, deal_id, created_at)
SELECT v.filename, v.type, v.url, v.size, c.id, d.id, v.created_at::date
FROM (VALUES
  ('Service Agreement.pdf',        'document', 'https://example.com/files/service-agreement.pdf',    245000,  'Acme Corp',          'Acme Software License',        '2026-01-15'),
  ('Project Scope.docx',           'document', 'https://example.com/files/project-scope.docx',       128000,  'Acme Corp',          NULL,                           '2026-01-20'),
  ('Client Website',               'link',     'https://acmecorp.example.com',                       NULL,    'Acme Corp',          NULL,                           '2025-01-15'),
  ('Acme_Requirements.pdf',        'document', 'https://example.com/files/acme-requirements.pdf',    2400000, 'Acme Corp',          'Acme Project Alpha Expansion', '2026-01-10'),
  ('Meeting_Notes_Feb18.docx',     'document', 'https://example.com/files/meeting-notes-feb18.docx', 50000,   'Acme Corp',          'Acme Project Alpha Expansion', '2026-02-18'),
  ('Redwood_RFP_Response.pdf',     'document', 'https://example.com/files/redwood-rfp.pdf',          890000,  'Redwood Financial',  'Redwood Risk Analytics Suite', '2026-02-03'),
  ('Compliance_Matrix.xlsx',       'document', 'https://example.com/files/compliance-matrix.xlsx',   156000,  'Redwood Financial',  'Redwood Risk Analytics Suite', '2026-02-05'),
  ('Redwood Portfolio Overview',   'link',     'https://redwoodfinancial.example.com/about',         NULL,    'Redwood Financial',  NULL,                           '2025-08-01'),
  ('Pinnacle_HIPAA_Checklist.pdf', 'document', 'https://example.com/files/hipaa-checklist.pdf',      340000,  'Pinnacle Health',    'Pinnacle Patient Portal',      '2026-02-01'),
  ('Orion_Fleet_Specs.pdf',        'document', 'https://example.com/files/orion-fleet-specs.pdf',    720000,  'Orion Logistics',    'Orion Fleet Management SaaS',  '2026-01-20'),
  ('NovaTech_ML_Whitepaper.pdf',   'document', 'https://example.com/files/novatech-ml-whitepaper.pdf', 1100000, 'NovaTech AI',     'NovaTech ML Platform',         '2026-02-12'),
  ('Globex Architecture Diagram',  'link',     'https://globex.example.com/arch',                    NULL,    'Globex Solutions',   'Globex Platform Migration',    '2025-10-01')
) AS v(filename, type, url, size, client_name, deal_name, created_at)
JOIN clients c ON c.name = v.client_name
LEFT JOIN deals d ON d.name = v.deal_name;

-- ============================================================
-- TIMELINE EVENTS  (recent activity feed)
-- ============================================================
INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type, created_at)
SELECT c.id, v.event_type, v.description, v.user_name, NULL, v.related_entity_type,
       NOW() - (v.days_ago * INTERVAL '1 day')
FROM (VALUES
  ('Acme Corp',          'task_created',        'Task Created: ''Follow up on proposal''',                                     'Sarah James',   'task',       0),
  ('Acme Corp',          'note_added',          'Note Added: ''Client mentioned interest in expanded API access.''',            'Michael Bell',  'note',       1),
  ('Acme Corp',          'deal_stage_changed',  'Deal Stage Changed: ''Acme Software License'' moved to Proposal',             'Sarah Lee',     'deal',       2),
  ('Acme Corp',          'email_sent',          'Email Sent: ''Meeting Confirmation'' to Sarah Johnson',                        NULL,            'email',      7),
  ('Acme Corp',          'contact_added',       'Contact Added: ''Priya Sharma'' (VP Business Dev)',                            'Sarah Kim',     'individual', 15),
  ('Globex Solutions',   'task_created',        'Task Created: ''Review Globex proposal''',                                    'Chris Brooks',  'task',       0),
  ('Globex Solutions',   'email_sent',          'Email Sent: ''Technical Deep-Dive Agenda'' to David Chen',                     'Alex Turner',   'email',      3),
  ('Delta Systems',      'deal_stage_changed',  'Deal Stage Changed: ''Delta Hardware Upgrade'' moved to Negotiation',          'Maria Reyes',   'deal',       3),
  ('Pinnacle Health',    'deal_stage_changed',  'Deal Stage Changed: ''Pinnacle Patient Portal'' moved to Discovery',           'Sarah Lee',     'deal',       5),
  ('Pinnacle Health',    'task_created',        'Task Created: ''HIPAA compliance checklist''',                                 'Sarah Lee',     'task',       4),
  ('Pinnacle Health',    'contact_added',       'Contact Added: ''Carlos Mendez'' (Chief Medical Officer)',                      'Emily Dorsey',  'individual', 20),
  ('Redwood Financial',  'deal_stage_changed',  'Deal Stage Changed: ''Redwood Risk Analytics Suite'' moved to Proposal',       'Maria Reyes',   'deal',       6),
  ('Redwood Financial',  'note_added',          'Note Added: ''CFO approved budget increase to $210K.''',                       'Maria Reyes',   'note',       4),
  ('Redwood Financial',  'task_created',        'Task Created: ''Redwood executive presentation''',                             'Maria Reyes',   'task',       3),
  ('NovaTech AI',        'deal_stage_changed',  'Deal Stage Changed: ''NovaTech ML Platform'' moved to Qualification',          'Alex Turner',   'deal',       8),
  ('NovaTech AI',        'email_sent',          'Email Sent: Case study to Nina Patel',                                         'Chris Brooks',  'email',      10),
  ('Orion Logistics',    'deal_stage_changed',  'Deal Stage Changed: ''Orion Fleet Management'' moved to Negotiation',          'David Park',    'deal',       7),
  ('Orion Logistics',    'task_created',        'Task Created: ''Orion POC kick-off''',                                        'David Park',    'task',       1),
  ('Brightwave Media',   'task_created',        'Task Created: ''Brightwave intro deck''',                                     'Sarah James',   'task',       2),
  ('Wayne Enterprises',  'note_added',          'Note Added: ''Re-engagement possibility after cooling-off period.''',          'John Dunn',     'note',       14)
) AS v(client_name, event_type, description, user_name, related_entity_type, days_ago)
JOIN clients c ON c.name = v.client_name;

-- ============================================================
-- WEBHOOKS  (sample integrations)
-- ============================================================
INSERT INTO webhooks (name, url, events, enabled) VALUES
  ('Slack Notifications',  'https://hooks.slack.example.com/services/T00/B00/xxx', ARRAY['deal.stage_changed','task.completed','client.created'], true),
  ('Zapier Integration',   'https://hooks.zapier.com/hooks/catch/123456/abcdef/',  ARRAY['deal.created','deal.stage_changed'],                    true),
  ('Analytics Webhook',    'https://analytics.example.com/api/crm-events',         ARRAY['deal.created','deal.stage_changed','client.created','task.created'], false);
