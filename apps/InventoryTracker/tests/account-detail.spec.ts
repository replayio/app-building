import { test, expect } from '@playwright/test';

/**
 * AccountDetailPage tests.
 *
 * We navigate to the Accounts list first, find an account that has tracked
 * materials, and click into it so we discover the real account ID from the
 * UI rather than hardcoding database IDs.
 *
 * The seed data contains an account "Finished Goods Warehouse 2" with ID
 * "A-1024-INV" that has materials. We navigate directly to that account.
 */

const ACCOUNT_PATH = '/accounts/A-1024-INV';

test.describe('AccountHeader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ACCOUNT_PATH);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('account-detail-page')).toBeVisible();
  });

  test('Breadcrumb navigation displays Home > Accounts > AccountName', async ({ page }) => {
    const breadcrumbHome = page.getByTestId('breadcrumb-home');
    const breadcrumbAccounts = page.getByTestId('breadcrumb-accounts');
    const breadcrumbCurrent = page.getByTestId('breadcrumb-current');

    await expect(breadcrumbHome).toBeVisible();
    await expect(breadcrumbHome).toHaveText('Home');
    await expect(breadcrumbAccounts).toBeVisible();
    await expect(breadcrumbAccounts).toHaveText('Accounts');
    await expect(breadcrumbCurrent).toBeVisible();

    // The current breadcrumb should show the account name
    const accountName = await breadcrumbCurrent.textContent();
    expect(accountName).toBeTruthy();
    expect(accountName!.length).toBeGreaterThan(0);
  });

  test('Breadcrumb Home link navigates to Dashboard', async ({ page }) => {
    const breadcrumbHome = page.getByTestId('breadcrumb-home');
    await expect(breadcrumbHome).toBeVisible();
    await breadcrumbHome.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/');
  });

  test('Breadcrumb Accounts link navigates to AccountsPage', async ({ page }) => {
    const breadcrumbAccounts = page.getByTestId('breadcrumb-accounts');
    await expect(breadcrumbAccounts).toBeVisible();
    await breadcrumbAccounts.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/accounts');
  });

  test("Page heading displays 'Account: AccountName'", async ({ page }) => {
    const heading = page.getByTestId('page-heading');
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text).toBeTruthy();
    expect(text!).toMatch(/^Account: .+$/);
  });

  test("Account Type is displayed (e.g. 'Type: Stock Account')", async ({ page }) => {
    const accountType = page.getByTestId('account-type');
    await expect(accountType).toBeVisible();
    const text = await accountType.textContent();
    expect(text).toBeTruthy();
    // Should display "Type: <SomeType> Account"
    expect(text!).toMatch(/^Type: .+ Account$/);
  });

  test("Status badge shows 'Active' in green", async ({ page }) => {
    const statusEl = page.getByTestId('account-status');
    await expect(statusEl).toBeVisible();
    await expect(statusEl).toContainText('Active');
    // Verify the badge has the success class (green styling)
    const badge = statusEl.locator('.badge-success');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('Active');
  });

  test('Edit Account button is visible', async ({ page }) => {
    const editBtn = page.getByTestId('edit-account-btn');
    await expect(editBtn).toBeVisible();
    await expect(editBtn).toContainText('Edit Account');
  });

  test('Clicking Edit Account button opens an edit modal pre-filled with current account data', async ({ page }) => {
    // Capture the current account name from the heading
    const heading = page.getByTestId('page-heading');
    const headingText = await heading.textContent();
    const currentName = headingText!.replace('Account: ', '');

    // Click Edit Account
    await page.getByTestId('edit-account-btn').click();

    // The edit modal should appear
    const editModal = page.getByTestId('edit-modal');
    await expect(editModal).toBeVisible();

    // Check that the name input is pre-filled with the current name
    const nameInput = page.getByTestId('account-name-input');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue(currentName);

    // Check that the description input is visible
    const descInput = page.getByTestId('account-description-input');
    await expect(descInput).toBeVisible();

    // Save and Cancel buttons should be visible
    await expect(page.getByTestId('modal-save-btn')).toBeVisible();
    await expect(page.getByTestId('modal-cancel-btn')).toBeVisible();
  });

  test('Saving edits updates the account header', async ({ page }) => {
    // Get the current name
    const heading = page.getByTestId('page-heading');
    const headingText = await heading.textContent();
    const originalName = headingText!.replace('Account: ', '');

    // Open edit modal
    await page.getByTestId('edit-account-btn').click();
    const editModal = page.getByTestId('edit-modal');
    await expect(editModal).toBeVisible();

    // Change the name
    const nameInput = page.getByTestId('account-name-input');
    await nameInput.clear();
    const newName = originalName + ' Edited';
    await nameInput.fill(newName);

    // Save
    await page.getByTestId('modal-save-btn').click();
    await page.waitForLoadState('networkidle');

    // The modal should close
    await expect(editModal).not.toBeVisible();

    // The heading should reflect the new name
    await expect(heading).toContainText(`Account: ${newName}`);

    // Revert the name back for test isolation
    await page.getByTestId('edit-account-btn').click();
    await expect(page.getByTestId('edit-modal')).toBeVisible();
    const revertInput = page.getByTestId('account-name-input');
    await revertInput.clear();
    await revertInput.fill(originalName);
    await page.getByTestId('modal-save-btn').click();
    await page.waitForLoadState('networkidle');
  });

  test('New Transaction button is visible', async ({ page }) => {
    const newTxnBtn = page.getByTestId('new-transaction-btn');
    await expect(newTxnBtn).toBeVisible();
    await expect(newTxnBtn).toContainText('New Transaction');
  });

  test('Clicking New Transaction button navigates to NewTransactionPage', async ({ page }) => {
    const newTxnBtn = page.getByTestId('new-transaction-btn');
    await newTxnBtn.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/transactions\/new/);
  });
});

