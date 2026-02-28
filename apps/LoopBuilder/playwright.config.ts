import { defineConfig } from '@playwright/test'
import { devices as replayDevices, replayReporter } from '@replayio/playwright'

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: true,
  retries: 0,
  use: {
    ...replayDevices['Replay Chromium'],
    baseURL: 'http://localhost:8888',
  },
  reporter: [
    replayReporter({ upload: false }),
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { open: 'never' }],
  ],
  webServer: {
    command: 'npx netlify dev',
    port: 8888,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
