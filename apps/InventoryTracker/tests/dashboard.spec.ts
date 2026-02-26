import { test, expect } from "@playwright/test";

test.describe("NavigationHeader", () => {
  test("Navigation header displays app branding and all navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });

    // Logo with app name
    await expect(page.getByTestId("navbar-logo")).toContainText("InventoryFlow");

    // Navigation links in order
    const links = page.getByTestId("navbar-links");
    await expect(links.getByTestId("navbar-link-accounts")).toBeVisible();
    await expect(links.getByTestId("navbar-link-materials")).toBeVisible();
    await expect(links.getByTestId("navbar-link-batches")).toBeVisible();
    await expect(links.getByTestId("navbar-link-transactions")).toBeVisible();
    await expect(links.getByTestId("navbar-link-settings")).toBeVisible();

    // Verify order
    const linkElements = links.locator("[data-testid^='navbar-link-']");
    await expect(linkElements.nth(0)).toHaveAttribute("data-testid", "navbar-link-accounts");
    await expect(linkElements.nth(1)).toHaveAttribute("data-testid", "navbar-link-materials");
    await expect(linkElements.nth(2)).toHaveAttribute("data-testid", "navbar-link-batches");
    await expect(linkElements.nth(3)).toHaveAttribute("data-testid", "navbar-link-transactions");
    await expect(linkElements.nth(4)).toHaveAttribute("data-testid", "navbar-link-settings");

    // User avatar and Admin label
    await expect(page.getByTestId("navbar-user")).toBeVisible();
    await expect(page.getByTestId("navbar-avatar")).toBeVisible();
    await expect(page.getByTestId("navbar-user-name")).toHaveText("Admin");
  });

  test("Navigation link for Accounts navigates to AccountsPage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("navbar-link-accounts").click();

    await expect(page).toHaveURL(/\/accounts$/);
    await expect(page.getByTestId("accounts-page")).toBeVisible({ timeout: 30000 });
  });

  test("Navigation link for Materials navigates to MaterialsPage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("navbar-link-materials").click();

    await expect(page).toHaveURL(/\/materials$/);
    await expect(page.getByTestId("materials-page")).toBeVisible({ timeout: 30000 });
  });

  test("Navigation link for Batches navigates to BatchesPage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("navbar-link-batches").click();

    await expect(page).toHaveURL(/\/batches$/);
    await expect(page.getByTestId("batches-page")).toBeVisible({ timeout: 30000 });
  });

  test("Navigation link for Transactions navigates to TransactionsPage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("navbar-link-transactions").click();

    await expect(page).toHaveURL(/\/transactions$/);
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });
  });

  test("Navigation link for Settings navigates to SettingsPage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("navbar-link-settings").click();

    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByTestId("settings-page")).toBeVisible({ timeout: 30000 });
  });

  test("Active navigation link is visually highlighted for the current page", async ({ page }) => {
    // On Dashboard, the logo should have active state
    await page.goto("/");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("navbar-logo")).toHaveClass(/navbar-link--active/);

    // Navigate to Accounts - Accounts link should be active
    await page.getByTestId("navbar-link-accounts").click();
    await expect(page).toHaveURL(/\/accounts$/);
    await expect(page.getByTestId("navbar-link-accounts")).toHaveClass(/navbar-link--active/);

    // Logo should no longer be active
    await expect(page.getByTestId("navbar-logo")).not.toHaveClass(/navbar-link--active/);
  });
});

