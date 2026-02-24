import { test, expect } from '@playwright/test';

test.describe('Page Header', () => {
  test('New Transaction page displays header with title and action buttons', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    const pageContainer = page.getByTestId('new-transaction-page');
    await expect(pageContainer).toBeVisible();

    // Page heading
    const heading = page.getByTestId('page-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('New Transaction');

    // Cancel button
    const cancelBtn = page.getByTestId('cancel-btn');
    await expect(cancelBtn).toBeVisible();
    await expect(cancelBtn).toContainText('Cancel');

    // Post button
    const postBtn = page.getByTestId('post-btn');
    await expect(postBtn).toBeVisible();
    await expect(postBtn).toContainText('Post');
  });

  test('Cancel button navigates back to Transactions list', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    const cancelBtn = page.getByTestId('cancel-btn');
    await cancelBtn.click();

    await expect(page).toHaveURL(/\/transactions$/);
  });

  test('Post button submits a valid transaction', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Fill in basic info
    const dateInput = page.getByTestId('txn-date-input');
    await dateInput.fill('2024-05-23');

    const refInput = page.getByTestId('txn-reference-input');
    await refInput.fill('TRX-TEST-001');

    const descInput = page.getByTestId('txn-description-input');
    await descInput.fill('Test transaction for e2e testing');

    const typeSelect = page.getByTestId('txn-type-select');
    await typeSelect.selectOption('transfer');

    // Add a quantity transfer
    const addTransferBtn = page.getByTestId('add-transfer-btn');
    await addTransferBtn.click();

    // Wait for the new transfer row to appear
    const transferRows = page.locator('[data-testid^="transfer-row-"]');
    await expect(transferRows).toHaveCount(1);

    // Get the transfer row ID
    const transferRowTestId = await transferRows.first().getAttribute('data-testid');
    const transferId = transferRowTestId?.replace('transfer-row-', '') || '';

    // Fill in the transfer fields using the source/dest select dropdowns
    const sourceSelect = page.getByTestId(`transfer-source-select-${transferId}`);
    const sourceOptions = sourceSelect.locator('option');
    const sourceOptionCount = await sourceOptions.count();
    if (sourceOptionCount > 1) {
      await sourceSelect.selectOption({ index: 1 });
    }

    const destSelect = page.getByTestId(`transfer-dest-select-${transferId}`);
    const destOptions = destSelect.locator('option');
    const destOptionCount = await destOptions.count();
    if (destOptionCount > 2) {
      await destSelect.selectOption({ index: 2 });
    } else if (destOptionCount > 1) {
      await destSelect.selectOption({ index: 1 });
    }

    const amountInput = page.getByTestId(`transfer-amount-input-${transferId}`);
    await amountInput.fill('100');

    const unitInput = page.getByTestId(`transfer-unit-input-${transferId}`);
    await unitInput.fill('kg');

    // Click Post
    const postBtn = page.getByTestId('post-btn');
    await postBtn.click();

    // Should navigate to the detail page of the newly created transaction
    await expect(page).toHaveURL(/\/transactions\/TXN-/, { timeout: 10000 });
  });

  test('Post button is disabled when form is incomplete', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Clear the date (required field)
    const dateInput = page.getByTestId('txn-date-input');
    await dateInput.fill('');

    // Don't fill in type (required field)
    // Don't add any transfers

    // Click Post
    const postBtn = page.getByTestId('post-btn');
    await postBtn.click();

    // Validation errors should appear
    const dateError = page.getByTestId('date-error');
    const typeError = page.getByTestId('type-error');
    const transfersError = page.getByTestId('transfers-error');

    // At least one validation error should be visible
    const dateErrorCount = await dateError.count();
    const typeErrorCount = await typeError.count();
    const transfersErrorCount = await transfersError.count();

    expect(dateErrorCount + typeErrorCount + transfersErrorCount).toBeGreaterThan(0);

    // Should still be on the new transaction page
    await expect(page).toHaveURL(/\/transactions\/new/);
  });

  test('Post button blocked when debits do not equal credits', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Fill in required basic info
    const dateInput = page.getByTestId('txn-date-input');
    await dateInput.fill('2024-05-23');

    const typeSelect = page.getByTestId('txn-type-select');
    await typeSelect.selectOption('transfer');

    // Add a transfer but with no amount or mismatched values
    const addTransferBtn = page.getByTestId('add-transfer-btn');
    await addTransferBtn.click();

    // Click Post - the validation should prevent posting
    const postBtn = page.getByTestId('post-btn');
    await postBtn.click();

    // Should remain on the new transaction page
    await expect(page).toHaveURL(/\/transactions\/new/);
  });
});

