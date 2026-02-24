import { neon } from '@neondatabase/serverless'

interface HandlerEvent {
  httpMethod: string
  path: string
  queryStringParameters: Record<string, string> | null
  body: string | null
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
    body: JSON.stringify(body),
  }
}

type SqlFn = ReturnType<typeof neon>

export const handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  const sql = neon(process.env.DATABASE_URL!)
  const segments = event.path.split('/').filter(Boolean)
  const resourceId = segments[3] || null
  const subResource = segments[4] || null

  try {
    if (event.httpMethod === 'GET') {
      if (resourceId) {
        if (subResource === 'relationships') {
          return await handleGetRelationships(sql, resourceId)
        }
        if (subResource === 'contact-history') {
          return await handleGetContactHistory(sql, resourceId)
        }
        if (subResource === 'clients') {
          return await handleGetAssociatedClients(sql, resourceId)
        }
        return await handleGetIndividual(sql, resourceId)
      }
      return await handleListIndividuals(sql, event.queryStringParameters)
    }

    if (event.httpMethod === 'POST') {
      if (resourceId && subResource === 'relationships') {
        return await handleCreateRelationship(sql, resourceId, event.body)
      }
      if (resourceId && subResource === 'contact-history') {
        return await handleCreateContactHistory(sql, resourceId, event.body)
      }
      return json(400, { error: 'Invalid endpoint' })
    }

    if (event.httpMethod === 'PUT') {
      if (resourceId && subResource === 'contact-history') {
        const entryId = segments[5] || null
        if (!entryId) return json(400, { error: 'Entry ID required' })
        return await handleUpdateContactHistory(sql, entryId, event.body)
      }
      return json(400, { error: 'Invalid endpoint' })
    }

    if (event.httpMethod === 'DELETE') {
      if (resourceId && subResource === 'relationships') {
        const relId = segments[5] || null
        if (!relId) return json(400, { error: 'Relationship ID required' })
        return await handleDeleteRelationship(sql, relId)
      }
      return json(400, { error: 'Invalid endpoint' })
    }

    return json(405, { error: 'Method not allowed' })
  } catch (err: unknown) {
    console.error('Error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return json(500, { error: message })
  }
}

async function handleGetIndividual(sql: SqlFn, id: string) {
  const rows = await sql`
    SELECT i.*,
      (
        SELECT COALESCE(json_agg(json_build_object(
          'client_id', c.id,
          'client_name', c.name,
          'role', ci.role,
          'is_primary', ci.is_primary
        )), '[]'::json)
        FROM client_individuals ci
        JOIN clients c ON ci.client_id = c.id
        WHERE ci.individual_id = i.id
      ) as associated_clients
    FROM individuals i
    WHERE i.id = ${id}
  `
  if (!rows.length) return json(404, { error: 'Not found' })
  return json(200, rows[0])
}

async function handleListIndividuals(sql: SqlFn, params?: Record<string, string> | null) {
  const search = params?.search || ''
  const searchPattern = search ? `%${search}%` : ''

  const rows = searchPattern
    ? await sql`
      SELECT i.id, i.name, i.title, i.email
      FROM individuals i
      WHERE i.name ILIKE ${searchPattern} OR i.email ILIKE ${searchPattern}
      ORDER BY i.name
      LIMIT 50
    `
    : await sql`
      SELECT i.id, i.name, i.title, i.email
      FROM individuals i
      ORDER BY i.name
      LIMIT 50
    `

  return json(200, { individuals: rows })
}

async function handleGetRelationships(sql: SqlFn, individualId: string) {
  const rows = await sql`
    SELECT r.id, r.relationship_type,
      ri.id as related_id, ri.name as related_name, ri.title as related_title,
      (
        SELECT c.name FROM client_individuals ci
        JOIN clients c ON ci.client_id = c.id
        WHERE ci.individual_id = ri.id
        LIMIT 1
      ) as related_client_name
    FROM relationships r
    JOIN individuals ri ON r.related_individual_id = ri.id
    WHERE r.individual_id = ${individualId}
    ORDER BY ri.name
  `
  return json(200, { relationships: rows })
}

