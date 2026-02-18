import { defineConfig, devices } from '@playwright/test';
import { [REDACTED]Reporter } from '@[REDACTED]io/playwright';
import { homedir } from 'os';
import { join } from 'path';

const [REDACTED]Browser = join(homedir(), '.[REDACTED]', 'runtimes', 'chrome-linux', 'chrome');

export default defineConfig({
  testDir: './tests',
  testMatch: 'deployment.spec.ts',
  timeout: 60000,
  projects: [
    {
      name: '[REDACTED]-chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: [REDACTED]Browser,
          env: {
            ...process.env,
            RECORD_ALL_CONTENT: '1',
          },
        },
      },
    },
  ],
  reporter: [
    [REDACTED]Reporter({
      apiKey: process.env.REPLAY_API_KEY,
      upload: true,
    }),
    ['list'],
  ],
});
