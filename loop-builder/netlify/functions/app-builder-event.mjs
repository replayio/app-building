import { getDb, checkAuth, unauthorized, json, error } from "./shared.mjs";

export default async (request) => {
  if (request.method !== "POST") {
    return error("Method not allowed", 405);
  }

  if (!checkAuth(request)) {
    return unauthorized();
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body", 400);
  }

  const { type, containerName, timestamp, data } = body;

  const sql = getDb();

  try {
    // Store the webhook event
    await sql.query(
      `INSERT INTO webhook_events (container_id, event_type, payload, received_at)
       VALUES ($1, $2, $3, NOW())`,
      [containerName || "unknown", type || "unknown", JSON.stringify(body)]
    );

    // Update container last_event_at
    if (containerName) {
      await sql.query(
        "UPDATE containers SET last_event_at = NOW() WHERE container_id = $1 OR name = $1",
        [containerName]
      );
    }

    // Handle specific event types
    if (type === "container.stopped" && containerName) {
      await sql.query(
        "UPDATE containers SET status = $1 WHERE container_id = $2 OR name = $2",
        ["stopped", containerName]
      );
    }

    return json({ ok: true });
  } catch (e) {
    console.error("app-builder-event error:", e);
    return error(e.message, 500);
  }
};

export const config = {
  method: "POST",
};