async function handleCreateRelationship(sql: SqlFn, individualId: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { related_individual_id, relationship_type } = data
  if (!related_individual_id) return json(400, { error: 'Related person is required' })
  if (!relationship_type) return json(400, { error: 'Relationship type is required' })

  const result = await sql`
    INSERT INTO relationships (individual_id, related_individual_id, relationship_type)
    VALUES (${individualId}, ${related_individual_id}, ${relationship_type})
    RETURNING *
  `

  // Create reciprocal relationship
  await sql`
    INSERT INTO relationships (individual_id, related_individual_id, relationship_type)
    VALUES (${related_individual_id}, ${individualId}, ${relationship_type})
  `

  const rel = result[0]
  const enriched = await sql`
    SELECT r.id, r.relationship_type,
      ri.id as related_id, ri.name as related_name, ri.title as related_title,
      (
        SELECT c.name FROM client_individuals ci
        JOIN clients c ON ci.client_id = c.id
        WHERE ci.individual_id = ri.id
        LIMIT 1
      ) as related_client_name
    FROM relationships r
    JOIN individuals ri ON r.related_individual_id = ri.id
    WHERE r.id = ${rel.id}
  `

  return json(201, enriched[0])
}

async function handleDeleteRelationship(sql: SqlFn, relationshipId: string) {
  // Get the relationship details before deleting for reciprocal removal
  const rel = await sql`SELECT * FROM relationships WHERE id = ${relationshipId}`
  if (rel.length) {
    const { individual_id, related_individual_id, relationship_type } = rel[0]
    // Delete reciprocal
    await sql`
      DELETE FROM relationships
      WHERE individual_id = ${related_individual_id}
        AND related_individual_id = ${individual_id}
        AND relationship_type = ${relationship_type}
    `
  }
  await sql`DELETE FROM relationships WHERE id = ${relationshipId}`
  return json(200, { deleted: true })
}

async function handleGetContactHistory(sql: SqlFn, individualId: string) {
  const rows = await sql`
    SELECT * FROM contact_history
    WHERE individual_id = ${individualId}
    ORDER BY contact_date DESC
  `
  return json(200, { entries: rows })
}

async function handleCreateContactHistory(sql: SqlFn, individualId: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { interaction_type, summary, team_member, contact_date } = data
  if (!interaction_type) return json(400, { error: 'Interaction type is required' })
  if (!summary) return json(400, { error: 'Summary is required' })

  const result = await sql`
    INSERT INTO contact_history (individual_id, interaction_type, summary, team_member, contact_date)
    VALUES (
      ${individualId},
      ${interaction_type},
      ${summary},
      ${team_member || null},
      ${contact_date || null}
    )
    RETURNING *
  `

  return json(201, result[0])
}

async function handleUpdateContactHistory(sql: SqlFn, entryId: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { interaction_type, summary, team_member, contact_date } = data

  await sql`
    UPDATE contact_history SET
      interaction_type = COALESCE(${interaction_type || null}, interaction_type),
      summary = COALESCE(${summary || null}, summary),
      team_member = COALESCE(${team_member || null}, team_member),
      contact_date = COALESCE(${contact_date || null}, contact_date)
    WHERE id = ${entryId}
  `

  const updated = await sql`SELECT * FROM contact_history WHERE id = ${entryId}`
  if (!updated.length) return json(404, { error: 'Not found' })
  return json(200, updated[0])
}

async function handleGetAssociatedClients(sql: SqlFn, individualId: string) {
  const rows = await sql`
    SELECT c.id, c.name, c.status, c.industry, ci.role
    FROM client_individuals ci
    JOIN clients c ON ci.client_id = c.id
    WHERE ci.individual_id = ${individualId}
    ORDER BY c.name
  `
  return json(200, { clients: rows })
}
