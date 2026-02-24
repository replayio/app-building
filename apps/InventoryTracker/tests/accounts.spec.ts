import { test, expect } from '@playwright/test';

test.describe('AccountsPageHeader', () => {
  test('Breadcrumb navigation displays Home > Accounts', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const breadcrumbHome = page.getByTestId('breadcrumb-home');
    await expect(breadcrumbHome).toBeVisible();
    await expect(breadcrumbHome).toHaveText('Home');

    const breadcrumbAccounts = page.getByTestId('breadcrumb-accounts');
    await expect(breadcrumbAccounts).toBeVisible();
    await expect(breadcrumbAccounts).toHaveText('Accounts');
  });

  test('Breadcrumb Home link navigates to Dashboard', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const breadcrumbHome = page.getByTestId('breadcrumb-home');
    await expect(breadcrumbHome).toBeVisible();
    await breadcrumbHome.click();

    await expect(page).toHaveURL('/');
  });

  test('Accounts page displays header with \'Accounts\' title', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const heading = page.getByTestId('page-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Accounts');
  });
});

test.describe('StockAccountsList', () => {
  test('Stock Accounts section heading is displayed', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const heading = page.getByTestId('stock-accounts-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Stock Accounts');
  });

  test('Stock Accounts table has correct column headers', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('stock-accounts-table');
    await expect(table).toBeVisible();

    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(4);
    await expect(headers.nth(0)).toHaveText('Account Name');
    await expect(headers.nth(1)).toHaveText('Account Type');
    await expect(headers.nth(2)).toHaveText('Description');
    await expect(headers.nth(3)).toHaveText('Actions');
  });

  test('Default stock account shows \'(Default)\' indicator in the Account Type column', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('stock-accounts-table');
    const rows = table.locator('tbody tr[data-testid^="account-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    let foundDefault = false;
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const testId = await row.getAttribute('data-testid');
      const id = testId?.replace('account-row-', '') || '';
      const typeCell = page.getByTestId(`account-type-${id}`);
      const typeText = await typeCell.textContent();
      if (typeText?.includes('(Default)')) {
        foundDefault = true;
        await expect(typeCell).toContainText('Stock (Default)');
        break;
      }
    }
    expect(foundDefault).toBe(true);
  });

  test('Stock account rows display Name, Account Type, Description', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('stock-accounts-table');
    const rows = table.locator('tbody tr[data-testid^="account-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Check first row has name, type, and description
    const firstRow = rows.first();
    const testId = await firstRow.getAttribute('data-testid');
    const id = testId?.replace('account-row-', '') || '';

    const nameCell = page.getByTestId(`account-name-${id}`);
    await expect(nameCell).toBeVisible();
    const nameText = await nameCell.textContent();
    expect(nameText?.length).toBeGreaterThan(0);

    const typeCell = page.getByTestId(`account-type-${id}`);
    await expect(typeCell).toBeVisible();
    await expect(typeCell).toContainText('Stock');

    const descCell = page.getByTestId(`account-desc-${id}`);
    await expect(descCell).toBeVisible();
  });
});

test.describe('InputAccountsList', () => {
  test('Input Accounts section heading is displayed', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const heading = page.getByTestId('input-accounts-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Input Accounts');
  });

  test('Input Accounts table has correct column headers', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('input-accounts-table');
    await expect(table).toBeVisible();

    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(4);
    await expect(headers.nth(0)).toHaveText('Account Name');
    await expect(headers.nth(1)).toHaveText('Account Type');
    await expect(headers.nth(2)).toHaveText('Description');
    await expect(headers.nth(3)).toHaveText('Actions');
  });

  test('Default input account shows \'(Default)\' indicator', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('input-accounts-table');
    const rows = table.locator('tbody tr[data-testid^="account-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    let foundDefault = false;
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const testId = await row.getAttribute('data-testid');
      const id = testId?.replace('account-row-', '') || '';
      const typeCell = page.getByTestId(`account-type-${id}`);
      const typeText = await typeCell.textContent();
      if (typeText?.includes('(Default)')) {
        foundDefault = true;
        await expect(typeCell).toContainText('Input (Default)');
        break;
      }
    }
    expect(foundDefault).toBe(true);
  });

  test('Input account rows display Name, Account Type, Description', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('input-accounts-table');
    const rows = table.locator('tbody tr[data-testid^="account-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    const firstRow = rows.first();
    const testId = await firstRow.getAttribute('data-testid');
    const id = testId?.replace('account-row-', '') || '';

    const nameCell = page.getByTestId(`account-name-${id}`);
    await expect(nameCell).toBeVisible();
    const nameText = await nameCell.textContent();
    expect(nameText?.length).toBeGreaterThan(0);

    const typeCell = page.getByTestId(`account-type-${id}`);
    await expect(typeCell).toBeVisible();
    await expect(typeCell).toContainText('Input');

    const descCell = page.getByTestId(`account-desc-${id}`);
    await expect(descCell).toBeVisible();
  });
});

