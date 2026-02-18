import { spawnTestContainer } from "./container";

spawnTestContainer().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
