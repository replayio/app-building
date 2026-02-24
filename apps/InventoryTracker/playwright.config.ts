import { defineConfig } from "@playwright/test";
import { devices as replayDevices, replayReporter } from "@replayio/playwright";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
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
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npx netlify dev --port 8888",
    url: "http://localhost:8888",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
