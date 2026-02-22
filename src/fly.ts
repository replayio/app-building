import { execFileSync } from "child_process";

const API_BASE = "https://api.machines.dev/v1";

async function flyFetch(
  path: string,
  token: string,
  opts: RequestInit = {},
): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...((opts.headers as Record<string, string>) ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Fly API ${opts.method ?? "GET"} ${path} → ${res.status}: ${body}`);
  }
  return res;
}

/**
 * Create a Fly app via the Machines API.
 */
export async function createApp(token: string, name: string, org?: string): Promise<void> {
  await flyFetch("/apps", token, {
    method: "POST",
    body: JSON.stringify({ app_name: name, org_slug: org ?? "personal" }),
  });
}

/**
 * Push a local Docker image to the Fly.io registry.
 * Returns the full registry image ref.
 */
export function pushImage(app: string, token: string, localTag: string): string {
  const registryRef = `registry.fly.io/${app}:${localTag}`;

  console.log("Logging in to Fly registry...");
  execFileSync("docker", ["login", "registry.fly.io", "-u", "x", "--password-stdin"], {
    input: token,
    stdio: ["pipe", "inherit", "inherit"],
    timeout: 30000,
  });

  console.log(`Tagging image as ${registryRef}...`);
  execFileSync("docker", ["tag", localTag, registryRef], {
    stdio: "inherit",
    timeout: 30000,
  });

  console.log("Pushing image to Fly registry...");
  execFileSync("docker", ["push", registryRef], {
    stdio: "inherit",
    timeout: 600000,
  });

  return registryRef;
}

/**
 * Create a Fly Machine with the given image and env vars.
 * Returns the machine ID.
 */
export async function createMachine(
  app: string,
  token: string,
  image: string,
  env: Record<string, string>,
  name: string,
): Promise<string> {
  const res = await flyFetch(`/apps/${app}/machines`, token, {
    method: "POST",
    body: JSON.stringify({
      name,
      config: {
        image,
        env,
        guest: {
          cpus: 4,
          memory_mb: 4096,
        },
        services: [
          {
            ports: [{ port: 443, handlers: ["tls", "http"] }],
            protocol: "tcp",
            internal_port: 3000,
          },
        ],
      },
    }),
  });

  const data = (await res.json()) as { id: string };
  return data.id;
}

/**
 * Wait for a Fly Machine to reach the "started" state.
 */
export async function waitForMachine(
  app: string,
  token: string,
  machineId: string,
): Promise<void> {
  await flyFetch(
    `/apps/${app}/machines/${machineId}/wait?state=started&timeout=120`,
    token,
  );
}

/**
 * Destroy a Fly Machine (force).
 */
export async function destroyMachine(
  app: string,
  token: string,
  machineId: string,
): Promise<void> {
  await flyFetch(`/apps/${app}/machines/${machineId}?force=true`, token, {
    method: "DELETE",
  });
}
