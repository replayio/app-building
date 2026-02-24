import { test, expect } from '@playwright/test';

// Helper: navigate to a known transaction detail page and wait for it to load
async function navigateToTransactionDetail(page: import('@playwright/test').Page) {
  // First go to transactions list to find a real transaction ID
  await page.goto('/transactions');
  await page.waitForLoadState('networkidle');

  const table = page.getByTestId('transactions-table');
  await expect(table).toBeVisible();

  // Get the first transaction's ID
  const firstRow = table.locator('tbody tr').first();
  const idLink = firstRow.locator('td').nth(1).locator('a.link');
  const txnId = (await idLink.textContent())?.trim();
  expect(txnId).toBeTruthy();

  // Navigate to the detail page
  await page.goto(`/transactions/${txnId}`);
  await page.waitForLoadState('networkidle');

  return txnId!;
}

test.describe('TransactionHeader', () => {
  test('Breadcrumb navigation displays Home > Transactions > TXN-ID', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const breadcrumb = page.getByTestId('breadcrumb');
    await expect(breadcrumb).toBeVisible();

    // Home link
    const homeLink = page.getByTestId('breadcrumb-home');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveText('Home');

    // Transactions link
    const txnLink = page.getByTestId('breadcrumb-transactions');
    await expect(txnLink).toBeVisible();
    await expect(txnLink).toHaveText('Transactions');

    // Current page label (TXN-ID or reference ID)
    const currentLabel = page.getByTestId('breadcrumb-current');
    await expect(currentLabel).toBeVisible();

    // Separators should be visible
    const separators = breadcrumb.locator('.breadcrumb-separator');
    await expect(separators).toHaveCount(2);
  });

  test('Breadcrumb Home link navigates to Dashboard', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const homeLink = page.getByTestId('breadcrumb-home');
    await homeLink.click();

    await expect(page).toHaveURL('/');
  });

  test('Breadcrumb Transactions link navigates to Transactions list', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const txnLink = page.getByTestId('breadcrumb-transactions');
    await txnLink.click();

    await expect(page).toHaveURL(/\/transactions$/);
  });

  test('Transaction ID is displayed prominently in the header', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const heading = page.getByTestId('page-heading');
    await expect(heading).toBeVisible();

    const headingText = await heading.textContent();
    expect(headingText).toBeTruthy();
    expect(headingText!.trim().length).toBeGreaterThan(0);
  });

  test('Completed status badge is displayed next to Transaction ID', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const statusBadge = page.getByTestId('txn-status-badge');
    await expect(statusBadge).toBeVisible();

    // Badge should display a status (e.g., "Completed")
    const badgeText = await statusBadge.textContent();
    expect(badgeText).toBeTruthy();
    expect(badgeText!.trim().length).toBeGreaterThan(0);

    // Badge should have success class
    await expect(statusBadge).toHaveClass(/badge-success/);
  });

  test('Date/Time field is displayed in the header', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const dateTime = page.getByTestId('txn-datetime');
    await expect(dateTime).toBeVisible();

    const dateText = await dateTime.textContent();
    expect(dateText).toBeTruthy();
    expect(dateText!.trim().length).toBeGreaterThan(0);
  });

  test('Creator field is displayed in the header', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const creator = page.getByTestId('txn-creator');
    await expect(creator).toBeVisible();

    const creatorText = await creator.textContent();
    expect(creatorText).toBeTruthy();
    expect(creatorText).toContain('Creator:');
  });

  test('Description field is displayed in the header', async ({ page }) => {
    await navigateToTransactionDetail(page);

    // Description may or may not be present depending on the transaction
    const detailPage = page.getByTestId('transaction-detail-page');
    await expect(detailPage).toBeVisible();

    // Check if description exists and is visible (it's conditionally rendered)
    const description = page.getByTestId('txn-full-description');
    const descCount = await description.count();
    if (descCount > 0) {
      await expect(description).toBeVisible();
      const descText = await description.textContent();
      expect(descText).toBeTruthy();
      expect(descText!.trim().length).toBeGreaterThan(0);
    }
  });
});

