import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getDeployedUrl(): string {
  const deploymentFile = resolve(__dirname, '..', 'deployment.txt');
  const content = readFileSync(deploymentFile, 'utf-8');
  const match = content.match(/url=(\S+)/);
  if (!match) throw new Error('Could not find deployed URL in deployment.txt');
  return match[1];
}

const DEPLOYED_URL = getDeployedUrl();

test('deployment: data displays and can be updated', async ({ page }) => {
  // Navigate to the deployed app
  await page.goto(DEPLOYED_URL);

  // Verify the page loads and shows real client data
  await expect(page.getByTestId('clients-table')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('client-name').first()).toBeVisible({ timeout: 10000 });

  // Add a new client to verify write operations work
  await page.getByTestId('add-new-client-button').click();
  await expect(page.getByTestId('add-client-modal')).toBeVisible();

  const testClientName = `Deploy Test ${Date.now()}`;
  await page.getByTestId('client-name-input').fill(testClientName);
  await page.getByTestId('client-save-button').click();

  // Verify the new client appears in the table
  await expect(page.getByText(testClientName)).toBeVisible({ timeout: 10000 });
});
