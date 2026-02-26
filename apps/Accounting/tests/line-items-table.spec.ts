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

  test("LineItemsTable Type dropdown has Credit and Debit options", async ({ page }) => {
    await openNewTransactionModal(page);

    // Click the Type dropdown on the first line item row
    const typeInput = page.getByTestId("line-item-type-0");
    await expect(typeInput).toBeVisible();
    await typeInput.click();

    // Verify the dropdown opens with exactly two options: "Debit" and "Credit"
    const dropdown = page.getByTestId("line-item-row-0").locator(".searchable-select-dropdown");
    await expect(dropdown).toBeVisible({ timeout: 10000 });
    const options = dropdown.locator(".searchable-select-option");
    await expect(options).toHaveCount(2);
    await expect(options.filter({ hasText: "Debit" })).toBeVisible();
    await expect(options.filter({ hasText: "Credit" })).toBeVisible();

    // Verify the user can select "Credit"
    await options.filter({ hasText: "Credit" }).click();
    await expect(typeInput).toHaveValue("Credit");

    // Re-open dropdown and select "Debit"
    await typeInput.click();
    const dropdown2 = page.getByTestId("line-item-row-0").locator(".searchable-select-dropdown");
    await expect(dropdown2).toBeVisible({ timeout: 10000 });
    await dropdown2.locator(".searchable-select-option").filter({ hasText: "Debit" }).click();
    await expect(typeInput).toHaveValue("Debit");
  });

  test("LineItemsTable Type dropdown defaults to Debit for new rows", async ({ page }) => {
    await openNewTransactionModal(page);

    // Click the "+ Add Line Item" button to add a new row
    await page.getByTestId("add-line-item-btn").click();

    // Verify the new (third) line item row appears with Type defaulted to "Debit"
    const newTypeInput = page.getByTestId("line-item-type-2");
    await expect(newTypeInput).toBeVisible();
    await expect(newTypeInput).toHaveValue("Debit");
  });

  test("LineItemsTable Amount input accepts numeric values", async ({ page }) => {
    await openNewTransactionModal(page);

    // Type "1500.00" into the Amount input field on the first line item row
    const amountInput = page.getByTestId("line-item-amount-0");
    await expect(amountInput).toBeVisible();
    await amountInput.fill("1500.00");

    // Verify the Amount field accepts and displays the decimal numeric value
    await expect(amountInput).toHaveValue("1500.00");
  });

  test("LineItemsTable delete row button removes line item", async ({ page }) => {
    await openNewTransactionModal(page);

    // Set up three line items as described in the test spec:
    // Row 0: Checking Account, Credit, $1,500.00
    const accountInput0 = page.getByTestId("line-item-account-0");
    await accountInput0.click();
    await accountInput0.fill("Checking");
    await page.locator(".searchable-select-option").filter({ hasText: "Checking Account" }).first().click();

    const typeInput0 = page.getByTestId("line-item-type-0");
    await typeInput0.click();
    await page.getByTestId("line-item-row-0").locator(".searchable-select-option").filter({ hasText: "Credit" }).click();

    await page.getByTestId("line-item-amount-0").fill("1500");

    // Row 1: Rent Expense, Debit, $1,350.00
    const accountInput1 = page.getByTestId("line-item-account-1");
    await accountInput1.click();
    await accountInput1.fill("Rent");
    await page.locator(".searchable-select-option").filter({ hasText: "Rent Expense" }).first().click();

    // Change Type from default Credit to Debit
    const typeInput1 = page.getByTestId("line-item-type-1");
    await typeInput1.click();
    await page.getByTestId("line-item-row-1").locator(".searchable-select-option").filter({ hasText: "Debit" }).click();

    await page.getByTestId("line-item-amount-1").fill("1350");

    // Add a third row and set it up: empty account, Debit, $150.00
    await page.getByTestId("add-line-item-btn").click();
    await expect(page.getByTestId("line-item-row-2")).toBeVisible();
    await page.getByTestId("line-item-amount-2").fill("150");

    // Verify three rows exist
    await expect(page.locator("[data-testid^='line-item-row-']")).toHaveCount(3);

    // Click the delete button on the third row
    await page.getByTestId("line-item-delete-2").click();

    // Verify only two rows remain
    await expect(page.locator("[data-testid^='line-item-row-']")).toHaveCount(2);

    // Verify the remaining rows are Checking Account and Rent Expense
    await expect(page.getByTestId("line-item-account-0")).toHaveValue(/Checking Account/);
    await expect(page.getByTestId("line-item-account-1")).toHaveValue(/Rent Expense/);

    // Verify the BalanceIndicator totals update to reflect the removal
    await expect(page.getByTestId("total-debits")).toContainText("$1,350.00");
    await expect(page.getByTestId("total-credits")).toContainText("$1,500.00");
  });
});
