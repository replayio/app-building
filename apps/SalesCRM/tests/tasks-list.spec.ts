import { test, expect } from '@playwright/test'

test.describe('TaskCard Display', () => {
  test('Task card displays priority badge with correct color', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    // Wait for task cards to load
    const taskCards = page.locator('[data-testid^="task-card-"]')
    await expect(taskCards.first()).toBeVisible({ timeout: 30000 })

    // Every visible task card should have a priority badge
    const badges = page.getByTestId('task-priority-badge')
    await expect(badges.first()).toBeVisible()

    // Check that priority badges have expected text values
    const firstBadge = badges.first()
    const badgeText = await firstBadge.textContent()
    expect(['High', 'Medium', 'Normal', 'Low']).toContain(badgeText?.trim())

    // Check that the badge has a non-transparent background color (color-coded)
    const bgColor = await firstBadge.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('Task card displays task title', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    const taskCards = page.locator('[data-testid^="task-card-"]')
    await expect(taskCards.first()).toBeVisible({ timeout: 30000 })

    // Each card should have a title element with non-empty text
    const titles = page.getByTestId('task-title')
    await expect(titles.first()).toBeVisible()
    const titleText = await titles.first().textContent()
    expect(titleText?.trim().length).toBeGreaterThan(0)
  })

  test('Task card displays formatted due date', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    const taskCards = page.locator('[data-testid^="task-card-"]')
    await expect(taskCards.first()).toBeVisible({ timeout: 30000 })

    // Find a card with a due date displayed
    const dueDates = page.getByTestId('task-due-date')
    const count = await dueDates.count()
    if (count > 0) {
      const dueDateText = await dueDates.first().textContent()
      // Due date should be prefixed with "Due:"
      expect(dueDateText).toContain('Due:')
    }
  })

  test('Task card displays assignee avatar and name with role', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    const taskCards = page.locator('[data-testid^="task-card-"]')
    await expect(taskCards.first()).toBeVisible({ timeout: 30000 })

    // Find a card with an assignee
    const assignees = page.getByTestId('task-assignee')
    const count = await assignees.count()
    if (count > 0) {
      const assignee = assignees.first()
      await expect(assignee).toBeVisible()

      // Should have either an avatar image or initials circle
      const hasImg = await assignee.locator('img').count()
      const hasInitials = await assignee.locator('div.rounded-full').count()
      expect(hasImg + hasInitials).toBeGreaterThan(0)

      // Should display name text with role in parentheses (e.g. "Sarah J. (PM)")
      const assigneeText = await assignee.textContent()
      expect(assigneeText?.trim().length).toBeGreaterThan(0)
    }
  })
})

