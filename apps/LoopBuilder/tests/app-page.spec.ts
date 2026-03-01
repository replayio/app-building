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
})
