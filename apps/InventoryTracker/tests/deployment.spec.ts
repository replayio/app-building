import { test, expect } from "@playwright/test";

test("deployment: data displays and can be updated", async ({ page }) => {
  // 1. Navigate to the main page and confirm data loads
  await page.goto("/");
  await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 60000 });

  // Verify the navbar loads with branding
  await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("navbar-logo")).toContainText("InventoryFlow");

  // Verify materials categories overview loads with real data
  await expect(page.getByTestId("materials-categories-overview")).toBeVisible({ timeout: 30000 });
  const categoryColumns = page.locator("[data-testid^='category-column-']");
  await expect(categoryColumns.first()).toBeVisible({ timeout: 30000 });
  const categoryCount = await categoryColumns.count();
  expect(categoryCount).toBeGreaterThanOrEqual(1);

  // Verify recent transactions table loads with real data
  await expect(page.getByTestId("recent-transactions-table")).toBeVisible({ timeout: 30000 });
  const transactionRows = page.locator("[data-testid^='recent-transaction-row-']");
  await expect(transactionRows.first()).toBeVisible({ timeout: 30000 });
  const txnCount = await transactionRows.count();
  expect(txnCount).toBeGreaterThanOrEqual(1);

  // 2. Perform a write operation: dismiss a low inventory alert
  await expect(page.getByTestId("low-inventory-alerts")).toBeVisible({ timeout: 30000 });
  const alertRows = page.locator("[data-testid^='low-inventory-alert-row-']");
  const alertCount = await alertRows.count();

  if (alertCount > 0) {
    // Find the first alert and dismiss it
    const firstAlert = alertRows.first();
    const alertTestId = await firstAlert.getAttribute("data-testid");
    const materialId = alertTestId!.replace("low-inventory-alert-row-", "");

    await page.getByTestId(`low-inventory-alert-dismiss-${materialId}`).click();

    // Confirm the alert was removed (count decreased)
    await expect(
      page.locator(`[data-testid="low-inventory-alert-row-${materialId}"]`)
    ).toHaveCount(0, { timeout: 30000 });
  } else {
    // If no alerts, verify empty state is displayed (still confirms data loaded)
    await expect(page.getByTestId("low-inventory-alerts-empty")).toBeVisible();
  }
});