test.describe("LowInventoryAlerts", () => {
  // Tests must run sequentially because dismiss tests modify shared database state
  test.describe.configure({ mode: "serial" });

  test("Low inventory alerts section displays with heading and warning icon", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("low-inventory-alerts")).toBeVisible({ timeout: 30000 });

    // Heading with warning icon
    const heading = page.getByTestId("low-inventory-alerts-heading");
    await expect(heading).toContainText("Low Inventory Alerts");
    await expect(page.getByTestId("low-inventory-alerts-icon")).toBeVisible();
  });

  test("Each low inventory alert shows severity, material name, current quantity, and reorder point", async ({ page }) => {
    test.slow();
    await page.goto("/");
    await expect(page.getByTestId("low-inventory-alerts")).toBeVisible({ timeout: 30000 });

    // Wait for alert rows to appear
    const alertTable = page.getByTestId("low-inventory-alerts").locator("table");
    await expect(alertTable).toBeVisible({ timeout: 30000 });

    // Find alerts by material name
    const alertRows = page.locator("[data-testid^='low-inventory-alert-row-']");
    const count = await alertRows.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Verify each alert has the required fields
    for (let i = 0; i < count; i++) {
      const row = alertRows.nth(i);
      const testId = await row.getAttribute("data-testid");
      const materialId = testId!.replace("low-inventory-alert-row-", "");

      // Severity indicator with label
      await expect(page.getByTestId(`low-inventory-alert-severity-${materialId}`)).toBeVisible();
      const severityLabel = page.getByTestId(`low-inventory-alert-severity-label-${materialId}`);
      const labelText = await severityLabel.textContent();
      expect(["Warning", "Critical"]).toContain(labelText);

      // Material name
      await expect(page.getByTestId(`low-inventory-alert-material-name-${materialId}`)).toBeVisible();

      // Current quantity
      await expect(page.getByTestId(`low-inventory-alert-current-qty-${materialId}`)).toBeVisible();

      // Reorder point
      await expect(page.getByTestId(`low-inventory-alert-reorder-point-${materialId}`)).toBeVisible();
    }

    // Verify specific severity assignments based on seed data
    // Aluminum Sheets: 25/100 = 25% -> Critical
    const aluminumRow = page.locator("[data-testid^='low-inventory-alert-row-']").filter({
      has: page.locator("[data-testid^='low-inventory-alert-material-name-']", { hasText: "Aluminum Sheets" }),
    });
    await expect(aluminumRow).toBeVisible();
    const aluminumSeverityLabel = aluminumRow.locator("[data-testid^='low-inventory-alert-severity-label-']");
    await expect(aluminumSeverityLabel).toHaveText("Critical");

    // Steel Bolts M6 and Copper Wire should be Warning
    const steelRow = page.locator("[data-testid^='low-inventory-alert-row-']").filter({
      has: page.locator("[data-testid^='low-inventory-alert-material-name-']", { hasText: "Steel Bolts M6" }),
    });
    await expect(steelRow).toBeVisible();
    const steelSeverityLabel = steelRow.locator("[data-testid^='low-inventory-alert-severity-label-']");
    await expect(steelSeverityLabel).toHaveText("Warning");

    const copperRow = page.locator("[data-testid^='low-inventory-alert-row-']").filter({
      has: page.locator("[data-testid^='low-inventory-alert-material-name-']", { hasText: "Copper Wire" }),
    });
    await expect(copperRow).toBeVisible();
    const copperSeverityLabel = copperRow.locator("[data-testid^='low-inventory-alert-severity-label-']");
    await expect(copperSeverityLabel).toHaveText("Warning");
  });

  test("Low inventory alert View Details link navigates to material detail page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("low-inventory-alerts")).toBeVisible({ timeout: 30000 });

    // Find an alert row
    const alertRows = page.locator("[data-testid^='low-inventory-alert-row-']");
    await expect(alertRows.first()).toBeVisible({ timeout: 30000 });

    const firstRow = alertRows.first();
    const testId = await firstRow.getAttribute("data-testid");
    const materialId = testId!.replace("low-inventory-alert-row-", "");

    // Click View Details
    await page.getByTestId(`low-inventory-alert-view-details-${materialId}`).click();

    // Verify navigation to MaterialDetailPage
    await expect(page).toHaveURL(new RegExp(`/materials/${materialId}`));
    await expect(page.getByTestId("material-detail-page")).toBeVisible({ timeout: 30000 });
  });

  test("Low inventory alert Dismiss button removes the alert", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("low-inventory-alerts")).toBeVisible({ timeout: 30000 });

    // Find Copper Wire alert
    const copperRow = page.locator("[data-testid^='low-inventory-alert-row-']").filter({
      has: page.locator("[data-testid^='low-inventory-alert-material-name-']", { hasText: "Copper Wire" }),
    });
    await expect(copperRow).toBeVisible({ timeout: 30000 });

    const copperTestId = await copperRow.getAttribute("data-testid");
    const copperId = copperTestId!.replace("low-inventory-alert-row-", "");

    // Count alerts before dismiss
    const alertsBefore = await page.locator("[data-testid^='low-inventory-alert-row-']").count();

    // Click Dismiss
    await page.getByTestId(`low-inventory-alert-dismiss-${copperId}`).click();

    // Copper Wire alert should be removed
    await expect(
      page.locator("[data-testid^='low-inventory-alert-row-']").filter({
        has: page.locator("[data-testid^='low-inventory-alert-material-name-']", { hasText: "Copper Wire" }),
      })
    ).toHaveCount(0, { timeout: 15000 });

    // Other alerts should still be visible (at least one remains)
    const alertsAfter = page.locator("[data-testid^='low-inventory-alert-row-']");
    const afterCount = await alertsAfter.count();
    expect(afterCount).toBeGreaterThan(0);
    expect(afterCount).toBeLessThan(alertsBefore);
  });

  test("Low inventory alert Reorder button opens new transaction pre-filled for reorder", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("low-inventory-alerts")).toBeVisible({ timeout: 30000 });

    // Find Steel Bolts M6 alert
    const steelRow = page.locator("[data-testid^='low-inventory-alert-row-']").filter({
      has: page.locator("[data-testid^='low-inventory-alert-material-name-']", { hasText: "Steel Bolts M6" }),
    });
    await expect(steelRow).toBeVisible({ timeout: 30000 });

    const steelTestId = await steelRow.getAttribute("data-testid");
    const steelId = steelTestId!.replace("low-inventory-alert-row-", "");

    // Click Reorder
    await page.getByTestId(`low-inventory-alert-reorder-${steelId}`).click();

    // Verify navigation to NewTransactionPage with pre-filled material
    await expect(page).toHaveURL(/\/transactions\/new/);
    await expect(page.getByTestId("new-transaction-page")).toBeVisible({ timeout: 30000 });

    // URL should contain material info
    await expect(page).toHaveURL(/material/);
  });

  test("Low inventory alerts section shows empty state when no materials are below reorder point", async ({ page }) => {
    test.slow();
    await page.goto("/");
    await expect(page.getByTestId("low-inventory-alerts")).toBeVisible({ timeout: 30000 });

    // Dismiss all alerts to get to empty state
    const alertRows = page.locator("[data-testid^='low-inventory-alert-row-']");
    const initialCount = await alertRows.count();

    for (let i = 0; i < initialCount; i++) {
      // Always dismiss the first remaining alert
      const firstRow = page.locator("[data-testid^='low-inventory-alert-row-']").first();
      const rowVisible = await firstRow.isVisible().catch(() => false);
      if (!rowVisible) break;

      const testId = await firstRow.getAttribute("data-testid");
      const materialId = testId!.replace("low-inventory-alert-row-", "");
      await page.getByTestId(`low-inventory-alert-dismiss-${materialId}`).click();

      // Wait for the alert to be removed
      await expect(
        page.locator(`[data-testid="low-inventory-alert-row-${materialId}"]`)
      ).toHaveCount(0, { timeout: 15000 });
    }

    // Verify empty state
    await expect(page.getByTestId("low-inventory-alerts-empty")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("low-inventory-alerts-empty")).toContainText("No low inventory alerts");
  });
});

