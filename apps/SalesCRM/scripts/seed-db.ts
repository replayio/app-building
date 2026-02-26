import { neon } from "@neondatabase/serverless";

export async function seedDatabase(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);

  // --- Seed Users (team members) ---
  const userRows = await sql`
    INSERT INTO users (id, name, email, password_hash, email_confirmed, avatar_url) VALUES
      ('a1000000-0000-0000-0000-000000000001', 'Alice Johnson', 'alice@example.com', 'seeded', true, NULL),
      ('a1000000-0000-0000-0000-000000000002', 'Bob Martinez', 'bob@example.com', 'seeded', true, NULL),
      ('a1000000-0000-0000-0000-000000000003', 'Carol Lee', 'carol@example.com', 'seeded', true, NULL),
      ('a1000000-0000-0000-0000-000000000004', 'David Kim', 'david@example.com', 'seeded', true, NULL),
      ('a1000000-0000-0000-0000-000000000005', 'Emma Wilson', 'emma@example.com', 'seeded', true, NULL),
      ('a1000000-0000-0000-0000-000000000006', 'Frank Chen', 'frank@example.com', 'seeded', true, NULL),
      ('a1000000-0000-0000-0000-000000000007', 'Grace Patel', 'grace@example.com', 'seeded', true, NULL),
      ('a1000000-0000-0000-0000-000000000008', 'Henry Lopez', 'henry@example.com', 'seeded', true, NULL),
      ('a1000000-0000-0000-0000-000000000009', 'Irene Davis', 'irene@example.com', 'seeded', true, NULL)
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `;
  void userRows;

  // --- Seed Clients ---
  await sql`
    INSERT INTO clients (id, name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired) VALUES
      ('c1000000-0000-0000-0000-000000000001', 'Acme Corp', 'organization', 'active', ARRAY['Enterprise', 'SaaS', 'Q3-Target'], 'Referral', 'From partner network', 'Q3 Enterprise Push', 'Partner', '2024-03-15'),
      ('c1000000-0000-0000-0000-000000000002', 'TechStart Inc', 'organization', 'prospect', ARRAY['Startup', 'Tech'], 'Inbound', 'Website contact form', 'Google Ads', 'Web', '2024-06-20'),
      ('c1000000-0000-0000-0000-000000000003', 'Global Solutions Ltd', 'organization', 'active', ARRAY['Enterprise', 'Consulting'], 'Outbound', 'Cold outreach', 'LinkedIn Campaign', 'Social', '2024-01-10'),
      ('c1000000-0000-0000-0000-000000000004', 'Jane Doe', 'individual', 'active', ARRAY['Freelancer'], 'Referral', 'Colleague referral', NULL, 'Direct', '2024-04-05'),
      ('c1000000-0000-0000-0000-000000000005', 'Summit Industries', 'organization', 'inactive', ARRAY['Manufacturing', 'Enterprise'], 'Trade Show', 'Industry Expo 2024', 'Events', 'Event', '2024-02-28'),
      ('c1000000-0000-0000-0000-000000000006', 'Bright Future LLC', 'organization', 'churned', ARRAY['SMB', 'Retail'], 'Inbound', 'Blog lead magnet', 'Content Marketing', 'Web', '2023-11-15'),
      ('c1000000-0000-0000-0000-000000000007', 'NextGen Software', 'organization', 'prospect', ARRAY['SaaS', 'Startup'], 'Outbound', 'Conference networking', 'SaaStr Annual', 'Event', '2024-07-01'),
      ('c1000000-0000-0000-0000-000000000008', 'Pacific Trading Co', 'organization', 'active', ARRAY['Enterprise', 'Import/Export'], 'Referral', 'Customer referral from Acme', NULL, 'Partner', '2024-05-12'),
      ('c1000000-0000-0000-0000-000000000009', 'Michael Rivera', 'individual', 'prospect', ARRAY['Consultant'], 'Inbound', 'Webinar attendee', 'Product Demo Series', 'Web', '2024-08-01'),
      ('c1000000-0000-0000-0000-000000000010', 'Orion Dynamics', 'organization', 'active', ARRAY['Enterprise', 'Aerospace'], 'Outbound', 'Executive intro', 'ABM Campaign', 'Direct', '2024-04-20')
    ON CONFLICT DO NOTHING
  `;

  // --- Seed Individuals (People/Contacts) ---
  await sql`
    INSERT INTO individuals (id, name, title, email, phone, location) VALUES
      ('b1000000-0000-0000-0000-000000000001', 'Sarah Jenkins', 'CEO', 'sarah.jenkins@acme.com', '+1-555-0101', 'New York, NY'),
      ('b1000000-0000-0000-0000-000000000002', 'Michael Chen', 'CTO', 'michael.chen@acme.com', '+1-555-0102', 'San Francisco, CA'),
      ('b1000000-0000-0000-0000-000000000003', 'Emily Park', 'VP of Sales', 'emily.park@acme.com', '+1-555-0103', 'Chicago, IL'),
      ('b1000000-0000-0000-0000-000000000004', 'Tom Harris', 'Founder', 'tom@techstart.com', '+1-555-0201', 'Austin, TX'),
      ('b1000000-0000-0000-0000-000000000005', 'Lisa Wong', 'Head of Procurement', 'lisa.wong@globalsolutions.com', '+1-555-0301', 'London, UK'),
      ('b1000000-0000-0000-0000-000000000006', 'Jane Doe', 'Independent Consultant', 'jane.doe@email.com', '+1-555-0401', 'Portland, OR'),
      ('b1000000-0000-0000-0000-000000000007', 'Robert Taylor', 'Operations Director', 'robert.taylor@summit.com', '+1-555-0501', 'Detroit, MI'),
      ('b1000000-0000-0000-0000-000000000008', 'Anna Schmidt', 'CFO', 'anna.schmidt@brightfuture.com', '+1-555-0601', 'Miami, FL'),
      ('b1000000-0000-0000-0000-000000000009', 'James Wilson', 'Product Manager', 'james.wilson@nextgen.com', '+1-555-0701', 'Seattle, WA'),
      ('b1000000-0000-0000-0000-000000000010', 'Maria Garcia', 'CEO', 'maria.garcia@pacific.com', '+1-555-0801', 'Los Angeles, CA'),
      ('b1000000-0000-0000-0000-000000000011', 'Michael Rivera', 'Strategy Consultant', 'michael.rivera@email.com', '+1-555-0901', 'Denver, CO'),
      ('b1000000-0000-0000-0000-000000000012', 'Diana Foster', 'VP Engineering', 'diana.foster@orion.com', '+1-555-1001', 'Houston, TX')
    ON CONFLICT DO NOTHING
  `;

  // --- Seed Client-Individual Associations ---
  await sql`
    INSERT INTO client_individuals (client_id, individual_id, role, is_primary) VALUES
      ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'CEO', true),
      ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'CTO', false),
      ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'VP of Sales', false),
      ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 'Founder', true),
      ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000005', 'Head of Procurement', true),
      ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000006', 'Self', true),
      ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000007', 'Operations Director', true),
      ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000008', 'CFO', true),
      ('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000009', 'Product Manager', true),
      ('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000010', 'CEO', true),
      ('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000011', 'Self', true),
      ('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000012', 'VP Engineering', true)
    ON CONFLICT DO NOTHING
  `;

  // --- Seed Relationships (between individuals) ---
  await sql`
    INSERT INTO relationships (individual_id, related_individual_id, relationship_type) VALUES
      ('b1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Colleague'),
      ('b1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'Colleague'),
      ('b1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 'Colleague'),
      ('b1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000009', 'Industry Contact'),
      ('b1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000010', 'Business Partner')
    ON CONFLICT DO NOTHING
  `;

  // --- Seed Deals ---
  await sql`
    INSERT INTO deals (id, name, client_id, value, stage, owner_id, probability, expected_close_date, status) VALUES
      ('d1000000-0000-0000-0000-000000000001', 'Acme Enterprise License', 'c1000000-0000-0000-0000-000000000001', 150000.00, 'Negotiation', 'a1000000-0000-0000-0000-000000000001', 75, '2025-03-31', 'open'),
      ('d1000000-0000-0000-0000-000000000002', 'Acme Support Contract', 'c1000000-0000-0000-0000-000000000001', 45000.00, 'Proposal', 'a1000000-0000-0000-0000-000000000002', 60, '2025-04-15', 'open'),
      ('d1000000-0000-0000-0000-000000000003', 'Acme Training Package', 'c1000000-0000-0000-0000-000000000001', 25000.00, 'Qualified', 'a1000000-0000-0000-0000-000000000001', 40, '2025-05-01', 'open'),
      ('d1000000-0000-0000-0000-000000000004', 'TechStart Pilot', 'c1000000-0000-0000-0000-000000000002', 30000.00, 'Lead', 'a1000000-0000-0000-0000-000000000003', 20, '2025-06-01', 'open'),
      ('d1000000-0000-0000-0000-000000000005', 'Global Solutions Consulting', 'c1000000-0000-0000-0000-000000000003', 200000.00, 'Closed Won', 'a1000000-0000-0000-0000-000000000001', 100, '2025-01-15', 'won'),
      ('d1000000-0000-0000-0000-000000000006', 'Pacific Trading Integration', 'c1000000-0000-0000-0000-000000000008', 85000.00, 'Proposal', 'a1000000-0000-0000-0000-000000000004', 50, '2025-04-30', 'open'),
      ('d1000000-0000-0000-0000-000000000007', 'Orion Platform Deal', 'c1000000-0000-0000-0000-000000000010', 500000.00, 'Qualified', 'a1000000-0000-0000-0000-000000000005', 35, '2025-07-01', 'open'),
      ('d1000000-0000-0000-0000-000000000008', 'Bright Future Renewal', 'c1000000-0000-0000-0000-000000000006', 15000.00, 'Closed Lost', 'a1000000-0000-0000-0000-000000000002', 0, '2024-12-01', 'lost'),
      ('d1000000-0000-0000-0000-000000000009', 'Summit Maintenance Contract', 'c1000000-0000-0000-0000-000000000005', 60000.00, 'Negotiation', 'a1000000-0000-0000-0000-000000000006', 65, '2025-03-15', 'open'),
      ('d1000000-0000-0000-0000-000000000010', 'NextGen Starter Package', 'c1000000-0000-0000-0000-000000000007', 20000.00, 'Lead', 'a1000000-0000-0000-0000-000000000003', 15, '2025-08-01', 'open')
    ON CONFLICT DO NOTHING
  `;

  // --- Seed Tasks ---
  await sql`
    INSERT INTO tasks (id, title, description, due_date, priority, status, client_id, deal_id, assignee_id) VALUES
      ('e1000000-0000-0000-0000-000000000001', 'Follow-up call with Sarah', 'Discuss enterprise license terms and timeline', '2025-03-01', 'high', 'open', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001'),
      ('e1000000-0000-0000-0000-000000000002', 'Send proposal to Acme', 'Prepare and send support contract proposal', '2025-02-28', 'high', 'open', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002'),
      ('e1000000-0000-0000-0000-000000000003', 'Demo for TechStart', 'Product demonstration for pilot evaluation', '2025-03-10', 'medium', 'open', 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003'),
      ('e1000000-0000-0000-0000-000000000004', 'Quarterly review with Global Solutions', 'Review ongoing consulting engagement', '2025-03-15', 'medium', 'open', 'c1000000-0000-0000-0000-000000000003', NULL, 'a1000000-0000-0000-0000-000000000001'),
      ('e1000000-0000-0000-0000-000000000005', 'Pacific Trading contract review', 'Legal review of integration contract', '2025-03-05', 'high', 'in_progress', 'c1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000004'),
      ('e1000000-0000-0000-0000-000000000006', 'Prepare Orion presentation', 'Executive presentation for platform deal', '2025-03-20', 'urgent', 'open', 'c1000000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000005'),
      ('e1000000-0000-0000-0000-000000000007', 'Update CRM records for Summit', 'Clean up inactive client data', '2025-02-25', 'low', 'completed', 'c1000000-0000-0000-0000-000000000005', NULL, 'a1000000-0000-0000-0000-000000000006'),
      ('e1000000-0000-0000-0000-000000000008', 'Send welcome package to Jane', 'Onboarding materials for new freelancer client', '2025-03-02', 'medium', 'open', 'c1000000-0000-0000-0000-000000000004', NULL, 'a1000000-0000-0000-0000-000000000007'),
      ('e1000000-0000-0000-0000-000000000009', 'Follow up with NextGen', 'Check interest level after initial outreach', '2025-03-08', 'low', 'open', 'c1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000003'),
      ('e1000000-0000-0000-0000-000000000010', 'Review Michael Rivera proposal', 'Evaluate consulting engagement proposal', '2025-03-12', 'medium', 'open', 'c1000000-0000-0000-0000-000000000009', NULL, 'a1000000-0000-0000-0000-000000000008')
    ON CONFLICT DO NOTHING
  `;

  // --- Seed Task Notes ---
  await sql`
    INSERT INTO task_notes (task_id, content, created_by) VALUES
      ('e1000000-0000-0000-0000-000000000001', 'Sarah prefers calls on Tuesday mornings.', 'Alice Johnson'),
      ('e1000000-0000-0000-0000-000000000001', 'Updated: she mentioned budget approval is pending from board.', 'Alice Johnson'),
      ('e1000000-0000-0000-0000-000000000005', 'Legal team requested additional clauses for data handling.', 'David Kim')
    ON CONFLICT DO NOTHING
  `;

  // --- Seed Attachments ---
  await sql`
    INSERT INTO attachments (id, filename, file_type, url, size, client_id, deal_id) VALUES
      ('af100000-0000-0000-0000-000000000001', 'acme-contract-draft.pdf', 'application/pdf', 'https://example.com/files/acme-contract.pdf', 245000, 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001'),
      ('af100000-0000-0000-0000-000000000002', 'acme-logo.png', 'image/png', 'https://example.com/files/acme-logo.png', 52000, 'c1000000-0000-0000-0000-000000000001', NULL),
      ('af100000-0000-0000-0000-000000000003', 'techstart-requirements.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'https://example.com/files/techstart-reqs.docx', 180000, 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000004'),
      ('af100000-0000-0000-0000-000000000004', 'global-solutions-invoice.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'https://example.com/files/gs-invoice.xlsx', 95000, 'c1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000005'),
      ('af100000-0000-0000-0000-000000000005', 'orion-presentation.pdf', 'application/pdf', 'https://example.com/files/orion-deck.pdf', 1200000, 'c1000000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000007')
    ON CONFLICT DO NOTHING
  `;

  // --- Seed Deal History ---
  await sql`
    INSERT INTO deal_history (deal_id, old_stage, new_stage, changed_by, changed_at) VALUES
      ('d1000000-0000-0000-0000-000000000001', NULL, 'Lead', 'System', '2024-11-01T10:00:00Z'),
      ('d1000000-0000-0000-0000-000000000001', 'Lead', 'Qualified', 'Alice Johnson', '2024-12-01T14:00:00Z'),
      ('d1000000-0000-0000-0000-000000000001', 'Qualified', 'Proposal', 'Alice Johnson', '2025-01-15T09:00:00Z'),
      ('d1000000-0000-0000-0000-000000000001', 'Proposal', 'Negotiation', 'Alice Johnson', '2025-02-10T11:00:00Z'),
      ('d1000000-0000-0000-0000-000000000005', NULL, 'Lead', 'System', '2024-06-01T08:00:00Z'),
      ('d1000000-0000-0000-0000-000000000005', 'Lead', 'Qualified', 'Alice Johnson', '2024-07-15T10:00:00Z'),
      ('d1000000-0000-0000-0000-000000000005', 'Qualified', 'Proposal', 'Alice Johnson', '2024-09-01T10:00:00Z'),
      ('d1000000-0000-0000-0000-000000000005', 'Proposal', 'Negotiation', 'Alice Johnson', '2024-11-01T10:00:00Z'),
      ('d1000000-0000-0000-0000-000000000005', 'Negotiation', 'Closed Won', 'Alice Johnson', '2025-01-15T10:00:00Z'),
      ('d1000000-0000-0000-0000-000000000008', NULL, 'Lead', 'System', '2024-08-01T08:00:00Z'),
      ('d1000000-0000-0000-0000-000000000008', 'Lead', 'Qualified', 'Bob Martinez', '2024-09-15T10:00:00Z'),
      ('d1000000-0000-0000-0000-000000000008', 'Qualified', 'Proposal', 'Bob Martinez', '2024-10-15T10:00:00Z'),
      ('d1000000-0000-0000-0000-000000000008', 'Proposal', 'Closed Lost', 'Bob Martinez', '2024-12-01T10:00:00Z')
    ON CONFLICT DO NOTHING
  `;

  // --- Seed Writeups ---
  await sql`
    INSERT INTO writeups (deal_id, title, content, author) VALUES
      ('d1000000-0000-0000-0000-000000000001', 'Enterprise Deployment Strategy', 'Acme is looking for an enterprise-wide deployment. Key decision makers are Sarah (CEO) and Michael (CTO). Budget approved for Q1 2025. Main competitor is Salesforce.', 'Alice Johnson'),
      ('d1000000-0000-0000-0000-000000000001', 'Negotiation Follow-up', 'Follow-up from negotiation meeting: They want volume pricing for 500+ seats. Need to prepare custom pricing tier.', 'Alice Johnson'),
      ('d1000000-0000-0000-0000-000000000005', 'Engagement Summary', 'Global Solutions engagement successful. They signed a 2-year consulting contract. Reference customer for future enterprise deals.', 'Alice Johnson'),
      ('d1000000-0000-0000-0000-000000000007', 'Vendor Evaluation Notes', 'Orion is evaluating multiple vendors. Their timeline is aggressive — decision by end of Q2. Need executive sponsorship from our side.', 'Emma Wilson')
    ON CONFLICT DO NOTHING
  `;

  // --- Seed Contact History ---
  await sql`
    INSERT INTO contact_history (individual_id, type, summary, contact_date, performed_by) VALUES
      ('b1000000-0000-0000-0000-000000000001', 'call', 'Introductory call to discuss enterprise needs', '2024-11-05T10:00:00Z', 'Alice Johnson'),
      ('b1000000-0000-0000-0000-000000000001', 'meeting', 'On-site meeting at Acme HQ to review platform capabilities', '2024-12-10T14:00:00Z', 'Alice Johnson'),
      ('b1000000-0000-0000-0000-000000000001', 'email', 'Sent proposal document and pricing sheet', '2025-01-15T09:00:00Z', 'Alice Johnson'),
      ('b1000000-0000-0000-0000-000000000002', 'call', 'Technical deep dive on integration requirements', '2024-12-15T11:00:00Z', 'Bob Martinez'),
      ('b1000000-0000-0000-0000-000000000004', 'email', 'Initial outreach about pilot program', '2024-06-25T08:00:00Z', 'Carol Lee'),
      ('b1000000-0000-0000-0000-000000000005', 'meeting', 'Quarterly business review at Global Solutions office', '2025-01-20T10:00:00Z', 'Alice Johnson'),
      ('b1000000-0000-0000-0000-000000000010', 'call', 'Discussed integration timeline and technical requirements', '2025-02-01T15:00:00Z', 'David Kim'),
      ('b1000000-0000-0000-0000-000000000012', 'email', 'Sent platform overview and case studies', '2024-05-01T09:00:00Z', 'Emma Wilson')
    ON CONFLICT DO NOTHING
  `;

  // --- Seed Timeline Events ---
  await sql`
    INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by) VALUES
      ('c1000000-0000-0000-0000-000000000001', 'client_created', 'Client Acme Corp was created', NULL, NULL, 'System'),
      ('c1000000-0000-0000-0000-000000000001', 'deal_created', 'Deal "Acme Enterprise License" was created', 'deal', 'd1000000-0000-0000-0000-000000000001', 'Alice Johnson'),
      ('c1000000-0000-0000-0000-000000000001', 'deal_stage_changed', 'Deal "Acme Enterprise License" moved from Lead to Qualified', 'deal', 'd1000000-0000-0000-0000-000000000001', 'Alice Johnson'),
      ('c1000000-0000-0000-0000-000000000001', 'deal_stage_changed', 'Deal "Acme Enterprise License" moved from Qualified to Proposal', 'deal', 'd1000000-0000-0000-0000-000000000001', 'Alice Johnson'),
      ('c1000000-0000-0000-0000-000000000001', 'deal_stage_changed', 'Deal "Acme Enterprise License" moved from Proposal to Negotiation', 'deal', 'd1000000-0000-0000-0000-000000000001', 'Alice Johnson'),
      ('c1000000-0000-0000-0000-000000000001', 'task_created', 'Task "Follow-up call with Sarah" was created', 'task', 'e1000000-0000-0000-0000-000000000001', 'Alice Johnson'),
      ('c1000000-0000-0000-0000-000000000001', 'contact_added', 'Contact Sarah Jenkins was associated', 'individual', 'b1000000-0000-0000-0000-000000000001', 'System'),
      ('c1000000-0000-0000-0000-000000000002', 'client_created', 'Client TechStart Inc was created', NULL, NULL, 'System'),
      ('c1000000-0000-0000-0000-000000000002', 'deal_created', 'Deal "TechStart Pilot" was created', 'deal', 'd1000000-0000-0000-0000-000000000004', 'Carol Lee'),
      ('c1000000-0000-0000-0000-000000000003', 'client_created', 'Client Global Solutions Ltd was created', NULL, NULL, 'System'),
      ('c1000000-0000-0000-0000-000000000003', 'deal_created', 'Deal "Global Solutions Consulting" was created', 'deal', 'd1000000-0000-0000-0000-000000000005', 'Alice Johnson'),
      ('c1000000-0000-0000-0000-000000000003', 'deal_stage_changed', 'Deal "Global Solutions Consulting" moved to Closed Won', 'deal', 'd1000000-0000-0000-0000-000000000005', 'Alice Johnson'),
      ('c1000000-0000-0000-0000-000000000010', 'client_created', 'Client Orion Dynamics was created', NULL, NULL, 'System'),
      ('c1000000-0000-0000-0000-000000000010', 'deal_created', 'Deal "Orion Platform Deal" was created', 'deal', 'd1000000-0000-0000-0000-000000000007', 'Emma Wilson')
    ON CONFLICT DO NOTHING
  `;

  // --- Seed Webhooks ---
  await sql`
    INSERT INTO webhooks (name, url, events, enabled) VALUES
      ('Zapier Integration', 'https://hooks.zapier.com/hooks/catch/12345/abcdef', ARRAY['deal_stage_changed', 'task_completed'], true),
      ('Discord Notifications', 'https://discord.com/api/webhooks/123456/token', ARRAY['deal_created', 'client_created'], false)
    ON CONFLICT DO NOTHING
  `;

  console.log("Database seeded successfully.");
}

async function main() {
  const databaseUrl = process.argv[2] || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  await seedDatabase(databaseUrl);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
