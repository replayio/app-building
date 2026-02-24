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

  if (req.method === 'GET') {
    // List attachments for a client
    const clientId = url.searchParams.get('client_id') || ''
    const dealId = url.searchParams.get('deal_id') || ''

    if (clientId) {
      const rows = await sql`
        SELECT a.*, d.name as deal_name
        FROM attachments a
        LEFT JOIN deals d ON a.deal_id = d.id
        WHERE a.client_id = ${clientId}
        ORDER BY a.created_at DESC
      `
      return Response.json({ attachments: rows })
    }

    if (dealId) {
      const rows = await sql`
        SELECT a.*, d.name as deal_name
        FROM attachments a
        LEFT JOIN deals d ON a.deal_id = d.id
        WHERE a.deal_id = ${dealId}
        ORDER BY a.created_at DESC
      `
      return Response.json({ attachments: rows })
    }

    return Response.json({ attachments: [] })
  }

  if (req.method === 'POST') {
    const body = await req.json()
    const { filename, file_url, file_type, file_size, client_id, deal_id } = body as {
      filename?: string
      file_url?: string
      file_type?: string
      file_size?: number
      client_id?: string
      deal_id?: string
    }

    if (!filename?.trim()) {
      return Response.json({ error: 'Filename is required' }, { status: 400 })
    }
    if (!file_url?.trim()) {
      return Response.json({ error: 'File URL is required' }, { status: 400 })
    }

    const rows = await sql`
      INSERT INTO attachments (filename, file_url, file_type, file_size, client_id, deal_id)
      VALUES (
        ${filename.trim()},
        ${file_url.trim()},
        ${file_type || null},
        ${file_size || null},
        ${client_id || null},
        ${deal_id || null}
      )
      RETURNING *
    `

    const attachment = rows[0]

    // Fetch with deal name
    const full = await sql`
      SELECT a.*, d.name as deal_name
      FROM attachments a
      LEFT JOIN deals d ON a.deal_id = d.id
      WHERE a.id = ${attachment.id}
    `

    return Response.json(full[0], { status: 201 })
  }

  if (req.method === 'DELETE') {
    if (!resourceId) {
      return Response.json({ error: 'Attachment ID required' }, { status: 400 })
    }

    const existing = await sql`SELECT * FROM attachments WHERE id = ${resourceId}`
    if (existing.length === 0) {
      return Response.json({ error: 'Attachment not found' }, { status: 404 })
    }

    await sql`DELETE FROM attachments WHERE id = ${resourceId}`
    return Response.json({ success: true })
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
