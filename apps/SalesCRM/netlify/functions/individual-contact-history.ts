import type { Context } from '@netlify/functions'
import { neon } from '@neondatabase/serverless'

export default async function handler(req: Request, _context: Context) {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    return Response.json({ error: 'Database not configured' }, { status: 500 })
  }

  const sql = neon(databaseUrl)
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const resourceId = segments[3] || null

  if (req.method === 'POST') {
    const body = await req.json()
    const { individual_id, type, summary, notes, performed_by, contact_date } = body as {
      individual_id?: string
      type?: string
      summary?: string
      notes?: string
      performed_by?: string
      contact_date?: string
    }

    if (!individual_id || !type?.trim() || !summary?.trim()) {
      return Response.json({ error: 'individual_id, type, and summary are required' }, { status: 400 })
    }

    const rows = await sql`
      INSERT INTO contact_history (individual_id, type, summary, notes, performed_by, contact_date)
      VALUES (
        ${individual_id},
        ${type.trim()},
        ${summary.trim()},
        ${notes?.trim() || null},
        ${performed_by || null},
        ${contact_date || new Date().toISOString()}
      )
      RETURNING *
    `

    // Enrich with performer name
    const entry = rows[0]
    if (entry.performed_by) {
      const users = await sql`SELECT name, role FROM users WHERE id = ${entry.performed_by}`
      if (users.length > 0) {
        entry.performer_name = users[0].name
        entry.performer_role = users[0].role || ''
      } else {
        entry.performer_name = 'System'
        entry.performer_role = ''
      }
    } else {
      entry.performer_name = 'System'
      entry.performer_role = ''
    }

    return Response.json(entry, { status: 201 })
  }

  if (req.method === 'PUT') {
    if (!resourceId) {
      return Response.json({ error: 'Entry ID required' }, { status: 400 })
    }

    const existing = await sql`SELECT * FROM contact_history WHERE id = ${resourceId}`
    if (existing.length === 0) {
      return Response.json({ error: 'Entry not found' }, { status: 404 })
    }

    const body = await req.json()
    const { type, summary, notes, performed_by, contact_date } = body as {
      type?: string
      summary?: string
      notes?: string
      performed_by?: string
      contact_date?: string
    }

    const current = existing[0]
    const rows = await sql`
      UPDATE contact_history SET
        type = ${type?.trim() || current.type},
        summary = ${summary?.trim() || current.summary},
        notes = ${notes !== undefined ? (notes?.trim() || null) : current.notes},
        performed_by = ${performed_by !== undefined ? (performed_by || null) : current.performed_by},
        contact_date = ${contact_date || current.contact_date}
      WHERE id = ${resourceId}
      RETURNING *
    `

    const entry = rows[0]
    if (entry.performed_by) {
      const users = await sql`SELECT name, role FROM users WHERE id = ${entry.performed_by}`
      if (users.length > 0) {
        entry.performer_name = users[0].name
        entry.performer_role = users[0].role || ''
      } else {
        entry.performer_name = 'System'
        entry.performer_role = ''
      }
    } else {
      entry.performer_name = 'System'
      entry.performer_role = ''
    }

    return Response.json(entry)
  }

  if (req.method === 'DELETE') {
    if (!resourceId) {
      return Response.json({ error: 'Entry ID required' }, { status: 400 })
    }

    const existing = await sql`SELECT * FROM contact_history WHERE id = ${resourceId}`
    if (existing.length === 0) {
      return Response.json({ error: 'Entry not found' }, { status: 404 })
    }

    await sql`DELETE FROM contact_history WHERE id = ${resourceId}`

    return Response.json({ success: true })
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
