import { getDb, query, queryOne, jsonResponse, errorResponse } from "@shared/backend/db";

const VALID_TYPES = ["organization", "individual"];
const VALID_STATUSES = ["active", "inactive", "prospect", "churned"];

export default async function handler(req: Request): Promise<Response> {
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

  // POST /.netlify/functions/clients/import — bulk import
  if (req.method === "POST" && subPath === "import") {
    let body: { rows?: Record<string, string>[] };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    const rows = body.rows || [];
    const errors: { row: number; errors: string[] }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowErrors: string[] = [];
      if (!r["Name"]?.trim()) rowErrors.push("Name is required");
      if (!r["Type"]?.trim()) rowErrors.push("Type is required");
      else if (!VALID_TYPES.includes(r["Type"].trim().toLowerCase())) {
        rowErrors.push("Type must be Organization or Individual");
      }
      if (r["Status"]?.trim() && !VALID_STATUSES.includes(r["Status"].trim().toLowerCase())) {
        rowErrors.push("Status must be Active, Inactive, Prospect, or Churned");
      }
      if (rowErrors.length > 0) {
        errors.push({ row: i + 1, errors: rowErrors });
      }
    }

    if (errors.length > 0) {
      return jsonResponse({ errors });
    }

    for (const r of rows) {
      const name = r["Name"].trim();
      const type = r["Type"].trim().toLowerCase();
      const status = r["Status"]?.trim().toLowerCase() || "prospect";
      const tags = r["Tags"]?.trim()
        ? r["Tags"].split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];
      const sourceType = r["Source Type"]?.trim() || null;
      const sourceDetail = r["Source Detail"]?.trim() || null;
      const campaign = r["Campaign"]?.trim() || null;
      const channel = r["Channel"]?.trim() || null;
      const dateAcquired = r["Date Acquired"]?.trim() || null;

      await query(
        sql,
        `INSERT INTO clients (name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [name, type, status, tags, sourceType, sourceDetail, campaign, channel, dateAcquired]
      );
    }

    return jsonResponse({ success: true, count: rows.length });
  }

  // GET /.netlify/functions/clients — list all clients with enriched data
  if (req.method === "GET" && !subPath) {
    const clients = await query<{
      id: string;
      name: string;
      type: string;
      status: string;
      tags: string[];
      source_type: string | null;
      source_detail: string | null;
      campaign: string | null;
      channel: string | null;
      date_acquired: string | null;
      created_at: string;
      updated_at: string;
    }>(sql, "SELECT * FROM clients ORDER BY updated_at DESC");

    const contacts = await query<{
      client_id: string;
      individual_name: string;
      role: string | null;
    }>(
      sql,
      `SELECT ci.client_id, i.name AS individual_name, ci.role
       FROM client_individuals ci
       JOIN individuals i ON i.id = ci.individual_id
       WHERE ci.is_primary = true`
    );

    const contactMap = new Map<string, { name: string; role: string | null }>();
    for (const c of contacts) {
      contactMap.set(c.client_id, { name: c.individual_name, role: c.role });
    }

    const dealCounts = await query<{
      client_id: string;
      deal_count: string;
      total_value: string | null;
    }>(
      sql,
      `SELECT client_id, COUNT(*)::text AS deal_count, SUM(value)::text AS total_value
       FROM deals WHERE status = 'open'
       GROUP BY client_id`
    );

    const dealMap = new Map<string, { count: number; totalValue: number }>();
    for (const d of dealCounts) {
      dealMap.set(d.client_id, {
        count: parseInt(d.deal_count, 10),
        totalValue: d.total_value ? parseFloat(d.total_value) : 0,
      });
    }

    const nextTasks = await query<{
      client_id: string;
      title: string;
      due_date: string | null;
    }>(
      sql,
      `SELECT DISTINCT ON (client_id) client_id, title, due_date
       FROM tasks
       WHERE client_id IS NOT NULL AND status IN ('open', 'in_progress')
       ORDER BY client_id, due_date ASC NULLS LAST`
    );

    const taskMap = new Map<string, { title: string; dueDate: string | null }>();
    for (const t of nextTasks) {
      taskMap.set(t.client_id, { title: t.title, dueDate: t.due_date });
    }

    const enriched = clients.map((c) => {
      const contact = contactMap.get(c.id);
      const deals = dealMap.get(c.id);
      const task = taskMap.get(c.id);

      return {
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status,
        tags: c.tags,
        sourceType: c.source_type,
        sourceDetail: c.source_detail,
        campaign: c.campaign,
        channel: c.channel,
        dateAcquired: c.date_acquired,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        primaryContact: contact
          ? { name: contact.name, role: contact.role }
          : c.type === "individual"
            ? { name: c.name, role: "Self" }
            : null,
        openDeals: deals ? { count: deals.count, totalValue: deals.totalValue } : { count: 0, totalValue: 0 },
        nextTask: task ? { title: task.title, dueDate: task.dueDate } : null,
      };
    });

    return jsonResponse(enriched);
  }

  // GET /.netlify/functions/clients/<id> — single client
  if (req.method === "GET" && subPath) {
    const client = await queryOne<{
      id: string;
      name: string;
      type: string;
      status: string;
      tags: string[];
      source_type: string | null;
      source_detail: string | null;
      campaign: string | null;
      channel: string | null;
      date_acquired: string | null;
      created_at: string;
      updated_at: string;
    }>(sql, "SELECT * FROM clients WHERE id = $1", [subPath]);

    if (!client) {
      return errorResponse(404, "Client not found");
    }

    return jsonResponse({
      id: client.id,
      name: client.name,
      type: client.type,
      status: client.status,
      tags: client.tags,
      sourceType: client.source_type,
      sourceDetail: client.source_detail,
      campaign: client.campaign,
      channel: client.channel,
      dateAcquired: client.date_acquired,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
    });
  }

  // POST /.netlify/functions/clients — create single client
  if (req.method === "POST" && !subPath) {
    let body: {
      name?: string;
      type?: string;
      status?: string;
      tags?: string[];
      sourceType?: string;
      sourceDetail?: string;
      campaign?: string;
      channel?: string;
      dateAcquired?: string;
    };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    if (!body.name || !body.name.trim()) {
      return errorResponse(400, "Name is required");
    }

    const type = body.type || "organization";
    const status = body.status || "prospect";
    const tags = body.tags || [];
    const sourceType = body.sourceType || null;
    const sourceDetail = body.sourceDetail || null;
    const campaign = body.campaign || null;
    const channel = body.channel || null;
    const dateAcquired = body.dateAcquired || null;

    const created = await query<{
      id: string;
      name: string;
      type: string;
      status: string;
      tags: string[];
      source_type: string | null;
      source_detail: string | null;
      campaign: string | null;
      channel: string | null;
      date_acquired: string | null;
      created_at: string;
      updated_at: string;
    }>(
      sql,
      `INSERT INTO clients (name, type, status, tags, source_type, source_detail, campaign, channel, date_acquired)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [body.name.trim(), type, status, tags, sourceType, sourceDetail, campaign, channel, dateAcquired]
    );

    const c = created[0];
    return jsonResponse(
      {
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status,
        tags: c.tags,
        sourceType: c.source_type,
        sourceDetail: c.source_detail,
        campaign: c.campaign,
        channel: c.channel,
        dateAcquired: c.date_acquired,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        primaryContact: c.type === "individual" ? { name: c.name, role: "Self" } : null,
        openDeals: { count: 0, totalValue: 0 },
        nextTask: null,
      },
      201
    );
  }

  // DELETE /.netlify/functions/clients/<id>
  if (req.method === "DELETE" && subPath) {
    const existing = await queryOne<{ id: string }>(sql, "SELECT id FROM clients WHERE id = $1", [subPath]);
    if (!existing) {
      return errorResponse(404, "Client not found");
    }

    await query(sql, "DELETE FROM clients WHERE id = $1", [subPath]);
    return jsonResponse({ success: true });
  }

  return errorResponse(405, "Method not allowed");
}
