import { getDb, getDbUrl } from '../utils/db'
import { optionalAuth, type OptionalAuthRequest } from '../utils/auth'
import { notifyClientFollowers } from '../utils/notifications'

async function handler(req: OptionalAuthRequest) {
  const sql = getDb()
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  // Path: /client-tasks or /client-tasks/:taskId
  const taskId = pathParts.length >= 4 ? pathParts[3] : null

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
        ${body.due_date || null},
        ${body.priority ?? 'normal'},
        ${body.client_id},
        ${body.deal_id || null},
        ${body.assignee_name ?? null},
        ${body.assignee_role ?? null}
      )
      RETURNING *
    `

    // Create timeline event
    const desc = 'Task Created: \'' + body.title + '\''
    await sql`
      INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type)
      VALUES (${body.client_id}, 'task_created', ${desc}, ${req.user?.name ?? 'System'}, ${rows[0].id}, 'task')
    `

    // Notify followers (fire-and-forget)
    notifyClientFollowers(getDbUrl(), body.client_id, 'task_created', desc, req.user?.id, req).catch(() => {})

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

    const rows = await sql`
      UPDATE tasks SET
        completed = COALESCE(${body.completed !== undefined ? body.completed : null}, completed),
        completed_at = CASE
          WHEN ${body.completed !== undefined ? body.completed : null}::boolean = true THEN NOW()
          WHEN ${body.completed !== undefined ? body.completed : null}::boolean = false THEN NULL
          ELSE completed_at
        END,
        title = COALESCE(${body.title ?? null}, title),
        description = COALESCE(${body.description ?? null}, description),
        due_date = COALESCE(${body.due_date !== undefined ? (body.due_date || null) : null}, due_date),
        priority = COALESCE(${body.priority ?? null}, priority),
        updated_at = NOW()
      WHERE id = ${taskId}::uuid
      RETURNING *
    `
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    }

    // Create timeline event for completion
    if (body.completed) {
      const task = rows[0]
      const completedDesc = 'Task Completed: \'' + task.title + '\''
      await sql`
        INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type)
        VALUES (${task.client_id}, 'task_completed', ${completedDesc}, ${req.user?.name ?? 'System'}, ${taskId}, 'task')
      `
      notifyClientFollowers(getDbUrl(), task.client_id, 'task_completed', completedDesc, req.user?.id, req).catch(() => {})
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

export default optionalAuth(handler)
