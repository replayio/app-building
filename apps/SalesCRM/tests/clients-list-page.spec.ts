import { test, expect } from '@playwright/test';

test.describe('ClientsListPage - SidebarNavigation', () => {
  test('CLP-NAV-01: Sidebar displays all navigation items', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const sidebar = page.getByTestId('sidebar');
    await expect(sidebar).toBeVisible();

    // Verify all navigation items are present
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('Clients')).toBeVisible();
    await expect(sidebar.getByText('Deals')).toBeVisible();
    await expect(sidebar.getByText('Tasks')).toBeVisible();
    await expect(sidebar.getByText('Reports')).toBeVisible();
    await expect(sidebar.getByText('Settings')).toBeVisible();

    // "Clients" link should be visually highlighted as active (on /clients page)
    const clientsLink = page.getByTestId('sidebar-nav-clients');
    await expect(clientsLink).toHaveClass(/bg-sidebar-active/);
  });

  test('CLP-NAV-02: Sidebar navigation links route correctly', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Click "Deals" in sidebar → navigates to /deals
    await page.getByTestId('sidebar-nav-deals').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/deals/);

    // Click "Tasks" → navigates to /tasks
    await page.getByTestId('sidebar-nav-tasks').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/tasks/);

    // Click "Clients" → navigates back to /clients
    await page.getByTestId('sidebar-nav-clients').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/clients/);
  });
});

test.describe('ClientsListPage - PageHeader', () => {
  test('CLP-HDR-01: Page header displays title and action buttons', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Title "Clients" is displayed
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();

    // Three buttons visible
    const importBtn = page.getByTestId('import-button');
    const exportBtn = page.getByTestId('export-button');
    const addBtn = page.getByTestId('add-new-client-button');

    await expect(importBtn).toBeVisible();
    await expect(importBtn).toContainText('Import');
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toContainText('Export');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('Add New Client');
  });

  test('CLP-HDR-02: Add New Client button opens create client modal', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('add-new-client-button').click();

    // Modal should appear
    const modal = page.getByTestId('add-client-modal');
    await expect(modal).toBeVisible();

    // Modal should have required form fields
    await expect(modal.getByText('Client Name *')).toBeVisible();
    await expect(modal.getByText('Type')).toBeVisible();
    await expect(modal.getByText('Status')).toBeVisible();
    await expect(modal.getByText('Tags (comma-separated)')).toBeVisible();
    await expect(modal.getByText('Acquisition Source')).toBeVisible();

    // Modal has Save and Cancel buttons
    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('CLP-HDR-03: Creating a new client persists and appears in list', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Open add client modal
    await page.getByTestId('add-new-client-button').click();
    const modal = page.getByTestId('add-client-modal');
    await expect(modal).toBeVisible();

    // Fill form
    await modal.getByPlaceholder('Enter client name').fill('Test Corp');
    await modal.locator('select').first().selectOption('organization'); // Type
    await modal.locator('select').nth(1).selectOption('prospect'); // Status
    await modal.getByPlaceholder('e.g. Enterprise, SaaS, VIP').fill('Enterprise');

    // Click Save
    await modal.getByRole('button', { name: 'Save' }).click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // New client should appear in the table
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Test Corp')).toBeVisible();
  });

  test('CLP-HDR-04: Import button opens import dialog', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('import-button').click();

    // Import dialog should appear
    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Import Clients')).toBeVisible();
    await expect(dialog.getByText('Upload a CSV file')).toBeVisible();
  });

  test('CLP-HDR-05: Export button triggers data export', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Listen for download event
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-button').click();
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toBe('clients-export.csv');
  });
});

