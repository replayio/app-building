import { test, expect } from '@playwright/test'
import type { AppEntry } from '../src/store/appsSlice'
import type { ActivityEntry } from '../src/store/activitySlice'

const buildingApp: AppEntry = {
  id: 'saas-platform',
  name: 'My Saas Platform (Customer Portal MVP)',
  description:
    'An autonomously generated web application. Features user authentication, dashboard, and reporting module. Built with React and Node.js.',
  status: 'building',
  progress: 45,
  created_at: '2023-10-26T00:00:00Z',
  model: 'gpt-4 Turbo',
  deployment_url: null,
  source_url: null,
}

function setupMockAppWithEntries(app: AppEntry, entries: ActivityEntry[]) {
  return async (page: import('@playwright/test').Page) => {
    await page.route(`**/.netlify/functions/apps/${app.id}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(app),
      })
    })
    await page.route(`**/.netlify/functions/activity/${app.id}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(entries),
      })
    })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// ActivityLogEntry
// ──────────────────────────────────────────────────────────────────────────────

test.describe('ActivityLogEntry', () => {
  test('ActivityLogEntry: Displays timestamp', async ({ page }) => {
    const entries: ActivityEntry[] = [
      {
        id: 1,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:35:22Z',
        log_type: 'DEPLOY',
        message: 'Deployment successful.',
        detail: null,
        expandable: false,
      },
    ]

    await setupMockAppWithEntries(buildingApp, entries)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    // Wait for the entry to render
    await expect(page.getByTestId('activity-log-entry')).toHaveCount(1, { timeout: 10000 })

    // Verify the timestamp is displayed at the beginning of the entry
    const timestamp = page.getByTestId('activity-entry-timestamp')
    await expect(timestamp).toBeVisible()

    // Verify the format "MMM DD, HH:MM:SS" (e.g., "Oct 26, 14:35:22")
    await expect(timestamp).toContainText('Oct 26')
    await expect(timestamp).toContainText('14:35:22')
  })

  test('ActivityLogEntry: Displays type tag in bold brackets', async ({ page }) => {
    const entries: ActivityEntry[] = [
      {
        id: 1,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:35:22Z',
        log_type: 'DEPLOY',
        message: 'Deployment successful.',
        detail: null,
        expandable: false,
      },
    ]

    await setupMockAppWithEntries(buildingApp, entries)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    // Wait for the entry to render
    await expect(page.getByTestId('activity-log-entry')).toHaveCount(1, { timeout: 10000 })

    // Verify the type tag displays in uppercase within square brackets
    const typeTag = page.getByTestId('activity-entry-type')
    await expect(typeTag).toBeVisible()
    await expect(typeTag).toHaveText('[DEPLOY]')

    // Verify the type tag is bold (font-weight >= 700)
    const fontWeight = await typeTag.evaluate((el) => window.getComputedStyle(el).fontWeight)
    expect(Number(fontWeight)).toBeGreaterThanOrEqual(700)

    // Verify pipe separators exist between timestamp, type tag, and message
    const entryRow = page.getByTestId('activity-log-entry').locator('.activity-entry__row')
    const rowText = await entryRow.textContent()
    expect(rowText).toContain('|')

    // Verify the type tag appears after the timestamp (separated by a pipe)
    const timestamp = page.getByTestId('activity-entry-timestamp')
    const timestampBox = await timestamp.boundingBox()
    const typeBox = await typeTag.boundingBox()
    expect(timestampBox).toBeTruthy()
    expect(typeBox).toBeTruthy()
    expect(typeBox!.x).toBeGreaterThan(timestampBox!.x)
  })

  test('ActivityLogEntry: DEPLOY type tag with checkmark icon and green styling', async ({ page }) => {
    const entries: ActivityEntry[] = [
      {
        id: 1,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:35:22Z',
        log_type: 'DEPLOY',
        message:
          'Deployment successful. App is live at https://my-saas-platform.vercel.app. Final verification complete.',
        detail: null,
        expandable: false,
      },
    ]

    await setupMockAppWithEntries(buildingApp, entries)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    // Wait for the entry to render
    await expect(page.getByTestId('activity-log-entry')).toHaveCount(1, { timeout: 10000 })

    const entry = page.getByTestId('activity-log-entry')

    // Verify the entry has the deploy color class (green-tinted background)
    const entryClass = await entry.getAttribute('class')
    expect(entryClass).toContain('activity-entry--deploy')

    // Verify green-tinted background color
    const bgColor = await entry.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    // --color-log-deploy-bg: #f0fdf4 which is rgb(240, 253, 244)
    expect(bgColor).toContain('240')
    expect(bgColor).toContain('253')
    expect(bgColor).toContain('244')

    // Verify a green checkmark circle icon is present on the left side
    const icon = entry.locator('.activity-entry__icon')
    await expect(icon).toBeVisible()

    // Verify the icon has green color
    const iconColor = await icon.evaluate((el) => window.getComputedStyle(el).color)
    // --color-log-deploy: #22c55e which is rgb(34, 197, 94)
    expect(iconColor).toContain('34')
    expect(iconColor).toContain('197')
    expect(iconColor).toContain('94')

    // Verify the icon is on the left side (before the timestamp)
    const iconBox = await icon.boundingBox()
    const timestampBox = await page.getByTestId('activity-entry-timestamp').boundingBox()
    expect(iconBox).toBeTruthy()
    expect(timestampBox).toBeTruthy()
    expect(iconBox!.x).toBeLessThan(timestampBox!.x)

    // Verify the type tag reads "[DEPLOY]" in bold
    const typeTag = page.getByTestId('activity-entry-type')
    await expect(typeTag).toHaveText('[DEPLOY]')
    const fontWeight = await typeTag.evaluate((el) => window.getComputedStyle(el).fontWeight)
    expect(Number(fontWeight)).toBeGreaterThanOrEqual(700)
  })

  test('ActivityLogEntry: TEST type tag with info icon and blue styling', async ({ page }) => {
    const entries: ActivityEntry[] = [
      {
        id: 1,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:35:22Z',
        log_type: 'TEST',
        message:
          'Running automated integration tests for the Reporting Module. 15/15 tests passed. Generating test report.',
        detail: null,
        expandable: false,
      },
    ]

    await setupMockAppWithEntries(buildingApp, entries)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    // Wait for the entry to render
    await expect(page.getByTestId('activity-log-entry')).toHaveCount(1, { timeout: 10000 })

    const entry = page.getByTestId('activity-log-entry')

    // Verify the entry has the test color class (blue-tinted background)
    const entryClass = await entry.getAttribute('class')
    expect(entryClass).toContain('activity-entry--test')

    // Verify blue-tinted background color
    const bgColor = await entry.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    // --color-log-test-bg: #eff6ff which is rgb(239, 246, 255)
    expect(bgColor).toContain('239')
    expect(bgColor).toContain('246')
    expect(bgColor).toContain('255')

    // Verify a blue info circle icon is present on the left side
    const icon = entry.locator('.activity-entry__icon')
    await expect(icon).toBeVisible()

    // Verify the icon has blue color
    const iconColor = await icon.evaluate((el) => window.getComputedStyle(el).color)
    // --color-log-test: #3b82f6 which is rgb(59, 130, 246)
    expect(iconColor).toContain('59')
    expect(iconColor).toContain('130')
    expect(iconColor).toContain('246')

    // Verify the icon is on the left side (before the timestamp)
    const iconBox = await icon.boundingBox()
    const timestampBox = await page.getByTestId('activity-entry-timestamp').boundingBox()
    expect(iconBox).toBeTruthy()
    expect(timestampBox).toBeTruthy()
    expect(iconBox!.x).toBeLessThan(timestampBox!.x)

    // Verify the type tag reads "[TEST]" in bold
    const typeTag = page.getByTestId('activity-entry-type')
    await expect(typeTag).toHaveText('[TEST]')
    const fontWeight = await typeTag.evaluate((el) => window.getComputedStyle(el).fontWeight)
    expect(Number(fontWeight)).toBeGreaterThanOrEqual(700)
  })
})
