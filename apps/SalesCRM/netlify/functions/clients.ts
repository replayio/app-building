import { neon } from '@neondatabase/serverless'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

const CLIENT_SELECT_FIELDS = `c.*,
  (SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')) as open_deals_count,
  COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')), 0) as open_deals_value,
  (SELECT i.name FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_name,
  (SELECT ci.role FROM client_individuals ci WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_role,
  (SELECT t.title FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_title,
  (SELECT t.due_date FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_due`

export default async function handler(req: Request) {
  const sql = getDb()
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const resourceId = pathParts.length >= 4 ? pathParts[3] : null

  // GET /clients/:id
  if (req.method === 'GET' && resourceId) {
    const rows = await sql(
      `SELECT ${CLIENT_SELECT_FIELDS} FROM clients c WHERE c.id = $1`,
      [resourceId]
    )
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    }
    return Response.json(rows[0])
  }

  // GET /clients
  if (req.method === 'GET') {
    const page = parseInt(url.searchParams.get('page') ?? '1')
    const pageSizeParam = url.searchParams.get('pageSize')
    const pageSize = pageSizeParam ? parseInt(pageSizeParam) : 50
    const offset = (page - 1) * pageSize
    const search = url.searchParams.get('search') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const tag = url.searchParams.get('tag') ?? ''
    const source = url.searchParams.get('source') ?? ''
    const sort = url.searchParams.get('sort') ?? 'updated_at'

    // Build WHERE clause parts and params
    const conditions: string[] = []
    const params: unknown[] = []
    let paramIdx = 1

    if (search) {
      conditions.push(`(c.name ILIKE $${paramIdx} OR EXISTS (SELECT 1 FROM unnest(c.tags) AS t WHERE t ILIKE $${paramIdx}) OR EXISTS (SELECT 1 FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND i.name ILIKE $${paramIdx}))`)
      params.push('%' + search + '%')
      paramIdx++
    }
    if (status) {
      conditions.push(`c.status = $${paramIdx}`)
      params.push(status)
      paramIdx++
    }
    if (tag) {
      conditions.push(`$${paramIdx} = ANY(c.tags)`)
      params.push(tag)
      paramIdx++
    }
    if (source) {
      conditions.push(`c.source_type = $${paramIdx}`)
      params.push(source)
      paramIdx++
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''

    // Map sort parameter to ORDER BY clause
    const sortMap: Record<string, string> = {
      'name_asc': 'c.name ASC',
      'name_desc': 'c.name DESC',
      'status': 'c.status ASC',
      'updated_at': 'c.updated_at DESC',
    }
    const orderBy = sortMap[sort] ?? 'c.updated_at DESC'

    // Count query
    const countQuery = `SELECT COUNT(*) as count FROM clients c ${whereClause}`
    const countResult = await sql(countQuery, params)

    // Data query
    const dataQuery = `SELECT ${CLIENT_SELECT_FIELDS} FROM clients c ${whereClause} ORDER BY ${orderBy} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`
    const dataResult = await sql(dataQuery, [...params, pageSize, offset])

    // Fetch distinct tags and sources for filter dropdowns
    const [tagsResult, sourcesResult] = await Promise.all([
      sql`SELECT DISTINCT unnest(tags) as tag FROM clients ORDER BY tag`,
      sql`SELECT DISTINCT source_type FROM clients WHERE source_type IS NOT NULL ORDER BY source_type`,
    ])

    return Response.json({
      clients: dataResult,
      total: parseInt(String(countResult[0].count)),
      tags: tagsResult.map((r: Record<string, unknown>) => r.tag as string),
      sources: sourcesResult.map((r: Record<string, unknown>) => r.source_type as string),
    })
  }

  // POST /clients
  if (req.method === 'POST') {
    const body = await req.json() as {
      name: string
      type: string
      status?: string
      tags?: string[]
      source_type?: string
      source_detail?: string
      campaign?: string
      channel?: string
      date_acquired?: string
    }

    const rows = await sql`
      INSERT INTO clients (name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired)
      VALUES (${body.name}, ${body.type}, ${body.status ?? 'prospect'}, ${body.tags ?? []}, ${body.source_type ?? null}, ${body.source_detail ?? null}, ${body.campaign ?? null}, ${body.channel ?? null}, ${body.date_acquired ?? null})
      RETURNING *
    `

    return Response.json(rows[0], { status: 201 })
  }

  // DELETE /clients/:id
  if (req.method === 'DELETE' && resourceId) {
    await sql`DELETE FROM clients WHERE id = ${resourceId}`
    return Response.json({ success: true })
  }

  // PUT /clients/:id
  if (req.method === 'PUT' && resourceId) {
    const body = await req.json() as Record<string, unknown>

    // If status is changing, get old status for timeline event
    let oldStatus: string | null = null
    if (body.status) {
      const existing = await sql`SELECT status FROM clients WHERE id = ${resourceId}::uuid`
      if (existing.length > 0 && existing[0].status !== body.status) {
        oldStatus = existing[0].status as string
      }
    }

    const rows = await sql`
      UPDATE clients SET
        name = COALESCE(${(body.name as string) ?? null}, name),
        type = COALESCE(${(body.type as string) ?? null}, type),
        status = COALESCE(${(body.status as string) ?? null}, status),
        tags = COALESCE(${(body.tags as string[]) ?? null}, tags),
        source_type = COALESCE(${(body.source_type as string) ?? null}, source_type),
        source_detail = COALESCE(${(body.source_detail as string) ?? null}, source_detail),
        campaign = COALESCE(${(body.campaign as string) ?? null}, campaign),
        channel = COALESCE(${(body.channel as string) ?? null}, channel),
        updated_at = NOW()
      WHERE id = ${resourceId}::uuid
      RETURNING *
    `

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    }

    // Create timeline event for status change
    if (oldStatus) {
      await sql`
        INSERT INTO timeline_events (client_id, event_type, description, user_name)
        VALUES (${resourceId}::uuid, 'status_changed', ${'Status Changed: from \'' + oldStatus + '\' to \'' + (body.status as string) + '\''}, 'System')
      `
    }

    return Response.json(rows[0])
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}
