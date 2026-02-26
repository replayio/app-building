import { getDb, query, queryOne, jsonResponse, errorResponse } from "@shared/backend/db";
import { withAuth } from "@shared/backend/auth-middleware";

async function handler(authReq: { req: Request; user: { id: string; name: string; email: string } | null }): Promise<Response> {
  const { req, user } = authReq;

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const sql = getDb();
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const subPath = segments[3] || null;

  // GET /.netlify/functions/tasks — list all tasks or filter by clientId/dealId
  if (req.method === "GET" && !subPath) {
    const clientId = url.searchParams.get("clientId");
    const dealId = url.searchParams.get("dealId");

    let queryText: string;
    let params: unknown[];

    if (dealId) {
      queryText = `SELECT t.*, d.name AS deal_name, c.name AS client_name, u.name AS assignee_name,
                          u.avatar_url AS assignee_avatar,
                          u.role AS assignee_role
         FROM tasks t
         LEFT JOIN deals d ON d.id = t.deal_id
         LEFT JOIN clients c ON c.id = t.client_id
         LEFT JOIN users u ON u.id = t.assignee_id
         WHERE t.deal_id = $1
         ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC`;
      params = [dealId];
    } else if (clientId) {
      queryText = `SELECT t.*, d.name AS deal_name, c.name AS client_name, u.name AS assignee_name,
                          u.avatar_url AS assignee_avatar,
                          u.role AS assignee_role
         FROM tasks t
         LEFT JOIN deals d ON d.id = t.deal_id
         LEFT JOIN clients c ON c.id = t.client_id
         LEFT JOIN users u ON u.id = t.assignee_id
         WHERE t.client_id = $1
         ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC`;
      params = [clientId];
    } else {
      // Return all tasks
      queryText = `SELECT t.*, d.name AS deal_name, c.name AS client_name, u.name AS assignee_name,
                          u.avatar_url AS assignee_avatar,
                          u.role AS assignee_role
         FROM tasks t
         LEFT JOIN deals d ON d.id = t.deal_id
         LEFT JOIN clients c ON c.id = t.client_id
         LEFT JOIN users u ON u.id = t.assignee_id
         ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC`;
      params = [];
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
      client_name: string | null;
      assignee_name: string | null;
      assignee_avatar: string | null;
      assignee_role: string | null;
    }>(sql, queryText, params);

    return jsonResponse(
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.due_date,
        priority: t.priority,
        status: t.status,
        clientId: t.client_id,
        clientName: t.client_name,
        dealId: t.deal_id,
        dealName: t.deal_name,
        assigneeId: t.assignee_id,
        assigneeName: t.assignee_name,
        assigneeAvatar: t.assignee_avatar,
        assigneeRole: t.assignee_role,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }))
    );
  }

  // GET /.netlify/functions/tasks/<id> — get single task
  if (req.method === "GET" && subPath) {
    const task = await queryOne<{
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
      client_name: string | null;
      assignee_name: string | null;
      assignee_avatar: string | null;
      assignee_role: string | null;
    }>(
      sql,
      `SELECT t.*, d.name AS deal_name, c.name AS client_name, u.name AS assignee_name,
              u.avatar_url AS assignee_avatar,
                          u.role AS assignee_role
       FROM tasks t
       LEFT JOIN deals d ON d.id = t.deal_id
       LEFT JOIN clients c ON c.id = t.client_id
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.id = $1`,
      [subPath]
    );

    if (!task) {
      return errorResponse(404, "Task not found");
    }

    return jsonResponse({
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.due_date,
      priority: task.priority,
      status: task.status,
      clientId: task.client_id,
      clientName: task.client_name,
      dealId: task.deal_id,
      dealName: task.deal_name,
      assigneeId: task.assignee_id,
      assigneeName: task.assignee_name,
      assigneeAvatar: task.assignee_avatar,
      assigneeRole: task.assignee_role,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    });
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
    const actorId = user ? user.id : null;

    // Create timeline event
    if (body.clientId) {
      await query(
        sql,
        `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [body.clientId, "Task Created", `Task Created: '${body.title.trim()}'`, "task", t.id, actor, actorId]
      );

      // Send follower notifications for task creation
      try {
        const followers = await query<{ user_id: string; email: string; name: string }>(
          sql,
          `SELECT cf.user_id, u.email, u.name FROM client_followers cf
           JOIN users u ON u.id = cf.user_id
           LEFT JOIN notification_preferences np ON np.user_id = cf.user_id
           WHERE cf.client_id = $1 AND (np.task_created IS NULL OR np.task_created = true)`,
          [body.clientId]
        );

        for (const f of followers) {
          if (f.user_id !== actorId) {
            await query(
              sql,
              `INSERT INTO email_tokens (email, token, type)
               VALUES ($1, $2, 'notification')
               ON CONFLICT DO NOTHING`,
              [f.email, `task-created-${t.id}-${Date.now()}-${f.user_id}`]
            );
          }
        }
      } catch {
        // Notification failure shouldn't block task creation
      }
    }

    // Look up related names
    let dealName: string | null = null;
    if (t.deal_id) {
      const deal = await queryOne<{ name: string }>(sql, "SELECT name FROM deals WHERE id = $1", [t.deal_id]);
      dealName = deal?.name || null;
    }

    let clientName: string | null = null;
    if (t.client_id) {
      const client = await queryOne<{ name: string }>(sql, "SELECT name FROM clients WHERE id = $1", [t.client_id]);
      clientName = client?.name || null;
    }

    let assigneeName: string | null = null;
    let assigneeAvatar: string | null = null;
    let assigneeRole: string | null = null;
    if (t.assignee_id) {
      const assignee = await queryOne<{ name: string; avatar_url: string | null; role: string | null }>(sql, "SELECT name, avatar_url, role FROM users WHERE id = $1", [t.assignee_id]);
      assigneeName = assignee?.name || null;
      assigneeAvatar = assignee?.avatar_url || null;
      assigneeRole = assignee?.role || null;
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
        clientName,
        dealId: t.deal_id,
        dealName,
        assigneeId: t.assignee_id,
        assigneeName,
        assigneeAvatar,
        assigneeRole,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      },
      201
    );
  }

  // PUT /.netlify/functions/tasks/<id> — update task (e.g., mark complete)
  if (req.method === "PUT" && subPath) {
    let body: { status?: string; assigneeId?: string };
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
      "UPDATE tasks SET status = COALESCE($2, status), assignee_id = COALESCE($3, assignee_id), updated_at = NOW() WHERE id = $1",
      [subPath, body.status || null, body.assigneeId !== undefined ? (body.assigneeId || null) : null]
    );

    const actor = user ? user.name : "System";
    const actorId = user ? user.id : null;

    // Create timeline event for completion
    if (body.status === "completed" && existing.client_id) {
      await query(
        sql,
        `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [existing.client_id, "Task Completed", `Task Completed: '${existing.title}'`, "task", existing.id, actor, actorId]
      );

      // Send follower notifications
      try {
        const followers = await query<{ user_id: string; email: string; name: string }>(
          sql,
          `SELECT cf.user_id, u.email, u.name FROM client_followers cf
           JOIN users u ON u.id = cf.user_id
           LEFT JOIN notification_preferences np ON np.user_id = cf.user_id
           WHERE cf.client_id = $1 AND (np.task_completed IS NULL OR np.task_completed = true)`,
          [existing.client_id]
        );

        const actorId = user ? user.id : null;
        for (const f of followers) {
          if (f.user_id !== actorId) {
            await query(
              sql,
              `INSERT INTO email_tokens (email, token, type)
               VALUES ($1, $2, 'notification')
               ON CONFLICT DO NOTHING`,
              [f.email, `task-completed-${existing.id}-${Date.now()}-${f.user_id}`]
            );
          }
        }
      } catch {
        // Notification failure shouldn't block the update
      }
    }

    // Create timeline event for cancellation
    if (body.status === "canceled" && existing.client_id) {
      await query(
        sql,
        `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [existing.client_id, "Task Canceled", `Task Canceled: '${existing.title}'`, "task", existing.id, actor, actorId]
      );

      // Send follower notifications
      try {
        const followers = await query<{ user_id: string; email: string; name: string }>(
          sql,
          `SELECT cf.user_id, u.email, u.name FROM client_followers cf
           JOIN users u ON u.id = cf.user_id
           LEFT JOIN notification_preferences np ON np.user_id = cf.user_id
           WHERE cf.client_id = $1 AND (np.task_canceled IS NULL OR np.task_canceled = true)`,
          [existing.client_id]
        );

        const actorId = user ? user.id : null;
        for (const f of followers) {
          if (f.user_id !== actorId) {
            await query(
              sql,
              `INSERT INTO email_tokens (email, token, type)
               VALUES ($1, $2, 'notification')
               ON CONFLICT DO NOTHING`,
              [f.email, `task-canceled-${existing.id}-${Date.now()}-${f.user_id}`]
            );
          }
        }
      } catch {
        // Notification failure shouldn't block the update
      }
    }

    return jsonResponse({ success: true });
  }

  // DELETE /.netlify/functions/tasks/<id> — delete a task
  if (req.method === "DELETE" && subPath) {
    const existing = await queryOne<{ id: string }>(
      sql,
      "SELECT id FROM tasks WHERE id = $1",
      [subPath]
    );
    if (!existing) {
      return errorResponse(404, "Task not found");
    }

    // Delete associated task notes first
    await query(sql, "DELETE FROM task_notes WHERE task_id = $1", [subPath]);
    await query(sql, "DELETE FROM tasks WHERE id = $1", [subPath]);

    return jsonResponse({ success: true });
  }

  return errorResponse(405, "Method not allowed");
}

export default withAuth(handler);
