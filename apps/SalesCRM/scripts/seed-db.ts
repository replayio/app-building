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
    { name: 'Acme Corp', type: 'Organization', status: 'Active', source: 'Referral', tags: ['Enterprise', 'SaaS'] },
    { name: 'Globex Solutions', type: 'Organization', status: 'Active', source: 'Campaign', tags: ['Enterprise', 'VIP'] },
    { name: 'Jane Doe', type: 'Individual', status: 'Prospect', source: 'Direct', tags: ['Consultant'] },
    { name: 'TechStart Inc', type: 'Organization', status: 'Inactive', source: 'Referral', tags: ['SaaS', 'Startup'] },
    { name: 'MegaCorp Industries', type: 'Organization', status: 'Churned', source: 'Campaign', tags: ['Enterprise'] },
    { name: 'Alpha Dynamics', type: 'Organization', status: 'Active', source: 'Direct', tags: ['Enterprise', 'Q3-Target'] },
    { name: 'Beta Systems', type: 'Organization', status: 'Active', source: 'Referral', tags: ['SaaS'] },
    { name: 'Gamma Consulting', type: 'Organization', status: 'Prospect', source: 'Campaign', tags: ['Consultant'] },
    { name: 'Delta Partners', type: 'Organization', status: 'Inactive', source: 'Direct', tags: ['VIP'] },
    { name: 'Epsilon Labs', type: 'Organization', status: 'Active', source: 'Referral', tags: ['SaaS', 'Startup'] },
  ]

  const clientIds: string[] = []

  for (const c of clients) {
    const result = await sql`
      INSERT INTO clients (name, type, status, source)
      VALUES (${c.name}, ${c.type}, ${c.status}, ${c.source})
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
    { name: 'Sarah Jenkins', title: 'CEO', clientIndex: 0, role: 'CEO' },
    { name: 'Michael Chen', title: 'CTO', clientIndex: 1, role: 'CTO' },
    { name: 'Jane Doe', title: 'Consultant', clientIndex: 2, role: 'Self' },
    { name: 'Tom Wilson', title: 'VP Sales', clientIndex: 3, role: 'VP Sales' },
    { name: 'Emily Davis', title: 'Director', clientIndex: 4, role: 'Director' },
    { name: 'Alex Johnson', title: 'Manager', clientIndex: 5, role: 'Manager' },
  ]

  for (const contact of contacts) {
    const indResult = await sql`
      INSERT INTO individuals (name, title)
      VALUES (${contact.name}, ${contact.title})
      RETURNING id
    `
    const indId = indResult[0].id as string
    await sql`
      INSERT INTO client_individuals (client_id, individual_id, role, is_primary)
      VALUES (${clientIds[contact.clientIndex]}, ${indId}, ${contact.role}, true)
    `
  }

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

  console.log(`Seeded ${clients.length} clients, ${contacts.length} contacts, ${deals.length} deals, ${tasks.length} tasks`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
