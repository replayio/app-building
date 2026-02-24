import type { Context } from '@netlify/functions'
import { neon } from '@neondatabase/serverless'

const ITEMS_PER_PAGE = 20

export default async function handler(req: Request, _context: Context) {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    return Response.json({ error: 'Database not configured' }, { status: 500 })
  }

  const sql = neon(databaseUrl)
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const resourceId = segments[3] || null

  if (req.method === 'GET') {
    // CSV export
    if (url.searchParams.get('export') === 'csv') {
      const rows = await sql`
        SELECT d.name, c.name as client_name, d.value, d.stage, d.status,
               u.name as owner, d.probability, d.expected_close_date
        FROM deals d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.owner_id = u.id
        ORDER BY d.created_at DESC
      `
      const header = 'Name,Client Name,Value,Stage,Status,Owner,Probability,Expected Close Date'
      const csvRows = rows.map((r: Record<string, unknown>) => {
        const fields = [r.name, r.client_name || '', r.value || '', r.stage, r.status, r.owner || '', r.probability || '', r.expected_close_date || '']
        return fields.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(',')
      })
      const csv = [header, ...csvRows].join('\n')
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="deals.csv"',
        },
      })
    }

    // Single deal by ID
    if (resourceId) {
      const rows = await sql`
        SELECT d.*, c.name as client_name, u.name as owner
        FROM deals d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.owner_id = u.id
        WHERE d.id = ${resourceId}
      `
      if (rows.length === 0) {
        return Response.json({ error: 'Deal not found' }, { status: 404 })
      }
      return Response.json(rows[0])
    }

    // List deals with filters
    const search = url.searchParams.get('search') || ''
    const stage = url.searchParams.get('stage') || ''
    const client = url.searchParams.get('client') || ''
    const status = url.searchParams.get('status') || ''
    const sortBy = url.searchParams.get('sortBy') || 'created_at'
    const sortDir = url.searchParams.get('sortDir') || 'desc'
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const offset = (page - 1) * ITEMS_PER_PAGE

    const searchPattern = search ? `%${search}%` : ''

    const countResult = await sql`
      SELECT COUNT(*) as count
      FROM deals d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE (${search} = '' OR d.name ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern})
        AND (${stage} = '' OR d.stage = ${stage})
        AND (${client} = '' OR d.client_id = ${client})
        AND (${status} = '' OR d.status = ${status})
    `
    const total = parseInt(String(countResult[0].count), 10)

    const isDesc = sortDir === 'desc'

    let rows
    if (sortBy === 'name' && !isDesc) {
      rows = await sql`
        SELECT d.*, c.name as client_name, u.name as owner
        FROM deals d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.owner_id = u.id
        WHERE (${search} = '' OR d.name ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern})
          AND (${stage} = '' OR d.stage = ${stage})
          AND (${client} = '' OR d.client_id = ${client})
          AND (${status} = '' OR d.status = ${status})
        ORDER BY d.name ASC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `
    } else if (sortBy === 'name' && isDesc) {
      rows = await sql`
        SELECT d.*, c.name as client_name, u.name as owner
        FROM deals d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.owner_id = u.id
        WHERE (${search} = '' OR d.name ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern})
          AND (${stage} = '' OR d.stage = ${stage})
          AND (${client} = '' OR d.client_id = ${client})
          AND (${status} = '' OR d.status = ${status})
        ORDER BY d.name DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `
    } else if (sortBy === 'value' && !isDesc) {
      rows = await sql`
        SELECT d.*, c.name as client_name, u.name as owner
        FROM deals d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.owner_id = u.id
        WHERE (${search} = '' OR d.name ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern})
          AND (${stage} = '' OR d.stage = ${stage})
          AND (${client} = '' OR d.client_id = ${client})
          AND (${status} = '' OR d.status = ${status})
        ORDER BY d.value ASC NULLS LAST
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `
    } else if (sortBy === 'value' && isDesc) {
      rows = await sql`
        SELECT d.*, c.name as client_name, u.name as owner
        FROM deals d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.owner_id = u.id
        WHERE (${search} = '' OR d.name ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern})
          AND (${stage} = '' OR d.stage = ${stage})
          AND (${client} = '' OR d.client_id = ${client})
          AND (${status} = '' OR d.status = ${status})
        ORDER BY d.value DESC NULLS LAST
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `
    } else if (sortBy === 'expected_close_date' && !isDesc) {
      rows = await sql`
        SELECT d.*, c.name as client_name, u.name as owner
        FROM deals d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.owner_id = u.id
        WHERE (${search} = '' OR d.name ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern})
          AND (${stage} = '' OR d.stage = ${stage})
          AND (${client} = '' OR d.client_id = ${client})
          AND (${status} = '' OR d.status = ${status})
        ORDER BY d.expected_close_date ASC NULLS LAST
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `
    } else if (sortBy === 'expected_close_date' && isDesc) {
      rows = await sql`
        SELECT d.*, c.name as client_name, u.name as owner
        FROM deals d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.owner_id = u.id
        WHERE (${search} = '' OR d.name ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern})
          AND (${stage} = '' OR d.stage = ${stage})
          AND (${client} = '' OR d.client_id = ${client})
          AND (${status} = '' OR d.status = ${status})
        ORDER BY d.expected_close_date DESC NULLS LAST
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `
    } else if (sortBy === 'stage' && !isDesc) {
      rows = await sql`
        SELECT d.*, c.name as client_name, u.name as owner
        FROM deals d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.owner_id = u.id
        WHERE (${search} = '' OR d.name ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern})
          AND (${stage} = '' OR d.stage = ${stage})
          AND (${client} = '' OR d.client_id = ${client})
          AND (${status} = '' OR d.status = ${status})
        ORDER BY d.stage ASC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `
    } else if (sortBy === 'stage' && isDesc) {
      rows = await sql`
        SELECT d.*, c.name as client_name, u.name as owner
        FROM deals d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.owner_id = u.id
        WHERE (${search} = '' OR d.name ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern})
          AND (${stage} = '' OR d.stage = ${stage})
          AND (${client} = '' OR d.client_id = ${client})
          AND (${status} = '' OR d.status = ${status})
        ORDER BY d.stage DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `
    } else if (isDesc) {
      rows = await sql`
        SELECT d.*, c.name as client_name, u.name as owner
        FROM deals d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.owner_id = u.id
        WHERE (${search} = '' OR d.name ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern})
          AND (${stage} = '' OR d.stage = ${stage})
          AND (${client} = '' OR d.client_id = ${client})
          AND (${status} = '' OR d.status = ${status})
        ORDER BY d.created_at DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `
    } else {
      rows = await sql`
        SELECT d.*, c.name as client_name, u.name as owner
        FROM deals d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.owner_id = u.id
        WHERE (${search} = '' OR d.name ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern})
          AND (${stage} = '' OR d.stage = ${stage})
          AND (${client} = '' OR d.client_id = ${client})
          AND (${status} = '' OR d.status = ${status})
        ORDER BY d.created_at ASC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `
    }

    return Response.json({ deals: rows, total, page, perPage: ITEMS_PER_PAGE })
  }

  if (req.method === 'POST') {
    if (resourceId === 'import') {
      const body = await req.json()
      const { deals: dealRows } = body as { deals: Array<Record<string, string>> }
      if (!Array.isArray(dealRows)) {
        return Response.json({ error: 'deals array required' }, { status: 400 })
      }

      const errors: Array<{ row: number; error: string }> = []
      let imported = 0
      const validStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
      const validStatuses = ['open', 'won', 'lost']

      for (let i = 0; i < dealRows.length; i++) {
        const row = dealRows[i]
        const name = (row.Name || row.name || '').trim()
        if (!name) {
          errors.push({ row: i + 1, error: 'Name is required' })
          continue
        }

        const stageRaw = (row.Stage || row.stage || 'lead').trim().toLowerCase().replace(/\s+/g, '_')
        if (!validStages.includes(stageRaw)) {
          errors.push({ row: i + 1, error: `Invalid stage "${row.Stage || row.stage}"` })
          continue
        }

        const statusRaw = (row.Status || row.status || 'open').trim().toLowerCase()
        if (!validStatuses.includes(statusRaw)) {
          errors.push({ row: i + 1, error: `Invalid status "${row.Status || row.status}"` })
          continue
        }

        let clientId: string | null = null
        const clientName = (row['Client Name'] || row.client_name || '').trim()
        if (clientName) {
          const clients = await sql`SELECT id FROM clients WHERE LOWER(name) = LOWER(${clientName}) LIMIT 1`
          if (clients.length > 0) clientId = clients[0].id
        }

        let ownerId: string | null = null
        const ownerName = (row.Owner || row.owner || '').trim()
        if (ownerName) {
          const users = await sql`SELECT id FROM users WHERE LOWER(name) ILIKE LOWER(${ownerName + '%'}) LIMIT 1`
          if (users.length > 0) ownerId = users[0].id
        }

        const value = parseFloat(row.Value || row.value || '0') || null
        const probability = parseInt(row.Probability || row.probability || '', 10) || null
        const expectedCloseDate = (row['Expected Close Date'] || row.expected_close_date || '').trim() || null

        if (clientId) {
          await sql`
            INSERT INTO deals (name, client_id, value, stage, status, owner_id, probability, expected_close_date)
            VALUES (${name}, ${clientId}, ${value}, ${stageRaw}, ${statusRaw}, ${ownerId}, ${probability}, ${expectedCloseDate || null})
          `
          imported++
        } else {
          errors.push({ row: i + 1, error: 'Client not found' })
        }
      }

      return Response.json({ imported, errors, total: dealRows.length })
    }

    const body = await req.json()
    const { name, client_id, value, stage, owner_id, probability, expected_close_date } = body as {
      name?: string
      client_id?: string
      value?: number
      stage?: string
      owner_id?: string
      probability?: number
      expected_close_date?: string
    }

    if (!name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!client_id) {
      return Response.json({ error: 'Client is required' }, { status: 400 })
    }

    const validStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
    const safeStage = validStages.includes(stage || '') ? stage : 'lead'

    const rows = await sql`
      INSERT INTO deals (name, client_id, value, stage, status, owner_id, probability, expected_close_date)
      VALUES (
        ${name.trim()},
        ${client_id},
        ${value || null},
        ${safeStage},
        'open',
        ${owner_id || null},
        ${probability || null},
        ${expected_close_date || null}
      )
      RETURNING *
    `

    const deal = rows[0]

    const fullDeal = await sql`
      SELECT d.*, c.name as client_name, u.name as owner
      FROM deals d
      LEFT JOIN clients c ON d.client_id = c.id
      LEFT JOIN users u ON d.owner_id = u.id
      WHERE d.id = ${deal.id}
    `

    // Create timeline event
    await sql`
      INSERT INTO timeline_events (client_id, deal_id, event_type, description, actor_name)
      VALUES (${client_id}, ${deal.id}, 'deal_created', ${'Deal created: ' + name.trim()}, 'System')
    `

    return Response.json(fullDeal[0], { status: 201 })
  }

  if (req.method === 'PUT') {
    if (!resourceId) {
      return Response.json({ error: 'Deal ID required' }, { status: 400 })
    }

    const body = await req.json()
    const { name, value, stage, status, owner_id, probability, expected_close_date } = body as {
      name?: string
      value?: number
      stage?: string
      status?: string
      owner_id?: string
      probability?: number
      expected_close_date?: string
    }

    const current = await sql`SELECT * FROM deals WHERE id = ${resourceId}`
    if (current.length === 0) {
      return Response.json({ error: 'Deal not found' }, { status: 404 })
    }

    const validStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
    const safeStage = stage && validStages.includes(stage) ? stage : current[0].stage

    const validStatuses = ['open', 'won', 'lost']
    const safeStatus = status && validStatuses.includes(status) ? status : current[0].status

    const rows = await sql`
      UPDATE deals SET
        name = ${name?.trim() || current[0].name},
        value = ${value !== undefined ? (value || null) : current[0].value},
        stage = ${safeStage},
        status = ${safeStatus},
        owner_id = ${owner_id !== undefined ? (owner_id || null) : current[0].owner_id},
        probability = ${probability !== undefined ? (probability || null) : current[0].probability},
        expected_close_date = ${expected_close_date !== undefined ? (expected_close_date || null) : current[0].expected_close_date},
        updated_at = NOW()
      WHERE id = ${resourceId}
      RETURNING *
    `

    // Track stage changes
    if (stage && stage !== current[0].stage) {
      await sql`
        INSERT INTO deal_stage_history (deal_id, old_stage, new_stage)
        VALUES (${resourceId}, ${current[0].stage}, ${stage})
      `
      await sql`
        INSERT INTO timeline_events (client_id, deal_id, event_type, description, actor_name, metadata)
        VALUES (
          ${current[0].client_id}, ${resourceId}, 'deal_stage_changed',
          ${'Deal stage changed: ' + rows[0].name + ' from ' + current[0].stage + ' to ' + stage},
          'System',
          ${JSON.stringify({ old_stage: current[0].stage, new_stage: stage })}
        )
      `
    }

    const fullDeal = await sql`
      SELECT d.*, c.name as client_name, u.name as owner
      FROM deals d
      LEFT JOIN clients c ON d.client_id = c.id
      LEFT JOIN users u ON d.owner_id = u.id
      WHERE d.id = ${resourceId}
    `

    return Response.json(fullDeal[0])
  }

  if (req.method === 'DELETE') {
    if (!resourceId) {
      return Response.json({ error: 'Deal ID required' }, { status: 400 })
    }

    const existing = await sql`SELECT * FROM deals WHERE id = ${resourceId}`
    if (existing.length === 0) {
      return Response.json({ error: 'Deal not found' }, { status: 404 })
    }

    await sql`DELETE FROM deals WHERE id = ${resourceId}`
    return Response.json({ success: true })
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
