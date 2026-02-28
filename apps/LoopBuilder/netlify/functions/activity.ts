import type { Context } from '@netlify/functions'
import { neon } from '@neondatabase/serverless'

export default async (request: Request, context: Context) => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const sql = neon(process.env.DATABASE_URL!)
  const segments = context.url.pathname.split('/').filter(Boolean)
  const appId = segments[3]

  if (!appId) {
    return new Response(JSON.stringify({ error: 'App ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rows = await sql`
    SELECT * FROM activity_log
    WHERE app_id = ${appId}
    ORDER BY timestamp DESC
  `
  return new Response(JSON.stringify(rows), {
    headers: { 'Content-Type': 'application/json' },
  })
}
