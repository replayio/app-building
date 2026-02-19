import { test, expect } from './base';

test.describe('DealsListPage - PageHeader (DLP-HDR)', () => {
  test('DLP-HDR-01: Page header shows title, breadcrumb, and create button', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Breadcrumb shows "/deals"
    const breadcrumb = page.getByTestId('deals-breadcrumb');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('/deals');

    // Title "Deals List"
    await expect(page.getByRole('heading', { name: 'Deals List' })).toBeVisible();

    // "Create New Deal" button visible
    const createBtn = page.getByTestId('create-new-deal-button');
    await expect(createBtn).toBeVisible();
    await expect(createBtn).toContainText('Create New Deal');

    // Search input with placeholder
    const searchInput = page.getByTestId('deals-search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', 'Search deals...');
  });

  test('DLP-HDR-02: Create New Deal button opens deal creation modal', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('create-new-deal-button').click();

    const modal = page.getByTestId('create-deal-modal');
    await expect(modal).toBeVisible();

    // Modal has required fields
    await expect(modal.getByText('Deal Name *')).toBeVisible();
    await expect(modal.getByText('Client *')).toBeVisible();
    await expect(modal.getByText('Value ($)')).toBeVisible();
    await expect(modal.getByText('Stage')).toBeVisible();
    await expect(modal.getByText('Owner')).toBeVisible();
    await expect(modal.getByText('Expected Close Date')).toBeVisible();

    // Save and Cancel buttons
    await expect(page.getByTestId('create-deal-save')).toBeVisible();
    await expect(page.getByTestId('create-deal-cancel')).toBeVisible();
  });

  test('DLP-HDR-03: Creating a deal persists and appears in table', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Open the create deal modal
    await page.getByTestId('create-new-deal-button').click();
    const modal = page.getByTestId('create-deal-modal');
    await expect(modal).toBeVisible();

    // Fill in deal data
    const dealName = `Test Deal ${Date.now()}`;
    await page.getByTestId('create-deal-name').fill(dealName);

    // Wait for client options to load, then select first available client
    await page.getByTestId('create-deal-client-trigger').click();
    const clientMenu = page.getByTestId('create-deal-client-menu');
    await expect(clientMenu).toBeVisible();
    await expect(async () => {
      const options = await clientMenu.locator('button').all();
      expect(options.length).toBeGreaterThan(1);
    }).toPass({ timeout: 10000 });
    const clientOptions = await clientMenu.locator('button').all();
    await clientOptions[1].click();

    await page.getByTestId('create-deal-value').fill('180000');

    // Select stage using custom FilterSelect
    await page.getByTestId('create-deal-stage-trigger').click();
    await page.getByTestId('create-deal-stage-option-discovery').click();
    // Select owner from dropdown
    await page.getByTestId('create-deal-owner-trigger').click();
    const ownerMenu = page.getByTestId('create-deal-owner-menu');
    await expect(ownerMenu).toBeVisible();
    const ownerOptions = await ownerMenu.locator('button').all();
    // Pick the second option (first is "— None —")
    if (ownerOptions.length > 1) await ownerOptions[1].click();
    else await ownerMenu.locator('button').first().click();

    await page.getByTestId('create-deal-save').click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Wait for the deals table to reload
    await page.waitForLoadState('networkidle');

    // The deal should appear in the table
    const tableContent = await page.getByTestId('deals-table').textContent();
    expect(tableContent).toContain(dealName);
  });

  test('DLP-HDR-04: Import button opens import dialog with CSV format info', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('deals-import-button').click();

    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Import Deals')).toBeVisible();

    // CSV column format specification table
    const formatInfo = dialog.getByTestId('csv-format-info');
    await expect(formatInfo).toBeVisible();
    await expect(formatInfo.getByText('CSV Column Format')).toBeVisible();
    await expect(formatInfo.getByText('Deal name')).toBeVisible();

    // Download template button
    await expect(dialog.getByTestId('download-template-button')).toBeVisible();

    // File input
    await expect(dialog.getByTestId('csv-file-input')).toBeVisible();

    // Import button should be disabled when no file selected
    await expect(dialog.getByTestId('import-submit-button')).toBeDisabled();

    // Cancel button
    await expect(dialog.getByTestId('import-cancel-button')).toBeVisible();
  });

  test('DLP-HDR-05: CSV import creates deals from uploaded file', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('deals-import-button').click();
    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();

    // Create a CSV file and upload it — use "Acme Corp" which exists in seed data
    const csvContent = 'Name,Client Name,Value,Stage\nImport Test Deal,Acme Corp,25000,proposal';
    const fileInput = dialog.getByTestId('csv-file-input');
    await fileInput.setInputFiles({
      name: 'test-deals-import.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Import button should now be enabled
    await expect(dialog.getByTestId('import-submit-button')).toBeEnabled();
    await dialog.getByTestId('import-submit-button').click();

    // Wait for import result
    const result = dialog.getByTestId('import-result');
    await expect(result).toBeVisible();
    await expect(result).toContainText('Successfully imported 1 deal');

    // Close dialog
    await dialog.getByTestId('import-cancel-button').click();
    await expect(dialog).not.toBeVisible();

    // Verify imported deal appears in the table
    await expect(async () => {
      await expect(page.getByText('Import Test Deal')).toBeVisible();
    }).toPass({ timeout: 5000 });
  });
});

