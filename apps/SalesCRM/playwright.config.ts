import { defineConfig, devices } from '@playwright/test'
import { replayDevices } from '@replayio/playwright'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL: 'http://localhost:8888',
    trace: 'on-first-retry',
    ...(process.env.REPLAY
      ? replayDevices['Replay Chromium']
      : {}),
  },
  projects: [
    {
      name: 'chromium',
      use: process.env.REPLAY
        ? replayDevices['Replay Chromium']
        : { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx netlify dev --port 8888 --functions ./netlify/functions',
    port: 8888,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
