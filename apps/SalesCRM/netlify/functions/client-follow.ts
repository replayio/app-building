import { getDb, query, queryOne, jsonResponse, errorResponse } from "@shared/backend/db";
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

  if (!user) {
    return errorResponse(401, "Authentication required");
  }

  const sql = getDb();
  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");

  if (!clientId) {
    return errorResponse(400, "clientId query param required");
  }

  // GET /.netlify/functions/client-follow?clientId=<id>
  if (req.method === "GET") {
    const follow = await queryOne<{ id: string }>(
      sql,
      "SELECT id FROM client_followers WHERE user_id = $1 AND client_id = $2",
      [user.id, clientId]
    );

    return jsonResponse({ following: !!follow });
  }

  // POST /.netlify/functions/client-follow?clientId=<id> — toggle follow
  if (req.method === "POST") {
    const existing = await queryOne<{ id: string }>(
      sql,
      "SELECT id FROM client_followers WHERE user_id = $1 AND client_id = $2",
      [user.id, clientId]
    );

    if (existing) {
      await query(sql, "DELETE FROM client_followers WHERE id = $1", [existing.id]);
      return jsonResponse({ following: false });
    } else {
      await query(
        sql,
        "INSERT INTO client_followers (user_id, client_id) VALUES ($1, $2)",
        [user.id, clientId]
      );
      return jsonResponse({ following: true });
    }
  }

  return errorResponse(405, "Method not allowed");
}

export default withAuth(handler, { required: true });