test.describe('OutputAccountsList', () => {
  test('Output Accounts section heading is displayed', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const heading = page.getByTestId('output-accounts-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Output Accounts');
  });

  test('Output Accounts table has correct column headers', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('output-accounts-table');
    await expect(table).toBeVisible();

    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(4);
    await expect(headers.nth(0)).toHaveText('Account Name');
    await expect(headers.nth(1)).toHaveText('Account Type');
    await expect(headers.nth(2)).toHaveText('Description');
    await expect(headers.nth(3)).toHaveText('Actions');
  });

  test('Default output account shows \'(Default)\' indicator', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('output-accounts-table');
    const rows = table.locator('tbody tr[data-testid^="account-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    let foundDefault = false;
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const testId = await row.getAttribute('data-testid');
      const id = testId?.replace('account-row-', '') || '';
      const typeCell = page.getByTestId(`account-type-${id}`);
      const typeText = await typeCell.textContent();
      if (typeText?.includes('(Default)')) {
        foundDefault = true;
        await expect(typeCell).toContainText('Output (Default)');
        break;
      }
    }
    expect(foundDefault).toBe(true);
  });

  test('Output account rows display Name, Account Type, Description', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('output-accounts-table');
    const rows = table.locator('tbody tr[data-testid^="account-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    const firstRow = rows.first();
    const testId = await firstRow.getAttribute('data-testid');
    const id = testId?.replace('account-row-', '') || '';

    const nameCell = page.getByTestId(`account-name-${id}`);
    await expect(nameCell).toBeVisible();
    const nameText = await nameCell.textContent();
    expect(nameText?.length).toBeGreaterThan(0);

    const typeCell = page.getByTestId(`account-type-${id}`);
    await expect(typeCell).toBeVisible();
    await expect(typeCell).toContainText('Output');

    const descCell = page.getByTestId(`account-desc-${id}`);
    await expect(descCell).toBeVisible();
  });
});

