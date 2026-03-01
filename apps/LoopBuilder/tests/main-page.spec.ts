import { test, expect } from '@playwright/test'
import type { AppEntry } from '../src/store/appsSlice'

const mockApps: AppEntry[] = [
  {
    id: 'inventory-management',
    name: 'Inventory Management System',
    description:
      'Autonomous system to track and order stock in real-time, integrating with suppliers and sales data.',
    status: 'building',
    progress: 65,
    created_at: '2026-02-01T00:00:00Z',
    model: null,
    deployment_url: null,
    source_url: null,
  },
  {
    id: 'crm-dashboard',
    name: 'CRM Dashboard',
    description: 'Customer relationship management tool with analytics and pipeline tracking.',
    status: 'building',
    progress: 30,
    created_at: '2026-02-02T00:00:00Z',
    model: null,
    deployment_url: null,
    source_url: null,
  },
  {
    id: 'analytics-portal',
    name: 'Analytics Portal',
    description: 'Real-time analytics dashboard for monitoring key business metrics.',
    status: 'finished',
    progress: 100,
    created_at: '2026-01-15T00:00:00Z',
    model: 'gpt-4',
    deployment_url: 'https://analytics.example.com',
    source_url: null,
  },
  {
    id: 'blog-engine',
    name: 'Blog Engine',
    description: 'Markdown-powered blogging platform with theming support.',
    status: 'finished',
    progress: 100,
    created_at: '2026-01-20T00:00:00Z',
    model: 'gpt-4',
    deployment_url: 'https://blog.example.com',
    source_url: null,
  },
]

function setupMockApps(apps: AppEntry[]) {
  return async (page: import('@playwright/test').Page) => {
    await page.route('**/.netlify/functions/apps', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apps),
      })
    })
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// StatusFilter
// ──────────────────────────────────────────────────────────────────────────────

