import { getDb, query, jsonResponse, errorResponse } from "@shared/backend/db";

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
  const segments = url.pathname.split("/").filter(Boolean);
  const subPath = segments[3] || null;

  // GET /.netlify/functions/users — list all users with stats
  if (req.method === "GET" && !subPath) {
    const users = await query<{
      id: string;
      name: string;
      email: string;
      avatar_url: string | null;
      created_at: string;
      active_deals: string;
      open_tasks: string;
    }>(
      sql,
      `SELECT u.id, u.name, u.email, u.avatar_url, u.created_at,
        COALESCE((SELECT COUNT(*) FILTER (WHERE d.status = 'open') FROM deals d WHERE d.owner_id = u.id), 0)::text AS active_deals,
        COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.assignee_id = u.id AND t.status IN ('open', 'in_progress')), 0)::text AS open_tasks
       FROM users u ORDER BY u.name ASC`
    );

    return jsonResponse(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatar_url,
        createdAt: u.created_at,
        activeDeals: parseInt(u.active_deals || "0", 10),
        openTasks: parseInt(u.open_tasks || "0", 10),
      }))
    );
  }

  // GET /.netlify/functions/users/<id> — single user with stats
  if (req.method === "GET" && subPath) {
    const userRows = await query<{
      id: string;
      name: string;
      email: string;
      avatar_url: string | null;
      created_at: string;
    }>(
      sql,
      "SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1",
      [subPath]
    );

    if (userRows.length === 0) {
      return errorResponse(404, "User not found");
    }

    const u = userRows[0];

    const dealStats = await query<{ active_deals: string; total_deals: string }>(
      sql,
      `SELECT
        COUNT(*) FILTER (WHERE status = 'open')::text AS active_deals,
        COUNT(*)::text AS total_deals
       FROM deals WHERE owner_id = $1`,
      [subPath]
    );

    const taskStats = await query<{ open_tasks: string }>(
      sql,
      `SELECT COUNT(*)::text AS open_tasks
       FROM tasks WHERE assignee_id = $1 AND status IN ('open', 'in_progress')`,
      [subPath]
    );

    return jsonResponse({
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatar_url,
      createdAt: u.created_at,
      activeDeals: parseInt(dealStats[0]?.active_deals || "0", 10),
      totalDeals: parseInt(dealStats[0]?.total_deals || "0", 10),
      openTasks: parseInt(taskStats[0]?.open_tasks || "0", 10),
    });
  }

  return errorResponse(405, "Method not allowed");
}
