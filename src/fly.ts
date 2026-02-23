import { execFileSync } from "child_process";
import { resolve } from "path";

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
 * Create a Fly app via the Machines API and allocate IPs so .fly.dev DNS works.
 */
export async function createApp(token: string, name: string, org?: string): Promise<void> {
  await flyFetch("/apps", token, {
    method: "POST",
    body: JSON.stringify({ app_name: name, org_slug: org ?? "personal" }),
  });

  // Allocate shared IPv4 and IPv6 via GraphQL so the app gets a .fly.dev domain
  const gqlFetch = async (query: string, variables: Record<string, unknown>) => {
    const res = await fetch("https://api.fly.io/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Fly GraphQL error ${res.status}: ${body}`);
    }
    const data = await res.json() as { errors?: { message: string }[] };
    if (data.errors?.length) {
      throw new Error(`Fly GraphQL: ${data.errors[0].message}`);
    }
  };

  const allocateMutation = `
    mutation($input: AllocateIPAddressInput!) {
      allocateIpAddress(input: $input) {
        ipAddress { id address type }
      }
    }
  `;

  await gqlFetch(allocateMutation, { input: { appId: name, type: "shared_v4" } });
  await gqlFetch(allocateMutation, { input: { appId: name, type: "v6" } });
}

/**
 * Build the Docker image remotely on Fly's builders and push to the registry.
 * Returns the full registry image ref.
 */
export function remoteBuildAndPush(app: string, token: string): string {
  const projectRoot = resolve(__dirname, "..");

  console.log("Building image remotely on Fly...");
  const output = execFileSync(
    "flyctl",
    ["deploy", "--remote-only", "--build-only", "--push", "--app", app],
    {
      cwd: projectRoot,
      encoding: "utf-8",
      env: { ...process.env, FLY_API_TOKEN: token },
      timeout: 600000,
    },
  );

  // Parse the image ref from flyctl output
  const match = output.match(/registry\.fly\.io\/[^\s]+/);
  if (!match) {
    // Fallback: construct the ref using the app name
    const tag = `deployment-${Date.now()}`;
    const fallbackRef = `registry.fly.io/${app}:${tag}`;
    console.log(`Could not parse image ref from output, using ${fallbackRef}`);
    return fallbackRef;
  }

  const imageRef = match[0];
  console.log(`Remote build complete: ${imageRef}`);
  return imageRef;
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
          cpu_kind: "shared",
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
    `/apps/${app}/machines/${machineId}/wait?state=started&timeout=60`,
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

export interface FlyMachineInfo {
  id: string;
  name: string;
  state: string;
  created_at: string;
  region: string;
}

/**
 * List all machines for a Fly app.
 */
export async function listMachines(
  app: string,
  token: string,
): Promise<FlyMachineInfo[]> {
  const res = await flyFetch(`/apps/${app}/machines`, token);
  return (await res.json()) as FlyMachineInfo[];
}
