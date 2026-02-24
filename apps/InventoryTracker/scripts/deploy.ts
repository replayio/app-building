import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { initSchema } from "./schema.js";

const appDir = path.resolve(__dirname, "..");
const envPath = path.join(appDir, ".env");
const deploymentPath = path.join(appDir, "deployment.txt");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readEnv(): Record<string, string> {
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  const env: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

function writeEnvValue(key: string, value: string): void {
  const existing = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf-8")
    : "";
  const lines = existing.split("\n");
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (idx !== -1) {
    lines[idx] = `${key}=${value}`;
  } else {
    lines.push(`${key}=${value}`);
  }
  fs.writeFileSync(envPath, lines.join("\n"));
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Neon project creation
// ---------------------------------------------------------------------------

async function ensureNeonProject(apiKey: string): Promise<{ projectId: string; databaseUrl: string }> {
  const env = readEnv();
  if (env.NEON_PROJECT_ID && env.DATABASE_URL) {
    console.log(`Reusing existing Neon project: ${env.NEON_PROJECT_ID}`);
    return { projectId: env.NEON_PROJECT_ID, databaseUrl: env.DATABASE_URL };
  }

  console.log("Creating new Neon project...");
  const res = await fetch("https://console.neon.tech/api/v2/projects", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ project: { name: "InventoryTracker" } }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Neon project creation failed (${res.status}): ${text}`);
    process.exit(1);
  }

  const data = await res.json();
  const projectId: string = data.project.id;
  const databaseUrl: string = data.connection_uris[0].connection_uri;

  writeEnvValue("NEON_PROJECT_ID", projectId);
  writeEnvValue("DATABASE_URL", databaseUrl);
  console.log(`Created Neon project: ${projectId}`);
  return { projectId, databaseUrl };
}

// ---------------------------------------------------------------------------
// Netlify site creation
// ---------------------------------------------------------------------------

function ensureNetlifySite(accountSlug: string): string {
  const env = readEnv();
  if (env.NETLIFY_SITE_ID) {
    console.log(`Reusing existing Netlify site: ${env.NETLIFY_SITE_ID}`);
    return env.NETLIFY_SITE_ID;
  }

  console.log("Creating new Netlify site...");
  const output = execSync(
    `npx netlify sites:create --account-slug ${accountSlug} --json`,
    { cwd: appDir, encoding: "utf-8" }
  );
  const site = JSON.parse(output);
  const siteId: string = site.id;
  writeEnvValue("NETLIFY_SITE_ID", siteId);
  console.log(`Created Netlify site: ${siteId}`);
  return siteId;
}

// ---------------------------------------------------------------------------
// Database schema sync
// ---------------------------------------------------------------------------

async function syncSchema(databaseUrl: string): Promise<void> {
  console.log("\nSyncing database schema...");
  await initSchema(databaseUrl);

  // Run migrations if migrate-db.ts exists
  const migratePath = path.join(appDir, "scripts", "migrate-db.ts");
  if (fs.existsSync(migratePath)) {
    console.log("Running migrations...");
    execSync(`npx tsx scripts/migrate-db.ts`, {
      cwd: appDir,
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
  }
  console.log("Schema sync complete.");
}

// ---------------------------------------------------------------------------
// Build and deploy
// ---------------------------------------------------------------------------

function buildAndDeploy(siteId: string): string {
  console.log("\nBuilding app...");
  execSync("npx vite build", { cwd: appDir, stdio: "inherit" });

  console.log("\nDeploying to Netlify...");
  const output = execSync(
    `npx netlify deploy --prod --dir dist --functions ./netlify/functions --site ${siteId} --json`,
    { cwd: appDir, encoding: "utf-8" }
  );
  const result = JSON.parse(output);
  const deployUrl: string = result.deploy_ssl_url || result.ssl_url || result.url;
  console.log(`Deployed to: ${deployUrl}`);
  return deployUrl;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // Populate .env from deployment.txt if .env is missing values
  if (fs.existsSync(deploymentPath)) {
    const env = readEnv();
    if (!env.NETLIFY_SITE_ID || !env.NEON_PROJECT_ID || !env.DATABASE_URL) {
      console.log("Populating .env from deployment.txt...");
      const deploymentLines = fs.readFileSync(deploymentPath, "utf-8").split("\n");
      for (const line of deploymentLines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const idx = trimmed.indexOf("=");
        if (idx === -1) continue;
        const key = trimmed.slice(0, idx);
        const value = trimmed.slice(idx + 1);
        if (
          ["NETLIFY_SITE_ID", "NEON_PROJECT_ID", "DATABASE_URL"].includes(key) &&
          !env[key]
        ) {
          writeEnvValue(key, value);
        }
      }
    }
  }

  const neonApiKey = requireEnv("NEON_API_KEY");
  const netlifyAccountSlug = requireEnv("NETLIFY_ACCOUNT_SLUG");
  requireEnv("NETLIFY_AUTH_TOKEN");

  // 1. Database setup
  const { projectId, databaseUrl } = await ensureNeonProject(neonApiKey);

  // 2. Schema sync
  await syncSchema(databaseUrl);

  // 3. Netlify site setup
  const siteId = ensureNetlifySite(netlifyAccountSlug);

  // 4. Build and deploy
  const deployUrl = buildAndDeploy(siteId);

  // 5. Write deployment.txt
  const deploymentContent = [
    `url=${deployUrl}`,
    `site_id=${siteId}`,
    `neon_project_id=${projectId}`,
    `database_url=${databaseUrl}`,
  ].join("\n");
  fs.writeFileSync(deploymentPath, deploymentContent + "\n");
  console.log("\ndeployment.txt updated.");

  console.log("\nDeployment complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
