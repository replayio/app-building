import { getDb, query, jsonResponse, errorResponse } from "@shared/backend/db";
import { withAuth } from "@shared/backend/auth-middleware";

async function handler(authReq: { req: Request; user: { id: string; name: string; email: string } | null }): Promise<Response> {
  const { req, user } = authReq;

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

  // GET /.netlify/functions/deals?clientId=<id> — deals for a client
  if (req.method === "GET" && !subPath) {
    const clientId = url.searchParams.get("clientId");
    if (!clientId) {
      return errorResponse(400, "clientId query param required");
    }

    const deals = await query<{
      id: string;
      name: string;
      client_id: string;
      value: string | null;
      stage: string;
      owner_id: string | null;
      probability: number | null;
      expected_close_date: string | null;
      status: string;
      created_at: string;
      updated_at: string;
      owner_name: string | null;
    }>(
      sql,
      `SELECT d.*, u.name AS owner_name
       FROM deals d
       LEFT JOIN users u ON u.id = d.owner_id
       WHERE d.client_id = $1
       ORDER BY d.created_at DESC`,
      [clientId]
    );

    return jsonResponse(
      deals.map((d) => ({
        id: d.id,
        name: d.name,
        clientId: d.client_id,
        value: d.value ? parseFloat(d.value) : null,
        stage: d.stage,
        ownerId: d.owner_id,
        ownerName: d.owner_name,
        probability: d.probability,
        expectedCloseDate: d.expected_close_date,
        status: d.status,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }))
    );
  }

  // POST /.netlify/functions/deals — create deal
  if (req.method === "POST" && !subPath) {
    let body: {
      name?: string;
      clientId?: string;
      value?: number;
      stage?: string;
      ownerId?: string;
      probability?: number;
      expectedCloseDate?: string;
    };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    if (!body.name?.trim()) {
      return errorResponse(400, "Deal name is required");
    }
    if (!body.clientId) {
      return errorResponse(400, "Client ID is required");
    }

    const created = await query<{
      id: string;
      name: string;
      client_id: string;
      value: string | null;
      stage: string;
      owner_id: string | null;
      probability: number | null;
      expected_close_date: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }>(
      sql,
      `INSERT INTO deals (name, client_id, value, stage, owner_id, probability, expected_close_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        body.name.trim(),
        body.clientId,
        body.value ?? null,
        body.stage || "Lead",
        body.ownerId || null,
        body.probability ?? null,
        body.expectedCloseDate || null,
      ]
    );

    const d = created[0];
    const actor = user ? user.name : "System";

    // Create timeline event
    await query(
      sql,
      `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [body.clientId, "Deal Created", `Deal Created: '${body.name.trim()}'`, "deal", d.id, actor]
    );

    // Create deal history entry
    await query(
      sql,
      `INSERT INTO deal_history (deal_id, new_stage, changed_by)
       VALUES ($1, $2, $3)`,
      [d.id, d.stage, actor]
    );

    let ownerName: string | null = null;
    if (d.owner_id) {
      const ownerRow = await query<{ name: string }>(sql, "SELECT name FROM users WHERE id = $1", [d.owner_id]);
      ownerName = ownerRow[0]?.name || null;
    }

    return jsonResponse(
      {
        id: d.id,
        name: d.name,
        clientId: d.client_id,
        value: d.value ? parseFloat(d.value) : null,
        stage: d.stage,
        ownerId: d.owner_id,
        ownerName,
        probability: d.probability,
        expectedCloseDate: d.expected_close_date,
        status: d.status,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      },
      201
    );
  }

  return errorResponse(405, "Method not allowed");
}

export default withAuth(handler);
