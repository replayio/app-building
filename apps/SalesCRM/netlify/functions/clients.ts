import { neon } from '@neondatabase/serverless'

interface HandlerEvent {
  httpMethod: string
  path: string
  queryStringParameters: Record<string, string> | null
  body: string | null
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
    body: JSON.stringify(body),
  }
}

export const handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  const sql = neon(process.env.DATABASE_URL!)
  const segments = event.path.split('/').filter(Boolean)
  const resourceId = segments[3] || null
  const params = event.queryStringParameters || {}

  try {
    if (event.httpMethod === 'GET') {
      if (resourceId) {
        const rows = await sql`
          SELECT c.*,
            (SELECT COALESCE(json_agg(t.name), '[]'::json) FROM client_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.client_id = c.id) as tags
          FROM clients c WHERE c.id = ${resourceId}
        `
        if (!rows.length) return json(404, { error: 'Not found' })
        return json(200, rows[0])
      }

      if (params.format === 'csv') {
        return await handleExport(sql, params)
      }

      return await handleList(sql, params)
    }

    if (event.httpMethod === 'POST') {
      if (params.action === 'import') {
        return await handleImport(sql, event.body)
      }
      return await handleCreate(sql, event.body)
    }

    if (event.httpMethod === 'PUT') {
      if (!resourceId) return json(400, { error: 'Client ID required' })
      return await handleUpdate(sql, resourceId, event.body)
    }

    if (event.httpMethod === 'DELETE') {
      if (!resourceId) return json(400, { error: 'Client ID required' })
      await sql`DELETE FROM clients WHERE id = ${resourceId}`
      return json(200, { deleted: true })
    }

    return json(405, { error: 'Method not allowed' })
  } catch (err: unknown) {
    console.error('Error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return json(500, { error: message })
  }
}

type SqlFn = ReturnType<typeof neon>

async function handleList(sql: SqlFn, params: Record<string, string>) {
  const page = parseInt(params.page || '1')
  const pageSize = parseInt(params.pageSize || '50')
  const offset = (page - 1) * pageSize
  const search = params.search || ''
  const statusFilter = params.status || ''
  const tagFilter = params.tag || ''
  const sourceFilter = params.source || ''
  const sort = params.sort || 'recently_updated'
  const searchPattern = search ? `%${search}%` : ''

  const countResult = await sql`
    SELECT COUNT(*)::int as total FROM clients c
    WHERE
      (${statusFilter} = '' OR c.status = ${statusFilter})
      AND (${sourceFilter} = '' OR c.source = ${sourceFilter})
      AND (${tagFilter} = '' OR EXISTS (
        SELECT 1 FROM client_tags ct JOIN tags t ON ct.tag_id = t.id
        WHERE ct.client_id = c.id AND t.name = ${tagFilter}
      ))
      AND (${searchPattern} = '' OR c.name ILIKE ${searchPattern}
        OR EXISTS (SELECT 1 FROM client_tags ct2 JOIN tags t2 ON ct2.tag_id = t2.id
                   WHERE ct2.client_id = c.id AND t2.name ILIKE ${searchPattern})
        OR EXISTS (SELECT 1 FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id
                   WHERE ci.client_id = c.id AND i.name ILIKE ${searchPattern})
      )
  `
  const total = countResult[0].total

  const rows = await sql`
    SELECT c.*,
      (SELECT COALESCE(json_agg(t.name), '[]'::json)
       FROM client_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.client_id = c.id) as tags,
      (SELECT json_build_object('name', i.name, 'role', COALESCE(ci.role, ''))
       FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id
       WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact,
      (SELECT json_build_object('count', COUNT(*)::int, 'totalValue', COALESCE(SUM(d.value), 0)::numeric)
       FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('Closed Won', 'Closed Lost')) as open_deals,
      (SELECT json_build_object('title', tk.title, 'dueDate', tk.due_date)
       FROM tasks tk WHERE tk.client_id = c.id AND tk.completed = false
       ORDER BY tk.due_date ASC NULLS LAST LIMIT 1) as next_task
    FROM clients c
    WHERE
      (${statusFilter} = '' OR c.status = ${statusFilter})
      AND (${sourceFilter} = '' OR c.source = ${sourceFilter})
      AND (${tagFilter} = '' OR EXISTS (
        SELECT 1 FROM client_tags ct JOIN tags t ON ct.tag_id = t.id
        WHERE ct.client_id = c.id AND t.name = ${tagFilter}
      ))
      AND (${searchPattern} = '' OR c.name ILIKE ${searchPattern}
        OR EXISTS (SELECT 1 FROM client_tags ct2 JOIN tags t2 ON ct2.tag_id = t2.id
                   WHERE ct2.client_id = c.id AND t2.name ILIKE ${searchPattern})
        OR EXISTS (SELECT 1 FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id
                   WHERE ci.client_id = c.id AND i.name ILIKE ${searchPattern})
      )
    ORDER BY
      CASE WHEN ${sort} = 'name_asc' THEN c.name END ASC NULLS LAST,
      CASE WHEN ${sort} = 'name_desc' THEN c.name END DESC NULLS LAST,
      c.updated_at DESC NULLS LAST
    LIMIT ${pageSize} OFFSET ${offset}
  `

  const allTags = await sql`SELECT DISTINCT name FROM tags ORDER BY name`
  const allSources = await sql`
    SELECT DISTINCT source FROM clients WHERE source IS NOT NULL AND source != '' ORDER BY source
  `

  return json(200, {
    clients: rows,
    total,
    page,
    pageSize,
    availableTags: allTags.map((t: Record<string, string>) => t.name),
    availableSources: allSources.map((s: Record<string, string>) => s.source),
  })
}