test.describe("MaterialsCategoriesOverview", () => {
  test("Materials categories overview section displays with heading and icon", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("materials-categories-overview")).toBeVisible({ timeout: 30000 });

    const heading = page.getByTestId("materials-categories-overview-heading");
    await expect(heading).toContainText("Materials Categories Overview");
    await expect(page.getByTestId("materials-categories-overview-icon")).toBeVisible();
  });

  test("Each category column shows category name, total items count, and total units count", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("materials-categories-overview")).toBeVisible({ timeout: 30000 });

    // Wait for category columns to load
    const columns = page.locator("[data-testid^='category-column-']");
    await expect(columns.first()).toBeVisible({ timeout: 30000 });

    const count = await columns.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Each column should have name and totals
    for (let i = 0; i < count; i++) {
      const col = columns.nth(i);
      const testId = await col.getAttribute("data-testid");
      const catId = testId!.replace("category-column-", "");

      // Category name
      await expect(page.getByTestId(`category-col-name-${catId}`)).toBeVisible();

      // Totals showing Items and Units
      const totals = page.getByTestId(`category-col-totals-${catId}`);
      await expect(totals).toBeVisible();
      await expect(totals).toContainText("Total:");
      await expect(totals).toContainText("Items");
      await expect(totals).toContainText("Units");
    }
  });

  test("Each category shows a sample of materials with names and quantities", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("materials-categories-overview")).toBeVisible({ timeout: 30000 });

    // Wait for materials to appear
    const materials = page.locator("[data-testid^='category-mat-']");
    await expect(materials.first()).toBeVisible({ timeout: 30000 });

    // Each material should show name and quantity
    const count = await materials.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const material = materials.nth(i);
      // Material should contain a link with material name and quantity info
      const link = material.locator("[data-testid^='category-material-link-']");
      await expect(link).toBeVisible();
      // Text should include name and quantity
      const text = await material.textContent();
      expect(text).toMatch(/.+:\s*[\d,]+\s+\w+/);
    }
  });

  test("Clicking a material name navigates to the material detail page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("materials-categories-overview")).toBeVisible({ timeout: 30000 });

    // Wait for material links to appear
    const materialLinks = page.locator("[data-testid^='category-material-link-']");
    await expect(materialLinks.first()).toBeVisible({ timeout: 30000 });

    // Get the first material link
    const firstLink = materialLinks.first();
    const linkTestId = await firstLink.getAttribute("data-testid");
    const materialId = linkTestId!.replace("category-material-link-", "");

    // Click the material name
    await firstLink.click();

    // Verify navigation to MaterialDetailPage
    await expect(page).toHaveURL(new RegExp(`/materials/${materialId}`));
    await expect(page.getByTestId("material-detail-page")).toBeVisible({ timeout: 30000 });
  });

  test("View All Categories link navigates to MaterialsPage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("materials-categories-overview")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("view-all-categories-link").click();

    await expect(page).toHaveURL(/\/materials$/);
    await expect(page.getByTestId("materials-page")).toBeVisible({ timeout: 30000 });
  });

  test("Materials categories overview updates when category filter is applied", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("materials-categories-overview")).toBeVisible({ timeout: 30000 });

    // Wait for columns to load
    const columns = page.locator("[data-testid^='category-column-']");
    await expect(columns.first()).toBeVisible({ timeout: 30000 });
    const initialCount = await columns.count();
    expect(initialCount).toBeGreaterThan(1);

    // Open category filter and select a specific category
    await page.getByTestId("category-filter-trigger").click();
    await expect(page.getByTestId("category-filter-menu")).toBeVisible();

    // Click the first non-All category option
    const categoryOptions = page.locator("[data-testid^='category-filter-option-']:not([data-testid='category-filter-option-all'])");
    await expect(categoryOptions.first()).toBeVisible();
    await categoryOptions.first().click();

    // After filtering, only one category column should be visible
    await expect(page.locator("[data-testid^='category-column-']")).toHaveCount(1, { timeout: 15000 });
  });
});

