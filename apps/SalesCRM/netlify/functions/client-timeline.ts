import { getDb } from '../utils/db'
import { optionalAuth, type OptionalAuthRequest } from '../utils/auth'

async function handler(req: OptionalAuthRequest) {
  const sql = getDb()
  const url = new URL(req.url)

  // GET /client-timeline?clientId=...
  if (req.method === 'GET') {
    const clientId = url.searchParams.get('clientId')
    if (!clientId) {
      return new Response(JSON.stringify({ error: 'clientId required' }), { status: 400 })
    }

    const events = await sql`
      SELECT *
      FROM timeline_events
      WHERE client_id = ${clientId}
      ORDER BY created_at DESC
      LIMIT 50
    `

    return Response.json({ events })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}

export default optionalAuth(handler)