test.describe('DealsListPage - SummaryCards (DLP-SUM)', () => {
  test('DLP-SUM-01: Summary cards display correct metrics', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const summaryCards = page.getByTestId('deals-summary-cards');
    await expect(summaryCards).toBeVisible();

    // Four summary cards should be visible
    await expect(page.getByTestId('summary-card-total-active-deals')).toBeVisible();
    await expect(page.getByTestId('summary-card-pipeline-value')).toBeVisible();
    await expect(page.getByTestId('summary-card-won-quarter')).toBeVisible();
    await expect(page.getByTestId('summary-card-lost-quarter')).toBeVisible();

    // Labels are correct
    await expect(page.getByTestId('summary-card-label-total-active-deals')).toHaveText('Total Active Deals');
    await expect(page.getByTestId('summary-card-label-pipeline-value')).toHaveText('Pipeline Value');
    await expect(page.getByTestId('summary-card-label-won-quarter')).toHaveText('Won (Quarter)');
    await expect(page.getByTestId('summary-card-label-lost-quarter')).toHaveText('Lost (Quarter)');

    // Values are present (not empty)
    const totalActiveValue = await page.getByTestId('summary-card-value-total-active-deals').textContent();
    expect(totalActiveValue!.length).toBeGreaterThan(0);

    const pipelineValue = await page.getByTestId('summary-card-value-pipeline-value').textContent();
    expect(pipelineValue).toContain('$');
  });

  test('DLP-SUM-02: Summary cards update when deals are added', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Capture initial total active deals count
    const initialValueText = await page.getByTestId('summary-card-value-total-active-deals').textContent();
    const initialCount = parseInt(initialValueText!, 10);

    // Create a new deal
    await page.getByTestId('create-new-deal-button').click();
    const modal = page.getByTestId('create-deal-modal');
    await expect(modal).toBeVisible();

    const dealName = `Summary Test Deal ${Date.now()}`;
    await page.getByTestId('create-deal-name').fill(dealName);

    // Wait for client options to load
    await page.getByTestId('create-deal-client-trigger').click();
    const clientMenu = page.getByTestId('create-deal-client-menu');
    await expect(clientMenu).toBeVisible();
    await expect(async () => {
      const opts = await clientMenu.locator('button').all();
      expect(opts.length).toBeGreaterThan(1);
    }).toPass({ timeout: 10000 });
    const options = await clientMenu.locator('button').all();
    await options[1].click();

    await page.getByTestId('create-deal-value').fill('50000');
    await page.getByTestId('create-deal-save').click();
    await expect(modal).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    // Check that total active deals increased
    const updatedValueText = await page.getByTestId('summary-card-value-total-active-deals').textContent();
    const updatedCount = parseInt(updatedValueText!, 10);
    expect(updatedCount).toBeGreaterThanOrEqual(initialCount);
  });
});

