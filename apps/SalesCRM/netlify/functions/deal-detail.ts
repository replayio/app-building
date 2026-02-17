import { neon } from '@neondatabase/serverless'
import { optionalAuth, type OptionalAuthRequest } from '../utils/auth'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

async function handler(req: OptionalAuthRequest) {
  const sql = getDb()
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  // Path: /deal-detail?dealId=... or /deal-detail/<resource>/<resourceId>
  const resource = pathParts.length >= 4 ? pathParts[3] : null
  const resourceId = pathParts.length >= 5 ? pathParts[4] : null

  const dealId = url.searchParams.get('dealId') ?? ''

  // GET /deal-detail?dealId=... — get all deal detail data
  if (req.method === 'GET' && !resource) {
    if (!dealId) {
      return new Response(JSON.stringify({ error: 'dealId required' }), { status: 400 })
    }

    const [history, writeups, tasks, attachments, contacts] = await Promise.all([
      sql`
        SELECT id, deal_id, old_stage, new_stage, changed_by, created_at
        FROM deal_history
        WHERE deal_id = ${dealId}::uuid
        ORDER BY created_at DESC
      `,
      sql`
        SELECT id, deal_id, title, content, author, version, created_at, updated_at
        FROM writeups
        WHERE deal_id = ${dealId}::uuid
        ORDER BY created_at DESC
      `,
      sql`
        SELECT t.*, c.name as client_name, d.name as deal_name
        FROM tasks t
        LEFT JOIN clients c ON t.client_id = c.id
        LEFT JOIN deals d ON t.deal_id = d.id
        WHERE t.deal_id = ${dealId}::uuid
        ORDER BY t.completed ASC, t.due_date ASC NULLS LAST
      `,
      sql`
        SELECT a.*, d.name as deal_name
        FROM attachments a
        LEFT JOIN deals d ON a.deal_id = d.id
        WHERE a.deal_id = ${dealId}::uuid
        ORDER BY a.created_at ASC
      `,
      sql`
        SELECT dc.id, dc.role, i.id as individual_id, i.name as individual_name, i.title,
          (SELECT ci.role FROM client_individuals ci WHERE ci.individual_id = i.id LIMIT 1) as company_role,
          (SELECT c.name FROM clients c JOIN client_individuals ci2 ON ci2.client_id = c.id WHERE ci2.individual_id = i.id LIMIT 1) as company
        FROM deal_contacts dc
        JOIN individuals i ON dc.individual_id = i.id
        WHERE dc.deal_id = ${dealId}::uuid
        ORDER BY i.name ASC
      `,
    ])

    return Response.json({ history, writeups, tasks, attachments, contacts })
  }

  // POST /deal-detail/writeups — create writeup
  if (req.method === 'POST' && resource === 'writeups') {
    const body = await req.json() as {
      deal_id: string
      title: string
      content: string
      author: string
    }

    const rows = await sql`
      INSERT INTO writeups (deal_id, title, content, author, version)
      VALUES (${body.deal_id}::uuid, ${body.title}, ${body.content}, ${req.user?.name ?? 'System'}, 1)
      RETURNING *
    `

    return Response.json(rows[0], { status: 201 })
  }

  // PUT /deal-detail/writeups/:writeupId — edit writeup (creates version)
  if (req.method === 'PUT' && resource === 'writeups' && resourceId) {
    const body = await req.json() as {
      title?: string
      content?: string
      author?: string
    }

    // Get current version to save as history
    const existing = await sql`SELECT * FROM writeups WHERE id = ${resourceId}::uuid`
    if (existing.length === 0) {
      return new Response(JSON.stringify({ error: 'Writeup not found' }), { status: 404 })
    }

    const current = existing[0]

    // Save current version to writeup_versions
    await sql`
      INSERT INTO writeup_versions (writeup_id, title, content, author, version, created_at)
      VALUES (${resourceId}::uuid, ${current.title}, ${current.content}, ${current.author}, ${current.version}, ${current.updated_at})
    `

    // Update the writeup with new content
    const newVersion = Number(current.version) + 1
    const rows = await sql`
      UPDATE writeups SET
        title = COALESCE(${body.title ?? null}, title),
        content = COALESCE(${body.content ?? null}, content),
        author = ${req.user?.name ?? 'System'},
        version = ${newVersion},
        updated_at = NOW()
      WHERE id = ${resourceId}::uuid
      RETURNING *
    `

    return Response.json(rows[0])
  }

  // GET /deal-detail/writeup-versions/:writeupId — get version history
  if (req.method === 'GET' && resource === 'writeup-versions' && resourceId) {
    const versions = await sql`
      SELECT id, writeup_id, title, content, author, version, created_at
      FROM writeup_versions
      WHERE writeup_id = ${resourceId}::uuid
      ORDER BY version DESC
    `

    // Also include the current version
    const current = await sql`
      SELECT id, id as writeup_id, title, content, author, version, updated_at as created_at
      FROM writeups
      WHERE id = ${resourceId}::uuid
    `

    return Response.json({ versions: [...current, ...versions] })
  }

  // POST /deal-detail/tasks — create task for deal
  if (req.method === 'POST' && resource === 'tasks') {
    const body = await req.json() as {
      deal_id: string
      client_id: string
      title: string
      description?: string
      due_date?: string
      priority?: string
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
        ${body.client_id}::uuid,
        ${body.deal_id}::uuid,
        ${body.assignee_name ?? null},
        ${body.assignee_role ?? null}
      )
      RETURNING *
    `

    // Create timeline event
    await sql`
      INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type)
      VALUES (${body.client_id}::uuid, 'task_created', ${'Task Created: \'' + body.title + '\''}, ${req.user?.name ?? 'System'}, ${rows[0].id}::uuid, 'task')
    `

    return Response.json(rows[0], { status: 201 })
  }

  // PUT /deal-detail/tasks/:taskId — update task (toggle complete)
  if (req.method === 'PUT' && resource === 'tasks' && resourceId) {
    const body = await req.json() as {
      completed?: boolean
      title?: string
      due_date?: string
      priority?: string
    }

    const updates: string[] = []
    if (body.completed !== undefined) {
      if (body.completed) {
        updates.push('completed_at = NOW()')
      } else {
        updates.push('completed_at = NULL')
      }
    }

    const rows = await sql`
      UPDATE tasks SET
        completed = COALESCE(${body.completed ?? null}, completed),
        completed_at = CASE WHEN ${body.completed ?? null}::boolean = true THEN NOW() ELSE NULL END,
        title = COALESCE(${body.title ?? null}, title),
        due_date = COALESCE(${body.due_date || null}, due_date),
        priority = COALESCE(${body.priority ?? null}, priority),
        updated_at = NOW()
      WHERE id = ${resourceId}::uuid
      RETURNING *
    `

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404 })
    }

    // Create timeline event for completion
    if (body.completed && rows[0].client_id) {
      await sql`
        INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type)
        VALUES (${rows[0].client_id}::uuid, 'task_completed', ${'Task Completed: \'' + rows[0].title + '\''}, ${req.user?.name ?? 'System'}, ${resourceId}::uuid, 'task')
      `
    }

    return Response.json(rows[0])
  }

  // POST /deal-detail/attachments — add attachment to deal
  if (req.method === 'POST' && resource === 'attachments') {
    const body = await req.json() as {
      deal_id: string
      client_id: string
      filename: string
      type: string
      url: string
      size?: number
    }

    const rows = await sql`
      INSERT INTO attachments (filename, type, url, size, client_id, deal_id)
      VALUES (
        ${body.filename},
        ${body.type},
        ${body.url},
        ${body.size ?? null},
        ${body.client_id}::uuid,
        ${body.deal_id}::uuid
      )
      RETURNING *
    `

    return Response.json(rows[0], { status: 201 })
  }

  // DELETE /deal-detail/attachments/:attachmentId — delete attachment
  if (req.method === 'DELETE' && resource === 'attachments' && resourceId) {
    await sql`DELETE FROM attachments WHERE id = ${resourceId}::uuid`
    return new Response(null, { status: 204 })
  }

  // POST /deal-detail/contacts — add contact to deal
  if (req.method === 'POST' && resource === 'contacts') {
    const body = await req.json() as {
      deal_id: string
      individual_id: string
      role: string
    }

    const rows = await sql`
      INSERT INTO deal_contacts (deal_id, individual_id, role)
      VALUES (${body.deal_id}::uuid, ${body.individual_id}::uuid, ${body.role})
      ON CONFLICT (deal_id, individual_id) DO UPDATE SET role = ${body.role}
      RETURNING *
    `

    return Response.json(rows[0], { status: 201 })
  }

  // DELETE /deal-detail/contacts/:contactId — remove contact from deal
  if (req.method === 'DELETE' && resource === 'contacts' && resourceId) {
    await sql`DELETE FROM deal_contacts WHERE id = ${resourceId}::uuid`
    return new Response(null, { status: 204 })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}

export default optionalAuth(handler)
