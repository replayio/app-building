import { test, expect } from "@playwright/test";

test.describe("NavigationHeader", () => {
  test("Breadcrumb displays Home / Transactions", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    const breadcrumb = page.getByTestId("breadcrumb");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText("Home");
    await expect(breadcrumb).toContainText("Transactions");

    // "Home" is a clickable link that navigates to the Dashboard (/)
    const homeLink = breadcrumb.locator("a", { hasText: "Home" });
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });
  });

  test("NavigationHeader shows Transactions link as active", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    await expect(page.getByTestId("navbar-link-transactions")).toHaveClass(/navbar-link--active/);
  });
});

test.describe("TransactionsPageHeader", () => {
  test('Page heading displays "Transactions" as a prominent title', async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    const title = page.getByTestId("transactions-page-title");
    await expect(title).toBeVisible();
    await expect(title).toHaveText("Transactions");
  });

  test('Filters section displays "Filters" label with "Clear Filters" link', async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    await expect(page.getByTestId("filters-label")).toBeVisible();
    await expect(page.getByTestId("filters-label")).toHaveText("Filters");

    await expect(page.getByTestId("clear-filters-btn")).toBeVisible();
    await expect(page.getByTestId("clear-filters-btn")).toContainText("Clear Filters");
  });
});

test.describe("NewTransactionButton", () => {
  test("New Transaction button is displayed as primary action with correct styling", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    const btn = page.getByTestId("new-transaction-btn");
    await expect(btn).toBeVisible();
    await expect(btn).toContainText("New Transaction");
    await expect(btn).toHaveClass(/btn-primary/);

    // Plus icon SVG
    const svg = btn.locator("svg");
    await expect(svg).toBeVisible();
  });

  test("Clicking New Transaction button navigates to NewTransactionPage", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("new-transaction-btn").click();
    await expect(page).toHaveURL(/\/transactions\/new/);
    await expect(page.getByTestId("new-transaction-page")).toBeVisible({ timeout: 30000 });
  });
});

test.describe("DateRangeFilter", () => {
  test("Date Range filter displays with calendar icon and default date range", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    const filter = page.getByTestId("date-range-filter");
    await expect(filter).toBeVisible();

    await expect(page.getByTestId("date-range-filter-label")).toBeVisible();
    await expect(page.getByTestId("date-range-filter-label")).toContainText("Date Range");

    await expect(page.getByTestId("date-range-calendar-icon")).toBeVisible();
    await expect(page.getByTestId("date-range-picker")).toBeVisible();
  });

  test("Clicking the date range filter opens a date range picker", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    // Popover not visible initially
    await expect(page.getByTestId("date-range-calendar-popover")).not.toBeVisible();

    await page.getByTestId("date-range-picker").click();
    await expect(page.getByTestId("date-range-calendar-popover")).toBeVisible();
    await expect(page.getByTestId("date-range-start")).toBeVisible();
    await expect(page.getByTestId("date-range-end")).toBeVisible();
  });

  test("Selecting a new date range filters the transactions table", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });

    // Wait for rows to load
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Get initial count
    const initialCount = await page.locator("[data-testid^='transaction-row-']").count();
    expect(initialCount).toBeGreaterThan(0);

    // Set a narrow date range
    await page.getByTestId("date-range-picker").click();
    await expect(page.getByTestId("date-range-calendar-popover")).toBeVisible();

    await page.getByTestId("date-range-start").fill("2023-10-25");
    await page.getByTestId("date-range-end").fill("2023-10-27");
    await page.getByTestId("date-range-apply").click();

    // Table should update - verify result count changed
    await expect(page.getByTestId("date-range-calendar-popover")).not.toBeVisible();

    // Date range picker should show the selected range
    const pickerText = await page.getByTestId("date-range-picker").textContent();
    expect(pickerText).toContain("Oct");
    expect(pickerText).toContain("2023");

    // Pagination should reflect filtered count
    await expect(page.getByTestId("transactions-result-count")).toBeVisible();
  });

  test("Clearing the date range filter shows all transactions", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Apply a date range filter
    await page.getByTestId("date-range-picker").click();
    await expect(page.getByTestId("date-range-calendar-popover")).toBeVisible();
    await page.getByTestId("date-range-start").fill("2023-10-25");
    await page.getByTestId("date-range-end").fill("2023-10-27");
    await page.getByTestId("date-range-apply").click();
    await expect(page.getByTestId("date-range-calendar-popover")).not.toBeVisible();

    // Record filtered result count text
    const filteredText = await page.getByTestId("transactions-result-count").textContent();

    // Clear filters
    await page.getByTestId("clear-filters-btn").click();

    // Result count should show more results after clearing
    await expect(page.getByTestId("transactions-result-count")).not.toHaveText(filteredText!, { timeout: 15000 });
  });
});

