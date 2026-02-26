import { test, expect } from "@playwright/test";

async function openNewTransactionModal(page: import("@playwright/test").Page) {
  await page.goto("/accounts");
  await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });
  await page.getByTestId("navbar-new-transaction-btn").click();
  await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });
}

test.describe("NewTransactionModal", () => {
  test("NewTransactionModal displays title and close button", async ({ page }) => {
    await openNewTransactionModal(page);

    // Verify title "New Transaction" is displayed
    const modal = page.getByTestId("new-transaction-modal");
    await expect(modal.locator(".modal-title")).toHaveText("New Transaction");

    // Verify X close button is displayed in the top-right corner
    await expect(page.getByTestId("modal-close-btn")).toBeVisible();
  });

  test("NewTransactionModal X button closes modal", async ({ page }) => {
    await openNewTransactionModal(page);

    // Click the X close button
    await page.getByTestId("modal-close-btn").click();

    // Verify the modal is closed
    await expect(page.getByTestId("new-transaction-modal")).toHaveCount(0, { timeout: 10000 });

    // Verify the underlying page is still visible
    await expect(page.getByTestId("accounts-page")).toBeVisible({ timeout: 10000 });
  });

  test("NewTransactionModal Cancel button closes modal without saving", async ({ page, request }) => {
    await openNewTransactionModal(page);

    // Fill in some fields
    await page.getByTestId("transaction-description").fill("Test Transaction Should Not Save");
    await page.getByTestId("transaction-date").fill("2023-10-26");

    // Click Cancel button
    await page.getByTestId("cancel-transaction-btn").click();

    // Verify the modal is closed
    await expect(page.getByTestId("new-transaction-modal")).toHaveCount(0, { timeout: 10000 });

    // Verify the underlying page is unchanged
    await expect(page.getByTestId("accounts-page")).toBeVisible({ timeout: 10000 });

    // Verify no transaction was created by checking the API
    const txnsRes = await request.get("/.netlify/functions/transactions");
    const txns = (await txnsRes.json()) as Array<{ description: string }>;
    const found = txns.some((t) => t.description === "Test Transaction Should Not Save");
    expect(found).toBe(false);
  });

  test("NewTransactionModal Save Transaction button saves transaction", async ({ page, request }) => {
    test.slow();

    await openNewTransactionModal(page);

    // Fill in date
    await page.getByTestId("transaction-date").fill("2023-10-26");

    // Fill in description
    await page.getByTestId("transaction-description").fill("October Rent & Utilities Payment");

    // Currency defaults to USD, no change needed

    // Set first line item: Checking Account, Credit, $1,500.00
    const accountInput0 = page.getByTestId("line-item-account-0");
    await accountInput0.click();
    await accountInput0.fill("Checking");
    await page.locator(".searchable-select-option").filter({ hasText: "Checking Account" }).first().click();

    const typeInput0 = page.getByTestId("line-item-type-0");
    await typeInput0.click();
    await page.locator(".searchable-select-option").filter({ hasText: "Credit" }).click();

    await page.getByTestId("line-item-amount-0").fill("1500");

    // Set second line item: Rent Expense, Debit, $1,500.00
    const accountInput1 = page.getByTestId("line-item-account-1");
    await accountInput1.click();
    await accountInput1.fill("Rent");
    await page.locator(".searchable-select-option").filter({ hasText: "Rent Expense" }).first().click();

    // Type defaults to Debit for new rows, no change needed
    await page.getByTestId("line-item-amount-1").fill("1500");

    // Verify the transaction is balanced before saving
    await expect(page.getByTestId("balance-status")).toContainText("Balanced", { timeout: 5000 });

    // Click Save Transaction
    await page.getByTestId("submit-transaction-btn").click();

    // Verify modal closes
    await expect(page.getByTestId("new-transaction-modal")).toHaveCount(0, { timeout: 30000 });

    // Navigate to Checking Account and verify the new transaction appears
    await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });
    const checkingCard = page.getByTestId("category-content-assets")
      .locator(".account-card")
      .filter({ hasText: "Checking Account (Chase Bank)" });
    await checkingCard.click();
    await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });

    const checkingTable = page.getByTestId("transactions-table");
    await expect(checkingTable).toBeVisible({ timeout: 10000 });
    const rentRow = checkingTable.locator("tbody tr").filter({ hasText: "October Rent & Utilities Payment" });
    await expect(rentRow).toBeVisible({ timeout: 10000 });
    await expect(rentRow).toContainText("$1,500.00");
    await expect(rentRow).toContainText("Credit");

    // Navigate to Rent Expense and verify the transaction also appears there
    await page.goto("/accounts");
    await expect(page.getByTestId("category-section-expenses")).toBeVisible({ timeout: 30000 });
    // Expenses is collapsed by default — expand it
    await page.getByTestId("category-header-expenses").click();
    await expect(page.getByTestId("category-content-expenses")).toBeVisible({ timeout: 10000 });
    const expensesContent = page.getByTestId("category-content-expenses");
    const rentExpenseCard = expensesContent.locator(".account-card").filter({ hasText: "Rent Expense" });
    await rentExpenseCard.click();
    await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });

    const rentExpenseTable = page.getByTestId("transactions-table");
    await expect(rentExpenseTable).toBeVisible({ timeout: 10000 });
    const rentExpenseRow = rentExpenseTable.locator("tbody tr").filter({ hasText: "October Rent & Utilities Payment" });
    await expect(rentExpenseRow).toBeVisible({ timeout: 10000 });
    await expect(rentExpenseRow).toContainText("$1,500.00");
    await expect(rentExpenseRow).toContainText("Debit");

    // Clean up: delete the created transaction
    const txnsRes = await request.get("/.netlify/functions/transactions");
    const txns = (await txnsRes.json()) as Array<{ id: string; description: string }>;
    const createdTxn = txns.find((t) => t.description === "October Rent & Utilities Payment");
    if (createdTxn) {
      await request.delete(`/.netlify/functions/transactions/${createdTxn.id}`);
    }
  });
});
