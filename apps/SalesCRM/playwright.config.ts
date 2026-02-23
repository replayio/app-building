import { defineConfig, devices } from '@playwright/test'
import { replayReporter } from '@replayio/playwright'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [
    replayReporter({ upload: false }),
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:8888',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx netlify dev --port 8888',
    port: 8888,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL || '',
      IS_TEST: process.env.IS_TEST || 'true',
    },
  },
})