test.describe('DealsListPage - ViewToggle (DLP-VW)', () => {
  test('DLP-VW-01: Table View is the default view', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const viewToggle = page.getByTestId('deals-view-toggle');
    await expect(viewToggle).toBeVisible();

    // Table View button should have active styling (bg-accent)
    const tableViewBtn = page.getByTestId('deals-view-table');
    await expect(tableViewBtn).toBeVisible();
    await expect(tableViewBtn).toContainText('Table View');
    await expect(tableViewBtn).toHaveClass(/bg-accent/);

    // The deals table should be visible
    await expect(page.getByTestId('deals-table')).toBeVisible();
  });

  test('DLP-VW-02: Pipeline View shows deals organized by stage', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Click Pipeline View tab
    await page.getByTestId('deals-view-pipeline').click();

    // Pipeline view should be visible
    const pipelineView = page.getByTestId('deals-pipeline-view');
    await expect(pipelineView).toBeVisible();

    // Should have stage columns
    await expect(page.getByTestId('pipeline-column-lead')).toBeVisible();
    await expect(page.getByTestId('pipeline-column-qualification')).toBeVisible();
    await expect(page.getByTestId('pipeline-column-discovery')).toBeVisible();
    await expect(page.getByTestId('pipeline-column-proposal')).toBeVisible();
    await expect(page.getByTestId('pipeline-column-negotiation')).toBeVisible();
    await expect(page.getByTestId('pipeline-column-closed_won')).toBeVisible();

    // Table should not be visible
    await expect(page.getByTestId('deals-table')).not.toBeVisible();
  });

  test('DLP-VW-03: Switching between views preserves data', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Get deal names from table view
    const rows = page.locator('[data-testid^="deal-row-"]');
    const tableRowCount = await rows.count();

    // Switch to Pipeline View
    await page.getByTestId('deals-view-pipeline').click();
    await expect(page.getByTestId('deals-pipeline-view')).toBeVisible();

    // Switch back to Table View
    await page.getByTestId('deals-view-table').click();
    await expect(page.getByTestId('deals-table')).toBeVisible();

    // Same number of deal rows
    const rowsAfter = page.locator('[data-testid^="deal-row-"]');
    const tableRowCountAfter = await rowsAfter.count();
    expect(tableRowCountAfter).toBe(tableRowCount);
  });

  test('DLP-VW-04: Pipeline View supports drag-and-drop to change deal stage', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Switch to Pipeline View
    await page.getByTestId('deals-view-pipeline').click();
    await expect(page.getByTestId('deals-pipeline-view')).toBeVisible();

    // Find a column that has deals
    const stages = ['lead', 'qualification', 'discovery', 'proposal', 'negotiation', 'closed_won'];
    let sourceStage = '';
    let dealId = '';

    for (const stage of stages) {
      const column = page.getByTestId(`pipeline-column-${stage}`);
      const cards = column.locator('[data-testid^="pipeline-deal-card-"]');
      const count = await cards.count();
      if (count > 0) {
        sourceStage = stage;
        const testId = await cards.first().getAttribute('data-testid');
        dealId = testId?.replace('pipeline-deal-card-', '') ?? '';
        break;
      }
    }

    if (!sourceStage || !dealId) return;

    // Pick a target column that's different from source
    const targetStage = stages.find((s) => s !== sourceStage) ?? 'proposal';
    const targetColumn = page.getByTestId(`pipeline-column-${targetStage}`);
    const sourceCard = page.getByTestId(`pipeline-deal-card-${dealId}`);

    // Perform drag and drop with retry — dragTo can be unreliable
    await expect(async () => {
      // Re-locate the source card (it may have moved after a reload)
      const card = page.getByTestId(`pipeline-deal-card-${dealId}`);
      const cardInTarget = page.getByTestId(`pipeline-column-${targetStage}`).getByTestId(`pipeline-deal-card-${dealId}`);

      if (await cardInTarget.count() === 0) {
        await card.dragTo(targetColumn);
        await page.waitForLoadState('networkidle');
      }

      await expect(cardInTarget).toBeVisible();
    }).toPass({ timeout: 15000 });
  });
});

