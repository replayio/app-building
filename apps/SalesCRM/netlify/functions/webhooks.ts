import { getDb } from '../utils/db'
import { optionalAuth, type OptionalAuthRequest } from '../utils/auth'

const VALID_EVENTS = [
  'client_created',
  'client_updated',
  'deal_created',
  'deal_stage_changed',
  'deal_closed_won',
  'deal_closed_lost',
  'task_created',
  'task_completed',
  'contact_created',
  'note_added',
]

async function handler(req: OptionalAuthRequest) {
  const sql = getDb()
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const webhookId = pathParts.length >= 4 ? pathParts[3] : null

  // GET /webhooks — list all webhooks
  if (req.method === 'GET' && !webhookId) {
    const webhooks = await sql`
      SELECT * FROM webhooks ORDER BY created_at DESC
    `
    return Response.json({ webhooks, availableEvents: VALID_EVENTS })
  }

  // POST /webhooks — create a new webhook
  if (req.method === 'POST' && !webhookId) {
    const body = await req.json() as {
      name: string
      url: string
      events: string[]
      enabled?: boolean
    }

    if (!body.name?.trim()) {
      return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400 })
    }
    if (!body.url?.trim()) {
      return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400 })
    }
    if (!body.events || body.events.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one event is required' }), { status: 400 })
    }

    const rows = await sql`
      INSERT INTO webhooks (name, url, events, enabled)
      VALUES (${body.name.trim()}, ${body.url.trim()}, ${body.events}, ${body.enabled !== false})
      RETURNING *
    `
    return Response.json(rows[0], { status: 201 })
  }

  // PUT /webhooks/:id — update a webhook
  if (req.method === 'PUT' && webhookId) {
    const body = await req.json() as {
      name?: string
      url?: string
      events?: string[]
      enabled?: boolean
    }

    const existing = await sql`SELECT * FROM webhooks WHERE id = ${webhookId}::uuid`
    if (existing.length === 0) {
      return new Response(JSON.stringify({ error: 'Webhook not found' }), { status: 404 })
    }

    const rows = await sql`
      UPDATE webhooks SET
        name = ${body.name?.trim() ?? existing[0].name},
        url = ${body.url?.trim() ?? existing[0].url},
        events = ${body.events ?? existing[0].events},
        enabled = ${body.enabled !== undefined ? body.enabled : existing[0].enabled},
        updated_at = NOW()
      WHERE id = ${webhookId}::uuid
      RETURNING *
    `
    return Response.json(rows[0])
  }

  // DELETE /webhooks/:id — delete a webhook
  if (req.method === 'DELETE' && webhookId) {
    const rows = await sql`DELETE FROM webhooks WHERE id = ${webhookId}::uuid RETURNING id`
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Webhook not found' }), { status: 404 })
    }
    return Response.json({ deleted: true })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
}

export default optionalAuth(handler)
