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

  // GET /.netlify/functions/writeups?dealId=<id> — list writeups for a deal
  if (req.method === "GET" && !subPath) {
    const dealId = url.searchParams.get("dealId");
    if (!dealId) {
      return errorResponse(400, "dealId query param required");
    }

    const writeups = await query<{
      id: string;
      deal_id: string;
      title: string;
      content: string;
      author: string;
      created_at: string;
      updated_at: string;
    }>(
      sql,
      `SELECT * FROM writeups
       WHERE deal_id = $1
       ORDER BY created_at DESC`,
      [dealId]
    );

    return jsonResponse(
      writeups.map((w) => ({
        id: w.id,
        dealId: w.deal_id,
        title: w.title,
        content: w.content,
        author: w.author,
        createdAt: w.created_at,
        updatedAt: w.updated_at,
      }))
    );
  }

  // GET /.netlify/functions/writeups/<id>/versions — version history for a writeup
  if (req.method === "GET" && subPath) {
    const writeupId = subPath;
    const versionParam = url.searchParams.get("versions");

    if (versionParam === "true") {
      const versions = await query<{
        id: string;
        writeup_id: string;
        title: string;
        content: string;
        author: string;
        created_at: string;
      }>(
        sql,
        `SELECT * FROM writeup_versions
         WHERE writeup_id = $1
         ORDER BY created_at ASC`,
        [writeupId]
      );

      return jsonResponse(
        versions.map((v) => ({
          id: v.id,
          writeupId: v.writeup_id,
          title: v.title,
          content: v.content,
          author: v.author,
          createdAt: v.created_at,
        }))
      );
    }

    // Single writeup
    const writeup = await queryOne<{
      id: string;
      deal_id: string;
      title: string;
      content: string;
      author: string;
      created_at: string;
      updated_at: string;
    }>(sql, "SELECT * FROM writeups WHERE id = $1", [writeupId]);

    if (!writeup) {
      return errorResponse(404, "Writeup not found");
    }

    return jsonResponse({
      id: writeup.id,
      dealId: writeup.deal_id,
      title: writeup.title,
      content: writeup.content,
      author: writeup.author,
      createdAt: writeup.created_at,
      updatedAt: writeup.updated_at,
    });
  }

  // POST /.netlify/functions/writeups — create writeup
  if (req.method === "POST" && !subPath) {
    let body: {
      dealId?: string;
      title?: string;
      content?: string;
    };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    if (!body.dealId) {
      return errorResponse(400, "dealId is required");
    }
    if (!body.title?.trim()) {
      return errorResponse(400, "Title is required");
    }
    if (!body.content?.trim()) {
      return errorResponse(400, "Content is required");
    }

    const actor = user ? user.name : "System";

    const created = await query<{
      id: string;
      deal_id: string;
      title: string;
      content: string;
      author: string;
      created_at: string;
      updated_at: string;
    }>(
      sql,
      `INSERT INTO writeups (deal_id, title, content, author)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [body.dealId, body.title.trim(), body.content.trim(), actor]
    );

    const w = created[0];

    // Save initial version
    await query(
      sql,
      `INSERT INTO writeup_versions (writeup_id, title, content, author)
       VALUES ($1, $2, $3, $4)`,
      [w.id, w.title, w.content, actor]
    );

    // Get deal's client_id for timeline
    const deal = await queryOne<{ client_id: string; name: string }>(
      sql,
      "SELECT client_id, name FROM deals WHERE id = $1",
      [body.dealId]
    );

    if (deal) {
      // Create timeline entry
      await query(
        sql,
        `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [deal.client_id, "Note Added", `Note Added: '${body.title.trim()}' on deal '${deal.name}'`, "writeup", w.id, actor]
      );

      // Send follower notifications
      try {
        const followers = await query<{ user_id: string; email: string; name: string }>(
          sql,
          `SELECT cf.user_id, u.email, u.name FROM client_followers cf
           JOIN users u ON u.id = cf.user_id
           LEFT JOIN notification_preferences np ON np.user_id = cf.user_id
           WHERE cf.client_id = $1 AND (np.note_added IS NULL OR np.note_added = true)`,
          [deal.client_id]
        );

        const actorId = user ? user.id : null;
        for (const f of followers) {
          if (f.user_id !== actorId) {
            await query(
              sql,
              `INSERT INTO email_tokens (email, token, type)
               VALUES ($1, $2, 'notification')
               ON CONFLICT DO NOTHING`,
              [f.email, `note-added-${w.id}-${Date.now()}-${f.user_id}`]
            );
          }
        }
      } catch {
        // Notification failure shouldn't block
      }
    }

    return jsonResponse(
      {
        id: w.id,
        dealId: w.deal_id,
        title: w.title,
        content: w.content,
        author: w.author,
        createdAt: w.created_at,
        updatedAt: w.updated_at,
      },
      201
    );
  }

  // PUT /.netlify/functions/writeups/<id> — update writeup
  if (req.method === "PUT" && subPath) {
    const writeupId = subPath;
    let body: {
      title?: string;
      content?: string;
    };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    const existing = await queryOne<{
      id: string;
      deal_id: string;
      title: string;
      content: string;
    }>(sql, "SELECT * FROM writeups WHERE id = $1", [writeupId]);

    if (!existing) {
      return errorResponse(404, "Writeup not found");
    }

    const actor = user ? user.name : "System";
    const newTitle = body.title?.trim() || existing.title;
    const newContent = body.content?.trim() || existing.content;

    const updated = await query<{
      id: string;
      deal_id: string;
      title: string;
      content: string;
      author: string;
      created_at: string;
      updated_at: string;
    }>(
      sql,
      `UPDATE writeups SET title = $2, content = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [writeupId, newTitle, newContent]
    );

    // Save version
    await query(
      sql,
      `INSERT INTO writeup_versions (writeup_id, title, content, author)
       VALUES ($1, $2, $3, $4)`,
      [writeupId, newTitle, newContent, actor]
    );

    const w = updated[0];
    return jsonResponse({
      id: w.id,
      dealId: w.deal_id,
      title: w.title,
      content: w.content,
      author: w.author,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    });
  }

  return errorResponse(405, "Method not allowed");
}

export default withAuth(handler);
