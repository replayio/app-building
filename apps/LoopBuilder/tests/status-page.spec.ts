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

const emptyStatus: StatusResponse = {
  containers: [],
  webhookEvents: [],
  defaultPrompt: null,
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

test.describe('WebhookHelpButton', () => {
  test('WebhookHelpButton: Curl commands use actual site URL', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('webhook-help-button').click()
    await expect(page.getByTestId('webhook-help-panel')).toBeVisible({ timeout: 10000 })

    // Each curl command should contain the actual site host, not YOUR_SITE
    const curlBlocks = page.getByTestId('webhook-endpoint-curl')
    const count = await curlBlocks.count()
    expect(count).toBe(3)

    for (let i = 0; i < count; i++) {
      const text = await curlBlocks.nth(i).textContent()
      expect(text).not.toContain('YOUR_SITE')
      expect(text).toContain('localhost')
    }
  })

  test('WebhookHelpButton: Curl copy buttons exist', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('webhook-help-button').click()
    await expect(page.getByTestId('webhook-help-panel')).toBeVisible({ timeout: 10000 })

    // Each endpoint should have a curl copy button
    const copyButtons = page.getByTestId('webhook-endpoint-copy-curl')
    await expect(copyButtons).toHaveCount(3, { timeout: 10000 })

    // Click the first copy button and verify it changes to "Copied!"
    await copyButtons.first().click()
    await expect(copyButtons.first()).toContainText('Copied!')

    // Verify clipboard contains the curl command with actual URL
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toContain('curl -X POST')
    expect(clipboardText).not.toContain('YOUR_SITE')
    expect(clipboardText).toContain('app-builder-event')
  })

  test('WebhookHelpButton: Endpoint URL copy buttons exist', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('webhook-help-button').click()
    await expect(page.getByTestId('webhook-help-panel')).toBeVisible({ timeout: 10000 })

    // Each endpoint should have a "Copy URL" button
    const copyUrlButtons = page.getByTestId('webhook-endpoint-copy-path')
    await expect(copyUrlButtons).toHaveCount(3, { timeout: 10000 })

    // Click the first copy URL button and verify clipboard contains full URL
    await copyUrlButtons.first().click()
    await expect(copyUrlButtons.first()).toContainText('Copied!')

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toContain('/.netlify/functions/app-builder-event')
    expect(clipboardText).toMatch(/^https?:\/\//)
  })
})
