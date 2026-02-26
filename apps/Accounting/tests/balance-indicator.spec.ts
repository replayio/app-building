import { test, expect } from "@playwright/test";

async function openNewTransactionModal(page: import("@playwright/test").Page) {
  await page.goto("/accounts");
  await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });
  await page.getByTestId("navbar-new-transaction-btn").click();
  await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });
}

async function selectAccount(
  page: import("@playwright/test").Page,
  rowIndex: number,
  searchText: string,
  optionText: string
) {
  const accountInput = page.getByTestId(`line-item-account-${rowIndex}`);
  await accountInput.click();
  await accountInput.fill(searchText);
  await page
    .locator(".searchable-select-option")
    .filter({ hasText: optionText })
    .first()
    .click();
}

async function selectType(
  page: import("@playwright/test").Page,
  rowIndex: number,
  type: "Debit" | "Credit"
) {
  const typeInput = page.getByTestId(`line-item-type-${rowIndex}`);
  await typeInput.click();
  await page
    .getByTestId(`line-item-row-${rowIndex}`)
    .locator(".searchable-select-option")
    .filter({ hasText: type })
    .click();
}

test.describe("BalanceIndicator", () => {
  test("BalanceIndicator displays Total Debits sum", async ({ page }) => {
    await openNewTransactionModal(page);

    // Row 0: Rent Expense, Debit (default), $1,350.00
    await selectAccount(page, 0, "Rent", "Rent Expense");
    await page.getByTestId("line-item-amount-0").fill("1350");

    // Row 1: Utilities Expense, Debit (default), $150.00
    await selectAccount(page, 1, "Utilities", "Utilities Expense");
    await page.getByTestId("line-item-amount-1").fill("150");

    // Verify Total Debits shows "$1,500.00"
    await expect(page.getByTestId("total-debits")).toContainText("$1,500.00", {
      timeout: 5000,
    });
  });

  test("BalanceIndicator displays Total Credits sum", async ({ page }) => {
    await openNewTransactionModal(page);

    // Row 0: Checking Account, Credit, $1,500.00
    await selectAccount(page, 0, "Checking", "Checking Account");
    await selectType(page, 0, "Credit");
    await page.getByTestId("line-item-amount-0").fill("1500");

    // Verify Total Credits shows "$1,500.00"
    await expect(page.getByTestId("total-credits")).toContainText(
      "$1,500.00",
      { timeout: 5000 }
    );
  });

  test("BalanceIndicator shows balanced state when debits equal credits", async ({
    page,
  }) => {
    await openNewTransactionModal(page);

    // Row 0: Checking Account, Credit, $1,500.00
    await selectAccount(page, 0, "Checking", "Checking Account");
    await selectType(page, 0, "Credit");
    await page.getByTestId("line-item-amount-0").fill("1500");

    // Row 1: Rent Expense, Debit (default), $1,500.00
    await selectAccount(page, 1, "Rent", "Rent Expense");
    await page.getByTestId("line-item-amount-1").fill("1500");

    // Verify balanced indicator: green checkmark + "Transaction is Balanced"
    const balanceStatus = page.getByTestId("balance-status");
    await expect(balanceStatus).toContainText("Transaction is Balanced", {
      timeout: 5000,
    });
    await expect(balanceStatus).toHaveClass(/balance-status--balanced/);
  });

  test("BalanceIndicator shows unbalanced state when debits do not equal credits", async ({
    page,
  }) => {
    await openNewTransactionModal(page);

    // Row 0: Checking Account, Credit, $1,500.00
    await selectAccount(page, 0, "Checking", "Checking Account");
    await selectType(page, 0, "Credit");
    await page.getByTestId("line-item-amount-0").fill("1500");

    // Row 1: Rent Expense, Debit (default), $1,350.00 (creates $150 imbalance)
    await selectAccount(page, 1, "Rent", "Rent Expense");
    await page.getByTestId("line-item-amount-1").fill("1350");

    // Verify unbalanced indicator: warning icon + "Transaction is Unbalanced"
    const balanceStatus = page.getByTestId("balance-status");
    await expect(balanceStatus).toContainText("Transaction is Unbalanced", {
      timeout: 5000,
    });
    await expect(balanceStatus).toHaveClass(/balance-status--unbalanced/);
  });
});
