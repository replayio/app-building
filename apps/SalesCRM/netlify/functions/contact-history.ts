import { getDb, query, queryOne, jsonResponse, errorResponse } from "./_db.js";
import { withAuth } from "./_auth-middleware.js";

async function handler(authReq: { req: Request; user: { id: string; name: string; email: string } | null }): Promise<Response> {
  const { req } = authReq;

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const sql = getDb();
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const subPath = segments[3] || null;

  // GET /.netlify/functions/contact-history?individualId=<id> — history for an individual
  if (req.method === "GET" && !subPath) {
    const individualId = url.searchParams.get("individualId");
    if (!individualId) {
      return errorResponse(400, "individualId query param required");
    }

    const rows = await query<{
      id: string;
      individual_id: string;
      type: string;
      summary: string;
      contact_date: string;
      performed_by: string;
      created_at: string;
    }>(
      sql,
      `SELECT id, individual_id, type, summary, contact_date, performed_by, created_at
       FROM contact_history
       WHERE individual_id = $1
       ORDER BY contact_date DESC`,
      [individualId]
    );

    return jsonResponse(
      rows.map((r) => ({
        id: r.id,
        individualId: r.individual_id,
        type: r.type,
        summary: r.summary,
        contactDate: r.contact_date,
        performedBy: r.performed_by,
        createdAt: r.created_at,
      }))
    );
  }

  // POST /.netlify/functions/contact-history — create contact history entry
  if (req.method === "POST" && !subPath) {
    let body: {
      individualId?: string;
      type?: string;
      summary?: string;
      contactDate?: string;
      performedBy?: string;
    };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    if (!body.individualId || !body.type?.trim() || !body.summary?.trim()) {
      return errorResponse(400, "individualId, type, and summary are required");
    }

    const created = await query<{
      id: string;
      individual_id: string;
      type: string;
      summary: string;
      contact_date: string;
      performed_by: string;
      created_at: string;
    }>(
      sql,
      `INSERT INTO contact_history (individual_id, type, summary, contact_date, performed_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        body.individualId,
        body.type.trim(),
        body.summary.trim(),
        body.contactDate || new Date().toISOString(),
        body.performedBy || "System",
      ]
    );

    const r = created[0];
    return jsonResponse(
      {
        id: r.id,
        individualId: r.individual_id,
        type: r.type,
        summary: r.summary,
        contactDate: r.contact_date,
        performedBy: r.performed_by,
        createdAt: r.created_at,
      },
      201
    );
  }

  // PUT /.netlify/functions/contact-history/<id> — update contact history entry
  if (req.method === "PUT" && subPath) {
    let body: {
      type?: string;
      summary?: string;
      contactDate?: string;
      performedBy?: string;
    };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    const existing = await queryOne<{ id: string }>(
      sql,
      "SELECT id FROM contact_history WHERE id = $1",
      [subPath]
    );
    if (!existing) {
      return errorResponse(404, "Contact history entry not found");
    }

    const updated = await query<{
      id: string;
      individual_id: string;
      type: string;
      summary: string;
      contact_date: string;
      performed_by: string;
      created_at: string;
    }>(
      sql,
      `UPDATE contact_history SET
        type = COALESCE($2, type),
        summary = COALESCE($3, summary),
        contact_date = COALESCE($4, contact_date),
        performed_by = COALESCE($5, performed_by)
       WHERE id = $1
       RETURNING *`,
      [
        subPath,
        body.type || null,
        body.summary || null,
        body.contactDate || null,
        body.performedBy || null,
      ]
    );

    const r = updated[0];
    return jsonResponse({
      id: r.id,
      individualId: r.individual_id,
      type: r.type,
      summary: r.summary,
      contactDate: r.contact_date,
      performedBy: r.performed_by,
      createdAt: r.created_at,
    });
  }

  return errorResponse(405, "Method not allowed");
}

export default withAuth(handler);
