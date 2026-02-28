import type { Context } from '@netlify/functions'
import { neon } from '@neondatabase/serverless'

export default async (request: Request, context: Context) => {
  const sql = neon(process.env.DATABASE_URL!)
  const segments = context.url.pathname.split('/').filter(Boolean)
  const appId = segments[3]

  if (request.method === 'GET') {
    if (appId) {
      const rows = await sql`SELECT * FROM apps WHERE id = ${appId}`
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: 'App not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return new Response(JSON.stringify(rows[0]), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const rows = await sql`SELECT * FROM apps ORDER BY created_at DESC`
    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  })
}