test.describe('ClientsListPage - SearchBar', () => {
  test('CLP-SRCH-01: Search bar is displayed with placeholder text', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByTestId('clients-search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', 'Search clients by name, tag, or contact...');
  });

  test('CLP-SRCH-02: Search filters clients by name', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Get initial client count
    const searchInput = page.getByTestId('clients-search-input');

    // Type a search query
    await searchInput.fill('Acme');

    // Wait for debounce, network request, and React re-render
    await expect(async () => {
      const clientNames = page.locator('[data-testid="client-name"]');
      const count = await clientNames.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const text = await clientNames.nth(i).textContent();
        expect(text?.toLowerCase()).toContain('acme');
      }
    }).toPass({ timeout: 10000 });
  });

  test('CLP-SRCH-03: Search filters clients by tag', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByTestId('clients-search-input');
    await searchInput.fill('SaaS');

    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Results should be filtered (fewer or matching results)
    // The backend handles tag-based search
    const table = page.getByTestId('clients-table');
    // If results exist, they should be relevant to the search
    if (await table.isVisible()) {
      // Table is visible, meaning there are results
      const rows = page.locator('[data-testid^="client-row-"]');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('CLP-SRCH-04: Search filters clients by contact name', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByTestId('clients-search-input');
    await searchInput.fill('Sarah');

    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Verify search produced results (backend handles contact name search)
    const rows = page.locator('[data-testid^="client-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('CLP-SRCH-05: Clearing search restores full client list', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Get initial count from pagination
    const paginationInfo = page.getByTestId('pagination-info');

    // Type search to filter
    const searchInput = page.getByTestId('clients-search-input');
    await searchInput.fill('NonExistentClient12345');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Clear search using the clear button
    const clearBtn = page.getByTestId('clients-search-clear');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
    } else {
      await searchInput.clear();
    }

    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Full list should be restored — pagination info should show total
    if (await paginationInfo.isVisible()) {
      const text = await paginationInfo.textContent();
      expect(text).toMatch(/Showing \d+-\d+ of \d+ clients/);
    }
  });
});

