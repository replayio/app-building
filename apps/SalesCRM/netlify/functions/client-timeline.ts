import { neon } from '@neondatabase/serverless'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

export default async function handler(req: Request) {
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
