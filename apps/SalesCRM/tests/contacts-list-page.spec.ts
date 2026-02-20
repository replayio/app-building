import { test, expect } from './base';

test.describe('ContactsListPage - PageHeader', () => {
  test('CTLP-HDR-01: Page header displays title and action buttons', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    // Title "Contacts" is displayed
    await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible();

    // Three buttons visible
    const importBtn = page.getByTestId('contacts-import-button');
    const exportBtn = page.getByTestId('contacts-export-button');
    const addBtn = page.getByTestId('add-new-contact-button');

    await expect(importBtn).toBeVisible();
    await expect(importBtn).toContainText('Import');
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toContainText('Export');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('Add Contact');
  });

  test('CTLP-HDR-02: Add Contact button opens create contact modal', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('add-new-contact-button').click();

    const modal = page.getByTestId('add-contact-modal');
    await expect(modal).toBeVisible();

    // Check form fields
    await expect(page.getByTestId('contact-name-input')).toBeVisible();
    await expect(page.getByTestId('contact-title-input')).toBeVisible();
    await expect(page.getByTestId('contact-email-input')).toBeVisible();
    await expect(page.getByTestId('contact-phone-input')).toBeVisible();
    await expect(page.getByTestId('contact-location-input')).toBeVisible();
    await expect(page.getByTestId('contact-save-button')).toBeVisible();
    await expect(page.getByTestId('contact-cancel-button')).toBeVisible();
  });

  test('CTLP-HDR-03: Creating a new contact persists and appears in list', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('add-new-contact-button').click();
    await expect(page.getByTestId('add-contact-modal')).toBeVisible();

    await page.getByTestId('contact-name-input').fill('Test Person');
    await page.getByTestId('contact-title-input').fill('Engineer');
    await page.getByTestId('contact-email-input').fill('test@example.com');
    await page.getByTestId('contact-save-button').click();

    // Modal should close
    await expect(page.getByTestId('add-contact-modal')).not.toBeVisible();

    // New contact should appear in table
    await expect(page.getByTestId('contacts-table').getByText('Test Person')).toBeVisible({ timeout: 5000 });

    // Verify persistence by reloading
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('contacts-table').getByText('Test Person')).toBeVisible();
  });
  test('CTLP-HDR-04: Import button opens import dialog with CSV format info', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('contacts-import-button').click();

    // Import dialog should appear
    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Import Contacts')).toBeVisible();

    // CSV column format specification table
    const formatInfo = dialog.getByTestId('csv-format-info');
    await expect(formatInfo).toBeVisible();
    await expect(formatInfo.getByText('CSV Column Format')).toBeVisible();
    await expect(formatInfo.getByText('Contact name')).toBeVisible();

    // Download template button
    await expect(dialog.getByTestId('download-template-button')).toBeVisible();

    // File input
    await expect(dialog.getByTestId('csv-file-input')).toBeVisible();

    // Import button should be disabled when no file selected
    await expect(dialog.getByTestId('import-submit-button')).toBeDisabled();

    // Cancel button
    await expect(dialog.getByTestId('import-cancel-button')).toBeVisible();
  });

  test('CTLP-HDR-05: CSV import creates contacts from uploaded file', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('contacts-import-button').click();
    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();

    // Create a CSV file and upload it
    const csvContent = 'Name,Title,Email,Phone,Location\nImport Test Contact,Manager,importtest@example.com,555-0199,New York';
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

    // Close dialog
    await dialog.getByTestId('import-cancel-button').click();
    await expect(dialog).not.toBeVisible();

    // Verify imported contact appears in the table
    await expect(page.getByTestId('contacts-table').getByText('Import Test Contact')).toBeVisible({ timeout: 5000 });
  });

  test('CTLP-HDR-06: Export button triggers data export', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    // Listen for download event
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('contacts-export-button').click();
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toBe('contacts-export.csv');
  });

  test('CTLP-HDR-07: Cancel button on Add Contact modal closes without creating a contact', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    // Open the Add Contact modal
    await page.getByTestId('add-new-contact-button').click();
    const modal = page.getByTestId('add-contact-modal');
    await expect(modal).toBeVisible();

    // Fill in a name so we can verify it doesn't get created
    const contactName = `Cancel Test Contact ${Date.now()}`;
    await page.getByTestId('contact-name-input').fill(contactName);

    // Click Cancel
    await page.getByTestId('contact-cancel-button').click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // The contact should NOT appear in the table
    await expect(
      page.locator('[data-testid="contact-name"]').filter({ hasText: contactName })
    ).toHaveCount(0);
  });
});

