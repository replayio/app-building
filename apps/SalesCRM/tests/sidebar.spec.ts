import { test, expect } from "@playwright/test";

test.describe("SidebarNavigation", () => {
  test("Sidebar displays all navigation links with icons", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    const nav = page.getByTestId("sidebar-nav");
    await expect(nav).toBeVisible();

    // Verify exactly six navigation links
    const expectedLinks = [
      { testId: "sidebar-nav-clients", label: "Clients" },
      { testId: "sidebar-nav-contacts", label: "Contacts" },
      { testId: "sidebar-nav-deals", label: "Deals" },
      { testId: "sidebar-nav-tasks", label: "Tasks" },
      { testId: "sidebar-nav-team", label: "Team" },
      { testId: "sidebar-nav-settings", label: "Settings" },
    ];

    for (const link of expectedLinks) {
      const navItem = page.getByTestId(link.testId);
      await expect(navItem).toBeVisible();
      await expect(navItem).toContainText(link.label);
      // Each link has an icon (svg element inside)
      await expect(navItem.locator("svg")).toBeVisible();
    }

    // Verify no extra nav items (only 6 links in the nav)
    await expect(nav.locator(".sidebar-nav-item")).toHaveCount(6);
  });

  test("Clients link navigates to /clients", async ({ page }) => {
    await page.goto("/deals");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("sidebar-nav-clients").click();
    await expect(page).toHaveURL(/\/clients$/);
    await expect(page.getByTestId("clients-list-page")).toBeVisible({ timeout: 30000 });
  });

  test("Contacts link navigates to /contacts", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("sidebar-nav-contacts").click();
    await expect(page).toHaveURL(/\/contacts$/);
    await expect(page.getByTestId("contacts-list-page")).toBeVisible({ timeout: 30000 });
  });

  test("Deals link navigates to /deals", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("sidebar-nav-deals").click();
    await expect(page).toHaveURL(/\/deals$/);
    await expect(page.getByTestId("deals-list-page")).toBeVisible({ timeout: 30000 });
  });

  test("Tasks link navigates to /tasks", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("sidebar-nav-tasks").click();
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByTestId("tasks-list-page")).toBeVisible({ timeout: 30000 });
  });

  test("Team link navigates to /users", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("sidebar-nav-team").click();
    await expect(page).toHaveURL(/\/users$/);
    await expect(page.getByTestId("users-list-page")).toBeVisible({ timeout: 30000 });
  });

  test("Settings link navigates to /settings", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("sidebar-nav-settings").click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByTestId("settings-page")).toBeVisible({ timeout: 30000 });
  });

  test("Active link is visually highlighted for current page", async ({ page }) => {
    // Navigate to /clients
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    // Clients link should be active
    const clientsLink = page.getByTestId("sidebar-nav-clients");
    await expect(clientsLink).toHaveClass(/sidebar-nav-item--active/);

    // All other links should NOT be active
    await expect(page.getByTestId("sidebar-nav-contacts")).not.toHaveClass(/sidebar-nav-item--active/);
    await expect(page.getByTestId("sidebar-nav-deals")).not.toHaveClass(/sidebar-nav-item--active/);
    await expect(page.getByTestId("sidebar-nav-tasks")).not.toHaveClass(/sidebar-nav-item--active/);
    await expect(page.getByTestId("sidebar-nav-team")).not.toHaveClass(/sidebar-nav-item--active/);
    await expect(page.getByTestId("sidebar-nav-settings")).not.toHaveClass(/sidebar-nav-item--active/);

    // Navigate to /deals and check highlighting
    await page.getByTestId("sidebar-nav-deals").click();
    await expect(page).toHaveURL(/\/deals$/);
    await expect(page.getByTestId("sidebar-nav-deals")).toHaveClass(/sidebar-nav-item--active/);
    await expect(page.getByTestId("sidebar-nav-clients")).not.toHaveClass(/sidebar-nav-item--active/);

    // Navigate to /tasks
    await page.getByTestId("sidebar-nav-tasks").click();
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByTestId("sidebar-nav-tasks")).toHaveClass(/sidebar-nav-item--active/);
    await expect(page.getByTestId("sidebar-nav-deals")).not.toHaveClass(/sidebar-nav-item--active/);
  });

  test("Active state updates on navigation", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    // Clients link highlighted initially
    await expect(page.getByTestId("sidebar-nav-clients")).toHaveClass(/sidebar-nav-item--active/);

    // Click Deals link
    await page.getByTestId("sidebar-nav-deals").click();

    // Highlight should move from Clients to Deals
    await expect(page.getByTestId("sidebar-nav-deals")).toHaveClass(/sidebar-nav-item--active/);
    await expect(page.getByTestId("sidebar-nav-clients")).not.toHaveClass(/sidebar-nav-item--active/);
    await expect(page).toHaveURL(/\/deals$/);
  });

  test("Sidebar persists across page navigation", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    // Navigate to /deals using sidebar
    await page.getByTestId("sidebar-nav-deals").click();
    await expect(page.getByTestId("deals-list-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("sidebar")).toBeVisible();
    // Click sidebar nav on /deals page
    await expect(page.getByTestId("sidebar-nav")).toBeVisible();

    // Navigate to /tasks using sidebar on the deals page
    await page.getByTestId("sidebar-nav-tasks").click();
    await expect(page.getByTestId("tasks-list-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("sidebar")).toBeVisible();

    // Navigate to /settings using sidebar on the tasks page
    await page.getByTestId("sidebar-nav-settings").click();
    await expect(page.getByTestId("settings-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("sidebar")).toBeVisible();

    // Verify all nav links are still present on the settings page
    await expect(page.getByTestId("sidebar-nav-clients")).toBeVisible();
    await expect(page.getByTestId("sidebar-nav-contacts")).toBeVisible();
    await expect(page.getByTestId("sidebar-nav-deals")).toBeVisible();
    await expect(page.getByTestId("sidebar-nav-tasks")).toBeVisible();
    await expect(page.getByTestId("sidebar-nav-team")).toBeVisible();
    await expect(page.getByTestId("sidebar-nav-settings")).toBeVisible();
  });
});

test.describe("SidebarAuth", () => {
  test("Sign In button displays when not authenticated", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    const userArea = page.getByTestId("sidebar-user-area");
    await expect(userArea).toBeVisible();

    // Sign In button should be visible
    await expect(page.getByTestId("sidebar-signin-btn")).toBeVisible();

    // No avatar, name, or sign-out control should be visible
    await expect(page.getByTestId("sidebar-avatar")).not.toBeVisible();
    await expect(page.getByTestId("sidebar-user-name")).not.toBeVisible();
    await expect(page.getByTestId("sidebar-signout-btn")).not.toBeVisible();
  });

  test("Clicking Sign In reveals inline auth form", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    // Click Sign In button
    await page.getByTestId("sidebar-signin-btn").click();

    // Inline form should appear
    const form = page.getByTestId("sidebar-auth-form");
    await expect(form).toBeVisible();

    // Form should contain: email input, password input, submit button, forgot password link, mode toggle
    await expect(page.getByTestId("sidebar-auth-email")).toBeVisible();
    await expect(page.getByTestId("sidebar-auth-password")).toBeVisible();
    await expect(page.getByTestId("sidebar-auth-submit-btn")).toBeVisible();
    await expect(page.getByTestId("sidebar-auth-submit-btn")).toContainText("Sign In");
    await expect(page.getByTestId("sidebar-forgot-password-link")).toBeVisible();
    await expect(page.getByTestId("sidebar-auth-toggle")).toBeVisible();
  });

  test("Sign In form submission with valid credentials", async ({ page }) => {
    test.slow();

    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    // First create an account via signup
    await page.getByTestId("sidebar-signin-btn").click();
    await page.getByTestId("sidebar-auth-toggle").click();

    const uniqueEmail = `test-signin-${Date.now()}@example.com`;
    await page.getByTestId("sidebar-auth-email").fill(uniqueEmail);
    await page.getByTestId("sidebar-auth-password").fill("TestPass123!");
    await page.getByTestId("sidebar-auth-submit-btn").click();

    // Wait for signup to complete (auto-confirmed in test mode)
    await expect(page.getByTestId("sidebar-user-info")).toBeVisible({ timeout: 30000 });

    // Sign out
    await page.getByTestId("sidebar-signout-btn").click();
    await expect(page.getByTestId("sidebar-signin-btn")).toBeVisible({ timeout: 30000 });

    // Now sign in with the same credentials
    await page.getByTestId("sidebar-signin-btn").click();
    await page.getByTestId("sidebar-auth-email").fill(uniqueEmail);
    await page.getByTestId("sidebar-auth-password").fill("TestPass123!");
    await page.getByTestId("sidebar-auth-submit-btn").click();

    // Should be authenticated
    await expect(page.getByTestId("sidebar-user-info")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("sidebar-avatar")).toBeVisible();
    await expect(page.getByTestId("sidebar-user-name")).toBeVisible();
    await expect(page.getByTestId("sidebar-signout-btn")).toBeVisible();

    // Auth form should be gone
    await expect(page.getByTestId("sidebar-auth-form")).not.toBeVisible();
  });

  test("Sign In form shows error for invalid credentials", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("sidebar-signin-btn").click();

    await page.getByTestId("sidebar-auth-email").fill("nonexistent@example.com");
    await page.getByTestId("sidebar-auth-password").fill("WrongPassword123!");
    await page.getByTestId("sidebar-auth-submit-btn").click();

    // Error message should appear
    await expect(page.getByTestId("sidebar-auth-error")).toBeVisible({ timeout: 30000 });

    // Form should still be visible for correction
    await expect(page.getByTestId("sidebar-auth-form")).toBeVisible();
    await expect(page.getByTestId("sidebar-auth-email")).toBeVisible();
    await expect(page.getByTestId("sidebar-auth-password")).toBeVisible();
  });

  test("Sign In / Sign Up toggle switches form mode", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("sidebar-signin-btn").click();

    // Initially in Sign In mode
    await expect(page.getByTestId("sidebar-auth-submit-btn")).toContainText("Sign In");
    await expect(page.getByTestId("sidebar-auth-toggle")).toContainText("Sign Up");

    // Toggle to Sign Up mode
    await page.getByTestId("sidebar-auth-toggle").click();
    await expect(page.getByTestId("sidebar-auth-submit-btn")).toContainText("Sign Up");
    await expect(page.getByTestId("sidebar-auth-toggle")).toContainText("Sign In");

    // Toggle back to Sign In mode
    await page.getByTestId("sidebar-auth-toggle").click();
    await expect(page.getByTestId("sidebar-auth-submit-btn")).toContainText("Sign In");
    await expect(page.getByTestId("sidebar-auth-toggle")).toContainText("Sign Up");
  });

  test("Sign Up form submission creates account (test mode)", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("sidebar-signin-btn").click();

    // Switch to Sign Up mode
    await page.getByTestId("sidebar-auth-toggle").click();
    await expect(page.getByTestId("sidebar-auth-submit-btn")).toContainText("Sign Up");

    const uniqueEmail = `test-signup-${Date.now()}@example.com`;
    await page.getByTestId("sidebar-auth-email").fill(uniqueEmail);
    await page.getByTestId("sidebar-auth-password").fill("TestPass123!");
    await page.getByTestId("sidebar-auth-submit-btn").click();

    // In test mode, account is auto-confirmed and user is logged in
    await expect(page.getByTestId("sidebar-user-info")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("sidebar-avatar")).toBeVisible();
    await expect(page.getByTestId("sidebar-user-name")).toBeVisible();
    await expect(page.getByTestId("sidebar-signout-btn")).toBeVisible();
  });

  test("Forgot password link navigates to /auth/forgot-password", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("sidebar-signin-btn").click();
    await expect(page.getByTestId("sidebar-forgot-password-link")).toBeVisible();

    await page.getByTestId("sidebar-forgot-password-link").click();
    await expect(page).toHaveURL(/\/auth\/forgot-password$/);
    await expect(page.getByTestId("forgot-password-page")).toBeVisible({ timeout: 30000 });
  });

  test("Avatar and name display when authenticated", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    // Sign up a new user
    await page.getByTestId("sidebar-signin-btn").click();
    await page.getByTestId("sidebar-auth-toggle").click();

    const uniqueEmail = `test-avatar-${Date.now()}@example.com`;
    await page.getByTestId("sidebar-auth-email").fill(uniqueEmail);
    await page.getByTestId("sidebar-auth-password").fill("TestPass123!");
    await page.getByTestId("sidebar-auth-submit-btn").click();

    // Wait for authenticated state
    await expect(page.getByTestId("sidebar-user-info")).toBeVisible({ timeout: 30000 });

    // Avatar (or initials fallback) should be visible
    await expect(page.getByTestId("sidebar-avatar")).toBeVisible();

    // Display name should be visible
    await expect(page.getByTestId("sidebar-user-name")).toBeVisible();

    // Sign out control should be visible
    await expect(page.getByTestId("sidebar-signout-btn")).toBeVisible();

    // Sign In button should NOT be visible
    await expect(page.getByTestId("sidebar-signin-btn")).not.toBeVisible();
  });

  test("Sign Out returns to unauthenticated state", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    // Sign up to get authenticated
    await page.getByTestId("sidebar-signin-btn").click();
    await page.getByTestId("sidebar-auth-toggle").click();

    const uniqueEmail = `test-signout-${Date.now()}@example.com`;
    await page.getByTestId("sidebar-auth-email").fill(uniqueEmail);
    await page.getByTestId("sidebar-auth-password").fill("TestPass123!");
    await page.getByTestId("sidebar-auth-submit-btn").click();

    await expect(page.getByTestId("sidebar-user-info")).toBeVisible({ timeout: 30000 });

    // Click sign out
    await page.getByTestId("sidebar-signout-btn").click();

    // Avatar, name, and sign-out should disappear
    await expect(page.getByTestId("sidebar-avatar")).not.toBeVisible();
    await expect(page.getByTestId("sidebar-user-name")).not.toBeVisible();
    await expect(page.getByTestId("sidebar-signout-btn")).not.toBeVisible();

    // Sign In button should reappear
    await expect(page.getByTestId("sidebar-signin-btn")).toBeVisible({ timeout: 30000 });
  });

  test("Auth state persists across page navigation", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30000 });

    // Sign up to get authenticated
    await page.getByTestId("sidebar-signin-btn").click();
    await page.getByTestId("sidebar-auth-toggle").click();

    const uniqueEmail = `test-persist-${Date.now()}@example.com`;
    await page.getByTestId("sidebar-auth-email").fill(uniqueEmail);
    await page.getByTestId("sidebar-auth-password").fill("TestPass123!");
    await page.getByTestId("sidebar-auth-submit-btn").click();

    await expect(page.getByTestId("sidebar-user-info")).toBeVisible({ timeout: 30000 });

    // Navigate to /deals using sidebar
    await page.getByTestId("sidebar-nav-deals").click();
    await expect(page.getByTestId("deals-list-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("sidebar-avatar")).toBeVisible();
    await expect(page.getByTestId("sidebar-user-name")).toBeVisible();
    await expect(page.getByTestId("sidebar-signout-btn")).toBeVisible();

    // Navigate to /settings using sidebar on the deals page
    await page.getByTestId("sidebar-nav-settings").click();
    await expect(page.getByTestId("settings-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("sidebar-avatar")).toBeVisible();
    await expect(page.getByTestId("sidebar-user-name")).toBeVisible();
    await expect(page.getByTestId("sidebar-signout-btn")).toBeVisible();
  });
});
