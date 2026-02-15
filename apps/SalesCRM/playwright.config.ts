import { defineConfig, devices } from '@playwright/test';

const [REDACTED]Browser = '/home/node/.[REDACTED]/runtimes/chrome-linux/chrome';

export default defineConfig({
  globalSetup: './tests/global-setup.ts',
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html'], ['list']],
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:8888',
    trace: 'on-first-retry',
    launchOptions: {
      executablePath: [REDACTED]Browser,
      env: {
        ...process.env,
        RECORD_ALL_CONTENT: '1',
      },
    },
  },
  projects: [
    {
      name: '[REDACTED]-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx netlify dev --port 8888 --functions ./netlify/functions',
    url: 'http://localhost:8888',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