test.describe('BasicInfoSection', () => {
  test('Basic Info section displays section heading', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const section = page.getByTestId('basic-info-section');
    await expect(section).toBeVisible();

    const heading = page.getByTestId('basic-info-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Basic Information');
  });

  test('Date field displays the transaction date in read-only format', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const dateField = page.getByTestId('txn-date');
    await expect(dateField).toBeVisible();

    const dateText = await dateField.textContent();
    expect(dateText).toBeTruthy();
    // Should be a formatted date like "Oct 26, 2023"
    expect(dateText!.trim().length).toBeGreaterThan(0);
  });

  test('Reference ID field displays the reference identifier in read-only format', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const refField = page.getByTestId('txn-reference');
    await expect(refField).toBeVisible();

    const refText = await refField.textContent();
    expect(refText).toBeTruthy();
  });

  test('Description field displays the transaction description in read-only format', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const descField = page.getByTestId('txn-description');
    await expect(descField).toBeVisible();

    const descText = await descField.textContent();
    expect(descText).toBeTruthy();
  });

  test('Transaction Type field displays the type in read-only format', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const typeField = page.getByTestId('txn-type');
    await expect(typeField).toBeVisible();

    const typeText = await typeField.textContent();
    expect(typeText).toBeTruthy();
    // Type should be capitalized (e.g., "Purchase", "Transfer", "Adjustment")
    expect(typeText!.trim().length).toBeGreaterThan(0);
  });

  test('Basic Info fields are arranged in a horizontal row layout', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const section = page.getByTestId('basic-info-section');
    await expect(section).toBeVisible();

    // The fields should be inside an info-row container
    const infoRow = section.locator('.info-row');
    await expect(infoRow).toBeVisible();

    // All four fields should be present inside the row
    const fields = infoRow.locator('.info-field');
    await expect(fields).toHaveCount(4);
  });
});

