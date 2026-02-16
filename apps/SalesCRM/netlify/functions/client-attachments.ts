import { neon } from '@neondatabase/serverless'
import { requiresAuth, type AuthenticatedRequest } from '../utils/auth'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

async function handler(req: AuthenticatedRequest) {
  const sql = getDb()
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const attachmentId = pathParts.length >= 4 ? pathParts[3] : null

  // GET /client-attachments?clientId=...
  if (req.method === 'GET' && !attachmentId) {
    const clientId = url.searchParams.get('clientId')
    if (!clientId) {
      return new Response(JSON.stringify({ error: 'clientId required' }), { status: 400 })
    }

    const attachments = await sql`
      SELECT a.*, d.name as deal_name
      FROM attachments a
      LEFT JOIN deals d ON a.deal_id = d.id
      WHERE a.client_id = ${clientId}
      ORDER BY a.created_at DESC
    `

    return Response.json({ attachments })
  }

  // POST /client-attachments — create a new attachment
  if (req.method === 'POST') {
    const body = await req.json() as {
      filename: string
      type: string
      url: string
      size?: number
      client_id: string
      deal_id?: string
    }

    const rows = await sql`
      INSERT INTO attachments (filename, type, url, size, client_id, deal_id)
      VALUES (
        ${body.filename},
        ${body.type},
        ${body.url},
        ${body.size ?? null},
        ${body.client_id},
        ${body.deal_id || null}
      )
      RETURNING *
    `

    // Create timeline event
    await sql`
      INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type)
      VALUES (${body.client_id}, 'attachment_added', ${'Attachment Added: \'' + body.filename + '\''}, ${req.user.name}, ${rows[0].id}, 'attachment')
    `

    // Fetch deal_name if deal_id provided
    const attachment = rows[0]
    if (body.deal_id) {
      const dealRows = await sql`SELECT name FROM deals WHERE id = ${body.deal_id}`
      attachment.deal_name = dealRows.length > 0 ? dealRows[0].name : null
    }

    return Response.json(attachment, { status: 201 })
  }

  // DELETE /client-attachments/:attachmentId
  if (req.method === 'DELETE' && attachmentId) {
    await sql`DELETE FROM attachments WHERE id = ${attachmentId}`
    return Response.json({ success: true })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}

export default requiresAuth(handler)
