import { test, expect } from "@playwright/test";
import { neon } from "@neondatabase/serverless";

test.describe("ResetPasswordForm", () => {
  test("Page displays heading and instructions", async ({ page }) => {
    await page.goto("/auth/reset-password?token=any-token");

    const form = page.getByTestId("reset-password-form");
    await expect(form).toBeVisible({ timeout: 30000 });

    await expect(
      form.getByRole("heading", { name: "Reset Password" })
    ).toBeVisible();

    await expect(form).toContainText("Enter your new password");
  });

  test("New password input field is displayed", async ({ page }) => {
    await page.goto("/auth/reset-password?token=any-token");
    await expect(page.getByTestId("reset-password-form")).toBeVisible({
      timeout: 30000,
    });

    const passwordInput = page.getByTestId("reset-password-input");
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(page.getByLabel("New Password")).toBeVisible();
  });

  test("Confirm password input field is displayed", async ({ page }) => {
    await page.goto("/auth/reset-password?token=any-token");
    await expect(page.getByTestId("reset-password-form")).toBeVisible({
      timeout: 30000,
    });

    const confirmInput = page.getByTestId("reset-password-confirm");
    await expect(confirmInput).toBeVisible();
    await expect(confirmInput).toHaveAttribute("type", "password");
    await expect(page.getByLabel("Confirm Password")).toBeVisible();
  });

  test("Submit button is displayed with label", async ({ page }) => {
    await page.goto("/auth/reset-password?token=any-token");
    await expect(page.getByTestId("reset-password-form")).toBeVisible({
      timeout: 30000,
    });

    const submitBtn = page.getByTestId("reset-password-submit");
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText("Reset Password");
  });

  test("Submit with matching passwords succeeds and auto-logs in", async ({
    page,
    request,
  }) => {
    test.slow();

    const uniqueEmail = `test-reset-${Date.now()}@example.com`;
    const originalPassword = "OldPass123!";
    const newPassword = "NewSecure123!";

    // 1. Create a user via signup API (IS_TEST=true auto-confirms)
    await request.post("http://localhost:8888/.netlify/functions/auth", {
      data: {
        action: "signup",
        email: uniqueEmail,
        password: originalPassword,
      },
    });

    // 2. Call forgot-password to generate a real reset token in the DB
    await request.post("http://localhost:8888/.netlify/functions/auth", {
      data: { action: "forgot-password", email: uniqueEmail },
    });

    // 3. Query the database directly for the generated token
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");
    const sql = neon(dbUrl);
    const rows = await sql(
      `SELECT et.token FROM email_tokens et
       JOIN users u ON et.user_id = u.id
       WHERE u.email = $1 AND et.type = 'reset' AND et.used_at IS NULL
       ORDER BY et.created_at DESC LIMIT 1`,
      [uniqueEmail]
    );
    const resetToken = rows[0].token as string;

    // 4. Navigate to the reset password page with the real token
    await page.goto(`/auth/reset-password?token=${resetToken}`);
    await expect(page.getByTestId("reset-password-form")).toBeVisible({
      timeout: 30000,
    });

    // 5. Fill in matching passwords and submit
    await page.getByTestId("reset-password-input").fill(newPassword);
    await page.getByTestId("reset-password-confirm").fill(newPassword);
    await page.getByTestId("reset-password-submit").click();

    // 6. Verify redirect to /clients and authenticated state in sidebar
    await expect(page).toHaveURL(/\/clients/, { timeout: 30000 });
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("sidebar-avatar")).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByTestId("sidebar-user-name")).toBeVisible();
    await expect(page.getByTestId("sidebar-signout-btn")).toBeVisible();
  });

  test("Submit with mismatched passwords shows validation error", async ({
    page,
  }) => {
    await page.goto("/auth/reset-password?token=any-token");
    await expect(page.getByTestId("reset-password-form")).toBeVisible({
      timeout: 30000,
    });

    await page.getByTestId("reset-password-input").fill("Password1!");
    await page.getByTestId("reset-password-confirm").fill("Password2!");
    await page.getByTestId("reset-password-submit").click();

    await expect(page.getByTestId("reset-password-error")).toBeVisible();
    await expect(page.getByTestId("reset-password-error")).toContainText(
      "Passwords do not match"
    );

    // Form should remain visible for correction
    await expect(page.getByTestId("reset-password-input")).toBeVisible();
    await expect(page.getByTestId("reset-password-confirm")).toBeVisible();
  });

  test("Submit with empty password fields shows validation error", async ({
    page,
  }) => {
    await page.goto("/auth/reset-password?token=any-token");
    await expect(page.getByTestId("reset-password-form")).toBeVisible({
      timeout: 30000,
    });

    // Click submit without entering any password
    await page.getByTestId("reset-password-submit").click();

    await expect(page.getByTestId("reset-password-error")).toBeVisible();
    await expect(page.getByTestId("reset-password-error")).toContainText(
      "Password is required"
    );
  });

  test("Invalid token shows error message", async ({ page }) => {
    await page.goto("/auth/reset-password?token=invalid-or-expired-token");
    await expect(page.getByTestId("reset-password-form")).toBeVisible({
      timeout: 30000,
    });

    // Submit with valid passwords to trigger backend token validation
    await page.getByTestId("reset-password-input").fill("SomePass123!");
    await page.getByTestId("reset-password-confirm").fill("SomePass123!");
    await page.getByTestId("reset-password-submit").click();

    // Backend returns error for invalid token
    await expect(page.getByTestId("reset-password-error")).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByTestId("reset-password-error")).toContainText(
      "This reset link is invalid or has expired"
    );

    // Link to request new reset should appear
    await expect(page.getByTestId("reset-password-forgot-link")).toBeVisible();
  });

  test("Missing token shows error message", async ({ page }) => {
    await page.goto("/auth/reset-password");
    await expect(page.getByTestId("reset-password-form")).toBeVisible({
      timeout: 30000,
    });

    await expect(page.getByTestId("reset-password-error")).toBeVisible();
    await expect(page.getByTestId("reset-password-error")).toContainText(
      "No reset token provided"
    );

    // Link to request password reset should be visible
    await expect(page.getByTestId("reset-password-forgot-link")).toBeVisible();
  });

  test("Submit button shows loading state during request", async ({
    page,
  }) => {
    await page.goto("/auth/reset-password?token=test-loading-token");
    await expect(page.getByTestId("reset-password-form")).toBeVisible({
      timeout: 30000,
    });

    // Intercept the auth API request and delay it to observe loading state
    await page.route("**/.netlify/functions/auth", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.getByTestId("reset-password-input").fill("TestPass123!");
    await page.getByTestId("reset-password-confirm").fill("TestPass123!");
    await page.getByTestId("reset-password-submit").click();

    // Button should show loading state
    const submitBtn = page.getByTestId("reset-password-submit");
    await expect(submitBtn).toContainText("Resetting...");
    await expect(submitBtn).toBeDisabled();
  });

  test("Link to forgot password page is available on error", async ({
    page,
  }) => {
    await page.goto("/auth/reset-password?token=invalid-token");
    await expect(page.getByTestId("reset-password-form")).toBeVisible({
      timeout: 30000,
    });

    // Submit to trigger invalid token error from backend
    await page.getByTestId("reset-password-input").fill("SomePass123!");
    await page.getByTestId("reset-password-confirm").fill("SomePass123!");
    await page.getByTestId("reset-password-submit").click();

    // Wait for error to appear
    await expect(page.getByTestId("reset-password-error")).toBeVisible({
      timeout: 30000,
    });

    // Forgot password link should be visible with correct text
    const forgotLink = page.getByTestId("reset-password-forgot-link");
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toContainText("Request a new reset link");

    // Click and verify navigation to /auth/forgot-password
    await forgotLink.click();
    await expect(page).toHaveURL(/\/auth\/forgot-password$/);
    await expect(page.getByTestId("forgot-password-page")).toBeVisible({
      timeout: 30000,
    });
  });
});