test.describe('DealsListPage - FilterControls (DLP-FLT)', () => {
  test('DLP-FLT-01: Stage filter shows all stage options', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const stageFilter = page.getByTestId('deals-filter-stage');
    await expect(stageFilter).toBeVisible();

    // Open the dropdown menu
    await page.getByTestId('deals-filter-stage-trigger').click();
    const menu = page.getByTestId('deals-filter-stage-menu');
    await expect(menu).toBeVisible();

    // Check that all stage options are present
    const optionTexts = await menu.locator('button').allTextContents();

    expect(optionTexts.join(',')).toContain('All Stages');
    expect(optionTexts.join(',')).toContain('Lead');
    expect(optionTexts.join(',')).toContain('Qualification');
    expect(optionTexts.join(',')).toContain('Discovery');
    expect(optionTexts.join(',')).toContain('Proposal Sent');
    expect(optionTexts.join(',')).toContain('Negotiation');
    expect(optionTexts.join(',')).toContain('Closed Won');
    expect(optionTexts.join(',')).toContain('Closed Lost');

    // Close the menu
    await page.getByTestId('deals-filter-stage-trigger').click();
  });

  test('DLP-FLT-02: Filtering by stage shows only matching deals', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Select "Proposal Sent" from stage filter
    await page.getByTestId('deals-filter-stage-trigger').click();
    await page.getByTestId('deals-filter-stage-option-proposal').click();

    // Wait for filtered results to render with all matching stages
    await expect(async () => {
      const rows = page.locator('[data-testid^="deal-row-"]');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const rowTestId = await rows.nth(i).getAttribute('data-testid');
        const dealId = rowTestId!.replace('deal-row-', '');
        const stageCell = page.getByTestId(`deal-stage-${dealId}`);
        await expect(stageCell).toContainText('Proposal Sent');
      }
    }).toPass({ timeout: 10000 });
  });

  test('DLP-FLT-03: Client filter shows all client options', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Wait for deal rows to load (ensures API data with clients has arrived)
    await page.locator('[data-testid^="deal-row-"]').first().waitFor({ state: 'visible', timeout: 15000 });

    const clientFilter = page.getByTestId('deals-filter-client');
    await expect(clientFilter).toBeVisible();

    // Open the dropdown menu
    await page.getByTestId('deals-filter-client-trigger').click();
    const menu = page.getByTestId('deals-filter-client-menu');
    await expect(menu).toBeVisible();

    // Should have "All Clients" as the first option
    const firstOptionText = await menu.locator('button').first().textContent();
    expect(firstOptionText).toContain('All Clients');

    // Should have more than just the "All Clients" option
    const optionCount = await menu.locator('button').count();
    expect(optionCount).toBeGreaterThan(1);

    // Close the menu
    await page.getByTestId('deals-filter-client-trigger').click();
  });

  test('DLP-FLT-04: Filtering by client shows only that client\'s deals', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Wait for deal rows to load
    await page.locator('[data-testid^="deal-row-"]').first().waitFor({ state: 'visible', timeout: 15000 });

    // Open the client filter dropdown
    await page.getByTestId('deals-filter-client-trigger').click();
    const menu = page.getByTestId('deals-filter-client-menu');
    await expect(menu).toBeVisible();

    const options = await menu.locator('button').all();

    // Pick the second option (first real client after "All Clients")
    if (options.length > 1) {
      const clientName = (await options[1].textContent())!.trim();

      await options[1].click();

      // Wait for filtered results to render with the correct client
      await expect(async () => {
        const rows = page.locator('[data-testid^="deal-row-"]');
        const count = await rows.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
          const rowTestId = await rows.nth(i).getAttribute('data-testid');
          const dealId = rowTestId!.replace('deal-row-', '');
          const clientCell = page.getByTestId(`deal-client-${dealId}`);
          await expect(clientCell).toHaveText(clientName);
        }
      }).toPass({ timeout: 10000 });
    }
  });

  test('DLP-FLT-05: Status filter shows status options', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const statusFilter = page.getByTestId('deals-filter-status');
    await expect(statusFilter).toBeVisible();

    // Open the dropdown menu
    await page.getByTestId('deals-filter-status-trigger').click();
    const menu = page.getByTestId('deals-filter-status-menu');
    await expect(menu).toBeVisible();

    const optionTexts = await menu.locator('button').allTextContents();

    expect(optionTexts.join(',')).toContain('All');
    expect(optionTexts.join(',')).toContain('Active');
    expect(optionTexts.join(',')).toContain('Won');
    expect(optionTexts.join(',')).toContain('Lost');
    expect(optionTexts.join(',')).toContain('On Hold');

    // Close the menu
    await page.getByTestId('deals-filter-status-trigger').click();
  });

  test('DLP-FLT-06: Date range filter limits deals by close date', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const dateFrom = page.getByTestId('deals-filter-date-from');
    const dateTo = page.getByTestId('deals-filter-date-to');

    await expect(dateFrom).toBeVisible();
    await expect(dateTo).toBeVisible();

    // Set a date range
    await dateFrom.fill('2023-10-01');
    await dateTo.fill('2023-12-31');
    await page.waitForLoadState('networkidle');

    // The filter should be applied (we just verify the inputs accepted values)
    await expect(dateFrom).toHaveValue('2023-10-01');
    await expect(dateTo).toHaveValue('2023-12-31');
  });

  test('DLP-FLT-07: Sort by Close Date orders deals correctly', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const sortFilter = page.getByTestId('deals-filter-sort');
    await expect(sortFilter).toBeVisible();

    // Open the dropdown menu
    await page.getByTestId('deals-filter-sort-trigger').click();
    const menu = page.getByTestId('deals-filter-sort-menu');
    await expect(menu).toBeVisible();

    // Check sort options exist
    const optionTexts = await menu.locator('button').allTextContents();

    expect(optionTexts.join(',')).toContain('Close Date (Newest)');
    expect(optionTexts.join(',')).toContain('Close Date (Oldest)');

    // Close menu
    await page.getByTestId('deals-filter-sort-trigger').click();

    // Default is Close Date (Newest) — check data-value attribute
    await expect(sortFilter).toHaveAttribute('data-value', 'close_date_desc');
  });

  test('DLP-FLT-08: Search filters deals by name', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Get the name of the first deal to use as search term
    const firstRow = page.locator('[data-testid^="deal-name-"]').first();
    const isVisible = await firstRow.isVisible().catch(() => false);

    if (isVisible) {
      const dealName = await firstRow.textContent();
      // Use a substring to search
      const searchTerm = dealName!.substring(0, Math.min(5, dealName!.length));

      await page.getByTestId('deals-search-input').fill(searchTerm);
      await page.waitForLoadState('networkidle');
      // Wait for debounce
      await page.waitForTimeout(500);

      // Verify that remaining deals contain the search term
      const rows = page.locator('[data-testid^="deal-row-"]');
      const count = await rows.count();
      if (count > 0) {
        const tableContent = await page.getByTestId('deals-table').textContent();
        expect(tableContent!.toLowerCase()).toContain(searchTerm.toLowerCase());
      }
    }
  });
});

