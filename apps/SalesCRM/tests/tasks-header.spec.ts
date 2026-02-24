import { test, expect } from '@playwright/test'

test.describe('TasksHeader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-header')).toBeVisible()
    // Wait for tasks to load
    await expect(
      page.getByTestId('tasks-list')
        .or(page.getByTestId('tasks-list-empty'))
        .or(page.getByTestId('tasks-list-no-results'))
    ).toBeVisible()
  })

  test('Page title displays "Upcoming Tasks"', async ({ page }) => {
    const heading = page.getByTestId('tasks-header').locator('h1')
    await expect(heading).toContainText('Upcoming Tasks')
    // Verify it's prominently styled (large, bold)
    await expect(heading).toHaveClass(/page-title/)
  })

  test('New Task button is displayed as a blue primary button', async ({ page }) => {
    const btn = page.getByTestId('new-task-button')
    await expect(btn).toBeVisible()
    await expect(btn).toContainText('New Task')
    await expect(btn).toHaveClass(/btn-primary/)
  })

  test('New Task button opens task creation dialog', async ({ page }) => {
    await page.getByTestId('new-task-button').click()
    await expect(page.getByTestId('task-form-modal')).toBeVisible()

    // Form includes all required fields
    await expect(page.getByTestId('task-form-name')).toBeVisible()
    await expect(page.getByTestId('task-form-due-date')).toBeVisible()
    await expect(page.getByTestId('task-form-priority')).toBeVisible()
    await expect(page.getByTestId('task-form-assignee')).toBeVisible()
    await expect(page.getByTestId('task-form-client')).toBeVisible()
    await expect(page.getByTestId('task-form-deal')).toBeVisible()

    // Priority dropdown should have options: High, Medium, Low, Normal
    await page.getByTestId('task-form-priority-trigger').click()
    await expect(page.getByTestId('task-form-priority-option-high')).toBeVisible()
    await expect(page.getByTestId('task-form-priority-option-medium')).toBeVisible()
    await expect(page.getByTestId('task-form-priority-option-low')).toBeVisible()
    await expect(page.getByTestId('task-form-priority-option-normal')).toBeVisible()
  })

  test('New Task form validates required fields', async ({ page }) => {
    await page.getByTestId('new-task-button').click()
    await expect(page.getByTestId('task-form-modal')).toBeVisible()

    // Leave name empty and submit
    await page.getByTestId('task-form-submit').click()

    // Validation error should appear
    await expect(page.getByTestId('task-form-name-error')).toContainText('Task name is required')

    // Modal should still be open
    await expect(page.getByTestId('task-form-modal')).toBeVisible()
  })

  test('New Task can be created successfully', async ({ page }) => {
    test.setTimeout(120000)
    const uniqueName = `TestTask-${Date.now()}`

    // Get data for form dropdowns
    const response = await page.request.get('/.netlify/functions/tasks')
    const data = await response.json()
    const acmeClient = data.clients.find((c: { name: string }) => c.name === 'Acme Corp')

    await page.getByTestId('new-task-button').click()
    await expect(page.getByTestId('task-form-modal')).toBeVisible()

    // Fill task name
    await page.getByTestId('task-form-name').fill(uniqueName)

    // Select due date (tomorrow at 3:00 PM)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateValue = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}T15:00`
    await page.getByTestId('task-form-due-date').fill(dateValue)

    // Select High priority
    await page.getByTestId('task-form-priority-trigger').click()
    await page.getByTestId('task-form-priority-option-high').click()

    // Select an assignee (first available)
    await page.getByTestId('task-form-assignee-trigger').click()
    const assigneeMenu = page.getByTestId('task-form-assignee-menu')
    await expect(assigneeMenu).toBeVisible()
    const firstAssignee = assigneeMenu.locator('.form-dropdown-option').filter({ hasNotText: 'None' }).first()
    await firstAssignee.click()

    // Select Acme Corp as client
    if (acmeClient) {
      await page.getByTestId('task-form-client-trigger').click()
      await page.getByTestId(`task-form-client-option-${acmeClient.id}`).click()
    }

    // Submit
    await page.getByTestId('task-form-submit').click()

    // Dialog closes
    await expect(page.getByTestId('task-form-modal')).not.toBeVisible({ timeout: 10000 })

    // Success message shown
    await expect(page.getByTestId('task-success-message')).toContainText('Task created successfully')

    // New task appears in list with High priority badge
    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: uniqueName })
    await expect(taskCard).toBeVisible({ timeout: 10000 })
    await expect(taskCard.locator('[data-testid^="task-priority-"]')).toContainText('High')
  })

  test('New Task dialog can be cancelled', async ({ page }) => {
    await page.getByTestId('new-task-button').click()
    await expect(page.getByTestId('task-form-modal')).toBeVisible()

    // Enter partial data
    await page.getByTestId('task-form-name').fill('CancelledTask')

    // Click Cancel
    await page.getByTestId('task-form-cancel').click()

    // Dialog closes
    await expect(page.getByTestId('task-form-modal')).not.toBeVisible()

    // No new task should appear
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'CancelledTask' })
    ).toHaveCount(0)
  })

  test('New Task with optional deal association', async ({ page }) => {
    test.setTimeout(120000)
    const uniqueName = `DealTask-${Date.now()}`

    // Get data for form dropdowns
    const response = await page.request.get('/.netlify/functions/tasks')
    const data = await response.json()
    const acmeClient = data.clients.find((c: { name: string }) => c.name === 'Acme Corp')
    const acmeDeals = data.deals.filter((d: { client_id: string }) => d.client_id === acmeClient?.id)

    await page.getByTestId('new-task-button').click()
    await expect(page.getByTestId('task-form-modal')).toBeVisible()

    // Fill required fields
    await page.getByTestId('task-form-name').fill(uniqueName)

    // Select Acme Corp as client
    await page.getByTestId('task-form-client-trigger').click()
    await page.getByTestId(`task-form-client-option-${acmeClient.id}`).click()

    // Select a deal from the Deal dropdown (populated based on selected client)
    await page.getByTestId('task-form-deal-trigger').click()
    const dealMenu = page.getByTestId('task-form-deal-menu')
    await expect(dealMenu).toBeVisible()
    await page.getByTestId(`task-form-deal-option-${acmeDeals[0].id}`).click()

    // Submit
    await page.getByTestId('task-form-submit').click()

    // Dialog closes
    await expect(page.getByTestId('task-form-modal')).not.toBeVisible({ timeout: 10000 })

    // Task appears in list
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: uniqueName })
    ).toBeVisible({ timeout: 10000 })

    // Verify via API that the task is linked to both client and deal
    const tasksResponse = await page.request.get('/.netlify/functions/tasks')
    const tasksData = await tasksResponse.json()
    const createdTask = tasksData.tasks.find((t: { title: string }) => t.title === uniqueName)
    expect(createdTask).toBeTruthy()
    expect(createdTask.client_id).toBe(acmeClient.id)
    expect(createdTask.deal_id).toBe(acmeDeals[0].id)
  })
})
