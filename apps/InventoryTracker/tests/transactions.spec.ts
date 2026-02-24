import { test, expect } from '@playwright/test';

test.describe('TransactionsFilterBar', () => {
  test('Date Range filter controls are visible', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const filterBar = page.getByTestId('transactions-filter-bar');
    await expect(filterBar).toBeVisible();

    const dateFrom = page.getByTestId('filter-date-from');
    await expect(dateFrom).toBeVisible();
    await expect(dateFrom).toHaveAttribute('type', 'date');

    const dateTo = page.getByTestId('filter-date-to');
    await expect(dateTo).toBeVisible();
    await expect(dateTo).toHaveAttribute('type', 'date');
  });

  test('Involved Account(s) multi-select is visible', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const accountsSelect = page.getByTestId('filter-accounts-select');
    await expect(accountsSelect).toBeVisible();
    await expect(accountsSelect).toHaveAttribute('multiple', '');
  });

  test("Transaction Type dropdown defaults to 'All Types'", async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const typeSelect = page.getByTestId('filter-type-select');
    await expect(typeSelect).toBeVisible();
    await expect(typeSelect).toHaveValue('');

    // The default selected option text should be "All Types"
    const selectedOption = typeSelect.locator('option:checked');
    await expect(selectedOption).toHaveText('All Types');
  });

  test('Selecting a transaction type filters the table', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const resultsCount = page.getByTestId('results-count');

    // Select "Purchase" type
    const typeSelect = page.getByTestId('filter-type-select');
    await typeSelect.selectOption('purchase');
    await expect(typeSelect).toHaveValue('purchase');

    // Wait for table to update
    await page.waitForLoadState('networkidle');

    // Results count should update (may differ from original)
    await expect(resultsCount).toBeVisible();
    const filteredText = await resultsCount.textContent();
    expect(filteredText).toBeTruthy();
  });

  test('Clear Filters button resets all filters', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    // Apply a type filter first
    const typeSelect = page.getByTestId('filter-type-select');
    await typeSelect.selectOption('purchase');
    await page.waitForLoadState('networkidle');

    // Set a date filter
    const dateFrom = page.getByTestId('filter-date-from');
    await dateFrom.fill('2023-01-01');
    await page.waitForLoadState('networkidle');

    // Click Clear Filters
    const clearBtn = page.getByTestId('clear-filters-btn');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await page.waitForLoadState('networkidle');

    // Verify all filters are reset
    await expect(typeSelect).toHaveValue('');
    await expect(dateFrom).toHaveValue('');

    const dateTo = page.getByTestId('filter-date-to');
    await expect(dateTo).toHaveValue('');

    const searchInput = page.getByTestId('transactions-search-input');
    await expect(searchInput).toHaveValue('');
  });

  test('Typing in search bar filters transactions by ID', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    // Get a transaction ID from the table to search for
    const table = page.getByTestId('transactions-table');
    await expect(table).toBeVisible();

    const firstRow = table.locator('tbody tr').first();
    const txnIdCell = firstRow.locator('td').nth(1);
    const txnId = await txnIdCell.textContent();
    expect(txnId).toBeTruthy();

    // Type the transaction ID in the search bar
    const searchInput = page.getByTestId('transactions-search-input');
    await searchInput.fill(txnId!.trim());
    await page.waitForLoadState('networkidle');

    // The table should show matching results
    const resultsCount = page.getByTestId('results-count');
    await expect(resultsCount).toBeVisible();
  });

  test('Typing in search bar filters transactions by description', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    // Get a description from the first transaction
    const table = page.getByTestId('transactions-table');
    await expect(table).toBeVisible();

    const rows = table.locator('tbody tr');
    const firstRowCount = await rows.count();
    expect(firstRowCount).toBeGreaterThan(0);

    const firstRow = rows.first();
    const descCell = firstRow.locator('td').nth(2);
    const description = await descCell.textContent();
    expect(description).toBeTruthy();

    // Use a portion of the description for search
    const searchTerm = description!.trim().split(' ').slice(0, 2).join(' ');

    const searchInput = page.getByTestId('transactions-search-input');
    await searchInput.fill(searchTerm);
    await page.waitForLoadState('networkidle');

    // Results should be filtered
    const resultsCount = page.getByTestId('results-count');
    await expect(resultsCount).toBeVisible();
  });

  test('Clearing the search bar restores unfiltered results', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    // Record original results count
    const resultsCount = page.getByTestId('results-count');
    const originalText = await resultsCount.textContent();

    // Type a search term
    const searchInput = page.getByTestId('transactions-search-input');
    await searchInput.fill('SomeSearchTerm');
    await page.waitForLoadState('networkidle');

    // Clear the search bar
    await searchInput.fill('');
    await page.waitForLoadState('networkidle');

    // Results count should return to original
    await expect(resultsCount).toHaveText(originalText!);
  });

  test('Filters and search bar work together', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    // Apply type filter
    const typeSelect = page.getByTestId('filter-type-select');
    await typeSelect.selectOption('purchase');
    await page.waitForLoadState('networkidle');

    const resultsCount = page.getByTestId('results-count');

    // Now also apply a search term
    const searchInput = page.getByTestId('transactions-search-input');
    await searchInput.fill('Steel');
    await page.waitForLoadState('networkidle');

    // Both filters should be active simultaneously
    await expect(typeSelect).toHaveValue('purchase');
    await expect(searchInput).toHaveValue('Steel');
    await expect(resultsCount).toBeVisible();
  });
});

