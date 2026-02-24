import type { Context } from '@netlify/functions'
import { neon } from '@neondatabase/serverless'

export default async function handler(req: Request, _context: Context) {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    return Response.json({ error: 'Database not configured' }, { status: 500 })
  }

  const sql = neon(databaseUrl)
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const resourceId = segments[3] || null

  if (req.method === 'POST') {
    const body = await req.json()
    const { individual_id, related_individual_id, relationship_type } = body as {
      individual_id?: string
      related_individual_id?: string
      relationship_type?: string
    }

    if (!individual_id || !related_individual_id || !relationship_type?.trim()) {
      return Response.json({ error: 'individual_id, related_individual_id, and relationship_type are required' }, { status: 400 })
    }

    if (individual_id === related_individual_id) {
      return Response.json({ error: 'Cannot create relationship with self' }, { status: 400 })
    }

    // Create both directions of the relationship
    await sql`
      INSERT INTO individual_relationships (individual_id, related_individual_id, relationship_type)
      VALUES (${individual_id}, ${related_individual_id}, ${relationship_type.trim()})
      ON CONFLICT (individual_id, related_individual_id) DO UPDATE SET relationship_type = ${relationship_type.trim()}
    `

    await sql`
      INSERT INTO individual_relationships (individual_id, related_individual_id, relationship_type)
      VALUES (${related_individual_id}, ${individual_id}, ${relationship_type.trim()})
      ON CONFLICT (individual_id, related_individual_id) DO UPDATE SET relationship_type = ${relationship_type.trim()}
    `

    return Response.json({ success: true }, { status: 201 })
  }

  if (req.method === 'DELETE') {
    if (!resourceId) {
      return Response.json({ error: 'Relationship ID required' }, { status: 400 })
    }

    // Find the relationship to get both sides
    const existing = await sql`SELECT * FROM individual_relationships WHERE id = ${resourceId}`
    if (existing.length === 0) {
      return Response.json({ error: 'Relationship not found' }, { status: 404 })
    }

    const rel = existing[0]

    // Delete both directions
    await sql`DELETE FROM individual_relationships WHERE id = ${resourceId}`
    await sql`
      DELETE FROM individual_relationships
      WHERE individual_id = ${rel.related_individual_id}
        AND related_individual_id = ${rel.individual_id}
    `

    return Response.json({ success: true })
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