test.describe('ContactsListPage - SearchBar', () => {
  test('CTLP-SRCH-01: Search bar is displayed with placeholder text', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByTestId('contacts-search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Search contacts by name, email, title, or location/);
  });

  test('CTLP-SRCH-02: Search filters contacts by name', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    // Wait for contacts to load
    await expect(page.getByTestId('contacts-table')).toBeVisible();

    // Get initial count of rows
    const initialRows = await page.getByTestId('contacts-table').locator('[data-testid^="contact-row-"]').count();

    // If there are contacts, search for one
    if (initialRows > 0) {
      // Get the first contact's name
      const firstName = await page.getByTestId('contacts-table').locator('[data-testid="contact-name"]').first().textContent();

      // Type in search bar
      await page.getByTestId('contacts-search-input').fill(firstName ?? '');

      // Wait for search to filter
      await page.waitForTimeout(500);

      // Filtered results should contain the searched name
      await expect(page.getByTestId('contacts-table').getByText(firstName ?? '')).toBeVisible();
    }
  });

  test('CTLP-SRCH-03: Clearing search restores full contact list', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('contacts-table')).toBeVisible();

    // Type something in search
    await page.getByTestId('contacts-search-input').fill('searchterm');
    await page.waitForTimeout(500);

    // Clear the search
    const clearButton = page.getByTestId('contacts-search-clear');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    } else {
      await page.getByTestId('contacts-search-input').fill('');
    }
    await page.waitForTimeout(500);

    // Search input should be empty
    await expect(page.getByTestId('contacts-search-input')).toHaveValue('');
  });
});

test.describe('ContactsListPage - Table', () => {
  test('CTLP-TBL-01: Contacts table displays all columns', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('contacts-table');

    // Check header columns
    const header = page.getByTestId('contacts-table-header');
    await expect(header.getByText('Name')).toBeVisible();
    await expect(header.getByText('Title')).toBeVisible();
    await expect(header.getByText('Email')).toBeVisible();
    await expect(header.getByText('Phone')).toBeVisible();
    await expect(header.getByText('Location')).toBeVisible();
    await expect(header.getByText('Associated Clients')).toBeVisible();

    // If there are rows, verify data is displayed
    const rows = table.locator('[data-testid^="contact-row-"]');
    const count = await rows.count();
    if (count > 0) {
      await expect(rows.first().getByTestId('contact-name')).toBeVisible();
    }
  });

  test('CTLP-TBL-02: Clicking a contact row navigates to person detail page', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('contacts-table');
    const rows = table.locator('[data-testid^="contact-row-"]');
    const count = await rows.count();

    if (count > 0) {
      await rows.first().click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/individuals\//);
    }
  });
});

test.describe('ContactsListPage - Pagination', () => {
  test('CTLP-PGN-01: Pagination shows contact count', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    // Pagination should show count if there are contacts
    const pagination = page.getByTestId('contacts-pagination');
    const paginationInfo = page.getByTestId('contacts-pagination-info');

    // If contacts exist, pagination should be visible
    const tableOrEmpty = page.getByTestId('contacts-table');
    if (await tableOrEmpty.isVisible()) {
      const rows = tableOrEmpty.locator('[data-testid^="contact-row-"]');
      const count = await rows.count();
      if (count > 0) {
        await expect(pagination).toBeVisible();
        await expect(paginationInfo).toContainText(/Showing \d+-\d+ of \d+ contacts/);
      }
    }
  });

  test('CTLP-PGN-02: Clicking next page loads next set of contacts', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    const paginationInfo = page.getByTestId('contacts-pagination-info');
    if (await paginationInfo.isVisible()) {
      const initialText = await paginationInfo.textContent();

      // Check if there's a next page
      const nextBtn = page.getByTestId('contacts-pagination-next');
      const isDisabled = await nextBtn.isDisabled();
      if (!isDisabled) {
        await nextBtn.click();
        await page.waitForLoadState('networkidle');

        const newText = await paginationInfo.textContent();
        expect(newText).not.toBe(initialText);

        // Page 2 button should be highlighted
        const page2Btn = page.getByTestId('contacts-pagination-page-2');
        if (await page2Btn.isVisible()) {
          await expect(page2Btn).toHaveClass(/bg-accent/);
        }
      }
    }
  });

  test('CTLP-PGN-03: Previous button is disabled on first page', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    const prevBtn = page.getByTestId('contacts-pagination-previous');
    if (await prevBtn.isVisible()) {
      await expect(prevBtn).toBeDisabled();
    }
  });

  test('CTLP-PGN-04: Next button is disabled on last page', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    const paginationInfo = page.getByTestId('contacts-pagination-info');
    if (await paginationInfo.isVisible()) {
      // Navigate to last page by clicking next repeatedly
      let isNextDisabled = await page.getByTestId('contacts-pagination-next').isDisabled();
      let maxAttempts = 20;
      while (!isNextDisabled && maxAttempts > 0) {
        await page.getByTestId('contacts-pagination-next').click();
        await page.waitForLoadState('networkidle');
        isNextDisabled = await page.getByTestId('contacts-pagination-next').isDisabled();
        maxAttempts--;
      }

      // On the last page, Next should be disabled
      await expect(page.getByTestId('contacts-pagination-next')).toBeDisabled();
    }
  });
});
