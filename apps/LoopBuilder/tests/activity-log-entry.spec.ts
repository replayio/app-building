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
        detail_label: null,
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
        detail_label: null,
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
        detail_label: null,
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
        detail_label: null,
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
        detail_label: null,
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
        detail_label: null,
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
        detail_label: null,
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
        detail_label: null,
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

  test('ActivityLogEntry: Expandable section collapsed by default', async ({ page }) => {
    const entries: ActivityEntry[] = [
      {
        id: 1,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:35:22Z',
        log_type: 'REASONING',
        message:
          'Designing the database schema for the Reporting Module. Considering relational versus document structure...',
        detail: 'CREATE TABLE reports (\n  id SERIAL PRIMARY KEY,\n  title VARCHAR(255),\n  created_at TIMESTAMP\n);',
        detail_label: 'Schema Snippet',
        expandable: true,
      },
    ]

    await setupMockAppWithEntries(buildingApp, entries)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    // Wait for the entry to render
    await expect(page.getByTestId('activity-log-entry')).toHaveCount(1, { timeout: 10000 })

    // Verify the toggle button is visible with collapsed label
    const toggle = page.getByTestId('activity-entry-toggle')
    await expect(toggle).toBeVisible()
    await expect(toggle).toContainText('View Schema Snippet')

    // Verify the chevron indicator is present (ChevronRight for collapsed state)
    const chevronRight = toggle.locator('svg')
    await expect(chevronRight).toBeVisible()

    // Verify the code detail content is NOT visible (collapsed by default)
    await expect(page.getByTestId('activity-entry-detail')).toHaveCount(0)
  })

  test('ActivityLogEntry: Expand section on click', async ({ page }) => {
    const schemaDetail =
      'CREATE TABLE reports (\n  id SERIAL PRIMARY KEY,\n  title VARCHAR(255),\n  created_at TIMESTAMP\n);'
    const entries: ActivityEntry[] = [
      {
        id: 1,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:35:22Z',
        log_type: 'REASONING',
        message:
          'Designing the database schema for the Reporting Module. Considering relational versus document structure...',
        detail: schemaDetail,
        detail_label: 'Schema Snippet',
        expandable: true,
      },
    ]

    await setupMockAppWithEntries(buildingApp, entries)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    // Wait for the entry to render
    await expect(page.getByTestId('activity-log-entry')).toHaveCount(1, { timeout: 10000 })

    // Click the toggle to expand
    const toggle = page.getByTestId('activity-entry-toggle')
    await toggle.click()

    // Verify the section is now expanded - detail block is visible
    const detail = page.getByTestId('activity-entry-detail')
    await expect(detail).toBeVisible({ timeout: 5000 })

    // Verify the toggle text changes to "Hide Schema Snippet"
    await expect(toggle).toContainText('Hide Schema Snippet')

    // Verify the code block displays the schema content
    await expect(detail).toContainText('CREATE TABLE reports')
    await expect(detail).toContainText('id SERIAL PRIMARY KEY')

    // Verify the code block has a monospace font (it's a <pre> element)
    const fontFamily = await detail.evaluate((el) => window.getComputedStyle(el).fontFamily)
    expect(fontFamily.toLowerCase()).toMatch(/mono|courier|consolas/)
  })

  test('ActivityLogEntry: Collapse expanded section on click', async ({ page }) => {
    const entries: ActivityEntry[] = [
      {
        id: 1,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:35:22Z',
        log_type: 'REASONING',
        message:
          'Designing the database schema for the Reporting Module. Considering relational versus document structure...',
        detail: 'CREATE TABLE reports (\n  id SERIAL PRIMARY KEY\n);',
        detail_label: 'Schema Snippet',
        expandable: true,
      },
    ]

    await setupMockAppWithEntries(buildingApp, entries)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    // Wait for the entry to render
    await expect(page.getByTestId('activity-log-entry')).toHaveCount(1, { timeout: 10000 })

    const toggle = page.getByTestId('activity-entry-toggle')

    // Expand the section first
    await toggle.click()
    await expect(page.getByTestId('activity-entry-detail')).toBeVisible({ timeout: 5000 })
    await expect(toggle).toContainText('Hide Schema Snippet')

    // Click again to collapse
    await toggle.click()

    // Verify the detail block is no longer visible
    await expect(page.getByTestId('activity-entry-detail')).toHaveCount(0)

    // Verify the toggle text reverts to "View Schema Snippet"
    await expect(toggle).toContainText('View Schema Snippet')
  })

  test('ActivityLogEntry: Code block displays with monospace formatting', async ({ page }) => {
    const schemaDetail =
      'CREATE TABLE reports (\n  id SERIAL PRIMARY KEY,\n  title VARCHAR(255),\n  created_at TIMESTAMP DEFAULT NOW()\n);'
    const entries: ActivityEntry[] = [
      {
        id: 1,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:35:22Z',
        log_type: 'REASONING',
        message:
          'Designing the database schema for the Reporting Module. Considering relational versus document structure...',
        detail: schemaDetail,
        detail_label: 'Schema Snippet',
        expandable: true,
      },
    ]

    await setupMockAppWithEntries(buildingApp, entries)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    // Wait for the entry to render
    await expect(page.getByTestId('activity-log-entry')).toHaveCount(1, { timeout: 10000 })

    // Expand the section
    await page.getByTestId('activity-entry-toggle').click()
    const detail = page.getByTestId('activity-entry-detail')
    await expect(detail).toBeVisible({ timeout: 5000 })

    // Verify monospace/code font
    const fontFamily = await detail.evaluate((el) => window.getComputedStyle(el).fontFamily)
    expect(fontFamily.toLowerCase()).toMatch(/mono|courier|consolas/)

    // Verify distinct background color (darker or gray, different from parent entry)
    const detailBg = await detail.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    const entryBg = await page
      .getByTestId('activity-log-entry')
      .evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(detailBg).not.toEqual(entryBg)

    // Verify code indentation and line breaks are preserved (the element is <pre>)
    const tagName = await detail.evaluate((el) => el.tagName.toLowerCase())
    expect(tagName).toBe('pre')

    // Verify the content preserves the schema text including indentation
    await expect(detail).toContainText('CREATE TABLE reports')
    await expect(detail).toContainText('id SERIAL PRIMARY KEY')
    await expect(detail).toContainText('title VARCHAR(255)')
    await expect(detail).toContainText('created_at TIMESTAMP DEFAULT NOW()')
  })

  test('ActivityLogEntry: Clickable links in message text', async ({ page }) => {
    const entries: ActivityEntry[] = [
      {
        id: 1,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:35:22Z',
        log_type: 'DEPLOY',
        message:
          'Deployment successful. App is live at https://my-saas-platform.vercel.app. Final verification complete.',
        detail: null,
        detail_label: null,
        expandable: false,
      },
    ]

    await setupMockAppWithEntries(buildingApp, entries)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    // Wait for the entry to render
    await expect(page.getByTestId('activity-log-entry')).toHaveCount(1, { timeout: 10000 })

    // Verify the URL is rendered as a clickable hyperlink
    const message = page.getByTestId('activity-entry-message')
    const link = message.locator('a')
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', 'https://my-saas-platform.vercel.app.')

    // Verify the link opens in a new tab
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noopener/)

    // Verify the link is visually distinct (has underline or distinct color via class)
    const textDecoration = await link.evaluate((el) => window.getComputedStyle(el).textDecorationLine)
    expect(textDecoration).toContain('underline')
  })

  test('ActivityLogEntry: Multiple entries displayed in sequence', async ({ page }) => {
    const entries: ActivityEntry[] = [
      {
        id: 5,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T15:00:00Z',
        log_type: 'DEPLOY',
        message: 'Deployment successful. App is live at https://my-saas-platform.vercel.app. Final verification complete.',
        detail: null,
        detail_label: null,
        expandable: false,
      },
      {
        id: 4,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:50:00Z',
        log_type: 'TEST',
        message: 'Running automated integration tests for the Reporting Module. 15/15 tests passed. Generating test report.',
        detail: null,
        detail_label: null,
        expandable: false,
      },
      {
        id: 3,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:40:00Z',
        log_type: 'REASONING',
        message: 'Designing the database schema for the Reporting Module. Considering relational versus document structure...',
        detail: null,
        detail_label: null,
        expandable: false,
      },
      {
        id: 2,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:30:00Z',
        log_type: 'PLAN',
        message: 'Initial project plan generated. Key feature modules identified: Authentication, User Dashboard, Reporting, and Settings.',
        detail: null,
        detail_label: null,
        expandable: false,
      },
      {
        id: 1,
        app_id: buildingApp.id,
        timestamp: '2023-10-26T14:20:00Z',
        log_type: 'INIT',
        message: "App creation initiated from prompt: 'Create a SaaS customer portal MVP with auth, dashboard, and reporting.' Project structure initialized.",
        detail: null,
        detail_label: null,
        expandable: false,
      },
    ]

    await setupMockAppWithEntries(buildingApp, entries)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    // Wait for all five entries to render
    await expect(page.getByTestId('activity-log-entry')).toHaveCount(5, { timeout: 10000 })

    const allEntries = page.getByTestId('activity-log-entry')

    // Verify each entry has its own icon, timestamp, type tag, and message
    for (let i = 0; i < 5; i++) {
      const entry = allEntries.nth(i)
      await expect(entry.locator('.activity-entry__icon')).toBeVisible()
      await expect(entry.getByTestId('activity-entry-timestamp')).toBeVisible()
      await expect(entry.getByTestId('activity-entry-type')).toBeVisible()
      await expect(entry.getByTestId('activity-entry-message')).toBeVisible()
    }

    // Verify the correct type tags in order (DEPLOY, TEST, REASONING, PLAN, INIT)
    await expect(allEntries.nth(0).getByTestId('activity-entry-type')).toHaveText('[DEPLOY]')
    await expect(allEntries.nth(1).getByTestId('activity-entry-type')).toHaveText('[TEST]')
    await expect(allEntries.nth(2).getByTestId('activity-entry-type')).toHaveText('[REASONING]')
    await expect(allEntries.nth(3).getByTestId('activity-entry-type')).toHaveText('[PLAN]')
    await expect(allEntries.nth(4).getByTestId('activity-entry-type')).toHaveText('[INIT]')

    // Verify entries are visually distinct blocks (each has its type-specific class)
    const expectedClasses = ['deploy', 'test', 'reasoning', 'plan', 'init']
    for (let i = 0; i < 5; i++) {
      const entryClass = await allEntries.nth(i).getAttribute('class')
      expect(entryClass).toContain(`activity-entry--${expectedClasses[i]}`)
    }

    // Verify entries are separated by visible spacing (each entry has non-zero height and distinct vertical position)
    const firstBox = await allEntries.nth(0).boundingBox()
    const secondBox = await allEntries.nth(1).boundingBox()
    expect(firstBox).toBeTruthy()
    expect(secondBox).toBeTruthy()
    expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height - 1)
  })
})
