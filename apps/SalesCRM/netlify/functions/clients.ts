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
  const resourceId = pathParts.length >= 4 ? pathParts[3] : null

  // GET /clients/:id
  if (req.method === 'GET' && resourceId) {
    const rows = await sql`
      SELECT c.*,
        (SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')) as open_deals_count,
        COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')), 0) as open_deals_value,
        (SELECT i.name FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_name,
        (SELECT ci.role FROM client_individuals ci WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_role,
        (SELECT t.title FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_title,
        (SELECT t.due_date FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_due
      FROM clients c
      WHERE c.id = ${resourceId}
    `
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

    // Build composable WHERE clause using neon tagged template fragments
    const whereParts: ReturnType<typeof sql>[] = []

    if (search) {
      whereParts.push(sql`(c.name ILIKE ${'%' + search + '%'} OR EXISTS (SELECT 1 FROM unnest(c.tags) AS t WHERE t ILIKE ${'%' + search + '%'}) OR EXISTS (SELECT 1 FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND i.name ILIKE ${'%' + search + '%'}))`)
    }
    if (status) {
      whereParts.push(sql`c.status = ${status}`)
    }
    if (tag) {
      whereParts.push(sql`${tag} = ANY(c.tags)`)
    }
    if (source) {
      whereParts.push(sql`c.source_type = ${source}`)
    }

    let whereFragment = sql``
    if (whereParts.length > 0) {
      whereFragment = sql`WHERE ${whereParts[0]}`
      for (let i = 1; i < whereParts.length; i++) {
        whereFragment = sql`${whereFragment} AND ${whereParts[i]}`
      }
    }

    const countResult = await sql`SELECT COUNT(*) as count FROM clients c ${whereFragment}`

    // Fetch clients with sorting (neon tagged templates require static ORDER BY)
    let dataResult: Record<string, unknown>[]
    if (sort === 'name_asc') {
      dataResult = await sql`
        SELECT c.*,
          (SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')) as open_deals_count,
          COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')), 0) as open_deals_value,
          (SELECT i.name FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_name,
          (SELECT ci.role FROM client_individuals ci WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_role,
          (SELECT t.title FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_title,
          (SELECT t.due_date FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_due
        FROM clients c
        ${whereFragment}
        ORDER BY c.name ASC
        LIMIT ${pageSize} OFFSET ${offset}
      `
    } else if (sort === 'name_desc') {
      dataResult = await sql`
        SELECT c.*,
          (SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')) as open_deals_count,
          COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')), 0) as open_deals_value,
          (SELECT i.name FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_name,
          (SELECT ci.role FROM client_individuals ci WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_role,
          (SELECT t.title FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_title,
          (SELECT t.due_date FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_due
        FROM clients c
        ${whereFragment}
        ORDER BY c.name DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `
    } else if (sort === 'status') {
      dataResult = await sql`
        SELECT c.*,
          (SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')) as open_deals_count,
          COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')), 0) as open_deals_value,
          (SELECT i.name FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_name,
          (SELECT ci.role FROM client_individuals ci WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_role,
          (SELECT t.title FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_title,
          (SELECT t.due_date FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_due
        FROM clients c
        ${whereFragment}
        ORDER BY c.status ASC
        LIMIT ${pageSize} OFFSET ${offset}
      `
    } else {
      dataResult = await sql`
        SELECT c.*,
          (SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')) as open_deals_count,
          COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('closed_won', 'closed_lost')), 0) as open_deals_value,
          (SELECT i.name FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_name,
          (SELECT ci.role FROM client_individuals ci WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact_role,
          (SELECT t.title FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_title,
          (SELECT t.due_date FROM tasks t WHERE t.client_id = c.id AND t.completed = false ORDER BY t.due_date ASC NULLS LAST LIMIT 1) as next_task_due
        FROM clients c
        ${whereFragment}
        ORDER BY c.updated_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `
    }

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
      WHERE id = ${resourceId}
      RETURNING *
    `

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    }
    return Response.json(rows[0])
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}
