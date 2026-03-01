import { getDb, json, error } from "./shared.mjs";

export default async (request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const appId = pathParts.length > 3 ? pathParts[3] : null;

  const sql = getDb();

  try {
    if (appId) {
      const rows = await sql.query(
        "SELECT id, app_id, timestamp, log_type, message, detail, expandable FROM activity_log WHERE app_id = $1 ORDER BY timestamp DESC LIMIT 100",
        [appId]
      );
      return json(rows);
    }

    const rows = await sql.query(
      "SELECT id, app_id, timestamp, log_type, message, detail, expandable FROM activity_log ORDER BY timestamp DESC LIMIT 100"
    );
    return json(rows);
  } catch (e) {
    console.error("activity error:", e);
    return error(e.message, 500);
  }
};
