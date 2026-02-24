import { test, expect } from '@playwright/test'

test.describe('TasksFilter', () => {
  // Create diverse test tasks before all tests in this file
  test.beforeAll(async ({ request }) => {
    // Get available clients and assignees
    const res = await request.get('/.netlify/functions/tasks')
    const data = await res.json()
    const acmeClient = data.clients.find((c: { name: string }) => c.name === 'Acme Corp')
    const globexClient = data.clients.find((c: { name: string }) => c.name === 'Globex Solutions')

    // Create tasks with different priorities and assignees for filter testing
    const filterTasks = [
      {
        title: 'FilterTest-HighPriority-Marketing',
        priority: 'High',
        assignee: 'Sarah Jenkins',
        assignee_role: 'CEO',
        client_id: acmeClient?.id,
      },
      {
        title: 'FilterTest-MediumPriority-Sales',
        priority: 'Medium',
        assignee: 'Michael Chen',
        assignee_role: 'CTO',
        client_id: globexClient?.id,
      },
      {
        title: 'FilterTest-LowPriority-Review',
        priority: 'Low',
        assignee: 'Sarah Jenkins',
        assignee_role: 'CEO',
        client_id: acmeClient?.id,
      },
    ]

    for (const task of filterTasks) {
      await request.post('/.netlify/functions/tasks', { data: task })
    }
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByTestId('tasks-filter')).toBeVisible()
    await expect(
      page.getByTestId('tasks-list')
        .or(page.getByTestId('tasks-list-empty'))
    ).toBeVisible()
  })

  test('Filter type dropdown is displayed with filter icon', async ({ page }) => {
    const dropdown = page.getByTestId('tasks-filter-type-dropdown')
    await expect(dropdown).toBeVisible()

    // Has filter icon (SVG) and chevron
    const trigger = page.getByTestId('tasks-filter-type-dropdown-trigger')
    await expect(trigger).toBeVisible()
    await expect(trigger.locator('svg').first()).toBeVisible()
  })

  test('Filter type dropdown shows filter category options', async ({ page }) => {
    await page.getByTestId('tasks-filter-type-dropdown-trigger').click()
    const menu = page.getByTestId('tasks-filter-type-dropdown-menu')
    await expect(menu).toBeVisible()

    // Verify all filter categories
    await expect(page.getByTestId('tasks-filter-type-option-all')).toContainText('All Fields')
    await expect(page.getByTestId('tasks-filter-type-option-priority')).toContainText('Priority')
    await expect(page.getByTestId('tasks-filter-type-option-assignee')).toContainText('Assignee')
    await expect(page.getByTestId('tasks-filter-type-option-client')).toContainText('Client')
    await expect(page.getByTestId('tasks-filter-type-option-due_date')).toContainText('Due Date')
  })

  test('Text filter input is displayed with placeholder', async ({ page }) => {
    const input = page.getByTestId('tasks-filter-input')
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute('placeholder', 'Filter...')
  })

  test('Text filter filters tasks by task name', async ({ page }) => {
    const input = page.getByTestId('tasks-filter-input')
    await input.fill('FilterTest-HighPriority-Marketing')

    // Matching task should be visible
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-HighPriority-Marketing' })
    ).toBeVisible({ timeout: 10000 })

    // Non-matching task should not be visible
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-MediumPriority-Sales' })
    ).toHaveCount(0, { timeout: 10000 })
  })

  test('Filter by Priority category', async ({ page }) => {
    // Select Priority from filter type dropdown
    await page.getByTestId('tasks-filter-type-dropdown-trigger').click()
    await page.getByTestId('tasks-filter-type-option-priority').click()

    // Type "High" into the filter
    await page.getByTestId('tasks-filter-input').fill('High')

    // Only High priority tasks should be shown
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-HighPriority-Marketing' })
    ).toBeVisible({ timeout: 10000 })

    // Medium and Low priority tasks should be hidden
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-MediumPriority-Sales' })
    ).toHaveCount(0, { timeout: 10000 })

    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-LowPriority-Review' })
    ).toHaveCount(0, { timeout: 10000 })
  })

  test('Filter by Assignee category', async ({ page }) => {
    // Select Assignee from filter type dropdown
    await page.getByTestId('tasks-filter-type-dropdown-trigger').click()
    await page.getByTestId('tasks-filter-type-option-assignee').click()

    // Type "Sarah" into the filter
    await page.getByTestId('tasks-filter-input').fill('Sarah')

    // Tasks assigned to Sarah Jenkins should be shown
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-HighPriority-Marketing' })
    ).toBeVisible({ timeout: 10000 })

    // Tasks assigned to Michael Chen should be hidden
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-MediumPriority-Sales' })
    ).toHaveCount(0, { timeout: 10000 })
  })

  test('Filter by Client category', async ({ page }) => {
    // Select Client from filter type dropdown
    await page.getByTestId('tasks-filter-type-dropdown-trigger').click()
    await page.getByTestId('tasks-filter-type-option-client').click()

    // Type "Acme" into the filter
    await page.getByTestId('tasks-filter-input').fill('Acme')

    // Tasks associated with Acme Corp should be shown
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-HighPriority-Marketing' })
    ).toBeVisible({ timeout: 10000 })

    // Tasks associated with Globex Solutions should be hidden
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-MediumPriority-Sales' })
    ).toHaveCount(0, { timeout: 10000 })
  })

  test('Text filter shows empty state when no results match', async ({ page }) => {
    await page.getByTestId('tasks-filter-input').fill('zzzznonexistent')

    // Empty state message should appear
    await expect(page.getByTestId('tasks-list-no-results')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('tasks-list-no-results')).toContainText('No tasks found')
  })

  test('Clearing the text filter resets results', async ({ page }) => {
    const input = page.getByTestId('tasks-filter-input')

    // Filter to show only specific task
    await input.fill('FilterTest-HighPriority-Marketing')
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-HighPriority-Marketing' })
    ).toBeVisible({ timeout: 10000 })

    // Clear the filter using the clear button
    await page.getByTestId('tasks-filter-clear').click()

    // All tasks should be shown again - verify multiple tasks visible
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-HighPriority-Marketing' })
    ).toBeVisible({ timeout: 10000 })
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-MediumPriority-Sales' })
    ).toBeVisible({ timeout: 10000 })
  })

  test('Changing filter type resets the text filter', async ({ page }) => {
    // Select Priority and type "High"
    await page.getByTestId('tasks-filter-type-dropdown-trigger').click()
    await page.getByTestId('tasks-filter-type-option-priority').click()
    await page.getByTestId('tasks-filter-input').fill('High')

    // Verify filter is applied
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-MediumPriority-Sales' })
    ).toHaveCount(0, { timeout: 10000 })

    // Change filter type to Assignee
    await page.getByTestId('tasks-filter-type-dropdown-trigger').click()
    await page.getByTestId('tasks-filter-type-option-assignee').click()

    // Text filter should be cleared
    await expect(page.getByTestId('tasks-filter-input')).toHaveValue('')

    // All tasks should be shown again
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: 'FilterTest-MediumPriority-Sales' })
    ).toBeVisible({ timeout: 10000 })
  })
})
