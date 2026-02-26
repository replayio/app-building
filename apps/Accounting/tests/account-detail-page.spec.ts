import { test, expect } from "@playwright/test";

async function navigateToCheckingAccount(page: import("@playwright/test").Page) {
  await page.goto("/accounts");
  await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });
  const assetsContent = page.getByTestId("category-content-assets");
  const card = assetsContent.locator(".account-card").filter({
    hasText: "Checking Account (Chase Bank)",
  });
  await card.click();
  await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });
}

test.describe("AccountHeader", () => {
  test("AccountHeader displays account name", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await expect(page.getByTestId("account-header-name")).toHaveText("Account: Checking Account");
  });

  test("AccountHeader displays category label", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await expect(page.getByTestId("account-header-category")).toHaveText("Category: Asset");
  });

  test("AccountHeader displays breadcrumb navigation", async ({ page }) => {
    await navigateToCheckingAccount(page);
    const breadcrumb = page.getByTestId("breadcrumb");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText("Page");
    await expect(breadcrumb).toContainText("AccountDetailPage");

    // Click the breadcrumb "Page" link to navigate back to AccountsPage
    await breadcrumb.locator("a").first().click();
    await expect(page).toHaveURL(/\/accounts$/, { timeout: 10000 });
    await expect(page.getByTestId("accounts-page")).toBeVisible({ timeout: 30000 });
  });

  test("AccountHeader New Transaction button opens NewTransactionModal", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await page.getByTestId("account-new-transaction-btn").click();
    await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });
  });

  test("AccountHeader search bar filters transactions", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 10000 });

    // Type "Grocery" in search bar
    await page.getByTestId("account-search-input").fill("Grocery");

    // Verify only matching transactions are shown
    const table = page.getByTestId("transactions-table");
    await expect(table.locator("tbody tr").filter({ hasText: "Grocery Store" })).toBeVisible();
    await expect(table.locator("tbody tr").filter({ hasText: "Salary Deposit" })).toHaveCount(0, { timeout: 5000 });
    await expect(table.locator("tbody tr").filter({ hasText: "Electric Bill" })).toHaveCount(0, { timeout: 5000 });
  });

  test("AccountHeader search bar clears and restores all transactions", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 10000 });

    // Filter first
    await page.getByTestId("account-search-input").fill("Grocery");
    await expect(
      page.getByTestId("transactions-table").locator("tbody tr").filter({ hasText: "Salary Deposit" })
    ).toHaveCount(0, { timeout: 5000 });

    // Clear search
    await page.getByTestId("account-search-clear").click();

    // Verify all transactions restored
    const table = page.getByTestId("transactions-table");
    await expect(table.locator("tbody tr").filter({ hasText: "Grocery Store" })).toBeVisible();
    await expect(table.locator("tbody tr").filter({ hasText: "Salary Deposit" })).toBeVisible();
    await expect(table.locator("tbody tr").filter({ hasText: "Electric Bill" })).toBeVisible();
  });
});

