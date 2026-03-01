import { neon } from "@neondatabase/serverless";

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Auth check
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const auth = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (auth !== secret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const flyToken = process.env.FLY_API_TOKEN;
  const flyApp = process.env.FLY_APP_NAME;

  if (!flyToken || !flyApp) {
    return new Response(JSON.stringify({ error: "Fly.io credentials not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { prompt } = body;
  if (!prompt) {
    return new Response(JSON.stringify({ error: "prompt is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create a container record immediately
  const containerId = `app-building-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql.query(
      "INSERT INTO containers (container_id, name, status, prompt, created_at, last_event_at) VALUES ($1, $2, $3, $4, NOW(), NOW())",
      [containerId, containerId, "starting", prompt]
    );
  } catch (e) {
    console.error("DB error:", e);
  }

  // Dispatch to background function (15 min timeout)
  const siteUrl = process.env.URL || "https://loop-builder.netlify.app";
  try {
    const bgRes = await fetch(`${siteUrl}/.netlify/functions/spawn-container-background`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, containerId }),
    });
    console.log("Background function invoked, status:", bgRes.status);
  } catch (e) {
    console.error("Failed to invoke background function:", e);
  }

  return new Response(JSON.stringify({
    containerId,
    containerName: containerId,
    status: "starting",
    message: "Container is being created. Check status endpoint for updates.",
  }), {
    status: 202,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = {
  method: "POST",
};