test.describe("RecentTransactionsTable", () => {
  test("Recent transactions table displays with correct column headers", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("recent-transactions")).toBeVisible({ timeout: 30000 });

    const heading = page.getByTestId("recent-transactions-heading");
    await expect(heading).toContainText("Recent Transactions");

    // Column headers
    const table = page.getByTestId("recent-transactions-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    const headers = table.locator("th");
    await expect(headers.nth(0)).toContainText("Date");
    await expect(headers.nth(1)).toContainText("Reference");
    await expect(headers.nth(2)).toContainText("Accounts Affected");
    await expect(headers.nth(3)).toContainText("Materials & Amounts");
    await expect(headers.nth(4)).toContainText("Action");
  });

  test("Recent transactions table shows transaction rows with correct data", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("recent-transactions-table")).toBeVisible({ timeout: 30000 });

    // Find a transaction row
    const rows = page.locator("[data-testid^='recent-transaction-row-']");
    await expect(rows.first()).toBeVisible({ timeout: 30000 });

    const firstRow = rows.first();
    const testId = await firstRow.getAttribute("data-testid");
    const txnId = testId!.replace("recent-transaction-row-", "");

    // Verify data cells are populated
    await expect(page.getByTestId(`recent-transaction-date-${txnId}`)).not.toBeEmpty();
    await expect(page.getByTestId(`recent-transaction-reference-${txnId}`)).not.toBeEmpty();
    await expect(page.getByTestId(`recent-transaction-accounts-${txnId}`)).not.toBeEmpty();
    await expect(page.getByTestId(`recent-transaction-materials-${txnId}`)).not.toBeEmpty();
  });

  test("Recent transactions table shows multiple transactions in reverse chronological order", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("recent-transactions-table")).toBeVisible({ timeout: 30000 });

    const rows = page.locator("[data-testid^='recent-transaction-row-']");
    await expect(rows.first()).toBeVisible({ timeout: 30000 });

    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Extract dates from the rows and verify descending order
    const dates: string[] = [];
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const rowTestId = await row.getAttribute("data-testid");
      const txnId = rowTestId!.replace("recent-transaction-row-", "");
      const dateText = await page.getByTestId(`recent-transaction-date-${txnId}`).textContent();
      dates.push(dateText!);
    }

    // Verify dates are in descending order
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]).getTime();
      const curr = new Date(dates[i]).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  test("View Full Details link navigates to TransactionDetailPage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("recent-transactions-table")).toBeVisible({ timeout: 30000 });

    const rows = page.locator("[data-testid^='recent-transaction-row-']");
    await expect(rows.first()).toBeVisible({ timeout: 30000 });

    const firstRow = rows.first();
    const testId = await firstRow.getAttribute("data-testid");
    const txnId = testId!.replace("recent-transaction-row-", "");

    // Click View Full Details
    await page.getByTestId(`recent-transaction-view-details-${txnId}`).click();

    // Verify navigation
    await expect(page).toHaveURL(new RegExp(`/transactions/${txnId}`));
    await expect(page.getByTestId("transaction-detail-page")).toBeVisible({ timeout: 30000 });
  });

  test("View All Transactions link navigates to TransactionsPage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("recent-transactions")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("view-all-transactions-link").click();

    await expect(page).toHaveURL(/\/transactions$/);
    await expect(page.getByTestId("transactions-page")).toBeVisible({ timeout: 30000 });
  });

  test("Recent transactions table updates when date range filter is applied", async ({ page }) => {
    test.slow();
    await page.goto("/");
    await expect(page.getByTestId("recent-transactions-table")).toBeVisible({ timeout: 30000 });

    // Get initial transaction count
    const rows = page.locator("[data-testid^='recent-transaction-row-']");
    await expect(rows.first()).toBeVisible({ timeout: 30000 });
    const initialCount = await rows.count();
    expect(initialCount).toBeGreaterThan(0);

    // Open date range filter
    await page.getByTestId("date-range-picker").click();
    await expect(page.getByTestId("date-range-calendar-popover")).toBeVisible();

    // Set a narrow date range that includes only January transactions
    await page.getByTestId("date-range-start").fill("2026-01-01");
    await page.getByTestId("date-range-end").fill("2026-01-31");
    await page.getByTestId("date-range-apply").click();

    // Wait for the table to update
    await expect(page.getByTestId("date-range-calendar-popover")).not.toBeVisible();

    // Transactions should now show only January ones
    const filteredRows = page.locator("[data-testid^='recent-transaction-row-']");
    await expect(filteredRows.first()).toBeVisible({ timeout: 30000 });

    // All visible dates should be in January 2026
    const filteredCount = await filteredRows.count();
    for (let i = 0; i < filteredCount; i++) {
      const row = filteredRows.nth(i);
      const rowTestId = await row.getAttribute("data-testid");
      const txnId = rowTestId!.replace("recent-transaction-row-", "");
      const dateText = await page.getByTestId(`recent-transaction-date-${txnId}`).textContent();
      expect(dateText).toContain("2026");
      expect(dateText).toContain("Jan");
    }
  });

  test("Recent transactions table shows empty state when no transactions exist", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("recent-transactions")).toBeVisible({ timeout: 30000 });

    // Apply a date range that has no transactions
    await page.getByTestId("date-range-picker").click();
    await expect(page.getByTestId("date-range-calendar-popover")).toBeVisible();

    await page.getByTestId("date-range-start").fill("2020-01-01");
    await page.getByTestId("date-range-end").fill("2020-01-31");
    await page.getByTestId("date-range-apply").click();

    // Wait for empty state
    await expect(page.getByTestId("recent-transactions-empty")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("recent-transactions-empty")).toContainText("No recent transactions");
  });
});

