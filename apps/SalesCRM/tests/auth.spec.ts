import { test, expect } from './base';

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

    // Clicking sign-in should reveal the email/password auth form
    await page.getByTestId('sidebar-sign-in').click();
    await expect(page.getByTestId('sidebar-auth-form')).toBeVisible();
    await expect(page.getByTestId('auth-email-input')).toBeVisible();
    await expect(page.getByTestId('auth-password-input')).toBeVisible();
    await expect(page.getByTestId('auth-submit-button')).toBeVisible();
    await expect(page.getByTestId('auth-toggle-mode')).toBeVisible();

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

  test('AUTH-E2E-01: Full signup and login flow works end-to-end', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // 1. Open auth form and switch to sign-up mode
    await page.getByTestId('sidebar-sign-in').click();
    await page.getByTestId('auth-toggle-mode').click();
    await expect(page.getByTestId('auth-submit-button')).toContainText('Sign Up');

    // 2. Sign up with a unique email
    const testEmail = `e2e-${Date.now()}@test.com`;
    const testPassword = 'testpass123';
    await page.getByTestId('auth-email-input').fill(testEmail);
    await page.getByTestId('auth-password-input').fill(testPassword);
    await page.getByTestId('auth-submit-button').click();

    // 3. Should be logged in immediately after signup (user name visible)
    await expect(page.getByTestId('sidebar-user-name')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sidebar-user-avatar')).toBeVisible();
    await expect(page.getByTestId('sidebar-sign-out')).toBeVisible();

    // 4. Sign out
    await page.getByTestId('sidebar-sign-out').click();
    await expect(page.getByTestId('sidebar-sign-in')).toBeVisible({ timeout: 5000 });

    // 5. Sign in with the same credentials
    await page.getByTestId('sidebar-sign-in').click();
    await expect(page.getByTestId('auth-submit-button')).toContainText('Sign In');
    await page.getByTestId('auth-email-input').fill(testEmail);
    await page.getByTestId('auth-password-input').fill(testPassword);
    await page.getByTestId('auth-submit-button').click();

    // 6. Should be logged in again
    await expect(page.getByTestId('sidebar-user-name')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sidebar-sign-out')).toBeVisible();

    await context.close();
  });
});
