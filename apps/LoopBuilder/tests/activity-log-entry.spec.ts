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

  test('ActivityLogEntry: REASONING type tag with gear icon', async ({ page }) => {
    const entries: ActivityEntry[] = [
      {
        id: 1,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:35:22Z',
        log_type: 'REASONING',
        message:
          'Designing the database schema for the Reporting Module. Considering relational versus document structure...',
        detail: null,
        expandable: false,
      },
    ]

    await setupMockAppWithEntries(buildingApp, entries)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    // Wait for the entry to render
    await expect(page.getByTestId('activity-log-entry')).toHaveCount(1, { timeout: 10000 })

    const entry = page.getByTestId('activity-log-entry')

    // Verify the entry has the reasoning color class
    const entryClass = await entry.getAttribute('class')
    expect(entryClass).toContain('activity-entry--reasoning')

    // Verify a gear/cog icon is present on the left side
    const icon = entry.locator('.activity-entry__icon')
    await expect(icon).toBeVisible()

    // Verify the icon has the reasoning color (amber: #f59e0b -> rgb(245, 158, 11))
    const iconColor = await icon.evaluate((el) => window.getComputedStyle(el).color)
    expect(iconColor).toContain('245')
    expect(iconColor).toContain('158')
    expect(iconColor).toContain('11')

    // Verify the icon is on the left side (before the timestamp)
    const iconBox = await icon.boundingBox()
    const timestampBox = await page.getByTestId('activity-entry-timestamp').boundingBox()
    expect(iconBox).toBeTruthy()
    expect(timestampBox).toBeTruthy()
    expect(iconBox!.x).toBeLessThan(timestampBox!.x)

    // Verify the type tag reads "[REASONING]" in bold
    const typeTag = page.getByTestId('activity-entry-type')
    await expect(typeTag).toHaveText('[REASONING]')
    const fontWeight = await typeTag.evaluate((el) => window.getComputedStyle(el).fontWeight)
    expect(Number(fontWeight)).toBeGreaterThanOrEqual(700)
  })

  test('ActivityLogEntry: PLAN type tag with info icon', async ({ page }) => {
    const entries: ActivityEntry[] = [
      {
        id: 1,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:35:22Z',
        log_type: 'PLAN',
        message:
          'Initial project plan generated. Key feature modules identified: Authentication, User Dashboard, Reporting, and Settings.',
        detail: null,
        expandable: false,
      },
    ]

    await setupMockAppWithEntries(buildingApp, entries)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    // Wait for the entry to render
    await expect(page.getByTestId('activity-log-entry')).toHaveCount(1, { timeout: 10000 })

    const entry = page.getByTestId('activity-log-entry')

    // Verify the entry has the plan color class (blue-tinted background)
    const entryClass = await entry.getAttribute('class')
    expect(entryClass).toContain('activity-entry--plan')

    // Verify blue-tinted background color
    const bgColor = await entry.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    // --color-log-plan-bg: #eff6ff which is rgb(239, 246, 255)
    expect(bgColor).toContain('239')
    expect(bgColor).toContain('246')
    expect(bgColor).toContain('255')

    // Verify a blue info circle icon is present on the left side
    const icon = entry.locator('.activity-entry__icon')
    await expect(icon).toBeVisible()

    // Verify the icon has blue color (--color-log-plan: #3b82f6 -> rgb(59, 130, 246))
    const iconColor = await icon.evaluate((el) => window.getComputedStyle(el).color)
    expect(iconColor).toContain('59')
    expect(iconColor).toContain('130')
    expect(iconColor).toContain('246')

    // Verify the icon is on the left side (before the timestamp)
    const iconBox = await icon.boundingBox()
    const timestampBox = await page.getByTestId('activity-entry-timestamp').boundingBox()
    expect(iconBox).toBeTruthy()
    expect(timestampBox).toBeTruthy()
    expect(iconBox!.x).toBeLessThan(timestampBox!.x)

    // Verify the type tag reads "[PLAN]" in bold
    const typeTag = page.getByTestId('activity-entry-type')
    await expect(typeTag).toHaveText('[PLAN]')
    const fontWeight = await typeTag.evaluate((el) => window.getComputedStyle(el).fontWeight)
    expect(Number(fontWeight)).toBeGreaterThanOrEqual(700)
  })

  test('ActivityLogEntry: INIT type tag with gear icon', async ({ page }) => {
    const entries: ActivityEntry[] = [
      {
        id: 1,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:35:22Z',
        log_type: 'INIT',
        message:
          "App creation initiated from prompt: 'Create a SaaS customer portal MVP with auth, dashboard, and reporting.' Project structure initialized.",
        detail: null,
        expandable: false,
      },
    ]

    await setupMockAppWithEntries(buildingApp, entries)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    // Wait for the entry to render
    await expect(page.getByTestId('activity-log-entry')).toHaveCount(1, { timeout: 10000 })

    const entry = page.getByTestId('activity-log-entry')

    // Verify the entry has the init color class
    const entryClass = await entry.getAttribute('class')
    expect(entryClass).toContain('activity-entry--init')

    // Verify a gear/cog icon is present on the left side
    const icon = entry.locator('.activity-entry__icon')
    await expect(icon).toBeVisible()

    // Verify the icon has the init color (--color-log-init: #64748b -> rgb(100, 116, 139))
    const iconColor = await icon.evaluate((el) => window.getComputedStyle(el).color)
    expect(iconColor).toContain('100')
    expect(iconColor).toContain('116')
    expect(iconColor).toContain('139')

    // Verify the icon is on the left side (before the timestamp)
    const iconBox = await icon.boundingBox()
    const timestampBox = await page.getByTestId('activity-entry-timestamp').boundingBox()
    expect(iconBox).toBeTruthy()
    expect(timestampBox).toBeTruthy()
    expect(iconBox!.x).toBeLessThan(timestampBox!.x)

    // Verify the type tag reads "[INIT]" in bold
    const typeTag = page.getByTestId('activity-entry-type')
    await expect(typeTag).toHaveText('[INIT]')
    const fontWeight = await typeTag.evaluate((el) => window.getComputedStyle(el).fontWeight)
    expect(Number(fontWeight)).toBeGreaterThanOrEqual(700)
  })

  test('ActivityLogEntry: Displays message text after type tag', async ({ page }) => {
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

    // Verify the message text is displayed
    const message = page.getByTestId('activity-entry-message')
    await expect(message).toBeVisible()
    await expect(message).toContainText('Deployment successful.')
    await expect(message).toContainText('Final verification complete.')

    // Verify the message appears after the type tag (separated by a pipe)
    const entryRow = page.getByTestId('activity-log-entry').locator('.activity-entry__row')
    const rowText = await entryRow.textContent()
    expect(rowText).toContain('|')

    // Verify the message is positioned after the type tag
    const typeTag = page.getByTestId('activity-entry-type')
    const typeBox = await typeTag.boundingBox()
    const messageBox = await message.boundingBox()
    expect(typeBox).toBeTruthy()
    expect(messageBox).toBeTruthy()
    expect(messageBox!.x).toBeGreaterThan(typeBox!.x)
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
