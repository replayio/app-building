import { test, expect } from '@playwright/test'

test('deployment: app displays data and supports updates', async ({ page }) => {
  // 1. Navigate to the main page and confirm the UI renders correctly
  await page.goto('/')
  await expect(page.getByTestId('status-filter')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('app-card-grid')).toBeVisible({ timeout: 15000 })

  // 2. Submit a new app request (write operation)
  const testAppName = `Deploy Test ${Date.now()}`
  const testDescription = 'Automated deployment verification test app'

  await page.getByTestId('request-app-cta').click()
  await expect(page.getByTestId('request-page')).toBeVisible({ timeout: 10000 })

  await page.getByTestId('app-name-input').fill(testAppName)
  await page.getByTestId('app-description-input').fill(testDescription)
  await page.getByTestId('describe-app-form-submit').click()

  // Wait for assessment screen, then confirmation
  await expect(page.getByTestId('assessment-screen')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('acceptance-result')).toBeVisible({ timeout: 30000 })

  // 3. Verify the new app persisted — navigate back and check data displays
  await page.goto('/')
  await expect(page.getByTestId('status-filter')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('app-card-grid')).toBeVisible({ timeout: 15000 })

  // The new app should be queued
  await page.getByTestId('status-filter-tab-queued').click()

  const newCard = page.getByTestId('app-card').filter({
    has: page.getByTestId('app-card-title').filter({ hasText: testAppName }),
  })
  await expect(newCard).toBeVisible({ timeout: 15000 })

  // Verify the card has real data
  await expect(newCard.getByTestId('app-card-title')).toContainText(testAppName)
  await expect(newCard.getByTestId('app-card-description')).toContainText(testDescription)
})