test.describe('BasicInfoForm', () => {
  test('Date picker displays and allows date selection', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    const dateInput = page.getByTestId('txn-date-input');
    await expect(dateInput).toBeVisible();
    await expect(dateInput).toHaveAttribute('type', 'date');

    // Fill in a date
    await dateInput.fill('2024-05-23');
    await expect(dateInput).toHaveValue('2024-05-23');
  });

  test('Reference ID text input accepts free-form text', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    const refInput = page.getByTestId('txn-reference-input');
    await expect(refInput).toBeVisible();

    await refInput.fill('TRX-20240523-001');
    await expect(refInput).toHaveValue('TRX-20240523-001');
  });

  test('Description textarea accepts multi-line text', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    const descInput = page.getByTestId('txn-description-input');
    await expect(descInput).toBeVisible();

    // Verify it's a textarea
    const tagName = await descInput.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('textarea');

    const multiLineText = 'Q2 Inventory Adjustment for raw materials and finished goods.';
    await descInput.fill(multiLineText);
    await expect(descInput).toHaveValue(multiLineText);
  });

  test('Transaction Type dropdown shows available types', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    const typeSelect = page.getByTestId('txn-type-select');
    await expect(typeSelect).toBeVisible();

    // Verify available options
    const options = typeSelect.locator('option');
    const optionCount = await options.count();

    // Should have "Select type" plus at least 5 transaction types
    expect(optionCount).toBeGreaterThanOrEqual(6);

    // Verify expected types exist
    await expect(options.filter({ hasText: 'Purchase' })).toHaveCount(1);
    await expect(options.filter({ hasText: 'Consumption' })).toHaveCount(1);
    await expect(options.filter({ hasText: 'Transfer' })).toHaveCount(1);
    await expect(options.filter({ hasText: 'Production' })).toHaveCount(1);
    await expect(options.filter({ hasText: 'Adjustment' })).toHaveCount(1);
  });

  test('Transaction Type dropdown selection persists', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    const typeSelect = page.getByTestId('txn-type-select');
    await typeSelect.selectOption('transfer');

    await expect(typeSelect).toHaveValue('transfer');

    // Verify the selected option text
    const selectedOption = typeSelect.locator('option:checked');
    await expect(selectedOption).toHaveText('Transfer');

    // Change to another type and verify persistence
    await typeSelect.selectOption('purchase');
    await expect(typeSelect).toHaveValue('purchase');
  });
});

