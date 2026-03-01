import { test, expect } from '@playwright/test'
import type { ContainerInfo, WebhookEvent } from '../src/store/statusSlice'

interface StatusResponse {
  containers: ContainerInfo[]
  webhookEvents: WebhookEvent[]
  defaultPrompt: string | null
}

function setupMockStatus(data: StatusResponse) {
  return async (page: import('@playwright/test').Page) => {
    await page.route('**/.netlify/functions/status', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      })
    })
  }
}

test.describe('ActiveContainers', () => {
  test('ActiveContainers: Shows pending container after spawn', async ({ page }) => {
    const pendingContainer: ContainerInfo = {
      container_id: 'app-building-xyz789',
      name: 'app-building-xyz789',
      status: 'pending',
      prompt: 'Build a todo app with authentication',
      last_event_at: '2026-03-01T12:00:00Z',
    }

    await setupMockStatus({
      containers: [pendingContainer],
      webhookEvents: [],
      defaultPrompt: 'Build a todo app with authentication',
    })(page)

    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    // The containers table should be visible (not the empty state)
    await expect(page.getByTestId('active-containers-table')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('active-containers-empty')).not.toBeVisible()

    // There should be exactly one container row
    const rows = page.getByTestId('active-container-row')
    await expect(rows).toHaveCount(1, { timeout: 10000 })

    // The row should show the container name
    await expect(page.getByTestId('container-name')).toContainText('app-building-xyz789')

    // The row should show "pending" status
    await expect(page.getByTestId('container-status')).toContainText('pending')

    // The row should show the supplied prompt
    await expect(page.getByTestId('container-prompt')).toContainText(
      'Build a todo app with authentication'
    )
  })
})
