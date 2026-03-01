import { getDb, json, error } from "./shared.mjs";

export default async (request) => {
  const sql = getDb();
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Path: /.netlify/functions/apps or /.netlify/functions/apps/:id
  const appId = pathParts.length > 3 ? pathParts[3] : null;

  try {
    if (appId) {
      const rows = await sql.query(
        "SELECT id, name, description, status, progress, created_at, model, deployment_url, source_url FROM apps WHERE id = $1",
        [appId]
      );
      if (rows.length === 0) return error("App not found", 404);
      return json(rows[0]);
    }

    const rows = await sql.query(
      "SELECT id, name, description, status, progress, created_at, model, deployment_url, source_url FROM apps ORDER BY created_at DESC"
    );
    return json(rows);
  } catch (e) {
    console.error("apps error:", e);
    return error(e.message, 500);
  }
};
