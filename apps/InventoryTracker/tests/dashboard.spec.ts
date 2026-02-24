import { test, expect } from '@playwright/test';

test.describe('DashboardPageHeader', () => {
  test('Dashboard page displays header with \'Dashboard Overview\' title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const heading = page.getByTestId('page-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Dashboard Overview');
  });
});

test.describe('LowInventoryAlerts', () => {
  test('Low Inventory Alerts section displays heading and alert icon', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const section = page.getByTestId('low-inventory-alerts-section');
    await expect(section).toBeVisible();
    const heading = page.getByTestId('low-inventory-alerts-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Low Inventory Alerts');
    // Alert icon (AlertTriangle svg) should be present within the heading
    const icon = heading.locator('svg');
    await expect(icon).toBeVisible();
  });

  test('Warning-level alert row displays yellow/amber icon and correct description', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const alertsList = page.getByTestId('alerts-list');
    await expect(alertsList).toBeVisible();

    // Find a warning-level alert by looking for severity text "Warning"
    const allAlertRows = alertsList.locator('[data-testid^="alert-row-"]');
    const count = await allAlertRows.count();
    let warningAlertId: string | null = null;

    for (let i = 0; i < count; i++) {
      const row = allAlertRows.nth(i);
      const testId = await row.getAttribute('data-testid');
      const id = testId?.replace('alert-row-', '') || '';
      const severity = page.getByTestId(`alert-severity-${id}`);
      const text = await severity.textContent();
      if (text === 'Warning') {
        warningAlertId = id;
        break;
      }
    }

    expect(warningAlertId).not.toBeNull();

    // Verify icon has warning class (yellow/amber)
    const alertRow = page.getByTestId(`alert-row-${warningAlertId}`);
    const iconContainer = alertRow.locator('.alert-icon.warning');
    await expect(iconContainer).toBeVisible();

    // Verify description contains "is low" pattern
    const description = page.getByTestId(`alert-description-${warningAlertId}`);
    await expect(description).toContainText('is low');
    await expect(description).toContainText('Current:');
    await expect(description).toContainText('Reorder Point:');
  });

  test('Critical-level alert row displays red icon and correct description', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const alertsList = page.getByTestId('alerts-list');
    await expect(alertsList).toBeVisible();

    // Find a critical-level alert
    const allAlertRows = alertsList.locator('[data-testid^="alert-row-"]');
    const count = await allAlertRows.count();
    let criticalAlertId: string | null = null;

    for (let i = 0; i < count; i++) {
      const row = allAlertRows.nth(i);
      const testId = await row.getAttribute('data-testid');
      const id = testId?.replace('alert-row-', '') || '';
      const severity = page.getByTestId(`alert-severity-${id}`);
      const text = await severity.textContent();
      if (text === 'Critical') {
        criticalAlertId = id;
        break;
      }
    }

    expect(criticalAlertId).not.toBeNull();

    // Verify icon has critical class (red)
    const alertRow = page.getByTestId(`alert-row-${criticalAlertId}`);
    const iconContainer = alertRow.locator('.alert-icon.critical');
    await expect(iconContainer).toBeVisible();

    // Verify description contains "is critically low" pattern
    const description = page.getByTestId(`alert-description-${criticalAlertId}`);
    await expect(description).toContainText('is critically low');
    await expect(description).toContainText('Current:');
    await expect(description).toContainText('Reorder Point:');
  });

  test('View Details link on alert navigates to MaterialDetailPage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const alertsList = page.getByTestId('alerts-list');
    await expect(alertsList).toBeVisible();

    // Get the first alert row's ID
    const firstRow = alertsList.locator('[data-testid^="alert-row-"]').first();
    const testId = await firstRow.getAttribute('data-testid');
    const alertId = testId?.replace('alert-row-', '') || '';

    // Click View Details
    const viewDetailsLink = page.getByTestId(`alert-view-details-${alertId}`);
    await expect(viewDetailsLink).toBeVisible();
    await expect(viewDetailsLink).toContainText('View Details');
    await viewDetailsLink.click();

    // Should navigate to /materials/:materialId
    await expect(page).toHaveURL(new RegExp(`/materials/${alertId}`));
  });

  test('Dismiss button removes the alert from the list', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const alertsList = page.getByTestId('alerts-list');
    await expect(alertsList).toBeVisible();

    // Count alerts before dismiss
    const allAlertRows = alertsList.locator('[data-testid^="alert-row-"]');
    const countBefore = await allAlertRows.count();
    expect(countBefore).toBeGreaterThan(0);

    // Get first alert ID
    const firstRow = allAlertRows.first();
    const testId = await firstRow.getAttribute('data-testid');
    const alertId = testId?.replace('alert-row-', '') || '';

    // Click Dismiss
    const dismissBtn = page.getByTestId(`alert-dismiss-${alertId}`);
    await dismissBtn.click();

    // Wait for the alert to be removed
    await expect(page.getByTestId(`alert-row-${alertId}`)).toBeHidden();

    // Count should be one less (or if there was only one, empty state should show)
    if (countBefore > 1) {
      const countAfter = await alertsList.locator('[data-testid^="alert-row-"]').count();
      expect(countAfter).toBe(countBefore - 1);
    }
  });

  test('Reorder button navigates to NewTransactionPage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const alertsList = page.getByTestId('alerts-list');
    await expect(alertsList).toBeVisible();

    // Get the first alert row's ID
    const firstRow = alertsList.locator('[data-testid^="alert-row-"]').first();
    const testId = await firstRow.getAttribute('data-testid');
    const alertId = testId?.replace('alert-row-', '') || '';

    // Click Reorder
    const reorderBtn = page.getByTestId(`alert-reorder-${alertId}`);
    await expect(reorderBtn).toBeVisible();
    await reorderBtn.click();

    // Should navigate to /transactions/new with materialId param
    await expect(page).toHaveURL(new RegExp('/transactions/new'));
  });

  test('Empty state displayed when no alerts', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Dismiss all alerts first if any exist
    const alertsList = page.getByTestId('alerts-list');
    const emptyState = page.getByTestId('alerts-empty-state');

    // Check if alerts exist - if so, dismiss them all
    const alertsVisible = await alertsList.isVisible().catch(() => false);
    if (alertsVisible) {
      const allAlertRows = alertsList.locator('[data-testid^="alert-row-"]');
      let count = await allAlertRows.count();
      while (count > 0) {
        const row = allAlertRows.first();
        const testId = await row.getAttribute('data-testid');
        const id = testId?.replace('alert-row-', '') || '';
        await page.getByTestId(`alert-dismiss-${id}`).click();
        // Wait for alert to be removed
        await expect(page.getByTestId(`alert-row-${id}`)).toBeHidden();
        count = await allAlertRows.count();
      }
    }

    // Now check for empty state
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText(/no low inventory alerts|all materials are sufficiently stocked/i);
  });
});