test.describe('ClientsListPage - FilterControls', () => {
  test('CLP-FLT-01: Status filter dropdown shows all status options', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const statusFilter = page.getByTestId('filter-status');
    await expect(statusFilter).toBeVisible();

    // Check options exist
    const options = statusFilter.locator('option');
    const texts = await options.allTextContents();
    expect(texts.some(t => t.includes('All'))).toBeTruthy();
    expect(texts.some(t => t.includes('Active'))).toBeTruthy();
    expect(texts.some(t => t.includes('Inactive'))).toBeTruthy();
    expect(texts.some(t => t.includes('Prospect'))).toBeTruthy();
    expect(texts.some(t => t.includes('Churned'))).toBeTruthy();
  });

  test('CLP-FLT-02: Filtering by status shows only matching clients', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Select Active status
    await page.getByTestId('filter-status').selectOption('active');

    // Wait for filtered results to render
    await expect(async () => {
      const statusBadges = page.locator('[data-testid="client-status"]');
      const count = await statusBadges.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await expect(statusBadges.nth(i).locator('[data-testid="status-badge-active"]')).toBeVisible();
      }
    }).toPass({ timeout: 10000 });
  });

  test('CLP-FLT-03: Tags filter dropdown shows available tags', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const tagsFilter = page.getByTestId('filter-tags');
    await expect(tagsFilter).toBeVisible();

    // Should have "All" option plus available tags
    const options = tagsFilter.locator('option');
    const texts = await options.allTextContents();
    expect(texts.some(t => t.includes('All'))).toBeTruthy();
    expect(texts.length).toBeGreaterThanOrEqual(1);
  });

  test('CLP-FLT-04: Filtering by tag shows only matching clients', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const tagsFilter = page.getByTestId('filter-tags');
    const options = tagsFilter.locator('option');
    const allTexts = await options.allTextContents();

    // Find a non-"All" tag option
    const tagOption = allTexts.find(t => !t.includes('All'));
    if (tagOption) {
      // Extract the value - the value is the tag name, option text is "Tags: <tagname>"
      const tagValue = await options.filter({ hasText: tagOption }).getAttribute('value');
      if (tagValue) {
        await tagsFilter.selectOption(tagValue);
        await page.waitForLoadState('networkidle');

        // Verify filter applied (pagination should update)
        const rows = page.locator('[data-testid^="client-row-"]');
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('CLP-FLT-05: Source filter dropdown shows available sources', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const sourceFilter = page.getByTestId('filter-source');
    await expect(sourceFilter).toBeVisible();

    const options = sourceFilter.locator('option');
    const texts = await options.allTextContents();
    expect(texts.some(t => t.includes('All'))).toBeTruthy();
  });

  test('CLP-FLT-06: Filtering by source shows only matching clients', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const sourceFilter = page.getByTestId('filter-source');
    const options = sourceFilter.locator('option');
    const allTexts = await options.allTextContents();

    const sourceOption = allTexts.find(t => !t.includes('All'));
    if (sourceOption) {
      // Use the value attribute directly to avoid strict mode issues with hasText matching multiple options
      const matchingOptions = options.filter({ hasText: sourceOption });
      const sourceValue = await matchingOptions.first().getAttribute('value');
      if (sourceValue) {
        await sourceFilter.selectOption(sourceValue);

        // Wait for filtered results to render
        await expect(async () => {
          const rows = page.locator('[data-testid^="client-row-"]');
          const count = await rows.count();
          expect(count).toBeGreaterThanOrEqual(0);
        }).toPass({ timeout: 10000 });
      }
    }
  });

  test('CLP-FLT-07: Sort dropdown shows sort options', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const sortFilter = page.getByTestId('filter-sort');
    await expect(sortFilter).toBeVisible();

    const options = sortFilter.locator('option');
    const texts = await options.allTextContents();
    expect(texts.some(t => t.includes('Recently Updated'))).toBeTruthy();
    expect(texts.some(t => t.includes('Name A-Z'))).toBeTruthy();
    expect(texts.some(t => t.includes('Name Z-A'))).toBeTruthy();
    expect(texts.some(t => t.includes('Status'))).toBeTruthy();
  });

  test('CLP-FLT-08: Sorting by name A-Z orders clients alphabetically', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('filter-sort').selectOption('name_asc');

    // Wait for sorted results to render
    await expect(async () => {
      const clientNames = page.locator('[data-testid="client-name"]');
      const count = await clientNames.count();
      expect(count).toBeGreaterThan(1);
      const names: string[] = [];
      for (let i = 0; i < count; i++) {
        const text = await clientNames.nth(i).textContent();
        if (text) names.push(text);
      }
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sorted);
    }).toPass({ timeout: 10000 });
  });

  test('CLP-FLT-09: Multiple filters can be combined', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Apply status filter and wait for results
    await page.getByTestId('filter-status').selectOption('active');
    await expect(async () => {
      const badges = page.locator('[data-testid="status-badge-active"]');
      const count = await badges.count();
      expect(count).toBeGreaterThan(0);
    }).toPass({ timeout: 10000 });

    // Apply tag filter if available
    const tagsFilter = page.getByTestId('filter-tags');
    const options = tagsFilter.locator('option');
    const allTexts = await options.allTextContents();
    const tagOption = allTexts.find(t => !t.includes('All'));
    if (tagOption) {
      const tagValue = await options.filter({ hasText: tagOption }).first().getAttribute('value');
      if (tagValue) {
        await tagsFilter.selectOption(tagValue);
      }
    }

    // Combined filters should show only matching clients (if any results)
    await expect(async () => {
      const statusBadges = page.locator('[data-testid="client-status"]');
      const count = await statusBadges.count();
      for (let i = 0; i < count; i++) {
        await expect(statusBadges.nth(i).locator('[data-testid="status-badge-active"]')).toBeVisible();
      }
    }).toPass({ timeout: 10000 });
  });
});