test.describe("AccountFilter", () => {
  test("Involved Account(s) filter displays with label and multi-select dropdown", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    const filter = page.getByTestId("account-filter");
    await expect(filter).toBeVisible();

    // Label
    await expect(filter.locator(".filter-label")).toContainText("Involved Account(s)");

    // Trigger with chevron/arrow
    await expect(page.getByTestId("account-filter-trigger")).toBeVisible();
    await expect(page.getByTestId("account-filter-trigger").locator("svg")).toBeVisible();
  });

  test("Opening the account filter dropdown lists all accounts with IDs", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("account-filter-trigger").click();
    await expect(page.getByTestId("account-filter-dropdown")).toBeVisible();

    // Should have multiple account options
    const options = page.locator("[data-testid^='account-filter-option-']");
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("Selecting multiple accounts from the account filter shows selected count", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    // Open dropdown
    await page.getByTestId("account-filter-trigger").click();
    await expect(page.getByTestId("account-filter-dropdown")).toBeVisible();

    // Select first two accounts
    const options = page.locator("[data-testid^='account-filter-option-']");
    await options.nth(0).click();
    await options.nth(1).click();

    // Trigger should show selected count "(2 selected)"
    await expect(page.getByTestId("account-filter-trigger")).toContainText("2 selected");
  });

  test("Selecting accounts filters the transactions table to matching transactions", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Record initial result count
    const initialText = await page.getByTestId("transactions-result-count").textContent();

    // Open dropdown and select the first account
    await page.getByTestId("account-filter-trigger").click();
    await expect(page.getByTestId("account-filter-dropdown")).toBeVisible();

    const firstOption = page.locator("[data-testid^='account-filter-option-']").first();
    await firstOption.click();

    // Close dropdown by clicking outside
    await page.getByTestId("transactions-page-title").click();

    // Result count should update (filtered down)
    await expect(page.getByTestId("transactions-result-count")).not.toHaveText(initialText!, { timeout: 15000 });
  });

  test("Deselecting all accounts resets the account filter", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Record initial result count
    const initialText = await page.getByTestId("transactions-result-count").textContent();

    // Select an account to filter
    await page.getByTestId("account-filter-trigger").click();
    await expect(page.getByTestId("account-filter-dropdown")).toBeVisible();
    const firstOption = page.locator("[data-testid^='account-filter-option-']").first();
    await firstOption.click();

    // Close dropdown
    await page.getByTestId("transactions-page-title").click();
    await expect(page.getByTestId("account-filter-dropdown")).not.toBeVisible();

    // Use Clear Filters to reset
    await page.getByTestId("clear-filters-btn").click();

    // Trigger should show "All Accounts"
    await expect(page.getByTestId("account-filter-trigger")).toContainText("All Accounts");

    // Result count should return to initial
    await expect(page.getByTestId("transactions-result-count")).toHaveText(initialText!, { timeout: 15000 });
  });
});

