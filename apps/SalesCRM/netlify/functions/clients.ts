import { neon } from '@neondatabase/serverless'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

export default async function handler(req: Request) {
  const sql = getDb()
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)

  // GET /clients/:id
  if (req.method === 'GET' && pathParts.length === 3 && pathParts[2]) {
    const clientId = pathParts[2]
    const rows = await sql`SELECT * FROM clients WHERE id = ${clientId}`
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    }
    return Response.json(rows[0])
  }

  // GET /clients
  if (req.method === 'GET') {
    const page = parseInt(url.searchParams.get('page') ?? '1')
    const pageSize = 50
    const offset = (page - 1) * pageSize
    const search = url.searchParams.get('search') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const tag = url.searchParams.get('tag') ?? ''
    const source = url.searchParams.get('source') ?? ''
    const sort = url.searchParams.get('sort') ?? 'updated_at'

    let whereClause = 'WHERE 1=1'
    const params: unknown[] = []
    let paramIdx = 1

    if (search) {
      whereClause += ` AND (c.name ILIKE $${paramIdx})`
      params.push(`%${search}%`)
      paramIdx++
    }
    if (status) {
      whereClause += ` AND c.status = $${paramIdx}`
      params.push(status)
      paramIdx++
    }
    if (tag) {
      whereClause += ` AND $${paramIdx} = ANY(c.tags)`
      params.push(tag)
      paramIdx++
    }
    if (source) {
      whereClause += ` AND c.source_type = $${paramIdx}`
      params.push(source)
      paramIdx++
    }

    let orderBy = 'c.updated_at DESC'
    if (sort === 'name_asc') orderBy = 'c.name ASC'
    else if (sort === 'name_desc') orderBy = 'c.name DESC'
    else if (sort === 'status') orderBy = 'c.status ASC'

    const countQuery = `SELECT COUNT(*) as count FROM clients c ${whereClause}`
    const dataQuery = `
      SELECT c.*,
        (SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')) as open_deals_count,
        COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')), 0) as open_deals_value,
        (SELECT i.name FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_name,
        (SELECT ci.role FROM client_individuals ci WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_role,
        (SELECT t.title FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_title,
        (SELECT t.due_date FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_due
      FROM clients c
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ${pageSize} OFFSET ${offset}
    `

    // Use raw queries with params for filtering
    const [countResult, dataResult] = await Promise.all([
      params.length > 0
        ? sql(countQuery, params)
        : sql`SELECT COUNT(*) as count FROM clients`,
      params.length > 0
        ? sql(dataQuery, params)
        : sql(dataQuery, []),
    ])

    return Response.json({
      clients: dataResult,
      total: parseInt(String(countResult[0].count)),
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
  if (req.method === 'DELETE' && pathParts.length === 3 && pathParts[2]) {
    const clientId = pathParts[2]
    await sql`DELETE FROM clients WHERE id = ${clientId}`
    return Response.json({ success: true })
  }

  // PUT /clients/:id
  if (req.method === 'PUT' && pathParts.length === 3 && pathParts[2]) {
    const clientId = pathParts[2]
    const body = await req.json() as Record<string, unknown>

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
      WHERE id = ${clientId}
      RETURNING *
    `

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    }
    return Response.json(rows[0])
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}
