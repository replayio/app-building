import { getDb, getDbUrl } from '../utils/db'
import { optionalAuth, type OptionalAuthRequest } from '../utils/auth'
import { notifyClientFollowers } from '../utils/notifications'

async function handler(req: OptionalAuthRequest) {
  const sql = getDb()
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const dealId = pathParts.length >= 4 ? pathParts[3] : null

  // GET /client-deals?clientId=...
  if (req.method === 'GET' && !dealId) {
    const clientId = url.searchParams.get('clientId')
    if (!clientId) {
      return new Response(JSON.stringify({ error: 'clientId required' }), { status: 400 })
    }

    const deals = await sql`
      SELECT d.*, c.name as client_name
      FROM deals d
      JOIN clients c ON d.client_id = c.id
      WHERE d.client_id = ${clientId}
      ORDER BY d.created_at DESC
    `

    return Response.json({ deals })
  }

  // POST /client-deals — create a new deal
  if (req.method === 'POST') {
    const body = await req.json() as {
      name: string
      client_id: string
      value?: number
      stage?: string
      owner?: string
      probability?: number
      expected_close_date?: string
    }

    const rows = await sql`
      INSERT INTO deals (name, client_id, value, stage, owner, probability, expected_close_date)
      VALUES (
        ${body.name},
        ${body.client_id},
        ${body.value ?? 0},
        ${body.stage ?? 'lead'},
        ${body.owner ?? null},
        ${body.probability ?? 0},
        ${body.expected_close_date || null}
      )
      RETURNING *
    `

    // Create deal history entry for initial stage
    const deal = rows[0]
    await sql`
      INSERT INTO deal_history (deal_id, old_stage, new_stage, changed_by)
      VALUES (${deal.id}, 'none', ${deal.stage}, ${req.user?.name ?? 'System'})
    `

    // Create timeline event
    const dealDesc = 'Deal Created: \'' + body.name + '\''
    await sql`
      INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type)
      VALUES (${body.client_id}, 'deal_created', ${dealDesc}, ${req.user?.name ?? 'System'}, ${deal.id}, 'deal')
    `
    notifyClientFollowers(getDbUrl(), body.client_id, 'deal_created', dealDesc, req.user?.id, req).catch(() => {})

    // Add client_name
    const clientRows = await sql`SELECT name FROM clients WHERE id = ${body.client_id}`
    deal.client_name = clientRows.length > 0 ? clientRows[0].name : null

    return Response.json(deal, { status: 201 })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}

export default optionalAuth(handler)
