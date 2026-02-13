import { existsSync } from "fs";
import { resolve } from "path";
import { Command } from "commander";
import { spawnContainer } from "./container";

async function main(): Promise<void> {
  const program = new Command();
  program
    .argument("<appName>", "name of the app (must exist under apps/<appName>/)")
    .requiredOption("--load <strategies...>", "strategy file basenames (from strategies/)")
    .option("--max-iterations <n>", "maximum number of iterations", parseInt)
    .parse();

  const appName = program.args[0];
  const opts = program.opts();
  const strategyBasenames: string[] = opts.load;
  const maxIterations: number | undefined = opts.maxIterations;

  const projectRoot = resolve(__dirname, "..");

  // Validate app directory exists
  const appDir = resolve(projectRoot, "apps", appName);
  if (!existsSync(appDir)) {
    console.error(`App directory does not exist: ${appDir}`);
    console.error(`Create it first: mkdir -p apps/${appName} && cd apps/${appName} && git init`);
    process.exit(1);
  }

  // Validate strategy files exist
  for (const s of strategyBasenames) {
    const stratPath = resolve(projectRoot, "strategies", s);
    if (!existsSync(stratPath)) {
      console.error(`Strategy file not found: ${stratPath}`);
      process.exit(1);
    }
  }

  await spawnContainer(appName, strategyBasenames, maxIterations);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
