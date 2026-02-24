import type { Context } from '@netlify/functions'
import { neon } from '@neondatabase/serverless'

const ITEMS_PER_PAGE = 50

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
        SELECT i.name, i.title, i.email, i.phone, i.location,
               COALESCE(
                 (SELECT STRING_AGG(c.name, ', ' ORDER BY c.name)
                  FROM client_individuals ci
                  JOIN clients c ON ci.client_id = c.id
                  WHERE ci.individual_id = i.id),
                 ''
               ) as client_name
        FROM individuals i
        ORDER BY i.name ASC
      `
      const header = 'Name,Title,Email,Phone,Location,Client Name'
      const csvRows = rows.map((r: Record<string, unknown>) => {
        const fields = [r.name, r.title || '', r.email || '', r.phone || '', r.location || '', r.client_name || '']
        return fields.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(',')
      })
      const csv = [header, ...csvRows].join('\n')
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="contacts.csv"',
        },
      })
    }

    // Single individual by ID
    if (resourceId) {
      const rows = await sql`
        SELECT i.*,
               COALESCE(
                 (SELECT JSON_AGG(JSON_BUILD_OBJECT('id', c.id, 'name', c.name, 'status', c.status, 'type', c.type))
                  FROM client_individuals ci
                  JOIN clients c ON ci.client_id = c.id
                  WHERE ci.individual_id = i.id),
                 '[]'::json
               ) as clients,
               COALESCE(
                 (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                   'id', ir.id,
                   'related_individual_id', ri.id,
                   'related_individual_name', ri.name,
                   'related_individual_title', ri.title,
                   'relationship_type', ir.relationship_type,
                   'related_individual_clients', COALESCE(
                     (SELECT STRING_AGG(c2.name, ', ' ORDER BY c2.name)
                      FROM client_individuals ci2
                      JOIN clients c2 ON ci2.client_id = c2.id
                      WHERE ci2.individual_id = ri.id), '')
                 ) ORDER BY ri.name)
                  FROM individual_relationships ir
                  JOIN individuals ri ON ir.related_individual_id = ri.id
                  WHERE ir.individual_id = i.id),
                 '[]'::json
               ) as relationships,
               COALESCE(
                 (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                   'id', ch.id,
                   'type', ch.type,
                   'summary', ch.summary,
                   'notes', ch.notes,
                   'performed_by', ch.performed_by,
                   'performer_name', COALESCE(u.name, 'System'),
                   'performer_role', COALESCE(u.role, ''),
                   'contact_date', ch.contact_date,
                   'created_at', ch.created_at
                 ) ORDER BY ch.contact_date DESC)
                  FROM contact_history ch
                  LEFT JOIN users u ON ch.performed_by = u.id
                  WHERE ch.individual_id = i.id),
                 '[]'::json
               ) as contact_history
        FROM individuals i
        WHERE i.id = ${resourceId}
      `
      if (rows.length === 0) {
        return Response.json({ error: 'Individual not found' }, { status: 404 })
      }
      return Response.json(rows[0])
    }

    // List individuals with search and pagination
    const search = url.searchParams.get('search') || ''
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const offset = (page - 1) * ITEMS_PER_PAGE

    const countResult = await sql`
      SELECT COUNT(*) as count
      FROM individuals i
      WHERE (${search} = '' OR
             i.name ILIKE ${'%' + search + '%'} OR
             i.email ILIKE ${'%' + search + '%'} OR
             i.title ILIKE ${'%' + search + '%'} OR
             i.phone ILIKE ${'%' + search + '%'} OR
             i.location ILIKE ${'%' + search + '%'})
    `
    const total = parseInt(String(countResult[0].count), 10)

    const rows = await sql`
      SELECT i.*,
             COALESCE(
               (SELECT ARRAY_AGG(c.name ORDER BY c.name)
                FROM client_individuals ci
                JOIN clients c ON ci.client_id = c.id
                WHERE ci.individual_id = i.id),
               '{}'
             ) as client_names
      FROM individuals i
      WHERE (${search} = '' OR
             i.name ILIKE ${'%' + search + '%'} OR
             i.email ILIKE ${'%' + search + '%'} OR
             i.title ILIKE ${'%' + search + '%'} OR
             i.phone ILIKE ${'%' + search + '%'} OR
             i.location ILIKE ${'%' + search + '%'})
      ORDER BY i.name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `

    return Response.json({ individuals: rows, total, page, perPage: ITEMS_PER_PAGE })
  }

  // POST - create or import
  if (req.method === 'POST') {
    if (resourceId === 'import') {
      const body = await req.json()
      const { contacts: contactRows } = body as { contacts: Array<Record<string, string>> }
      if (!Array.isArray(contactRows)) {
        return Response.json({ error: 'contacts array required' }, { status: 400 })
      }

      const errors: Array<{ row: number; error: string }> = []
      let imported = 0

      for (let i = 0; i < contactRows.length; i++) {
        const row = contactRows[i]
        const name = (row.Name || row.name || '').trim()
        if (!name) {
          errors.push({ row: i + 1, error: 'Name is required' })
          continue
        }

        const title = (row.Title || row.title || '').trim() || null
        const email = (row.Email || row.email || '').trim() || null
        const phone = (row.Phone || row.phone || '').trim() || null
        const location = (row.Location || row.location || '').trim() || null

        const result = await sql`
          INSERT INTO individuals (name, title, email, phone, location)
          VALUES (${name}, ${title}, ${email}, ${phone}, ${location})
          RETURNING id
        `
        const individualId = result[0].id

        // Link to client if provided
        const clientName = (row['Client Name'] || row.client_name || '').trim()
        if (clientName) {
          const clients = await sql`SELECT id FROM clients WHERE LOWER(name) = LOWER(${clientName}) LIMIT 1`
          if (clients.length > 0) {
            await sql`
              INSERT INTO client_individuals (client_id, individual_id)
              VALUES (${clients[0].id}, ${individualId})
              ON CONFLICT DO NOTHING
            `
            // Create timeline event for the client
            await sql`
              INSERT INTO timeline_events (client_id, individual_id, event_type, description, actor_name)
              VALUES (${clients[0].id}, ${individualId}, 'contact_added', ${'Contact added: ' + name}, 'System')
            `
          }
        }

        imported++
      }

      return Response.json({ imported, errors, total: contactRows.length })
    }

    // Single create
    const body = await req.json()
    const { name, title, email, phone, location, client_id } = body as {
      name?: string
      title?: string
      email?: string
      phone?: string
      location?: string
      client_id?: string
    }

    if (!name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }

    const rows = await sql`
      INSERT INTO individuals (name, title, email, phone, location)
      VALUES (
        ${name.trim()},
        ${title?.trim() || null},
        ${email?.trim() || null},
        ${phone?.trim() || null},
        ${location?.trim() || null}
      )
      RETURNING *
    `

    const individual = rows[0]

    // Link to client if provided
    if (client_id) {
      await sql`
        INSERT INTO client_individuals (client_id, individual_id)
        VALUES (${client_id}, ${individual.id})
        ON CONFLICT DO NOTHING
      `
      // Create timeline event
      await sql`
        INSERT INTO timeline_events (client_id, individual_id, event_type, description, actor_name)
        VALUES (${client_id}, ${individual.id}, 'contact_added', ${'Contact added: ' + name.trim()}, 'System')
      `
    }

    // Return with client_names enriched
    const full = await sql`
      SELECT i.*,
             COALESCE(
               (SELECT ARRAY_AGG(c.name ORDER BY c.name)
                FROM client_individuals ci
                JOIN clients c ON ci.client_id = c.id
                WHERE ci.individual_id = i.id),
               '{}'
             ) as client_names
      FROM individuals i
      WHERE i.id = ${individual.id}
    `

    return Response.json(full[0], { status: 201 })
  }

  // PUT - update
  if (req.method === 'PUT') {
    if (!resourceId) {
      return Response.json({ error: 'Individual ID required' }, { status: 400 })
    }

    const body = await req.json()
    const { name, title, email, phone, location } = body as {
      name?: string
      title?: string
      email?: string
      phone?: string
      location?: string
    }

    const current = await sql`SELECT * FROM individuals WHERE id = ${resourceId}`
    if (current.length === 0) {
      return Response.json({ error: 'Individual not found' }, { status: 404 })
    }

    const rows = await sql`
      UPDATE individuals SET
        name = ${name?.trim() || current[0].name},
        title = ${title !== undefined ? (title?.trim() || null) : current[0].title},
        email = ${email !== undefined ? (email?.trim() || null) : current[0].email},
        phone = ${phone !== undefined ? (phone?.trim() || null) : current[0].phone},
        location = ${location !== undefined ? (location?.trim() || null) : current[0].location},
        updated_at = NOW()
      WHERE id = ${resourceId}
      RETURNING *
    `

    return Response.json(rows[0])
  }

  // DELETE
  if (req.method === 'DELETE') {
    if (!resourceId) {
      return Response.json({ error: 'Individual ID required' }, { status: 400 })
    }

    const existing = await sql`SELECT * FROM individuals WHERE id = ${resourceId}`
    if (existing.length === 0) {
      return Response.json({ error: 'Individual not found' }, { status: 404 })
    }

    await sql`DELETE FROM individuals WHERE id = ${resourceId}`

    return Response.json({ success: true })
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