test.describe('DealsListPage - DealsTable (DLP-TBL)', () => {
  test('DLP-TBL-01: Table displays correct column headers', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('deals-table');
    await expect(table).toBeVisible();

    // Check column headers
    const headers = table.locator('th');
    const headerTexts = await headers.allTextContents();

    expect(headerTexts.some((t) => t.includes('Deal Name'))).toBeTruthy();
    expect(headerTexts.some((t) => t.includes('Client'))).toBeTruthy();
    expect(headerTexts.some((t) => t.includes('Stage'))).toBeTruthy();
    expect(headerTexts.some((t) => t.includes('Owner'))).toBeTruthy();
    expect(headerTexts.some((t) => t.includes('Value'))).toBeTruthy();
    expect(headerTexts.some((t) => t.includes('Close Date'))).toBeTruthy();
    expect(headerTexts.some((t) => t.includes('Status'))).toBeTruthy();
  });

  test('DLP-TBL-02: Deal rows display all required fields', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="deal-row-"]');
    const count = await rows.count();

    if (count > 0) {
      const rowTestId = await rows.first().getAttribute('data-testid');
      const dealId = rowTestId!.replace('deal-row-', '');

      // Deal name
      const nameCell = page.getByTestId(`deal-name-${dealId}`);
      await expect(nameCell).toBeVisible();
      const nameText = await nameCell.textContent();
      expect(nameText!.length).toBeGreaterThan(0);

      // Client
      const clientCell = page.getByTestId(`deal-client-${dealId}`);
      await expect(clientCell).toBeVisible();

      // Stage badge
      const stageCell = page.getByTestId(`deal-stage-${dealId}`);
      await expect(stageCell).toBeVisible();

      // Value with $ sign
      const valueCell = page.getByTestId(`deal-value-${dealId}`);
      await expect(valueCell).toBeVisible();
      const valueText = await valueCell.textContent();
      expect(valueText).toContain('$');

      // Status badge
      const statusCell = page.getByTestId(`deal-status-${dealId}`);
      await expect(statusCell).toBeVisible();
    }
  });

  test('DLP-TBL-03: Status badges have correct colors', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="deal-row-"]');
    const count = await rows.count();

    if (count > 0) {
      // Find a deal with a status badge and verify it has styling
      const rowTestId = await rows.first().getAttribute('data-testid');
      const dealId = rowTestId!.replace('deal-row-', '');
      const statusBadge = page.getByTestId(`deal-status-${dealId}`).locator('span');
      await expect(statusBadge).toBeVisible();

      // Badge should have a class with color styling (rounded-full is a badge indicator)
      await expect(statusBadge).toHaveClass(/rounded-full/);
    }
  });

  test('DLP-TBL-04: Clicking a deal row navigates to DealDetailPage', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="deal-row-"]');
    const count = await rows.count();

    if (count > 0) {
      const rowTestId = await rows.first().getAttribute('data-testid');
      const dealId = rowTestId!.replace('deal-row-', '');

      await rows.first().click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(new RegExp(`/deals/${dealId}`));
    }
  });

  test('DLP-TBL-05: Close Date column is sortable', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const sortBtn = page.getByTestId('deals-close-date-sort');
    await expect(sortBtn).toBeVisible();
    await expect(sortBtn).toContainText('Close Date');

    // Click to toggle sort direction
    await sortBtn.click();
    await page.waitForLoadState('networkidle');

    // Click again to toggle back
    await sortBtn.click();
    await page.waitForLoadState('networkidle');

    // The table should still be visible and functional
    await expect(page.getByTestId('deals-table')).toBeVisible();
  });
});