async function handleExport(sql: SqlFn, params: Record<string, string>) {
  const exportParams = { ...params, page: '1', pageSize: '10000' }
  delete exportParams.format
  const search = exportParams.search || ''
  const statusFilter = exportParams.status || ''
  const tagFilter = exportParams.tag || ''
  const sourceFilter = exportParams.source || ''
  const sort = exportParams.sort || 'recently_updated'
  const searchPattern = search ? `%${search}%` : ''

  const rows = await sql`
    SELECT c.*,
      (SELECT COALESCE(json_agg(t.name), '[]'::json)
       FROM client_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.client_id = c.id) as tags,
      (SELECT json_build_object('name', i.name, 'role', COALESCE(ci.role, ''))
       FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id
       WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact,
      (SELECT json_build_object('count', COUNT(*)::int, 'totalValue', COALESCE(SUM(d.value), 0)::numeric)
       FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('Closed Won', 'Closed Lost')) as open_deals,
      (SELECT json_build_object('title', tk.title, 'dueDate', tk.due_date)
       FROM tasks tk WHERE tk.client_id = c.id AND tk.completed = false
       ORDER BY tk.due_date ASC NULLS LAST LIMIT 1) as next_task
    FROM clients c
    WHERE
      (${statusFilter} = '' OR c.status = ${statusFilter})
      AND (${sourceFilter} = '' OR c.source = ${sourceFilter})
      AND (${tagFilter} = '' OR EXISTS (
        SELECT 1 FROM client_tags ct JOIN tags t ON ct.tag_id = t.id
        WHERE ct.client_id = c.id AND t.name = ${tagFilter}
      ))
      AND (${searchPattern} = '' OR c.name ILIKE ${searchPattern}
        OR EXISTS (SELECT 1 FROM client_tags ct2 JOIN tags t2 ON ct2.tag_id = t2.id
                   WHERE ct2.client_id = c.id AND t2.name ILIKE ${searchPattern})
        OR EXISTS (SELECT 1 FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id
                   WHERE ci.client_id = c.id AND i.name ILIKE ${searchPattern})
      )
    ORDER BY
      CASE WHEN ${sort} = 'name_asc' THEN c.name END ASC NULLS LAST,
      CASE WHEN ${sort} = 'name_desc' THEN c.name END DESC NULLS LAST,
      c.updated_at DESC NULLS LAST
  `

  const csvHeader = 'Client Name,Type,Status,Tags,Source,Primary Contact,Open Deals,Next Task'
  const csvRows = rows.map((r: Record<string, unknown>) => {
    const tags = (r.tags as string[]) || []
    const pc = r.primary_contact as { name: string; role: string } | null
    const od = r.open_deals as { count: number; totalValue: number } | null
    const nt = r.next_task as { title: string; dueDate: string } | null
    return [
      `"${String(r.name || '').replace(/"/g, '""')}"`,
      r.type,
      r.status,
      `"${tags.join(', ')}"`,
      r.source || '',
      pc ? `${pc.name} (${pc.role || 'N/A'})` : '',
      od ? `${od.count} ($${od.totalValue})` : '0',
      nt ? `${nt.title} - ${nt.dueDate || 'No date'}` : 'N/A',
    ].join(',')
  })

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="clients.csv"',
      ...corsHeaders,
    },
    body: [csvHeader, ...csvRows].join('\n'),
  }
}

