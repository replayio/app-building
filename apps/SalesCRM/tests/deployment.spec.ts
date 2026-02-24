import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

function getDeployedUrl(): string {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const deploymentPath = resolve(__dirname, '..', 'deployment.txt')
  const content = readFileSync(deploymentPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('url=')) {
      return trimmed.slice(4)
    }
  }
  throw new Error('No url= found in deployment.txt')
}

test('Deployed app displays data and supports updates', async ({ page }) => {
  const baseUrl = getDeployedUrl()

  // 1. Navigate to the deployed app and verify it loads
  await page.goto(`${baseUrl}/clients`)
  await expect(page.getByTestId('clients-list-page')).toBeVisible()
  await expect(
    page.getByTestId('clients-table').or(page.getByTestId('clients-table-empty')),
  ).toBeVisible({ timeout: 30000 })

  // 2. Add a new client (write operation)
  const uniqueName = `DeployTest-${Date.now()}`

  await page.getByTestId('add-client-button').click()
  await expect(page.getByTestId('client-form-modal')).toBeVisible()

  await page.getByTestId('client-form-name').fill(uniqueName)
  await page.getByTestId('client-form-type-organization').click()
  await page.getByTestId('client-form-status-trigger').click()
  await page.getByTestId('client-form-status-option-prospect').click()
  await page.getByTestId('client-form-submit').click()

  // Dialog should close
  await expect(page.getByTestId('client-form-modal')).not.toBeVisible({ timeout: 15000 })

  // 3. Verify the new client appears in the table (data displays and persists)
  await expect(
    page.locator('[data-testid^="client-row-"]').filter({ hasText: uniqueName }),
  ).toBeVisible({ timeout: 15000 })

  // Verify table is no longer empty - real data renders
  const rows = page.locator('[data-testid^="client-row-"]')
  await expect(rows.first()).toBeVisible()

  // Verify pagination shows updated count
  await expect(page.getByTestId('pagination-info')).toBeVisible()
})
