import { getDb } from '../utils/db'
import { optionalAuth, type OptionalAuthRequest } from '../utils/auth'

interface IndividualRow {
  id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  location: string | null
  created_at: string
  updated_at: string
}

interface ClientAssociationRow {
  client_id: string
  client_name: string
  client_status: string
  industry: string | null
  role: string | null
}

interface RelationshipRow {
  id: string
  related_individual_id: string
  related_individual_name: string
  relationship_type: string
  role: string | null
  company: string | null
}

interface ContactHistoryRow {
  id: string
  individual_id: string
  date: string
  type: string
  summary: string
  team_member: string | null
  created_at: string
  updated_at: string
}

async function handler(req: OptionalAuthRequest) {
  const sql = getDb()
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  // Path: /.netlify/functions/individuals/:individualId/:subResource/:subId
  const individualId = pathParts.length >= 4 ? pathParts[3] : null
  const subResource = pathParts.length >= 5 ? pathParts[4] : null
  const subId = pathParts.length >= 6 ? pathParts[5] : null

  // POST /individuals?action=import (bulk CSV import)
  if (req.method === 'POST' && !individualId && url.searchParams.get('action') === 'import') {
    const body = await req.json() as {
      contacts: Array<{
        name: string
        title?: string
        email?: string
        phone?: string
        location?: string
        client_name?: string
      }>
    }

    const results = { imported: 0, errors: [] as string[] }

    for (let i = 0; i < body.contacts.length; i++) {
      const row = body.contacts[i]
      if (!row.name?.trim()) {
        results.errors.push(`Row ${i + 1}: Name is required`)
        continue
      }
      try {
        const individualRows = await sql`
          INSERT INTO individuals (name, title, email, phone, location)
          VALUES (${row.name.trim()}, ${row.title?.trim() || null}, ${row.email?.trim() || null}, ${row.phone?.trim() || null}, ${row.location?.trim() || null})
          RETURNING id
        `
        const individualId = individualRows[0].id
        // Associate with client if client_name provided
        if (row.client_name?.trim()) {
          const clientRows = await sql`SELECT id FROM clients WHERE LOWER(name) = LOWER(${row.client_name.trim()}) LIMIT 1`
          if (clientRows.length > 0) {
            await sql`
              INSERT INTO client_individuals (client_id, individual_id)
              VALUES (${clientRows[0].id}::uuid, ${individualId}::uuid)
            `
          } else {
            results.errors.push(`Row ${i + 1}: Contact imported but client "${row.client_name.trim()}" not found — not associated`)
          }
        }
        results.imported++
      } catch (err) {
        results.errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : 'Database error'}`)
      }
    }

    return Response.json(results, { status: 200 })
  }

  // GET /individuals — list/search all individuals
  if (req.method === 'GET' && !individualId) {
    const search = url.searchParams.get('search') ?? ''
    const searchPattern = search ? '%' + search + '%' : null
    const rows = await sql`
      SELECT id, name, title FROM individuals
      WHERE (${searchPattern}::text IS NULL OR name ILIKE ${searchPattern})
      ORDER BY name ASC
      LIMIT 50
    ` as { id: string; name: string; title: string | null }[]
    return Response.json({ individuals: rows })
  }

  // GET /individuals/:id — fetch individual with associations, relationships, and contact history
  if (req.method === 'GET' && individualId && !subResource) {
    const rows = await sql`
      SELECT * FROM individuals WHERE id = ${individualId}
    ` as IndividualRow[]

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Individual not found' }), { status: 404 })
    }

    const individual = rows[0]

    // Fetch client associations
    const clientAssociations = await sql`
      SELECT ci.client_id, c.name AS client_name, c.status AS client_status, ci.industry, ci.role
      FROM client_individuals ci
      JOIN clients c ON ci.client_id = c.id
      WHERE ci.individual_id = ${individualId}
      ORDER BY c.name ASC
    ` as ClientAssociationRow[]

    // Fetch relationships
    const relationships = await sql`
      SELECT ir.id, ir.related_individual_id, i.name AS related_individual_name,
             ir.relationship_type, ci.role, ci.industry AS company
      FROM individual_relationships ir
      JOIN individuals i ON ir.related_individual_id = i.id
      LEFT JOIN client_individuals ci ON ci.individual_id = ir.related_individual_id
        AND ci.client_id = (
          SELECT ci2.client_id FROM client_individuals ci2
          WHERE ci2.individual_id = ${individualId} LIMIT 1
        )
      WHERE ir.individual_id = ${individualId}
      ORDER BY i.name ASC
    ` as RelationshipRow[]

    // Fetch contact history
    const contactHistory = await sql`
      SELECT * FROM contact_history
      WHERE individual_id = ${individualId}
      ORDER BY date DESC
    ` as ContactHistoryRow[]

    return Response.json({
      ...individual,
      client_associations: clientAssociations,
      relationships,
      contact_history: contactHistory,
    })
  }

  // PUT /individuals/:id — update individual info
  if (req.method === 'PUT' && individualId && !subResource) {
    const body = await req.json() as Partial<{
      name: string
      title: string
      email: string
      phone: string
      location: string
    }>

    const rows = await sql`
      UPDATE individuals SET
        name = COALESCE(${body.name ?? null}, name),
        title = COALESCE(${body.title ?? null}, title),
        email = COALESCE(${body.email ?? null}, email),
        phone = COALESCE(${body.phone ?? null}, phone),
        location = COALESCE(${body.location ?? null}, location),
        updated_at = NOW()
      WHERE id = ${individualId}
      RETURNING *
    ` as IndividualRow[]

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Individual not found' }), { status: 404 })
    }

    return Response.json(rows[0])
  }

  // POST /individuals/:id/relationships — add a relationship
  if (req.method === 'POST' && individualId && subResource === 'relationships') {
    const body = await req.json() as {
      related_individual_id: string
      relationship_type: string
    }

    const rows = await sql`
      INSERT INTO individual_relationships (individual_id, related_individual_id, relationship_type)
      VALUES (${individualId}, ${body.related_individual_id}, ${body.relationship_type})
      RETURNING *
    `

    return Response.json(rows[0], { status: 201 })
  }

  // DELETE /individuals/:id/relationships/:relId — delete a relationship
  if (req.method === 'DELETE' && individualId && subResource === 'relationships' && subId) {
    await sql`DELETE FROM individual_relationships WHERE id = ${subId} AND individual_id = ${individualId}`
    return Response.json({ success: true })
  }

  // POST /individuals/:id/contact-history — add a contact history entry
  if (req.method === 'POST' && individualId && subResource === 'contact-history') {
    const body = await req.json() as {
      date: string
      type: string
      summary: string
      team_member: string
    }

    const rows = await sql`
      INSERT INTO contact_history (individual_id, date, type, summary, team_member)
      VALUES (${individualId}, ${body.date || null}, ${body.type}, ${body.summary}, ${body.team_member || null})
      RETURNING *
    ` as ContactHistoryRow[]

    return Response.json(rows[0], { status: 201 })
  }

  // PUT /individuals/:id/contact-history/:entryId — update a contact history entry
  if (req.method === 'PUT' && individualId && subResource === 'contact-history' && subId) {
    const body = await req.json() as Partial<{
      date: string
      type: string
      summary: string
      team_member: string
    }>

    const rows = await sql`
      UPDATE contact_history SET
        date = COALESCE(${body.date || null}, date),
        type = COALESCE(${body.type ?? null}, type),
        summary = COALESCE(${body.summary ?? null}, summary),
        team_member = COALESCE(${body.team_member ?? null}, team_member),
        updated_at = NOW()
      WHERE id = ${subId} AND individual_id = ${individualId}
      RETURNING *
    ` as ContactHistoryRow[]

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Entry not found' }), { status: 404 })
    }

    return Response.json(rows[0])
  }

  // DELETE /individuals/:id/contact-history/:entryId — delete a contact history entry
  if (req.method === 'DELETE' && individualId && subResource === 'contact-history' && subId) {
    await sql`DELETE FROM contact_history WHERE id = ${subId} AND individual_id = ${individualId}`
    return Response.json({ success: true })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}

export default optionalAuth(handler)
