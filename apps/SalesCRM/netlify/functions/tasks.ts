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
  // Path: /tasks or /tasks/:taskId
  const taskId = pathParts.length >= 4 ? pathParts[3] : null

  // GET /tasks — list all upcoming (uncompleted) tasks with filters
  if (req.method === 'GET' && !taskId) {
    const search = url.searchParams.get('search') ?? ''
    const priority = url.searchParams.get('priority') ?? ''
    const assignee = url.searchParams.get('assignee') ?? ''
    const clientId = url.searchParams.get('clientId') ?? ''
    const includeCompleted = url.searchParams.get('includeCompleted') === 'true'

    // Build composable WHERE clause using neon tagged template fragments
    const whereParts: ReturnType<typeof sql>[] = []

    if (!includeCompleted) {
      whereParts.push(sql`t.completed = false`)
    }
    if (search) {
      whereParts.push(sql`t.title ILIKE ${'%' + search + '%'}`)
    }
    if (priority) {
      whereParts.push(sql`t.priority = ${priority}`)
    }
    if (assignee) {
      whereParts.push(sql`t.assignee_name ILIKE ${'%' + assignee + '%'}`)
    }
    if (clientId) {
      whereParts.push(sql`t.client_id = ${clientId}::uuid`)
    }

    let whereFragment = sql``
    if (whereParts.length > 0) {
      whereFragment = sql`WHERE ${whereParts[0]}`
      for (let i = 1; i < whereParts.length; i++) {
        whereFragment = sql`${whereFragment} AND ${whereParts[i]}`
      }
    }

    const tasks = await sql`
      SELECT t.*, c.name as client_name, d.name as deal_name
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN deals d ON t.deal_id = d.id
      ${whereFragment}
      ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
    `

    const countResult = await sql`
      SELECT COUNT(*) as count
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN deals d ON t.deal_id = d.id
      ${whereFragment}
    `
    const total = parseInt(String(countResult[0].count), 10)

    // Get unique assignees for filter dropdown
    const assignees = await sql`
      SELECT DISTINCT assignee_name, assignee_role
      FROM tasks
      WHERE assignee_name IS NOT NULL AND assignee_name != ''
      ORDER BY assignee_name ASC
    `

    // Get unique clients for filter dropdown
    const clients = await sql`
      SELECT DISTINCT c.id, c.name
      FROM clients c
      JOIN tasks t ON t.client_id = c.id
      ORDER BY c.name ASC
    `

    return Response.json({ tasks, total, assignees, clients })
  }

  // POST /tasks — create a new task
  if (req.method === 'POST' && !taskId) {
    const body = await req.json() as {
      title: string
      description?: string
      due_date?: string
      priority?: string
      client_id?: string
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
        ${body.client_id || null},
        ${body.deal_id || null},
        ${body.assignee_name ?? null},
        ${body.assignee_role ?? null}
      )
      RETURNING *
    `

    const task = rows[0]

    // Create timeline event if client_id is provided
    if (body.client_id) {
      await sql`
        INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type)
        VALUES (${body.client_id}::uuid, 'task_created', ${'Task Created: \'' + body.title + '\''}, 'System', ${task.id}::uuid, 'task')
      `
    }

    // Fetch related names
    if (task.client_id) {
      const clientRows = await sql`SELECT name FROM clients WHERE id = ${task.client_id}::uuid`
      task.client_name = clientRows.length > 0 ? clientRows[0].name : null
    }
    if (task.deal_id) {
      const dealRows = await sql`SELECT name FROM deals WHERE id = ${task.deal_id}::uuid`
      task.deal_name = dealRows.length > 0 ? dealRows[0].name : null
    }

    return Response.json(task, { status: 201 })
  }

  // PUT /tasks/:taskId — update a task
  if (req.method === 'PUT' && taskId) {
    const body = await req.json() as {
      completed?: boolean
      title?: string
      description?: string
      due_date?: string
      priority?: string
      assignee_name?: string
      assignee_role?: string
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
        assignee_name = COALESCE(${body.assignee_name ?? null}, assignee_name),
        assignee_role = COALESCE(${body.assignee_role ?? null}, assignee_role),
        updated_at = NOW()
      WHERE id = ${taskId}::uuid
      RETURNING *
    `
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404 })
    }

    const task = rows[0]

    // Create timeline event for completion
    if (body.completed && task.client_id) {
      await sql`
        INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type)
        VALUES (${task.client_id}::uuid, 'task_completed', ${'Task Completed: \'' + task.title + '\''}, 'System', ${taskId}::uuid, 'task')
      `
    }

    // Fetch related names
    if (task.client_id) {
      const clientRows = await sql`SELECT name FROM clients WHERE id = ${task.client_id}::uuid`
      task.client_name = clientRows.length > 0 ? clientRows[0].name : null
    }
    if (task.deal_id) {
      const dealRows = await sql`SELECT name FROM deals WHERE id = ${task.deal_id}::uuid`
      task.deal_name = dealRows.length > 0 ? dealRows[0].name : null
    }

    return Response.json(task)
  }

  // DELETE /tasks/:taskId — delete a task
  if (req.method === 'DELETE' && taskId) {
    await sql`DELETE FROM tasks WHERE id = ${taskId}::uuid`
    return Response.json({ success: true })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}