test.describe("BudgetOverview", () => {
  test("BudgetOverview displays section heading", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await expect(page.getByTestId("budget-overview-title")).toHaveText("Budget Overview");
  });

  test("BudgetOverview displays actual and budgeted amounts", async ({ page }) => {
    await navigateToCheckingAccount(page);
    const amounts = page.getByTestId("budget-overview-amounts");
    await expect(amounts).toContainText("Actual:");
    await expect(amounts).toContainText("Budgeted:");
    await expect(amounts).toContainText("$10,000.00");
    await expect(amounts).toContainText("$12,500.00");
  });

  test("BudgetOverview displays percentage used", async ({ page }) => {
    await navigateToCheckingAccount(page);
    // 10000/12500 = 80%
    await expect(page.getByTestId("budget-overview-pct")).toHaveText("80% used");
  });

  test("BudgetOverview displays progress bar", async ({ page }) => {
    await navigateToCheckingAccount(page);
    const bar = page.getByTestId("budget-overview-bar");
    await expect(bar).toBeVisible();
    const fill = bar.locator(".budget-overview-bar-fill");
    await expect(fill).toBeVisible();
  });

  test("BudgetOverview progress bar color changes when budget is nearly exceeded", async ({ page }) => {
    // Checking Account: 10000/12500 = 80%, triggers warning class (>= 80 && < 100)
    await navigateToCheckingAccount(page);
    const bar = page.getByTestId("budget-overview-bar");
    const fill = bar.locator(".budget-overview-bar-fill");
    await expect(fill).toBeVisible();
    await expect(fill).toHaveClass(/budget-overview-bar-fill--warning/);
  });

  test("BudgetOverview progress bar for under-budget account", async ({ page }) => {
    // Navigate to Credit Card (3500/5000 = 70%, normal state)
    await page.goto("/accounts");
    await expect(page.getByTestId("category-content-liabilities")).toBeVisible({ timeout: 30000 });
    const liabilitiesContent = page.getByTestId("category-content-liabilities");
    const creditCard = liabilitiesContent.locator(".account-card").filter({
      hasText: "Credit Card (Visa)",
    });
    await creditCard.click();
    await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });

    // Verify percentage reflects under-budget usage
    await expect(page.getByTestId("budget-overview-pct")).toHaveText("70% used");

    // Verify bar color is normal (no warning/over class)
    const bar = page.getByTestId("budget-overview-bar");
    const fill = bar.locator(".budget-overview-bar-fill");
    await expect(fill).toBeVisible();
    await expect(fill).not.toHaveClass(/budget-overview-bar-fill--warning/);
    await expect(fill).not.toHaveClass(/budget-overview-bar-fill--over/);
  });
});