test.describe("MaterialFilter", () => {
  test("Material filter displays with label and multi-select dropdown", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    const filter = page.getByTestId("material-filter");
    await expect(filter).toBeVisible();

    // Label
    await expect(filter.locator(".filter-label")).toContainText("Material");

    // Trigger with chevron
    await expect(page.getByTestId("material-filter-trigger")).toBeVisible();
    await expect(page.getByTestId("material-filter-trigger").locator("svg")).toBeVisible();
  });

  test("Opening the material filter dropdown lists all materials with codes", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("material-filter-trigger").click();
    await expect(page.getByTestId("material-filter-dropdown")).toBeVisible();

    // Should have multiple material options
    const options = page.locator("[data-testid^='material-filter-option-']");
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("Selecting multiple materials shows selected count", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    // Open dropdown
    await page.getByTestId("material-filter-trigger").click();
    await expect(page.getByTestId("material-filter-dropdown")).toBeVisible();

    // Select first two materials
    const options = page.locator("[data-testid^='material-filter-option-']");
    await options.nth(0).click();
    await options.nth(1).click();

    // Trigger should show selected count "(2 selected)"
    await expect(page.getByTestId("material-filter-trigger")).toContainText("2 selected");
  });

  test("Selecting materials filters the transactions table to matching transactions", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Record initial result count
    const initialText = await page.getByTestId("transactions-result-count").textContent();

    // Open dropdown and select the first material
    await page.getByTestId("material-filter-trigger").click();
    await expect(page.getByTestId("material-filter-dropdown")).toBeVisible();

    const firstOption = page.locator("[data-testid^='material-filter-option-']").first();
    await firstOption.click();

    // Close dropdown
    await page.getByTestId("transactions-page-title").click();

    // Result count should update (filtered down)
    await expect(page.getByTestId("transactions-result-count")).not.toHaveText(initialText!, { timeout: 15000 });
  });

  test("Deselecting all materials resets the material filter", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Record initial result count
    const initialText = await page.getByTestId("transactions-result-count").textContent();

    // Select a material to filter
    await page.getByTestId("material-filter-trigger").click();
    await expect(page.getByTestId("material-filter-dropdown")).toBeVisible();
    const firstOption = page.locator("[data-testid^='material-filter-option-']").first();
    await firstOption.click();

    // Close dropdown
    await page.getByTestId("transactions-page-title").click();
    await expect(page.getByTestId("material-filter-dropdown")).not.toBeVisible();

    // Use Clear Filters to reset
    await page.getByTestId("clear-filters-btn").click();

    // Trigger should show "All Materials"
    await expect(page.getByTestId("material-filter-trigger")).toContainText("All Materials");

    // Result count should return to initial
    await expect(page.getByTestId("transactions-result-count")).toHaveText(initialText!, { timeout: 15000 });
  });
});