test.describe('TrackedMaterialsTable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ACCOUNT_PATH);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('account-detail-page')).toBeVisible();
  });

  test('Tracked Materials section heading is displayed', async ({ page }) => {
    const section = page.getByTestId('tracked-materials-section');
    await expect(section).toBeVisible();

    const heading = page.getByTestId('tracked-materials-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Tracked Materials');
  });

  test('Table displays column headers: Material Name, Category, Unit of Measure, Total Quantity, Number of Batches, Actions', async ({ page }) => {
    const table = page.getByTestId('tracked-materials-table');
    await expect(table).toBeVisible();

    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(6);
    await expect(headers.nth(0)).toHaveText('Material Name');
    await expect(headers.nth(1)).toHaveText('Category');
    await expect(headers.nth(2)).toHaveText('Unit of Measure');
    await expect(headers.nth(3)).toHaveText('Total Quantity');
    await expect(headers.nth(4)).toHaveText('Number of Batches');
    await expect(headers.nth(5)).toHaveText('Actions');
  });

  test('Material rows display correct data for each column', async ({ page }) => {
    const table = page.getByTestId('tracked-materials-table');
    await expect(table).toBeVisible();

    // Get all material rows (rows with data-testid matching material-row-*)
    const rows = table.locator('tbody tr[data-testid^="material-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Check the first row has data in all columns
    const firstRow = rows.first();
    const firstRowTestId = await firstRow.getAttribute('data-testid');
    const materialId = firstRowTestId!.replace('material-row-', '');

    // Each column should have content
    const nameCell = page.getByTestId(`material-name-${materialId}`);
    const categoryCell = page.getByTestId(`material-category-${materialId}`);
    const uomCell = page.getByTestId(`material-uom-${materialId}`);
    const quantityCell = page.getByTestId(`material-quantity-${materialId}`);
    const batchesCell = page.getByTestId(`material-batches-${materialId}`);

    await expect(nameCell).toBeVisible();
    const nameText = await nameCell.textContent();
    expect(nameText!.length).toBeGreaterThan(0);

    await expect(categoryCell).toBeVisible();
    await expect(uomCell).toBeVisible();
    await expect(quantityCell).toBeVisible();
    await expect(batchesCell).toBeVisible();
  });

  test('Total Quantity column shows sigma (Σ) symbol indicating sum of batches', async ({ page }) => {
    const table = page.getByTestId('tracked-materials-table');
    const rows = table.locator('tbody tr[data-testid^="material-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Get the first row's material ID
    const firstRow = rows.first();
    const firstRowTestId = await firstRow.getAttribute('data-testid');
    const materialId = firstRowTestId!.replace('material-row-', '');

    // The Total Quantity cell should contain the sigma symbol
    const quantityCell = page.getByTestId(`material-quantity-${materialId}`);
    await expect(quantityCell).toBeVisible();
    await expect(quantityCell).toContainText('\u03A3');
  });

  test('Number of Batches column displays the batch count', async ({ page }) => {
    const table = page.getByTestId('tracked-materials-table');
    const rows = table.locator('tbody tr[data-testid^="material-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Get the first row's material ID
    const firstRow = rows.first();
    const firstRowTestId = await firstRow.getAttribute('data-testid');
    const materialId = firstRowTestId!.replace('material-row-', '');

    const batchesCell = page.getByTestId(`material-batches-${materialId}`);
    await expect(batchesCell).toBeVisible();
    const batchText = await batchesCell.textContent();
    // Should match pattern like "12 Batches" or "1 Batches"
    expect(batchText).toMatch(/\d+\s+Batch/);
  });

  test("Actions column has a 'View Material in this Account' link with external link icon", async ({ page }) => {
    const table = page.getByTestId('tracked-materials-table');
    const rows = table.locator('tbody tr[data-testid^="material-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Get the first row's material ID
    const firstRow = rows.first();
    const firstRowTestId = await firstRow.getAttribute('data-testid');
    const materialId = firstRowTestId!.replace('material-row-', '');

    const viewLink = page.getByTestId(`view-material-${materialId}`);
    await expect(viewLink).toBeVisible();
    await expect(viewLink).toContainText('View Material in this Account');

    // Should contain an SVG icon (ExternalLink)
    const icon = viewLink.locator('svg');
    await expect(icon).toBeVisible();
  });

  test("Clicking 'View Material in this Account' link navigates to MaterialDetailPage", async ({ page }) => {
    const table = page.getByTestId('tracked-materials-table');
    const rows = table.locator('tbody tr[data-testid^="material-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Get the first row's material ID
    const firstRow = rows.first();
    const firstRowTestId = await firstRow.getAttribute('data-testid');
    const materialId = firstRowTestId!.replace('material-row-', '');

    const viewLink = page.getByTestId(`view-material-${materialId}`);
    await viewLink.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to the material detail page
    await expect(page).toHaveURL(`/materials/${materialId}`);
  });

  test('Empty state displayed when account has no tracked materials', async ({ page }) => {
    // Navigate to the accounts page to find an account without materials.
    // Output accounts typically have no batches and will show the empty state.
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    // Collect all account links from the page
    const accountLinks = page.locator('a[href^="/accounts/"]');
    const linkCount = await accountLinks.count();

    // Gather all hrefs first to avoid stale element references
    const hrefs: string[] = [];
    for (let i = 0; i < linkCount; i++) {
      const href = await accountLinks.nth(i).getAttribute('href');
      if (href) hrefs.push(href);
    }

    // Visit each account until we find one with the empty state
    let foundEmpty = false;
    for (const href of hrefs) {
      if (foundEmpty) break;
      await page.goto(href);
      await page.waitForLoadState('networkidle');

      // Check if account detail page loaded
      const detailPage = page.getByTestId('account-detail-page');
      const isDetail = await detailPage.isVisible({ timeout: 3000 }).catch(() => false);
      if (!isDetail) continue;

      const emptyState = page.getByTestId('tracked-materials-empty');
      const isEmptyVisible = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);
      if (isEmptyVisible) {
        foundEmpty = true;
        // Verify the empty state message
        await expect(emptyState).toContainText('No materials');

        // Verify the heading and table are still displayed
        await expect(page.getByTestId('tracked-materials-heading')).toBeVisible();
        await expect(page.getByTestId('tracked-materials-table')).toBeVisible();
      }
    }

    // If we did not find an empty account, the test should still pass
    // by verifying the concept: when there are no materials, empty state shows.
    // We assert that we found at least one such account.
    expect(foundEmpty).toBe(true);
  });
});
