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
  // Path: /deals or /deals/:dealId
  const dealId = pathParts.length >= 4 ? pathParts[3] : null

  // GET /deals — list all deals with filters and pagination
  if (req.method === 'GET' && !dealId) {
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? '20', 10)
    const search = url.searchParams.get('search') ?? ''
    const stage = url.searchParams.get('stage') ?? ''
    const client = url.searchParams.get('client') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const sort = url.searchParams.get('sort') ?? 'close_date_desc'
    const dateFrom = url.searchParams.get('dateFrom') ?? ''
    const dateTo = url.searchParams.get('dateTo') ?? ''

    const offset = (page - 1) * pageSize

    const searchPattern = search ? '%' + search + '%' : null
    const stageFilter = stage || null
    const clientFilter = client || null
    const dateFromFilter = dateFrom || null
    const dateToFilter = dateTo || null

    // Normalize status into stage-based or status-based filter
    const statusIsActive = status === 'active'
    const statusIsWon = status === 'won'
    const statusIsLost = status === 'lost'
    const statusOther = (status && !statusIsActive && !statusIsWon && !statusIsLost) ? status : null

    // Count total matching deals
    const countResult = await sql`
      SELECT COUNT(*) as count FROM deals d
      JOIN clients c ON d.client_id = c.id
      WHERE (${searchPattern}::text IS NULL OR (d.name ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern}))
      AND (${stageFilter}::text IS NULL OR d.stage = ${stageFilter})
      AND (${clientFilter}::text IS NULL OR d.client_id = ${clientFilter}::uuid)
      AND (NOT ${statusIsActive}::boolean OR d.stage NOT IN ('closed_won', 'closed_lost'))
      AND (NOT ${statusIsWon}::boolean OR d.stage = 'closed_won')
      AND (NOT ${statusIsLost}::boolean OR d.stage = 'closed_lost')
      AND (${statusOther}::text IS NULL OR d.status = ${statusOther})
      AND (${dateFromFilter}::date IS NULL OR d.expected_close_date >= ${dateFromFilter}::date)
      AND (${dateToFilter}::date IS NULL OR d.expected_close_date <= ${dateToFilter}::date)
    `
    const total = parseInt(String(countResult[0].count), 10)

    // Map sort parameter to safe sort key
    const sortMap: Record<string, string> = {
      'close_date_asc': 'close_date_asc',
      'close_date_desc': 'close_date_desc',
      'name_asc': 'name_asc',
      'name_desc': 'name_desc',
      'value_desc': 'value_desc',
      'value_asc': 'value_asc',
      'updated_at': 'updated_at',
    }
    const sortKey = sortMap[sort] ?? 'close_date_desc'

    // Fetch deals with CASE-based ORDER BY to avoid dynamic SQL
    const deals = await sql`
      SELECT d.*, c.name as client_name FROM deals d
      JOIN clients c ON d.client_id = c.id
      WHERE (${searchPattern}::text IS NULL OR (d.name ILIKE ${searchPattern} OR c.name ILIKE ${searchPattern}))
      AND (${stageFilter}::text IS NULL OR d.stage = ${stageFilter})
      AND (${clientFilter}::text IS NULL OR d.client_id = ${clientFilter}::uuid)
      AND (NOT ${statusIsActive}::boolean OR d.stage NOT IN ('closed_won', 'closed_lost'))
      AND (NOT ${statusIsWon}::boolean OR d.stage = 'closed_won')
      AND (NOT ${statusIsLost}::boolean OR d.stage = 'closed_lost')
      AND (${statusOther}::text IS NULL OR d.status = ${statusOther})
      AND (${dateFromFilter}::date IS NULL OR d.expected_close_date >= ${dateFromFilter}::date)
      AND (${dateToFilter}::date IS NULL OR d.expected_close_date <= ${dateToFilter}::date)
      ORDER BY
        CASE WHEN ${sortKey} = 'close_date_asc' THEN d.expected_close_date END ASC NULLS LAST,
        CASE WHEN ${sortKey} = 'close_date_desc' THEN d.expected_close_date END DESC NULLS LAST,
        CASE WHEN ${sortKey} = 'name_asc' THEN d.name END ASC,
        CASE WHEN ${sortKey} = 'name_desc' THEN d.name END DESC,
        CASE WHEN ${sortKey} = 'value_desc' THEN d.value END DESC,
        CASE WHEN ${sortKey} = 'value_asc' THEN d.value END ASC,
        CASE WHEN ${sortKey} = 'updated_at' THEN d.updated_at END DESC,
        d.expected_close_date DESC NULLS LAST
      LIMIT ${pageSize} OFFSET ${offset}
    `

    // Get summary metrics
    const metrics = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'active') as total_active,
        COALESCE(SUM(value) FILTER (WHERE status = 'active'), 0) as pipeline_value,
        COUNT(*) FILTER (WHERE stage = 'closed_won' AND updated_at >= date_trunc('quarter', CURRENT_DATE)) as won_count,
        COALESCE(SUM(value) FILTER (WHERE stage = 'closed_won' AND updated_at >= date_trunc('quarter', CURRENT_DATE)), 0) as won_value,
        COUNT(*) FILTER (WHERE stage = 'closed_lost' AND updated_at >= date_trunc('quarter', CURRENT_DATE)) as lost_count,
        COALESCE(SUM(value) FILTER (WHERE stage = 'closed_lost' AND updated_at >= date_trunc('quarter', CURRENT_DATE)), 0) as lost_value
      FROM deals
    `

    // Get unique clients for filter dropdown
    const clients = await sql`
      SELECT DISTINCT c.id, c.name FROM clients c
      JOIN deals d ON d.client_id = c.id
      ORDER BY c.name ASC
    `

    return Response.json({
      deals,
      total,
      metrics: metrics[0],
      clients,
    })
  }

  // GET /deals/:dealId — get single deal with full details
  if (req.method === 'GET' && dealId) {
    const rows = await sql`
      SELECT d.*, c.name as client_name FROM deals d
      JOIN clients c ON d.client_id = c.id
      WHERE d.id = ${dealId}::uuid
    `
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Deal not found' }), { status: 404 })
    }
    return Response.json(rows[0])
  }

  // POST /deals — create a new deal
  if (req.method === 'POST' && !dealId) {
    const body = await req.json() as {
      name: string
      client_id: string
      value?: number
      stage?: string
      owner?: string
      probability?: number
      expected_close_date?: string
      status?: string
    }

    const rows = await sql`
      INSERT INTO deals (name, client_id, value, stage, owner, probability, expected_close_date, status)
      VALUES (
        ${body.name},
        ${body.client_id}::uuid,
        ${body.value ?? 0},
        ${body.stage ?? 'lead'},
        ${body.owner ?? null},
        ${body.probability ?? 0},
        ${body.expected_close_date || null},
        ${body.status ?? 'active'}
      )
      RETURNING *
    `

    const deal = rows[0]

    // Create deal history entry for initial stage
    await sql`
      INSERT INTO deal_history (deal_id, old_stage, new_stage, changed_by)
      VALUES (${deal.id}::uuid, 'none', ${deal.stage}, 'System')
    `

    // Create timeline event
    await sql`
      INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type)
      VALUES (${body.client_id}::uuid, 'deal_created', ${'Deal Created: \'' + body.name + '\''}, 'System', ${deal.id}::uuid, 'deal')
    `

    // Add client_name
    const clientRows = await sql`SELECT name FROM clients WHERE id = ${body.client_id}::uuid`
    deal.client_name = clientRows.length > 0 ? clientRows[0].name : null

    return Response.json(deal, { status: 201 })
  }

  // PUT /deals/:dealId — update deal
  if (req.method === 'PUT' && dealId) {
    const body = await req.json() as {
      name?: string
      client_id?: string
      value?: number
      stage?: string
      owner?: string
      probability?: number
      expected_close_date?: string
      status?: string
    }

    // If stage is changing, record history
    if (body.stage) {
      const existing = await sql`SELECT stage, client_id FROM deals WHERE id = ${dealId}::uuid`
      if (existing.length > 0 && existing[0].stage !== body.stage) {
        await sql`
          INSERT INTO deal_history (deal_id, old_stage, new_stage, changed_by)
          VALUES (${dealId}::uuid, ${existing[0].stage}, ${body.stage}, 'System')
        `
        // Create timeline event for stage change
        await sql`
          INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type)
          VALUES (
            ${existing[0].client_id}::uuid,
            'deal_stage_changed',
            ${'Deal Stage Changed: from \'' + existing[0].stage + '\' to \'' + body.stage + '\''},
            'System',
            ${dealId}::uuid,
            'deal'
          )
        `
      }
    }

    const rows = await sql`
      UPDATE deals SET
        name = COALESCE(${body.name ?? null}, name),
        value = COALESCE(${body.value ?? null}, value),
        stage = COALESCE(${body.stage ?? null}, stage),
        owner = COALESCE(${body.owner ?? null}, owner),
        probability = COALESCE(${body.probability ?? null}, probability),
        expected_close_date = COALESCE(${body.expected_close_date || null}, expected_close_date),
        status = COALESCE(${body.status ?? null}, status),
        updated_at = NOW()
      WHERE id = ${dealId}::uuid
      RETURNING *
    `

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Deal not found' }), { status: 404 })
    }

    const deal = rows[0]
    const clientRows = await sql`SELECT name FROM clients WHERE id = ${deal.client_id}::uuid`
    deal.client_name = clientRows.length > 0 ? clientRows[0].name : null

    return Response.json(deal)
  }

  // DELETE /deals/:dealId — delete deal
  if (req.method === 'DELETE' && dealId) {
    await sql`DELETE FROM deals WHERE id = ${dealId}::uuid`
    return new Response(null, { status: 204 })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}
