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

  test("NewTransactionModal saved transaction appears in affected account transaction lists", async ({ page, request }) => {
    test.slow();

    // Get account IDs
    const accountsRes = await request.get("/.netlify/functions/accounts");
    const accounts = (await accountsRes.json()) as Array<{ id: string; name: string }>;
    const checking = accounts.find((a) => a.name === "Checking Account")!;
    const rentExpense = accounts.find((a) => a.name === "Rent Expense")!;

    // Create a transaction affecting both accounts
    const txnRes = await request.post("/.netlify/functions/transactions", {
      data: {
        date: "2023-10-26",
        description: "October Rent & Utilities Payment",
        currency: "USD",
        entries: [
          { account_id: checking.id, entry_type: "credit", amount: 1500 },
          { account_id: rentExpense.id, entry_type: "debit", amount: 1500 },
        ],
        tags: [],
      },
    });
    const txn = (await txnRes.json()) as { id: string };

    try {
      // Navigate to Checking Account detail page
      await page.goto("/accounts");
      await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });
      await page.getByTestId("category-content-assets")
        .locator(".account-card")
        .filter({ hasText: "Checking Account (Chase Bank)" })
        .click();
      await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });

      // Verify transaction appears in Checking Account transactions list
      const checkingTable = page.getByTestId("transactions-table");
      await expect(checkingTable).toBeVisible({ timeout: 10000 });
      const checkingRow = checkingTable.locator(`[data-testid="transaction-row-${txn.id}"]`);
      await expect(checkingRow).toBeVisible({ timeout: 10000 });
      await expect(checkingRow).toContainText("Oct 26, 2023");
      await expect(checkingRow).toContainText("October Rent & Utilities Payment");
      await expect(checkingRow).toContainText("$1,500.00");
      await expect(checkingRow).toContainText("Credit");

      // Navigate to Rent Expense detail page
      await page.goto("/accounts");
      await expect(page.getByTestId("category-section-expenses")).toBeVisible({ timeout: 30000 });
      await page.getByTestId("category-header-expenses").click();
      await expect(page.getByTestId("category-content-expenses")).toBeVisible({ timeout: 10000 });
      await page.getByTestId("category-content-expenses")
        .locator(".account-card")
        .filter({ hasText: "Rent Expense" })
        .click();
      await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });

      // Verify transaction appears in Rent Expense transactions list
      const rentTable = page.getByTestId("transactions-table");
      await expect(rentTable).toBeVisible({ timeout: 10000 });
      const rentRow = rentTable.locator(`[data-testid="transaction-row-${txn.id}"]`);
      await expect(rentRow).toBeVisible({ timeout: 10000 });
      await expect(rentRow).toContainText("Oct 26, 2023");
      await expect(rentRow).toContainText("October Rent & Utilities Payment");
      await expect(rentRow).toContainText("$1,500.00");
      await expect(rentRow).toContainText("Debit");
    } finally {
      await request.delete(`/.netlify/functions/transactions/${txn.id}`);
    }
  });

  test("NewTransactionModal opens in edit mode with pre-populated fields", async ({ page, request }) => {
    test.slow();

    // Get account data including codes
    const accountsRes = await request.get("/.netlify/functions/accounts");
    const accounts = (await accountsRes.json()) as Array<{ id: string; name: string; code: string | null }>;
    const checking = accounts.find((a) => a.name === "Checking Account")!;
    const rentExpense = accounts.find((a) => a.name === "Rent Expense")!;

    const checkingLabel = checking.code ? `${checking.name} (${checking.code})` : checking.name;
    const rentLabel = rentExpense.code ? `${rentExpense.name} (${rentExpense.code})` : rentExpense.name;

    // Create a transaction with all fields including tags
    const txnRes = await request.post("/.netlify/functions/transactions", {
      data: {
        date: "2023-11-10",
        description: "Edit Mode Verification Transaction",
        currency: "USD",
        entries: [
          { account_id: checking.id, entry_type: "credit", amount: 750 },
          { account_id: rentExpense.id, entry_type: "debit", amount: 750 },
        ],
        tags: ["Housing", "Recurring"],
      },
    });
    const txn = (await txnRes.json()) as { id: string };

    try {
      // Navigate to Checking Account detail page
      await page.goto("/accounts");
      await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });
      await page.getByTestId("category-content-assets")
        .locator(".account-card")
        .filter({ hasText: "Checking Account (Chase Bank)" })
        .click();
      await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });

      // Click View/Edit on the test transaction
      const table = page.getByTestId("transactions-table");
      await expect(table).toBeVisible({ timeout: 10000 });
      const row = table.locator(`[data-testid="transaction-row-${txn.id}"]`);
      await expect(row).toBeVisible({ timeout: 10000 });
      await row.locator(`[data-testid="transaction-view-edit-${txn.id}"]`).click();

      // Verify modal opens
      await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });

      // Verify date is pre-populated
      await expect(page.getByTestId("transaction-date")).toHaveValue("2023-11-10");

      // Verify description is pre-populated
      await expect(page.getByTestId("transaction-description")).toHaveValue("Edit Mode Verification Transaction");

      // Verify currency (SearchableSelect shows label when not focused)
      await expect(page.getByTestId("transaction-currency")).toHaveValue("USD ($)");

      // Verify line items are pre-populated with correct accounts, types, and amounts
      await expect(page.getByTestId("line-item-account-0")).toHaveValue(checkingLabel);
      await expect(page.getByTestId("line-item-type-0")).toHaveValue("Credit");
      await expect(page.getByTestId("line-item-amount-0")).toHaveValue("750");

      await expect(page.getByTestId("line-item-account-1")).toHaveValue(rentLabel);
      await expect(page.getByTestId("line-item-type-1")).toHaveValue("Debit");
      await expect(page.getByTestId("line-item-amount-1")).toHaveValue("750");

      // Verify tags are pre-populated
      await expect(page.getByTestId("tag-Housing")).toBeVisible();
      await expect(page.getByTestId("tag-Recurring")).toBeVisible();
    } finally {
      await request.delete(`/.netlify/functions/transactions/${txn.id}`);
    }
  });

  test("NewTransactionModal editing a transaction updates existing record", async ({ page, request }) => {
    test.slow();

    // Get account IDs
    const accountsRes = await request.get("/.netlify/functions/accounts");
    const accounts = (await accountsRes.json()) as Array<{ id: string; name: string }>;
    const checking = accounts.find((a) => a.name === "Checking Account")!;
    const rentExpense = accounts.find((a) => a.name === "Rent Expense")!;

    // Create a transaction to edit
    const txnRes = await request.post("/.netlify/functions/transactions", {
      data: {
        date: "2023-10-25",
        description: "Grocery Store",
        currency: "USD",
        entries: [
          { account_id: checking.id, entry_type: "debit", amount: 125.5 },
          { account_id: rentExpense.id, entry_type: "credit", amount: 125.5 },
        ],
        tags: [],
      },
    });
    const txn = (await txnRes.json()) as { id: string };

    try {
      // Navigate to Checking Account detail page
      await page.goto("/accounts");
      await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });
      await page.getByTestId("category-content-assets")
        .locator(".account-card")
        .filter({ hasText: "Checking Account (Chase Bank)" })
        .click();
      await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });

      // Click View/Edit on the test transaction
      const table = page.getByTestId("transactions-table");
      await expect(table).toBeVisible({ timeout: 10000 });
      const row = table.locator(`[data-testid="transaction-row-${txn.id}"]`);
      await expect(row).toBeVisible({ timeout: 10000 });
      await row.locator(`[data-testid="transaction-view-edit-${txn.id}"]`).click();

      // Modal opens in edit mode
      await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });

      // Change description from "Grocery Store" to "Grocery Store - Weekly"
      await page.getByTestId("transaction-description").clear();
      await page.getByTestId("transaction-description").fill("Grocery Store - Weekly");

      // Save the updated transaction
      await page.getByTestId("submit-transaction-btn").click();
      await expect(page.getByTestId("new-transaction-modal")).toHaveCount(0, { timeout: 30000 });

      // Verify updated description appears in the transaction list
      await expect(
        table.locator(`[data-testid="transaction-row-${txn.id}"]`)
      ).toContainText("Grocery Store - Weekly", { timeout: 10000 });

      // Verify no duplicate - only one row with our transaction ID exists
      await expect(
        table.locator(`[data-testid="transaction-row-${txn.id}"]`)
      ).toHaveCount(1);
    } finally {
      await request.delete(`/.netlify/functions/transactions/${txn.id}`);
    }
  });

  test("NewTransactionModal Cancel and Save buttons positioned at bottom right", async ({ page }) => {
    await openNewTransactionModal(page);

    // Verify modal footer is visible
    const footer = page.getByTestId("modal-footer");
    await expect(footer).toBeVisible();

    // Verify Cancel button with secondary/outline style
    const cancelBtn = page.getByTestId("cancel-transaction-btn");
    await expect(cancelBtn).toBeVisible();
    await expect(cancelBtn).toHaveText("Cancel");
    await expect(cancelBtn).toHaveClass(/btn--secondary/);

    // Verify Save Transaction button with primary/filled style
    const saveBtn = page.getByTestId("submit-transaction-btn");
    await expect(saveBtn).toBeVisible();
    await expect(saveBtn).toHaveText("Save Transaction");
    await expect(saveBtn).toHaveClass(/btn--primary/);

    // Verify buttons are positioned at bottom right (footer uses justify-content: flex-end)
    await expect(footer).toHaveClass(/modal-footer/);

    // Verify button order: Cancel on the left, Save Transaction on the right
    const cancelBox = await cancelBtn.boundingBox();
    const saveBox = await saveBtn.boundingBox();
    expect(cancelBox).toBeTruthy();
    expect(saveBox).toBeTruthy();
    expect(cancelBox!.x).toBeLessThan(saveBox!.x);
  });
});
