import { getDb, query, jsonResponse, errorResponse } from "./_db.js";

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const sql = getDb();
  const url = new URL(req.url);

  // GET /.netlify/functions/deal-history?dealId=<id>
  if (req.method === "GET") {
    const dealId = url.searchParams.get("dealId");
    if (!dealId) {
      return errorResponse(400, "dealId query param required");
    }

    const history = await query<{
      id: string;
      deal_id: string;
      old_stage: string | null;
      new_stage: string;
      changed_by: string;
      changed_at: string;
    }>(
      sql,
      `SELECT * FROM deal_history
       WHERE deal_id = $1
       ORDER BY changed_at DESC`,
      [dealId]
    );

    return jsonResponse(
      history.map((h) => ({
        id: h.id,
        dealId: h.deal_id,
        oldStage: h.old_stage,
        newStage: h.new_stage,
        changedBy: h.changed_by,
        changedAt: h.changed_at,
      }))
    );
  }

  return errorResponse(405, "Method not allowed");
}
