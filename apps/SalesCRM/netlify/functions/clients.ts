import type { Context } from '@netlify/functions'
import { neon } from '@neondatabase/serverless'

const ITEMS_PER_PAGE = 50

export default async function handler(req: Request, _context: Context) {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    return Response.json({ error: 'Database not configured' }, { status: 500 })
  }

  const sql = neon(databaseUrl)
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const resourceId = segments[3] || null

  // GET requests
  if (req.method === 'GET') {
    // CSV export
    if (url.searchParams.get('export') === 'csv') {
      const rows = await sql`
        SELECT name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired
        FROM clients
        ORDER BY name ASC
      `
      const header = 'Name,Type,Status,Tags,Source Type,Source Detail,Campaign,Channel,Date Acquired'
      const csvRows = rows.map((r: Record<string, unknown>) => {
        const tags = Array.isArray(r.tags) ? (r.tags as string[]).join(', ') : ''
        const fields = [r.name, r.type, r.status, tags, r.source_type || '', r.source_detail || '', r.campaign || '', r.channel || '', r.date_acquired || '']
        return fields.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(',')
      })
      const csv = [header, ...csvRows].join('\n')
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="clients.csv"',
        },
      })
    }

    // Single client by ID
    if (resourceId) {
      const rows = await sql`
        SELECT c.*,
               (SELECT i.name FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_name,
               (SELECT i.title FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_title,
               COALESCE((SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.status = 'open'), 0)::int as open_deal_count,
               COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.client_id = c.id AND d.status = 'open'), 0)::numeric as open_deal_value,
               (SELECT t.title FROM tasks t WHERE t.client_id = c.id AND t.status = 'open' ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task,
               (SELECT t.due_date FROM tasks t WHERE t.client_id = c.id AND t.status = 'open' ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_due
        FROM clients c
        WHERE c.id = ${resourceId}
      `
      if (rows.length === 0) {
        return Response.json({ error: 'Client not found' }, { status: 404 })
      }
      return Response.json(rows[0])
    }

    // List clients with filters, search, sort, and pagination
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status') || ''
    const tag = url.searchParams.get('tag') || ''
    const source = url.searchParams.get('source') || ''
    const sortBy = url.searchParams.get('sortBy') || 'updated_at'
    const sortDir = url.searchParams.get('sortDir') || 'desc'
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limit = Math.min(200, parseInt(url.searchParams.get('limit') || String(ITEMS_PER_PAGE), 10))
    const offset = (page - 1) * limit

    // Build search pattern
    const searchPattern = search ? `%${search}%` : ''

    // Count query
    const countResult = await sql`
      SELECT COUNT(*) as count
      FROM clients c
      LEFT JOIN client_individuals ci_search ON ci_search.client_id = c.id AND ci_search.is_primary = true
      LEFT JOIN individuals i_search ON ci_search.individual_id = i_search.id
      WHERE (${search} = '' OR
             c.name ILIKE ${searchPattern} OR
             EXISTS (SELECT 1 FROM unnest(c.tags) t WHERE t ILIKE ${searchPattern}) OR
             i_search.name ILIKE ${searchPattern})
        AND (${status} = '' OR c.status = ${status})
        AND (${tag} = '' OR ${tag} = ANY(c.tags))
        AND (${source} = '' OR c.source_type = ${source})
    `
    const total = parseInt(String(countResult[0].count), 10)

    // Determine sort expression
    const allowedSorts: Record<string, string> = {
      name: 'c.name',
      created_at: 'c.created_at',
      updated_at: 'c.updated_at',
    }
    const sortColumn = allowedSorts[sortBy] || 'c.updated_at'
    const isDesc = sortDir === 'desc'

    // Main query - use conditional ORDER BY
    let rows
    if (sortColumn === 'c.name' && !isDesc) {
      rows = await sql`
        SELECT c.*,
               (SELECT i.name FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_name,
               (SELECT i.title FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_title,
               COALESCE((SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.status = 'open'), 0)::int as open_deal_count,
               COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.client_id = c.id AND d.status = 'open'), 0)::numeric as open_deal_value,
               (SELECT t.title FROM tasks t WHERE t.client_id = c.id AND t.status = 'open' ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task,
               (SELECT t.due_date FROM tasks t WHERE t.client_id = c.id AND t.status = 'open' ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_due
        FROM clients c
        LEFT JOIN client_individuals ci_search ON ci_search.client_id = c.id AND ci_search.is_primary = true
        LEFT JOIN individuals i_search ON ci_search.individual_id = i_search.id
        WHERE (${search} = '' OR
               c.name ILIKE ${searchPattern} OR
               EXISTS (SELECT 1 FROM unnest(c.tags) t WHERE t ILIKE ${searchPattern}) OR
               i_search.name ILIKE ${searchPattern})
          AND (${status} = '' OR c.status = ${status})
          AND (${tag} = '' OR ${tag} = ANY(c.tags))
          AND (${source} = '' OR c.source_type = ${source})
        ORDER BY c.name ASC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (sortColumn === 'c.name' && isDesc) {
      rows = await sql`
        SELECT c.*,
               (SELECT i.name FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_name,
               (SELECT i.title FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_title,
               COALESCE((SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.status = 'open'), 0)::int as open_deal_count,
               COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.client_id = c.id AND d.status = 'open'), 0)::numeric as open_deal_value,
               (SELECT t.title FROM tasks t WHERE t.client_id = c.id AND t.status = 'open' ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task,
               (SELECT t.due_date FROM tasks t WHERE t.client_id = c.id AND t.status = 'open' ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_due
        FROM clients c
        LEFT JOIN client_individuals ci_search ON ci_search.client_id = c.id AND ci_search.is_primary = true
        LEFT JOIN individuals i_search ON ci_search.individual_id = i_search.id
        WHERE (${search} = '' OR
               c.name ILIKE ${searchPattern} OR
               EXISTS (SELECT 1 FROM unnest(c.tags) t WHERE t ILIKE ${searchPattern}) OR
               i_search.name ILIKE ${searchPattern})
          AND (${status} = '' OR c.status = ${status})
          AND (${tag} = '' OR ${tag} = ANY(c.tags))
          AND (${source} = '' OR c.source_type = ${source})
        ORDER BY c.name DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (sortColumn === 'c.created_at' && isDesc) {
      rows = await sql`
        SELECT c.*,
               (SELECT i.name FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_name,
               (SELECT i.title FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_title,
               COALESCE((SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.status = 'open'), 0)::int as open_deal_count,
               COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.client_id = c.id AND d.status = 'open'), 0)::numeric as open_deal_value,
               (SELECT t.title FROM tasks t WHERE t.client_id = c.id AND t.status = 'open' ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task,
               (SELECT t.due_date FROM tasks t WHERE t.client_id = c.id AND t.status = 'open' ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_due
        FROM clients c
        LEFT JOIN client_individuals ci_search ON ci_search.client_id = c.id AND ci_search.is_primary = true
        LEFT JOIN individuals i_search ON ci_search.individual_id = i_search.id
        WHERE (${search} = '' OR
               c.name ILIKE ${searchPattern} OR
               EXISTS (SELECT 1 FROM unnest(c.tags) t WHERE t ILIKE ${searchPattern}) OR
               i_search.name ILIKE ${searchPattern})
          AND (${status} = '' OR c.status = ${status})
          AND (${tag} = '' OR ${tag} = ANY(c.tags))
          AND (${source} = '' OR c.source_type = ${source})
        ORDER BY c.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (sortColumn === 'c.created_at' && !isDesc) {
      rows = await sql`
        SELECT c.*,
               (SELECT i.name FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_name,
               (SELECT i.title FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_title,
               COALESCE((SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.status = 'open'), 0)::int as open_deal_count,
               COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.client_id = c.id AND d.status = 'open'), 0)::numeric as open_deal_value,
               (SELECT t.title FROM tasks t WHERE t.client_id = c.id AND t.status = 'open' ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task,
               (SELECT t.due_date FROM tasks t WHERE t.client_id = c.id AND t.status = 'open' ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_due
        FROM clients c
        LEFT JOIN client_individuals ci_search ON ci_search.client_id = c.id AND ci_search.is_primary = true
        LEFT JOIN individuals i_search ON ci_search.individual_id = i_search.id
        WHERE (${search} = '' OR
               c.name ILIKE ${searchPattern} OR
               EXISTS (SELECT 1 FROM unnest(c.tags) t WHERE t ILIKE ${searchPattern}) OR
               i_search.name ILIKE ${searchPattern})
          AND (${status} = '' OR c.status = ${status})
          AND (${tag} = '' OR ${tag} = ANY(c.tags))
          AND (${source} = '' OR c.source_type = ${source})
        ORDER BY c.created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      // Default: updated_at DESC
      rows = await sql`
        SELECT c.*,
               (SELECT i.name FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_name,
               (SELECT i.title FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_title,
               COALESCE((SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.status = 'open'), 0)::int as open_deal_count,
               COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.client_id = c.id AND d.status = 'open'), 0)::numeric as open_deal_value,
               (SELECT t.title FROM tasks t WHERE t.client_id = c.id AND t.status = 'open' ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task,
               (SELECT t.due_date FROM tasks t WHERE t.client_id = c.id AND t.status = 'open' ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_due
        FROM clients c
        LEFT JOIN client_individuals ci_search ON ci_search.client_id = c.id AND ci_search.is_primary = true
        LEFT JOIN individuals i_search ON ci_search.individual_id = i_search.id
        WHERE (${search} = '' OR
               c.name ILIKE ${searchPattern} OR
               EXISTS (SELECT 1 FROM unnest(c.tags) t WHERE t ILIKE ${searchPattern}) OR
               i_search.name ILIKE ${searchPattern})
          AND (${status} = '' OR c.status = ${status})
          AND (${tag} = '' OR ${tag} = ANY(c.tags))
          AND (${source} = '' OR c.source_type = ${source})
        ORDER BY c.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    // Fetch available tags and sources for filter dropdowns
    const tagsResult = await sql`
      SELECT DISTINCT unnest(tags) as tag FROM clients ORDER BY tag ASC
    `
    const sourcesResult = await sql`
      SELECT DISTINCT source_type FROM clients WHERE source_type IS NOT NULL AND source_type != '' ORDER BY source_type ASC
    `

    const availableTags = tagsResult.map((r: Record<string, unknown>) => r.tag as string)
    const availableSources = sourcesResult.map((r: Record<string, unknown>) => r.source_type as string)

    return Response.json({
      clients: rows,
      total,
      page,
      perPage: limit,
      availableTags,
      availableSources,
    })
  }

  // POST - create or import
  if (req.method === 'POST') {
    if (resourceId === 'import') {
      const body = await req.json()
      const { clients: clientRows } = body as { clients: Array<Record<string, string>> }
      if (!Array.isArray(clientRows)) {
        return Response.json({ error: 'clients array required' }, { status: 400 })
      }

      const errors: Array<{ row: number; error: string }> = []
      let imported = 0
      const validTypes = ['organization', 'individual']
      const validStatuses = ['active', 'inactive', 'prospect', 'churned']

      for (let i = 0; i < clientRows.length; i++) {
        const row = clientRows[i]
        const name = (row.Name || row.name || '').trim()
        if (!name) {
          errors.push({ row: i + 1, error: 'Name is required' })
          continue
        }

        const rawType = (row.Type || row.type || 'organization').trim().toLowerCase()
        if (rawType && !validTypes.includes(rawType)) {
          errors.push({ row: i + 1, error: `Invalid type "${rawType}". Must be organization or individual.` })
          continue
        }
        const type = rawType || 'organization'

        const rawStatus = (row.Status || row.status || 'prospect').trim().toLowerCase()
        if (rawStatus && !validStatuses.includes(rawStatus)) {
          errors.push({ row: i + 1, error: `Invalid status "${rawStatus}". Must be active, inactive, prospect, or churned.` })
          continue
        }
        const status = rawStatus || 'prospect'

        const tagsRaw = (row.Tags || row.tags || '').trim()
        const tags = tagsRaw ? tagsRaw.split(',').map((t: string) => t.trim()).filter(Boolean) : []

        const sourceType = (row['Source Type'] || row.source_type || '').trim() || null
        const sourceDetail = (row['Source Detail'] || row.source_detail || '').trim() || null
        const campaign = (row.Campaign || row.campaign || '').trim() || null
        const channel = (row.Channel || row.channel || '').trim() || null
        const dateAcquired = (row['Date Acquired'] || row.date_acquired || '').trim() || null

        await sql`
          INSERT INTO clients (name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired)
          VALUES (${name}, ${type}, ${status}, ${tags}, ${sourceType}, ${sourceDetail}, ${campaign}, ${channel}, ${dateAcquired})
        `

        imported++
      }

      return Response.json({ imported, errors, total: clientRows.length })
    }

    // Single create
    const body = await req.json()
    const { name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired } = body as {
      name?: string
      type?: string
      status?: string
      tags?: string[]
      source_type?: string
      source_detail?: string
      campaign?: string
      channel?: string
      date_acquired?: string
    }

    if (!name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }

    const clientType = type || 'organization'
    const clientStatus = status || 'prospect'
    const clientTags = tags || []

    const rows = await sql`
      INSERT INTO clients (name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired)
      VALUES (
        ${name.trim()},
        ${clientType},
        ${clientStatus},
        ${clientTags},
        ${source_type?.trim() || null},
        ${source_detail?.trim() || null},
        ${campaign?.trim() || null},
        ${channel?.trim() || null},
        ${date_acquired || null}
      )
      RETURNING *
    `

    const client = rows[0]

    // Create timeline event
    await sql`
      INSERT INTO timeline_events (client_id, event_type, description, actor_name)
      VALUES (${client.id}, 'client_created', ${'Client created: ' + name.trim()}, 'System')
    `

    return Response.json(client, { status: 201 })
  }

  // PUT - update
  if (req.method === 'PUT') {
    if (!resourceId) {
      return Response.json({ error: 'Client ID required' }, { status: 400 })
    }

    const body = await req.json()
    const { name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired } = body as {
      name?: string
      type?: string
      status?: string
      tags?: string[]
      source_type?: string
      source_detail?: string
      campaign?: string
      channel?: string
      date_acquired?: string
    }

    const current = await sql`SELECT * FROM clients WHERE id = ${resourceId}`
    if (current.length === 0) {
      return Response.json({ error: 'Client not found' }, { status: 404 })
    }

    const rows = await sql`
      UPDATE clients SET
        name = ${name?.trim() || current[0].name},
        type = ${type || current[0].type},
        status = ${status || current[0].status},
        tags = ${tags !== undefined ? tags : current[0].tags},
        source_type = ${source_type !== undefined ? (source_type?.trim() || null) : current[0].source_type},
        source_detail = ${source_detail !== undefined ? (source_detail?.trim() || null) : current[0].source_detail},
        campaign = ${campaign !== undefined ? (campaign?.trim() || null) : current[0].campaign},
        channel = ${channel !== undefined ? (channel?.trim() || null) : current[0].channel},
        date_acquired = ${date_acquired !== undefined ? (date_acquired || null) : current[0].date_acquired},
        updated_at = NOW()
      WHERE id = ${resourceId}
      RETURNING *
    `

    // Create timeline event
    await sql`
      INSERT INTO timeline_events (client_id, event_type, description, actor_name)
      VALUES (${resourceId}, 'client_updated', ${'Client updated: ' + rows[0].name}, 'System')
    `

    return Response.json(rows[0])
  }

  // DELETE
  if (req.method === 'DELETE') {
    if (!resourceId) {
      return Response.json({ error: 'Client ID required' }, { status: 400 })
    }

    const existing = await sql`SELECT * FROM clients WHERE id = ${resourceId}`
    if (existing.length === 0) {
      return Response.json({ error: 'Client not found' }, { status: 404 })
    }

    await sql`DELETE FROM clients WHERE id = ${resourceId}`

    return Response.json({ success: true })
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
