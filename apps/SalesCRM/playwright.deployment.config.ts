import { defineConfig } from '@playwright/test';
import { devices as [REDACTED]Devices, [REDACTED]Reporter } from '@[REDACTED]io/playwright';

export default defineConfig({
  testDir: './tests',
  testMatch: 'deployment.spec.ts',
  timeout: 60000,
  projects: [
    {
      name: '[REDACTED]-chromium',
      use: {
        ...[REDACTED]Devices['Replay Chromium'],
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