test.describe('StatusFilter', () => {
  test('StatusFilter: Default tab is Building', async ({ page }) => {
    await setupMockApps(mockApps)(page)
    await page.goto('/')

    // StatusFilter is visible
    await expect(page.getByTestId('status-filter')).toBeVisible({ timeout: 10000 })

    // Three tabs are present
    await expect(page.getByTestId('status-filter-tab-building')).toBeVisible()
    await expect(page.getByTestId('status-filter-tab-finished')).toBeVisible()
    await expect(page.getByTestId('status-filter-tab-queued')).toBeVisible()

    // Building tab is active (has the active class)
    await expect(page.getByTestId('status-filter-tab-building')).toHaveClass(
      /status-filter__tab--active/
    )

    // Finished and Queued are NOT active
    await expect(page.getByTestId('status-filter-tab-finished')).not.toHaveClass(
      /status-filter__tab--active/
    )
    await expect(page.getByTestId('status-filter-tab-queued')).not.toHaveClass(
      /status-filter__tab--active/
    )

    // Grid shows only building apps
    const cards = page.getByTestId('app-card')
    await expect(cards).toHaveCount(2, { timeout: 10000 })
  })

  test('StatusFilter: Switch to Finished tab', async ({ page }) => {
    await setupMockApps(mockApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('status-filter')).toBeVisible({ timeout: 10000 })

    // Initially building is active
    await expect(page.getByTestId('status-filter-tab-building')).toHaveClass(
      /status-filter__tab--active/
    )

    // Click Finished tab
    await page.getByTestId('status-filter-tab-finished').click()

    // Finished is now active, Building is not
    await expect(page.getByTestId('status-filter-tab-finished')).toHaveClass(
      /status-filter__tab--active/
    )
    await expect(page.getByTestId('status-filter-tab-building')).not.toHaveClass(
      /status-filter__tab--active/
    )

    // Grid shows only finished apps
    const cards = page.getByTestId('app-card')
    await expect(cards).toHaveCount(2, { timeout: 10000 })

    // Verify the cards are finished apps (not building ones)
    await expect(page.getByTestId('app-card-title').first()).toContainText('Analytics Portal')
  })

  test('StatusFilter: Switch to Queued tab', async ({ page }) => {
    // Include a queued app for this test
    const appsWithQueued: AppEntry[] = [
      ...mockApps,
      {
        id: 'queued-app',
        name: 'Queued App',
        description: 'An app waiting to be built.',
        status: 'queued',
        progress: 0,
        created_at: '2026-02-28T00:00:00Z',
        model: null,
        deployment_url: null,
        source_url: null,
      },
    ]
    await setupMockApps(appsWithQueued)(page)
    await page.goto('/')
    await expect(page.getByTestId('status-filter')).toBeVisible({ timeout: 10000 })

    // Click Queued tab
    await page.getByTestId('status-filter-tab-queued').click()

    // Queued is now active, Building is not
    await expect(page.getByTestId('status-filter-tab-queued')).toHaveClass(
      /status-filter__tab--active/
    )
    await expect(page.getByTestId('status-filter-tab-building')).not.toHaveClass(
      /status-filter__tab--active/
    )

    // Grid shows only queued apps
    const cards = page.getByTestId('app-card')
    await expect(cards).toHaveCount(1, { timeout: 10000 })
    await expect(page.getByTestId('app-card-title').first()).toContainText('Queued App')
  })

  test('StatusFilter: Switch between all tabs preserves correct filter', async ({ page }) => {
    const allApps: AppEntry[] = [
      ...mockApps,
      {
        id: 'queued-app',
        name: 'Queued App',
        description: 'An app waiting to be built.',
        status: 'queued',
        progress: 0,
        created_at: '2026-02-28T00:00:00Z',
        model: null,
        deployment_url: null,
        source_url: null,
      },
    ]
    await setupMockApps(allApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('app-card-grid')).toBeVisible({ timeout: 10000 })

    // Click Finished
    await page.getByTestId('status-filter-tab-finished').click()
    await expect(page.getByTestId('status-filter-tab-finished')).toHaveClass(
      /status-filter__tab--active/
    )
    await expect(page.getByTestId('status-filter-tab-building')).not.toHaveClass(
      /status-filter__tab--active/
    )
    await expect(page.getByTestId('status-filter-tab-queued')).not.toHaveClass(
      /status-filter__tab--active/
    )
    await expect(page.getByTestId('app-card')).toHaveCount(2, { timeout: 10000 })

    // Click Queued
    await page.getByTestId('status-filter-tab-queued').click()
    await expect(page.getByTestId('status-filter-tab-queued')).toHaveClass(
      /status-filter__tab--active/
    )
    await expect(page.getByTestId('status-filter-tab-finished')).not.toHaveClass(
      /status-filter__tab--active/
    )
    await expect(page.getByTestId('status-filter-tab-building')).not.toHaveClass(
      /status-filter__tab--active/
    )
    await expect(page.getByTestId('app-card')).toHaveCount(1, { timeout: 10000 })

    // Click Building
    await page.getByTestId('status-filter-tab-building').click()
    await expect(page.getByTestId('status-filter-tab-building')).toHaveClass(
      /status-filter__tab--active/
    )
    await expect(page.getByTestId('status-filter-tab-finished')).not.toHaveClass(
      /status-filter__tab--active/
    )
    await expect(page.getByTestId('status-filter-tab-queued')).not.toHaveClass(
      /status-filter__tab--active/
    )
    await expect(page.getByTestId('app-card')).toHaveCount(2, { timeout: 10000 })
  })

  test('StatusFilter: Empty state when no apps match filter', async ({ page }) => {
    // mockApps has no queued apps
    await setupMockApps(mockApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('app-card-grid')).toBeVisible({ timeout: 10000 })

    // Click Queued tab (no queued apps exist)
    await page.getByTestId('status-filter-tab-queued').click()

    // Queued tab is active
    await expect(page.getByTestId('status-filter-tab-queued')).toHaveClass(
      /status-filter__tab--active/
    )

    // Empty state is displayed
    await expect(page.getByTestId('app-card-grid-empty')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('app-card')).toHaveCount(0)

    // StatusFilter remains functional — can switch to other tabs
    await page.getByTestId('status-filter-tab-building').click()
    await expect(page.getByTestId('status-filter-tab-building')).toHaveClass(
      /status-filter__tab--active/
    )
    await expect(page.getByTestId('app-card')).toHaveCount(2, { timeout: 10000 })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// RequestAppCTA
// ──────────────────────────────────────────────────────────────────────────────

test.describe('RequestAppCTA', () => {
  test('RequestAppCTA: Visible below StatusFilter', async ({ page }) => {
    await setupMockApps(mockApps)(page)
    await page.goto('/')

    // StatusFilter and CTA are both visible
    await expect(page.getByTestId('status-filter')).toBeVisible({ timeout: 10000 })
    const cta = page.getByTestId('request-app-cta')
    await expect(cta).toBeVisible()

    // CTA text
    await expect(cta).toContainText('Request an app')

    // CTA appears after StatusFilter in DOM order
    const ctaBox = await cta.boundingBox()
    const filterBox = await page.getByTestId('status-filter').boundingBox()
    expect(ctaBox).toBeTruthy()
    expect(filterBox).toBeTruthy()
    expect(ctaBox!.y).toBeGreaterThan(filterBox!.y)
  })

  test('RequestAppCTA: Navigates to RequestPage on click', async ({ page }) => {
    await setupMockApps(mockApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('request-app-cta')).toBeVisible({ timeout: 10000 })

    // Click the CTA
    await page.getByTestId('request-app-cta').click()

    // URL should be /request
    await expect(page).toHaveURL(/\/request/, { timeout: 10000 })

    // RequestPage is displayed
    await expect(page.getByTestId('request-page')).toBeVisible({ timeout: 10000 })
  })

  test('RequestAppCTA: Remains visible across all filter tabs', async ({ page }) => {
    await setupMockApps(mockApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('request-app-cta')).toBeVisible({ timeout: 10000 })

    // Switch to Finished
    await page.getByTestId('status-filter-tab-finished').click()
    await expect(page.getByTestId('request-app-cta')).toBeVisible()

    // Switch to Queued
    await page.getByTestId('status-filter-tab-queued').click()
    await expect(page.getByTestId('request-app-cta')).toBeVisible()

    // Switch back to Building
    await page.getByTestId('status-filter-tab-building').click()
    await expect(page.getByTestId('request-app-cta')).toBeVisible()
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// AppCard
// ──────────────────────────────────────────────────────────────────────────────

test.describe('AppCard', () => {
  test('AppCard: Displays title and description', async ({ page }) => {
    await setupMockApps(mockApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('app-card-grid')).toBeVisible({ timeout: 10000 })

    // Find the Inventory Management card
    const card = page
      .getByTestId('app-card')
      .filter({ has: page.getByTestId('app-card-title').filter({ hasText: 'Inventory Management System' }) })

    await expect(card).toBeVisible({ timeout: 10000 })

    // Title is displayed
    await expect(card.getByTestId('app-card-title')).toContainText('Inventory Management System')

    // Description is displayed
    await expect(card.getByTestId('app-card-description')).toContainText(
      'Autonomous system to track and order stock in real-time'
    )
  })

  test('AppCard: Shows progress bar with percentage for Building apps', async ({ page }) => {
    await setupMockApps(mockApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('app-card-grid')).toBeVisible({ timeout: 10000 })

    // Find the Inventory Management card (65% building)
    const card = page
      .getByTestId('app-card')
      .filter({ has: page.getByTestId('app-card-title').filter({ hasText: 'Inventory Management System' }) })

    await expect(card).toBeVisible({ timeout: 10000 })

    // Progress bar is visible
    await expect(card.getByTestId('app-card-progress')).toBeVisible()

    // Status text shows "65% Building"
    await expect(card.getByTestId('app-card-status')).toContainText('65% Building')
  })

  test('AppCard: Shows progress bar at 100% for Finished apps', async ({ page }) => {
    await setupMockApps(mockApps)(page)
    await page.goto('/')

    // Switch to Finished tab
    await page.getByTestId('status-filter-tab-finished').click()
    await expect(page.getByTestId('app-card')).toHaveCount(2, { timeout: 10000 })

    // Pick the first finished card
    const card = page.getByTestId('app-card').first()
    await expect(card).toBeVisible()

    // Progress bar is visible
    await expect(card.getByTestId('app-card-progress')).toBeVisible()

    // Status text shows "100% Finished"
    await expect(card.getByTestId('app-card-status')).toContainText('100% Finished')
  })

  test('AppCard: Shows progress bar at 0% for Queued apps', async ({ page }) => {
    const appsWithQueued: AppEntry[] = [
      ...mockApps,
      {
        id: 'queued-app',
        name: 'Queued App',
        description: 'An app waiting to be built.',
        status: 'queued',
        progress: 0,
        created_at: '2026-02-28T00:00:00Z',
        model: null,
        deployment_url: null,
        source_url: null,
      },
    ]
    await setupMockApps(appsWithQueued)(page)
    await page.goto('/')

    // Switch to Queued tab
    await page.getByTestId('status-filter-tab-queued').click()
    await expect(page.getByTestId('app-card')).toHaveCount(1, { timeout: 10000 })

    const card = page.getByTestId('app-card').first()
    await expect(card).toBeVisible()

    // Progress bar is visible
    await expect(card.getByTestId('app-card-progress')).toBeVisible()

    // Status text shows "0% Queued"
    await expect(card.getByTestId('app-card-status')).toContainText('0% Queued')
  })

  test('AppCard: View App button navigates to AppPage', async ({ page }) => {
    await setupMockApps(mockApps)(page)

    // Also mock the individual app endpoint for AppPage
    await page.route('**/.netlify/functions/apps/inventory-management', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApps[0]),
      })
    })
    await page.route('**/.netlify/functions/activity**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/')
    await expect(page.getByTestId('app-card-grid')).toBeVisible({ timeout: 10000 })

    // Find the Inventory Management card
    const card = page
      .getByTestId('app-card')
      .filter({ has: page.getByTestId('app-card-title').filter({ hasText: 'Inventory Management System' }) })

    // Click View App
    await card.getByTestId('app-card-view-btn').click()

    // Verify navigation to the correct AppPage URL
    await expect(page).toHaveURL(/\/apps\/inventory-management/, { timeout: 10000 })

    // AppPage is displayed
    await expect(page.getByTestId('app-page')).toBeVisible({ timeout: 10000 })
  })

  test('AppCard: Displays app route path next to View App button', async ({ page }) => {
    await setupMockApps(mockApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('app-card-grid')).toBeVisible({ timeout: 10000 })

    // Find the Inventory Management card
    const card = page
      .getByTestId('app-card')
      .filter({ has: page.getByTestId('app-card-title').filter({ hasText: 'Inventory Management System' }) })

    await expect(card).toBeVisible({ timeout: 10000 })

    // Route path is displayed
    await expect(card.getByTestId('app-card-route')).toContainText('/apps/inventory-management')

    // View App button is also visible
    await expect(card.getByTestId('app-card-view-btn')).toBeVisible()
  })

  test('AppCard: View App button styling', async ({ page }) => {
    await setupMockApps(mockApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('app-card-grid')).toBeVisible({ timeout: 10000 })

    const viewBtn = page.getByTestId('app-card-view-btn').first()
    await expect(viewBtn).toBeVisible()
    await expect(viewBtn).toContainText('View App')

    // Verify the button has the blue rounded pill styling
    const bgColor = await viewBtn.evaluate((el) => getComputedStyle(el).backgroundColor)
    const color = await viewBtn.evaluate((el) => getComputedStyle(el).color)
    const borderRadius = await viewBtn.evaluate((el) => getComputedStyle(el).borderRadius)

    // Background should be blue-ish (non-white, non-transparent)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
    // Text should be white
    expect(color).toBe('rgb(255, 255, 255)')
    // Should have rounded corners (pill shape)
    expect(parseInt(borderRadius)).toBeGreaterThanOrEqual(16)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// AppCardGrid
// ──────────────────────────────────────────────────────────────────────────────

test.describe('AppCardGrid', () => {
  test('AppCardGrid: Displays cards in 2-column grid layout', async ({ page }) => {
    await setupMockApps(mockApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('app-card-grid')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('app-card')).toHaveCount(2, { timeout: 10000 })

    // Verify the grid uses 2-column layout
    const gridStyle = await page.getByTestId('app-card-grid').evaluate((el) => {
      const computed = getComputedStyle(el)
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
      }
    })
    expect(gridStyle.display).toBe('grid')
    // Should have two column tracks
    const columnCount = gridStyle.gridTemplateColumns.split(' ').length
    expect(columnCount).toBe(2)

    // The two building cards should be side by side (same y, different x)
    const firstCard = page.getByTestId('app-card').nth(0)
    const secondCard = page.getByTestId('app-card').nth(1)
    const firstBox = await firstCard.boundingBox()
    const secondBox = await secondCard.boundingBox()
    expect(firstBox).toBeTruthy()
    expect(secondBox).toBeTruthy()
    // Both cards at the same row (approximately same y)
    expect(Math.abs(firstBox!.y - secondBox!.y)).toBeLessThan(5)
    // First card is to the left of the second
    expect(firstBox!.x).toBeLessThan(secondBox!.x)
  })

  test('AppCardGrid: Filters cards based on StatusFilter selection', async ({ page }) => {
    const allApps: AppEntry[] = [
      ...mockApps,
      {
        id: 'queued-app',
        name: 'Queued App',
        description: 'An app waiting to be built.',
        status: 'queued',
        progress: 0,
        created_at: '2026-02-28T00:00:00Z',
        model: null,
        deployment_url: null,
        source_url: null,
      },
    ]
    await setupMockApps(allApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('app-card-grid')).toBeVisible({ timeout: 10000 })

    // Building tab — 2 building apps
    await expect(page.getByTestId('app-card')).toHaveCount(2, { timeout: 10000 })

    // Switch to Finished — 2 finished apps
    await page.getByTestId('status-filter-tab-finished').click()
    await expect(page.getByTestId('app-card')).toHaveCount(2, { timeout: 10000 })

    // Switch to Queued — 1 queued app
    await page.getByTestId('status-filter-tab-queued').click()
    await expect(page.getByTestId('app-card')).toHaveCount(1, { timeout: 10000 })
  })

  test('AppCardGrid: Empty state when no apps match filter', async ({ page }) => {
    // mockApps has no queued apps
    await setupMockApps(mockApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('app-card-grid')).toBeVisible({ timeout: 10000 })

    // Switch to Queued
    await page.getByTestId('status-filter-tab-queued').click()

    // Empty state message is visible
    await expect(page.getByTestId('app-card-grid-empty')).toBeVisible({ timeout: 10000 })

    // No cards
    await expect(page.getByTestId('app-card')).toHaveCount(0)
  })

  test('AppCardGrid: Updates when new apps are added', async ({ page }) => {
    const initialApps: AppEntry[] = []
    let currentApps = initialApps

    await page.route('**/.netlify/functions/apps', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentApps),
      })
    })

    await page.goto('/')

    // Switch to Queued (no queued apps yet)
    await page.getByTestId('status-filter-tab-queued').click()
    await expect(page.getByTestId('app-card-grid-empty')).toBeVisible({ timeout: 10000 })

    // "Backend" adds a new queued app
    currentApps = [
      {
        id: 'new-queued-app',
        name: 'New Queued App',
        description: 'A freshly queued app.',
        status: 'queued',
        progress: 0,
        created_at: '2026-02-28T12:00:00Z',
        model: null,
        deployment_url: null,
        source_url: null,
      },
    ]

    // Refresh the page to re-fetch data
    await page.reload()

    // Switch to Queued again
    await page.getByTestId('status-filter-tab-queued').click()

    // The new app should now appear
    await expect(page.getByTestId('app-card')).toHaveCount(1, { timeout: 10000 })
    await expect(
      page.getByTestId('app-card-title').filter({ hasText: 'New Queued App' })
    ).toBeVisible({ timeout: 10000 })
  })

  test('AppCardGrid: Responsive layout', async ({ page }) => {
    await setupMockApps(mockApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('app-card-grid')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('app-card')).toHaveCount(2, { timeout: 10000 })

    // At desktop viewport, grid should be 2 columns
    const gridStyle = await page.getByTestId('app-card-grid').evaluate((el) => {
      const computed = getComputedStyle(el)
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        gap: computed.gap,
      }
    })
    expect(gridStyle.display).toBe('grid')
    const columnCount = gridStyle.gridTemplateColumns.split(' ').length
    expect(columnCount).toBe(2)

    // Verify consistent spacing (gap is set)
    expect(gridStyle.gap).toBeTruthy()
    expect(gridStyle.gap).not.toBe('normal')
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// StatusLink
// ──────────────────────────────────────────────────────────────────────────────

test.describe('StatusLink', () => {
  test('StatusLink: Visible in footer', async ({ page }) => {
    await setupMockApps(mockApps)(page)
    await page.goto('/')
    await expect(page.getByTestId('main-page')).toBeVisible({ timeout: 10000 })

    // Status link is visible in the footer
    const statusLink = page.getByTestId('status-link')
    await expect(statusLink).toBeVisible()
    await expect(statusLink).toContainText('System Status')
  })

  test('StatusLink: Navigates to StatusPage on click', async ({ page }) => {
    await setupMockApps(mockApps)(page)

    // Mock the status endpoint so StatusPage can load
    await page.route('**/.netlify/functions/status', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          containers: [],
          webhookEvents: [],
          defaultPrompt: null,
        }),
      })
    })

    await page.goto('/')
    await expect(page.getByTestId('status-link')).toBeVisible({ timeout: 10000 })

    // Click the System Status link
    await page.getByTestId('status-link').click()

    // Verify navigation to StatusPage
    await expect(page).toHaveURL(/\/status/, { timeout: 10000 })
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 10000 })
  })
})
