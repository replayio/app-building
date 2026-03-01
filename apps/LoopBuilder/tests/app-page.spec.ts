import { test, expect } from '@playwright/test'
import type { AppEntry } from '../src/store/appsSlice'

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

const completedApp: AppEntry = {
  id: 'completed-app',
  name: 'Deployed Platform',
  description: 'A fully deployed web application.',
  status: 'finished',
  progress: 100,
  created_at: '2023-11-01T00:00:00Z',
  model: 'Claude 3',
  deployment_url: 'https://deployed-platform.vercel.app',
  source_url: null,
}

const queuedApp: AppEntry = {
  id: 'queued-app',
  name: 'Queued App',
  description: 'An app waiting to be built.',
  status: 'queued',
  progress: 0,
  created_at: '2023-12-05T00:00:00Z',
  model: 'gpt-4o',
  deployment_url: null,
  source_url: null,
}

const appWithFullMeta: AppEntry = {
  id: 'full-meta-app',
  name: 'Full Meta App',
  description: 'An app with all metadata fields populated.',
  status: 'finished',
  progress: 100,
  created_at: '2023-10-26T00:00:00Z',
  model: 'gpt-4 Turbo',
  deployment_url: 'https://full-meta.vercel.app',
  source_url: null,
}

const netlifyApp: AppEntry = {
  id: 'netlify-app',
  name: 'Netlify App',
  description: 'First test app for metadata comparison.',
  status: 'finished',
  progress: 100,
  created_at: '2023-11-01T00:00:00Z',
  model: 'Claude 3',
  deployment_url: 'https://netlify-app.netlify.app',
  source_url: null,
}

const awsApp: AppEntry = {
  id: 'aws-app',
  name: 'AWS App',
  description: 'Second test app for metadata comparison.',
  status: 'finished',
  progress: 100,
  created_at: '2023-12-05T00:00:00Z',
  model: 'gpt-4o',
  deployment_url: 'https://aws-app.amazonaws.com',
  source_url: null,
}

const completedAppWithSource: AppEntry = {
  id: 'completed-source-app',
  name: 'Completed App With Source',
  description: 'A fully deployed web application with source code.',
  status: 'finished',
  progress: 100,
  created_at: '2023-11-15T00:00:00Z',
  model: 'Claude 3',
  deployment_url: 'https://completed-source.vercel.app',
  source_url: 'https://completed-source.vercel.app/source.zip',
}

function setupMockApp(app: AppEntry) {
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
        body: JSON.stringify([]),
      })
    })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// AppHeader
// ──────────────────────────────────────────────────────────────────────────────

