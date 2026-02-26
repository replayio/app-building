import { test, expect } from "@playwright/test";

async function openNewTransactionModal(page: import("@playwright/test").Page) {
  await page.goto("/accounts");
  await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });
  await page.getByTestId("navbar-new-transaction-btn").click();
  await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });
}

test.describe("LineItemsTable", () => {
  test("LineItemsTable displays section heading", async ({ page }) => {
    await openNewTransactionModal(page);

    // Verify the heading "Transaction Details (Line Items)" is displayed above the line items table
    const heading = page.getByTestId("line-items-heading");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("Transaction Details (Line Items)");
  });

  test("LineItemsTable displays column headers", async ({ page }) => {
    await openNewTransactionModal(page);

    // Verify the header row is visible
    const headerRow = page.getByTestId("line-items-header");
    await expect(headerRow).toBeVisible();

    // Verify three labeled column headers: Account, Type, Amount
    const headerSpans = headerRow.locator("span");
    await expect(headerSpans).toHaveCount(4);
    await expect(headerSpans.nth(0)).toHaveText("Account");
    await expect(headerSpans.nth(1)).toHaveText("Type");
    await expect(headerSpans.nth(2)).toHaveText("Amount");

    // Fourth column is unlabeled (contains delete buttons) - verify it's empty
    await expect(headerSpans.nth(3)).toHaveText("");

    // Verify delete buttons exist on line item rows (the unlabeled column's purpose)
    await expect(page.getByTestId("line-item-delete-0")).toBeVisible();
  });

  test("LineItemsTable Account dropdown shows accounts with codes", async ({ page }) => {
    await openNewTransactionModal(page);

    // Click the Account dropdown on the first line item row
    const accountInput = page.getByTestId("line-item-account-0");
    await expect(accountInput).toBeVisible();
    await accountInput.click();

    // Verify the dropdown opens with accounts showing their codes in parentheses
    const dropdown = page.getByTestId("line-item-row-0").locator(".searchable-select-dropdown");
    await expect(dropdown).toBeVisible({ timeout: 10000 });

    // Verify accounts are displayed with codes in parentheses format
    await expect(dropdown.locator(".searchable-select-option").filter({ hasText: "Checking Account (1001)" })).toBeVisible();
    await expect(dropdown.locator(".searchable-select-option").filter({ hasText: "Savings Account (1002)" })).toBeVisible();
    await expect(dropdown.locator(".searchable-select-option").filter({ hasText: "Operating Expenses (5001)" })).toBeVisible();

    // Verify user can select an account from the list
    await dropdown.locator(".searchable-select-option").filter({ hasText: "Checking Account (1001)" }).click();
    await expect(accountInput).toHaveValue("Checking Account (1001)");
  });

  test("LineItemsTable Account dropdown placeholder for empty row", async ({ page }) => {
    await openNewTransactionModal(page);

    // Verify the Account dropdown on the empty row shows placeholder text "Select Account"
    const accountInput = page.getByTestId("line-item-account-0");
    await expect(accountInput).toBeVisible();
    await expect(accountInput).toHaveAttribute("placeholder", "Select Account");

    // Verify the input value is empty (showing placeholder)
    await expect(accountInput).toHaveValue("");
  });
});