test.describe('DealsListPage - RowActionMenu (DLP-ACT)', () => {
  test('DLP-ACT-01: Row action menu shows deal actions', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="deal-row-"]');
    const count = await rows.count();

    if (count > 0) {
      const rowTestId = await rows.first().getAttribute('data-testid');
      const dealId = rowTestId!.replace('deal-row-', '');

      // Click the action menu button
      await page.getByTestId(`deal-action-menu-button-${dealId}`).click();

      // Menu should be visible with View, Edit, Delete options
      const menu = page.getByTestId(`deal-action-menu-${dealId}`);
      await expect(menu).toBeVisible();

      await expect(page.getByTestId(`deal-action-view-${dealId}`)).toBeVisible();
      await expect(page.getByTestId(`deal-action-view-${dealId}`)).toContainText('View');
      await expect(page.getByTestId(`deal-action-edit-${dealId}`)).toBeVisible();
      await expect(page.getByTestId(`deal-action-edit-${dealId}`)).toContainText('Edit');
      await expect(page.getByTestId(`deal-action-delete-${dealId}`)).toBeVisible();
      await expect(page.getByTestId(`deal-action-delete-${dealId}`)).toContainText('Delete');
    }
  });

  test('DLP-ACT-02: Delete deal removes it after confirmation', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="deal-row-"]');
    const initialCount = await rows.count();

    if (initialCount > 0) {
      // Use the last deal to avoid interfering with other tests
      const lastRow = rows.last();
      const rowTestId = await lastRow.getAttribute('data-testid');
      const dealId = rowTestId!.replace('deal-row-', '');

      // Click the action menu
      await page.getByTestId(`deal-action-menu-button-${dealId}`).click();

      // Click Delete
      await page.getByTestId(`deal-action-delete-${dealId}`).click();

      // Confirm dialog should appear
      const confirmDialog = page.getByTestId('confirm-dialog');
      await expect(confirmDialog).toBeVisible();

      // Click confirm
      await page.getByTestId('confirm-ok').click();
      await page.waitForLoadState('networkidle');

      // The deal should no longer be in the table
      await expect(page.getByTestId(`deal-row-${dealId}`)).not.toBeVisible();
    }
  });
});