test.describe("TransactionsTab", () => {
  test("TransactionsTab is active by default", async ({ page }) => {
    await navigateToCheckingAccount(page);
    const transactionsTab = page.getByTestId("tab-transactions");
    const budgetTab = page.getByTestId("tab-budget-details");
    await expect(transactionsTab).toBeVisible();
    await expect(budgetTab).toBeVisible();
    await expect(transactionsTab).toHaveClass(/tab--active/);
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 10000 });
  });

  test("TransactionsTab displays table with correct column headers", async ({ page }) => {
    await navigateToCheckingAccount(page);
    const table = page.getByTestId("transactions-table");
    await expect(table).toBeVisible({ timeout: 10000 });
    const headers = table.locator("th");
    await expect(headers.nth(0)).toHaveText("Date");
    await expect(headers.nth(1)).toHaveText("Description");
    await expect(headers.nth(2)).toHaveText("Amount");
    await expect(headers.nth(3)).toHaveText("Direction");
    await expect(headers.nth(4)).toHaveText("Actions");
  });

  test("TransactionsTab displays transaction rows with correct data", async ({ page }) => {
    await navigateToCheckingAccount(page);
    const table = page.getByTestId("transactions-table");
    await expect(table).toBeVisible({ timeout: 10000 });
    const rows = table.locator("tbody tr");

    // Row 1: Grocery Store (Oct 25, 2023) - most recent first
    const groceryRow = rows.filter({ hasText: "Grocery Store" });
    await expect(groceryRow).toBeVisible();
    await expect(groceryRow).toContainText("Oct 25, 2023");
    await expect(groceryRow).toContainText("$125.50");
    await expect(groceryRow).toContainText("Debit");

    // Row 2: Salary Deposit (Oct 24, 2023)
    const salaryRow = rows.filter({ hasText: "Salary Deposit" });
    await expect(salaryRow).toBeVisible();
    await expect(salaryRow).toContainText("Oct 24, 2023");
    await expect(salaryRow).toContainText("$3,200.00");
    await expect(salaryRow).toContainText("Credit");

    // Row 3: Electric Bill (Oct 22, 2023)
    const electricRow = rows.filter({ hasText: "Electric Bill" });
    await expect(electricRow).toBeVisible();
    await expect(electricRow).toContainText("Oct 22, 2023");
    await expect(electricRow).toContainText("$85.00");
    await expect(electricRow).toContainText("Debit");
  });

  test("TransactionsTab View/Edit link opens transaction details", async ({ page }) => {
    await navigateToCheckingAccount(page);
    const table = page.getByTestId("transactions-table");
    await expect(table).toBeVisible({ timeout: 10000 });

    // Find the Grocery Store row and click View/Edit
    const groceryRow = table.locator("tbody tr").filter({ hasText: "Grocery Store" });
    await groceryRow.locator("button.transaction-action-link").click();

    // Verify modal opens with pre-populated data
    await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("transaction-description")).toHaveValue("Grocery Store");
    await expect(page.getByTestId("transaction-date")).toHaveValue("2023-10-25");

    // Verify line items are pre-populated with correct accounts, types, and amounts
    await expect(page.getByTestId("line-item-account-0")).toHaveValue("Checking Account (1001)");
    await expect(page.getByTestId("line-item-type-0")).toHaveValue("Debit");
    await expect(page.getByTestId("line-item-amount-0")).toHaveValue("125.5");

    await expect(page.getByTestId("line-item-account-1")).toHaveValue("Operating Expenses (5001)");
    await expect(page.getByTestId("line-item-type-1")).toHaveValue("Credit");
    await expect(page.getByTestId("line-item-amount-1")).toHaveValue("125.5");
  });

  test("TransactionsTab View/Edit link for credit transaction", async ({ page }) => {
    await navigateToCheckingAccount(page);
    const table = page.getByTestId("transactions-table");
    await expect(table).toBeVisible({ timeout: 10000 });

    // Find the Salary Deposit row and click View/Edit
    const salaryRow = table.locator("tbody tr").filter({ hasText: "Salary Deposit" });
    await salaryRow.locator("button.transaction-action-link").click();

    // Verify modal opens with pre-populated data
    await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("transaction-description")).toHaveValue("Salary Deposit");
    await expect(page.getByTestId("transaction-date")).toHaveValue("2023-10-24");

    // Verify line items are pre-populated with correct accounts, types, and amounts
    await expect(page.getByTestId("line-item-account-0")).toHaveValue("Checking Account (1001)");
    await expect(page.getByTestId("line-item-type-0")).toHaveValue("Credit");
    await expect(page.getByTestId("line-item-amount-0")).toHaveValue("3200");

    await expect(page.getByTestId("line-item-account-1")).toHaveValue("Service Revenue (4001)");
    await expect(page.getByTestId("line-item-type-1")).toHaveValue("Debit");
    await expect(page.getByTestId("line-item-amount-1")).toHaveValue("3200");
  });

  test("TransactionsTab switching to Budget Details tab", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 10000 });

    // Click Budget Details tab
    await page.getByTestId("tab-budget-details").click();

    // Verify Budget Details tab is active
    await expect(page.getByTestId("tab-budget-details")).toHaveClass(/tab--active/);
    await expect(page.getByTestId("tab-transactions")).not.toHaveClass(/tab--active/);

    // Transactions table should be hidden
    await expect(page.getByTestId("transactions-table")).toHaveCount(0);
  });

  test("TransactionsTab switching back from Budget Details", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 10000 });

    // Switch to Budget Details
    await page.getByTestId("tab-budget-details").click();
    await expect(page.getByTestId("tab-budget-details")).toHaveClass(/tab--active/);

    // Switch back to Transactions
    await page.getByTestId("tab-transactions").click();

    // Verify Transactions tab is active again
    await expect(page.getByTestId("tab-transactions")).toHaveClass(/tab--active/);
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 10000 });
  });

  test("TransactionsTab displays debit direction styling", async ({ page }) => {
    await navigateToCheckingAccount(page);
    const table = page.getByTestId("transactions-table");
    await expect(table).toBeVisible({ timeout: 10000 });

    // Find the Grocery Store row (debit)
    const groceryRow = table.locator("tbody tr").filter({ hasText: "Grocery Store" });
    const direction = groceryRow.locator("span.transaction-direction");
    await expect(direction).toHaveText("Debit");
  });

  test("TransactionsTab displays credit direction styling", async ({ page }) => {
    await navigateToCheckingAccount(page);
    const table = page.getByTestId("transactions-table");
    await expect(table).toBeVisible({ timeout: 10000 });

    // Find the Salary Deposit row (credit)
    const salaryRow = table.locator("tbody tr").filter({ hasText: "Salary Deposit" });
    const direction = salaryRow.locator("span.transaction-direction");
    await expect(direction).toHaveText("Credit");
  });

  test("TransactionsTab empty state when no transactions exist", async ({ page }) => {
    // Navigate to an account with no transactions (Investment Portfolio)
    await page.goto("/accounts");
    await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });
    const assetsContent = page.getByTestId("category-content-assets");
    const investmentCard = assetsContent.locator(".account-card").filter({
      hasText: "Investment Portfolio (Vanguard)",
    });
    await investmentCard.click();
    await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });

    // Verify empty state
    await expect(page.getByTestId("transactions-empty")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("transactions-empty")).toHaveText("No transactions found");
  });
});

