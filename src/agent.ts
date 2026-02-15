import { Command } from "commander";
import { spawnContainer } from "./container";

async function main(): Promise<void> {
  const program = new Command();
  program
    .argument("[prompt]", "optional prompt to pass to claude")
    .parse();

  const prompt = program.args[0] || null;
  await spawnContainer(prompt);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