test.describe('AppHeader', () => {
  test('AppHeader: Displays app title', async ({ page }) => {
    await setupMockApp(buildingApp)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    const title = page.getByTestId('app-header-title')
    await expect(title).toBeVisible({ timeout: 10000 })
    await expect(title).toHaveText('My Saas Platform (Customer Portal MVP)')
  })

  test('AppHeader: Displays status badge for Building app', async ({ page }) => {
    await setupMockApp(buildingApp)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    const statusBadge = page.getByTestId('app-header-status')
    await expect(statusBadge).toBeVisible({ timeout: 10000 })
    await expect(statusBadge).toHaveText('STATUS: Building')

    // Verify yellow/amber background color
    const bgColor = await statusBadge.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    // rgba(245, 158, 11, 0.15) should be present as amber/yellow tint
    expect(bgColor).toContain('245')
    expect(bgColor).toContain('158')
    expect(bgColor).toContain('11')
  })

  test('AppHeader: Displays status badge for Completed app', async ({ page }) => {
    await setupMockApp(completedApp)(page)
    await page.goto(`/apps/${completedApp.id}`)

    const statusBadge = page.getByTestId('app-header-status')
    await expect(statusBadge).toBeVisible({ timeout: 10000 })
    await expect(statusBadge).toHaveText('STATUS: Completed (Successfully Deployed)')

    // Verify green background color
    const bgColor = await statusBadge.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    // rgba(34, 197, 94, 0.1) should be present as green tint
    expect(bgColor).toContain('34')
    expect(bgColor).toContain('197')
    expect(bgColor).toContain('94')
  })

  test('AppHeader: Displays status badge for Queued app', async ({ page }) => {
    await setupMockApp(queuedApp)(page)
    await page.goto(`/apps/${queuedApp.id}`)

    const statusBadge = page.getByTestId('app-header-status')
    await expect(statusBadge).toBeVisible({ timeout: 10000 })
    await expect(statusBadge).toHaveText('STATUS: Queued')

    // Verify gray background color
    const bgColor = await statusBadge.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    // rgba(156, 163, 175, 0.2) should be present as gray tint
    expect(bgColor).toContain('156')
    expect(bgColor).toContain('163')
    expect(bgColor).toContain('175')
  })

  test('AppHeader: Displays app description', async ({ page }) => {
    await setupMockApp(buildingApp)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    const description = page.getByTestId('app-header-description')
    await expect(description).toBeVisible({ timeout: 10000 })
    await expect(description).toHaveText(
      'An autonomously generated web application. Features user authentication, dashboard, and reporting module. Built with React and Node.js.'
    )
  })

  test('AppHeader: Displays metadata line with Created date, Model, and Deployment', async ({ page }) => {
    await setupMockApp(appWithFullMeta)(page)
    await page.goto(`/apps/${appWithFullMeta.id}`)

    const meta = page.getByTestId('app-header-meta')
    await expect(meta).toBeVisible({ timeout: 10000 })
    await expect(meta).toContainText('Created: Oct 26, 2023')
    await expect(meta).toContainText('Model: gpt-4 Turbo')
    await expect(meta).toContainText('Deployment: full-meta.vercel.app')
    // Verify pipe separators
    const metaText = await meta.textContent()
    expect(metaText).toContain('|')
    const parts = metaText!.split('|').map((s) => s.trim())
    expect(parts).toHaveLength(3)
    expect(parts[0]).toBe('Created: Oct 26, 2023')
    expect(parts[1]).toBe('Model: gpt-4 Turbo')
    expect(parts[2]).toBe('Deployment: full-meta.vercel.app')
  })

  test('AppHeader: Metadata line shows correct values from app data', async ({ page }) => {
    // First app: Nov 1, 2023, Claude 3, netlify-app.netlify.app
    await setupMockApp(netlifyApp)(page)
    await page.goto(`/apps/${netlifyApp.id}`)

    const meta1 = page.getByTestId('app-header-meta')
    await expect(meta1).toBeVisible({ timeout: 10000 })
    const meta1Text = await meta1.textContent()
    const parts1 = meta1Text!.split('|').map((s) => s.trim())
    expect(parts1[0]).toBe('Created: Nov 1, 2023')
    expect(parts1[1]).toBe('Model: Claude 3')
    expect(parts1[2]).toBe('Deployment: netlify-app.netlify.app')

    // Second app: Dec 5, 2023, gpt-4o, aws-app.amazonaws.com
    await setupMockApp(awsApp)(page)
    await page.goto(`/apps/${awsApp.id}`)

    const meta2 = page.getByTestId('app-header-meta')
    await expect(meta2).toBeVisible({ timeout: 10000 })
    const meta2Text = await meta2.textContent()
    const parts2 = meta2Text!.split('|').map((s) => s.trim())
    expect(parts2[0]).toBe('Created: Dec 5, 2023')
    expect(parts2[1]).toBe('Model: gpt-4o')
    expect(parts2[2]).toBe('Deployment: aws-app.amazonaws.com')
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// AppActions
// ──────────────────────────────────────────────────────────────────────────────

test.describe('AppActions', () => {
  test('AppActions: Open Live App button visible for completed app', async ({ page }) => {
    await setupMockApp(completedApp)(page)
    await page.goto(`/apps/${completedApp.id}`)

    const openBtn = page.getByTestId('app-actions-open')
    await expect(openBtn).toBeVisible({ timeout: 10000 })
    await expect(openBtn).toBeEnabled()
    await expect(openBtn).toHaveAttribute('href', completedApp.deployment_url!)
    await expect(openBtn).toHaveAttribute('target', '_blank')

    // Verify button text
    await expect(openBtn.locator('.app-actions__btn-label')).toHaveText('Open Live App')
  })

  test('AppActions: Open Live App button opens deployed URL in new tab', async ({ page }) => {
    await setupMockApp(completedApp)(page)
    await page.goto(`/apps/${completedApp.id}`)

    const openBtn = page.getByTestId('app-actions-open')
    await expect(openBtn).toBeVisible({ timeout: 10000 })

    // Click and verify a new tab opens with the deployed URL
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      openBtn.click(),
    ])
    expect(popup.url()).toBe(completedApp.deployment_url!)

    // Verify the original page remains open
    await expect(page.getByTestId('app-actions')).toBeVisible()
  })

  test('AppActions: Open Live App button disabled for Building app', async ({ page }) => {
    await setupMockApp(buildingApp)(page)
    await page.goto(`/apps/${buildingApp.id}`)

    const openBtn = page.getByTestId('app-actions-open')
    await expect(openBtn).toBeVisible({ timeout: 10000 })
    await expect(openBtn).toBeDisabled()

    // Verify button text is still present
    await expect(openBtn.locator('.app-actions__btn-label')).toHaveText('Open Live App')
  })

  test('AppActions: Open Live App button disabled for Queued app', async ({ page }) => {
    await setupMockApp(queuedApp)(page)
    await page.goto(`/apps/${queuedApp.id}`)

    const openBtn = page.getByTestId('app-actions-open')
    await expect(openBtn).toBeVisible({ timeout: 10000 })
    await expect(openBtn).toBeDisabled()

    // Verify button text is still present
    await expect(openBtn.locator('.app-actions__btn-label')).toHaveText('Open Live App')
  })

  test('AppActions: Download Source Code button visible for completed app', async ({ page }) => {
    await setupMockApp(completedAppWithSource)(page)
    await page.goto(`/apps/${completedAppWithSource.id}`)

    const sourceBtn = page.getByTestId('app-actions-source')
    await expect(sourceBtn).toBeVisible({ timeout: 10000 })
    await expect(sourceBtn).toBeEnabled()
    await expect(sourceBtn).toHaveAttribute('href', completedAppWithSource.source_url!)
    await expect(sourceBtn).toHaveAttribute('target', '_blank')

    // Verify button text
    await expect(sourceBtn.locator('.app-actions__btn-label')).toHaveText('Download Source Code')

    // Verify positioned to the right of Open Live App button
    const openBtn = page.getByTestId('app-actions-open')
    await expect(openBtn).toBeVisible()
    const openBox = await openBtn.boundingBox()
    const sourceBox = await sourceBtn.boundingBox()
    expect(openBox).toBeTruthy()
    expect(sourceBox).toBeTruthy()
    expect(sourceBox!.x).toBeGreaterThan(openBox!.x)
  })
})
