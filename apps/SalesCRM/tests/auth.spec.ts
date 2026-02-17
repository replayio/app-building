import { test, expect } from '@playwright/test';

// ============================================================
// Authentication Tests (AUTH-USR)
// ============================================================

test.describe('SidebarUserArea', () => {
  test('AUTH-USR-01: Sidebar displays authenticated user info in upper left', async ({ page }) => {
    // This test uses the default authenticated context (storageState)
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // User area should be visible
    await expect(page.getByTestId('sidebar-user-area')).toBeVisible();

    // Sidebar should show user avatar (or initial)
    await expect(page.getByTestId('sidebar-user-avatar')).toBeVisible();

    // Sidebar should show user name
    await expect(page.getByTestId('sidebar-user-name')).toBeVisible();
    await expect(page.getByTestId('sidebar-user-name')).not.toBeEmpty();

    // Sign out button should be visible
    await expect(page.getByTestId('sidebar-sign-out')).toBeVisible();
  });

  test('AUTH-USR-02: Sidebar displays sign-in button when not logged in', async ({ browser }) => {
    // Create a fresh context with empty storageState to simulate unauthenticated user
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // User area should be visible
    await expect(page.getByTestId('sidebar-user-area')).toBeVisible();

    // Sign-in button should be visible
    await expect(page.getByTestId('sidebar-sign-in')).toBeVisible();

    // User name and avatar should NOT be visible
    await expect(page.getByTestId('sidebar-user-name')).not.toBeVisible();
    await expect(page.getByTestId('sidebar-user-avatar')).not.toBeVisible();

    await context.close();
  });

  test('AUTH-USR-03: App loads without authentication', async ({ browser }) => {
    // Create a fresh context with empty storageState to simulate unauthenticated user
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Page should load and show the sidebar with navigation
    await expect(page.getByTestId('sidebar')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-clients')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-deals')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-tasks')).toBeVisible();

    // Sign-in button should be visible (not redirected to login page)
    await expect(page.getByTestId('sidebar-sign-in')).toBeVisible();

    await context.close();
  });
});