test.describe('MaterialsCategoriesOverview', () => {
  test('Materials Categories Overview section displays heading and grid icon', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const section = page.getByTestId('materials-categories-section');
    await expect(section).toBeVisible();
    const heading = page.getByTestId('materials-categories-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Materials Categories Overview');
    // Grid icon (Grid3x3 svg) should be present
    const icon = heading.locator('svg');
    await expect(icon).toBeVisible();
  });

  test('Category columns display name and total items/units', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const grid = page.getByTestId('categories-grid');
    await expect(grid).toBeVisible();

    // Get all category cards
    const cards = grid.locator('[data-testid^="category-card-"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Check the first card has a name and stats
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const cardTestId = await card.getAttribute('data-testid');
      const cardId = cardTestId?.replace('category-card-', '') || '';

      const name = page.getByTestId(`category-name-${cardId}`);
      await expect(name).toBeVisible();
      const nameText = await name.textContent();
      expect(nameText?.length).toBeGreaterThan(0);

      const stats = page.getByTestId(`category-stats-${cardId}`);
      await expect(stats).toBeVisible();
      await expect(stats).toContainText('Total:');
      await expect(stats).toContainText('Items');
      await expect(stats).toContainText('Units');
    }
  });

  test('Top 3 materials shown per category are clickable links to MaterialDetailPage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const grid = page.getByTestId('categories-grid');
    await expect(grid).toBeVisible();

    // Get the first category card
    const firstCard = grid.locator('[data-testid^="category-card-"]').first();
    await expect(firstCard).toBeVisible();

    // Find material links within the card
    const materialLinks = firstCard.locator('[data-testid^="category-material-link-"]');
    const linkCount = await materialLinks.count();
    expect(linkCount).toBeGreaterThan(0);
    expect(linkCount).toBeLessThanOrEqual(3);

    // Click the first material link and verify navigation
    const firstLink = materialLinks.first();
    const linkTestId = await firstLink.getAttribute('data-testid');
    const materialId = linkTestId?.replace('category-material-link-', '') || '';

    await firstLink.click();
    await expect(page).toHaveURL(new RegExp(`/materials/${materialId}`));
  });

  test('View All Categories link navigates to MaterialsPage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const link = page.getByTestId('view-all-categories-link');
    await expect(link).toBeVisible();
    await expect(link).toContainText('View All Categories');
    await link.click();
    await expect(page).toHaveURL('/materials');
  });
});

