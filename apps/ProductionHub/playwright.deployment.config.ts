import { defineConfig } from "@playwright/test";
import { devices as replayDevices, replayReporter } from "@replayio/playwright";
import { readFileSync } from "fs";
import path from "path";

const deploymentTxt = readFileSync(
  path.join(import.meta.dirname, "deployment.txt"),
  "utf-8"
);
const urlMatch = deploymentTxt.match(/^url=(.+)$/m);
const deployedUrl = urlMatch?.[1]?.trim();

if (!deployedUrl) {
  throw new Error("Could not read deployed URL from deployment.txt");
}

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/deployment.spec.ts",
  fullyParallel: false,
  retries: 0,
  timeout: 120000,
  expect: {
    timeout: 30000,
  },
  reporter: [
    replayReporter({
      apiKey: process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY,
      upload: true,
    }),
    ["list"],
  ],
  use: {
    ...replayDevices["Replay Chromium"],
    baseURL: deployedUrl,
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },
});
