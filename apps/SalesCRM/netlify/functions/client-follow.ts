import { getDb } from '../utils/db'
import { requiresAuth, type OptionalAuthRequest } from '../utils/auth'

async function handler(req: OptionalAuthRequest) {
  const sql = getDb()
  const url = new URL(req.url)
  const user = req.user!

  // GET /client-follow?clientId=... — check if current user follows this client
  if (req.method === 'GET') {
    const clientId = url.searchParams.get('clientId')
    if (clientId) {
      const rows = await sql`
        SELECT id FROM client_followers
        WHERE user_id = ${user.id}::uuid AND client_id = ${clientId}::uuid
      `
      return Response.json({ following: rows.length > 0 })
    }

    // GET /client-follow?action=list — list all followed clients for current user
    const action = url.searchParams.get('action')
    if (action === 'list') {
      const rows = await sql`
        SELECT c.id, c.name, c.status, cf.created_at as followed_at
        FROM client_followers cf
        JOIN clients c ON c.id = cf.client_id
        WHERE cf.user_id = ${user.id}::uuid
        ORDER BY cf.created_at DESC
      `
      return Response.json({ followedClients: rows })
    }

    return new Response(JSON.stringify({ error: 'clientId or action=list required' }), { status: 400 })
  }

  // POST /client-follow — toggle follow for a client
  if (req.method === 'POST') {
    const body = await req.json() as { client_id: string }
    if (!body.client_id) {
      return new Response(JSON.stringify({ error: 'client_id required' }), { status: 400 })
    }

    // Check if already following
    const existing = await sql`
      SELECT id FROM client_followers
      WHERE user_id = ${user.id}::uuid AND client_id = ${body.client_id}::uuid
    `

    if (existing.length > 0) {
      // Unfollow
      await sql`
        DELETE FROM client_followers
        WHERE user_id = ${user.id}::uuid AND client_id = ${body.client_id}::uuid
      `
      return Response.json({ following: false })
    } else {
      // Follow
      await sql`
        INSERT INTO client_followers (user_id, client_id)
        VALUES (${user.id}::uuid, ${body.client_id}::uuid)
      `
      return Response.json({ following: true })
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}

export default requiresAuth(handler)