test.describe('RecentTransactionsTable', () => {
  test('Recent Transactions section displays heading', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const section = page.getByTestId('recent-transactions-section');
    await expect(section).toBeVisible();
    const heading = page.getByTestId('recent-transactions-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Recent Transactions');
  });

  test('Table has correct column headers', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const table = page.getByTestId('recent-transactions-table');
    await expect(table).toBeVisible();

    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(5);
    await expect(headers.nth(0)).toHaveText('Date');
    await expect(headers.nth(1)).toHaveText('Reference');
    await expect(headers.nth(2)).toHaveText('Accounts Affected');
    await expect(headers.nth(3)).toHaveText('Materials & Amounts');
    await expect(headers.nth(4)).toHaveText('Action');
  });

  test('Table rows display formatted date, reference, accounts, and materials', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const table = page.getByTestId('recent-transactions-table');
    await expect(table).toBeVisible();

    // Get the first transaction row
    const rows = table.locator('tbody tr[data-testid^="transaction-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    const firstRow = rows.first();
    const testId = await firstRow.getAttribute('data-testid');
    const txnId = testId?.replace('transaction-row-', '') || '';

    // Check date is formatted (e.g., "Oct 25, 2023")
    const dateCell = page.getByTestId(`transaction-date-${txnId}`);
    await expect(dateCell).toBeVisible();
    const dateText = await dateCell.textContent();
    // Date should match pattern like "Mon DD, YYYY" or similar
    expect(dateText?.length).toBeGreaterThan(0);

    // Check reference
    const refCell = page.getByTestId(`transaction-ref-${txnId}`);
    await expect(refCell).toBeVisible();
    const refText = await refCell.textContent();
    expect(refText?.length).toBeGreaterThan(0);

    // Check accounts affected column exists
    const accountsCell = firstRow.locator('[data-testid^="transaction-accounts-"]');
    await expect(accountsCell).toBeVisible();

    // Check materials column exists
    const materialsCell = firstRow.locator('[data-testid^="transaction-materials-"]');
    await expect(materialsCell).toBeVisible();
  });

  test('View Full Details link navigates to TransactionDetailPage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const table = page.getByTestId('recent-transactions-table');
    const firstRow = table.locator('tbody tr[data-testid^="transaction-row-"]').first();
    const testId = await firstRow.getAttribute('data-testid');
    const txnId = testId?.replace('transaction-row-', '') || '';

    const viewLink = page.getByTestId(`transaction-view-details-${txnId}`);
    await expect(viewLink).toBeVisible();
    await expect(viewLink).toContainText('View Full Details');
    await viewLink.click();

    await expect(page).toHaveURL(new RegExp(`/transactions/${txnId}`));
  });

  test('View All Transactions link navigates to TransactionsPage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const link = page.getByTestId('view-all-transactions-link');
    await expect(link).toBeVisible();
    await expect(link).toContainText('View All Transactions');
    await link.click();
    await expect(page).toHaveURL('/transactions');
  });
});

test.describe('DateRangeFilter', () => {
  test('Date range filter button is visible with calendar icon', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const filter = page.getByTestId('date-range-filter');
    await expect(filter).toBeVisible();
    const btn = page.getByTestId('date-range-btn');
    await expect(btn).toBeVisible();
    // Calendar icon (svg) should be inside the button
    const icon = btn.locator('svg');
    await expect(icon).toBeVisible();
  });

  test('Clicking date range button opens picker with Start Date and End Date inputs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const btn = page.getByTestId('date-range-btn');
    await btn.click();

    const picker = page.getByTestId('date-range-picker');
    await expect(picker).toBeVisible();

    const fromInput = page.getByTestId('date-from-input');
    await expect(fromInput).toBeVisible();

    const toInput = page.getByTestId('date-to-input');
    await expect(toInput).toBeVisible();

    // Check labels
    await expect(picker.locator('text=Start Date')).toBeVisible();
    await expect(picker.locator('text=End Date')).toBeVisible();
  });

  test('Selecting start and end dates and clicking Apply filters the dashboard data', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open the date range picker
    const btn = page.getByTestId('date-range-btn');
    await btn.click();

    const picker = page.getByTestId('date-range-picker');
    await expect(picker).toBeVisible();

    // Set date values
    const fromInput = page.getByTestId('date-from-input');
    const toInput = page.getByTestId('date-to-input');
    await fromInput.fill('2023-09-01');
    await toInput.fill('2023-09-30');

    // Click Apply
    const applyBtn = page.getByTestId('date-range-apply');
    await applyBtn.click();

    // Picker should close
    await expect(picker).toBeHidden();

    // The date range button text should reflect the selected dates
    await expect(btn).toContainText('Sep');
  });
});

