import { defineConfig } from '@playwright/test'
import { devices as replayDevices, replayReporter } from '@replayio/playwright'

export default defineConfig({
  testDir: './tests',
  testMatch: 'deployment.spec.ts',
  fullyParallel: false,
  retries: 0,
  timeout: 120000,
  expect: { timeout: 30000 },
  reporter: [
    replayReporter({
      apiKey: process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY,
      upload: true,
    }),
    ['list'],
  ],
  use: {
    trace: 'on-first-retry',
    ...replayDevices['Replay Chromium'],
  },
  projects: [
    {
      name: 'replay-chromium',
      use: { ...replayDevices['Replay Chromium'] },
    },
  ],
})