test.describe('CreateAccountButton', () => {
  test('Create Stock Account button opens a modal form', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const createBtn = page.getByTestId('create-stock-account-btn');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // Modal should be open
    const modal = page.getByTestId('edit-modal');
    await expect(modal).toBeVisible();
  });

  test('Modal form has Account Type (read-only), Account Name, and Description fields', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const createBtn = page.getByTestId('create-stock-account-btn');
    await createBtn.click();

    const modal = page.getByTestId('edit-modal');
    await expect(modal).toBeVisible();

    // Account Type should be displayed and read-only
    const typeInput = page.getByTestId('account-type-input');
    await expect(typeInput).toBeVisible();
    await expect(typeInput).toBeDisabled();
    await expect(typeInput).toHaveValue('Stock');

    // Account Name field
    const nameInput = page.getByTestId('account-name-input');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toBeEnabled();

    // Description field
    const descInput = page.getByTestId('account-description-input');
    await expect(descInput).toBeVisible();
    await expect(descInput).toBeEnabled();

    // Save and Cancel buttons
    const saveBtn = page.getByTestId('modal-save-btn');
    await expect(saveBtn).toBeVisible();
    const cancelBtn = page.getByTestId('modal-cancel-btn');
    await expect(cancelBtn).toBeVisible();
  });

  test('Saving a new stock account adds it to the Stock Accounts list', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    // Count existing stock account rows
    const table = page.getByTestId('stock-accounts-table');
    const rowsBefore = table.locator('tbody tr[data-testid^="account-row-"]');
    const countBefore = await rowsBefore.count();

    // Open create modal
    const createBtn = page.getByTestId('create-stock-account-btn');
    await createBtn.click();

    const modal = page.getByTestId('edit-modal');
    await expect(modal).toBeVisible();

    // Fill in the form
    const nameInput = page.getByTestId('account-name-input');
    await nameInput.fill('Overflow Storage');
    const descInput = page.getByTestId('account-description-input');
    await descInput.fill('Secondary storage for excess inventory.');

    // Save
    const saveBtn = page.getByTestId('modal-save-btn');
    await saveBtn.click();

    // Modal should close
    await expect(modal).toBeHidden();

    // Wait for the new account to appear
    await page.waitForLoadState('networkidle');

    // Verify the new row appears
    const rowsAfter = table.locator('tbody tr[data-testid^="account-row-"]');
    await expect(rowsAfter).toHaveCount(countBefore + 1);

    // Check the new account exists in the table
    await expect(table).toContainText('Overflow Storage');
  });

  test('Create Input Account button opens a modal form', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const createBtn = page.getByTestId('create-input-account-btn');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const modal = page.getByTestId('edit-modal');
    await expect(modal).toBeVisible();

    // Account Type should be Input
    const typeInput = page.getByTestId('account-type-input');
    await expect(typeInput).toHaveValue('Input');
    await expect(typeInput).toBeDisabled();
  });

  test('Create Output Account button opens a modal form', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const createBtn = page.getByTestId('create-output-account-btn');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const modal = page.getByTestId('edit-modal');
    await expect(modal).toBeVisible();

    // Account Type should be Output
    const typeInput = page.getByTestId('account-type-input');
    await expect(typeInput).toHaveValue('Output');
    await expect(typeInput).toBeDisabled();
  });

  test('Validation error shown if Account Name is empty', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    // Open create stock account modal
    const createBtn = page.getByTestId('create-stock-account-btn');
    await createBtn.click();

    const modal = page.getByTestId('edit-modal');
    await expect(modal).toBeVisible();

    // Leave account name empty, fill description
    const descInput = page.getByTestId('account-description-input');
    await descInput.fill('Some description.');

    // Try to save with empty name
    const saveBtn = page.getByTestId('modal-save-btn');
    await saveBtn.click();

    // Modal should stay open
    await expect(modal).toBeVisible();

    // Validation error should be displayed
    const nameError = page.getByTestId('name-error');
    await expect(nameError).toBeVisible();
    await expect(nameError).toContainText('Account Name is required');
  });
});