async function handleCreate(sql: SqlFn, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { name, type, status, tags, source } = data
  if (!name) return json(400, { error: 'Client name is required' })

  const result = await sql`
    INSERT INTO clients (name, type, status, source)
    VALUES (${name}, ${type || 'Organization'}, ${status || 'Prospect'}, ${source || null})
    RETURNING *
  `
  const newClient = result[0]

  if (tags && tags.length) {
    for (const tagName of tags) {
      await sql`INSERT INTO tags (name) VALUES (${tagName}) ON CONFLICT (name) DO NOTHING`
      const tagRows = await sql`SELECT id FROM tags WHERE name = ${tagName}`
      if (tagRows.length) {
        await sql`INSERT INTO client_tags (client_id, tag_id) VALUES (${newClient.id}, ${tagRows[0].id}) ON CONFLICT DO NOTHING`
      }
    }
  }

  return json(201, newClient)
}

async function handleImport(sql: SqlFn, body: string | null) {
  const data = JSON.parse(body || '{}')
  const clients = data.clients || []
  let imported = 0

  for (const c of clients) {
    if (!c.name) continue
    const inserted = await sql`
      INSERT INTO clients (name, type, status, source)
      VALUES (${c.name}, ${c.type || 'Organization'}, ${c.status || 'Prospect'}, ${c.source || null})
      RETURNING id
    `
    const clientId = inserted[0].id

    if (c.tags) {
      const tagNames = typeof c.tags === 'string'
        ? c.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : c.tags
      for (const tagName of tagNames) {
        await sql`INSERT INTO tags (name) VALUES (${tagName}) ON CONFLICT (name) DO NOTHING`
        const tagRows = await sql`SELECT id FROM tags WHERE name = ${tagName}`
        if (tagRows.length) {
          await sql`INSERT INTO client_tags (client_id, tag_id) VALUES (${clientId}, ${tagRows[0].id}) ON CONFLICT DO NOTHING`
        }
      }
    }
    imported++
  }

  return json(200, { imported })
}

async function handleUpdate(sql: SqlFn, id: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { name, type, status, tags, source } = data

  await sql`
    UPDATE clients SET
      name = COALESCE(${name || null}, name),
      type = COALESCE(${type || null}, type),
      status = COALESCE(${status || null}, status),
      source = ${source === undefined ? null : (source || null)},
      updated_at = now()
    WHERE id = ${id}
  `

  if (tags !== undefined) {
    await sql`DELETE FROM client_tags WHERE client_id = ${id}`
    for (const tagName of tags) {
      await sql`INSERT INTO tags (name) VALUES (${tagName}) ON CONFLICT (name) DO NOTHING`
      const tagRows = await sql`SELECT id FROM tags WHERE name = ${tagName}`
      if (tagRows.length) {
        await sql`INSERT INTO client_tags (client_id, tag_id) VALUES (${id}, ${tagRows[0].id}) ON CONFLICT DO NOTHING`
      }
    }
  }

  const updated = await sql`
    SELECT c.*,
      (SELECT COALESCE(json_agg(t.name), '[]'::json) FROM client_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.client_id = c.id) as tags
    FROM clients c WHERE c.id = ${id}
  `
  return json(200, updated[0])
}
