import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { initSchema, runMigrations } from "./schema.js";

const appDir = path.resolve(import.meta.dirname, "..");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function env(key: string): string {
  const val = process.env[key];
  if (!val) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return val;
}

function readEnvFile(): Record<string, string> {
  const envPath = path.join(appDir, ".env");
  if (!existsSync(envPath)) return {};
  const lines = readFileSync(envPath, "utf-8").split("\n");
  const result: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    result[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return result;
}

function writeEnvValue(key: string, value: string) {
  const envPath = path.join(appDir, ".env");
  const existing = existsSync(envPath)
    ? readFileSync(envPath, "utf-8")
    : "";
  const lines = existing.split("\n");
  let found = false;
  const updated = lines.map((line) => {
    if (line.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!found) updated.push(`${key}=${value}`);
  writeFileSync(envPath, updated.join("\n"));
}

function run(cmd: string, label: string) {
  console.log(`\n--- ${label} ---`);
  execSync(cmd, { stdio: "inherit", cwd: appDir });
}

// ---------------------------------------------------------------------------
// Deployment.txt helpers
// ---------------------------------------------------------------------------

function readDeploymentTxt(): Record<string, string> {
  const p = path.join(appDir, "deployment.txt");
  if (!existsSync(p)) return {};
  const result: Record<string, string> = {};
  for (const line of readFileSync(p, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    result[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return result;
}

function populateEnvFromDeployment() {
  const deployment = readDeploymentTxt();
  const envVals = readEnvFile();

  if (!envVals["NETLIFY_SITE_ID"] && deployment["site_id"]) {
    writeEnvValue("NETLIFY_SITE_ID", deployment["site_id"]);
  }
  if (!envVals["NEON_PROJECT_ID"] && deployment["neon_project_id"]) {
    writeEnvValue("NEON_PROJECT_ID", deployment["neon_project_id"]);
  }
  if (!envVals["DATABASE_URL"] && deployment["database_url"]) {
    writeEnvValue("DATABASE_URL", deployment["database_url"]);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const neonApiKey = env("NEON_API_KEY");
  env("NETLIFY_AUTH_TOKEN");
  const netlifyAccountSlug = env("NETLIFY_ACCOUNT_SLUG");

  // Populate .env from deployment.txt if values are missing
  populateEnvFromDeployment();

  let envVals = readEnvFile();

  // --- Database setup ---
  let neonProjectId = envVals["NEON_PROJECT_ID"];
  let databaseUrl = envVals["DATABASE_URL"];

  if (!neonProjectId) {
    console.log("\n--- Creating Neon project ---");
    const res = await fetch("https://console.neon.tech/api/v2/projects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${neonApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project: { name: "sales-crm" } }),
    });
    if (!res.ok) {
      console.error("Failed to create Neon project:", await res.text());
      process.exit(1);
    }
    const data = await res.json();
    neonProjectId = data.project.id;
    databaseUrl = data.connection_uris[0].connection_uri;
    writeEnvValue("NEON_PROJECT_ID", neonProjectId);
    writeEnvValue("DATABASE_URL", databaseUrl);
    console.log(`Neon project created: ${neonProjectId}`);
  }

  if (!databaseUrl) {
    console.error("DATABASE_URL is not set in .env and no new project was created.");
    process.exit(1);
  }

  // --- Database schema sync ---
  console.log("\n--- Syncing database schema ---");
  await initSchema(databaseUrl);
  await runMigrations(databaseUrl);
  console.log("Schema synced.");

  // --- Netlify site setup ---
  envVals = readEnvFile();
  let netlifySiteId = envVals["NETLIFY_SITE_ID"];

  if (!netlifySiteId) {
    console.log("\n--- Creating Netlify site ---");
    const netlifyToken = env("NETLIFY_AUTH_TOKEN");
    const siteName = `sales-crm-${Date.now()}`;
    const siteRes = await fetch(
      `https://api.netlify.com/api/v1/${netlifyAccountSlug}/sites`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${netlifyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: siteName }),
      }
    );
    if (!siteRes.ok) {
      console.error("Failed to create Netlify site:", await siteRes.text());
      process.exit(1);
    }
    const siteData = await siteRes.json();
    netlifySiteId = siteData.id;
    writeEnvValue("NETLIFY_SITE_ID", netlifySiteId);
    console.log(`Netlify site created: ${netlifySiteId}`);
  }

  // --- Set DATABASE_URL on Netlify site so functions can access the database ---
  console.log("\n--- Setting DATABASE_URL on Netlify ---");
  const netlifyToken = env("NETLIFY_AUTH_TOKEN");
  const envRes = await fetch(
    `https://api.netlify.com/api/v1/accounts/${netlifyAccountSlug}/env?site_id=${netlifySiteId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          key: "DATABASE_URL",
          scopes: ["functions"],
          values: [{ value: databaseUrl, context: "all" }],
        },
      ]),
    }
  );
  if (!envRes.ok) {
    // If it already exists, try updating via PUT
    const putRes = await fetch(
      `https://api.netlify.com/api/v1/accounts/${netlifyAccountSlug}/env/DATABASE_URL?site_id=${netlifySiteId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${netlifyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "DATABASE_URL",
          scopes: ["functions"],
          values: [{ value: databaseUrl, context: "all" }],
        }),
      }
    );
    if (!putRes.ok) {
      console.error("Failed to set DATABASE_URL on Netlify:", await putRes.text());
      process.exit(1);
    }
  }
  console.log("DATABASE_URL set on Netlify.");

  // --- Build ---
  run("npx vite build", "Building app");

  // --- Deploy ---
  console.log("\n--- Deploying to Netlify ---");
  const deployOutput = execSync(
    `npx netlify deploy --prod --dir dist --functions ./netlify/functions --site ${netlifySiteId} --json`,
    { cwd: appDir, encoding: "utf-8" }
  );
  const deployData = JSON.parse(deployOutput);
  const deployedUrl = deployData.deploy_url || deployData.url;
  console.log(`Deployed to: ${deployedUrl}`);

  // --- Write deployment.txt ---
  const deploymentContent = [
    `url=${deployedUrl}`,
    `site_id=${netlifySiteId}`,
    `neon_project_id=${neonProjectId}`,
    `database_url=${databaseUrl}`,
  ].join("\n") + "\n";
  writeFileSync(path.join(appDir, "deployment.txt"), deploymentContent);
  console.log("\ndeployment.txt updated.");

  console.log("\nDeployment complete!");
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
