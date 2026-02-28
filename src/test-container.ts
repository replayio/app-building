import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
import { loadDotEnv, FileContainerRegistry, type ContainerConfig, spawnTestContainer } from "./package";

const projectRoot = resolve(__dirname, "..");
const envVars = loadDotEnv(projectRoot);
const config: ContainerConfig = {
  projectRoot,
  envVars,
  registry: new FileContainerRegistry(resolve(projectRoot, ".container-registry.jsonl")),
};

spawnTestContainer(config).then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
