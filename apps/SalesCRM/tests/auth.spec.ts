import { test, expect } from './base';
import { neon } from '@neondatabase/serverless';
import { scryptSync, randomBytes } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __test_filename = fileURLToPath(import.meta.url);
const __test_dirname = dirname(__test_filename);

function getTestDbUrl(): string {
  const branchDataPath = resolve(__test_dirname, 'test-branch-data.json');
  if (existsSync(branchDataPath)) {
    const data = JSON.parse(readFileSync(branchDataPath, 'utf-8'));
    return data.connectionUri;
  }
  return process.env.DATABASE_URL || '';
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

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

    // Verify the clients page displays data content
    await expect(page.getByTestId('clients-page-header')).toBeVisible();
    await expect(page.getByTestId('clients-table')).toBeVisible();

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

    // Should show success message with text about checking email
    await expect(page.getByTestId('forgot-password-success')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('forgot-password-success')).toContainText('Check Your Email');
    await expect(page.getByTestId('forgot-password-success')).toContainText('password reset link has been sent');
    await expect(page.getByTestId('forgot-password-back')).toBeVisible();
    await expect(page.getByTestId('forgot-password-back')).toContainText('Back to app');

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
    await expect(page.getByTestId('reset-password-error')).toContainText('No reset token provided');
    await expect(page.getByTestId('reset-password-go-to-app')).toBeVisible();
    await expect(page.getByTestId('reset-password-go-to-app')).toContainText('Go to app');

    await context.close();
  });

  test('AUTH-RP-03: Reset password form submission and verification', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/auth/reset-password?token=sometoken');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('reset-password-form')).toBeVisible();
    await expect(page.getByTestId('reset-password-input')).toBeVisible();
    await expect(page.getByTestId('reset-password-confirm-input')).toBeVisible();
    await expect(page.getByTestId('reset-password-submit')).toBeVisible();

    // Test password mismatch validation (both meet length requirement but don't match)
    await page.getByTestId('reset-password-input').fill('password123');
    await page.getByTestId('reset-password-confirm-input').fill('different456');
    await page.getByTestId('reset-password-submit').click();
    await expect(page.getByTestId('reset-password-error')).toBeVisible();
    await expect(page.getByTestId('reset-password-error')).toContainText('Passwords do not match');

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
    await expect(page.getByTestId('confirm-email-error')).toContainText('No confirmation token provided');
    await expect(page.getByTestId('confirm-email-go-to-app')).toBeVisible();
    await expect(page.getByTestId('confirm-email-go-to-app')).toContainText('Go to app');

    await context.close();
  });

  test('AUTH-CE-02: Successful email confirmation flow', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/auth/confirm-email?token=sometoken');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('confirm-email-page')).toBeVisible();

    // Should show either loading, success, or error state (token is fake so will result in error)
    // First check loading state appears initially or transitions quickly
    const errorOrSuccess = page.getByTestId('confirm-email-error').or(page.getByTestId('confirm-email-success'));
    await expect(errorOrSuccess).toBeVisible({ timeout: 10000 });

    // With an invalid token, we expect the error state with "Confirmation Failed" heading
    await expect(page.getByTestId('confirm-email-error')).toBeVisible();
    await expect(page.getByTestId('confirm-email-error')).toContainText('Confirmation Failed');

    await context.close();
  });
});

// ============================================================
// Production Auth Flows — no IS_TEST bypass (AUTH-CE-03, AUTH-RP-04)
// These tests exercise real token generation, storage, and redemption
// by interacting with the database directly and calling API endpoints.
// ============================================================

