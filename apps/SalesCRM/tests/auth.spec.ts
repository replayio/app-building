import { test, expect } from './base';

// ============================================================
// Authentication Tests (AUTH-USR)
// ============================================================

test.describe('SidebarUserArea', () => {
  test('AUTH-USR-01: Sidebar displays authenticated user info in upper left', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('sidebar-user-area')).toBeVisible();
    await expect(page.getByTestId('sidebar-user-avatar')).toBeVisible();
    await expect(page.getByTestId('sidebar-user-name')).toBeVisible();
    await expect(page.getByTestId('sidebar-user-name')).not.toBeEmpty();
    await expect(page.getByTestId('sidebar-sign-out')).toBeVisible();
  });

  test('AUTH-USR-02: Sidebar displays sign-in button when not logged in', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('sidebar-user-area')).toBeVisible();
    await expect(page.getByTestId('sidebar-sign-in')).toBeVisible();

    await page.getByTestId('sidebar-sign-in').click();
    await expect(page.getByTestId('sidebar-auth-form')).toBeVisible();
    await expect(page.getByTestId('auth-email-input')).toBeVisible();
    await expect(page.getByTestId('auth-password-input')).toBeVisible();
    await expect(page.getByTestId('auth-submit-button')).toBeVisible();
    await expect(page.getByTestId('auth-forgot-password')).toBeVisible();
    await expect(page.getByTestId('auth-toggle-mode')).toBeVisible();

    await expect(page.getByTestId('sidebar-user-name')).not.toBeVisible();
    await expect(page.getByTestId('sidebar-user-avatar')).not.toBeVisible();

    await context.close();
  });

  test('AUTH-USR-03: App loads without authentication', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('sidebar')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-clients')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-deals')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-tasks')).toBeVisible();

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

    // 2. Sign up with a unique email (auto-confirmed in test mode)
    const testEmail = `e2e-${Date.now()}@test.com`;
    const testPassword = 'testpass123';
    await page.getByTestId('auth-email-input').fill(testEmail);
    await page.getByTestId('auth-password-input').fill(testPassword);
    await page.getByTestId('auth-submit-button').click();

    // 3. Should be logged in immediately after signup
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

// ============================================================
// Forgot Password Tests (AUTH-FP)
// ============================================================

test.describe('ForgotPasswordPage', () => {
  test('AUTH-FP-01: Forgot password link navigates to forgot password page', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Open sign-in form
    await page.getByTestId('sidebar-sign-in').click();
    await expect(page.getByTestId('sidebar-auth-form')).toBeVisible();

    // Click forgot password link
    await page.getByTestId('auth-forgot-password').click();

    // Should navigate to forgot password page
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
    await expect(page.getByTestId('forgot-password-page')).toBeVisible();
    await expect(page.getByTestId('forgot-password-form')).toBeVisible();
    await expect(page.getByTestId('forgot-password-email')).toBeVisible();
    await expect(page.getByTestId('forgot-password-submit')).toBeVisible();
    await expect(page.getByTestId('forgot-password-back-to-signin')).toBeVisible();

    await context.close();
  });

  test('AUTH-FP-02: Forgot password form submits and shows success message', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/auth/forgot-password');
    await page.waitForLoadState('networkidle');

    // Enter email and submit
    await page.getByTestId('forgot-password-email').fill('test@example.com');
    await page.getByTestId('forgot-password-submit').click();

    // Should show success message
    await expect(page.getByTestId('forgot-password-success')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('forgot-password-back')).toBeVisible();

    await context.close();
  });
});

// ============================================================
// Reset Password Tests (AUTH-RP)
// ============================================================

test.describe('ResetPasswordPage', () => {
  test('AUTH-RP-01: Reset password page shows form with valid token', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/auth/reset-password?token=sometoken');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('reset-password-page')).toBeVisible();
    await expect(page.getByTestId('reset-password-form')).toBeVisible();
    await expect(page.getByTestId('reset-password-input')).toBeVisible();
    await expect(page.getByTestId('reset-password-confirm-input')).toBeVisible();
    await expect(page.getByTestId('reset-password-submit')).toBeVisible();

    await context.close();
  });

  test('AUTH-RP-02: Reset password page shows error without token', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/auth/reset-password');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('reset-password-page')).toBeVisible();
    await expect(page.getByTestId('reset-password-error')).toBeVisible();

    await context.close();
  });
});

// ============================================================
// Confirm Email Tests (AUTH-CE)
// ============================================================

test.describe('ConfirmEmailPage', () => {
  test('AUTH-CE-01: Confirm email page shows error without token', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/auth/confirm-email');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('confirm-email-page')).toBeVisible();
    await expect(page.getByTestId('confirm-email-error')).toBeVisible();

    await context.close();
  });
});
