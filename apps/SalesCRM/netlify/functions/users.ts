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

  // GET /.netlify/functions/users/<id> — single user with stats, deals, tasks, activity
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

    // Fetch owned deals
    const ownedDeals = await query<{
      id: string;
      name: string;
      client_id: string;
      client_name: string | null;
      value: string | null;
      stage: string;
      status: string;
      created_at: string;
    }>(
      sql,
      `SELECT d.id, d.name, d.client_id, c.name AS client_name, d.value, d.stage, d.status, d.created_at
       FROM deals d
       LEFT JOIN clients c ON c.id = d.client_id
       WHERE d.owner_id = $1
       ORDER BY d.created_at DESC`,
      [subPath]
    );

    // Fetch assigned tasks
    const assignedTasks = await query<{
      id: string;
      title: string;
      due_date: string | null;
      priority: string;
      status: string;
      client_id: string | null;
      client_name: string | null;
      created_at: string;
    }>(
      sql,
      `SELECT t.id, t.title, t.due_date, t.priority, t.status, t.client_id, c.name AS client_name, t.created_at
       FROM tasks t
       LEFT JOIN clients c ON c.id = t.client_id
       WHERE t.assignee_id = $1
       ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC`,
      [subPath]
    );

    // Fetch recent activity: combine timeline events created by this user with deal history and task updates
    const activity = await query<{
      id: string;
      event_type: string;
      description: string;
      created_at: string;
    }>(
      sql,
      `(SELECT te.id, te.event_type, te.description, te.created_at
        FROM timeline_events te
        WHERE te.created_by = $1
        ORDER BY te.created_at DESC
        LIMIT 20)
       UNION ALL
       (SELECT dh.id, 'Deal Stage Change' AS event_type,
        CONCAT('Changed deal stage from ''', dh.old_stage, ''' to ''', dh.new_stage, '''') AS description,
        dh.changed_at AS created_at
        FROM deal_history dh
        JOIN deals d ON d.id = dh.deal_id
        WHERE d.owner_id = $2 AND dh.changed_by = $3
        ORDER BY dh.changed_at DESC
        LIMIT 20)
       ORDER BY created_at DESC
       LIMIT 20`,
      [u.name, subPath, u.name]
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
      deals: ownedDeals.map((d) => ({
        id: d.id,
        name: d.name,
        clientId: d.client_id,
        clientName: d.client_name,
        value: d.value ? parseFloat(d.value) : null,
        stage: d.stage,
        status: d.status,
        createdAt: d.created_at,
      })),
      tasks: assignedTasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.due_date,
        priority: t.priority,
        status: t.status,
        clientId: t.client_id,
        clientName: t.client_name,
        createdAt: t.created_at,
      })),
      activity: activity.map((a) => ({
        id: a.id,
        eventType: a.event_type,
        description: a.description,
        createdAt: a.created_at,
      })),
    });
  }

  return errorResponse(405, "Method not allowed");
}