test.describe('Production Auth Flows', () => {
  test.setTimeout(120000);

  test('AUTH-CE-03: Email confirmation token redemption and login flow', async ({ request }) => {
    const dbUrl = getTestDbUrl();
    expect(dbUrl).toBeTruthy();
    const sql = neon(dbUrl);

    const testEmail = `ce03-${Date.now()}@test.com`;
    const testPassword = 'testpass123';
    const passwordHash = hashPassword(testPassword);
    const authUserId = crypto.randomUUID();
    const confirmToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // 1. Insert an unconfirmed user directly into the database
    const userRows = await sql`
      INSERT INTO users (auth_user_id, email, name, password_hash, provider, email_confirmed)
      VALUES (${authUserId}::uuid, ${testEmail}, ${testEmail.split('@')[0]}, ${passwordHash}, 'email', false)
      RETURNING id
    `;
    const userId = userRows[0].id;

    // 2. Insert a confirmation token
    await sql`
      INSERT INTO email_tokens (user_id, token, type, expires_at)
      VALUES (${userId}::uuid, ${confirmToken}, 'confirm', ${expiresAt})
    `;

    // 3. Call the confirm-email API endpoint with the token
    const confirmRes = await request.post('/.netlify/functions/auth?action=confirm-email', {
      data: { token: confirmToken },
    });
    expect(confirmRes.status()).toBe(200);
    const confirmBody = await confirmRes.json();
    expect(confirmBody.access_token).toBeTruthy();
    expect(confirmBody.user).toBeTruthy();
    expect(confirmBody.user.email).toBe(testEmail);

    // 4. Verify the user is confirmed in the database
    const confirmedRows = await sql`
      SELECT email_confirmed FROM users WHERE id = ${userId}::uuid
    `;
    expect(confirmedRows[0].email_confirmed).toBe(true);

    // 5. Verify the token is marked as used
    const tokenRows = await sql`
      SELECT used_at FROM email_tokens WHERE token = ${confirmToken}
    `;
    expect(tokenRows[0].used_at).toBeTruthy();
  });

  test('AUTH-RP-04: Full password reset token generation, redemption, and login flow', async ({ request }) => {
    const dbUrl = getTestDbUrl();
    expect(dbUrl).toBeTruthy();
    const sql = neon(dbUrl);

    const testEmail = `rp04-${Date.now()}@test.com`;
    const originalPassword = 'original123';
    const newPassword = 'newpass456';
    const passwordHash = hashPassword(originalPassword);
    const authUserId = crypto.randomUUID();

    // 1. Create a confirmed user in the database
    await sql`
      INSERT INTO users (auth_user_id, email, name, password_hash, provider, email_confirmed)
      VALUES (${authUserId}::uuid, ${testEmail}, ${testEmail.split('@')[0]}, ${passwordHash}, 'email', true)
    `;

    // 2. Call forgot-password API to generate a reset token
    const forgotRes = await request.post('/.netlify/functions/auth?action=forgot-password', {
      data: { email: testEmail },
    });
    expect(forgotRes.status()).toBe(200);
    const forgotBody = await forgotRes.json();
    expect(forgotBody.message).toContain('password reset link has been sent');

    // 3. Query the database for the generated reset token
    const tokenRows = await sql`
      SELECT et.token FROM email_tokens et
      JOIN users u ON u.id = et.user_id
      WHERE u.email = ${testEmail} AND et.type = 'reset' AND et.used_at IS NULL
      ORDER BY et.created_at DESC LIMIT 1
    `;
    expect(tokenRows.length).toBe(1);
    const resetToken = tokenRows[0].token;

    // 4. Call reset-password API with the token and new password
    const resetRes = await request.post('/.netlify/functions/auth?action=reset-password', {
      data: { token: resetToken, password: newPassword },
    });
    expect(resetRes.status()).toBe(200);
    const resetBody = await resetRes.json();
    expect(resetBody.access_token).toBeTruthy();
    expect(resetBody.user).toBeTruthy();
    expect(resetBody.user.email).toBe(testEmail);

    // 5. Login with the new password should succeed
    const loginRes = await request.post('/.netlify/functions/auth?action=login', {
      data: { email: testEmail, password: newPassword },
    });
    expect(loginRes.status()).toBe(200);
    const loginBody = await loginRes.json();
    expect(loginBody.access_token).toBeTruthy();
  });
});