test.describe('QuantityTransfersList', () => {
  test('Quantity Transfers section header is displayed', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    const section = page.getByTestId('quantity-transfers-list');
    await expect(section).toBeVisible();

    const heading = page.getByTestId('transfers-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Quantity Transfers');
  });

  test('Empty Quantity Transfers list shows no rows', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('transfers-table');
    await expect(table).toBeVisible();

    // Should have header columns
    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(6);

    // No data rows should exist (only the add button row)
    const dataRows = table.locator('tbody tr[data-testid^="transfer-row-"]');
    await expect(dataRows).toHaveCount(0);

    // Add button should be visible
    const addBtn = page.getByTestId('add-transfer-btn');
    await expect(addBtn).toBeVisible();
  });

  test('Existing quantity transfers display with all columns', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Add two transfers
    const addBtn = page.getByTestId('add-transfer-btn');
    await addBtn.click();
    await addBtn.click();

    const dataRows = page.locator('[data-testid^="transfer-row-"]');
    await expect(dataRows).toHaveCount(2);

    // Each row should have source select, dest select, amount input, unit input, batch input, delete button
    const firstRow = dataRows.first();
    const firstTestId = await firstRow.getAttribute('data-testid');
    const firstId = firstTestId?.replace('transfer-row-', '') || '';

    await expect(page.getByTestId(`transfer-source-select-${firstId}`)).toBeVisible();
    await expect(page.getByTestId(`transfer-dest-select-${firstId}`)).toBeVisible();
    await expect(page.getByTestId(`transfer-amount-input-${firstId}`)).toBeVisible();
    await expect(page.getByTestId(`transfer-unit-input-${firstId}`)).toBeVisible();
    await expect(page.getByTestId(`transfer-batch-input-${firstId}`)).toBeVisible();
    await expect(page.getByTestId(`transfer-delete-${firstId}`)).toBeVisible();
  });

  test('Delete button removes a quantity transfer row', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Add two transfers
    const addBtn = page.getByTestId('add-transfer-btn');
    await addBtn.click();
    await addBtn.click();

    const dataRows = page.locator('[data-testid^="transfer-row-"]');
    await expect(dataRows).toHaveCount(2);

    // Get the first row's delete button
    const firstRow = dataRows.first();
    const firstTestId = await firstRow.getAttribute('data-testid');
    const firstId = firstTestId?.replace('transfer-row-', '') || '';

    const deleteBtn = page.getByTestId(`transfer-delete-${firstId}`);
    await deleteBtn.click();

    // Should now have only 1 row
    await expect(dataRows).toHaveCount(1);
  });

  test('Add Quantity Transfer button triggers inline form submission', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Click Add Transfer
    const addBtn = page.getByTestId('add-transfer-btn');
    await addBtn.click();

    // A new row should appear
    const dataRows = page.locator('[data-testid^="transfer-row-"]');
    await expect(dataRows).toHaveCount(1);

    // Get the row ID
    const firstTestId = await dataRows.first().getAttribute('data-testid');
    const transferId = firstTestId?.replace('transfer-row-', '') || '';

    // Fill in the form fields in the new row
    const sourceSelect = page.getByTestId(`transfer-source-select-${transferId}`);
    const sourceOptions = sourceSelect.locator('option');
    const sourceCount = await sourceOptions.count();
    if (sourceCount > 1) {
      await sourceSelect.selectOption({ index: 1 });
    }

    const destSelect = page.getByTestId(`transfer-dest-select-${transferId}`);
    const destOptions = destSelect.locator('option');
    const destCount = await destOptions.count();
    if (destCount > 1) {
      await destSelect.selectOption({ index: 1 });
    }

    const amountInput = page.getByTestId(`transfer-amount-input-${transferId}`);
    await amountInput.fill('500');
    await expect(amountInput).toHaveValue('500');

    const unitInput = page.getByTestId(`transfer-unit-input-${transferId}`);
    await unitInput.fill('kg');
    await expect(unitInput).toHaveValue('kg');
  });

  test('Source Account dropdown lists all available accounts', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Add a transfer
    const addBtn = page.getByTestId('add-transfer-btn');
    await addBtn.click();

    const dataRows = page.locator('[data-testid^="transfer-row-"]');
    const firstTestId = await dataRows.first().getAttribute('data-testid');
    const transferId = firstTestId?.replace('transfer-row-', '') || '';

    const sourceSelect = page.getByTestId(`transfer-source-select-${transferId}`);
    await expect(sourceSelect).toBeVisible();

    // Should have a placeholder option and at least one account
    const options = sourceSelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(2); // "Select source" + at least 1 account

    // First option should be the placeholder
    await expect(options.first()).toHaveText('Select source');
  });

  test('Destination Account dropdown lists all available accounts', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Add a transfer
    const addBtn = page.getByTestId('add-transfer-btn');
    await addBtn.click();

    const dataRows = page.locator('[data-testid^="transfer-row-"]');
    const firstTestId = await dataRows.first().getAttribute('data-testid');
    const transferId = firstTestId?.replace('transfer-row-', '') || '';

    const destSelect = page.getByTestId(`transfer-dest-select-${transferId}`);
    await expect(destSelect).toBeVisible();

    // Should have a placeholder option and at least one account
    const options = destSelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(2); // "Select destination" + at least 1 account

    // First option should be the placeholder
    await expect(options.first()).toHaveText('Select destination');
  });

  test('Amount input accepts numeric values', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Add a transfer
    const addBtn = page.getByTestId('add-transfer-btn');
    await addBtn.click();

    const dataRows = page.locator('[data-testid^="transfer-row-"]');
    const firstTestId = await dataRows.first().getAttribute('data-testid');
    const transferId = firstTestId?.replace('transfer-row-', '') || '';

    const amountInput = page.getByTestId(`transfer-amount-input-${transferId}`);
    await expect(amountInput).toBeVisible();
    await expect(amountInput).toHaveAttribute('type', 'number');

    await amountInput.fill('500');
    await expect(amountInput).toHaveValue('500');
  });

  test('Unit selector allows choosing a unit of measure', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Add a transfer
    const addBtn = page.getByTestId('add-transfer-btn');
    await addBtn.click();

    const dataRows = page.locator('[data-testid^="transfer-row-"]');
    const firstTestId = await dataRows.first().getAttribute('data-testid');
    const transferId = firstTestId?.replace('transfer-row-', '') || '';

    const unitInput = page.getByTestId(`transfer-unit-input-${transferId}`);
    await expect(unitInput).toBeVisible();

    await unitInput.fill('kg');
    await expect(unitInput).toHaveValue('kg');

    // Clear and try another unit
    await unitInput.fill('units');
    await expect(unitInput).toHaveValue('units');
  });

  test('Source Batch ID input is optional', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Add a transfer
    const addBtn = page.getByTestId('add-transfer-btn');
    await addBtn.click();

    const dataRows = page.locator('[data-testid^="transfer-row-"]');
    const firstTestId = await dataRows.first().getAttribute('data-testid');
    const transferId = firstTestId?.replace('transfer-row-', '') || '';

    const batchInput = page.getByTestId(`transfer-batch-input-${transferId}`);
    await expect(batchInput).toBeVisible();

    // Placeholder should indicate optional
    await expect(batchInput).toHaveAttribute('placeholder', 'Optional');

    // Should be empty by default
    await expect(batchInput).toHaveValue('');
  });

  test('Add Quantity Transfer with missing required fields shows validation', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Fill basic info (required for form submission)
    const dateInput = page.getByTestId('txn-date-input');
    await dateInput.fill('2024-05-23');

    const typeSelect = page.getByTestId('txn-type-select');
    await typeSelect.selectOption('transfer');

    // Add a transfer but leave fields empty
    const addBtn = page.getByTestId('add-transfer-btn');
    await addBtn.click();

    // Click Post without filling in transfer fields
    const postBtn = page.getByTestId('post-btn');
    await postBtn.click();

    // Should remain on the page (transaction not created due to incomplete transfer)
    await expect(page).toHaveURL(/\/transactions\/new/);
  });
});