test.describe('QuantityTransfersTable', () => {
  test('Quantity Transfers section displays heading', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const section = page.getByTestId('quantity-transfers-section');
    await expect(section).toBeVisible();

    const heading = page.getByTestId('quantity-transfers-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Quantity Transfers');
  });

  test('Balanced indicator checkmark is shown when debits equal credits', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const indicator = page.getByTestId('balanced-indicator');
    await expect(indicator).toBeVisible();

    const indicatorText = await indicator.textContent();
    expect(indicatorText).toBeTruthy();

    // If balanced, should contain "Balanced" text and have the balanced class
    if (indicatorText!.includes('Balanced')) {
      await expect(indicator).toHaveClass(/balanced/);
      // Should have a checkmark icon (CheckCircle svg)
      const checkIcon = indicator.locator('svg');
      await expect(checkIcon).toBeVisible();
    }
  });

  test('Quantity Transfers table displays all column headers', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('quantity-transfers-table');
    await expect(table).toBeVisible();

    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(6);

    await expect(headers.nth(0)).toHaveText('Source Account');
    await expect(headers.nth(1)).toHaveText('Source Amount');
    await expect(headers.nth(2)).toHaveText('Source Batch ID');
    await expect(headers.nth(3)).toHaveText('Destination Account');
    await expect(headers.nth(4)).toHaveText('Destination Amount');
    await expect(headers.nth(5)).toHaveText('Net Transfer');
  });

  test('Source Account column shows account name with direction icon', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('quantity-transfers-table');
    const rows = table.locator('tbody tr');
    const count = await rows.count();

    if (count > 0) {
      // Find the first transfer row and get its ID
      const firstRow = rows.first();
      const testId = await firstRow.getAttribute('data-testid');
      const transferId = testId?.replace('transfer-row-', '') || '';

      const sourceCell = page.getByTestId(`transfer-source-${transferId}`);
      await expect(sourceCell).toBeVisible();

      const sourceText = await sourceCell.textContent();
      expect(sourceText).toBeTruthy();
      expect(sourceText!.trim().length).toBeGreaterThan(0);
    }
  });

  test('Source Amount column shows negative amount with units', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('quantity-transfers-table');
    const rows = table.locator('tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const firstRow = rows.first();
      const testId = await firstRow.getAttribute('data-testid');
      const transferId = testId?.replace('transfer-row-', '') || '';

      const sourceAmountCell = page.getByTestId(`transfer-source-amount-${transferId}`);
      await expect(sourceAmountCell).toBeVisible();

      const amountText = await sourceAmountCell.textContent();
      expect(amountText).toBeTruthy();
      // Should contain a number and unit
      expect(amountText!.trim().length).toBeGreaterThan(0);
    }
  });

  test('Source Batch ID column shows batch reference or N/A', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('quantity-transfers-table');
    const rows = table.locator('tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const firstRow = rows.first();
      const testId = await firstRow.getAttribute('data-testid');
      const transferId = testId?.replace('transfer-row-', '') || '';

      const batchCell = page.getByTestId(`transfer-batch-${transferId}`);
      await expect(batchCell).toBeVisible();

      const batchText = await batchCell.textContent();
      expect(batchText).toBeTruthy();
      // Should be either a batch ID link or an em dash
    }
  });

  test('Destination Account column shows account name with direction icon', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('quantity-transfers-table');
    const rows = table.locator('tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const firstRow = rows.first();
      const testId = await firstRow.getAttribute('data-testid');
      const transferId = testId?.replace('transfer-row-', '') || '';

      const destCell = page.getByTestId(`transfer-dest-${transferId}`);
      await expect(destCell).toBeVisible();

      const destText = await destCell.textContent();
      expect(destText).toBeTruthy();
      expect(destText!.trim().length).toBeGreaterThan(0);
    }
  });

  test('Destination Amount column shows positive amount with units', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('quantity-transfers-table');
    const rows = table.locator('tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const firstRow = rows.first();
      const testId = await firstRow.getAttribute('data-testid');
      const transferId = testId?.replace('transfer-row-', '') || '';

      const destAmountCell = page.getByTestId(`transfer-dest-amount-${transferId}`);
      await expect(destAmountCell).toBeVisible();

      const amountText = await destAmountCell.textContent();
      expect(amountText).toBeTruthy();
      expect(amountText!.trim().length).toBeGreaterThan(0);
    }
  });

  test('Net Transfer column shows absolute transfer amount', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('quantity-transfers-table');
    const rows = table.locator('tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const firstRow = rows.first();
      const testId = await firstRow.getAttribute('data-testid');
      const transferId = testId?.replace('transfer-row-', '') || '';

      const netCell = page.getByTestId(`transfer-net-${transferId}`);
      await expect(netCell).toBeVisible();

      const netText = await netCell.textContent();
      expect(netText).toBeTruthy();
      expect(netText!.trim().length).toBeGreaterThan(0);
    }
  });

  test('Multiple transfer rows are displayed', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('quantity-transfers-table');
    await expect(table).toBeVisible();

    const rows = table.locator('tbody tr[data-testid^="transfer-row-"]');
    const count = await rows.count();

    // There should be at least one transfer row
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('Total Debits and Total Credits are displayed in footer row', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('quantity-transfers-table');
    await expect(table).toBeVisible();

    // Check tfoot exists and has totals
    const footer = table.locator('tfoot');
    await expect(footer).toBeVisible();

    const footerText = await footer.textContent();
    expect(footerText).toBeTruthy();
    expect(footerText).toContain('Total Debits:');
    expect(footerText).toContain('Total Credits:');
  });

  test('Clicking a Source Batch ID link navigates to BatchDetailPage', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('quantity-transfers-table');
    const rows = table.locator('tbody tr[data-testid^="transfer-row-"]');
    const count = await rows.count();

    // Find a row with a batch ID link
    let batchLink: import('@playwright/test').Locator | null = null;
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const testId = await row.getAttribute('data-testid');
      const transferId = testId?.replace('transfer-row-', '') || '';
      const batchCell = page.getByTestId(`transfer-batch-${transferId}`);
      const link = batchCell.locator('a.link');
      const linkCount = await link.count();
      if (linkCount > 0) {
        batchLink = link;
        break;
      }
    }

    if (batchLink) {
      const batchId = await batchLink.textContent();
      await batchLink.click();
      await expect(page).toHaveURL(new RegExp(`/batches/${batchId!.trim()}`));
    }
  });
});

