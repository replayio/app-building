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

  const sql = getDb();
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const subPath = segments[3] || null;

  // GET /.netlify/functions/individuals?mode=clients&individualId=<id> — associated clients for an individual
  if (req.method === "GET" && !subPath && url.searchParams.get("mode") === "clients") {
    const individualId = url.searchParams.get("individualId");
    if (!individualId) {
      return errorResponse(400, "individualId query param required");
    }

    const clients = await query<{
      id: string;
      name: string;
      type: string;
      status: string;
      tags: string[];
      source_type: string | null;
    }>(
      sql,
      `SELECT c.id, c.name, c.type, c.status, c.tags, c.source_type
       FROM clients c
       JOIN client_individuals ci ON ci.client_id = c.id
       WHERE ci.individual_id = $1
       ORDER BY c.name ASC`,
      [individualId]
    );

    return jsonResponse(
      clients.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status,
        industry: c.source_type || null,
      }))
    );
  }

  // GET /.netlify/functions/individuals?clientId=<id> — people for a client
  if (req.method === "GET" && !subPath && url.searchParams.get("clientId")) {
    const clientId = url.searchParams.get("clientId")!;

    const people = await query<{
      id: string;
      name: string;
      title: string | null;
      email: string | null;
      phone: string | null;
      location: string | null;
      role: string | null;
      is_primary: boolean;
      created_at: string;
    }>(
      sql,
      `SELECT i.id, i.name, i.title, i.email, i.phone, i.location, ci.role, ci.is_primary, i.created_at
       FROM individuals i
       JOIN client_individuals ci ON ci.individual_id = i.id
       WHERE ci.client_id = $1
       ORDER BY ci.is_primary DESC, i.name ASC`,
      [clientId]
    );

    return jsonResponse(
      people.map((p) => ({
        id: p.id,
        name: p.name,
        title: p.title,
        email: p.email,
        phone: p.phone,
        location: p.location,
        role: p.role,
        isPrimary: p.is_primary,
        createdAt: p.created_at,
      }))
    );
  }

  // GET /.netlify/functions/individuals?mode=all — enriched list for contacts page
  if (req.method === "GET" && !subPath && url.searchParams.get("mode") === "all") {
    const people = await query<{
      id: string;
      name: string;
      title: string | null;
      email: string | null;
      phone: string | null;
      location: string | null;
      created_at: string;
    }>(
      sql,
      `SELECT id, name, title, email, phone, location, created_at FROM individuals ORDER BY name ASC`
    );

    // Fetch all client associations in one query
    const associations = await query<{
      individual_id: string;
      client_id: string;
      client_name: string;
    }>(
      sql,
      `SELECT ci.individual_id, c.id AS client_id, c.name AS client_name
       FROM client_individuals ci
       JOIN clients c ON c.id = ci.client_id
       ORDER BY c.name ASC`
    );

    // Build a map of individual_id -> associated clients
    const clientMap = new Map<string, { id: string; name: string }[]>();
    for (const a of associations) {
      const list = clientMap.get(a.individual_id) || [];
      list.push({ id: a.client_id, name: a.client_name });
      clientMap.set(a.individual_id, list);
    }

    return jsonResponse(
      people.map((p) => ({
        id: p.id,
        name: p.name,
        title: p.title,
        email: p.email,
        phone: p.phone,
        location: p.location,
        createdAt: p.created_at,
        associatedClients: clientMap.get(p.id) || [],
      }))
    );
  }

  // GET /.netlify/functions/individuals — all individuals (no params)
  if (req.method === "GET" && !subPath) {
    const people = await query<{
      id: string;
      name: string;
      title: string | null;
    }>(
      sql,
      `SELECT id, name, title FROM individuals ORDER BY name ASC`
    );

    return jsonResponse(
      people.map((p) => ({
        id: p.id,
        name: p.name,
        title: p.title,
      }))
    );
  }

  // GET /.netlify/functions/individuals/<id> — single individual
  if (req.method === "GET" && subPath) {
    const person = await queryOne<{
      id: string;
      name: string;
      title: string | null;
      email: string | null;
      phone: string | null;
      location: string | null;
      created_at: string;
    }>(sql, "SELECT * FROM individuals WHERE id = $1", [subPath]);

    if (!person) {
      return errorResponse(404, "Individual not found");
    }

    return jsonResponse({
      id: person.id,
      name: person.name,
      title: person.title,
      email: person.email,
      phone: person.phone,
      location: person.location,
      createdAt: person.created_at,
    });
  }

  // POST /.netlify/functions/individuals/import — bulk import contacts
  if (req.method === "POST" && subPath === "import") {
    let body: { rows?: Record<string, string>[] };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    if (!body.rows || !Array.isArray(body.rows)) {
      return errorResponse(400, "rows array required");
    }

    const errors: { row: number; errors: string[] }[] = [];
    let imported = 0;

    for (let i = 0; i < body.rows.length; i++) {
      const row = body.rows[i];
      const rowErrors: string[] = [];
      const name = (row["Name"] || "").trim();

      if (!name) {
        rowErrors.push("Name is required");
      }

      if (rowErrors.length > 0) {
        errors.push({ row: i + 1, errors: rowErrors });
        continue;
      }

      const title = (row["Title"] || "").trim() || null;
      const email = (row["Email"] || "").trim() || null;
      const phone = (row["Phone"] || "").trim() || null;
      const location = (row["Location"] || "").trim() || null;
      const clientName = (row["Client Name"] || "").trim();

      const created = await query<{ id: string }>(
        sql,
        `INSERT INTO individuals (name, title, email, phone, location)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [name, title, email, phone, location]
      );

      const individualId = created[0].id;

      // Associate with client by name if provided
      if (clientName) {
        const client = await queryOne<{ id: string }>(
          sql,
          `SELECT id FROM clients WHERE LOWER(name) = LOWER($1)`,
          [clientName]
        );
        if (client) {
          await query(
            sql,
            `INSERT INTO client_individuals (client_id, individual_id, role, is_primary)
             VALUES ($1, $2, NULL, false)`,
            [client.id, individualId]
          );
        } else {
          errors.push({ row: i + 1, errors: [`Client "${clientName}" not found`] });
        }
      }

      imported++;
    }

    return jsonResponse({ imported, errors });
  }

  // POST /.netlify/functions/individuals — create individual and associate with client
  if (req.method === "POST" && !subPath) {
    let body: {
      name?: string;
      title?: string;
      email?: string;
      phone?: string;
      location?: string;
      role?: string;
      clientId?: string;
    };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    if (!body.name?.trim()) {
      return errorResponse(400, "Name is required");
    }

    const created = await query<{
      id: string;
      name: string;
      title: string | null;
      email: string | null;
      phone: string | null;
      location: string | null;
      created_at: string;
    }>(
      sql,
      `INSERT INTO individuals (name, title, email, phone, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        body.name.trim(),
        body.title || null,
        body.email || null,
        body.phone || null,
        body.location || null,
      ]
    );

    const p = created[0];

    // Associate with client if clientId provided
    const associatedClients: { id: string; name: string }[] = [];
    if (body.clientId) {
      await query(
        sql,
        `INSERT INTO client_individuals (client_id, individual_id, role, is_primary)
         VALUES ($1, $2, $3, false)`,
        [body.clientId, p.id, body.role || null]
      );

      const clientRow = await queryOne<{ id: string; name: string }>(
        sql,
        `SELECT id, name FROM clients WHERE id = $1`,
        [body.clientId]
      );
      if (clientRow) {
        associatedClients.push({ id: clientRow.id, name: clientRow.name });
      }

      const actor = user ? user.name : "System";
      const actorId = user ? user.id : null;
      await query(
        sql,
        `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [body.clientId, "Contact Added", `Contact Added: '${body.name.trim()}'`, "individual", p.id, actor, actorId]
      );
    }

    return jsonResponse(
      {
        id: p.id,
        name: p.name,
        title: p.title,
        email: p.email,
        phone: p.phone,
        location: p.location,
        role: body.role || null,
        isPrimary: false,
        createdAt: p.created_at,
        associatedClients,
      },
      201
    );
  }

  return errorResponse(405, "Method not allowed");
}

export default withAuth(handler);
