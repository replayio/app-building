import { defineConfig } from '@playwright/test'
import { devices as replayDevices, replayReporter } from '@replayio/playwright'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60000,
  reporter: [
    replayReporter({
      apiKey: process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY,
      upload: false,
    }),
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  use: {
    ...replayDevices['Replay Chromium'],
    baseURL: 'http://localhost:8888',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx netlify dev --port 8888',
    port: 8888,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL || '',
      IS_TEST: process.env.IS_TEST || 'true',
    },
  },
})