test.describe("BudgetDetailsTab", () => {
  test("BudgetDetailsTab displays budget line items", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await page.getByTestId("tab-budget-details").click();

    const list = page.getByTestId("budget-details-list");
    await expect(list).toBeVisible({ timeout: 10000 });

    // Verify Rent line item
    const rentItem = list.locator('[data-testid^="budget-detail-item-"]').filter({ hasText: "Rent" });
    await expect(rentItem).toBeVisible();
    await expect(rentItem.locator('[data-testid^="budget-detail-amounts-"]')).toContainText(
      "$1,500.00 / $1,500.00"
    );

    // Verify Utilities line item
    const utilitiesItem = list.locator('[data-testid^="budget-detail-item-"]').filter({ hasText: "Utilities" });
    await expect(utilitiesItem).toBeVisible();
    await expect(utilitiesItem.locator('[data-testid^="budget-detail-amounts-"]')).toContainText("$200.00 / $250.00");
  });

  test("BudgetDetailsTab displays progress bar for each line item", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await page.getByTestId("tab-budget-details").click();

    const list = page.getByTestId("budget-details-list");
    await expect(list).toBeVisible({ timeout: 10000 });

    // Rent: $1,500/$1,500 = 100% → fully filled
    const rentItem = list.locator('[data-testid^="budget-detail-item-"]').filter({ hasText: "Rent" });
    const rentBar = rentItem.locator('[data-testid^="budget-detail-bar-"]');
    await expect(rentBar).toBeVisible();

    // Utilities: $200/$250 = 80%
    const utilitiesItem = list.locator('[data-testid^="budget-detail-item-"]').filter({ hasText: "Utilities" });
    const utilitiesBar = utilitiesItem.locator('[data-testid^="budget-detail-bar-"]');
    await expect(utilitiesBar).toBeVisible();
  });

  test("BudgetDetailsTab progress bar indicates over-budget items", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await page.getByTestId("tab-budget-details").click();

    const list = page.getByTestId("budget-details-list");
    await expect(list).toBeVisible({ timeout: 10000 });

    // Progress: $700/$100 → over budget (700%)
    const progressItem = list.locator('[data-testid^="budget-detail-item-"]').filter({ hasText: "Progress" });
    await expect(progressItem).toBeVisible();
    await expect(progressItem.locator('[data-testid^="budget-detail-amounts-"]')).toContainText(
      "$700.00 / $100.00"
    );
    const progressBar = progressItem.locator('[data-testid^="budget-detail-bar-"]');
    await expect(progressBar).toHaveClass(/budget-detail-bar-fill--over/);
  });

  test("BudgetDetailsTab shows all budget categories for account", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await page.getByTestId("tab-budget-details").click();

    const list = page.getByTestId("budget-details-list");
    await expect(list).toBeVisible({ timeout: 10000 });

    // Verify all 3 budget items are listed
    await expect(
      list.locator('[data-testid^="budget-detail-item-"]').filter({ hasText: "Rent" })
    ).toBeVisible();
    await expect(
      list.locator('[data-testid^="budget-detail-item-"]').filter({ hasText: "Utilities" })
    ).toBeVisible();
    await expect(
      list.locator('[data-testid^="budget-detail-item-"]').filter({ hasText: "Progress" })
    ).toBeVisible();
  });

  test("BudgetDetailsTab item amounts reflect transaction data", async ({ page, request }) => {
    test.slow();

    // Get account IDs via API
    const accountsRes = await request.get("/.netlify/functions/accounts");
    const accounts = (await accountsRes.json()) as Array<{ id: string; name: string }>;
    const checking = accounts.find((a) => a.name === "Checking Account")!;
    const opex = accounts.find((a) => a.name === "Operating Expenses")!;

    // Create a $50 debit transaction tagged "Utilities"
    const txnRes = await request.post("/.netlify/functions/transactions", {
      data: {
        date: "2023-11-01",
        description: "Utilities Payment",
        currency: "USD",
        entries: [
          { account_id: checking.id, entry_type: "debit", amount: 50 },
          { account_id: opex.id, entry_type: "credit", amount: 50 },
        ],
        tags: ["Utilities"],
      },
    });
    const txn = (await txnRes.json()) as { id: string };

    try {
      // Navigate to account detail page
      await navigateToCheckingAccount(page);

      // Click Budget Details tab
      await page.getByTestId("tab-budget-details").click();

      const list = page.getByTestId("budget-details-list");
      await expect(list).toBeVisible({ timeout: 10000 });

      // Verify Utilities amount increased from $200 to $250
      const utilitiesItem = list.locator('[data-testid^="budget-detail-item-"]').filter({ hasText: "Utilities" });
      await expect(utilitiesItem.locator('[data-testid^="budget-detail-amounts-"]')).toContainText(
        "$250.00 / $250.00"
      );

      // Verify Budget Overview also updated (budget_actual increased by $50)
      await expect(page.getByTestId("budget-overview-amounts")).toContainText("$10,050.00");
    } finally {
      // Clean up: delete the transaction to restore database state
      await request.delete(`/.netlify/functions/transactions/${txn.id}`);
    }
  });

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

