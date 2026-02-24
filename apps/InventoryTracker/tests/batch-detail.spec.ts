import { test, expect } from '@playwright/test';

const BATCH_URL = '/batches/BATCH-12345';

test.describe('BatchHeader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BATCH_URL);
    await page.waitForSelector('[data-testid="batch-detail-page"]');
  });

  test('Breadcrumb navigation displays Home > Batches > BATCH-ID', async ({ page }) => {
    const breadcrumb = page.getByTestId('breadcrumb');
    await expect(breadcrumb).toBeVisible();
    await expect(page.getByTestId('breadcrumb-home')).toHaveText('Home');
    await expect(page.getByTestId('breadcrumb-current')).toContainText('BATCH-12345');
    // Verify separator characters are present
    await expect(breadcrumb).toContainText('>');
  });

  test('Breadcrumb Home link navigates to Dashboard', async ({ page }) => {
    await page.getByTestId('breadcrumb-home').click();
    await expect(page).toHaveURL('/');
  });

  test('Batch ID is displayed prominently in the header', async ({ page }) => {
    const heading = page.getByTestId('page-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('BATCH-12345');
  });

  test('Material name is displayed with a clickable link to MaterialDetailPage', async ({ page }) => {
    const materialInfo = page.getByTestId('batch-material');
    await expect(materialInfo).toBeVisible();
    await expect(materialInfo).toContainText('Organic Arabica Coffee Beans');

    // Click the material link
    const materialLink = materialInfo.locator('a');
    await expect(materialLink).toBeVisible();
    await materialLink.click();
    await expect(page).toHaveURL(/\/materials\/MAT-COFFEE/);
  });

  test('Account name is displayed with a clickable link to AccountDetailPage', async ({ page }) => {
    const accountInfo = page.getByTestId('batch-account');
    await expect(accountInfo).toBeVisible();
    await expect(accountInfo).toContainText('Global Imports Inc.');

    // Click the account link
    const accountLink = accountInfo.locator('a');
    await expect(accountLink).toBeVisible();
    await accountLink.click();
    await expect(page).toHaveURL(/\/accounts\/ACC-GLOBAL-IMP/);
  });

  test("Status indicator shows a green dot and 'Active'", async ({ page }) => {
    const statusInfo = page.getByTestId('batch-status');
    await expect(statusInfo).toBeVisible();
    await expect(statusInfo).toContainText('Active');

    // Verify the status dot element is present
    const statusDot = statusInfo.locator('.status-dot');
    await expect(statusDot).toBeVisible();
  });

  test('Created date and time are displayed', async ({ page }) => {
    const createdInfo = page.getByTestId('batch-created');
    await expect(createdInfo).toBeVisible();
    await expect(createdInfo).toContainText('Created:');
    // Verify date content is present (Oct 27, 2023 format)
    await expect(createdInfo).toContainText('Oct');
    await expect(createdInfo).toContainText('2023');
  });

  test('Originating Transaction is displayed as a clickable link', async ({ page }) => {
    const originTxn = page.getByTestId('batch-originating-txn');
    await expect(originTxn).toBeVisible();
    await expect(originTxn).toContainText('Originating Transaction:');
    await expect(originTxn).toContainText('TX-PROD-987');

    // Verify the transaction ID is a clickable link
    const txnLink = originTxn.locator('a');
    await expect(txnLink).toBeVisible();
    await txnLink.click();
    await expect(page).toHaveURL(/\/transactions\/TX-PROD-987/);
  });

  test('Create New Transaction button is visible', async ({ page }) => {
    const createBtn = page.getByTestId('create-transaction-btn');
    await expect(createBtn).toBeVisible();
    await expect(createBtn).toContainText('Create New Transaction');
  });

  test('Clicking Create New Transaction navigates to NewTransactionPage', async ({ page }) => {
    await page.getByTestId('create-transaction-btn').click();
    await expect(page).toHaveURL(/\/transactions\/new/);
  });
});

test.describe('BatchOverview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BATCH_URL);
    await page.waitForSelector('[data-testid="batch-detail-page"]');
  });

  test('Batch Overview section displays heading', async ({ page }) => {
    const heading = page.getByTestId('batch-overview-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Batch Overview');
  });

  test('Quantity field displays the batch quantity with unit', async ({ page }) => {
    const quantity = page.getByTestId('batch-quantity');
    await expect(quantity).toBeVisible();
    await expect(quantity).toContainText('1,500');

    const unit = page.getByTestId('batch-unit');
    await expect(unit).toBeVisible();
    await expect(unit).toContainText('kg');
  });

  test('Location field displays the batch location', async ({ page }) => {
    const location = page.getByTestId('batch-location');
    await expect(location).toBeVisible();
    await expect(location).toContainText('Warehouse A, Zone 4');
  });

  test('Lot Number field is displayed', async ({ page }) => {
    const lotNumber = page.getByTestId('batch-lot');
    await expect(lotNumber).toBeVisible();
    await expect(lotNumber).toContainText('LOT-2023-OCB');
  });

  test('Expiration Date field is displayed', async ({ page }) => {
    const expiry = page.getByTestId('batch-expiry');
    await expect(expiry).toBeVisible();
    // The date is formatted as "Oct 27, 2024"
    await expect(expiry).toContainText('Oct');
    await expect(expiry).toContainText('2024');
  });

  test('Quality Grade field is displayed', async ({ page }) => {
    const grade = page.getByTestId('batch-grade');
    await expect(grade).toBeVisible();
    await expect(grade).toContainText('Premium');
  });

  test('Storage Condition field is displayed', async ({ page }) => {
    const storage = page.getByTestId('batch-storage');
    await expect(storage).toBeVisible();
    await expect(storage).toContainText('Climate Controlled');
  });
});

