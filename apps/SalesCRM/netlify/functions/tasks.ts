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

type SqlFn = ReturnType<typeof neon>

export const handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  const sql = neon(process.env.DATABASE_URL!)
  const segments = event.path.split('/').filter(Boolean)
  const resourceId = segments[3] || null

  try {
    if (event.httpMethod === 'GET') {
      if (resourceId) {
        const rows = await sql`
          SELECT t.*,
            c.name as client_name,
            d.name as deal_name
          FROM tasks t
          LEFT JOIN clients c ON t.client_id = c.id
          LEFT JOIN deals d ON t.deal_id = d.id
          WHERE t.id = ${resourceId}
        `
        if (!rows.length) return json(404, { error: 'Not found' })
        return json(200, rows[0])
      }
      return await handleList(sql)
    }

    if (event.httpMethod === 'POST') {
      return await handleCreate(sql, event.body)
    }

    if (event.httpMethod === 'PUT') {
      if (!resourceId) return json(400, { error: 'Task ID required' })
      return await handleUpdate(sql, resourceId, event.body)
    }

    if (event.httpMethod === 'DELETE') {
      if (!resourceId) return json(400, { error: 'Task ID required' })
      await sql`DELETE FROM tasks WHERE id = ${resourceId}`
      return json(200, { deleted: true })
    }

    return json(405, { error: 'Method not allowed' })
  } catch (err: unknown) {
    console.error('Error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return json(500, { error: message })
  }
}

async function handleList(sql: SqlFn) {
  const rows = await sql`
    SELECT t.*,
      c.name as client_name,
      d.name as deal_name
    FROM tasks t
    LEFT JOIN clients c ON t.client_id = c.id
    LEFT JOIN deals d ON t.deal_id = d.id
    WHERE t.completed = false
    ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
  `

  const clients = await sql`SELECT id, name FROM clients ORDER BY name`
  const deals = await sql`SELECT id, name, client_id FROM deals WHERE stage NOT IN ('Closed Won', 'Closed Lost') ORDER BY name`
  const assignees = await sql`
    SELECT DISTINCT i.name, ci.role
    FROM individuals i
    LEFT JOIN client_individuals ci ON ci.individual_id = i.id
    WHERE i.name IS NOT NULL AND i.name != ''
    ORDER BY i.name
  `

  return json(200, {
    tasks: rows,
    clients,
    deals,
    assignees,
  })
}

async function handleCreate(sql: SqlFn, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { title, description, client_id, deal_id, assignee, assignee_role, priority, due_date } = data
  if (!title) return json(400, { error: 'Task name is required' })

  const result = await sql`
    INSERT INTO tasks (title, description, client_id, deal_id, assignee, assignee_role, priority, due_date)
    VALUES (
      ${title},
      ${description || null},
      ${client_id || null},
      ${deal_id || null},
      ${assignee || null},
      ${assignee_role || null},
      ${priority || 'Normal'},
      ${due_date || null}
    )
    RETURNING *
  `
  const task = result[0]

  const enriched = await sql`
    SELECT t.*,
      c.name as client_name,
      d.name as deal_name
    FROM tasks t
    LEFT JOIN clients c ON t.client_id = c.id
    LEFT JOIN deals d ON t.deal_id = d.id
    WHERE t.id = ${task.id}
  `

  return json(201, enriched[0])
}

async function handleUpdate(sql: SqlFn, id: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { title, description, client_id, deal_id, assignee, assignee_role, priority, due_date, completed } = data

  await sql`
    UPDATE tasks SET
      title = COALESCE(${title || null}, title),
      description = ${description === undefined ? null : (description || null)},
      client_id = ${client_id === undefined ? null : (client_id || null)},
      deal_id = ${deal_id === undefined ? null : (deal_id || null)},
      assignee = ${assignee === undefined ? null : (assignee || null)},
      assignee_role = ${assignee_role === undefined ? null : (assignee_role || null)},
      priority = COALESCE(${priority || null}, priority),
      due_date = ${due_date === undefined ? null : (due_date || null)},
      completed = COALESCE(${completed === undefined ? null : completed}, completed),
      updated_at = now()
    WHERE id = ${id}
  `

  const updated = await sql`
    SELECT t.*,
      c.name as client_name,
      d.name as deal_name
    FROM tasks t
    LEFT JOIN clients c ON t.client_id = c.id
    LEFT JOIN deals d ON t.deal_id = d.id
    WHERE t.id = ${id}
  `
  if (!updated.length) return json(404, { error: 'Not found' })
  return json(200, updated[0])
}