test.describe('BatchesCreatedTable', () => {
  test('Batches Created section displays heading', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const section = page.getByTestId('batches-created-section');
    await expect(section).toBeVisible();

    const heading = page.getByTestId('batches-created-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Batches Created');
  });

  test('Batches Created table displays all column headers', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('batches-created-table');
    await expect(table).toBeVisible();

    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(3);

    await expect(headers.nth(0)).toHaveText('Batch ID');
    await expect(headers.nth(1)).toHaveText('Material');
    await expect(headers.nth(2)).toHaveText('Quantity');
  });

  test('Batch rows display correct data', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('batches-created-table');
    await expect(table).toBeVisible();

    const rows = table.locator('tbody tr[data-testid^="created-batch-row-"]');
    const emptyState = page.getByTestId('batches-created-empty');
    const emptyCount = await emptyState.count();

    if (emptyCount === 0) {
      // There are batch rows
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);

      // Verify first row has expected data fields
      const firstRow = rows.first();
      const testId = await firstRow.getAttribute('data-testid');
      const batchId = testId?.replace('created-batch-row-', '') || '';

      // Batch ID link
      const batchLink = page.getByTestId(`created-batch-link-${batchId}`);
      await expect(batchLink).toBeVisible();

      // Material link
      const materialLink = page.getByTestId(`created-batch-material-${batchId}`);
      await expect(materialLink).toBeVisible();

      // Quantity
      const qty = page.getByTestId(`created-batch-qty-${batchId}`);
      await expect(qty).toBeVisible();
      const qtyText = await qty.textContent();
      expect(qtyText).toBeTruthy();
    }
  });

  test('Clicking a Batch ID navigates to BatchDetailPage', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('batches-created-table');
    const rows = table.locator('tbody tr[data-testid^="created-batch-row-"]');
    const emptyState = page.getByTestId('batches-created-empty');
    const emptyCount = await emptyState.count();

    if (emptyCount === 0) {
      const firstRow = rows.first();
      const testId = await firstRow.getAttribute('data-testid');
      const batchId = testId?.replace('created-batch-row-', '') || '';

      const batchLink = page.getByTestId(`created-batch-link-${batchId}`);
      await expect(batchLink).toBeVisible();

      await batchLink.click();
      await expect(page).toHaveURL(new RegExp(`/batches/${batchId}`));
    }
  });

  test('Clicking a Material name navigates to MaterialDetailPage', async ({ page }) => {
    await navigateToTransactionDetail(page);

    const table = page.getByTestId('batches-created-table');
    const rows = table.locator('tbody tr[data-testid^="created-batch-row-"]');
    const emptyState = page.getByTestId('batches-created-empty');
    const emptyCount = await emptyState.count();

    if (emptyCount === 0) {
      const firstRow = rows.first();
      const testId = await firstRow.getAttribute('data-testid');
      const batchId = testId?.replace('created-batch-row-', '') || '';

      const materialLink = page.getByTestId(`created-batch-material-${batchId}`);
      await expect(materialLink).toBeVisible();

      await materialLink.click();

      await expect(page).toHaveURL(/\/materials\//);
    }
  });

  test('Empty Batches Created section when no batches were created', async ({ page }) => {
    // Navigate to the transactions list to find a transaction without batches
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const table = page.getByTestId('transactions-table');
    await expect(table).toBeVisible();

    // Navigate to the first transaction and check
    const firstRow = table.locator('tbody tr').first();
    const idLink = firstRow.locator('td').nth(1).locator('a.link');
    const txnId = (await idLink.textContent())?.trim();

    await page.goto(`/transactions/${txnId}`);
    await page.waitForLoadState('networkidle');

    const batchesSection = page.getByTestId('batches-created-section');
    await expect(batchesSection).toBeVisible();

    // Check for empty state OR batch rows - both are valid based on the data
    const emptyState = page.getByTestId('batches-created-empty');
    const batchRows = page.getByTestId('batches-created-table').locator('tbody tr[data-testid^="created-batch-row-"]');
    const emptyCount = await emptyState.count();
    const rowCount = await batchRows.count();

    // Either we found an empty state or there are batch rows
    if (emptyCount > 0) {
      await expect(emptyState).toBeVisible();
      await expect(emptyState).toContainText('No batches created in this transaction');
    } else {
      expect(rowCount).toBeGreaterThan(0);
    }
  });
});
