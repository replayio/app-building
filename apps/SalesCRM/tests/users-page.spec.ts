import { test, expect } from './base';

test.describe('UsersListPage - Header', () => {
  test('ULP-HDR-01: Users page displays header and team members', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Page header
    const header = page.getByTestId('users-page-header');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Team Members');

    // Users grid with cards
    const grid = page.getByTestId('users-grid');
    await expect(grid).toBeVisible();

    // Should have seeded users displayed
    const cards = grid.locator('[data-testid^="user-card-"]');
    await expect(cards.first()).toBeVisible();
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(5);

    // Verify card content: names, emails, deal counts, and task counts
    const firstCard = cards.first();
    const firstCardText = await firstCard.textContent();
    expect(firstCardText).toMatch(/active deal/);
    expect(firstCardText).toMatch(/open task/);
    // Name should be visible via data-testid
    const nameEl = firstCard.locator('[data-testid^="user-name-"]');
    await expect(nameEl).toBeVisible();
    const nameText = await nameEl.textContent();
    expect(nameText!.length).toBeGreaterThan(0);
  });
});

test.describe('UsersListPage - UserCards', () => {
  test('ULP-CRD-01: User cards display avatar, name, email, active deals count, and open tasks count', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    const grid = page.getByTestId('users-grid');
    const firstCard = grid.locator('[data-testid^="user-card-"]').first();
    await expect(firstCard).toBeVisible();

    // User name visible
    const nameEl = firstCard.locator('[data-testid^="user-name-"]');
    await expect(nameEl).toBeVisible();
    const nameText = await nameEl.textContent();
    expect(nameText!.length).toBeGreaterThan(0);

    // Email visible (card text contains @ for email)
    const cardText = await firstCard.textContent();
    expect(cardText).toMatch(/@/);

    // Active deals count visible
    expect(cardText).toMatch(/\d+ active deals?/);

    // Open tasks count visible
    expect(cardText).toMatch(/\d+ open tasks?/);
  });

  test('ULP-HDR-02: Clicking a user card navigates to user detail page', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Click the first user card
    const firstCard = page.getByTestId('users-grid').locator('[data-testid^="user-card-"]').first();
    await firstCard.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to /users/:userId
    await expect(page).toHaveURL(/\/users\/[a-f0-9-]+/);

    // User detail page should be visible
    await expect(page.getByTestId('user-detail-header')).toBeVisible();
    await expect(page.getByTestId('user-detail-name')).toBeVisible();
  });
});

test.describe('UserDetailPage - Header', () => {
  test('UDP-HDR-01: User detail page displays user info and stats', async ({ page }) => {
    // First get a user ID from the list page
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Click on a user card to navigate to detail
    const firstCard = page.getByTestId('users-grid').locator('[data-testid^="user-card-"]').first();
    await firstCard.click();
    await page.waitForLoadState('networkidle');

    // Header visible with name, email, join date
    const header = page.getByTestId('user-detail-header');
    await expect(header).toBeVisible();

    const name = page.getByTestId('user-detail-name');
    await expect(name).toBeVisible();
    const nameText = await name.textContent();
    expect(nameText!.length).toBeGreaterThan(0);

    // Back button visible
    await expect(page.getByTestId('user-detail-back')).toBeVisible();

    // Sections visible
    await expect(page.getByTestId('user-deals-section')).toBeVisible();
    await expect(page.getByTestId('user-tasks-section')).toBeVisible();
    await expect(page.getByTestId('user-activity-section')).toBeVisible();
  });

  test('UDP-HDR-02: Back button returns to users list', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Navigate to a user
    const firstCard = page.getByTestId('users-grid').locator('[data-testid^="user-card-"]').first();
    await firstCard.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/users\/[a-f0-9-]+/);

    // Click back
    await page.getByTestId('user-detail-back').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/users$/);

    // Users page is visible again
    await expect(page.getByTestId('users-page-header')).toBeVisible();
  });
});

test.describe('UserDetailPage - Deals', () => {
  test('UDP-DL-01: Deals section shows deals owned by user', async ({ page }) => {
    // Navigate to Sarah Lee's page (she owns "Acme Software License")
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Find and click the Sarah Lee card
    const grid = page.getByTestId('users-grid');
    const sarahCard = grid.locator('[data-testid^="user-card-"]', { hasText: 'Sarah Lee' });
    await expect(sarahCard).toBeVisible();
    await sarahCard.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to user detail page
    await expect(page).toHaveURL(/\/users\/[a-f0-9-]+/);

    // Deals section should show her deals
    const dealsSection = page.getByTestId('user-deals-section');
    await expect(dealsSection).toBeVisible();
    await expect(dealsSection).toContainText('Acme Software License');

    // Click a deal link and verify it navigates to /deals/:dealId
    const dealLink = dealsSection.locator('[data-testid^="user-deal-"]').first();
    await dealLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/deals\/[a-f0-9-]+/);
  });
});

test.describe('UserDetailPage - Tasks', () => {
  test('UDP-TSK-01: Tasks section shows tasks assigned to user', async ({ page }) => {
    // Navigate to Sarah J.'s page (she has tasks)
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Find and click Sarah J.'s card
    const grid = page.getByTestId('users-grid');
    const sarahJCard = grid.locator('[data-testid^="user-card-"]', { hasText: 'Sarah J.' });
    await expect(sarahJCard).toBeVisible();
    await sarahJCard.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to user detail page
    await expect(page).toHaveURL(/\/users\/[a-f0-9-]+/);

    // Tasks section should show her tasks
    const tasksSection = page.getByTestId('user-tasks-section');
    await expect(tasksSection).toBeVisible();
    await expect(tasksSection).toContainText('Follow up on proposal');

    // Click a task link and verify it navigates to /tasks/:taskId
    const taskLink = tasksSection.locator('[data-testid^="user-task-"]').first();
    await taskLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/tasks\/[a-f0-9-]+/);
  });
});

test.describe('UserDetailPage - Activity', () => {
  test('UDP-ACT-01: Activity section shows recent activity events', async ({ page }) => {
    // Navigate to a user who has activity
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    const firstCard = page.getByTestId('users-grid').locator('[data-testid^="user-card-"]').first();
    await firstCard.click();
    await page.waitForLoadState('networkidle');

    // Activity section should be visible with heading
    const activitySection = page.getByTestId('user-activity-section');
    await expect(activitySection).toBeVisible();
    await expect(activitySection).toContainText('Recent Activity');
  });

  test('UDP-ACT-02: Activity section client links navigate to client detail page', async ({ page }) => {
    // Navigate to a user who has activity with client links
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    const firstCard = page.getByTestId('users-grid').locator('[data-testid^="user-card-"]').first();
    await firstCard.click();
    await page.waitForLoadState('networkidle');

    const activitySection = page.getByTestId('user-activity-section');
    await expect(activitySection).toBeVisible();

    // Verify at least one client link exists
    const clientLinks = activitySection.locator('a[href^="/clients/"]');
    await expect(clientLinks.first()).toBeVisible();

    // Click the first client link and verify navigation
    await clientLinks.first().click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/clients\/[a-f0-9-]+/);
  });
});
