import { defineConfig } from '@playwright/test'
import { devices as replayDevices, replayReporter } from '@replayio/playwright'
import fs from 'fs'

const deploymentTxt = fs.readFileSync('deployment.txt', 'utf-8')
const deployedUrl = deploymentTxt
  .split('\n')
  .find((l) => l.startsWith('deployed_url='))
  ?.replace('deployed_url=', '')
  .trim()

if (!deployedUrl) {
  throw new Error('Could not read deployed_url from deployment.txt')
}

export default defineConfig({
  testDir: './tests',
  testMatch: 'deployment.spec.ts',
  fullyParallel: false,
  retries: 0,
  timeout: 60000,
  reporter: [
    replayReporter({
      apiKey: process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY,
      upload: true,
    }),
    ['list'],
  ],
  use: {
    ...replayDevices['Replay Chromium'],
    baseURL: deployedUrl,
    headless: true,
  },
})