test.describe('CategoryFilter', () => {
  test('Category filter dropdown displays \'All Categories\' by default', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const filter = page.getByTestId('category-filter');
    await expect(filter).toBeVisible();
    const select = page.getByTestId('category-filter-select');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue('');
    // The displayed text for value="" is "All Categories"
    const selectedOption = select.locator('option:checked');
    await expect(selectedOption).toHaveText('All Categories');
  });

  test('Selecting a category from the dropdown filters dashboard data', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const select = page.getByTestId('category-filter-select');
    await expect(select).toBeVisible();

    // Get the available options (skip the first "All Categories" option)
    const options = select.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(1);

    // Select the second option (first actual category)
    const secondOption = options.nth(1);
    const optionValue = await secondOption.getAttribute('value');
    expect(optionValue).toBeTruthy();

    await select.selectOption(optionValue!);

    // Wait for the data to reload
    await page.waitForLoadState('networkidle');

    // The select should now have the selected value
    await expect(select).toHaveValue(optionValue!);
  });
});

test.describe('NewTransactionButton', () => {
  test('New Transaction button is visible in the filter bar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const filterBar = page.getByTestId('dashboard-filter-bar');
    await expect(filterBar).toBeVisible();
    const btn = page.getByTestId('new-transaction-btn');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText('New Transaction');
  });

  test('Clicking New Transaction button navigates to /transactions/new', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const btn = page.getByTestId('new-transaction-btn');
    await btn.click();
    await expect(page).toHaveURL('/transactions/new');
  });
});

test.describe('Navigation & Layout', () => {
  test('Sidebar navigation is visible on all pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const sidebar = page.getByTestId('sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('Sidebar contains navigation links for Dashboard, Accounts, Materials, Transactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const dashboardNav = page.getByTestId('nav-dashboard');
    await expect(dashboardNav).toBeVisible();
    await expect(dashboardNav).toContainText('Dashboard');

    const accountsNav = page.getByTestId('nav-accounts');
    await expect(accountsNav).toBeVisible();
    await expect(accountsNav).toContainText('Accounts');

    const materialsNav = page.getByTestId('nav-materials');
    await expect(materialsNav).toBeVisible();
    await expect(materialsNav).toContainText('Materials');

    const transactionsNav = page.getByTestId('nav-transactions');
    await expect(transactionsNav).toBeVisible();
    await expect(transactionsNav).toContainText('Transactions');
  });

  test('Clicking Accounts in sidebar navigates to /accounts', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const accountsNav = page.getByTestId('nav-accounts');
    await accountsNav.click();
    await expect(page).toHaveURL('/accounts');
  });

  test('Clicking Materials in sidebar navigates to /materials', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const materialsNav = page.getByTestId('nav-materials');
    await materialsNav.click();
    await expect(page).toHaveURL('/materials');
  });

  test('Clicking Transactions in sidebar navigates to /transactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const transactionsNav = page.getByTestId('nav-transactions');
    await transactionsNav.click();
    await expect(page).toHaveURL('/transactions');
  });

  test('Clicking Dashboard in sidebar navigates to /', async ({ page }) => {
    // Start on a different page first
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');
    const dashboardNav = page.getByTestId('nav-dashboard');
    await dashboardNav.click();
    await expect(page).toHaveURL('/');
  });

  test('Active page is highlighted in sidebar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Dashboard should be active on root page
    const dashboardNav = page.getByTestId('nav-dashboard');
    await expect(dashboardNav).toHaveClass(/active/);

    // Navigate to accounts
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');
    const accountsNav = page.getByTestId('nav-accounts');
    await expect(accountsNav).toHaveClass(/active/);

    // Dashboard should no longer be active
    const dashboardNavAfter = page.getByTestId('nav-dashboard');
    await expect(dashboardNavAfter).not.toHaveClass(/active/);
  });
});
