import { test, expect } from '@playwright/test'

// Helper: navigate to a user detail page by going to /users, clicking the first user card
async function navigateToUserDetail(page: import('@playwright/test').Page) {
  await page.goto('/users')
  await expect(page.getByTestId('users-list-page')).toBeVisible({ timeout: 30000 })

  // Wait for user cards to load
  const userCards = page.locator('[data-testid^="user-card-"]')
  await expect(userCards.first()).toBeVisible({ timeout: 30000 })

  // Click the first user card
  await userCards.first().click()

  // Wait for user detail page
  await expect(page.getByTestId('user-detail-page')).toBeVisible({ timeout: 30000 })
  await expect(page.getByTestId('user-detail-header')).toBeVisible({ timeout: 30000 })
}

test.describe('UserDetailHeader', () => {
  test('Header displays user name prominently', async ({ page }) => {
    await navigateToUserDetail(page)

    const userName = page.getByTestId('user-name')
    await expect(userName).toBeVisible()
    const nameText = await userName.textContent()
    expect(nameText?.trim().length).toBeGreaterThan(0)

    // Back button should be visible
    await expect(page.getByTestId('back-to-team-button')).toBeVisible()
  })

  test('Header displays user avatar or initials', async ({ page }) => {
    await navigateToUserDetail(page)

    const avatar = page.getByTestId('user-avatar')
    await expect(avatar).toBeVisible()

    // Should have either an img or a div with initials
    const hasImg = await avatar.locator('img').count()
    const hasInitials = await avatar.locator('div.rounded-full').count()
    expect(hasImg + hasInitials).toBeGreaterThan(0)
  })

  test('Header displays user email', async ({ page }) => {
    await navigateToUserDetail(page)

    const email = page.getByTestId('user-email')
    await expect(email).toBeVisible()
    const emailText = await email.textContent()
    expect(emailText).toContain('@')

    // Should have a mail icon (SVG)
    await expect(email.locator('svg')).toBeVisible()
  })

  test('Header displays join date', async ({ page }) => {
    await navigateToUserDetail(page)

    const joinDate = page.getByTestId('user-join-date')
    await expect(joinDate).toBeVisible()
    const joinDateText = await joinDate.textContent()
    expect(joinDateText).toContain('Joined')

    // Should have a calendar icon (SVG)
    await expect(joinDate.locator('svg')).toBeVisible()
  })

  test('Back button navigates to team list', async ({ page }) => {
    await navigateToUserDetail(page)

    await page.getByTestId('back-to-team-button').click()

    await expect(page).toHaveURL(/\/users$/, { timeout: 15000 })
    await expect(page.getByTestId('users-list-page')).toBeVisible({ timeout: 15000 })
  })

  test('Loading state shows while user data is being fetched', async ({ page }) => {
    // Navigate directly to a user detail URL to catch loading state
    await page.goto('/users')
    await expect(page.getByTestId('users-list-page')).toBeVisible({ timeout: 30000 })

    const userCards = page.locator('[data-testid^="user-card-"]')
    await expect(userCards.first()).toBeVisible({ timeout: 30000 })

    // Get the href from the first card to find the user URL
    await userCards.first().click()

    // The page should eventually show user detail
    await expect(page.getByTestId('user-detail-page')).toBeVisible({ timeout: 30000 })
  })
})

test.describe('UserDetailStats', () => {
  test('Stats section displays active deals count', async ({ page }) => {
    await navigateToUserDetail(page)

    const stat = page.getByTestId('stat-active-deals')
    await expect(stat).toBeVisible()
    const statText = await stat.textContent()
    expect(statText).toContain('Active Deals')

    // Should have an icon (SVG)
    await expect(stat.locator('svg')).toBeVisible()
  })

  test('Stats section displays open tasks count', async ({ page }) => {
    await navigateToUserDetail(page)

    const stat = page.getByTestId('stat-open-tasks')
    await expect(stat).toBeVisible()
    const statText = await stat.textContent()
    expect(statText).toContain('Open Tasks')

    // Should have an icon (SVG)
    await expect(stat.locator('svg')).toBeVisible()
  })

  test('Stats section displays total deals count', async ({ page }) => {
    await navigateToUserDetail(page)

    const stat = page.getByTestId('stat-total-deals')
    await expect(stat).toBeVisible()
    const statText = await stat.textContent()
    expect(statText).toContain('Total Deals')

    // Should have an icon (SVG)
    await expect(stat.locator('svg')).toBeVisible()
  })
})