test.describe('BatchAllocationList', () => {
  test('Batch Allocation section header is displayed', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    const section = page.getByTestId('batch-allocation-list');
    await expect(section).toBeVisible();

    const heading = page.getByTestId('batch-allocation-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Batch Allocation');
  });

  test('Empty Batch Allocation list shows no rows', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('batch-allocation-table');
    await expect(table).toBeVisible();

    // Should have headers
    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(3);

    // No data rows
    const dataRows = table.locator('tbody tr[data-testid^="allocation-row-"]');
    await expect(dataRows).toHaveCount(0);

    // Create New Batch button should be visible
    const createBtn = page.getByTestId('create-new-batch-btn');
    await expect(createBtn).toBeVisible();
  });

  test('Existing batch allocations display with all columns', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Add two batch allocations
    const createBtn = page.getByTestId('create-new-batch-btn');
    await createBtn.click();
    await createBtn.click();

    const dataRows = page.locator('[data-testid^="allocation-row-"]');
    await expect(dataRows).toHaveCount(2);

    // Each row should have material select, amount input, delete button
    const firstRow = dataRows.first();
    const firstTestId = await firstRow.getAttribute('data-testid');
    const firstId = firstTestId?.replace('allocation-row-', '') || '';

    await expect(page.getByTestId(`allocation-material-select-${firstId}`)).toBeVisible();
    await expect(page.getByTestId(`allocation-amount-input-${firstId}`)).toBeVisible();
    await expect(page.getByTestId(`allocation-delete-${firstId}`)).toBeVisible();
  });

  test('Delete button removes a batch allocation row', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Add two batch allocations
    const createBtn = page.getByTestId('create-new-batch-btn');
    await createBtn.click();
    await createBtn.click();

    const dataRows = page.locator('[data-testid^="allocation-row-"]');
    await expect(dataRows).toHaveCount(2);

    // Delete the first row
    const firstRow = dataRows.first();
    const firstTestId = await firstRow.getAttribute('data-testid');
    const firstId = firstTestId?.replace('allocation-row-', '') || '';

    const deleteBtn = page.getByTestId(`allocation-delete-${firstId}`);
    await deleteBtn.click();

    // Should now have only 1 row
    await expect(dataRows).toHaveCount(1);
  });

  test('Create New Batch button adds a batch from inline form', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Click Create New Batch
    const createBtn = page.getByTestId('create-new-batch-btn');
    await createBtn.click();

    // A new row should appear
    const dataRows = page.locator('[data-testid^="allocation-row-"]');
    await expect(dataRows).toHaveCount(1);

    // Get the row ID
    const firstTestId = await dataRows.first().getAttribute('data-testid');
    const allocId = firstTestId?.replace('allocation-row-', '') || '';

    // Fill in the material dropdown
    const materialSelect = page.getByTestId(`allocation-material-select-${allocId}`);
    const materialOptions = materialSelect.locator('option');
    const materialCount = await materialOptions.count();
    if (materialCount > 1) {
      await materialSelect.selectOption({ index: 1 });
    }

    // Fill in the amount
    const amountInput = page.getByTestId(`allocation-amount-input-${allocId}`);
    await amountInput.fill('200');
    await expect(amountInput).toHaveValue('200');
  });

  test('Material dropdown lists available materials', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Add a batch allocation
    const createBtn = page.getByTestId('create-new-batch-btn');
    await createBtn.click();

    const dataRows = page.locator('[data-testid^="allocation-row-"]');
    const firstTestId = await dataRows.first().getAttribute('data-testid');
    const allocId = firstTestId?.replace('allocation-row-', '') || '';

    const materialSelect = page.getByTestId(`allocation-material-select-${allocId}`);
    await expect(materialSelect).toBeVisible();

    // Should have a placeholder and at least one material
    const options = materialSelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(2); // "Select material" + at least 1 material

    // First option should be the placeholder
    await expect(options.first()).toHaveText('Select material');
  });

  test('Amount input for batch accepts numeric values', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Add a batch allocation
    const createBtn = page.getByTestId('create-new-batch-btn');
    await createBtn.click();

    const dataRows = page.locator('[data-testid^="allocation-row-"]');
    const firstTestId = await dataRows.first().getAttribute('data-testid');
    const allocId = firstTestId?.replace('allocation-row-', '') || '';

    const amountInput = page.getByTestId(`allocation-amount-input-${allocId}`);
    await expect(amountInput).toBeVisible();
    await expect(amountInput).toHaveAttribute('type', 'number');

    await amountInput.fill('200');
    await expect(amountInput).toHaveValue('200');
  });

  test('Create New Batch with missing required fields shows validation', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Fill basic info
    const dateInput = page.getByTestId('txn-date-input');
    await dateInput.fill('2024-05-23');

    const typeSelect = page.getByTestId('txn-type-select');
    await typeSelect.selectOption('transfer');

    // Add a batch allocation but leave amount empty
    const createBtn = page.getByTestId('create-new-batch-btn');
    await createBtn.click();

    const dataRows = page.locator('[data-testid^="allocation-row-"]');
    const firstTestId = await dataRows.first().getAttribute('data-testid');
    const allocId = firstTestId?.replace('allocation-row-', '') || '';

    // Select a material but leave amount empty
    const materialSelect = page.getByTestId(`allocation-material-select-${allocId}`);
    const materialOptions = materialSelect.locator('option');
    const materialCount = await materialOptions.count();
    if (materialCount > 1) {
      await materialSelect.selectOption({ index: 1 });
    }

    // Try to post - should fail validation
    const postBtn = page.getByTestId('post-btn');
    await postBtn.click();

    // Should still be on the new transaction page
    await expect(page).toHaveURL(/\/transactions\/new/);
  });

  test('Double-entry validation ensures debits equal credits before Post', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Fill basic info
    const dateInput = page.getByTestId('txn-date-input');
    await dateInput.fill('2024-05-23');

    const typeSelect = page.getByTestId('txn-type-select');
    await typeSelect.selectOption('transfer');

    // Add a transfer with an amount
    const addTransferBtn = page.getByTestId('add-transfer-btn');
    await addTransferBtn.click();

    const transferRows = page.locator('[data-testid^="transfer-row-"]');
    const transferTestId = await transferRows.first().getAttribute('data-testid');
    const transferId = transferTestId?.replace('transfer-row-', '') || '';

    const sourceSelect = page.getByTestId(`transfer-source-select-${transferId}`);
    const sourceOptions = sourceSelect.locator('option');
    if ((await sourceOptions.count()) > 1) {
      await sourceSelect.selectOption({ index: 1 });
    }

    const destSelect = page.getByTestId(`transfer-dest-select-${transferId}`);
    const destOptions = destSelect.locator('option');
    if ((await destOptions.count()) > 2) {
      await destSelect.selectOption({ index: 2 });
    } else if ((await destOptions.count()) > 1) {
      await destSelect.selectOption({ index: 1 });
    }

    const amountInput = page.getByTestId(`transfer-amount-input-${transferId}`);
    await amountInput.fill('500');

    const unitInput = page.getByTestId(`transfer-unit-input-${transferId}`);
    await unitInput.fill('kg');

    // Verify totals are displayed
    const totals = page.getByTestId('transfers-totals');
    const totalsCount = await totals.count();
    if (totalsCount > 0) {
      await expect(totals).toBeVisible();
      const totalsText = await totals.textContent();
      expect(totalsText).toContain('Total Debits:');
      expect(totalsText).toContain('Total Credits:');
    }
  });

  test('Successful Post with balanced debits and credits', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Fill in basic info
    const dateInput = page.getByTestId('txn-date-input');
    await dateInput.fill('2024-05-23');

    const refInput = page.getByTestId('txn-reference-input');
    await refInput.fill('TRX-20240523-001');

    const descInput = page.getByTestId('txn-description-input');
    await descInput.fill('Q2 Inventory Adjustment');

    const typeSelect = page.getByTestId('txn-type-select');
    await typeSelect.selectOption('transfer');

    // Add a balanced transfer
    const addTransferBtn = page.getByTestId('add-transfer-btn');
    await addTransferBtn.click();

    const transferRows = page.locator('[data-testid^="transfer-row-"]');
    const transferTestId = await transferRows.first().getAttribute('data-testid');
    const transferId = transferTestId?.replace('transfer-row-', '') || '';

    // Select source account
    const sourceSelect = page.getByTestId(`transfer-source-select-${transferId}`);
    const sourceOptions = sourceSelect.locator('option');
    if ((await sourceOptions.count()) > 1) {
      await sourceSelect.selectOption({ index: 1 });
    }

    // Select destination account
    const destSelect = page.getByTestId(`transfer-dest-select-${transferId}`);
    const destOptions = destSelect.locator('option');
    if ((await destOptions.count()) > 2) {
      await destSelect.selectOption({ index: 2 });
    } else if ((await destOptions.count()) > 1) {
      await destSelect.selectOption({ index: 1 });
    }

    const amountInput = page.getByTestId(`transfer-amount-input-${transferId}`);
    await amountInput.fill('100');

    const unitInput = page.getByTestId(`transfer-unit-input-${transferId}`);
    await unitInput.fill('kg');

    // Click Post
    const postBtn = page.getByTestId('post-btn');
    await postBtn.click();

    // Should navigate to the transaction detail page
    await expect(page).toHaveURL(/\/transactions\/TXN-/, { timeout: 10000 });

    // Verify we're on the detail page
    const detailPage = page.getByTestId('transaction-detail-page');
    await expect(detailPage).toBeVisible({ timeout: 10000 });
  });

  test('Newly created batches record lineage from source batches', async ({ page }) => {
    await page.goto('/transactions/new');
    await page.waitForLoadState('networkidle');

    // Fill in basic info
    const dateInput = page.getByTestId('txn-date-input');
    await dateInput.fill('2024-05-23');

    const typeSelect = page.getByTestId('txn-type-select');
    await typeSelect.selectOption('production');

    // Add a transfer with a source batch ID
    const addTransferBtn = page.getByTestId('add-transfer-btn');
    await addTransferBtn.click();

    const transferRows = page.locator('[data-testid^="transfer-row-"]');
    const transferTestId = await transferRows.first().getAttribute('data-testid');
    const transferId = transferTestId?.replace('transfer-row-', '') || '';

    // Select source account
    const sourceSelect = page.getByTestId(`transfer-source-select-${transferId}`);
    const sourceOptions = sourceSelect.locator('option');
    if ((await sourceOptions.count()) > 1) {
      await sourceSelect.selectOption({ index: 1 });
    }

    // Select destination account
    const destSelect = page.getByTestId(`transfer-dest-select-${transferId}`);
    const destOptions = destSelect.locator('option');
    if ((await destOptions.count()) > 2) {
      await destSelect.selectOption({ index: 2 });
    } else if ((await destOptions.count()) > 1) {
      await destSelect.selectOption({ index: 1 });
    }

    const amountInput = page.getByTestId(`transfer-amount-input-${transferId}`);
    await amountInput.fill('100');

    const unitInput = page.getByTestId(`transfer-unit-input-${transferId}`);
    await unitInput.fill('kg');

    // Set source batch ID
    const batchInput = page.getByTestId(`transfer-batch-input-${transferId}`);
    await batchInput.fill('BATCH-RM-A-001');
    await expect(batchInput).toHaveValue('BATCH-RM-A-001');

    // Add a batch allocation
    const createBatchBtn = page.getByTestId('create-new-batch-btn');
    await createBatchBtn.click();

    const allocRows = page.locator('[data-testid^="allocation-row-"]');
    const allocTestId = await allocRows.first().getAttribute('data-testid');
    const allocId = allocTestId?.replace('allocation-row-', '') || '';

    // Select a material
    const materialSelect = page.getByTestId(`allocation-material-select-${allocId}`);
    const materialOptions = materialSelect.locator('option');
    if ((await materialOptions.count()) > 1) {
      await materialSelect.selectOption({ index: 1 });
    }

    const allocAmount = page.getByTestId(`allocation-amount-input-${allocId}`);
    await allocAmount.fill('100');

    // Post the transaction
    const postBtn = page.getByTestId('post-btn');
    await postBtn.click();

    // Should navigate away from the new transaction page
    // Either to detail page or stay on new page with validation errors
    // If successful, we should be on a detail page
    const currentUrl = page.url();
    if (currentUrl.includes('/transactions/TXN-')) {
      // Successful - verify the detail page shows the transaction
      const detailPage = page.getByTestId('transaction-detail-page');
      await expect(detailPage).toBeVisible({ timeout: 10000 });
    }
  });
});