test.describe("DateRangeFilter", () => {
  test("Date range filter displays with label, date range, and calendar icon", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });

    // Filter label
    await expect(page.getByTestId("date-range-filter-label")).toBeVisible();
    await expect(page.getByTestId("date-range-filter-label")).toContainText("Filter by Date:");

    // Date range picker button
    await expect(page.getByTestId("date-range-picker")).toBeVisible();

    // Calendar icon
    await expect(page.getByTestId("date-range-calendar-icon")).toBeVisible();
  });

  test("Clicking the date range picker opens a calendar to select dates", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });

    // Popover should not be visible initially
    await expect(page.getByTestId("date-range-calendar-popover")).not.toBeVisible();

    // Click the date range picker
    await page.getByTestId("date-range-picker").click();

    // Popover should open with date inputs
    await expect(page.getByTestId("date-range-calendar-popover")).toBeVisible();
    await expect(page.getByTestId("date-range-start")).toBeVisible();
    await expect(page.getByTestId("date-range-end")).toBeVisible();
  });

  test("Selecting a new date range updates all dashboard widgets", async ({ page }) => {
    test.slow();
    await page.goto("/");
    await expect(page.getByTestId("recent-transactions-table")).toBeVisible({ timeout: 30000 });

    // Open date range filter
    await page.getByTestId("date-range-picker").click();
    await expect(page.getByTestId("date-range-calendar-popover")).toBeVisible();

    // Select February-only range
    await page.getByTestId("date-range-start").fill("2026-02-01");
    await page.getByTestId("date-range-end").fill("2026-02-28");
    await page.getByTestId("date-range-apply").click();

    // Verify the recent transactions table updated - should only show February transactions
    const rows = page.locator("[data-testid^='recent-transaction-row-']");
    await expect(rows.first()).toBeVisible({ timeout: 30000 });

    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const rowTestId = await row.getAttribute("data-testid");
      const txnId = rowTestId!.replace("recent-transaction-row-", "");
      const dateText = await page.getByTestId(`recent-transaction-date-${txnId}`).textContent();
      expect(dateText).toContain("Feb");
    }

    // Low inventory alerts and categories overview should still be visible
    await expect(page.getByTestId("low-inventory-alerts")).toBeVisible();
    await expect(page.getByTestId("materials-categories-overview")).toBeVisible();
  });
});

