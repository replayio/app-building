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

const sampleContainer: ContainerInfo = {
  container_id: 'app-building-abc123',
  name: 'app-building-abc123',
  status: 'started',
  prompt: 'Build a dashboard app',
  last_event_at: '2026-02-28T12:00:00Z',
}

const containerNoPrompt: ContainerInfo = {
  container_id: 'app-building-noprompt',
  name: 'app-building-noprompt',
  status: 'started',
  prompt: null,
  last_event_at: '2026-02-28T10:00:00Z',
}

const sampleEvent: WebhookEvent = {
  id: 1,
  container_id: 'app-building-abc123',
  event_type: 'build_started',
  payload: { status: 'running', message: 'Build in progress' },
  received_at: '2026-02-28T12:05:00Z',
}

// ---------------------------------------------------------------------------
// BackLink
// ---------------------------------------------------------------------------

test.describe('BackLink', () => {
  test('BackLink: Visible in header', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    const backLink = page.getByTestId('status-back-link')
    await expect(backLink).toBeVisible({ timeout: 10000 })
    await expect(backLink).toContainText('Back')
  })

  test('BackLink: Navigates to MainPage on click', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('status-back-link').click()
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })
})

// ---------------------------------------------------------------------------
// DefaultPromptDisplay
// ---------------------------------------------------------------------------

test.describe('DefaultPromptDisplay', () => {
  test('DefaultPromptDisplay: Displays section title', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    const section = page.getByTestId('default-prompt')
    await expect(section).toBeVisible({ timeout: 10000 })
    await expect(section.locator('h2')).toContainText('Default Prompt')
  })

  test('DefaultPromptDisplay: Shows configured prompt text', async ({ page }) => {
    await setupMockStatus({
      ...emptyStatus,
      defaultPrompt: 'Build a todo app with authentication',
    })(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await expect(page.getByTestId('default-prompt-value')).toContainText(
      'Build a todo app with authentication'
    )
  })

  test('DefaultPromptDisplay: Shows placeholder when no prompt configured', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await expect(page.getByTestId('default-prompt-value')).toContainText(
      'No default prompt configured'
    )
  })
})

// ---------------------------------------------------------------------------
// ActiveContainers
// ---------------------------------------------------------------------------