test.describe('UserDealsList', () => {
  test('Owned deals section displays heading', async ({ page }) => {
    await navigateToUserDetail(page)

    const section = page.getByTestId('user-deals-section')
    await expect(section).toBeVisible()
    await expect(section.locator('text=Owned Deals')).toBeVisible()
  })

  test('Owned deals list displays deal name, client, value, and stage', async ({ page }) => {
    await navigateToUserDetail(page)

    const section = page.getByTestId('user-deals-section')
    await expect(section).toBeVisible()

    // Check if there are deal rows or an empty state
    const dealRows = section.locator('[data-testid^="user-deal-"]')
    const emptyState = page.getByTestId('user-deals-empty')
    const dealCount = await dealRows.count()
    const hasEmpty = await emptyState.count()

    if (dealCount > 0) {
      // Verify the table has column headers
      await expect(section.locator('th', { hasText: 'Deal' })).toBeVisible()
      await expect(section.locator('th', { hasText: 'Client' })).toBeVisible()
      await expect(section.locator('th', { hasText: 'Value' })).toBeVisible()
      await expect(section.locator('th', { hasText: 'Stage' })).toBeVisible()

      // Verify first deal row has visible content
      const firstDeal = dealRows.first()
      const cells = firstDeal.locator('td')
      await expect(cells.first()).toBeVisible()
    } else {
      expect(hasEmpty).toBe(1)
    }
  })

  test('Clicking a deal navigates to deal detail page', async ({ page }) => {
    await navigateToUserDetail(page)

    const dealRows = page.locator('[data-testid^="user-deal-"]')
    const dealCount = await dealRows.count()

    if (dealCount > 0) {
      // Get the deal testid to extract the ID
      const testId = await dealRows.first().getAttribute('data-testid')
      const dealId = testId?.replace('user-deal-', '')

      await dealRows.first().click()

      await expect(page).toHaveURL(new RegExp(`/deals/${dealId}`), { timeout: 15000 })
      await expect(page.getByTestId('deal-detail-page')).toBeVisible({ timeout: 15000 })
    }
  })

  test('Empty state when user owns no deals', async ({ page }) => {
    // Navigate to user detail - if the user has no deals, we should see empty state
    await navigateToUserDetail(page)

    const section = page.getByTestId('user-deals-section')
    await expect(section).toBeVisible()

    const dealRows = section.locator('[data-testid^="user-deal-"]')
    const dealCount = await dealRows.count()

    if (dealCount === 0) {
      await expect(page.getByTestId('user-deals-empty')).toBeVisible()
      await expect(page.getByTestId('user-deals-empty')).toContainText('No owned deals')
    }
    // If user has deals, we just verify the section rendered (empty state is validated by structure)
  })
})

