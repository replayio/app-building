import { test, expect } from '@playwright/test';

// ============================================================
// Authentication Tests (AUTH-LGN, AUTH-REG, AUTH-USR)
// ============================================================

// Login and Register pages are public routes that should be accessible
// even without authentication. We use a fresh browser context (no storageState)
// to test these pages as an unauthenticated user.

test.describe('LoginPage', () => {
  test('AUTH-LGN-01: Login page displays all form elements', async ({ browser }) => {
    // Create a fresh context without storageState to simulate unauthenticated user
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Email input
    await expect(page.getByTestId('login-email-input')).toBeVisible();

    // Password input
    await expect(page.getByTestId('login-password-input')).toBeVisible();

    // Sign in submit button
    await expect(page.getByTestId('login-submit-button')).toBeVisible();

    // Google OAuth button
    await expect(page.getByTestId('login-google-button')).toBeVisible();

    // Link to register page
    await expect(page.getByTestId('login-register-link')).toBeVisible();

    await context.close();
  });

  test('AUTH-LGN-02: Login page has link to register page', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Click the register link
    await page.getByTestId('login-register-link').click();
    await page.waitForLoadState('networkidle');

    // Should navigate to /register
    await expect(page).toHaveURL(/\/register$/);

    await context.close();
  });
});

test.describe('RegisterPage', () => {
  test('AUTH-REG-01: Register page displays all form elements', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Full name input
    await expect(page.getByTestId('register-name-input')).toBeVisible();

    // Email input
    await expect(page.getByTestId('register-email-input')).toBeVisible();

    // Password input
    await expect(page.getByTestId('register-password-input')).toBeVisible();

    // Sign up submit button
    await expect(page.getByTestId('register-submit-button')).toBeVisible();

    // Google OAuth button
    await expect(page.getByTestId('register-google-button')).toBeVisible();

    // Link to login page
    await expect(page.getByTestId('register-login-link')).toBeVisible();

    await context.close();
  });

  test('AUTH-REG-02: Register page has link to login page', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Click the login link
    await page.getByTestId('register-login-link').click();
    await page.waitForLoadState('networkidle');

    // Should navigate to /login
    await expect(page).toHaveURL(/\/login$/);

    await context.close();
  });
});

test.describe('SidebarUserInfo', () => {
  test('AUTH-USR-01: Sidebar displays authenticated user info', async ({ page }) => {
    // This test uses the default authenticated context (storageState)
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Sidebar should show user avatar (or initial)
    await expect(page.getByTestId('sidebar-user-avatar')).toBeVisible();

    // Sidebar should show user name
    await expect(page.getByTestId('sidebar-user-name')).toBeVisible();
    await expect(page.getByTestId('sidebar-user-name')).not.toBeEmpty();

    // Sign out button should be visible
    await expect(page.getByTestId('sidebar-sign-out')).toBeVisible();
  });
});
