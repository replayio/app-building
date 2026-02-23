import { execFileSync, execSync } from "child_process";
import { existsSync, mkdirSync, chmodSync } from "fs";
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

const FLYCTL_DIR = resolve(__dirname, "..", "node_modules", ".cache", "flyctl");
const FLYCTL_PATH = resolve(FLYCTL_DIR, process.platform === "win32" ? "flyctl.exe" : "flyctl");

/**
 * Download flyctl binary if not already cached.
 * Returns the absolute path to the flyctl binary.
 */
function ensureFlyctl(): string {
  if (existsSync(FLYCTL_PATH)) return FLYCTL_PATH;

  mkdirSync(FLYCTL_DIR, { recursive: true });

  const os = process.platform === "darwin" ? "macOS" : "Linux";
  const arch = process.arch === "arm64" ? "arm64" : "x86_64";
  const suffix = `_${os}_${arch}.tar.gz`;

  // Asset filenames include a version (e.g. flyctl_0.4.14_macOS_arm64.tar.gz),
  // so we query the GitHub API to get the actual download URL.
  const release = JSON.parse(
    execSync(
      'curl -fsSL "https://api.github.com/repos/superfly/flyctl/releases/latest"',
      { encoding: "utf-8", timeout: 30000 },
    ),
  ) as { assets: { name: string; browser_download_url: string }[] };

  const asset = release.assets.find((a) => a.name.endsWith(suffix));
  if (!asset) {
    throw new Error(`No flyctl release asset matching *${suffix}`);
  }

  console.log(`Downloading ${asset.name}...`);
  execSync(`curl -fsSL "${asset.browser_download_url}" | tar xz -C "${FLYCTL_DIR}" flyctl`, {
    stdio: ["pipe", "inherit", "inherit"],
    timeout: 120000,
  });
  chmodSync(FLYCTL_PATH, 0o755);
  console.log("flyctl downloaded.");

  return FLYCTL_PATH;
}

/**
 * Build the Docker image remotely on Fly's builders and push to the registry.
 * Returns the full registry image ref.
 */
export function remoteBuildAndPush(app: string, token: string): string {
  const projectRoot = resolve(__dirname, "..");
  const flyctl = ensureFlyctl();

  console.log("Building image remotely on Fly...");
  const output = execSync(
    `"${flyctl}" deploy --remote-only --build-only --push --app "${app}" 2>&1`,
    {
      cwd: projectRoot,
      encoding: "utf-8",
      env: { ...process.env, FLY_API_TOKEN: token, NO_COLOR: "1" },
      timeout: 600000,
    },
  );

  // Strip ANSI escape codes
  const clean = output.replace(/\x1b\[[0-9;]*m/g, "");

  // --build-only doesn't register the tag in the registry, but the builder
  // does push the manifest by digest. Parse the digest and use that.
  const digestMatch = clean.match(
    /pushing manifest for (registry\.fly\.io\/\S+)@(sha256:[0-9a-f]+)/,
  );
  if (digestMatch) {
    const imageRef = `${digestMatch[1].split("@")[0]}@${digestMatch[2]}`;
    console.log(`Remote build complete: ${imageRef}`);
    return imageRef;
  }

  // Fallback: try the "image:" line (works if flyctl registers the tag)
  const imageMatch = clean.match(/image:\s*(registry\.fly\.io\/\S+)/);
  if (imageMatch) {
    const imageRef = imageMatch[1];
    console.log(`Remote build complete: ${imageRef}`);
    return imageRef;
  }

  throw new Error("Could not parse image ref from flyctl output");
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
        restart: { policy: "no" },
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
            autostart: false,
            autostop: "off",
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
