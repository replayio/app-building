import { defineConfig } from '@playwright/test';
import { replayDevices } from '@replayio/playwright';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:8888',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'replay-chromium',
      use: { ...replayDevices['Replay Chromium'] },
    },
  ],
  webServer: {
    command: 'npx netlify dev',
    url: 'http://localhost:8888',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
