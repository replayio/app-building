import { defineConfig } from '@playwright/test'
import { devices as replayDevices, replayReporter } from '@replayio/playwright'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const deploymentTxt = fs.readFileSync(path.join(__dirname, 'deployment.txt'), 'utf-8')
const urlMatch = deploymentTxt.match(/^url:\s*(.+)$/m)
if (!urlMatch) throw new Error('Could not find deployed URL in deployment.txt')
const deployedUrl = urlMatch[1].trim()

export default defineConfig({
  testDir: './tests',
  testMatch: 'deployment.spec.ts',
  timeout: 60_000,
  actionTimeout: 15_000,
  navigationTimeout: 30_000,
  retries: 0,
  use: {
    ...replayDevices['Replay Chromium'],
    baseURL: deployedUrl,
  },
  reporter: [
    replayReporter({
      apiKey: process.env.REPLAY_API_KEY,
      upload: true,
    }),
    ['list'],
  ],
})
