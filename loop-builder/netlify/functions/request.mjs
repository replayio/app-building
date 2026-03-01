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

  const { containerId, prompt, containerName } = body;
  const targetId = containerId || containerName;
  if (!targetId || !prompt) {
    return error("containerId and prompt are required", 400);
  }

  const sql = getDb();

  try {
    // Look up the container to find its base URL
    const containers = await sql.query(
      "SELECT container_id, name, status FROM containers WHERE container_id = $1 OR name = $1",
      [targetId]
    );

    if (containers.length === 0) {
      return error("Container not found", 404);
    }

    const container = containers[0];
    const flyApp = process.env.FLY_APP_NAME;
    const baseUrl = `https://${flyApp}.fly.dev`;

    const headers = { "Content-Type": "application/json" };
    const msgResp = await fetch(`${baseUrl}/message`, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt }),
    });

    const msgData = await msgResp.json();
    return json(msgData);
  } catch (e) {
    console.error("request error:", e);
    return error(e.message, 500);
  }
};

export const config = {
  method: "POST",
};
