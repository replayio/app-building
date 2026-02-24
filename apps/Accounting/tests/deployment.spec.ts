import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDeployedUrl(): string {
  const deploymentPath = path.resolve(__dirname, "..", "deployment.txt");
  const content = readFileSync(deploymentPath, "utf-8");
  for (const line of content.split("\n")) {
    if (line.startsWith("url=")) {
      return line.slice(4).trim();
    }
  }
  throw new Error("No url found in deployment.txt");
}

const BASE_URL = getDeployedUrl();

test("Deployment: data displays and app is interactive", async ({ page }) => {
  // 1. Navigate to accounts page and verify real data loads
  await page.goto(`${BASE_URL}/accounts`);
  await expect(page.getByTestId("accounts-page")).toBeVisible({ timeout: 30000 });

  // Verify category sections render with real data from the database
  await expect(page.getByTestId("category-section-assets")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("category-section-liabilities")).toBeVisible();
  await expect(page.getByTestId("category-section-equity")).toBeVisible();
  await expect(page.getByTestId("category-section-revenue")).toBeVisible();
  await expect(page.getByTestId("category-section-expenses")).toBeVisible();

  // Verify account cards loaded (assets section is expanded by default)
  const assetsContent = page.getByTestId("category-content-assets");
  await expect(assetsContent).toBeVisible();
  await expect(assetsContent.locator(".account-card")).toHaveCount(3, { timeout: 15000 });

  // Verify specific account data rendered from database
  await expect(assetsContent).toContainText("Checking Account (Chase Bank)");
  await expect(assetsContent).toContainText("$12,500.00");

  // 2. Verify interactive functionality - expand a collapsed category
  await expect(page.getByTestId("category-content-equity")).not.toBeVisible();
  await page.getByTestId("category-header-equity").click();
  await expect(page.getByTestId("category-content-equity")).toBeVisible();

  // 3. Verify New Transaction modal opens and form is interactive
  await page.getByTestId("navbar-new-transaction-btn").click();
  await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });

  // Fill in a transaction description to verify form interactivity
  await page.getByTestId("transaction-description").fill("Deployment test transaction");
  await expect(page.getByTestId("transaction-description")).toHaveValue("Deployment test transaction");

  // Close modal
  await page.getByTestId("modal-close-btn").click();
  await expect(page.getByTestId("new-transaction-modal")).not.toBeVisible();
});