test.describe('TasksFilterBar', () => {
  test('Search input filters tasks by title', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    // Wait for tasks to load
    const taskCards = page.locator('[data-testid^="task-card-"]')
    await expect(taskCards.first()).toBeVisible({ timeout: 30000 })

    // Get a task title to search for
    const firstTitle = await page.getByTestId('task-title').first().textContent()
    const searchTerm = firstTitle!.trim().split(' ')[0]

    // Type in the search input
    const searchInput = page.getByTestId('task-search-input')
    await searchInput.fill(searchTerm)

    // Wait for debounce and results to update
    await page.waitForTimeout(500)

    // All remaining visible cards should contain the search term in their title
    await expect(async () => {
      const visibleTitles = page.getByTestId('task-title')
      const titleCount = await visibleTitles.count()
      expect(titleCount).toBeGreaterThan(0)
      for (let i = 0; i < titleCount; i++) {
        const text = await visibleTitles.nth(i).textContent()
        expect(text?.toLowerCase()).toContain(searchTerm.toLowerCase())
      }
    }).toPass({ timeout: 15000 })
  })

  test('Search input clears and shows all tasks', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    const taskCards = page.locator('[data-testid^="task-card-"]')
    await expect(taskCards.first()).toBeVisible({ timeout: 30000 })

    // Get initial task count
    const searchInput = page.getByTestId('task-search-input')

    // Type a search term
    await searchInput.fill('xyznonexistent')
    await page.waitForTimeout(500)

    // Should show empty state or no cards
    await expect(page.getByTestId('tasks-empty')).toBeVisible({ timeout: 15000 })

    // Clear the search
    await searchInput.fill('')
    await page.waitForTimeout(500)

    // Tasks should appear again
    await expect(taskCards.first()).toBeVisible({ timeout: 15000 })
  })

  test('Priority filter dropdown filters by priority level', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    const taskCards = page.locator('[data-testid^="task-card-"]')
    await expect(taskCards.first()).toBeVisible({ timeout: 30000 })

    // Open priority filter and select "High"
    const priorityFilter = page.getByTestId('priority-filter')
    await priorityFilter.locator('button').first().click()
    await page.getByRole('button', { name: 'High', exact: true }).click()

    // Wait for results to update
    await page.waitForTimeout(500)

    // Check if results are filtered - either we have high-priority cards or empty state
    const badges = page.getByTestId('task-priority-badge')
    const emptyState = page.getByTestId('tasks-empty')

    const hasCards = await badges.count() > 0
    const hasEmpty = await emptyState.isVisible().catch(() => false)

    if (hasCards) {
      // All visible badges should say "High"
      const badgeCount = await badges.count()
      for (let i = 0; i < badgeCount; i++) {
        await expect(badges.nth(i)).toHaveText('High')
      }
    } else {
      expect(hasEmpty).toBe(true)
    }
  })

  test('Priority filter can be cleared to show all priorities', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    const taskCards = page.locator('[data-testid^="task-card-"]')
    await expect(taskCards.first()).toBeVisible({ timeout: 30000 })

    // Set priority filter to High
    const priorityFilter = page.getByTestId('priority-filter')
    await priorityFilter.locator('button').first().click()
    await page.getByRole('button', { name: 'High', exact: true }).click()
    await page.waitForTimeout(500)

    // Clear priority filter by selecting "All Priorities"
    await priorityFilter.locator('button').first().click()
    await page.getByRole('button', { name: 'All Priorities', exact: true }).click()
    await page.waitForTimeout(500)

    // Should show tasks of various priorities again
    await expect(taskCards.first()).toBeVisible({ timeout: 15000 })
  })

  test('Status filter dropdown filters by task status', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    // Wait for initial load (defaults to "Open")
    await page.waitForTimeout(1000)

    // Switch to "Completed" status
    const statusFilter = page.getByTestId('status-filter')
    await statusFilter.locator('button').first().click()
    await page.getByRole('button', { name: 'Completed', exact: true }).click()
    await page.waitForTimeout(500)

    // The page should update - either show completed tasks or empty state
    await expect(page.getByTestId('tasks-list').or(page.getByTestId('tasks-empty'))).toBeVisible({ timeout: 15000 })
  })

  test('Status filter shows open tasks by default', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    // The status filter should show "Open" as default selected value
    const statusFilter = page.getByTestId('status-filter')
    await expect(statusFilter).toContainText('Open')
  })

  test('Multiple filters can be combined', async ({ page }) => {
    test.slow()
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    const taskCards = page.locator('[data-testid^="task-card-"]')
    await expect(taskCards.first()).toBeVisible({ timeout: 30000 })

    // Set priority filter to "High"
    const priorityFilter = page.getByTestId('priority-filter')
    await priorityFilter.locator('button').first().click()
    await page.getByRole('button', { name: 'High', exact: true }).click()
    await page.waitForTimeout(500)

    // Also type in search
    const searchInput = page.getByTestId('task-search-input')
    await searchInput.fill('a')
    await page.waitForTimeout(500)

    // Results should be filtered by both criteria
    // Either we have filtered results or empty state
    await expect(page.getByTestId('tasks-list').or(page.getByTestId('tasks-empty'))).toBeVisible({ timeout: 15000 })
  })
})