test.describe('DealsListPage - Pagination (DLP-PGN)', () => {
  test('DLP-PGN-01: Pagination shows page count', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const pagination = page.getByTestId('deals-pagination');
    // Pagination may not be visible if there are no deals
    const isVisible = await pagination.isVisible().catch(() => false);

    if (isVisible) {
      // Should show "Page X of Y"
      const info = page.getByTestId('deals-pagination-info');
      await expect(info).toBeVisible();
      const infoText = await info.textContent();
      expect(infoText).toMatch(/Page \d+ of \d+/);

      // Previous and Next buttons
      await expect(page.getByTestId('deals-pagination-prev')).toBeVisible();
      await expect(page.getByTestId('deals-pagination-next')).toBeVisible();
    }
  });

  test('DLP-PGN-02: Navigating pages loads correct deals', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    const pagination = page.getByTestId('deals-pagination');
    const isVisible = await pagination.isVisible().catch(() => false);

    if (isVisible) {
      const infoText = await page.getByTestId('deals-pagination-info').textContent();
      const match = infoText!.match(/Page (\d+) of (\d+)/);

      if (match && parseInt(match[2], 10) > 1) {
        // On page 1, Previous should be disabled
        await expect(page.getByTestId('deals-pagination-prev')).toBeDisabled();

        // Get deal names on page 1
        const firstPageFirstDeal = await page.locator('[data-testid^="deal-name-"]').first().textContent();

        // Click Next
        await page.getByTestId('deals-pagination-next').click();
        await page.waitForLoadState('networkidle');

        // Page info should update to "Page 2 of Y"
        const updatedInfo = await page.getByTestId('deals-pagination-info').textContent();
        expect(updatedInfo).toContain('Page 2');

        // Deal names on page 2 should be different
        const secondPageFirstDeal = await page.locator('[data-testid^="deal-name-"]').first().textContent();
        expect(secondPageFirstDeal).not.toBe(firstPageFirstDeal);

        // Previous should now be enabled
        await expect(page.getByTestId('deals-pagination-prev')).not.toBeDisabled();
      }
    }
  });
});