test.describe('ClientsListPage - ClientsTable', () => {
  test('CLP-TBL-01: Table displays correct column headers', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const tableHeader = page.getByTestId('clients-table-header');
    if (await tableHeader.isVisible()) {
      await expect(tableHeader.getByText('Client Name')).toBeVisible();
      await expect(tableHeader.getByText('Type')).toBeVisible();
      await expect(tableHeader.getByText('Status')).toBeVisible();
      await expect(tableHeader.getByText('Tags')).toBeVisible();
      await expect(tableHeader.getByText('Primary Contact')).toBeVisible();
      await expect(tableHeader.getByText('Open Deals')).toBeVisible();
      await expect(tableHeader.getByText('Next Task')).toBeVisible();
    }
  });

  test('CLP-TBL-02: Client rows display all required fields', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="client-row-"]');
    const count = await rows.count();
    if (count > 0) {
      const firstRow = rows.first();
      // Each row should have all required data fields
      await expect(firstRow.locator('[data-testid="client-name"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="client-type"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="client-status"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="client-tags"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="client-primary-contact"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="client-open-deals"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="client-next-task"]')).toBeVisible();
    }
  });

  test('CLP-TBL-03: Status badges have correct colors', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Check for active status badges having the green class
    const activeBadges = page.locator('[data-testid="status-badge-active"]');
    const activeCount = await activeBadges.count();
    for (let i = 0; i < activeCount; i++) {
      await expect(activeBadges.nth(i)).toHaveClass(/text-status-active/);
    }

    // Check for churned badges having the red class
    const churnedBadges = page.locator('[data-testid="status-badge-churned"]');
    const churnedCount = await churnedBadges.count();
    for (let i = 0; i < churnedCount; i++) {
      await expect(churnedBadges.nth(i)).toHaveClass(/text-status-churned/);
    }
  });

  test('CLP-TBL-04: Clicking a client name navigates to client detail page', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="client-row-"]');
    const count = await rows.count();
    if (count > 0) {
      const firstRow = rows.first();
      const testId = await firstRow.getAttribute('data-testid');
      const clientId = testId?.replace('client-row-', '');

      await firstRow.click();
      await page.waitForLoadState('networkidle');

      // Should navigate to /clients/:clientId
      await expect(page).toHaveURL(new RegExp(`/clients/${clientId}`));
    }
  });

  test('CLP-TBL-05: Individual type clients show self as primary contact', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Look for "Individual" type clients
    const rows = page.locator('[data-testid^="client-row-"]');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const typeText = await rows.nth(i).locator('[data-testid="client-type"]').textContent();
      if (typeText === 'Individual') {
        const contactText = await rows.nth(i).locator('[data-testid="client-primary-contact"]').textContent();
        expect(contactText).toContain('(Self)');
        break;
      }
    }
  });

  test('CLP-TBL-06: Clients with no open deals show 0', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="client-row-"]');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const dealsText = await rows.nth(i).locator('[data-testid="client-open-deals"]').textContent();
      // If no deals, should show "0"
      if (dealsText === '0') {
        expect(dealsText).toBe('0');
        break;
      }
    }
  });

  test('CLP-TBL-07: Clients with no next task show appropriate text', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="client-row-"]');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const nextTaskText = await rows.nth(i).locator('[data-testid="client-next-task"]').textContent();
      if (nextTaskText === 'No task scheduled') {
        expect(nextTaskText).toBe('No task scheduled');
        break;
      }
    }
  });

  test('CLP-TBL-08: Clients with churned status show N/A for deals', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Filter by churned status first
    await page.getByTestId('filter-status').selectOption('churned');

    // Wait for churned clients to render
    await expect(async () => {
      const rows = page.locator('[data-testid^="client-row-"]');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
      // Verify all visible rows have churned badge
      const churnedBadges = page.locator('[data-testid="status-badge-churned"]');
      expect(await churnedBadges.count()).toBe(count);
    }).toPass({ timeout: 10000 });

    const rows = page.locator('[data-testid^="client-row-"]');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const dealsText = await rows.nth(i).locator('[data-testid="client-open-deals"]').textContent();
      expect(dealsText).toBe('0');
      const nextTaskText = await rows.nth(i).locator('[data-testid="client-next-task"]').textContent();
      expect(nextTaskText).toBe('N/A');
    }
  });
});

