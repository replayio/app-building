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
  });
});
