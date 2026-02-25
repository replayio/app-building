import { getDb, query, queryOne, jsonResponse, errorResponse } from "@shared/backend/db";
import { withAuth } from "@shared/backend/auth-middleware";

interface WebhookRow {
  id: string;
  name: string;
  url: string;
  events: string[];
  platform: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

function mapWebhook(row: WebhookRow) {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    events: row.events,
    platform: row.platform || "custom",
    enabled: row.enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function handler(authReq: { req: Request; user: { id: string; name: string; email: string } | null }): Promise<Response> {
  const { req } = authReq;

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
  const webhookId = segments[3] || null;

  // GET - list all webhooks
  if (req.method === "GET" && !webhookId) {
    const rows = await query<WebhookRow>(
      sql,
      "SELECT id, name, url, events, platform, enabled, created_at, updated_at FROM webhooks ORDER BY created_at DESC",
      []
    );
    return jsonResponse(rows.map(mapWebhook));
  }

  // GET - single webhook
  if (req.method === "GET" && webhookId) {
    const row = await queryOne<WebhookRow>(
      sql,
      "SELECT id, name, url, events, platform, enabled, created_at, updated_at FROM webhooks WHERE id = $1",
      [webhookId]
    );
    if (!row) return errorResponse(404, "Webhook not found");
    return jsonResponse(mapWebhook(row));
  }

  // POST - create webhook
  if (req.method === "POST") {
    const body = await req.json() as { name?: string; url?: string; events?: string[]; platform?: string };

    if (!body.name || !body.url) {
      return errorResponse(400, "Name and URL are required");
    }

    const events = body.events || [];
    const platform = body.platform || "custom";

    const rows = await query<WebhookRow>(
      sql,
      `INSERT INTO webhooks (name, url, events, platform, enabled)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, name, url, events, platform, enabled, created_at, updated_at`,
      [body.name, body.url, events, platform]
    );

    return jsonResponse(mapWebhook(rows[0]), 201);
  }

  // PUT - update webhook
  if (req.method === "PUT" && webhookId) {
    const body = await req.json() as { name?: string; url?: string; events?: string[]; platform?: string; enabled?: boolean };

    const existing = await queryOne<WebhookRow>(
      sql,
      "SELECT id FROM webhooks WHERE id = $1",
      [webhookId]
    );
    if (!existing) return errorResponse(404, "Webhook not found");

    const rows = await query<WebhookRow>(
      sql,
      `UPDATE webhooks SET
        name = COALESCE($1, name),
        url = COALESCE($2, url),
        events = COALESCE($3, events),
        platform = COALESCE($4, platform),
        enabled = COALESCE($5, enabled),
        updated_at = NOW()
      WHERE id = $6
      RETURNING id, name, url, events, platform, enabled, created_at, updated_at`,
      [body.name || null, body.url || null, body.events || null, body.platform || null, body.enabled ?? null, webhookId]
    );

    return jsonResponse(mapWebhook(rows[0]));
  }

  // DELETE - delete webhook
  if (req.method === "DELETE" && webhookId) {
    const existing = await queryOne<WebhookRow>(
      sql,
      "SELECT id FROM webhooks WHERE id = $1",
      [webhookId]
    );
    if (!existing) return errorResponse(404, "Webhook not found");

    await query(sql, "DELETE FROM webhooks WHERE id = $1", [webhookId]);
    return jsonResponse({ success: true });
  }

  return errorResponse(405, "Method not allowed");
}

export default withAuth(handler);
