import { getDb, query, queryOne, jsonResponse, errorResponse } from "@shared/backend/db";
import { withAuth } from "@shared/backend/auth-middleware";

async function handler(authReq: { req: Request; user: { id: string; name: string; email: string } | null }): Promise<Response> {
  const { req, user } = authReq;

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

  // GET /.netlify/functions/tasks?clientId=<id> — tasks for a client
  if (req.method === "GET" && !subPath) {
    const clientId = url.searchParams.get("clientId");
    if (!clientId) {
      return errorResponse(400, "clientId query param required");
    }

    const tasks = await query<{
      id: string;
      title: string;
      description: string | null;
      due_date: string | null;
      priority: string;
      status: string;
      client_id: string | null;
      deal_id: string | null;
      assignee_id: string | null;
      created_at: string;
      updated_at: string;
      deal_name: string | null;
      assignee_name: string | null;
    }>(
      sql,
      `SELECT t.*, d.name AS deal_name, u.name AS assignee_name
       FROM tasks t
       LEFT JOIN deals d ON d.id = t.deal_id
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.client_id = $1
       ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC`,
      [clientId]
    );

    return jsonResponse(
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.due_date,
        priority: t.priority,
        status: t.status,
        clientId: t.client_id,
        dealId: t.deal_id,
        dealName: t.deal_name,
        assigneeId: t.assignee_id,
        assigneeName: t.assignee_name,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }))
    );
  }

  // POST /.netlify/functions/tasks — create task
  if (req.method === "POST" && !subPath) {
    let body: {
      title?: string;
      description?: string;
      dueDate?: string;
      priority?: string;
      clientId?: string;
      dealId?: string;
      assigneeId?: string;
    };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    if (!body.title?.trim()) {
      return errorResponse(400, "Title is required");
    }

    const created = await query<{
      id: string;
      title: string;
      description: string | null;
      due_date: string | null;
      priority: string;
      status: string;
      client_id: string | null;
      deal_id: string | null;
      assignee_id: string | null;
      created_at: string;
      updated_at: string;
    }>(
      sql,
      `INSERT INTO tasks (title, description, due_date, priority, client_id, deal_id, assignee_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        body.title.trim(),
        body.description || null,
        body.dueDate || null,
        body.priority || "medium",
        body.clientId || null,
        body.dealId || null,
        body.assigneeId || null,
      ]
    );

    const t = created[0];
    const actor = user ? user.name : "System";

    // Create timeline event
    if (body.clientId) {
      await query(
        sql,
        `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [body.clientId, "Task Created", `Task Created: '${body.title.trim()}'`, "task", t.id, actor]
      );
    }

    // Look up deal name if deal_id is set
    let dealName: string | null = null;
    if (t.deal_id) {
      const deal = await queryOne<{ name: string }>(sql, "SELECT name FROM deals WHERE id = $1", [t.deal_id]);
      dealName = deal?.name || null;
    }

    let assigneeName: string | null = null;
    if (t.assignee_id) {
      const assignee = await queryOne<{ name: string }>(sql, "SELECT name FROM users WHERE id = $1", [t.assignee_id]);
      assigneeName = assignee?.name || null;
    }

    return jsonResponse(
      {
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.due_date,
        priority: t.priority,
        status: t.status,
        clientId: t.client_id,
        dealId: t.deal_id,
        dealName,
        assigneeId: t.assignee_id,
        assigneeName,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      },
      201
    );
  }

  // PUT /.netlify/functions/tasks/<id> — update task (e.g., mark complete)
  if (req.method === "PUT" && subPath) {
    let body: { status?: string };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    const existing = await queryOne<{ id: string; title: string; client_id: string | null }>(
      sql,
      "SELECT id, title, client_id FROM tasks WHERE id = $1",
      [subPath]
    );
    if (!existing) {
      return errorResponse(404, "Task not found");
    }

    await query(
      sql,
      "UPDATE tasks SET status = COALESCE($2, status), updated_at = NOW() WHERE id = $1",
      [subPath, body.status || null]
    );

    const actor = user ? user.name : "System";

    // Create timeline event for completion
    if (body.status === "completed" && existing.client_id) {
      await query(
        sql,
        `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [existing.client_id, "Task Completed", `Task Completed: '${existing.title}'`, "task", existing.id, actor]
      );
    }

    return jsonResponse({ success: true });
  }

  return errorResponse(405, "Method not allowed");
}

export default withAuth(handler);
