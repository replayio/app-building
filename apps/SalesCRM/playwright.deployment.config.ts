import { defineConfig, devices } from '@playwright/test';
import { replayReporter } from '@replayio/playwright';
import { homedir } from 'os';
import { join } from 'path';

const replayBrowser = join(homedir(), '.replay', 'runtimes', 'chrome-linux', 'chrome');

export default defineConfig({
  testDir: './tests',
  testMatch: 'deployment.spec.ts',
  timeout: 60000,
  projects: [
    {
      name: 'replay-chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: replayBrowser,
          env: {
            ...process.env,
            RECORD_ALL_CONTENT: '1',
          },
        },
      },
    },
  ],
  reporter: [
    replayReporter({
      apiKey: process.env.REPLAY_API_KEY,
      upload: true,
    }),
    ['list'],
  ],
});
