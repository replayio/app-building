import { test, expect } from "@playwright/test";

/**
 * Navigate to the first order's detail page by clicking an order ID link
 * from the dashboard's UpcomingOrdersTable.
 */
async function navigateToFirstOrder(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("upcoming-orders")).toBeVisible({ timeout: 30000 });

  const firstLink = page.locator("[data-testid^='order-link-']").first();
  await expect(firstLink).toBeVisible({ timeout: 30000 });

  await firstLink.click();
  await expect(page.getByTestId("order-details-page")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("cost-breakdown")).toBeVisible({ timeout: 30000 });
}

test.describe("OrderDetailsPage - CostBreakdown", () => {
  test("Display Subtotal", async ({ page }) => {
    await navigateToFirstOrder(page);

    const subtotal = page.getByTestId("cost-subtotal");
    await expect(subtotal).toBeVisible();

    await expect(subtotal.locator(".cost-breakdown-label")).toHaveText("Subtotal:");
    // Value should be a currency format
    await expect(subtotal.locator(".cost-breakdown-value")).toHaveText(/\$[\d,]+\.\d{2}/);
  });

  test("Display Tax with Percentage", async ({ page }) => {
    await navigateToFirstOrder(page);

    const tax = page.getByTestId("cost-tax");
    await expect(tax).toBeVisible();

    // Should show "Tax (X%):" format
    await expect(tax.locator(".cost-breakdown-label")).toHaveText(/Tax \(\d+%\):/);
    // Value should be currency format
    await expect(tax.locator(".cost-breakdown-value")).toHaveText(/\$[\d,]+\.\d{2}/);
  });

  test("Display Discount with Label", async ({ page }) => {
    await navigateToFirstOrder(page);

    const discount = page.getByTestId("cost-discount");
    await expect(discount).toBeVisible();

    // Should show "Discount (<label>):" format
    await expect(discount.locator(".cost-breakdown-label")).toHaveText(/Discount \(.+\):/);
    // Value should be negative currency, e.g. "-$780.00"
    await expect(discount.locator(".cost-breakdown-value")).toHaveText(/-\$[\d,]+\.\d{2}/);
  });

  test("Display Total Cost with Currency", async ({ page }) => {
    await navigateToFirstOrder(page);

    const total = page.getByTestId("cost-total");
    await expect(total).toBeVisible();

    await expect(total.locator(".cost-breakdown-label")).toHaveText("Total Cost:");
    // Value should include currency symbol and code, e.g. "$12,450.00 (USD)"
    await expect(total.locator(".cost-breakdown-value")).toHaveText(/\$[\d,]+\.\d{2}.*\(USD\)/);
  });

  test("Cost Breakdown Updates When Line Items Change", async ({ page }) => {
    test.slow();

    await navigateToFirstOrder(page);

    // Record the initial subtotal text
    const subtotalEl = page.getByTestId("cost-subtotal").locator(".cost-breakdown-value");
    const initialSubtotal = await subtotalEl.textContent();

    // Record the initial total text
    const totalEl = page.getByTestId("cost-total").locator(".cost-breakdown-value");
    const initialTotal = await totalEl.textContent();

    // Add a new line item to change costs
    await page.getByTestId("add-line-item-btn").click();
    const modal = page.getByTestId("line-item-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });

    await page.getByTestId("line-item-form-sku").fill("SKU-COST-TEST");
    await page.getByTestId("line-item-form-name").fill("Cost Test Item");
    await page.getByTestId("line-item-form-qty").fill("2");
    await page.getByTestId("line-item-form-unit-price").fill("500");

    await page.getByTestId("line-item-save").click();
    await expect(modal).toBeHidden({ timeout: 30000 });

    // Wait for the row to appear
    await expect(
      page.getByTestId("line-item-row").filter({ hasText: "Cost Test Item" })
    ).toBeVisible({ timeout: 30000 });

    // The subtotal should have changed
    await expect(subtotalEl).not.toHaveText(initialSubtotal!, { timeout: 30000 });

    // The total should have changed
    await expect(totalEl).not.toHaveText(initialTotal!, { timeout: 30000 });

    // Both should still be valid currency
    await expect(subtotalEl).toHaveText(/\$[\d,]+\.\d{2}/);
    await expect(totalEl).toHaveText(/\$[\d,]+\.\d{2}/);
  });
});