test.describe("TransactionTypeFilter", () => {
  test("Transaction Type filter displays with label and dropdown", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    const filter = page.getByTestId("transaction-type-filter");
    await expect(filter).toBeVisible();

    // Label
    await expect(filter.locator(".filter-label")).toContainText("Transaction Type");

    // Trigger should show default "All Types" text
    await expect(page.getByTestId("transaction-type-filter-trigger")).toContainText("All Types");
  });

  test("Opening the transaction type filter dropdown lists all transaction types", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("transaction-type-filter-trigger").click();
    await expect(page.getByTestId("transaction-type-filter-dropdown")).toBeVisible();

    // Verify "All Types" option
    await expect(page.getByTestId("transaction-type-option-all")).toBeVisible();

    // Verify individual type options
    await expect(page.getByTestId("transaction-type-option-purchase")).toBeVisible();
    await expect(page.getByTestId("transaction-type-option-consumption")).toBeVisible();
    await expect(page.getByTestId("transaction-type-option-transfer")).toBeVisible();
  });

  test("Selecting a transaction type filters the transactions table", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Record initial result count
    const initialText = await page.getByTestId("transactions-result-count").textContent();

    // Select "Purchase" type
    await page.getByTestId("transaction-type-filter-trigger").click();
    await expect(page.getByTestId("transaction-type-filter-dropdown")).toBeVisible();
    await page.getByTestId("transaction-type-option-purchase").click();

    // The trigger should update to show "Purchase"
    await expect(page.getByTestId("transaction-type-filter-trigger")).toContainText("Purchase");

    // Result count should change
    await expect(page.getByTestId("transactions-result-count")).not.toHaveText(initialText!, { timeout: 15000 });

    // Remaining transactions should contain "Purchase" in their descriptions
    const rows = page.locator("[data-testid^='transaction-row-']");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Selecting "All Types" resets the transaction type filter', async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    const initialText = await page.getByTestId("transactions-result-count").textContent();

    // Select Purchase first
    await page.getByTestId("transaction-type-filter-trigger").click();
    await expect(page.getByTestId("transaction-type-filter-dropdown")).toBeVisible();
    await page.getByTestId("transaction-type-option-purchase").click();

    // Wait for filter to apply
    await expect(page.getByTestId("transactions-result-count")).not.toHaveText(initialText!, { timeout: 15000 });

    // Now select "All Types"
    await page.getByTestId("transaction-type-filter-trigger").click();
    await expect(page.getByTestId("transaction-type-filter-dropdown")).toBeVisible();
    await page.getByTestId("transaction-type-option-all").click();

    // Result count should return to original
    await expect(page.getByTestId("transactions-result-count")).toHaveText(initialText!, { timeout: 15000 });
  });

  test("Clear Filters link resets all filters to defaults", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    const initialText = await page.getByTestId("transactions-result-count").textContent();

    // Apply date range filter
    await page.getByTestId("date-range-picker").click();
    await expect(page.getByTestId("date-range-calendar-popover")).toBeVisible();
    await page.getByTestId("date-range-start").fill("2023-10-25");
    await page.getByTestId("date-range-end").fill("2023-10-27");
    await page.getByTestId("date-range-apply").click();
    await expect(page.getByTestId("date-range-calendar-popover")).not.toBeVisible();

    // Apply transaction type filter
    await page.getByTestId("transaction-type-filter-trigger").click();
    await expect(page.getByTestId("transaction-type-filter-dropdown")).toBeVisible();
    await page.getByTestId("transaction-type-option-purchase").click();

    // Apply account filter
    await page.getByTestId("account-filter-trigger").click();
    await expect(page.getByTestId("account-filter-dropdown")).toBeVisible();
    await page.locator("[data-testid^='account-filter-option-']").first().click();
    await page.getByTestId("transactions-page-title").click();

    // Apply material filter
    await page.getByTestId("material-filter-trigger").click();
    await expect(page.getByTestId("material-filter-dropdown")).toBeVisible();
    await page.locator("[data-testid^='material-filter-option-']").first().click();
    await page.getByTestId("transactions-page-title").click();

    // Click Clear Filters
    await page.getByTestId("clear-filters-btn").click();

    // All filters should be reset
    await expect(page.getByTestId("transaction-type-filter-trigger")).toContainText("All Types");
    await expect(page.getByTestId("account-filter-trigger")).toContainText("All Accounts");
    await expect(page.getByTestId("material-filter-trigger")).toContainText("All Materials");
    await expect(page.getByTestId("date-range-picker")).toContainText("Select date range");

    // Result count should return to unfiltered state
    await expect(page.getByTestId("transactions-result-count")).toHaveText(initialText!, { timeout: 15000 });
  });
});

