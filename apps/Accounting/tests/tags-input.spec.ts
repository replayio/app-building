import { test, expect } from "@playwright/test";

async function openNewTransactionModal(page: import("@playwright/test").Page) {
  await page.goto("/accounts");
  await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });
  await page.getByTestId("navbar-new-transaction-btn").click();
  await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });
}

test.describe("TagsInput", () => {
  test("TagsInput displays label with optional indicator", async ({ page }) => {
    await openNewTransactionModal(page);

    // Verify the TagsInput section is visible
    const tagsSection = page.getByTestId("tags-input-section");
    await expect(tagsSection).toBeVisible();

    // Verify the label "Tags / Categories" is displayed
    const label = tagsSection.locator(".form-label");
    await expect(label).toContainText("Tags / Categories");

    // Verify the "(optional)" indicator is displayed
    const optionalIndicator = tagsSection.locator(".form-label-optional");
    await expect(optionalIndicator).toBeVisible();
    await expect(optionalIndicator).toHaveText("(optional)");
  });

  test("TagsInput displays existing tags as removable chips", async ({ page, request }) => {
    // Get account IDs to create a transaction with tags
    const accountsRes = await request.get("/.netlify/functions/accounts");
    const accounts = (await accountsRes.json()) as Array<{ id: string; name: string }>;
    const checking = accounts.find((a) => a.name === "Checking Account")!;
    const rentExpense = accounts.find((a) => a.name === "Rent Expense")!;

    // Create a transaction with tags "Housing" and "Recurring"
    const txnRes = await request.post("/.netlify/functions/transactions", {
      data: {
        date: "2023-11-15",
        description: "Tags Chips Test Transaction",
        currency: "USD",
        entries: [
          { account_id: checking.id, entry_type: "credit", amount: 500 },
          { account_id: rentExpense.id, entry_type: "debit", amount: 500 },
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
        .filter({ hasText: "Checking Account" })
        .click();
      await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });

      // Click View/Edit on the test transaction
      const table = page.getByTestId("transactions-table");
      await expect(table).toBeVisible({ timeout: 10000 });
      const row = table.locator(`[data-testid="transaction-row-${txn.id}"]`);
      await expect(row).toBeVisible({ timeout: 10000 });
      await row.locator(`[data-testid="transaction-view-edit-${txn.id}"]`).click();

      // Verify modal opens in edit mode
      await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });

      // Verify "Housing" tag chip is displayed with remove button
      const housingTag = page.getByTestId("tag-Housing");
      await expect(housingTag).toBeVisible();
      await expect(housingTag).toContainText("Housing");
      await expect(page.getByTestId("tag-remove-Housing")).toBeVisible();

      // Verify "Recurring" tag chip is displayed with remove button
      const recurringTag = page.getByTestId("tag-Recurring");
      await expect(recurringTag).toBeVisible();
      await expect(recurringTag).toContainText("Recurring");
      await expect(page.getByTestId("tag-remove-Recurring")).toBeVisible();
    } finally {
      await request.delete(`/.netlify/functions/transactions/${txn.id}`);
    }
  });

  test("TagsInput add a new tag by typing", async ({ page }) => {
    await openNewTransactionModal(page);

    // Verify no tags exist initially
    const tagsContainer = page.getByTestId("tags-container");
    await expect(tagsContainer).toBeVisible();

    // Type "Housing" in the tags input and press Enter
    const tagsInput = page.getByTestId("tags-input");
    await tagsInput.click();
    await tagsInput.fill("Housing");
    await tagsInput.press("Enter");

    // Verify the "Housing" tag chip appears with a remove button
    await expect(page.getByTestId("tag-Housing")).toBeVisible();
    await expect(page.getByTestId("tag-Housing")).toContainText("Housing");
    await expect(page.getByTestId("tag-remove-Housing")).toBeVisible();

    // Verify the input is cleared
    await expect(tagsInput).toHaveValue("");
  });

  test("TagsInput allows adding multiple tags", async ({ page }) => {
    await openNewTransactionModal(page);

    const tagsInput = page.getByTestId("tags-input");

    // Add first tag: "Housing"
    await tagsInput.click();
    await tagsInput.fill("Housing");
    await tagsInput.press("Enter");
    await expect(page.getByTestId("tag-Housing")).toBeVisible();

    // Add second tag: "Recurring"
    await tagsInput.fill("Recurring");
    await tagsInput.press("Enter");
    await expect(page.getByTestId("tag-Recurring")).toBeVisible();

    // Add third tag: "October"
    await tagsInput.fill("October");
    await tagsInput.press("Enter");
    await expect(page.getByTestId("tag-October")).toBeVisible();

    // Verify all three tag chips are displayed with remove buttons
    await expect(page.getByTestId("tag-Housing")).toContainText("Housing");
    await expect(page.getByTestId("tag-remove-Housing")).toBeVisible();
    await expect(page.getByTestId("tag-Recurring")).toContainText("Recurring");
    await expect(page.getByTestId("tag-remove-Recurring")).toBeVisible();
    await expect(page.getByTestId("tag-October")).toContainText("October");
    await expect(page.getByTestId("tag-remove-October")).toBeVisible();

    // Verify input is cleared after each tag addition
    await expect(tagsInput).toHaveValue("");
  });

  test("TagsInput remove a tag by clicking X", async ({ page, request }) => {
    // Get account IDs to create a transaction with tags
    const accountsRes = await request.get("/.netlify/functions/accounts");
    const accounts = (await accountsRes.json()) as Array<{ id: string; name: string }>;
    const checking = accounts.find((a) => a.name === "Checking Account")!;
    const rentExpense = accounts.find((a) => a.name === "Rent Expense")!;

    // Create a transaction with tags "Housing" and "Recurring"
    const txnRes = await request.post("/.netlify/functions/transactions", {
      data: {
        date: "2023-11-16",
        description: "Tags Remove Test Transaction",
        currency: "USD",
        entries: [
          { account_id: checking.id, entry_type: "credit", amount: 600 },
          { account_id: rentExpense.id, entry_type: "debit", amount: 600 },
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
        .filter({ hasText: "Checking Account" })
        .click();
      await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });

      // Click View/Edit on the test transaction
      const table = page.getByTestId("transactions-table");
      await expect(table).toBeVisible({ timeout: 10000 });
      const row = table.locator(`[data-testid="transaction-row-${txn.id}"]`);
      await expect(row).toBeVisible({ timeout: 10000 });
      await row.locator(`[data-testid="transaction-view-edit-${txn.id}"]`).click();

      // Verify modal opens with both tags
      await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId("tag-Housing")).toBeVisible();
      await expect(page.getByTestId("tag-Recurring")).toBeVisible();

      // Click the × button on the "Housing" tag
      await page.getByTestId("tag-remove-Housing").click();

      // Verify "Housing" tag is removed
      await expect(page.getByTestId("tag-Housing")).toHaveCount(0, { timeout: 10000 });

      // Verify "Recurring" tag still remains
      await expect(page.getByTestId("tag-Recurring")).toBeVisible();
    } finally {
      await request.delete(`/.netlify/functions/transactions/${txn.id}`);
    }
  });

  test("TagsInput field is optional and transaction saves without tags", async ({
    page,
  }) => {
    test.slow();
    await openNewTransactionModal(page);

    // Fill in required fields: description
    await page.getByTestId("transaction-description").fill("No Tags Transaction Test");

    // Fill in balanced line items
    // Row 0: Checking Account, Credit, $500
    const account0 = page.getByTestId("line-item-account-0");
    await account0.click();
    await account0.fill("Checking");
    await page
      .locator(".searchable-select-option")
      .filter({ hasText: "Checking Account" })
      .first()
      .click();
    const type0 = page.getByTestId("line-item-type-0");
    await type0.click();
    await page
      .getByTestId("line-item-row-0")
      .locator(".searchable-select-option")
      .filter({ hasText: "Credit" })
      .click();
    await page.getByTestId("line-item-amount-0").fill("500");

    // Row 1: Rent Expense, Debit, $500
    const account1 = page.getByTestId("line-item-account-1");
    await account1.click();
    await account1.fill("Rent");
    await page
      .locator(".searchable-select-option")
      .filter({ hasText: "Rent Expense" })
      .first()
      .click();
    await page.getByTestId("line-item-amount-1").fill("500");

    // Verify no tags are present
    await expect(page.getByTestId("tags-container").locator(".tag")).toHaveCount(0);

    // Verify transaction is balanced
    await expect(page.getByTestId("balance-status")).toContainText(
      "Transaction is Balanced",
      { timeout: 5000 }
    );

    // Click "Save Transaction"
    await page.getByTestId("submit-transaction-btn").click();

    // Verify modal closes (transaction saved successfully)
    await expect(page.getByTestId("new-transaction-modal")).toHaveCount(0, {
      timeout: 30000,
    });
  });

  test("TagsInput tags are persisted with saved transaction", async ({
    page,
  }) => {
    test.slow();
    await openNewTransactionModal(page);

    // Fill in required fields: description
    await page
      .getByTestId("transaction-description")
      .fill("Tags Persist Test Transaction");

    // Fill in balanced line items
    // Row 0: Checking Account, Credit, $750
    const account0 = page.getByTestId("line-item-account-0");
    await account0.click();
    await account0.fill("Checking");
    await page
      .locator(".searchable-select-option")
      .filter({ hasText: "Checking Account" })
      .first()
      .click();
    const type0 = page.getByTestId("line-item-type-0");
    await type0.click();
    await page
      .getByTestId("line-item-row-0")
      .locator(".searchable-select-option")
      .filter({ hasText: "Credit" })
      .click();
    await page.getByTestId("line-item-amount-0").fill("750");

    // Row 1: Rent Expense, Debit, $750
    const account1 = page.getByTestId("line-item-account-1");
    await account1.click();
    await account1.fill("Rent");
    await page
      .locator(".searchable-select-option")
      .filter({ hasText: "Rent Expense" })
      .first()
      .click();
    await page.getByTestId("line-item-amount-1").fill("750");

    // Add tags "Housing" and "Recurring"
    const tagsInput = page.getByTestId("tags-input");
    await tagsInput.fill("Housing");
    await tagsInput.press("Enter");
    await expect(page.getByTestId("tag-Housing")).toBeVisible();
    await tagsInput.fill("Recurring");
    await tagsInput.press("Enter");
    await expect(page.getByTestId("tag-Recurring")).toBeVisible();

    // Verify transaction is balanced
    await expect(page.getByTestId("balance-status")).toContainText(
      "Transaction is Balanced",
      { timeout: 5000 }
    );

    // Click "Save Transaction"
    await page.getByTestId("submit-transaction-btn").click();

    // Verify modal closes
    await expect(page.getByTestId("new-transaction-modal")).toHaveCount(0, {
      timeout: 30000,
    });

    // Navigate to Checking Account detail page to find the saved transaction
    await expect(page.getByTestId("category-content-assets")).toBeVisible({
      timeout: 30000,
    });
    await page
      .getByTestId("category-content-assets")
      .locator(".account-card")
      .filter({ hasText: "Checking Account" })
      .click();
    await expect(page.getByTestId("account-detail-page")).toBeVisible({
      timeout: 30000,
    });

    // Find the transaction row by description and click View/Edit
    const table = page.getByTestId("transactions-table");
    await expect(table).toBeVisible({ timeout: 10000 });
    const row = table
      .locator("tr")
      .filter({ hasText: "Tags Persist Test Transaction" });
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.locator('[data-testid^="transaction-view-edit-"]').click();

    // Verify modal opens in edit mode with persisted tags
    await expect(page.getByTestId("new-transaction-modal")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("tag-Housing")).toBeVisible();
    await expect(page.getByTestId("tag-Housing")).toContainText("Housing");
    await expect(page.getByTestId("tag-Recurring")).toBeVisible();
    await expect(page.getByTestId("tag-Recurring")).toContainText("Recurring");
  });
});