test.describe('ActiveContainers', () => {
  test('ActiveContainers: Displays section title', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    const section = page.getByTestId('active-containers')
    await expect(section).toBeVisible({ timeout: 10000 })
    await expect(section.locator('h2')).toContainText('Active Containers')
  })

  test('ActiveContainers: Shows table with columns when containers exist', async ({ page }) => {
    await setupMockStatus({
      ...emptyStatus,
      containers: [sampleContainer],
    })(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    const table = page.getByTestId('active-containers-table')
    await expect(table).toBeVisible({ timeout: 10000 })

    // Verify column headers
    const headers = table.locator('th')
    await expect(headers.nth(0)).toContainText('Name')
    await expect(headers.nth(1)).toContainText('Status')
    await expect(headers.nth(2)).toContainText('Prompt')
    await expect(headers.nth(3)).toContainText('Last Event')
  })

  test('ActiveContainers: Shows container name in table row', async ({ page }) => {
    await setupMockStatus({
      ...emptyStatus,
      containers: [sampleContainer],
    })(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await expect(page.getByTestId('container-name')).toContainText('app-building-abc123')
  })

  test('ActiveContainers: Shows container status with styling', async ({ page }) => {
    await setupMockStatus({
      ...emptyStatus,
      containers: [sampleContainer],
    })(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    const statusCell = page.getByTestId('container-status')
    await expect(statusCell).toContainText('started')
    // Verify the status badge has a class for styling
    await expect(statusCell.locator('span')).toHaveClass(/active-containers__status--started/)
  })

  test('ActiveContainers: Shows container prompt', async ({ page }) => {
    await setupMockStatus({
      ...emptyStatus,
      containers: [sampleContainer],
    })(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await expect(page.getByTestId('container-prompt')).toContainText('Build a dashboard app')
  })

  test('ActiveContainers: Shows dash for missing prompt', async ({ page }) => {
    await setupMockStatus({
      ...emptyStatus,
      containers: [containerNoPrompt],
    })(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await expect(page.getByTestId('container-prompt')).toContainText('—')
  })

  test('ActiveContainers: Shows last event timestamp', async ({ page }) => {
    await setupMockStatus({
      ...emptyStatus,
      containers: [sampleContainer],
    })(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    const lastEvent = page.getByTestId('container-last-event')
    await expect(lastEvent).toBeVisible({ timeout: 10000 })
    // The timestamp should be formatted (not empty)
    const text = await lastEvent.textContent()
    expect(text!.trim().length).toBeGreaterThan(0)
  })

  test('ActiveContainers: Shows empty state when no containers', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await expect(page.getByTestId('active-containers-empty')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('active-containers-empty')).toContainText('No active containers')
    await expect(page.getByTestId('active-containers-table')).not.toBeVisible()
  })

  test('ActiveContainers: Shows pending container after spawn', async ({ page }) => {
    const testPrompt = `Test spawn prompt ${Date.now()}`

    // Call the actual spawn-container endpoint to create a container in the database.
    // In production, the container stays "pending" while the Fly machine boots.
    // In tests with dummy Fly credentials, the background function may transition the
    // status before the page loads, so we verify the spawn response shows "pending"
    // and the status page shows the container with correct name and prompt.
    const spawnResp = await page.request.post('/.netlify/functions/spawn-container', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WEBHOOK_SECRET}`,
      },
      data: { prompt: testPrompt },
    })
    expect(spawnResp.ok()).toBeTruthy()
    const spawnBody = await spawnResp.json()
    // The spawn endpoint creates the container with "pending" status
    expect(spawnBody.status).toBe('pending')
    expect(spawnBody.prompt).toBe(testPrompt)
    const containerName: string = spawnBody.name

    // Navigate to the status page and verify the container shows up
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    // The containers table should be visible (not the empty state)
    await expect(page.getByTestId('active-containers-table')).toBeVisible({ timeout: 10000 })

    // Find the row for the newly spawned container
    const row = page.getByTestId('active-container-row').filter({ hasText: containerName })
    await expect(row).toBeVisible({ timeout: 10000 })

    // Verify the prompt is shown
    await expect(row.getByTestId('container-prompt')).toContainText(testPrompt)
  })
})

// ---------------------------------------------------------------------------
// WebhookEventFeed
// ---------------------------------------------------------------------------

test.describe('WebhookEventFeed', () => {
  test('WebhookEventFeed: Displays section title', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    const section = page.getByTestId('webhook-event-feed')
    await expect(section).toBeVisible({ timeout: 10000 })
    await expect(section.locator('h2')).toContainText('Recent Webhook Events')
  })

  test('WebhookEventFeed: Shows event items with timestamp, container ID, and event type', async ({
    page,
  }) => {
    await setupMockStatus({
      ...emptyStatus,
      webhookEvents: [sampleEvent],
    })(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    const eventItem = page.getByTestId('webhook-event-item')
    await expect(eventItem).toHaveCount(1, { timeout: 10000 })

    // Verify timestamp is displayed
    const timestamp = page.getByTestId('webhook-event-timestamp')
    await expect(timestamp).toBeVisible()
    const tsText = await timestamp.textContent()
    expect(tsText!.trim().length).toBeGreaterThan(0)

    // Verify container ID
    await expect(page.getByTestId('webhook-event-container-id')).toContainText(
      'app-building-abc123'
    )

    // Verify event type
    await expect(page.getByTestId('webhook-event-type')).toContainText('build_started')
  })

  test('WebhookEventFeed: Shows event payload summary', async ({ page }) => {
    await setupMockStatus({
      ...emptyStatus,
      webhookEvents: [sampleEvent],
    })(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    const payload = page.getByTestId('webhook-event-payload')
    await expect(payload).toBeVisible({ timeout: 10000 })
    // The payload summary should contain the key-value pairs
    await expect(payload).toContainText('status')
    await expect(payload).toContainText('running')
    await expect(payload).toContainText('message')
    await expect(payload).toContainText('Build in progress')
  })

  test('WebhookEventFeed: Shows empty state when no events', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await expect(page.getByTestId('webhook-feed-empty')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('webhook-feed-empty')).toContainText(
      'No webhook events received'
    )
  })
})

// ---------------------------------------------------------------------------
// WebhookHelpButton
// ---------------------------------------------------------------------------

test.describe('WebhookHelpButton', () => {
  test('WebhookHelpButton: Visible on StatusPage', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    const helpBtn = page.getByTestId('webhook-help-button')
    await expect(helpBtn).toBeVisible({ timeout: 10000 })
    await expect(helpBtn).toContainText('Webhook Documentation')
  })

  test('WebhookHelpButton: Opens help panel on click', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await expect(page.getByTestId('webhook-help-panel')).not.toBeVisible()

    await page.getByTestId('webhook-help-button').click()
    await expect(page.getByTestId('webhook-help-panel')).toBeVisible({ timeout: 10000 })
  })

  test('WebhookHelpButton: Closes help panel', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('webhook-help-button').click()
    await expect(page.getByTestId('webhook-help-panel')).toBeVisible({ timeout: 10000 })

    await page.getByTestId('webhook-help-close').click()
    await expect(page.getByTestId('webhook-help-panel')).not.toBeVisible()
  })

  test('WebhookHelpButton: Shows app-builder-event endpoint documentation', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('webhook-help-button').click()
    await expect(page.getByTestId('webhook-help-panel')).toBeVisible({ timeout: 10000 })

    const endpoints = page.getByTestId('webhook-help-endpoint')
    // First endpoint is app-builder-event
    const ep = endpoints.nth(0)

    // URL path
    await expect(ep.getByTestId('webhook-endpoint-path')).toContainText(
      '/.netlify/functions/app-builder-event'
    )
    // HTTP method
    await expect(ep.getByTestId('webhook-endpoint-method')).toContainText('POST')
    // Authentication
    await expect(ep.getByTestId('webhook-endpoint-auth')).toContainText('Bearer token')
    await expect(ep.getByTestId('webhook-endpoint-auth')).toContainText('secret query parameter')
    // Required fields: container_id, event_type
    const requiredFields = ep.getByTestId('webhook-endpoint-required-fields')
    await expect(requiredFields).toContainText('container_id')
    await expect(requiredFields).toContainText('string')
    await expect(requiredFields).toContainText('event_type')
    // Optional fields: payload, status
    const optionalFields = ep.getByTestId('webhook-endpoint-optional-fields')
    await expect(optionalFields).toContainText('payload')
    await expect(optionalFields).toContainText('object')
    await expect(optionalFields).toContainText('status')
    // Example curl command
    await expect(ep.getByTestId('webhook-endpoint-curl')).toContainText('curl -X POST')
    await expect(ep.getByTestId('webhook-endpoint-curl')).toContainText('app-builder-event')
  })

  test('WebhookHelpButton: Shows spawn-container endpoint documentation', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('webhook-help-button').click()
    await expect(page.getByTestId('webhook-help-panel')).toBeVisible({ timeout: 10000 })

    const endpoints = page.getByTestId('webhook-help-endpoint')
    // Second endpoint is spawn-container
    const ep = endpoints.nth(1)

    // URL path
    await expect(ep.getByTestId('webhook-endpoint-path')).toContainText(
      '/.netlify/functions/spawn-container'
    )
    // HTTP method
    await expect(ep.getByTestId('webhook-endpoint-method')).toContainText('POST')
    // Authentication
    await expect(ep.getByTestId('webhook-endpoint-auth')).toContainText('Bearer token')
    await expect(ep.getByTestId('webhook-endpoint-auth')).toContainText('secret query parameter')
    // Required fields: none
    const requiredFields = ep.getByTestId('webhook-endpoint-required-fields')
    await expect(requiredFields).toContainText('None')
    // Optional fields: prompt
    const optionalFields = ep.getByTestId('webhook-endpoint-optional-fields')
    await expect(optionalFields).toContainText('prompt')
    await expect(optionalFields).toContainText('string')
    // Example curl command
    await expect(ep.getByTestId('webhook-endpoint-curl')).toContainText('curl -X POST')
    await expect(ep.getByTestId('webhook-endpoint-curl')).toContainText('spawn-container')
  })

  test('WebhookHelpButton: Shows set-default-prompt endpoint documentation', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('webhook-help-button').click()
    await expect(page.getByTestId('webhook-help-panel')).toBeVisible({ timeout: 10000 })

    const endpoints = page.getByTestId('webhook-help-endpoint')
    // Third endpoint is set-default-prompt
    const ep = endpoints.nth(2)

    // URL path
    await expect(ep.getByTestId('webhook-endpoint-path')).toContainText(
      '/.netlify/functions/set-default-prompt'
    )
    // HTTP method
    await expect(ep.getByTestId('webhook-endpoint-method')).toContainText('POST')
    // Authentication
    await expect(ep.getByTestId('webhook-endpoint-auth')).toContainText('Bearer token')
    await expect(ep.getByTestId('webhook-endpoint-auth')).toContainText('secret query parameter')
    // Required fields: prompt
    const requiredFields = ep.getByTestId('webhook-endpoint-required-fields')
    await expect(requiredFields).toContainText('prompt')
    await expect(requiredFields).toContainText('string')
    // No optional fields section for this endpoint (optionalFields is empty, so it won't render)
    // Example curl command
    await expect(ep.getByTestId('webhook-endpoint-curl')).toContainText('curl -X POST')
    await expect(ep.getByTestId('webhook-endpoint-curl')).toContainText('set-default-prompt')
  })

  test('WebhookHelpButton: Example curl commands are accurate', async ({ page }) => {
    await setupMockStatus(emptyStatus)(page)
    await page.goto('/status')
    await expect(page.getByTestId('status-page')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('webhook-help-button').click()
    await expect(page.getByTestId('webhook-help-panel')).toBeVisible({ timeout: 10000 })

    const curlBlocks = page.getByTestId('webhook-endpoint-curl')
    await expect(curlBlocks).toHaveCount(3, { timeout: 10000 })

    // Each curl command should include correct structure
    for (let i = 0; i < 3; i++) {
      const text = await curlBlocks.nth(i).textContent()
      expect(text).toContain('curl -X POST')
      expect(text).toContain('Content-Type: application/json')
      expect(text).toContain('Authorization: Bearer')
    }

    // Verify first curl has the correct endpoint and valid JSON body
    const first = await curlBlocks.nth(0).textContent()
    expect(first).toContain('app-builder-event')
    expect(first).toContain('container_id')
    expect(first).toContain('event_type')

    // Verify second curl has spawn-container endpoint
    const second = await curlBlocks.nth(1).textContent()
    expect(second).toContain('spawn-container')

    // Verify third curl has set-default-prompt endpoint
    const third = await curlBlocks.nth(2).textContent()
    expect(third).toContain('set-default-prompt')
    expect(third).toContain('prompt')
  })

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
