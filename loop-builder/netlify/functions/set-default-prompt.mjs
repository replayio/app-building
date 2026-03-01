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

  const { prompt } = body;
  if (!prompt) {
    return error("prompt is required", 400);
  }

  const sql = getDb();

  try {
    // Upsert the default prompt setting
    const existing = await sql.query(
      "SELECT key FROM settings WHERE key = $1",
      ["default_prompt"]
    );

    if (existing.length > 0) {
      await sql.query(
        "UPDATE settings SET value = $1 WHERE key = $2",
        [prompt, "default_prompt"]
      );
    } else {
      await sql.query(
        "INSERT INTO settings (key, value) VALUES ($1, $2)",
        ["default_prompt", prompt]
      );
    }

    return json({ ok: true, prompt });
  } catch (e) {
    console.error("set-default-prompt error:", e);
    return error(e.message, 500);
  }
};

export const config = {
  method: "POST",
};
