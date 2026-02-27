import { getDb, query, queryOne, jsonResponse, errorResponse } from "./_db.js";
import { withAuth } from "./_auth-middleware.js";

interface DealRow {
  id: string;
  name: string;
  client_id: string;
  client_name: string | null;
  value: string | null;
  stage: string;
  owner_id: string | null;
  probability: number | null;
  expected_close_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  owner_name: string | null;
}

function mapDealRow(d: DealRow) {
  return {
    id: d.id,
    name: d.name,
    clientId: d.client_id,
    clientName: d.client_name,
    value: d.value ? parseFloat(d.value) : null,
    stage: d.stage,
    ownerId: d.owner_id,
    ownerName: d.owner_name,
    probability: d.probability,
    expectedCloseDate: d.expected_close_date,
    status: d.status,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

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

  // GET /.netlify/functions/deals/<dealId> — single deal by ID
  if (req.method === "GET" && subPath) {
    const dealId = subPath;
    const rows = await query<DealRow>(
      sql,
      `SELECT d.*, c.name AS client_name, u.name AS owner_name
       FROM deals d
       LEFT JOIN clients c ON c.id = d.client_id
       LEFT JOIN users u ON u.id = d.owner_id
       WHERE d.id = $1`,
      [dealId]
    );
    if (rows.length === 0) {
      return errorResponse(404, "Deal not found");
    }
    return jsonResponse(mapDealRow(rows[0]));
  }

  // GET /.netlify/functions/deals — list all deals, or filter by clientId
  if (req.method === "GET" && !subPath) {
    const clientId = url.searchParams.get("clientId");

    let queryText: string;
    let params: unknown[];

    if (clientId) {
      queryText = `SELECT d.*, c.name AS client_name, u.name AS owner_name
         FROM deals d
         LEFT JOIN clients c ON c.id = d.client_id
         LEFT JOIN users u ON u.id = d.owner_id
         WHERE d.client_id = $1
         ORDER BY d.created_at DESC`;
      params = [clientId];
    } else {
      queryText = `SELECT d.*, c.name AS client_name, u.name AS owner_name
         FROM deals d
         LEFT JOIN clients c ON c.id = d.client_id
         LEFT JOIN users u ON u.id = d.owner_id
         ORDER BY d.created_at DESC`;
      params = [];
    }

    const deals = await query<DealRow>(sql, queryText, params);
    return jsonResponse(deals.map(mapDealRow));
  }

  // POST /.netlify/functions/deals/import — import deals from CSV
  if (req.method === "POST" && subPath === "import") {
    let body: { rows?: Record<string, string>[] };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    if (!body.rows || !Array.isArray(body.rows)) {
      return errorResponse(400, "rows array is required");
    }

    const errors: { row: number; errors: string[] }[] = [];
    const actor = user ? user.name : "System";
    const actorId = user ? user.id : null;

    for (let i = 0; i < body.rows.length; i++) {
      const row = body.rows[i];
      const rowErrors: string[] = [];

      if (!row["Name"]?.trim()) {
        rowErrors.push("Name is required");
      }
      if (!row["Client Name"]?.trim()) {
        rowErrors.push("Client Name is required");
      }

      if (rowErrors.length > 0) {
        errors.push({ row: i + 1, errors: rowErrors });
        continue;
      }

      // Look up client by name
      const clientRows = await query<{ id: string }>(sql, "SELECT id FROM clients WHERE LOWER(name) = LOWER($1)", [row["Client Name"].trim()]);
      if (clientRows.length === 0) {
        errors.push({ row: i + 1, errors: [`Client "${row["Client Name"]}" not found`] });
        continue;
      }

      const clientId = clientRows[0].id;
      const value = row["Value"] ? parseFloat(row["Value"]) : null;
      const stage = row["Stage"]?.trim() || "Lead";
      const probability = row["Probability"] ? parseInt(row["Probability"], 10) : null;
      const expectedCloseDate = row["Expected Close Date"]?.trim() || null;
      const status = row["Status"]?.trim() || "open";

      // Look up owner by name
      let ownerId: string | null = null;
      if (row["Owner"]?.trim()) {
        const ownerRows = await query<{ id: string }>(sql, "SELECT id FROM users WHERE LOWER(name) = LOWER($1)", [row["Owner"].trim()]);
        if (ownerRows.length > 0) {
          ownerId = ownerRows[0].id;
        }
      }

      const created = await query<{ id: string; stage: string }>(
        sql,
        `INSERT INTO deals (name, client_id, value, stage, owner_id, probability, expected_close_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, stage`,
        [
          row["Name"].trim(),
          clientId,
          isNaN(value as number) ? null : value,
          stage,
          ownerId,
          isNaN(probability as number) ? null : probability,
          expectedCloseDate || null,
          status,
        ]
      );

      const d = created[0];
      await query(
        sql,
        `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [clientId, "Deal Created", `Deal Created: '${row["Name"].trim()}'`, "deal", d.id, actor, actorId]
      );
      await query(
        sql,
        `INSERT INTO deal_history (deal_id, new_stage, changed_by)
         VALUES ($1, $2, $3)`,
        [d.id, d.stage, actor]
      );
    }

    if (errors.length > 0) {
      return jsonResponse({ errors }, 200);
    }
    return jsonResponse({ success: true, count: body.rows.length });
  }

  // POST /.netlify/functions/deals — create deal
  if (req.method === "POST" && !subPath) {
    let body: {
      name?: string;
      clientId?: string;
      value?: number;
      stage?: string;
      ownerId?: string;
      probability?: number;
      expectedCloseDate?: string;
      status?: string;
    };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    if (!body.name?.trim()) {
      return errorResponse(400, "Deal name is required");
    }
    if (!body.clientId) {
      return errorResponse(400, "Client ID is required");
    }

    const created = await query<{
      id: string;
      name: string;
      client_id: string;
      value: string | null;
      stage: string;
      owner_id: string | null;
      probability: number | null;
      expected_close_date: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }>(
      sql,
      `INSERT INTO deals (name, client_id, value, stage, owner_id, probability, expected_close_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        body.name.trim(),
        body.clientId,
        body.value ?? null,
        body.stage || "Lead",
        body.ownerId || null,
        body.probability ?? null,
        body.expectedCloseDate || null,
        body.status || "open",
      ]
    );

    const d = created[0];
    const actor = user ? user.name : "System";
    const actorId = user ? user.id : null;

    await query(
      sql,
      `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by, created_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [body.clientId, "Deal Created", `Deal Created: '${body.name.trim()}'`, "deal", d.id, actor, actorId]
    );

    await query(
      sql,
      `INSERT INTO deal_history (deal_id, new_stage, changed_by)
       VALUES ($1, $2, $3)`,
      [d.id, d.stage, actor]
    );

    const clientRow = await query<{ name: string }>(sql, "SELECT name FROM clients WHERE id = $1", [d.client_id]);
    let ownerName: string | null = null;
    if (d.owner_id) {
      const ownerRow = await query<{ name: string }>(sql, "SELECT name FROM users WHERE id = $1", [d.owner_id]);
      ownerName = ownerRow[0]?.name || null;
    }

    return jsonResponse(
      {
        id: d.id,
        name: d.name,
        clientId: d.client_id,
        clientName: clientRow[0]?.name || null,
        value: d.value ? parseFloat(d.value) : null,
        stage: d.stage,
        ownerId: d.owner_id,
        ownerName,
        probability: d.probability,
        expectedCloseDate: d.expected_close_date,
        status: d.status,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      },
      201
    );
  }

  // PUT /.netlify/functions/deals/:dealId — update deal
  if (req.method === "PUT" && subPath) {
    const dealId = subPath;
    let body: {
      name?: string;
      value?: number;
      stage?: string;
      ownerId?: string;
      probability?: number;
      expectedCloseDate?: string;
      status?: string;
    };
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    const existing = await query<{ stage: string; client_id: string; name: string; value: string | null; owner_id: string | null; probability: number | null; expected_close_date: string | null }>(
      sql,
      "SELECT stage, client_id, name, value, owner_id, probability, expected_close_date FROM deals WHERE id = $1",
      [dealId]
    );
    if (existing.length === 0) {
      return errorResponse(404, "Deal not found");
    }

    const oldStage = existing[0].stage;
    const oldValue = existing[0].value;
    const oldOwnerId = existing[0].owner_id;
    const oldProbability = existing[0].probability;
    const oldExpectedCloseDate = existing[0].expected_close_date;
    const clientId = existing[0].client_id;
    const actor = user ? user.name : "System";
    const actorId = user ? user.id : null;

    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (body.name !== undefined) {
      sets.push(`name = $${idx++}`);
      params.push(body.name.trim());
    }
    if (body.value !== undefined) {
      sets.push(`value = $${idx++}`);
      params.push(body.value);
    }
    if (body.stage !== undefined) {
      sets.push(`stage = $${idx++}`);
      params.push(body.stage);
    }
    if (body.ownerId !== undefined) {
      sets.push(`owner_id = $${idx++}`);
      params.push(body.ownerId || null);
    }
    if (body.probability !== undefined) {
      sets.push(`probability = $${idx++}`);
      params.push(body.probability);
    }
    if (body.expectedCloseDate !== undefined) {
      sets.push(`expected_close_date = $${idx++}`);
      params.push(body.expectedCloseDate || null);
    }
    if (body.status !== undefined) {
      sets.push(`status = $${idx++}`);
      params.push(body.status);
    }

    if (sets.length === 0) {
      return errorResponse(400, "No fields to update");
    }

    sets.push(`updated_at = NOW()`);
    params.push(dealId);

    const updated = await query<DealRow>(
      sql,
      `UPDATE deals SET ${sets.join(", ")} WHERE id = $${idx}
       RETURNING *, (SELECT name FROM clients WHERE id = deals.client_id) AS client_name,
                    (SELECT name FROM users WHERE id = deals.owner_id) AS owner_name`,
      params
    );

    if (updated.length === 0) {
      return errorResponse(404, "Deal not found");
    }

    if (body.stage && body.stage !== oldStage) {
      await query(
        sql,
        `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          clientId,
          "Deal Stage Changed",
          `Deal Stage Changed: '${existing[0].name}' from '${oldStage}' to '${body.stage}'`,
          "deal",
          dealId,
          actor,
          actorId,
        ]
      );

      await query(
        sql,
        `INSERT INTO deal_history (deal_id, old_stage, new_stage, changed_by)
         VALUES ($1, $2, $3, $4)`,
        [dealId, oldStage, body.stage, actor]
      );

      // Send follower notifications for stage change
      try {
        const followers = await query<{ user_id: string; email: string; name: string }>(
          sql,
          `SELECT cf.user_id, u.email, u.name FROM client_followers cf
           JOIN users u ON u.id = cf.user_id
           LEFT JOIN notification_preferences np ON np.user_id = cf.user_id
           WHERE cf.client_id = $1 AND (np.deal_stage_changed IS NULL OR np.deal_stage_changed = true)`,
          [clientId]
        );

        const actorId = user ? user.id : null;
        for (const f of followers) {
          if (f.user_id !== actorId) {
            await query(
              sql,
              `INSERT INTO email_tokens (email, token, type)
               VALUES ($1, $2, 'notification')
               ON CONFLICT DO NOTHING`,
              [f.email, `stage-change-${dealId}-${Date.now()}-${f.user_id}`]
            );
          }
        }
      } catch {
        // Notification failure shouldn't block the update
      }
    }

    // Timeline entry for value change
    if (body.value !== undefined) {
      const oldVal = oldValue ? `$${parseFloat(oldValue).toLocaleString()}` : "N/A";
      const newVal = body.value != null ? `$${body.value.toLocaleString()}` : "N/A";
      if (oldVal !== newVal) {
        await query(
          sql,
          `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by, created_by_user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [clientId, "Deal Updated", `Deal Value Changed: '${existing[0].name}' from ${oldVal} to ${newVal}`, "deal", dealId, actor, actorId]
        );
      }
    }

    // Timeline entry for owner change
    if (body.ownerId !== undefined && body.ownerId !== oldOwnerId) {
      const oldOwnerName = oldOwnerId
        ? (await queryOne<{ name: string }>(sql, "SELECT name FROM users WHERE id = $1", [oldOwnerId]))?.name || "Unknown"
        : "Unassigned";
      const newOwnerName = body.ownerId
        ? (await queryOne<{ name: string }>(sql, "SELECT name FROM users WHERE id = $1", [body.ownerId]))?.name || "Unknown"
        : "Unassigned";
      await query(
        sql,
        `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [clientId, "Deal Updated", `Deal Owner Changed: '${existing[0].name}' from '${oldOwnerName}' to '${newOwnerName}'`, "deal", dealId, actor, actorId]
      );
    }

    // Timeline entry for metrics change (probability or expected close date)
    if (body.probability !== undefined && body.probability !== oldProbability) {
      await query(
        sql,
        `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [clientId, "Deal Updated", `Deal Metrics Updated: '${existing[0].name}' probability changed to ${body.probability}%`, "deal", dealId, actor, actorId]
      );
    }

    if (body.expectedCloseDate !== undefined && body.expectedCloseDate !== oldExpectedCloseDate) {
      await query(
        sql,
        `INSERT INTO timeline_events (client_id, event_type, description, related_entity_type, related_entity_id, created_by, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [clientId, "Deal Updated", `Deal Metrics Updated: '${existing[0].name}' expected close date changed`, "deal", dealId, actor, actorId]
      );
    }

    return jsonResponse(mapDealRow(updated[0]));
  }

  // DELETE /.netlify/functions/deals/:dealId — delete deal
  if (req.method === "DELETE" && subPath) {
    const dealId = subPath;

    const existing = await query<{ id: string }>(sql, "SELECT id FROM deals WHERE id = $1", [dealId]);
    if (existing.length === 0) {
      return errorResponse(404, "Deal not found");
    }

    await query(sql, "DELETE FROM deal_history WHERE deal_id = $1", [dealId]);
    await query(sql, "DELETE FROM deals WHERE id = $1", [dealId]);

    return jsonResponse({ success: true });
  }

  return errorResponse(405, "Method not allowed");
}

export default withAuth(handler);
