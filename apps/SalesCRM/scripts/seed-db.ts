import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const sql = neon(databaseUrl)

async function seed() {
  // Insert tags
  const tagNames = ['Enterprise', 'SaaS', 'VIP', 'Startup', 'Consultant', 'Q3-Target']
  for (const name of tagNames) {
    await sql`INSERT INTO tags (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`
  }
  const tagRows = await sql`SELECT id, name FROM tags WHERE name = ANY(${tagNames})`
  const tagMap = new Map(tagRows.map((r: Record<string, string>) => [r.name, r.id]))

  // Insert clients with various statuses, types, and sources
  const clients = [
    { name: 'Acme Corp', type: 'Organization', status: 'Active', source: 'Referral', industry: 'Software', tags: ['Enterprise', 'SaaS'] },
    { name: 'Globex Solutions', type: 'Organization', status: 'Active', source: 'Campaign', industry: 'Hardware', tags: ['Enterprise', 'VIP'] },
    { name: 'Jane Doe', type: 'Individual', status: 'Prospect', source: 'Direct', industry: null, tags: ['Consultant'] },
    { name: 'TechStart Inc', type: 'Organization', status: 'Inactive', source: 'Referral', industry: 'SaaS', tags: ['SaaS', 'Startup'] },
    { name: 'MegaCorp Industries', type: 'Organization', status: 'Churned', source: 'Campaign', industry: 'Manufacturing', tags: ['Enterprise'] },
    { name: 'Alpha Dynamics', type: 'Organization', status: 'Active', source: 'Direct', industry: 'Aerospace', tags: ['Enterprise', 'Q3-Target'] },
    { name: 'Beta Systems', type: 'Organization', status: 'Active', source: 'Referral', industry: 'IT Services', tags: ['SaaS'] },
    { name: 'Gamma Consulting', type: 'Organization', status: 'Prospect', source: 'Campaign', industry: 'Consulting', tags: ['Consultant'] },
    { name: 'Delta Partners', type: 'Organization', status: 'Inactive', source: 'Direct', industry: 'Finance', tags: ['VIP'] },
    { name: 'Epsilon Labs', type: 'Organization', status: 'Active', source: 'Referral', industry: 'Biotech', tags: ['SaaS', 'Startup'] },
  ]

  const clientIds: string[] = []

  for (const c of clients) {
    const result = await sql`
      INSERT INTO clients (name, type, status, source, industry)
      VALUES (${c.name}, ${c.type}, ${c.status}, ${c.source}, ${c.industry})
      RETURNING id
    `
    const clientId = result[0].id as string
    clientIds.push(clientId)

    for (const tagName of c.tags) {
      const tagId = tagMap.get(tagName)
      if (tagId) {
        await sql`INSERT INTO client_tags (client_id, tag_id) VALUES (${clientId}, ${tagId}) ON CONFLICT DO NOTHING`
      }
    }
  }

  // Insert individuals as primary contacts
  const contacts = [
    { name: 'Sarah Jenkins', title: 'CEO', email: 'sarah.jenkins@acmecorp.com', phone: '+1 (555) 123-4567', location: 'San Francisco, CA', clientIndex: 0, role: 'CEO' },
    { name: 'Michael Chen', title: 'CTO', email: 'michael.chen@globex.com', phone: '+1 (555) 234-5678', location: 'New York, NY', clientIndex: 1, role: 'CTO' },
    { name: 'Jane Doe', title: 'Consultant', email: null, phone: null, location: null, clientIndex: 2, role: 'Self' },
    { name: 'Tom Wilson', title: 'VP Sales', email: 'tom.wilson@techstart.com', phone: null, location: 'Austin, TX', clientIndex: 3, role: 'VP Sales' },
    { name: 'Emily Davis', title: 'Director', email: 'emily.davis@megacorp.com', phone: '+1 (555) 345-6789', location: null, clientIndex: 4, role: 'Director' },
    { name: 'Alex Johnson', title: 'Manager', email: null, phone: null, location: 'Chicago, IL', clientIndex: 5, role: 'Manager' },
  ]

  const individualIds: string[] = []

  for (const contact of contacts) {
    const indResult = await sql`
      INSERT INTO individuals (name, title, email, phone, location)
      VALUES (${contact.name}, ${contact.title}, ${contact.email}, ${contact.phone}, ${contact.location})
      RETURNING id
    `
    const indId = indResult[0].id as string
    individualIds.push(indId)
    await sql`
      INSERT INTO client_individuals (client_id, individual_id, role, is_primary)
      VALUES (${clientIds[contact.clientIndex]}, ${indId}, ${contact.role}, true)
    `
  }

  // Associate Sarah Jenkins with a second client (Globex Solutions) for multi-association testing
  await sql`
    INSERT INTO client_individuals (client_id, individual_id, role, is_primary)
    VALUES (${clientIds[1]}, ${individualIds[0]}, 'Advisor', false)
  `

  // Insert relationships between individuals
  // Sarah Jenkins <-> Michael Chen (Colleague)
  await sql`
    INSERT INTO relationships (individual_id, related_individual_id, relationship_type)
    VALUES (${individualIds[0]}, ${individualIds[1]}, 'Colleague')
  `
  await sql`
    INSERT INTO relationships (individual_id, related_individual_id, relationship_type)
    VALUES (${individualIds[1]}, ${individualIds[0]}, 'Colleague')
  `
  // Sarah Jenkins <-> Tom Wilson (Decision Maker)
  await sql`
    INSERT INTO relationships (individual_id, related_individual_id, relationship_type)
    VALUES (${individualIds[0]}, ${individualIds[3]}, 'Decision Maker')
  `
  await sql`
    INSERT INTO relationships (individual_id, related_individual_id, relationship_type)
    VALUES (${individualIds[3]}, ${individualIds[0]}, 'Decision Maker')
  `

  // Insert contact history for Sarah Jenkins
  const historyDate1 = new Date()
  historyDate1.setDate(historyDate1.getDate() - 3)
  const historyDate2 = new Date()
  historyDate2.setDate(historyDate2.getDate() - 7)
  await sql`
    INSERT INTO contact_history (individual_id, interaction_type, summary, team_member, contact_date)
    VALUES (${individualIds[0]}, 'Video Call', 'Discussed Q4 roadmap integration. Action items assigned.', 'Michael B. (Sales Lead)', ${historyDate1.toISOString()})
  `
  await sql`
    INSERT INTO contact_history (individual_id, interaction_type, summary, team_member, contact_date)
    VALUES (${individualIds[0]}, 'Email', 'Sent follow-up proposal with revised pricing.', 'Emily R. (Account Manager)', ${historyDate2.toISOString()})
  `

  // Insert a bare individual with no client association (for empty-state testing)
  await sql`
    INSERT INTO individuals (name, title, email, phone, location)
    VALUES ('Unlinked Person', 'Freelancer', 'unlinked@example.com', null, null)
  `

  // Insert deals for some clients
  const deals = [
    { name: 'Enterprise License', clientIndex: 0, stage: 'Proposal', value: 150000 },
    { name: 'SaaS Upgrade', clientIndex: 0, stage: 'Discovery', value: 50000 },
    { name: 'Platform Migration', clientIndex: 0, stage: 'Negotiation', value: 75000 },
    { name: 'Consulting Package', clientIndex: 1, stage: 'Lead', value: 30000 },
    { name: 'Annual Renewal', clientIndex: 1, stage: 'Proposal', value: 120000 },
  ]

  for (const d of deals) {
    await sql`
      INSERT INTO deals (name, client_id, stage, value)
      VALUES (${d.name}, ${clientIds[d.clientIndex]}, ${d.stage}, ${d.value})
    `
  }

  // Insert tasks for some clients
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const tasks = [
    { title: 'Follow-up call', clientIndex: 0, dueDate: now.toISOString(), completed: false },
    { title: 'Send proposal', clientIndex: 1, dueDate: tomorrow.toISOString(), completed: false },
    { title: 'Review contract', clientIndex: 2, dueDate: nextWeek.toISOString(), completed: false },
  ]

  for (const t of tasks) {
    await sql`
      INSERT INTO tasks (title, client_id, due_date, completed)
      VALUES (${t.title}, ${clientIds[t.clientIndex]}, ${t.dueDate}, ${t.completed})
    `
  }

  console.log(`Seeded ${clients.length} clients, ${contacts.length} contacts, ${deals.length} deals, ${tasks.length} tasks, 2 relationships, 2 contact history entries`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
