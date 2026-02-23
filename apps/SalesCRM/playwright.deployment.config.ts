import { defineConfig } from '@playwright/test';
import { devices as replayDevices, replayReporter } from '@replayio/playwright';

export default defineConfig({
  testDir: './tests',
  testMatch: 'deployment.spec.ts',
  timeout: 60000,
  projects: [
    {
      name: 'replay-chromium',
      use: {
        ...replayDevices['Replay Chromium'],
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
