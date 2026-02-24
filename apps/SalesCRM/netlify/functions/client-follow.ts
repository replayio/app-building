import type { Context } from '@netlify/functions'
import { neon } from '@neondatabase/serverless'
import * as jose from 'jose'

async function getUserFromToken(req: Request): Promise<{ id: string; email: string; name: string } | null> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  const secret = process.env.JWT_SECRET || 'dev-secret'

  try {
    const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(secret))
    return payload as unknown as { id: string; email: string; name: string }
  } catch {
    return null
  }
}

export default async function handler(req: Request, _context: Context) {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    return Response.json({ error: 'Database not configured' }, { status: 500 })
  }

  const sql = neon(databaseUrl)
  const url = new URL(req.url)

  const user = await getUserFromToken(req)
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (req.method === 'GET') {
    const clientId = url.searchParams.get('client_id')
    if (!clientId) {
      return Response.json({ error: 'client_id required' }, { status: 400 })
    }

    const rows = await sql`
      SELECT id FROM client_followers
      WHERE client_id = ${clientId} AND user_id = ${user.id}
    `

    return Response.json({ following: rows.length > 0 })
  }

  if (req.method === 'POST') {
    const body = await req.json()
    const { client_id } = body as { client_id?: string }

    if (!client_id) {
      return Response.json({ error: 'client_id required' }, { status: 400 })
    }

    // Check if already following
    const existing = await sql`
      SELECT id FROM client_followers
      WHERE client_id = ${client_id} AND user_id = ${user.id}
    `

    if (existing.length > 0) {
      // Unfollow
      await sql`
        DELETE FROM client_followers
        WHERE client_id = ${client_id} AND user_id = ${user.id}
      `
      return Response.json({ following: false })
    } else {
      // Follow
      await sql`
        INSERT INTO client_followers (client_id, user_id)
        VALUES (${client_id}, ${user.id})
      `
      return Response.json({ following: true })
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
