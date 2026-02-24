import { defineConfig } from "@playwright/test";
import { devices as replayDevices, replayReporter } from "@replayio/playwright";

export default defineConfig({
  testDir: "./tests",
  testIgnore: ['**/deployment.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  reporter: [
    replayReporter({
      apiKey: process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY,
      upload: false,
    }),
    ["json", { outputFile: "test-results/results.json" }],
    ["list"],
  ],
  use: {
    ...replayDevices["Replay Chromium"],
    baseURL: "http://localhost:8888",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  webServer: {
    command: "npx netlify dev --port 8888 --functions ./netlify/functions",
    port: 8888,
    timeout: 60000,
    reuseExistingServer: !process.env.CI,
  },
});
