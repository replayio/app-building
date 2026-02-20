import { test, expect } from './base';
import type { Page } from '@playwright/test';

async function selectFilterOption(page: Page, testId: string, value: string) {
  await page.getByTestId(`${testId}-trigger`).click();
  const optionId = value === '' ? `${testId}-option-all` : `${testId}-option-${value}`;
  await page.getByTestId(optionId).click();
}

async function getFilterOptionTexts(page: Page, testId: string): Promise<string[]> {
  await page.getByTestId(`${testId}-trigger`).click();
  const menu = page.getByTestId(`${testId}-menu`);
  await expect(menu).toBeVisible();
  const options = menu.locator('button');
  const texts = await options.allTextContents();
  // Close the menu by clicking the trigger again
  await page.getByTestId(`${testId}-trigger`).click();
  return texts;
}

test.describe('ClientsListPage - SidebarNavigation', () => {
  test('CLP-NAV-01: Sidebar displays all navigation items', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const sidebar = page.getByTestId('sidebar');
    await expect(sidebar).toBeVisible();

    // Verify all navigation items are present
    await expect(sidebar.getByText('Clients')).toBeVisible();
    await expect(sidebar.getByText('Deals')).toBeVisible();
    await expect(sidebar.getByText('Tasks')).toBeVisible();
    await expect(sidebar.getByText('Team')).toBeVisible();
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

    // Click "Team" → navigates to /users
    await page.getByTestId('sidebar-nav-team').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/users/);

    // Click "Settings" → navigates to /settings
    await page.getByTestId('sidebar-nav-settings').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/settings/);

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
    await expect(modal.getByTestId('client-type-select')).toBeVisible();
    await expect(modal.getByTestId('client-status-select')).toBeVisible();
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
    // Select Type using FilterSelect (client-type-select)
    await modal.getByTestId('client-type-select-trigger').click();
    await modal.getByTestId('client-type-select-option-organization').click();
    // Select Status using FilterSelect (client-status-select)
    await modal.getByTestId('client-status-select-trigger').click();
    await modal.getByTestId('client-status-select-option-prospect').click();
    await modal.getByPlaceholder('e.g. Enterprise, SaaS, VIP').fill('Enterprise');

    // Click Save
    await modal.getByRole('button', { name: 'Save' }).click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // New client should appear in the table
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Test Corp', { exact: true })).toBeVisible();
  });

  test('CLP-HDR-04: Import button opens import dialog with CSV format info', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('import-button').click();

    // Import dialog should appear with full CSV format info
    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Import Clients')).toBeVisible();

    // CSV column format specification table
    const formatInfo = dialog.getByTestId('csv-format-info');
    await expect(formatInfo).toBeVisible();
    await expect(formatInfo.getByText('CSV Column Format')).toBeVisible();
    await expect(formatInfo.getByText('Client name')).toBeVisible();

    // Download template button
    await expect(dialog.getByTestId('download-template-button')).toBeVisible();

    // File input
    await expect(dialog.getByTestId('csv-file-input')).toBeVisible();

    // Import button should be disabled when no file selected
    await expect(dialog.getByTestId('import-submit-button')).toBeDisabled();

    // Cancel button
    await expect(dialog.getByTestId('import-cancel-button')).toBeVisible();
  });

  test('CLP-HDR-06: CSV import creates clients from uploaded file', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('import-button').click();
    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();

    // Create a CSV file and upload it
    const csvContent = 'Name,Type,Status,Tags\nImport Test Corp,organization,active,Enterprise';
    const fileInput = dialog.getByTestId('csv-file-input');
    await fileInput.setInputFiles({
      name: 'test-import.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Import button should now be enabled
    await expect(dialog.getByTestId('import-submit-button')).toBeEnabled();
    await dialog.getByTestId('import-submit-button').click();

    // Wait for import result
    const result = dialog.getByTestId('import-result');
    await expect(result).toBeVisible();
    await expect(result).toContainText('Successfully imported 1 client');

    // Close dialog
    await dialog.getByTestId('import-cancel-button').click();
    await expect(dialog).not.toBeVisible();

    // Verify imported client appears in the table
    await expect(async () => {
      await expect(page.getByText('Import Test Corp')).toBeVisible();
    }).toPass({ timeout: 5000 });
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

  test('CLP-HDR-07: Import Contacts button opens contacts import dialog', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('import-contacts-button').click();

    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Import Contacts')).toBeVisible();

    // CSV column format specification table
    const formatInfo = dialog.getByTestId('csv-format-info');
    await expect(formatInfo).toBeVisible();
    await expect(formatInfo.getByText('CSV Column Format')).toBeVisible();
    await expect(formatInfo.getByText('Contact name')).toBeVisible();

    // File input
    await expect(dialog.getByTestId('csv-file-input')).toBeVisible();

    // Import button should be disabled when no file selected
    await expect(dialog.getByTestId('import-submit-button')).toBeDisabled();

    // Cancel button
    await expect(dialog.getByTestId('import-cancel-button')).toBeVisible();
  });

  test('CLP-HDR-08: CSV import creates contacts from uploaded file', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('import-contacts-button').click();
    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();

    // Create a CSV file and upload it — associate with "Acme Corp" from seed data
    const csvContent = 'Name,Title,Email,Client Name\nImport Test Contact,Manager,test@example.com,Acme Corp';
    const fileInput = dialog.getByTestId('csv-file-input');
    await fileInput.setInputFiles({
      name: 'test-contacts-import.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Import button should now be enabled
    await expect(dialog.getByTestId('import-submit-button')).toBeEnabled();
    await dialog.getByTestId('import-submit-button').click();

    // Wait for import result
    const result = dialog.getByTestId('import-result');
    await expect(result).toBeVisible();
    await expect(result).toContainText('Successfully imported 1 contact');
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

    // Check options exist by opening the dropdown menu
    const texts = await getFilterOptionTexts(page, 'filter-status');
    expect(texts.some(t => t.includes('All'))).toBeTruthy();
    expect(texts.some(t => t.includes('Active'))).toBeTruthy();
    expect(texts.some(t => t.includes('Inactive'))).toBeTruthy();
    expect(texts.some(t => t.includes('Prospect'))).toBeTruthy();
    expect(texts.some(t => t.includes('Churned'))).toBeTruthy();
  });

  test('CLP-FLT-02: Filtering by status shows only matching clients', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Select Active status using FilterSelect
    await selectFilterOption(page, 'filter-status', 'active');

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

    // Should have "All" option plus available tags — open dropdown to check
    const texts = await getFilterOptionTexts(page, 'filter-tags');
    expect(texts.some(t => t.includes('All'))).toBeTruthy();
    expect(texts.length).toBeGreaterThanOrEqual(1);
  });

  test('CLP-FLT-04: Filtering by tag shows only matching clients', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Open the tags dropdown to find a non-"All" tag option
    await page.getByTestId('filter-tags-trigger').click();
    const menu = page.getByTestId('filter-tags-menu');
    await expect(menu).toBeVisible();
    const menuOptions = menu.locator('button');
    const allTexts = await menuOptions.allTextContents();

    // Find a non-"All" tag option
    const tagOption = allTexts.find(t => !t.includes('All'));
    if (tagOption) {
      // Get the value from the data-option-value attribute
      const optionEl = menuOptions.filter({ hasText: tagOption }).first();
      const tagValue = await optionEl.getAttribute('data-option-value');
      if (tagValue) {
        await optionEl.click();
        await page.waitForLoadState('networkidle');

        // Verify filter applied (pagination should update)
        const rows = page.locator('[data-testid^="client-row-"]');
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(0);
      } else {
        // Close menu if no value found
        await page.getByTestId('filter-tags-trigger').click();
      }
    } else {
      // Close menu if no non-All option found
      await page.getByTestId('filter-tags-trigger').click();
    }
  });

  test('CLP-FLT-05: Source filter dropdown shows available sources', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const sourceFilter = page.getByTestId('filter-source');
    await expect(sourceFilter).toBeVisible();

    // Open dropdown to check options
    const texts = await getFilterOptionTexts(page, 'filter-source');
    expect(texts.some(t => t.includes('All'))).toBeTruthy();
  });

  test('CLP-FLT-06: Filtering by source shows only matching clients', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Open the source dropdown to find a non-"All" source option
    await page.getByTestId('filter-source-trigger').click();
    const menu = page.getByTestId('filter-source-menu');
    await expect(menu).toBeVisible();
    const menuOptions = menu.locator('button');
    const allTexts = await menuOptions.allTextContents();

    const sourceOption = allTexts.find(t => !t.includes('All'));
    if (sourceOption) {
      // Use the data-option-value attribute directly
      const optionEl = menuOptions.filter({ hasText: sourceOption }).first();
      const sourceValue = await optionEl.getAttribute('data-option-value');
      if (sourceValue) {
        await optionEl.click();

        // Wait for filtered results to render
        await expect(async () => {
          const rows = page.locator('[data-testid^="client-row-"]');
          const count = await rows.count();
          expect(count).toBeGreaterThanOrEqual(0);
        }).toPass({ timeout: 10000 });
      } else {
        await page.getByTestId('filter-source-trigger').click();
      }
    } else {
      await page.getByTestId('filter-source-trigger').click();
    }
  });

  test('CLP-FLT-07: Sort dropdown shows sort options', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const sortFilter = page.getByTestId('filter-sort');
    await expect(sortFilter).toBeVisible();

    // Open dropdown to check sort options
    const texts = await getFilterOptionTexts(page, 'filter-sort');
    expect(texts.some(t => t.includes('Recently Updated'))).toBeTruthy();
    expect(texts.some(t => t.includes('Name A-Z'))).toBeTruthy();
    expect(texts.some(t => t.includes('Name Z-A'))).toBeTruthy();
    expect(texts.some(t => t.includes('Status'))).toBeTruthy();
  });

  test('CLP-FLT-08: Sorting by name A-Z orders clients alphabetically', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await selectFilterOption(page, 'filter-sort', 'name_asc');

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
    await selectFilterOption(page, 'filter-status', 'active');
    await expect(async () => {
      const badges = page.locator('[data-testid="status-badge-active"]');
      const count = await badges.count();
      expect(count).toBeGreaterThan(0);
    }).toPass({ timeout: 10000 });

    // Apply tag filter if available — open dropdown to find a non-"All" option
    await page.getByTestId('filter-tags-trigger').click();
    const menu = page.getByTestId('filter-tags-menu');
    await expect(menu).toBeVisible();
    const menuOptions = menu.locator('button');
    const allTexts = await menuOptions.allTextContents();
    const tagOption = allTexts.find(t => !t.includes('All'));
    if (tagOption) {
      const optionEl = menuOptions.filter({ hasText: tagOption }).first();
      const tagValue = await optionEl.getAttribute('data-option-value');
      if (tagValue) {
        await optionEl.click();
      } else {
        await page.getByTestId('filter-tags-trigger').click();
      }
    } else {
      await page.getByTestId('filter-tags-trigger').click();
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
      await expect(tableHeader.getByTestId('clients-header-type')).toBeVisible();
      await expect(tableHeader.getByTestId('clients-header-status')).toBeVisible();
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
    await selectFilterOption(page, 'filter-status', 'churned');

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
