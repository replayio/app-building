import { getDb, query, queryOne, jsonResponse, errorResponse } from "./_db.js";
import { withAuth } from "./_auth-middleware.js";

async function handler(authReq: { req: Request; user: { id: string; name: string; email: string } | null }): Promise<Response> {
  const { req } = authReq;

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const sql = getDb();
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const subPath = segments[3] || null;

  // GET /.netlify/functions/relationships?individualId=<id> — relationships for an individual
  if (req.method === "GET" && !subPath) {
    const individualId = url.searchParams.get("individualId");
    if (!individualId) {
      return errorResponse(400, "individualId query param required");
    }

    const rows = await query<{
      id: string;
      related_individual_id: string;
      related_individual_name: string;
      relationship_type: string;
      title: string | null;
      created_at: string;
    }>(
      sql,
      `SELECT r.id, r.related_individual_id, i.name AS related_individual_name,
              r.relationship_type, i.title, r.created_at
       FROM relationships r
       JOIN individuals i ON i.id = r.related_individual_id
       WHERE r.individual_id = $1
       ORDER BY r.created_at DESC`,
      [individualId]
    );

    // Fetch organizations for all related individuals
    const relatedIds = rows.map((r) => r.related_individual_id);
    const orgMap = new Map<string, string>();

    if (relatedIds.length > 0) {
      const placeholders = relatedIds.map((_, idx) => `$${idx + 1}`).join(", ");
      const orgs = await query<{
        individual_id: string;
        org_names: string;
      }>(
        sql,
        `SELECT ci.individual_id, STRING_AGG(c.name, ', ' ORDER BY c.name) AS org_names
         FROM client_individuals ci
         JOIN clients c ON c.id = ci.client_id
         WHERE ci.individual_id IN (${placeholders})
         GROUP BY ci.individual_id`,
        relatedIds
      );

      for (const o of orgs) {
        orgMap.set(o.individual_id, o.org_names);
      }
    }

    return jsonResponse(
      rows.map((r) => ({
        id: r.id,
        relatedIndividualId: r.related_individual_id,
        relatedIndividualName: r.related_individual_name,
        relationshipType: r.relationship_type,
        title: r.title,
        organizations: orgMap.get(r.related_individual_id) || null,
        createdAt: r.created_at,
      }))
    );
  }

  // POST /.netlify/functions/relationships — create bidirectional relationship
  if (req.method === "POST" && !subPath) {
    let body: {
      individualId?: string;
      relatedIndividualId?: string;
      relationshipType?: string;
    };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    if (!body.individualId || !body.relatedIndividualId || !body.relationshipType?.trim()) {
      return errorResponse(400, "individualId, relatedIndividualId, and relationshipType are required");
    }

    // Create A -> B
    const created = await query<{
      id: string;
      individual_id: string;
      related_individual_id: string;
      relationship_type: string;
      created_at: string;
    }>(
      sql,
      `INSERT INTO relationships (individual_id, related_individual_id, relationship_type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [body.individualId, body.relatedIndividualId, body.relationshipType.trim()]
    );

    // Create B -> A (reciprocal)
    await query(
      sql,
      `INSERT INTO relationships (individual_id, related_individual_id, relationship_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (individual_id, related_individual_id) DO NOTHING`,
      [body.relatedIndividualId, body.individualId, body.relationshipType.trim()]
    );

    const r = created[0];
    return jsonResponse(
      {
        id: r.id,
        individualId: r.individual_id,
        relatedIndividualId: r.related_individual_id,
        relationshipType: r.relationship_type,
        createdAt: r.created_at,
      },
      201
    );
  }

  // DELETE /.netlify/functions/relationships/<id> — delete relationship and its reciprocal
  if (req.method === "DELETE" && subPath) {
    const existing = await queryOne<{
      id: string;
      individual_id: string;
      related_individual_id: string;
      relationship_type: string;
    }>(sql, "SELECT * FROM relationships WHERE id = $1", [subPath]);

    if (!existing) {
      return errorResponse(404, "Relationship not found");
    }

    // Delete both directions
    await query(
      sql,
      `DELETE FROM relationships
       WHERE (individual_id = $1 AND related_individual_id = $2)
          OR (individual_id = $2 AND related_individual_id = $1)`,
      [existing.individual_id, existing.related_individual_id]
    );

    return jsonResponse({ success: true });
  }

  return errorResponse(405, "Method not allowed");
}

export default withAuth(handler);
