import { defineConfig } from '@playwright/test';
import { devices as replayDevices, replayReporter } from '@replayio/playwright';

export default defineConfig({
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
  testDir: './tests',
  testIgnore: ['**/deployment.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? undefined : 8,
  reporter: [
    replayReporter({ apiKey: process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY, upload: false }),
    ['html', { open: 'never' }],
    ['./tests/json-log-reporter.ts'],
  ],
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:8888',
    trace: 'on-first-retry',
    storageState: './tests/test-storage-state.json',
    ...replayDevices['Replay Chromium'],
  },
  webServer: {
    command: 'env -u DATABASE_URL IS_TEST=true npx netlify dev --port 8888 --functions ./netlify/functions',
    url: 'http://localhost:8888',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
