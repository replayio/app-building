import { test, expect } from "@playwright/test";
import { neon } from "@neondatabase/serverless";

test.describe("ConfirmEmailHandler", () => {
  test("Valid token confirms email and auto-logs in", async ({
    page,
    request,
  }) => {
    test.slow();

    const uniqueEmail = `test-confirm-${Date.now()}@example.com`;
    const password = "TestPass123!";

    // 1. Create a user via signup API (IS_TEST=true auto-confirms)
    await request.post("http://localhost:8888/.netlify/functions/auth", {
      data: { action: "signup", email: uniqueEmail, password },
    });

    // 2. Query the database to set email_confirmed=false and insert a confirmation token
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");
    const sql = neon(dbUrl);

    const users = await sql(
      `UPDATE users SET email_confirmed = false WHERE email = $1 RETURNING id`,
      [uniqueEmail]
    );
    const userId = users[0].id as string;

    const confirmToken = `test-confirm-token-${Date.now()}`;
    await sql(
      `INSERT INTO email_tokens (user_id, token, type, expires_at) VALUES ($1, $2, 'confirmation', NOW() + INTERVAL '24 hours')`,
      [userId, confirmToken]
    );

    // 3. Navigate to the confirm-email page with the real token
    await page.goto(`/auth/confirm-email?token=${confirmToken}`);
    await expect(page.getByTestId("confirm-email-handler")).toBeVisible({
      timeout: 30000,
    });

    // 4. Verify redirect to /clients and authenticated state in sidebar
    await expect(page).toHaveURL(/\/clients/, { timeout: 30000 });
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("sidebar-avatar")).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByTestId("sidebar-user-name")).toBeVisible();
    await expect(page.getByTestId("sidebar-signout-btn")).toBeVisible();
  });

  test("Loading state is displayed during token verification", async ({
    page,
  }) => {
    // Intercept the auth API request and delay it to observe loading state
    await page.route("**/.netlify/functions/auth", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto("/auth/confirm-email?token=some-token");
    await expect(page.getByTestId("confirm-email-handler")).toBeVisible({
      timeout: 30000,
    });

    // Loading state should be shown while waiting for response
    const loading = page.getByTestId("confirm-email-loading");
    await expect(loading).toBeVisible();
    await expect(loading).toContainText("Confirming your email");
  });

  test("Invalid token shows error message", async ({ page }) => {
    await page.goto("/auth/confirm-email?token=invalid-nonexistent-token");
    await expect(page.getByTestId("confirm-email-handler")).toBeVisible({
      timeout: 30000,
    });

    await expect(page.getByTestId("confirm-email-error")).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByTestId("confirm-email-error")).toContainText(
      "This confirmation link is invalid"
    );
  });

  test("Expired token shows error message", async ({ page, request }) => {
    test.slow();

    const uniqueEmail = `test-expired-${Date.now()}@example.com`;
    const password = "TestPass123!";

    // Create a user
    await request.post("http://localhost:8888/.netlify/functions/auth", {
      data: { action: "signup", email: uniqueEmail, password },
    });

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");
    const sql = neon(dbUrl);

    const users = await sql(
      `SELECT id FROM users WHERE email = $1`,
      [uniqueEmail]
    );
    const userId = users[0].id as string;

    // Insert an expired confirmation token
    const expiredToken = `test-expired-token-${Date.now()}`;
    await sql(
      `INSERT INTO email_tokens (user_id, token, type, expires_at) VALUES ($1, $2, 'confirmation', NOW() - INTERVAL '1 hour')`,
      [userId, expiredToken]
    );

    await page.goto(`/auth/confirm-email?token=${expiredToken}`);
    await expect(page.getByTestId("confirm-email-handler")).toBeVisible({
      timeout: 30000,
    });

    await expect(page.getByTestId("confirm-email-error")).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByTestId("confirm-email-error")).toContainText(
      "This confirmation link has expired"
    );
  });

  test("Already-used token shows error message", async ({
    page,
    request,
  }) => {
    test.slow();

    const uniqueEmail = `test-used-${Date.now()}@example.com`;
    const password = "TestPass123!";

    // Create a user
    await request.post("http://localhost:8888/.netlify/functions/auth", {
      data: { action: "signup", email: uniqueEmail, password },
    });

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");
    const sql = neon(dbUrl);

    const users = await sql(
      `SELECT id FROM users WHERE email = $1`,
      [uniqueEmail]
    );
    const userId = users[0].id as string;

    // Insert a used confirmation token (used_at is set)
    const usedToken = `test-used-token-${Date.now()}`;
    await sql(
      `INSERT INTO email_tokens (user_id, token, type, expires_at, used_at) VALUES ($1, $2, 'confirmation', NOW() + INTERVAL '24 hours', NOW())`,
      [userId, usedToken]
    );

    await page.goto(`/auth/confirm-email?token=${usedToken}`);
    await expect(page.getByTestId("confirm-email-handler")).toBeVisible({
      timeout: 30000,
    });

    await expect(page.getByTestId("confirm-email-error")).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByTestId("confirm-email-error")).toContainText(
      "This confirmation link has already been used"
    );
  });

  test("Missing token shows error message", async ({ page }) => {
    await page.goto("/auth/confirm-email");
    await expect(page.getByTestId("confirm-email-handler")).toBeVisible({
      timeout: 30000,
    });

    await expect(page.getByTestId("confirm-email-error")).toBeVisible();
    await expect(page.getByTestId("confirm-email-error")).toContainText(
      "No confirmation token provided"
    );
  });

  test("Error state shows link to sign in", async ({ page }) => {
    // Navigate with invalid token to trigger error state
    await page.goto("/auth/confirm-email?token=invalid-token");
    await expect(page.getByTestId("confirm-email-handler")).toBeVisible({
      timeout: 30000,
    });

    // Wait for error to appear
    await expect(page.getByTestId("confirm-email-error")).toBeVisible({
      timeout: 30000,
    });

    // Sign-in link should be visible
    const signinLink = page.getByTestId("confirm-email-signin-link");
    await expect(signinLink).toBeVisible();
    await expect(signinLink).toContainText("Go to Sign In");

    // Click and verify navigation to /clients
    await signinLink.click();
    await expect(page).toHaveURL(/\/clients/);
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });
  });
});