test.describe("ReportingLinks", () => {
  test("ReportingLinks displays section heading", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await expect(page.getByTestId("reporting-links-title")).toHaveText("Reporting");
  });

  test("ReportingLinks displays Actual vs Budget Report link", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await expect(page.getByTestId("reporting-link-budget")).toBeVisible();
    await expect(page.getByTestId("reporting-link-budget")).toContainText("Actual vs Budget Report");
  });

  test("ReportingLinks Actual vs Budget Report link navigates to report", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await page.getByTestId("reporting-link-budget").click();

    // Verify CreateReportDialog opens with Budget vs Actual type pre-selected
    await expect(page.getByTestId("create-report-dialog")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("report-type-budget_vs_actual")).toHaveClass(/report-type-tab--active/);
  });

  test("ReportingLinks displays Transaction History Report link", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await expect(page.getByTestId("reporting-link-history")).toBeVisible();
    await expect(page.getByTestId("reporting-link-history")).toContainText("Transaction History Report");
  });

  test("ReportingLinks Transaction History Report link navigates to report", async ({ page }) => {
    await navigateToCheckingAccount(page);
    await page.getByTestId("reporting-link-history").click();

    // Verify CreateReportDialog opens with Detailed Transactions type pre-selected
    await expect(page.getByTestId("create-report-dialog")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("report-type-detailed")).toHaveClass(/report-type-tab--active/);
  });
});
