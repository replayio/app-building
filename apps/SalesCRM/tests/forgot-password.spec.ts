import { test, expect } from "@playwright/test";

test.describe("ForgotPasswordForm", () => {
  test("Page displays heading and instructions", async ({ page }) => {
    await page.goto("/auth/forgot-password");

    const form = page.getByTestId("forgot-password-form");
    await expect(form).toBeVisible({ timeout: 30000 });

    await expect(
      form.getByRole("heading", { name: "Forgot Password" })
    ).toBeVisible();

    await expect(form).toContainText(
      "Enter your email address and we'll send you a link to reset your password"
    );
  });

  test("Email input field is displayed", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.getByTestId("forgot-password-form")).toBeVisible({
      timeout: 30000,
    });

    const emailInput = page.getByTestId("forgot-password-email");
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(emailInput).toHaveAttribute(
      "placeholder",
      "Enter your email address"
    );
  });

  test("Submit button is displayed with label", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.getByTestId("forgot-password-form")).toBeVisible({
      timeout: 30000,
    });

    const submitBtn = page.getByTestId("forgot-password-submit");
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText("Send Reset Link");
  });

  test("Submit with valid email shows success message", async ({
    page,
    request,
  }) => {
    test.slow();

    const uniqueEmail = `test-forgot-${Date.now()}@example.com`;
    const password = "TestPass123!";

    // Create a user via signup API so the email exists
    await request.post("http://localhost:8888/.netlify/functions/auth", {
      data: { action: "signup", email: uniqueEmail, password },
    });

    await page.goto("/auth/forgot-password");
    await expect(page.getByTestId("forgot-password-form")).toBeVisible({
      timeout: 30000,
    });

    await page.getByTestId("forgot-password-email").fill(uniqueEmail);
    await page.getByTestId("forgot-password-submit").click();

    // Success message should replace the form
    await expect(page.getByTestId("forgot-password-success")).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByTestId("forgot-password-success")).toContainText(
      "If an account exists with that email, a password reset link has been sent"
    );
  });

  test("Submit with empty email shows validation error", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.getByTestId("forgot-password-form")).toBeVisible({
      timeout: 30000,
    });

    // Click submit without entering email
    await page.getByTestId("forgot-password-submit").click();

    await expect(page.getByTestId("forgot-password-error")).toBeVisible();
    await expect(page.getByTestId("forgot-password-error")).toContainText(
      "Email is required"
    );
  });

  test("Submit with invalid email format shows validation error", async ({
    page,
  }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.getByTestId("forgot-password-form")).toBeVisible({
      timeout: 30000,
    });

    await page.getByTestId("forgot-password-email").fill("user@domain");
    await page.getByTestId("forgot-password-submit").click();

    await expect(page.getByTestId("forgot-password-error")).toBeVisible();
    await expect(page.getByTestId("forgot-password-error")).toContainText(
      "Please enter a valid email address"
    );
  });

  test("Back to sign in link is displayed and navigates correctly", async ({
    page,
  }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.getByTestId("forgot-password-form")).toBeVisible({
      timeout: 30000,
    });

    const backLink = page.getByTestId("forgot-password-back-link");
    await expect(backLink).toBeVisible();
    await expect(backLink).toContainText("Back to Sign In");

    // Click and verify navigation to /clients
    await backLink.click();
    await expect(page).toHaveURL(/\/clients/, { timeout: 30000 });
  });

  test("Submit button shows loading state during request", async ({
    page,
  }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.getByTestId("forgot-password-form")).toBeVisible({
      timeout: 30000,
    });

    // Intercept the auth API request and delay it to observe loading state
    await page.route("**/.netlify/functions/auth", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.getByTestId("forgot-password-email").fill("test@example.com");
    await page.getByTestId("forgot-password-submit").click();

    // Button should show loading state
    const submitBtn = page.getByTestId("forgot-password-submit");
    await expect(submitBtn).toContainText("Sending...");
    await expect(submitBtn).toBeDisabled();
  });
});
