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
  // Path: /client-tasks or /client-tasks/:taskId
  const taskId = pathParts.length >= 3 ? pathParts[2] : null

  // GET /client-tasks?clientId=...
  if (req.method === 'GET' && !taskId) {
    const clientId = url.searchParams.get('clientId')
    if (!clientId) {
      return new Response(JSON.stringify({ error: 'clientId required' }), { status: 400 })
    }

    const tasks = await sql`
      SELECT t.*,
        d.name as deal_name
      FROM tasks t
      LEFT JOIN deals d ON t.deal_id = d.id
      WHERE t.client_id = ${clientId} AND t.completed = false
      ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
    `

    return Response.json({ tasks })
  }

  // POST /client-tasks — create a new task
  if (req.method === 'POST') {
    const body = await req.json() as {
      title: string
      description?: string
      due_date?: string
      priority?: string
      client_id: string
      deal_id?: string
      assignee_name?: string
      assignee_role?: string
    }

    const rows = await sql`
      INSERT INTO tasks (title, description, due_date, priority, client_id, deal_id, assignee_name, assignee_role)
      VALUES (
        ${body.title},
        ${body.description ?? null},
        ${body.due_date ?? null},
        ${body.priority ?? 'normal'},
        ${body.client_id},
        ${body.deal_id ?? null},
        ${body.assignee_name ?? null},
        ${body.assignee_role ?? null}
      )
      RETURNING *
    `

    // Create timeline event
    await sql`
      INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type)
      VALUES (${body.client_id}, 'task_created', ${'Task Created: \'' + body.title + '\''}, 'System', ${rows[0].id}, 'task')
    `

    // Fetch deal_name if deal_id provided
    const task = rows[0]
    if (body.deal_id) {
      const dealRows = await sql`SELECT name FROM deals WHERE id = ${body.deal_id}`
      task.deal_name = dealRows.length > 0 ? dealRows[0].name : null
    }

    return Response.json(task, { status: 201 })
  }

  // PUT /client-tasks/:taskId — update a task (e.g., mark complete)
  if (req.method === 'PUT' && taskId) {
    const body = await req.json() as {
      completed?: boolean
      title?: string
      description?: string
      due_date?: string
      priority?: string
    }

    const updates: string[] = []
    const params: unknown[] = []
    let paramIdx = 1

    if (body.completed !== undefined) {
      updates.push(`completed = $${paramIdx}`)
      params.push(body.completed)
      paramIdx++
      if (body.completed) {
        updates.push(`completed_at = NOW()`)
      } else {
        updates.push(`completed_at = NULL`)
      }
    }
    if (body.title !== undefined) {
      updates.push(`title = $${paramIdx}`)
      params.push(body.title)
      paramIdx++
    }
    if (body.description !== undefined) {
      updates.push(`description = $${paramIdx}`)
      params.push(body.description)
      paramIdx++
    }
    if (body.due_date !== undefined) {
      updates.push(`due_date = $${paramIdx}`)
      params.push(body.due_date)
      paramIdx++
    }
    if (body.priority !== undefined) {
      updates.push(`priority = $${paramIdx}`)
      params.push(body.priority)
      paramIdx++
    }

    updates.push('updated_at = NOW()')

    const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`
    params.push(taskId)

    const rows = await sql(query, params)
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    }

    // Create timeline event for completion
    if (body.completed) {
      const task = rows[0]
      await sql`
        INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type)
        VALUES (${task.client_id}, 'task_completed', ${'Task Completed: \'' + task.title + '\''}, 'System', ${taskId}, 'task')
      `
    }

    return Response.json(rows[0])
  }

  // DELETE /client-tasks/:taskId
  if (req.method === 'DELETE' && taskId) {
    await sql`DELETE FROM tasks WHERE id = ${taskId}`
    return Response.json({ success: true })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}