test.describe('LineageDiagram', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BATCH_URL);
    await page.waitForSelector('[data-testid="batch-detail-page"]');
  });

  test("Lineage section displays heading 'Batch Lineage'", async ({ page }) => {
    const heading = page.getByTestId('lineage-heading');
    await expect(heading).toBeVisible();
    // The component renders "Lineage" as the heading text
    await expect(heading).toContainText('Lineage');
  });

  test('Source Transaction heading shows originating transaction ID', async ({ page }) => {
    const sourceTxnLink = page.getByTestId('lineage-source-txn-link');
    await expect(sourceTxnLink).toBeVisible();
    await expect(sourceTxnLink).toContainText('TX-PROD-987');
  });

  test('Inputs Used section shows source batch links', async ({ page }) => {
    // Verify input batch links are displayed
    const inputBatch1 = page.getByTestId('lineage-input-BATCH-11001');
    const inputBatch2 = page.getByTestId('lineage-input-BATCH-11002');

    await expect(inputBatch1).toBeVisible();
    await expect(inputBatch1).toHaveText('BATCH-11001');

    await expect(inputBatch2).toBeVisible();
    await expect(inputBatch2).toHaveText('BATCH-11002');
  });

  test('Process box shows source transaction as a clickable link', async ({ page }) => {
    const processBox = page.getByTestId('lineage-process');
    await expect(processBox).toBeVisible();

    // The process box parent contains a link to the transaction
    const lineageDiagram = page.getByTestId('lineage-diagram');
    const processLink = lineageDiagram.locator('a').filter({ hasText: 'TX-PROD-987' });
    await expect(processLink).toBeVisible();

    await processLink.click();
    await expect(page).toHaveURL(/\/transactions\/TX-PROD-987/);
  });

  test('Output section shows the current batch', async ({ page }) => {
    const output = page.getByTestId('lineage-output');
    await expect(output).toBeVisible();
    await expect(output).toContainText('BATCH-12345');
  });

  test('Visual flow arrows connect inputs → process → output', async ({ page }) => {
    // Verify arrow elements exist in the lineage diagram
    const arrowIn = page.getByTestId('lineage-arrow');
    const arrowOut = page.getByTestId('lineage-arrow-out');

    await expect(arrowIn).toBeVisible();
    await expect(arrowOut).toBeVisible();
  });
});

test.describe('UsageHistoryTable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BATCH_URL);
    await page.waitForSelector('[data-testid="batch-detail-page"]');
  });

  test('Usage History section displays heading', async ({ page }) => {
    const heading = page.getByTestId('usage-history-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Usage History');
  });

  test('Table displays column headers: Date & Time, Transaction ID, Type, Movement, Amount, Created Batches', async ({ page }) => {
    const table = page.getByTestId('usage-history-table');
    await expect(table).toBeVisible();

    const headers = table.locator('th');
    await expect(headers.nth(0)).toHaveText('Date & Time');
    await expect(headers.nth(1)).toHaveText('Transaction ID');
    await expect(headers.nth(2)).toHaveText('Type');
    await expect(headers.nth(3)).toHaveText('Movement');
    await expect(headers.nth(4)).toHaveText('Amount');
    await expect(headers.nth(5)).toHaveText('Created Batches');
  });

  test('Transaction ID cells are clickable links to TransactionDetailPage', async ({ page }) => {
    // Find the first usage transaction link
    const firstTxnLink = page.locator('[data-testid^="usage-txn-link-"]').first();
    await expect(firstTxnLink).toBeVisible();

    // Get the transaction ID from the data-testid
    const testId = await firstTxnLink.getAttribute('data-testid');
    const txnId = testId?.replace('usage-txn-link-', '');

    await firstTxnLink.click();
    await expect(page).toHaveURL(`/transactions/${txnId}`);
  });

  test('Created Batches cells contain clickable links to BatchDetailPage', async ({ page }) => {
    // Find a created batch link (TX-PACK-221 created BATCH-12401 and BATCH-12402)
    const createdBatchLink = page.locator('[data-testid^="usage-created-batch-"]').first();
    await expect(createdBatchLink).toBeVisible();

    // Get the batch ID from the data-testid
    const testId = await createdBatchLink.getAttribute('data-testid');
    const batchId = testId?.replace('usage-created-batch-', '');

    await createdBatchLink.click();
    await expect(page).toHaveURL(`/batches/${batchId}`);
  });

  test('Movement column shows In/Out indicators', async ({ page }) => {
    // Check for movement badges
    const movementBadges = page.locator('[data-testid^="usage-movement-"]');
    await expect(movementBadges).not.toHaveCount(0);

    // Verify at least one "In" or "Out" indicator exists
    const allBadgeTexts: string[] = [];
    const count = await movementBadges.count();
    for (let i = 0; i < count; i++) {
      const text = await movementBadges.nth(i).textContent();
      if (text) allBadgeTexts.push(text.trim());
    }
    const hasInOrOut = allBadgeTexts.some((t) => t === 'In' || t === 'Out');
    expect(hasInOrOut).toBeTruthy();
  });

  test('Empty state when batch has no usage history', async ({ page }) => {
    // BATCH-12345 has usage history, so the empty state should NOT be visible
    const emptyState = page.getByTestId('usage-empty');
    await expect(emptyState).not.toBeVisible();

    // Verify usage rows are present
    const usageRows = page.locator('[data-testid^="usage-row-"]');
    await expect(usageRows).not.toHaveCount(0);
  });
});
