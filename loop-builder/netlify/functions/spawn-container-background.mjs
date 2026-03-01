import { neon } from "@neondatabase/serverless";

const FLY_API_BASE = "https://api.machines.dev/v1";
const DEFAULT_IMAGE_REF = "ghcr.io/replayio/app-building@sha256:e0aa0fc48ec78a65f28c272a4b5d25bc0f2c087087fe81166ad46a58e34cc0d0";

async function flyFetch(path, token, opts = {}) {
  const res = await fetch(`${FLY_API_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Fly API ${opts.method || "GET"} ${path} -> ${res.status}: ${body}`);
  }
  return res;
}

async function createMachine(app, token, image, env, name) {
  const res = await flyFetch(`/apps/${app}/machines`, token, {
    method: "POST",
    body: JSON.stringify({
      name,
      config: {
        image,
        env,
        restart: { policy: "no" },
        guest: { cpu_kind: "shared", cpus: 4, memory_mb: 4096 },
        services: [{
          ports: [{ port: 443, handlers: ["tls", "http"] }],
          protocol: "tcp",
          internal_port: 3000,
          autostart: false,
          autostop: "off",
        }],
      },
    }),
  });
  const data = await res.json();
  return data.id;
}

async function waitForMachine(app, token, machineId, timeoutMs = 180000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await flyFetch(`/apps/${app}/machines/${machineId}/wait?state=started&timeout=60`, token);
      return;
    } catch (e) {
      const elapsed = Math.round((Date.now() - start) / 1000);
      console.log(`Still waiting for machine (${elapsed}s): ${e.message}`);
    }
  }
  throw new Error(`Machine ${machineId} did not start within ${timeoutMs / 1000}s`);
}

function buildContainerEnv(repo, envVars, extra = {}) {
  return {
    REPO_URL: repo.repoUrl,
    CLONE_BRANCH: repo.cloneBranch,
    PUSH_BRANCH: repo.pushBranch,
    GIT_AUTHOR_NAME: "App Builder",
    GIT_AUTHOR_EMAIL: "app-builder@localhost",
    GIT_COMMITTER_NAME: "App Builder",
    GIT_COMMITTER_EMAIL: "app-builder@localhost",
    PLAYWRIGHT_BROWSERS_PATH: "/opt/playwright",
    ...envVars,
    ...extra,
  };
}

export default async (request, context) => {
  console.log("spawn-container-background invoked at", new Date().toISOString());

  const sql = neon(process.env.DATABASE_URL);

  let body;
  try {
    body = await request.json();
  } catch {
    console.error("Failed to parse request body");
    return new Response("bad request");
  }

  const { prompt, repoUrl, cloneBranch, pushBranch, webhookUrl, containerId } = body;
  if (!prompt || !containerId) {
    console.error("Missing prompt or containerId");
    return new Response("missing fields");
  }

  const flyToken = process.env.FLY_API_TOKEN;
  const flyApp = process.env.FLY_APP_NAME;

  if (!flyToken || !flyApp) {
    console.error("Missing Fly credentials");
    await sql.query("UPDATE containers SET status = $1, last_event_at = NOW() WHERE container_id = $2", ["failed", containerId]).catch(() => {});
    return new Response("no fly creds");
  }

  try {
    const envVars = {};
    for (const key of [
      "ANTHROPIC_API_KEY", "GITHUB_TOKEN", "NEON_API_KEY",
      "NETLIFY_AUTH_TOKEN", "NETLIFY_ACCOUNT_SLUG",
      "RECORD_REPLAY_API_KEY", "UPLOADTHING_TOKEN", "RESEND_API_KEY",
      "FLY_API_TOKEN", "FLY_APP_NAME", "WEBHOOK_SECRET",
    ]) {
      if (process.env[key]) envVars[key] = process.env[key];
    }

    const siteUrl = process.env.URL || "https://loop-builder.netlify.app";
    const containerWebhookUrl = webhookUrl || `${siteUrl}/.netlify/functions/app-builder-event`;

    const imageRef = process.env.CONTAINER_IMAGE_REF || DEFAULT_IMAGE_REF;
    const machineName = `app-building-${Math.random().toString(36).slice(2, 8)}`;

    const remoteExtra = {
      PORT: "3000",
      CONTAINER_NAME: machineName,
    };
    if (containerWebhookUrl) remoteExtra.WEBHOOK_URL = containerWebhookUrl;
    const containerEnv = buildContainerEnv(
      { repoUrl: repoUrl || "", cloneBranch: cloneBranch || "main", pushBranch: pushBranch || "" },
      envVars,
      remoteExtra,
    );

    // Create machine
    console.log(`Creating Fly machine ${machineName} in ${flyApp}...`);
    const machineId = await createMachine(flyApp, flyToken, imageRef, containerEnv, machineName);
    console.log(`Machine created: ${machineId}`);

    // Wait for machine to start
    console.log("Waiting for machine to start...");
    await waitForMachine(flyApp, flyToken, machineId);
    console.log("Machine started.");

    // Poll for HTTP readiness
    const baseUrl = `https://${flyApp}.fly.dev`;
    const maxWait = 180000;
    const interval = 2000;
    const start = Date.now();
    let ready = false;

    while (Date.now() - start < maxWait) {
      try {
        const res = await fetch(`${baseUrl}/status`, {
          headers: { "fly-force-instance-id": machineId },
        });
        if (res.ok) {
          ready = true;
          break;
        }
      } catch {
        // Not ready yet
      }
      await new Promise((r) => setTimeout(r, interval));
    }

    if (!ready) {
      // Clean up
      await flyFetch(`/apps/${flyApp}/machines/${machineId}?force=true`, flyToken, { method: "DELETE" }).catch(() => {});
      throw new Error("Container did not become ready within timeout");
    }

    console.log(`Container ready: ${machineName} at ${baseUrl}`);

    // Update DB with real machine name
    await sql.query(
      "UPDATE containers SET container_id = $1, name = $1, status = $2, last_event_at = NOW() WHERE container_id = $3",
      [machineName, "running", containerId]
    );

    // Send prompt to container
    const headers = { "Content-Type": "application/json", "fly-force-instance-id": machineId };
    console.log(`Sending prompt to ${baseUrl}/message...`);
    await fetch(`${baseUrl}/message`, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt }),
    });

    console.log("Done!");
  } catch (e) {
    console.error("spawn-container-background error:", e);
    const errMsg = (e.message || String(e)).slice(0, 200);
    await sql.query(
      "UPDATE containers SET status = $1, name = $2, last_event_at = NOW() WHERE container_id = $3",
      ["failed", errMsg, containerId]
    ).catch(() => {});
  }

  return new Response("ok");
};
