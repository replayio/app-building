import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["html"], ["list"]],
  use: {
    baseURL: "http://localhost:8888",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npx netlify dev --port 8888",
    url: "http://localhost:8888",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
