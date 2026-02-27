import { getDb, query, jsonResponse, errorResponse } from "./_db.js";

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const sql = getDb();
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const subPath = segments[3] || null;

  // GET /.netlify/functions/timeline?clientId=<id>
  if (req.method === "GET" && !subPath) {
    const clientId = url.searchParams.get("clientId");
    if (!clientId) {
      return errorResponse(400, "clientId query param required");
    }

    const events = await query<{
      id: string;
      client_id: string | null;
      event_type: string;
      description: string;
      related_entity_type: string | null;
      related_entity_id: string | null;
      created_by: string;
      created_by_user_id: string | null;
      created_at: string;
    }>(
      sql,
      `SELECT * FROM timeline_events
       WHERE client_id = $1
       ORDER BY created_at DESC`,
      [clientId]
    );

    return jsonResponse(
      events.map((e) => ({
        id: e.id,
        clientId: e.client_id,
        eventType: e.event_type,
        description: e.description,
        relatedEntityType: e.related_entity_type,
        relatedEntityId: e.related_entity_id,
        createdBy: e.created_by,
        createdByUserId: e.created_by_user_id,
        createdAt: e.created_at,
      }))
    );
  }

  // POST /.netlify/functions/timeline — create event
  if (req.method === "POST" && !subPath) {
    let body: {
      clientId?: string;
      eventType?: string;
      description?: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
      createdBy?: string;
      createdByUserId?: string;
    };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    if (!body.eventType?.trim() || !body.description?.trim()) {
      return errorResponse(400, "eventType and description are required");
    }

    const created = await query<{
      id: string;
      client_id: string | null;
      event_type: string;
      description: string;
      related_entity_type: string | null;
      related_entity_id: string | null;
      created_by: string;
      created_by_user_id: string | null;
      created_at: string;
    }>(
      sql,
      `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by, created_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        body.clientId || null,
        body.eventType.trim(),
        body.description.trim(),
        body.relatedEntityType || null,
        body.relatedEntityId || null,
        body.createdBy || "System",
        body.createdByUserId || null,
      ]
    );

    const e = created[0];
    return jsonResponse(
      {
        id: e.id,
        clientId: e.client_id,
        eventType: e.event_type,
        description: e.description,
        relatedEntityType: e.related_entity_type,
        relatedEntityId: e.related_entity_id,
        createdBy: e.created_by,
        createdByUserId: e.created_by_user_id,
        createdAt: e.created_at,
      },
      201
    );
  }

  return errorResponse(405, "Method not allowed");
}
