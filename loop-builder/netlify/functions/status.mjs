import { getDb, json } from "./shared.mjs";

export default async (request) => {
  const sql = getDb();

  try {
    const containers = await sql.query(
      "SELECT container_id, name, status, prompt, created_at, last_event_at FROM containers ORDER BY created_at DESC"
    );

    const webhookEvents = await sql.query(
      "SELECT id, container_id, event_type, payload, received_at FROM webhook_events ORDER BY received_at DESC LIMIT 50"
    );

    const settings = await sql.query(
      "SELECT value FROM settings WHERE key = $1",
      ["default_prompt"]
    );

    const defaultPrompt = settings.length > 0
      ? settings[0].value
      : "Pick a kind of small business, then design an app that will help with operating some aspect of that business.  Research and think through requirements.  Make sure to include all necessary features but keep the app streamlined otherwise.";

    return json({
      containers,
      webhookEvents,
      defaultPrompt,
    });
  } catch (e) {
    console.error("status error:", e);
    return json({ containers: [], webhookEvents: [], defaultPrompt: "" });
  }
};