test.describe("CategoryFilter", () => {
  test('Category filter displays as a dropdown with "All Categories" default', async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });

    // Filter label
    await expect(page.getByTestId("category-filter-label")).toBeVisible();
    await expect(page.getByTestId("category-filter-label")).toContainText("Category Filter:");

    // Dropdown trigger with default value
    await expect(page.getByTestId("category-filter-trigger")).toBeVisible();
    await expect(page.getByTestId("category-filter-value")).toHaveText("All Categories");
  });

  test("Opening the category filter dropdown lists all material categories", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });

    // Wait for categories to load
    await expect(page.getByTestId("category-filter-trigger")).toBeVisible({ timeout: 30000 });

    // Open dropdown
    await page.getByTestId("category-filter-trigger").click();
    await expect(page.getByTestId("category-filter-menu")).toBeVisible();

    // All Categories option
    await expect(page.getByTestId("category-filter-option-all")).toBeVisible();

    // Category options
    const options = page.locator("[data-testid^='category-filter-option-']:not([data-testid='category-filter-option-all'])");
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Verify category names are visible
    const optionTexts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      optionTexts.push(text!);
    }
    expect(optionTexts).toContain("Raw Materials");
    expect(optionTexts).toContain("Finished Goods");
    expect(optionTexts).toContain("Packaging");
  });

  test("Selecting a category filters dashboard content to that category", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("materials-categories-overview")).toBeVisible({ timeout: 30000 });

    // Wait for data to load
    await expect(page.locator("[data-testid^='category-column-']").first()).toBeVisible({ timeout: 30000 });

    // Open category filter
    await page.getByTestId("category-filter-trigger").click();
    await expect(page.getByTestId("category-filter-menu")).toBeVisible();

    // Find and click "Raw Materials" option
    const rawMaterialsOption = page.locator("[data-testid^='category-filter-option-']").filter({
      hasText: "Raw Materials",
    });
    await rawMaterialsOption.click();

    // Categories overview should show only Raw Materials
    await expect(page.locator("[data-testid^='category-column-']")).toHaveCount(1, { timeout: 15000 });

    const singleColumn = page.locator("[data-testid^='category-column-']").first();
    const colName = singleColumn.locator("[data-testid^='category-col-name-']");
    await expect(colName).toHaveText("Raw Materials");
  });

  test('Selecting "All Categories" resets the filter to show all data', async ({ page }) => {
    test.slow();
    await page.goto("/");
    await expect(page.getByTestId("materials-categories-overview")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='category-column-']").first()).toBeVisible({ timeout: 30000 });

    // First apply a filter
    await page.getByTestId("category-filter-trigger").click();
    await expect(page.getByTestId("category-filter-menu")).toBeVisible();
    const rawOption = page.locator("[data-testid^='category-filter-option-']").filter({
      hasText: "Raw Materials",
    });
    await rawOption.click();

    // Should be filtered to 1
    await expect(page.locator("[data-testid^='category-column-']")).toHaveCount(1, { timeout: 15000 });

    // Now select All Categories
    await page.getByTestId("category-filter-trigger").click();
    await expect(page.getByTestId("category-filter-menu")).toBeVisible();
    await page.getByTestId("category-filter-option-all").click();

    // Should show all categories again
    const columns = page.locator("[data-testid^='category-column-']");
    await expect(columns).not.toHaveCount(1, { timeout: 15000 });
    const finalCount = await columns.count();
    expect(finalCount).toBeGreaterThanOrEqual(3);
  });
});

test.describe("NewTransactionButton", () => {
  test("New Transaction button is displayed prominently with plus icon", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });

    const btn = page.getByTestId("new-transaction-btn");
    await expect(btn).toBeVisible();
    await expect(btn).toContainText("New Transaction");

    // Button should have the plus icon (an SVG child)
    const svg = btn.locator("svg");
    await expect(svg).toBeVisible();

    // Button should be styled as primary (has btn-primary class)
    await expect(btn).toHaveClass(/btn-primary/);
  });

  test("Clicking New Transaction button navigates to NewTransactionPage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("new-transaction-btn").click();

    await expect(page).toHaveURL(/\/transactions\/new/);
    await expect(page.getByTestId("new-transaction-page")).toBeVisible({ timeout: 30000 });
  });
});
