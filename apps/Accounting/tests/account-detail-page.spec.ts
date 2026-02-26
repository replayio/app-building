import { test, expect } from "@playwright/test";

test.describe("BudgetDetailsTab", () => {
  test("BudgetDetailsTab empty state when no budget items exist", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });

    // Click on the Savings Account card to navigate to its detail page
    const assetsContent = page.getByTestId("category-content-assets");
    const savingsCard = assetsContent.locator(".account-card").filter({
      hasText: "Savings Account (Ally)",
    });
    await savingsCard.click();

    // Wait for AccountDetailPage to load
    await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });

    // Click the "Budget Details" tab
    await page.getByTestId("tab-budget-details").click();

    // Verify the empty state message is displayed
    await expect(page.getByTestId("budget-details-empty")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("budget-details-empty")).toHaveText(
      "No budget items found for this account."
    );
  });
});
