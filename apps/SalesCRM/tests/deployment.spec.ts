import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const deploymentTxtPath = path.resolve(__dirname, "..", "deployment.txt");
const deploymentTxt = readFileSync(deploymentTxtPath, "utf-8");
const urlMatch = deploymentTxt.match(/^url=(.+)$/m);
const BASE_URL = urlMatch ? urlMatch[1].trim() : "";

test("SalesCRM production deployment works", async ({ page }) => {
  test.skip(!BASE_URL, "No deployment URL found in deployment.txt");

  // 1. Navigate to the deployed app
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  // Verify the app shell renders — sidebar with branding and navigation
  await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  await expect(page.locator(".sidebar-app-name")).toHaveText("Sales CRM");

  // Verify navigation items are present
  await expect(page.locator('[data-testid="sidebar-nav-clients"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-deals"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-tasks"]')).toBeVisible();

  // Verify the default Clients page loads
  await expect(page.locator('[data-testid="clients-list-page"]')).toBeVisible();
  await expect(page.locator("h1")).toHaveText("Clients");

  // 2. Perform a write operation — sign up a new user
  //    In production mode, signup creates a DB record and returns a confirmation message.
  const signInBtn = page.locator('[data-testid="sidebar-signin-btn"]');
  await expect(signInBtn).toBeVisible();
  await signInBtn.click();

  // Switch to Sign Up mode
  const toggleBtn = page.locator('[data-testid="sidebar-auth-toggle"]');
  await expect(toggleBtn).toHaveText("Sign Up");
  await toggleBtn.click();

  // Fill in the signup form with a unique email
  const uniqueEmail = `deploy-test-${Date.now()}@example.com`;
  await page.locator('[data-testid="sidebar-auth-email"]').fill(uniqueEmail);
  await page.locator('[data-testid="sidebar-auth-password"]').fill("TestPassword123!");

  // Submit the form
  const submitBtn = page.locator('[data-testid="sidebar-auth-submit-btn"]');
  await expect(submitBtn).toHaveText("Sign Up");
  await submitBtn.click();

  // Verify the confirmation message appears (proves write to production DB succeeded)
  const authMessage = page.locator('[data-testid="sidebar-auth-message"]');
  await expect(authMessage).toBeVisible({ timeout: 15000 });
  await expect(authMessage).toContainText("confirmation email has been sent");
});