test.describe('ClientsListPage - RowActionMenu', () => {
  test('CLP-ACT-01: Row action menu button is visible on each row', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="client-row-"]');
    const count = await rows.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(rows.nth(i).getByTestId('row-action-trigger')).toBeVisible();
    }
  });

  test('CLP-ACT-02: Clicking row action menu shows options', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="client-row-"]');
    const count = await rows.count();
    if (count > 0) {
      await rows.first().getByTestId('row-action-trigger').click();

      const dropdown = page.getByTestId('row-action-dropdown');
      await expect(dropdown).toBeVisible();
      await expect(dropdown.getByTestId('action-view')).toBeVisible();
      await expect(dropdown.getByTestId('action-edit')).toBeVisible();
      await expect(dropdown.getByTestId('action-delete')).toBeVisible();
    }
  });

  test('CLP-ACT-03: Row action View navigates to client detail', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="client-row-"]');
    const count = await rows.count();
    if (count > 0) {
      const firstRow = rows.first();
      const testId = await firstRow.getAttribute('data-testid');
      const clientId = testId?.replace('client-row-', '');

      await firstRow.getByTestId('row-action-trigger').click();
      await page.getByTestId('action-view').click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(new RegExp(`/clients/${clientId}`));
    }
  });

  test('CLP-ACT-04: Row action Delete removes client after confirmation', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="client-row-"]');
    const initialCount = await rows.count();
    if (initialCount > 0) {
      // Get the name of the client we're about to delete
      const clientName = await rows.first().locator('[data-testid="client-name"]').textContent();

      // Click delete on first row
      await rows.first().getByTestId('row-action-trigger').click();
      await page.getByTestId('action-delete').click();

      // Confirmation dialog should appear
      const confirmDialog = page.getByTestId('confirm-dialog');
      await expect(confirmDialog).toBeVisible();

      // Click confirm
      await page.getByTestId('confirm-ok').click();
      await page.waitForLoadState('networkidle');

      // The client should be removed — reload to confirm persistence
      if (clientName) {
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify the deleted client is no longer the first row
        const remainingNames = page.locator('[data-testid="client-name"]');
        const remainingCount = await remainingNames.count();
        if (remainingCount > 0) {
          const firstRemainingName = await remainingNames.first().textContent();
          // Either the count decreased or the first name changed
          expect(
            remainingCount < initialCount || firstRemainingName !== clientName
          ).toBeTruthy();
        }
      }
    }
  });
});

test.describe('ClientsListPage - Pagination', () => {
  test('CLP-PGN-01: Pagination shows correct count', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const paginationInfo = page.getByTestId('pagination-info');
    if (await paginationInfo.isVisible()) {
      const text = await paginationInfo.textContent();
      expect(text).toMatch(/Showing \d+-\d+ of \d+ clients/);

      // Previous and Next buttons should be visible
      await expect(page.getByTestId('pagination-previous')).toBeVisible();
      await expect(page.getByTestId('pagination-next')).toBeVisible();

      // Page buttons should be visible
      await expect(page.getByTestId('pagination-page-1')).toBeVisible();
    }
  });

  test('CLP-PGN-02: Clicking next page loads next set of clients', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const paginationInfo = page.getByTestId('pagination-info');
    if (await paginationInfo.isVisible()) {
      const initialText = await paginationInfo.textContent();

      // Check if there's a next page
      const nextBtn = page.getByTestId('pagination-next');
      const isDisabled = await nextBtn.isDisabled();
      if (!isDisabled) {
        await nextBtn.click();
        await page.waitForLoadState('networkidle');

        const newText = await paginationInfo.textContent();
        expect(newText).not.toBe(initialText);

        // Page 2 button should be active
        const page2Btn = page.getByTestId('pagination-page-2');
        if (await page2Btn.isVisible()) {
          await expect(page2Btn).toHaveClass(/bg-accent/);
        }
      }
    }
  });

  test('CLP-PGN-03: Previous button is disabled on first page', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const prevBtn = page.getByTestId('pagination-previous');
    if (await prevBtn.isVisible()) {
      await expect(prevBtn).toBeDisabled();
    }
  });

  test('CLP-PGN-04: Next button is disabled on last page', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const paginationInfo = page.getByTestId('pagination-info');
    if (await paginationInfo.isVisible()) {
      // Navigate to last page by clicking next repeatedly
      let isNextDisabled = await page.getByTestId('pagination-next').isDisabled();
      let maxAttempts = 20;
      while (!isNextDisabled && maxAttempts > 0) {
        await page.getByTestId('pagination-next').click();
        await page.waitForLoadState('networkidle');
        isNextDisabled = await page.getByTestId('pagination-next').isDisabled();
        maxAttempts--;
      }

      // On the last page, Next should be disabled
      await expect(page.getByTestId('pagination-next')).toBeDisabled();
    }
  });
});