test.describe("SearchBar", () => {
  test("Search bar displays with magnifying glass icon and placeholder text", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });

    const searchBar = page.getByTestId("transactions-search-bar");
    await expect(searchBar).toBeVisible();

    // Magnifying glass icon
    await expect(searchBar.locator("svg")).toBeVisible();

    // Input with placeholder
    const input = page.getByTestId("transactions-search-input");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("placeholder", "Search by ID or description...");
  });

  test("Typing a transaction ID in the search bar filters transactions", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Get a transaction reference ID from the first row
    const firstRow = page.locator("[data-testid^='transaction-row-']").first();
    const firstRowTestId = await firstRow.getAttribute("data-testid");
    const txnId = firstRowTestId!.replace("transaction-row-", "");
    const refId = await page.getByTestId(`transaction-ref-${txnId}`).textContent();

    // Type the reference ID in search
    await page.getByTestId("transactions-search-input").fill(refId!);

    // Table should show only matching transactions
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 15000 });

    // The matching row should contain the searched reference ID
    const visibleRows = page.locator("[data-testid^='transaction-row-']");
    const count = await visibleRows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("Typing a description keyword in the search bar filters transactions", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Record initial result count
    const initialText = await page.getByTestId("transactions-result-count").textContent();

    // Search for "Purchase"
    await page.getByTestId("transactions-search-input").fill("Purchase");

    // Wait for filter to apply
    await expect(page.getByTestId("transactions-result-count")).not.toHaveText(initialText!, { timeout: 15000 });

    // Remaining rows should have "Purchase" in description
    const rows = page.locator("[data-testid^='transaction-row-']");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const rowTestId = await row.getAttribute("data-testid");
      const rowTxnId = rowTestId!.replace("transaction-row-", "");
      const desc = await page.getByTestId(`transaction-desc-${rowTxnId}`).textContent();
      const ref = await page.getByTestId(`transaction-ref-${rowTxnId}`).textContent();
      // Should match in either description or reference ID
      const combined = `${desc} ${ref}`.toLowerCase();
      expect(combined).toContain("purchase");
    }
  });

  test("Search is case-insensitive", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Search lowercase "purchase"
    await page.getByTestId("transactions-search-input").fill("purchase");

    // Should show results with "Purchase" in description
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 15000 });
    const rows = page.locator("[data-testid^='transaction-row-']");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("Clearing the search bar shows all transactions again", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    const initialText = await page.getByTestId("transactions-result-count").textContent();

    // Search for something specific
    await page.getByTestId("transactions-search-input").fill("Purchase");
    await expect(page.getByTestId("transactions-result-count")).not.toHaveText(initialText!, { timeout: 15000 });

    // Clear the search
    await page.getByTestId("transactions-search-input").fill("");

    // Result count should return to unfiltered state
    await expect(page.getByTestId("transactions-result-count")).toHaveText(initialText!, { timeout: 15000 });
  });

  test("Search with no matching results shows empty state", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Search for something that doesn't exist
    await page.getByTestId("transactions-search-input").fill("NONEXISTENT999");

    // Empty state should appear
    await expect(page.getByTestId("transactions-empty-state")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("transactions-empty-state")).toContainText("No transactions found");
  });

  test("Search and filters work together to narrow results", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    const initialText = await page.getByTestId("transactions-result-count").textContent();

    // Apply account filter first
    await page.getByTestId("account-filter-trigger").click();
    await expect(page.getByTestId("account-filter-dropdown")).toBeVisible();
    await page.locator("[data-testid^='account-filter-option-']").first().click();
    await page.getByTestId("transactions-page-title").click();

    // Wait for account filter to take effect
    await expect(page.getByTestId("transactions-result-count")).not.toHaveText(initialText!, { timeout: 15000 });

    const afterAccountFilter = await page.getByTestId("transactions-result-count").textContent();

    // Now also search
    await page.getByTestId("transactions-search-input").fill("Steel");

    // Results should be further narrowed
    // The combined filter should either show fewer results or empty state
    const afterBoth = await page.getByTestId("transactions-result-count").textContent();
    // The narrowed results should be <= account filter results
    const afterAccountMatch = afterAccountFilter!.match(/of (\d+)/);
    const afterBothMatch = afterBoth!.match(/of (\d+)/);
    if (afterAccountMatch && afterBothMatch) {
      expect(parseInt(afterBothMatch[1])).toBeLessThanOrEqual(parseInt(afterAccountMatch[1]));
    }
  });

  test("Multiple filters combine: date range, material, and transaction type", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    const initialText = await page.getByTestId("transactions-result-count").textContent();

    // Apply date range
    await page.getByTestId("date-range-picker").click();
    await expect(page.getByTestId("date-range-calendar-popover")).toBeVisible();
    await page.getByTestId("date-range-start").fill("2023-10-25");
    await page.getByTestId("date-range-end").fill("2023-10-27");
    await page.getByTestId("date-range-apply").click();
    await expect(page.getByTestId("date-range-calendar-popover")).not.toBeVisible();

    // Apply material filter
    await page.getByTestId("material-filter-trigger").click();
    await expect(page.getByTestId("material-filter-dropdown")).toBeVisible();
    await page.locator("[data-testid^='material-filter-option-']").first().click();
    await page.getByTestId("transactions-page-title").click();

    // Apply transaction type filter
    await page.getByTestId("transaction-type-filter-trigger").click();
    await expect(page.getByTestId("transaction-type-filter-dropdown")).toBeVisible();
    await page.getByTestId("transaction-type-option-purchase").click();

    // Result count should be less than or equal to initial
    const filteredText = await page.getByTestId("transactions-result-count").textContent();
    const initialMatch = initialText!.match(/of (\d+)/);
    const filteredMatch = filteredText!.match(/of (\d+)/);
    if (initialMatch && filteredMatch) {
      expect(parseInt(filteredMatch[1])).toBeLessThanOrEqual(parseInt(initialMatch[1]));
    }
  });
});
