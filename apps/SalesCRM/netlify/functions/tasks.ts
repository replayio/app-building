import type { Context } from '@netlify/functions'
import { neon } from '@neondatabase/serverless'

const ITEMS_PER_PAGE = 20

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
        SELECT t.title, t.description, t.due_date, t.priority, t.status,
               c.name as client_name, u.name as assignee
        FROM tasks t
        LEFT JOIN clients c ON t.client_id = c.id
        LEFT JOIN users u ON t.assignee_id = u.id
        ORDER BY t.due_date ASC NULLS LAST
      `
      const header = 'Title,Description,Due Date,Priority,Client Name,Assignee'
      const csvRows = rows.map((r: Record<string, unknown>) => {
        const fields = [r.title, r.description || '', r.due_date || '', r.priority, r.client_name || '', r.assignee || '']
        return fields.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(',')
      })
      const csv = [header, ...csvRows].join('\n')
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="tasks.csv"',
        },
      })
    }

    // Single task by ID
    if (resourceId) {
      const rows = await sql`
        SELECT t.*, c.name as client_name, d.name as deal_name,
               u.name as assignee, u.avatar_url as assignee_avatar, u.role as assignee_role
        FROM tasks t
        LEFT JOIN clients c ON t.client_id = c.id
        LEFT JOIN deals d ON t.deal_id = d.id
        LEFT JOIN users u ON t.assignee_id = u.id
        WHERE t.id = ${resourceId}
      `
      if (rows.length === 0) {
        return Response.json({ error: 'Task not found' }, { status: 404 })
      }
      return Response.json(rows[0])
    }

    // List tasks with filters
    const search = url.searchParams.get('search') || ''
    const priority = url.searchParams.get('priority') || ''
    const status = url.searchParams.get('status') || ''
    const sortBy = url.searchParams.get('sortBy') || 'due_date'
    const sortDir = url.searchParams.get('sortDir') || 'asc'
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const offset = (page - 1) * ITEMS_PER_PAGE

    const allowedSortColumns = ['due_date', 'title', 'priority', 'created_at']
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'due_date'
    const safeSortDir = sortDir === 'desc' ? 'desc' : 'asc'

    const countResult = await sql`
      SELECT COUNT(*) as count
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      WHERE (${search} = '' OR t.title ILIKE ${'%' + search + '%'})
        AND (${priority} = '' OR t.priority = ${priority})
        AND (${status} = '' OR t.status = ${status})
    `
    const total = parseInt(String(countResult[0].count), 10)

    const rows = await sql`
      SELECT t.*, c.name as client_name, d.name as deal_name,
             u.name as assignee, u.avatar_url as assignee_avatar, u.role as assignee_role
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN deals d ON t.deal_id = d.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE (${search} = '' OR t.title ILIKE ${'%' + search + '%'})
        AND (${priority} = '' OR t.priority = ${priority})
        AND (${status} = '' OR t.status = ${status})
      ORDER BY
        CASE WHEN ${safeSortBy} = 'due_date' AND ${safeSortDir} = 'asc' THEN t.due_date END ASC NULLS LAST,
        CASE WHEN ${safeSortBy} = 'due_date' AND ${safeSortDir} = 'desc' THEN t.due_date END DESC NULLS LAST,
        CASE WHEN ${safeSortBy} = 'title' AND ${safeSortDir} = 'asc' THEN t.title END ASC,
        CASE WHEN ${safeSortBy} = 'title' AND ${safeSortDir} = 'desc' THEN t.title END DESC,
        CASE WHEN ${safeSortBy} = 'priority' AND ${safeSortDir} = 'asc' THEN t.priority END ASC,
        CASE WHEN ${safeSortBy} = 'priority' AND ${safeSortDir} = 'desc' THEN t.priority END DESC,
        CASE WHEN ${safeSortBy} = 'created_at' AND ${safeSortDir} = 'asc' THEN t.created_at END ASC,
        CASE WHEN ${safeSortBy} = 'created_at' AND ${safeSortDir} = 'desc' THEN t.created_at END DESC,
        t.due_date ASC NULLS LAST
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `

    return Response.json({ tasks: rows, total, page, perPage: ITEMS_PER_PAGE })
  }

  // POST - create or import
  if (req.method === 'POST') {
    if (resourceId === 'import') {
      const body = await req.json()
      const { tasks: taskRows } = body as { tasks: Array<Record<string, string>> }
      if (!Array.isArray(taskRows)) {
        return Response.json({ error: 'tasks array required' }, { status: 400 })
      }

      const errors: Array<{ row: number; error: string }> = []
      let imported = 0

      for (let i = 0; i < taskRows.length; i++) {
        const row = taskRows[i]
        const title = (row.Title || row.title || '').trim()
        if (!title) {
          errors.push({ row: i + 1, error: 'Title is required' })
          continue
        }

        const description = (row.Description || row.description || '').trim() || null
        const dueDateStr = (row['Due Date'] || row.due_date || '').trim()
        const dueDate = dueDateStr || null
        const priorityRaw = (row.Priority || row.priority || 'medium').trim().toLowerCase()
        const validPriorities = ['high', 'medium', 'normal', 'low']
        if (!validPriorities.includes(priorityRaw)) {
          errors.push({ row: i + 1, error: `Invalid priority '${row.Priority || row.priority}'` })
          continue
        }

        let clientId: string | null = null
        const clientName = (row['Client Name'] || row.client_name || '').trim()
        if (clientName) {
          const clients = await sql`SELECT id FROM clients WHERE LOWER(name) = LOWER(${clientName}) LIMIT 1`
          if (clients.length > 0) {
            clientId = clients[0].id
          }
        }

        let assigneeId: string | null = null
        const assigneeName = (row.Assignee || row.assignee || '').trim()
        if (assigneeName) {
          const users = await sql`SELECT id FROM users WHERE LOWER(name) ILIKE LOWER(${assigneeName + '%'}) LIMIT 1`
          if (users.length > 0) {
            assigneeId = users[0].id
          }
        }

        await sql`
          INSERT INTO tasks (title, description, due_date, priority, status, client_id, assignee_id)
          VALUES (${title}, ${description}, ${dueDate || null}, ${priorityRaw}, 'open', ${clientId}, ${assigneeId})
        `
        imported++
      }

      return Response.json({ imported, errors, total: taskRows.length })
    }

    // Single create
    const body = await req.json()
    const { title, description, due_date, priority, client_id, deal_id, assignee_id } = body as {
      title?: string
      description?: string
      due_date?: string
      priority?: string
      client_id?: string
      deal_id?: string
      assignee_id?: string
    }

    if (!title?.trim()) {
      return Response.json({ error: 'Title is required' }, { status: 400 })
    }

    const validPriorities = ['high', 'medium', 'normal', 'low']
    const safePriority = validPriorities.includes(priority || '') ? priority : 'medium'

    const rows = await sql`
      INSERT INTO tasks (title, description, due_date, priority, status, client_id, deal_id, assignee_id)
      VALUES (
        ${title.trim()},
        ${description?.trim() || null},
        ${due_date || null},
        ${safePriority},
        'open',
        ${client_id || null},
        ${deal_id || null},
        ${assignee_id || null}
      )
      RETURNING *
    `

    const task = rows[0]

    // Fetch joined data for response
    const fullTask = await sql`
      SELECT t.*, c.name as client_name, d.name as deal_name,
             u.name as assignee, u.avatar_url as assignee_avatar, u.role as assignee_role
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN deals d ON t.deal_id = d.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ${task.id}
    `

    // Create timeline event if associated with a client
    if (task.client_id) {
      await sql`
        INSERT INTO timeline_events (client_id, task_id, event_type, description, actor_name)
        VALUES (${task.client_id}, ${task.id}, 'task_created', ${'Task created: ' + title.trim()}, 'System')
      `
    }

    return Response.json(fullTask[0], { status: 201 })
  }

  // PUT - update
  if (req.method === 'PUT') {
    if (!resourceId) {
      return Response.json({ error: 'Task ID required' }, { status: 400 })
    }

    const body = await req.json()
    const { title, description, due_date, priority, status, client_id, deal_id, assignee_id } = body as {
      title?: string
      description?: string
      due_date?: string
      priority?: string
      status?: string
      client_id?: string
      deal_id?: string
      assignee_id?: string
    }

    // Fetch current task for status change detection
    const current = await sql`SELECT * FROM tasks WHERE id = ${resourceId}`
    if (current.length === 0) {
      return Response.json({ error: 'Task not found' }, { status: 404 })
    }

    const validPriorities = ['high', 'medium', 'normal', 'low']
    const validStatuses = ['open', 'completed', 'cancelled']
    const safePriority = priority && validPriorities.includes(priority) ? priority : current[0].priority
    const safeStatus = status && validStatuses.includes(status) ? status : current[0].status

    const rows = await sql`
      UPDATE tasks SET
        title = ${title?.trim() || current[0].title},
        description = ${description !== undefined ? (description?.trim() || null) : current[0].description},
        due_date = ${due_date !== undefined ? (due_date || null) : current[0].due_date},
        priority = ${safePriority},
        status = ${safeStatus},
        client_id = ${client_id !== undefined ? (client_id || null) : current[0].client_id},
        deal_id = ${deal_id !== undefined ? (deal_id || null) : current[0].deal_id},
        assignee_id = ${assignee_id !== undefined ? (assignee_id || null) : current[0].assignee_id},
        updated_at = NOW()
      WHERE id = ${resourceId}
      RETURNING *
    `

    // Create timeline event for status changes
    if (status && status !== current[0].status && current[0].client_id) {
      const description = status === 'completed'
        ? `Task completed: ${rows[0].title}`
        : status === 'cancelled'
          ? `Task cancelled: ${rows[0].title}`
          : `Task status changed to ${status}: ${rows[0].title}`
      await sql`
        INSERT INTO timeline_events (client_id, task_id, event_type, description, actor_name)
        VALUES (${current[0].client_id}, ${resourceId}, 'task_status_changed', ${description}, 'System')
      `
    }

    const fullTask = await sql`
      SELECT t.*, c.name as client_name, d.name as deal_name,
             u.name as assignee, u.avatar_url as assignee_avatar, u.role as assignee_role
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN deals d ON t.deal_id = d.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ${resourceId}
    `

    return Response.json(fullTask[0])
  }

  // DELETE
  if (req.method === 'DELETE') {
    if (!resourceId) {
      return Response.json({ error: 'Task ID required' }, { status: 400 })
    }

    const existing = await sql`SELECT * FROM tasks WHERE id = ${resourceId}`
    if (existing.length === 0) {
      return Response.json({ error: 'Task not found' }, { status: 404 })
    }

    await sql`DELETE FROM tasks WHERE id = ${resourceId}`

    return Response.json({ success: true })
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
