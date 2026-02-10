import { loadConfig } from "./config";
import { runContainers } from "./container";

async function main(): Promise<void> {
  const configPath = process.argv[2];
  if (!configPath) {
    console.error("Usage: npm run agent -- <config.json>");
    process.exit(1);
  }

  const config = loadConfig(configPath);
  await runContainers(config);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
