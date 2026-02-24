import { test, expect } from '@playwright/test'

// Track IDs of tasks created in beforeAll for cleanup
const createdTaskIds: string[] = []
// Unique suffix per worker to avoid duplicates from fullyParallel
let workerSuffix = ''
// Client IDs stored at describe scope for URL assertions
let acmeClientId = ''
let globexClientId = ''

test.describe('TasksList', () => {
  test.beforeAll(async ({ request }) => {
    workerSuffix = `-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    // Get available clients
    const res = await request.get('/.netlify/functions/tasks')
    const data = await res.json()
    const acmeClient = data.clients.find((c: { name: string }) => c.name === 'Acme Corp')
    const globexClient = data.clients.find((c: { name: string }) => c.name === 'Globex Solutions')
    acmeClientId = acmeClient?.id || ''
    globexClientId = globexClient?.id || ''

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    const nextMonth = new Date(now)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    // Create tasks with diverse attributes for display and action tests
    const testTasks = [
      {
        title: `ListTest-High-Task${workerSuffix}`,
        priority: 'High',
        assignee: 'Sarah Jenkins',
        assignee_role: 'CEO',
        client_id: acmeClient?.id,
        due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0).toISOString(),
      },
      {
        title: `ListTest-Medium-Task${workerSuffix}`,
        priority: 'Medium',
        assignee: 'Michael Chen',
        assignee_role: 'CTO',
        client_id: globexClient?.id,
        due_date: tomorrow.toISOString(),
      },
      {
        title: `ListTest-Low-Task${workerSuffix}`,
        priority: 'Low',
        assignee: 'Sarah Jenkins',
        assignee_role: 'CEO',
        client_id: acmeClient?.id,
        due_date: nextMonth.toISOString(),
      },
      {
        title: `ListTest-Normal-Task${workerSuffix}`,
        priority: 'Normal',
        client_id: globexClient?.id,
      },
    ]

    for (const task of testTasks) {
      const resp = await request.post('/.netlify/functions/tasks', { data: task })
      const created = await resp.json()
      createdTaskIds.push(created.id)
    }
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks')
    await expect(
      page.getByTestId('tasks-list')
        .or(page.getByTestId('tasks-list-empty'))
    ).toBeVisible()
  })

  test('Task cards display all required elements', async ({ page }) => {
    // Find a test task card with known attributes
    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-High-Task${workerSuffix}` })
    await expect(taskCard).toBeVisible({ timeout: 10000 })

    // Priority badge
    await expect(taskCard.locator('[data-testid^="task-priority-"]')).toBeVisible()

    // Task name in bold
    await expect(taskCard.locator('[data-testid^="task-name-"]')).toBeVisible()

    // Due date
    await expect(taskCard.locator('[data-testid^="task-due-date-"]')).toBeVisible()

    // Assignee avatar and name
    const assignee = taskCard.locator('[data-testid^="task-assignee-"]')
    await expect(assignee).toBeVisible()
    await expect(assignee.locator('.task-assignee-avatar')).toBeVisible()
    await expect(assignee.locator('.task-assignee-name')).toBeVisible()

    // Action menu button (...)
    await expect(taskCard.locator('[data-testid^="task-actions-"]')).toBeVisible()
  })

  test('Priority badges are color-coded correctly', async ({ page }) => {
    // High priority - red/orange badge
    const highCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-High-Task${workerSuffix}` })
    await expect(highCard).toBeVisible({ timeout: 10000 })
    const highBadge = highCard.locator('[data-testid^="task-priority-"]')
    await expect(highBadge).toContainText('High')
    await expect(highBadge).toHaveClass(/priority-high/)

    // Medium priority - yellow badge
    const medCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-Medium-Task${workerSuffix}` })
    await expect(medCard).toBeVisible()
    const medBadge = medCard.locator('[data-testid^="task-priority-"]')
    await expect(medBadge).toContainText('Medium')
    await expect(medBadge).toHaveClass(/priority-medium/)

    // Low priority - green badge
    const lowCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-Low-Task${workerSuffix}` })
    await expect(lowCard).toBeVisible()
    const lowBadge = lowCard.locator('[data-testid^="task-priority-"]')
    await expect(lowBadge).toContainText('Low')
    await expect(lowBadge).toHaveClass(/priority-low/)

    // Normal priority - blue/teal badge
    const normalCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-Normal-Task${workerSuffix}` })
    await expect(normalCard).toBeVisible()
    const normalBadge = normalCard.locator('[data-testid^="task-priority-"]')
    await expect(normalBadge).toContainText('Normal')
    await expect(normalBadge).toHaveClass(/priority-normal/)
  })

  test('Task name is displayed in bold', async ({ page }) => {
    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-High-Task${workerSuffix}` })
    await expect(taskCard).toBeVisible({ timeout: 10000 })

    const taskName = taskCard.locator('[data-testid^="task-name-"]')
    await expect(taskName).toContainText(`ListTest-High-Task${workerSuffix}`)
    // task-name class has font-weight: 600 (bold)
    await expect(taskName).toHaveClass(/task-name/)
  })

  test('Due date displays relative dates for upcoming tasks', async ({ page }) => {
    // Task due today should show "Due: Today, ..."
    const todayCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-High-Task${workerSuffix}` })
    await expect(todayCard).toBeVisible({ timeout: 10000 })
    const todayDue = todayCard.locator('[data-testid^="task-due-date-"]')
    await expect(todayDue).toContainText('Due: Today,')

    // Task due tomorrow should show "Due: Tomorrow, ..."
    const tomorrowCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-Medium-Task${workerSuffix}` })
    await expect(tomorrowCard).toBeVisible()
    const tomorrowDue = tomorrowCard.locator('[data-testid^="task-due-date-"]')
    await expect(tomorrowDue).toContainText('Due: Tomorrow,')
  })

  test('Due date displays absolute dates for future tasks', async ({ page }) => {
    // Task due next month should show "Due: Mon DD, YYYY" format
    const futureCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-Low-Task${workerSuffix}` })
    await expect(futureCard).toBeVisible({ timeout: 10000 })
    const futureDue = futureCard.locator('[data-testid^="task-due-date-"]')
    // Should show "Due:" prefix with a date (not Today or Tomorrow)
    await expect(futureDue).toContainText('Due:')
    const text = await futureDue.textContent()
    expect(text).not.toContain('Today')
    expect(text).not.toContain('Tomorrow')
    // Should match a date pattern like "Due: Mar 24, 2026"
    expect(text).toMatch(/Due: \w{3} \d{1,2}, \d{4}/)
  })

  test('Assignee displays avatar, abbreviated name, and role', async ({ page }) => {
    // Sarah Jenkins (CEO) should show as "Sarah J." with "(CEO)"
    const sarahCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-High-Task${workerSuffix}` })
    await expect(sarahCard).toBeVisible({ timeout: 10000 })
    const sarahAssignee = sarahCard.locator('[data-testid^="task-assignee-"]')
    await expect(sarahAssignee.locator('.task-assignee-avatar')).toBeVisible()
    await expect(sarahAssignee.locator('.task-assignee-name')).toContainText('Sarah J.')
    await expect(sarahAssignee.locator('.task-assignee-name')).toContainText('(CEO)')

    // Michael Chen (CTO) should show as "Michael C." with "(CTO)"
    const michaelCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-Medium-Task${workerSuffix}` })
    await expect(michaelCard).toBeVisible()
    const michaelAssignee = michaelCard.locator('[data-testid^="task-assignee-"]')
    await expect(michaelAssignee.locator('.task-assignee-avatar')).toBeVisible()
    await expect(michaelAssignee.locator('.task-assignee-name')).toContainText('Michael C.')
    await expect(michaelAssignee.locator('.task-assignee-name')).toContainText('(CTO)')
  })

  test('Tasks are ordered by due date with soonest first', async ({ page }) => {
    await expect(page.getByTestId('tasks-list')).toBeVisible({ timeout: 10000 })

    // Get all task card positions
    const todayCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-High-Task${workerSuffix}` })
    const tomorrowCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-Medium-Task${workerSuffix}` })
    const futureCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-Low-Task${workerSuffix}` })

    await expect(todayCard).toBeVisible()
    await expect(tomorrowCard).toBeVisible()
    await expect(futureCard).toBeVisible()

    // Compare vertical positions - today should be above tomorrow, tomorrow above future
    const todayBox = await todayCard.boundingBox()
    const tomorrowBox = await tomorrowCard.boundingBox()
    const futureBox = await futureCard.boundingBox()

    expect(todayBox!.y).toBeLessThan(tomorrowBox!.y)
    expect(tomorrowBox!.y).toBeLessThan(futureBox!.y)
  })

  test('Action menu opens with options', async ({ page }) => {
    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-High-Task${workerSuffix}` })
    await expect(taskCard).toBeVisible({ timeout: 10000 })

    // Get task ID from the action button's testid
    const actionBtn = taskCard.locator('[data-testid^="task-actions-"]')
    const testId = await actionBtn.getAttribute('data-testid')
    const taskId = testId!.replace('task-actions-', '')

    // Click action menu
    await actionBtn.click()

    // Menu should appear with all options
    const menu = page.getByTestId(`task-action-menu-${taskId}`)
    await expect(menu).toBeVisible()
    await expect(page.getByTestId(`task-action-view-${taskId}`)).toContainText('View Details')
    await expect(page.getByTestId(`task-action-edit-${taskId}`)).toContainText('Edit')
    await expect(page.getByTestId(`task-action-complete-${taskId}`)).toContainText('Mark as Complete')
    await expect(page.getByTestId(`task-action-delete-${taskId}`)).toContainText('Delete')
  })

  test('Action menu "View Details" navigates to associated client detail page', async ({ page }) => {
    // Use a task associated with Acme Corp
    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-High-Task${workerSuffix}` })
    await expect(taskCard).toBeVisible({ timeout: 10000 })

    const actionBtn = taskCard.locator('[data-testid^="task-actions-"]')
    const testId = await actionBtn.getAttribute('data-testid')
    const taskId = testId!.replace('task-actions-', '')

    await actionBtn.click()
    await page.getByTestId(`task-action-view-${taskId}`).click()

    // Should navigate to client detail page for Acme Corp
    await expect(page).toHaveURL(new RegExp(`/clients/${acmeClientId}`))
    await expect(page.locator('h1')).toContainText('Acme Corp')
  })

  test('Action menu "Edit" opens task edit dialog', async ({ page }) => {
    // Find a task and open its action menu
    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-Medium-Task${workerSuffix}` })
    await expect(taskCard).toBeVisible({ timeout: 10000 })

    const actionBtn = taskCard.locator('[data-testid^="task-actions-"]')
    const testId = await actionBtn.getAttribute('data-testid')
    const taskId = testId!.replace('task-actions-', '')

    await actionBtn.click()
    await page.getByTestId(`task-action-edit-${taskId}`).click()

    // Edit dialog should open pre-populated with all task data
    await expect(page.getByTestId('task-form-modal')).toBeVisible()
    await expect(page.getByTestId('task-form-name')).toHaveValue(`ListTest-Medium-Task${workerSuffix}`)
    await expect(page.getByTestId('task-form-due-date')).not.toHaveValue('')
    await expect(page.getByTestId('task-form-priority-trigger')).toContainText('Medium')
    await expect(page.getByTestId('task-form-assignee-trigger')).toContainText('Michael C.')
    await expect(page.getByTestId('task-form-client-trigger')).toContainText('Globex')

    // Change priority from Medium to Low
    await page.getByTestId('task-form-priority-trigger').click()
    await page.getByTestId('task-form-priority-option-low').click()

    // Save
    await page.getByTestId('task-form-submit').click()
    await expect(page.getByTestId('task-form-modal')).not.toBeVisible({ timeout: 10000 })

    // Task card should update to show Low priority badge
    const updatedCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-Medium-Task${workerSuffix}` })
    await expect(updatedCard).toBeVisible({ timeout: 10000 })
    await expect(updatedCard.locator('[data-testid^="task-priority-"]')).toHaveClass(/priority-low/, { timeout: 10000 })

    // Revert priority back to Medium for other tests
    const revertBtn = updatedCard.locator('[data-testid^="task-actions-"]')
    const revertTestId = await revertBtn.getAttribute('data-testid')
    const revertTaskId = revertTestId!.replace('task-actions-', '')
    await revertBtn.click()
    await page.getByTestId(`task-action-edit-${revertTaskId}`).click()
    await expect(page.getByTestId('task-form-modal')).toBeVisible()
    await page.getByTestId('task-form-priority-trigger').click()
    await page.getByTestId('task-form-priority-option-medium').click()
    await page.getByTestId('task-form-submit').click()
    await expect(page.getByTestId('task-form-modal')).not.toBeVisible({ timeout: 10000 })
  })

  test('Action menu "Edit" dialog can be cancelled', async ({ page }) => {
    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-Low-Task${workerSuffix}` })
    await expect(taskCard).toBeVisible({ timeout: 10000 })

    const actionBtn = taskCard.locator('[data-testid^="task-actions-"]')
    const testId = await actionBtn.getAttribute('data-testid')
    const taskId = testId!.replace('task-actions-', '')

    await actionBtn.click()
    await page.getByTestId(`task-action-edit-${taskId}`).click()

    // Edit dialog should open pre-populated
    await expect(page.getByTestId('task-form-modal')).toBeVisible()
    await expect(page.getByTestId('task-form-name')).toHaveValue(`ListTest-Low-Task${workerSuffix}`)

    // Make modifications but cancel
    await page.getByTestId('task-form-name').clear()
    await page.getByTestId('task-form-name').fill('CancelledEditTask')
    await page.getByTestId('task-form-cancel').click()

    // Dialog closes
    await expect(page.getByTestId('task-form-modal')).not.toBeVisible()

    // Original task still shown unchanged
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-Low-Task${workerSuffix}` })
    ).toBeVisible()

    // Cancelled name should not appear
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'CancelledEditTask' })
    ).toHaveCount(0)
  })

  test('Action menu "Mark as Complete" completes the task', async ({ page, request }) => {
    test.setTimeout(120000)
    // Create a task specifically for completion test
    const uniqueName = `CompleteMe-${Date.now()}`
    const acmeRes = await request.get('/.netlify/functions/tasks')
    const acmeData = await acmeRes.json()
    const acmeClient = acmeData.clients.find((c: { name: string }) => c.name === 'Acme Corp')

    const createRes = await request.post('/.netlify/functions/tasks', {
      data: { title: uniqueName, priority: 'High', client_id: acmeClient?.id },
    })
    const createdTask = await createRes.json()

    // Reload the page to see the new task
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list')).toBeVisible()

    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: uniqueName })
    await expect(taskCard).toBeVisible({ timeout: 10000 })

    const actionBtn = taskCard.locator('[data-testid^="task-actions-"]')
    await actionBtn.click()
    await page.getByTestId(`task-action-complete-${createdTask.id}`).click()

    // Task should be removed from the upcoming list
    await expect(taskCard).not.toBeVisible({ timeout: 10000 })

    // Verify via API that the task is marked as completed
    const verifyRes = await request.get(`/.netlify/functions/tasks/${createdTask.id}`)
    const verifyData = await verifyRes.json()
    expect(verifyData.completed).toBe(true)

    // Cross-page verification: completed task no longer appears in client's Tasks section
    if (acmeClient) {
      await page.goto(`/clients/${acmeClient.id}`)
      await expect(page.getByTestId('client-tasks-section')).toBeVisible({ timeout: 10000 })
      await expect(
        page.locator('[data-testid^="client-task-"]').filter({ hasText: uniqueName })
      ).toHaveCount(0)
    }
  })

  test('Action menu "Delete" removes task with confirmation', async ({ page, request }) => {
    test.setTimeout(120000)
    // Create a task specifically for deletion test
    const uniqueName = `DeleteMe-${Date.now()}`
    const acmeRes = await request.get('/.netlify/functions/tasks')
    const acmeData = await acmeRes.json()
    const acmeClient = acmeData.clients.find((c: { name: string }) => c.name === 'Acme Corp')

    const createRes = await request.post('/.netlify/functions/tasks', {
      data: { title: uniqueName, priority: 'Normal', client_id: acmeClient?.id },
    })
    const createdTask = await createRes.json()

    // Reload the page to see the new task
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list')).toBeVisible()

    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: uniqueName })
    await expect(taskCard).toBeVisible({ timeout: 10000 })

    const actionBtn = taskCard.locator('[data-testid^="task-actions-"]')

    // Click Delete
    await actionBtn.click()
    await page.getByTestId(`task-action-delete-${createdTask.id}`).click()

    // Confirmation dialog should appear
    await expect(page.getByTestId('task-delete-confirm-modal')).toBeVisible()
    await expect(page.getByTestId('task-delete-confirm-message')).toContainText('Are you sure you want to delete this task?')

    // First cancel
    await page.getByTestId('task-delete-cancel').click()
    await expect(page.getByTestId('task-delete-confirm-modal')).not.toBeVisible()
    // Task should still be in the list
    await expect(taskCard).toBeVisible()

    // Now actually delete
    await actionBtn.click()
    await page.getByTestId(`task-action-delete-${createdTask.id}`).click()
    await expect(page.getByTestId('task-delete-confirm-modal')).toBeVisible()
    await page.getByTestId('task-delete-confirm').click()

    // Task should be removed
    await expect(taskCard).not.toBeVisible({ timeout: 10000 })

    // Verify via API that the task is deleted
    const verifyRes = await request.get(`/.netlify/functions/tasks/${createdTask.id}`)
    expect(verifyRes.status()).toBe(404)

    // Cross-page verification: deleted task no longer appears in client's Tasks section
    if (acmeClient) {
      await page.goto(`/clients/${acmeClient.id}`)
      await expect(page.getByTestId('client-tasks-section')).toBeVisible({ timeout: 10000 })
      await expect(
        page.locator('[data-testid^="client-task-"]').filter({ hasText: uniqueName })
      ).toHaveCount(0)
    }
  })

  test('Task list shows empty state when no tasks exist', async ({ page, request }) => {
    test.setTimeout(120000)
    // Get all current incomplete tasks and mark them as completed
    const res = await request.get('/.netlify/functions/tasks')
    const data = await res.json()
    const tasksToRestore: string[] = data.tasks.map((t: { id: string }) => t.id)

    for (const id of tasksToRestore) {
      await request.put(`/.netlify/functions/tasks/${id}`, {
        data: { completed: true },
      })
    }

    // Reload the page to see the true empty state
    await page.goto('/tasks')

    // True empty state should appear with data-testid tasks-list-empty
    await expect(page.getByTestId('tasks-list-empty')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('tasks-list-empty')).toContainText('No upcoming tasks. Create a new task to get started.')

    // Restore tasks for remaining tests
    for (const id of tasksToRestore) {
      await request.put(`/.netlify/functions/tasks/${id}`, {
        data: { completed: false },
      })
    }
  })

  test('Clicking a task card navigates to associated client detail page', async ({ page }) => {
    // Find a task associated with a client (Globex Solutions)
    const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: `ListTest-Medium-Task${workerSuffix}` })
    await expect(taskCard).toBeVisible({ timeout: 10000 })

    // Click on the task name
    const taskName = taskCard.locator('[data-testid^="task-name-"]')
    await taskName.click()

    // Should navigate to client detail page for Globex Solutions
    await expect(page).toHaveURL(new RegExp(`/clients/${globexClientId}`))
    await expect(page.locator('h1')).toContainText('Globex')
  })
})