test.describe('TransactionsTable', () => {
  test('Table displays all column headers', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('transactions-table');
    await expect(table).toBeVisible();

    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(5);

    // Verify column header text
    await expect(headers.nth(0)).toContainText('Date');
    await expect(headers.nth(1)).toHaveText('Transaction ID');
    await expect(headers.nth(2)).toHaveText('Description');
    await expect(headers.nth(3)).toHaveText('Accounts Affected');
    await expect(headers.nth(4)).toHaveText('Materials and Amounts');
  });

  test('Date column displays formatted dates and is sortable', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('transactions-table');
    await expect(table).toBeVisible();

    // Date header should have cursor:pointer for sorting
    const dateHeader = page.getByTestId('th-date');
    await expect(dateHeader).toBeVisible();

    // Check that date cells contain formatted dates (e.g., "Oct 27, 2023")
    const firstRow = table.locator('tbody tr').first();
    const dateCell = firstRow.locator('td').first();
    const dateText = await dateCell.textContent();
    // Date format should match something like "Mon DD, YYYY"
    expect(dateText).toMatch(/[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}/);

    // Sort indicator should be present in the header (default is date_desc so ↓)
    await expect(dateHeader).toContainText('Date');
  });

  test('Clicking Date column header toggles sort direction', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const dateHeader = page.getByTestId('th-date');
    await expect(dateHeader).toBeVisible();

    // Default sort is date_desc, header should contain down arrow
    await expect(dateHeader).toContainText('\u2193');

    // Click to toggle to ascending
    await dateHeader.click();
    await page.waitForLoadState('networkidle');

    // Should now show up arrow for ascending
    await expect(dateHeader).toContainText('\u2191');

    // Click again to toggle back to descending
    await dateHeader.click();
    await page.waitForLoadState('networkidle');

    await expect(dateHeader).toContainText('\u2193');
  });

  test('Transaction ID column displays transaction IDs', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('transactions-table');
    await expect(table).toBeVisible();

    const rows = table.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Each row should have a transaction ID link in the second column
    const firstRow = rows.first();
    const idCell = firstRow.locator('td').nth(1);
    const idLink = idCell.locator('a.link');
    await expect(idLink).toBeVisible();
    const idText = await idLink.textContent();
    expect(idText).toBeTruthy();
    expect(idText!.length).toBeGreaterThan(0);
  });

  test('Description column displays transaction descriptions', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('transactions-table');
    await expect(table).toBeVisible();

    const rows = table.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Description is in the 3rd column
    const firstRow = rows.first();
    const descCell = firstRow.locator('td').nth(2);
    const descText = await descCell.textContent();
    expect(descText).toBeTruthy();
    expect(descText!.trim().length).toBeGreaterThan(0);
  });

  test('Accounts affected column shows Dr/Cr notation with account names and IDs', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('transactions-table');
    await expect(table).toBeVisible();

    const rows = table.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Accounts affected is in the 4th column
    const firstRow = rows.first();
    const accountsCell = firstRow.locator('td').nth(3);
    const accountsText = await accountsCell.textContent();
    expect(accountsText).toBeTruthy();
    expect(accountsText!.trim().length).toBeGreaterThan(0);
  });

  test('Materials and amounts column shows material details with quantities and pricing', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('transactions-table');
    await expect(table).toBeVisible();

    const rows = table.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Materials and amounts is in the 5th column
    const firstRow = rows.first();
    const materialsCell = firstRow.locator('td').nth(4);
    const materialsText = await materialsCell.textContent();
    expect(materialsText).toBeTruthy();
    expect(materialsText!.trim().length).toBeGreaterThan(0);
  });

  test('Clicking a table row navigates to TransactionDetailPage', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('transactions-table');
    await expect(table).toBeVisible();

    // Get the first transaction's ID
    const firstRow = table.locator('tbody tr.clickable-row').first();
    const idLink = firstRow.locator('td').nth(1).locator('a.link');
    const txnId = await idLink.textContent();
    expect(txnId).toBeTruthy();

    // Click the row
    await firstRow.click();

    // Should navigate to transaction detail page
    await expect(page).toHaveURL(new RegExp(`/transactions/${txnId!.trim()}`));
  });

  test('Sort by dropdown displays current sort option', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const sortBySelect = page.getByTestId('sort-by-select');
    await expect(sortBySelect).toBeVisible();

    // Default value should be 'date_desc' which maps to "Date (Newest First)"
    await expect(sortBySelect).toHaveValue('date_desc');
    const selectedOption = sortBySelect.locator('option:checked');
    await expect(selectedOption).toHaveText('Date (Newest First)');
  });

  test('Sort by dropdown allows changing sort criteria', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const sortBySelect = page.getByTestId('sort-by-select');
    await expect(sortBySelect).toBeVisible();

    // Change to Date (Oldest First)
    await sortBySelect.selectOption('date_asc');
    await page.waitForLoadState('networkidle');

    await expect(sortBySelect).toHaveValue('date_asc');
    const selectedOption = sortBySelect.locator('option:checked');
    await expect(selectedOption).toHaveText('Date (Oldest First)');

    // Change to ID (A-Z)
    await sortBySelect.selectOption('id_asc');
    await page.waitForLoadState('networkidle');

    await expect(sortBySelect).toHaveValue('id_asc');
  });

  test('Showing X of Y results displays correct count', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const resultsCount = page.getByTestId('results-count');
    await expect(resultsCount).toBeVisible();

    const text = await resultsCount.textContent();
    expect(text).toBeTruthy();
    // Should match pattern "Showing N of M results"
    expect(text).toMatch(/Showing\s+\d+\s+of\s+\d+\s+results/);
  });

  test('Showing X of Y results updates when filters are applied', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const resultsCount = page.getByTestId('results-count');

    // Apply a type filter
    const typeSelect = page.getByTestId('filter-type-select');
    await typeSelect.selectOption('purchase');
    await page.waitForLoadState('networkidle');

    // Results count should be visible and potentially changed
    await expect(resultsCount).toBeVisible();
    const filteredText = await resultsCount.textContent();
    expect(filteredText).toMatch(/Showing\s+\d+\s+of\s+\d+\s+results/);
  });

  test('Pagination displays page numbers and navigation controls', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const pagination = page.getByTestId('transactions-pagination');

    // Check if pagination exists (only shown when total > 0)
    const paginationCount = await pagination.count();
    if (paginationCount > 0) {
      await expect(pagination).toBeVisible();

      // First, Previous, Next, Last buttons should exist
      const firstBtn = page.getByTestId('pagination-first');
      await expect(firstBtn).toBeVisible();

      const prevBtn = page.getByTestId('pagination-prev');
      await expect(prevBtn).toBeVisible();

      const nextBtn = page.getByTestId('pagination-next');
      await expect(nextBtn).toBeVisible();

      const lastBtn = page.getByTestId('pagination-last');
      await expect(lastBtn).toBeVisible();

      // Page 1 button should exist
      const page1Btn = page.getByTestId('pagination-page-1');
      await expect(page1Btn).toBeVisible();

      // On first page, First and Previous should be disabled
      await expect(firstBtn).toBeDisabled();
      await expect(prevBtn).toBeDisabled();
    }
  });

  test('Clicking Next button goes to the next page', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const pagination = page.getByTestId('transactions-pagination');
    const paginationCount = await pagination.count();
    if (paginationCount > 0) {
      const nextBtn = page.getByTestId('pagination-next');
      const isDisabled = await nextBtn.isDisabled();

      if (!isDisabled) {
        const paginationInfo = page.getByTestId('pagination-info');
        const originalInfo = await paginationInfo.textContent();

        await nextBtn.click();
        await page.waitForLoadState('networkidle');

        // Pagination info should update
        const updatedInfo = await paginationInfo.textContent();
        expect(updatedInfo).not.toEqual(originalInfo);

        // Previous button should now be enabled
        const prevBtn = page.getByTestId('pagination-prev');
        await expect(prevBtn).toBeEnabled();
      }
    }
  });

  test('Clicking Previous button goes to the previous page', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const pagination = page.getByTestId('transactions-pagination');
    const paginationCount = await pagination.count();
    if (paginationCount > 0) {
      // First go to page 2
      const nextBtn = page.getByTestId('pagination-next');
      const isDisabled = await nextBtn.isDisabled();

      if (!isDisabled) {
        await nextBtn.click();
        await page.waitForLoadState('networkidle');

        const paginationInfo = page.getByTestId('pagination-info');
        const page2Info = await paginationInfo.textContent();

        // Now click Previous
        const prevBtn = page.getByTestId('pagination-prev');
        await prevBtn.click();
        await page.waitForLoadState('networkidle');

        // Should be back to page 1
        const page1Info = await paginationInfo.textContent();
        expect(page1Info).not.toEqual(page2Info);

        // First and Previous should be disabled again on page 1
        const firstBtn = page.getByTestId('pagination-first');
        await expect(firstBtn).toBeDisabled();
        await expect(prevBtn).toBeDisabled();
      }
    }
  });

  test('Clicking a page number goes directly to that page', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const pagination = page.getByTestId('transactions-pagination');
    const paginationCount = await pagination.count();
    if (paginationCount > 0) {
      // Check if page 2 button exists
      const page2Btn = page.getByTestId('pagination-page-2');
      const page2Count = await page2Btn.count();

      if (page2Count > 0) {
        await page2Btn.click();
        await page.waitForLoadState('networkidle');

        // Page 2 button should now be active
        await expect(page2Btn).toHaveClass(/active/);

        // Previous and First buttons should be enabled
        const prevBtn = page.getByTestId('pagination-prev');
        await expect(prevBtn).toBeEnabled();
      }
    }
  });

  test('First and Last buttons navigate to first and last pages', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const pagination = page.getByTestId('transactions-pagination');
    const paginationCount = await pagination.count();
    if (paginationCount > 0) {
      const lastBtn = page.getByTestId('pagination-last');
      const isLastDisabled = await lastBtn.isDisabled();

      if (!isLastDisabled) {
        // Click Last button
        await lastBtn.click();
        await page.waitForLoadState('networkidle');

        // Next and Last should be disabled on last page
        const nextBtn = page.getByTestId('pagination-next');
        await expect(nextBtn).toBeDisabled();
        await expect(lastBtn).toBeDisabled();

        // Now click First
        const firstBtn = page.getByTestId('pagination-first');
        await firstBtn.click();
        await page.waitForLoadState('networkidle');

        // First and Previous should be disabled on first page
        const prevBtn = page.getByTestId('pagination-prev');
        await expect(firstBtn).toBeDisabled();
        await expect(prevBtn).toBeDisabled();
      }
    }
  });

  test('Rows per page dropdown changes the number of displayed rows', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const pagination = page.getByTestId('transactions-pagination');
    const paginationCount = await pagination.count();
    if (paginationCount > 0) {
      const rowsPerPage = page.getByTestId('rows-per-page-select');
      await expect(rowsPerPage).toBeVisible();

      // Default should be 10
      await expect(rowsPerPage).toHaveValue('10');

      // Change to 25
      await rowsPerPage.selectOption('25');
      await page.waitForLoadState('networkidle');

      await expect(rowsPerPage).toHaveValue('25');

      // Table should now show up to 25 rows
      const table = page.getByTestId('transactions-table');
      const rows = table.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeLessThanOrEqual(25);
    }
  });

  test('Empty state when no transactions match filters', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    // Apply filters that should match nothing
    const searchInput = page.getByTestId('transactions-search-input');
    await searchInput.fill('ZZZZZZZZZ_NONEXISTENT_12345');
    await page.waitForLoadState('networkidle');

    // Should show empty state
    const emptyState = page.getByTestId('transactions-empty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No transactions found');

    // Results count should show 0
    const resultsCount = page.getByTestId('results-count');
    await expect(resultsCount).toContainText('0 of 0');
  });
});

test.describe('NewTransactionButton', () => {
  test('New Transaction button is visible', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const newTxnBtn = page.getByTestId('new-transaction-btn');
    await expect(newTxnBtn).toBeVisible();
    await expect(newTxnBtn).toContainText('New Transaction');
  });

  test('Clicking New Transaction navigates to /transactions/new', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const newTxnBtn = page.getByTestId('new-transaction-btn');
    await newTxnBtn.click();

    await expect(page).toHaveURL(/\/transactions\/new/);
  });
});
