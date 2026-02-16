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
  const personId = pathParts.length >= 4 ? pathParts[3] : null

  // GET /client-people?clientId=...
  if (req.method === 'GET' && !personId) {
    const clientId = url.searchParams.get('clientId')
    if (!clientId) {
      return new Response(JSON.stringify({ error: 'clientId required' }), { status: 400 })
    }

    const people = await sql`
      SELECT i.id, i.name, i.title, i.email, i.phone, ci.role, ci.is_primary
      FROM client_individuals ci
      JOIN individuals i ON ci.individual_id = i.id
      WHERE ci.client_id = ${clientId}
      ORDER BY ci.is_primary DESC, i.name ASC
    `

    return Response.json({ people })
  }

  // POST /client-people — create a new person and associate with client
  if (req.method === 'POST') {
    const body = await req.json() as {
      name: string
      title?: string
      email?: string
      phone?: string
      role?: string
      client_id: string
      is_primary?: boolean
    }

    // Create the individual
    const individualRows = await sql`
      INSERT INTO individuals (name, title, email, phone)
      VALUES (${body.name}, ${body.title ?? null}, ${body.email ?? null}, ${body.phone ?? null})
      RETURNING *
    `

    const individual = individualRows[0]

    // Create the client-individual association
    await sql`
      INSERT INTO client_individuals (client_id, individual_id, role, is_primary)
      VALUES (${body.client_id}, ${individual.id}, ${body.role ?? null}, ${body.is_primary ?? false})
    `

    // Create timeline event
    await sql`
      INSERT INTO timeline_events (client_id, event_type, description, user_name, related_entity_id, related_entity_type)
      VALUES (${body.client_id}, 'contact_added', ${'Contact Added: \'' + body.name + '\''}, ${req.user.name}, ${individual.id}, 'individual')
    `

    return Response.json({
      id: individual.id,
      name: individual.name,
      title: individual.title,
      email: individual.email,
      phone: individual.phone,
      role: body.role ?? null,
      is_primary: body.is_primary ?? false,
    }, { status: 201 })
  }

  // DELETE /client-people/:personId?clientId=...
  if (req.method === 'DELETE' && personId) {
    const clientId = url.searchParams.get('clientId')
    if (clientId) {
      // Remove only the association
      await sql`DELETE FROM client_individuals WHERE client_id = ${clientId} AND individual_id = ${personId}`
    }
    return Response.json({ success: true })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}

export default requiresAuth(handler)
