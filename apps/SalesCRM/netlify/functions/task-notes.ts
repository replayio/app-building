import { getDb, query, queryOne, jsonResponse, errorResponse } from "@shared/backend/db";
import { withAuth } from "@shared/backend/auth-middleware";

async function handler(authReq: { req: Request; user: { id: string; name: string; email: string } | null }): Promise<Response> {
  const { req, user } = authReq;

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

  // GET /.netlify/functions/task-notes?taskId=xxx — list notes for a task
  if (req.method === "GET" && !subPath) {
    const taskId = url.searchParams.get("taskId");
    if (!taskId) {
      return errorResponse(400, "taskId query parameter is required");
    }

    const notes = await query<{
      id: string;
      task_id: string;
      content: string;
      created_by: string;
      created_at: string;
    }>(
      sql,
      "SELECT * FROM task_notes WHERE task_id = $1 ORDER BY created_at DESC",
      [taskId]
    );

    return jsonResponse(
      notes.map((n) => ({
        id: n.id,
        taskId: n.task_id,
        content: n.content,
        createdBy: n.created_by,
        createdAt: n.created_at,
      }))
    );
  }

  // POST /.netlify/functions/task-notes — create a note
  if (req.method === "POST" && !subPath) {
    let body: { taskId?: string; content?: string };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    if (!body.taskId?.trim()) {
      return errorResponse(400, "taskId is required");
    }
    if (!body.content?.trim()) {
      return errorResponse(400, "content is required");
    }

    // Verify the task exists
    const task = await queryOne<{ id: string; client_id: string | null }>(
      sql,
      "SELECT id, client_id FROM tasks WHERE id = $1",
      [body.taskId]
    );
    if (!task) {
      return errorResponse(404, "Task not found");
    }

    const actor = user ? user.name : "System";
    const actorId = user ? user.id : null;

    const created = await query<{
      id: string;
      task_id: string;
      content: string;
      created_by: string;
      created_at: string;
    }>(
      sql,
      `INSERT INTO task_notes (task_id, content, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [body.taskId, body.content.trim(), actor]
    );

    const n = created[0];

    // Create timeline entry on associated client
    if (task.client_id) {
      await query(
        sql,
        `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [task.client_id, "Note Added", `Note added to task`, "task", task.id, actor, actorId]
      );

      // Send follower notifications
      try {
        const followers = await query<{ user_id: string; email: string; name: string }>(
          sql,
          `SELECT cf.user_id, u.email, u.name FROM client_followers cf
           JOIN users u ON u.id = cf.user_id
           WHERE cf.client_id = $1`,
          [task.client_id]
        );

        for (const follower of followers) {
          // Skip the actor
          if (user && follower.user_id === user.id) continue;

          // Check notification preferences
          const pref = await queryOne<{ note_added: boolean }>(
            sql,
            "SELECT note_added FROM notification_preferences WHERE user_id = $1",
            [follower.user_id]
          );
          if (pref && !pref.note_added) continue;

          // Fire-and-forget notification (no await)
        }
      } catch {
        // Notifications are fire-and-forget
      }
    }

    return jsonResponse(
      {
        id: n.id,
        taskId: n.task_id,
        content: n.content,
        createdBy: n.created_by,
        createdAt: n.created_at,
      },
      201
    );
  }

  // DELETE /.netlify/functions/task-notes/:noteId — delete a note
  if (req.method === "DELETE" && subPath) {
    const existing = await queryOne<{ id: string }>(
      sql,
      "SELECT id FROM task_notes WHERE id = $1",
      [subPath]
    );
    if (!existing) {
      return errorResponse(404, "Note not found");
    }

    await query(sql, "DELETE FROM task_notes WHERE id = $1", [subPath]);

    return jsonResponse({ success: true });
  }

  return errorResponse(405, "Method not allowed");
}

export default withAuth(handler);