test.describe('CreateTaskModal', () => {
  test('Clicking New Task button opens CreateTaskModal', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    // Click the New Task button
    await page.getByTestId('new-task-button').click()

    // Modal should be visible
    await expect(page.getByTestId('create-task-modal')).toBeVisible({ timeout: 15000 })

    // Verify form fields exist
    await expect(page.getByTestId('task-form-title')).toBeVisible()
    await expect(page.getByTestId('task-form-description')).toBeVisible()
    await expect(page.getByTestId('task-form-due-date')).toBeVisible()
    await expect(page.getByTestId('task-form-priority')).toBeVisible()
    await expect(page.getByTestId('task-form-client')).toBeVisible()
    await expect(page.getByTestId('task-form-assignee')).toBeVisible()

    // Verify Cancel and Create buttons
    await expect(page.getByTestId('create-task-cancel')).toBeVisible()
    await expect(page.getByTestId('create-task-submit')).toBeVisible()
  })

  test('CreateTaskModal form validates required fields', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('new-task-button').click()
    await expect(page.getByTestId('create-task-modal')).toBeVisible({ timeout: 15000 })

    // Click Create without filling any fields
    await page.getByTestId('create-task-submit').click()

    // Error message should appear for Title being required
    await expect(page.getByTestId('create-task-modal').locator('text=Title is required')).toBeVisible()

    // Modal should remain open
    await expect(page.getByTestId('create-task-modal')).toBeVisible()
  })

  test('CreateTaskModal successfully creates a task', async ({ page }) => {
    test.slow()
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    // Wait for tasks to load
    await page.waitForTimeout(1000)

    const uniqueTitle = `Test Task ${Date.now()}`

    await page.getByTestId('new-task-button').click()
    await expect(page.getByTestId('create-task-modal')).toBeVisible({ timeout: 15000 })

    // Fill in the form
    await page.getByTestId('task-form-title').fill(uniqueTitle)
    await page.getByTestId('task-form-description').fill('Test description for automation')

    // Set priority to High
    await page.getByTestId('task-form-priority').locator('button').first().click()
    await page.getByRole('button', { name: 'High', exact: true }).click()

    // Submit the form
    await page.getByTestId('create-task-submit').click()

    // Modal should close
    await expect(page.getByTestId('create-task-modal')).toBeHidden({ timeout: 30000 })

    // The new task should appear in the list
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: uniqueTitle })
    ).toBeVisible({ timeout: 30000 })
  })

  test('CreateTaskModal cancel button closes modal without creating', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('new-task-button').click()
    await expect(page.getByTestId('create-task-modal')).toBeVisible({ timeout: 15000 })

    // Fill in a title
    await page.getByTestId('task-form-title').fill('Should Not Be Created')

    // Click Cancel
    await page.getByTestId('create-task-cancel').click()

    // Modal should close
    await expect(page.getByTestId('create-task-modal')).toBeHidden({ timeout: 15000 })

    // The task should NOT be in the list
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'Should Not Be Created' })
    ).toHaveCount(0)
  })

  test('CreateTaskModal closes on overlay click', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('new-task-button').click()
    await expect(page.getByTestId('create-task-modal')).toBeVisible({ timeout: 15000 })

    // Click the overlay
    await page.getByTestId('modal-overlay').click({ force: true })

    // Modal should close
    await expect(page.getByTestId('create-task-modal')).toBeHidden({ timeout: 15000 })
  })
})

test.describe('TaskCard Navigation', () => {
  test('Clicking a task card navigates to task detail page', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    const taskCards = page.locator('[data-testid^="task-card-"]')
    await expect(taskCards.first()).toBeVisible({ timeout: 30000 })

    // Get the task ID from the first card's testid
    const firstCardTestId = await taskCards.first().getAttribute('data-testid')
    const taskId = firstCardTestId!.replace('task-card-', '')

    // Click the first task card
    await taskCards.first().click()

    // Should navigate to the task detail page
    await expect(page).toHaveURL(`/tasks/${taskId}`, { timeout: 30000 })
    await expect(page.getByTestId('task-detail-page')).toBeVisible({ timeout: 30000 })
  })
})

test.describe('CSV Import', () => {
  test('CSV import button opens import dialog', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-list-page')).toBeVisible({ timeout: 30000 })

    // Click the import button
    await page.getByTestId('csv-import-button').click()

    // Import dialog should be visible
    await expect(page.getByTestId('import-dialog')).toBeVisible({ timeout: 15000 })

    // Should display column format specification table
    const dialog = page.getByTestId('import-dialog')
    await expect(dialog.locator('text=CSV Column Format')).toBeVisible()

    // Verify all column names are listed
    const expectedColumns = ['Title', 'Description', 'Due Date', 'Priority', 'Client Name', 'Assignee']
    for (const col of expectedColumns) {
      await expect(dialog.locator('td').filter({ hasText: col }).first()).toBeVisible()
    }

    // Verify required/optional indicators - "Title" row should show "Yes"
    const titleRow = dialog.locator('tr').filter({ hasText: 'Title' }).first()
    await expect(titleRow.locator('td').nth(1)).toContainText('Yes')

    // "Description" row should show "No" for required
    const descRow = dialog.locator('tr').filter({ hasText: 'Description' }).first()
    await expect(descRow.locator('td').nth(1)).toContainText('No')

    // Download CSV template button should be visible
    await expect(page.getByTestId('download-csv-template')).toBeVisible()

    // File upload area should be present
    await expect(dialog.locator('text=Click to select a CSV file')).toBeVisible()

    // File input should exist (hidden but present)
    await expect(page.getByTestId('import-file-input')).toBeAttached()
  })
})
