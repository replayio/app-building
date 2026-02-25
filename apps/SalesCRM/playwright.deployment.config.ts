import { defineConfig } from "@playwright/test";
import { devices as replayDevices, replayReporter } from "@replayio/playwright";

export default defineConfig({
  testDir: "./tests",
  testMatch: "deployment.spec.ts",
  fullyParallel: false,
  retries: 0,
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  reporter: [
    replayReporter({
      apiKey: process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY,
      upload: true,
    }),
    ["list"],
  ],
  use: {
    ...replayDevices["Replay Chromium"],
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
});