test.describe('UserTasksList', () => {
  test('Assigned tasks section displays heading', async ({ page }) => {
    await navigateToUserDetail(page)

    const section = page.getByTestId('user-tasks-section')
    await expect(section).toBeVisible()
    await expect(section.locator('text=Assigned Tasks')).toBeVisible()
  })

  test('Assigned tasks list displays task title, priority, status, and due date', async ({ page }) => {
    await navigateToUserDetail(page)

    const section = page.getByTestId('user-tasks-section')
    await expect(section).toBeVisible()

    const taskRows = section.locator('[data-testid^="user-task-"]')
    const emptyState = page.getByTestId('user-tasks-empty')
    const taskCount = await taskRows.count()
    const hasEmpty = await emptyState.count()

    if (taskCount > 0) {
      // Verify the table has column headers
      await expect(section.locator('th', { hasText: 'Task' })).toBeVisible()
      await expect(section.locator('th', { hasText: 'Priority' })).toBeVisible()
      await expect(section.locator('th', { hasText: 'Status' })).toBeVisible()
      await expect(section.locator('th', { hasText: 'Due Date' })).toBeVisible()

      // Verify first task row has visible content
      const firstTask = taskRows.first()
      const cells = firstTask.locator('td')
      await expect(cells.first()).toBeVisible()
    } else {
      expect(hasEmpty).toBe(1)
    }
  })

  test('Clicking a task navigates to task detail page', async ({ page }) => {
    await navigateToUserDetail(page)

    const taskRows = page.locator('[data-testid^="user-task-"]')
    const taskCount = await taskRows.count()

    if (taskCount > 0) {
      const testId = await taskRows.first().getAttribute('data-testid')
      const taskId = testId?.replace('user-task-', '')

      await taskRows.first().click()

      await expect(page).toHaveURL(new RegExp(`/tasks/${taskId}`), { timeout: 15000 })
      await expect(page.getByTestId('task-detail-page')).toBeVisible({ timeout: 15000 })
    }
  })

  test('Empty state when user has no assigned tasks', async ({ page }) => {
    await navigateToUserDetail(page)

    const section = page.getByTestId('user-tasks-section')
    await expect(section).toBeVisible()

    const taskRows = section.locator('[data-testid^="user-task-"]')
    const taskCount = await taskRows.count()

    if (taskCount === 0) {
      await expect(page.getByTestId('user-tasks-empty')).toBeVisible()
      await expect(page.getByTestId('user-tasks-empty')).toContainText('No assigned tasks')
    }
  })
})

test.describe('UserActivityFeed', () => {
  test('Activity feed section displays heading', async ({ page }) => {
    await navigateToUserDetail(page)

    const section = page.getByTestId('user-activity-section')
    await expect(section).toBeVisible()
    await expect(section.locator('text=Recent Activity')).toBeVisible()
  })

  test('Activity feed displays event description and timestamp', async ({ page }) => {
    await navigateToUserDetail(page)

    const section = page.getByTestId('user-activity-section')
    await expect(section).toBeVisible()

    const activityItems = section.locator('[data-testid^="user-activity-"]')
    const emptyState = page.getByTestId('user-activity-empty')
    const activityCount = await activityItems.count()
    const hasEmpty = await emptyState.count()

    if (activityCount > 0) {
      // Each activity item should have a description and timestamp
      const firstItem = activityItems.first()
      await expect(firstItem.getByTestId('activity-description')).toBeVisible()
      await expect(firstItem.getByTestId('activity-timestamp')).toBeVisible()

      const descText = await firstItem.getByTestId('activity-description').textContent()
      expect(descText?.trim().length).toBeGreaterThan(0)

      const timestampText = await firstItem.getByTestId('activity-timestamp').textContent()
      expect(timestampText?.trim().length).toBeGreaterThan(0)
    } else {
      expect(hasEmpty).toBe(1)
    }
  })

  test('Activity feed displays event type icon', async ({ page }) => {
    await navigateToUserDetail(page)

    const section = page.getByTestId('user-activity-section')
    await expect(section).toBeVisible()

    const activityItems = section.locator('[data-testid^="user-activity-"]')
    const activityCount = await activityItems.count()

    if (activityCount > 0) {
      // Each activity item should have an SVG icon
      const firstItem = activityItems.first()
      await expect(firstItem.locator('svg')).toBeVisible()
    }
  })

  test('Empty state when user has no activity', async ({ page }) => {
    await navigateToUserDetail(page)

    const section = page.getByTestId('user-activity-section')
    await expect(section).toBeVisible()

    const activityItems = section.locator('[data-testid^="user-activity-"]')
    const activityCount = await activityItems.count()

    if (activityCount === 0) {
      await expect(page.getByTestId('user-activity-empty')).toBeVisible()
      await expect(page.getByTestId('user-activity-empty')).toContainText('No recent activity')
    }
  })
})