test.describe('AccountRowActions', () => {
  test('View action (eye icon) navigates to AccountDetailPage', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    // Get first stock account row
    const table = page.getByTestId('stock-accounts-table');
    const firstRow = table.locator('tbody tr[data-testid^="account-row-"]').first();
    const testId = await firstRow.getAttribute('data-testid');
    const accountId = testId?.replace('account-row-', '') || '';

    // Click the view (eye) icon
    const viewBtn = page.getByTestId(`view-account-${accountId}`);
    await expect(viewBtn).toBeVisible();
    await viewBtn.click();

    // Should navigate to account detail page
    await expect(page).toHaveURL(new RegExp(`/accounts/${accountId}`));
  });

  test('Edit action (pencil icon) opens an edit modal pre-filled with account data', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    // Get a stock account row
    const table = page.getByTestId('stock-accounts-table');
    const rows = table.locator('tbody tr[data-testid^="account-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Find a non-default row (or use first row)
    const row = rows.first();
    const testId = await row.getAttribute('data-testid');
    const accountId = testId?.replace('account-row-', '') || '';

    // Get the current name and description
    const currentName = await page.getByTestId(`account-name-${accountId}`).textContent();
    const currentDesc = await page.getByTestId(`account-desc-${accountId}`).textContent();

    // Click edit icon
    const editBtn = page.getByTestId(`edit-account-${accountId}`);
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Modal should open
    const modal = page.getByTestId('edit-modal');
    await expect(modal).toBeVisible();

    // Fields should be pre-filled
    const nameInput = page.getByTestId('account-name-input');
    await expect(nameInput).toHaveValue(currentName || '');

    const descInput = page.getByTestId('account-description-input');
    await expect(descInput).toHaveValue(currentDesc || '');

    // Account type should be read-only
    const typeInput = page.getByTestId('account-type-input');
    await expect(typeInput).toBeDisabled();
  });

  test('Saving an edited account updates the account row in the table', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    // Get a stock account row (use second row to avoid the default)
    const table = page.getByTestId('stock-accounts-table');
    const rows = table.locator('tbody tr[data-testid^="account-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(1);

    // Use the second row
    const row = rows.nth(1);
    const testId = await row.getAttribute('data-testid');
    const accountId = testId?.replace('account-row-', '') || '';

    // Click edit icon
    const editBtn = page.getByTestId(`edit-account-${accountId}`);
    await editBtn.click();

    const modal = page.getByTestId('edit-modal');
    await expect(modal).toBeVisible();

    // Change the name
    const nameInput = page.getByTestId('account-name-input');
    const originalName = await nameInput.inputValue();
    await nameInput.clear();
    await nameInput.fill(`${originalName} Updated`);

    // Save
    const saveBtn = page.getByTestId('modal-save-btn');
    await saveBtn.click();

    // Modal should close
    await expect(modal).toBeHidden();

    // Wait for update
    await page.waitForLoadState('networkidle');

    // The row should show the updated name
    const updatedName = page.getByTestId(`account-name-${accountId}`);
    await expect(updatedName).toContainText('Updated');
  });

  test('Archive action (archive icon) opens a confirmation dialog', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    // Get a stock account row
    const table = page.getByTestId('stock-accounts-table');
    const rows = table.locator('tbody tr[data-testid^="account-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Use the last row (less likely to be default)
    const lastRow = rows.last();
    const testId = await lastRow.getAttribute('data-testid');
    const accountId = testId?.replace('account-row-', '') || '';

    // Click archive icon
    const archiveBtn = page.getByTestId(`archive-account-${accountId}`);
    await expect(archiveBtn).toBeVisible();
    await archiveBtn.click();

    // Confirmation dialog should appear
    const confirmDialog = page.getByTestId('confirm-dialog');
    await expect(confirmDialog).toBeVisible();

    // Should have confirm and cancel buttons
    const confirmBtn = page.getByTestId('confirm-btn');
    await expect(confirmBtn).toBeVisible();
    const cancelBtn = page.getByTestId('cancel-btn');
    await expect(cancelBtn).toBeVisible();
  });

  test('Confirming archive removes the account from the active list', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('stock-accounts-table');
    const rows = table.locator('tbody tr[data-testid^="account-row-"]');
    const countBefore = await rows.count();
    expect(countBefore).toBeGreaterThan(0);

    // Use the last row
    const lastRow = rows.last();
    const testId = await lastRow.getAttribute('data-testid');
    const accountId = testId?.replace('account-row-', '') || '';

    // Click archive icon
    const archiveBtn = page.getByTestId(`archive-account-${accountId}`);
    await archiveBtn.click();

    // Confirm the archive
    const confirmBtn = page.getByTestId('confirm-btn');
    await confirmBtn.click();

    // Wait for the dialog to close and row to be removed
    await expect(page.getByTestId('confirm-dialog')).toBeHidden();
    await page.waitForLoadState('networkidle');

    // The account row should be gone
    await expect(page.getByTestId(`account-row-${accountId}`)).toBeHidden();
  });

  test('Cancelling archive keeps the account in the list', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('stock-accounts-table');
    const rows = table.locator('tbody tr[data-testid^="account-row-"]');
    const countBefore = await rows.count();
    expect(countBefore).toBeGreaterThan(0);

    // Use the last row
    const lastRow = rows.last();
    const testId = await lastRow.getAttribute('data-testid');
    const accountId = testId?.replace('account-row-', '') || '';
    const accountName = await page.getByTestId(`account-name-${accountId}`).textContent();

    // Click archive icon
    const archiveBtn = page.getByTestId(`archive-account-${accountId}`);
    await archiveBtn.click();

    // Cancel the archive
    const cancelBtn = page.getByTestId('cancel-btn');
    await cancelBtn.click();

    // Dialog should close
    await expect(page.getByTestId('confirm-dialog')).toBeHidden();

    // The account row should still be there
    const accountRow = page.getByTestId(`account-row-${accountId}`);
    await expect(accountRow).toBeVisible();
    await expect(page.getByTestId(`account-name-${accountId}`)).toHaveText(accountName || '');
  });
});
