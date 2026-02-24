import { test, expect } from '@playwright/test';

/**
 * MaterialsPage tests.
 *
 * The materials page at /materials displays a paginated table of materials
 * with 8 items per page, filter controls, and toolbar actions for creating
 * materials and categories.
 */

test.describe('MaterialsToolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/materials');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('materials-page')).toBeVisible();
  });

  test('New Material button is visible in toolbar', async ({ page }) => {
    const toolbar = page.getByTestId('materials-toolbar');
    await expect(toolbar).toBeVisible();

    const newMaterialBtn = page.getByTestId('new-material-btn');
    await expect(newMaterialBtn).toBeVisible();
    await expect(newMaterialBtn).toContainText('New Material');
  });

  test('Clicking New Material opens a modal form with name, category, unit, description fields', async ({ page }) => {
    await page.getByTestId('new-material-btn').click();

    const materialForm = page.getByTestId('material-form');
    await expect(materialForm).toBeVisible();

    // Verify all fields are present
    const nameInput = page.getByTestId('material-name-input');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue('');

    const categorySelect = page.getByTestId('material-category-select');
    await expect(categorySelect).toBeVisible();

    const uomInput = page.getByTestId('material-uom-input');
    await expect(uomInput).toBeVisible();
    await expect(uomInput).toHaveValue('');

    const descInput = page.getByTestId('material-description-input');
    await expect(descInput).toBeVisible();
    await expect(descInput).toHaveValue('');

    // Save and Cancel buttons
    await expect(page.getByTestId('modal-save-btn')).toBeVisible();
    await expect(page.getByTestId('modal-cancel-btn')).toBeVisible();
  });

  test('Saving a new material adds it to the materials table', async ({ page }) => {
    const uniqueName = `Test Material ${Date.now()}`;

    // Open the new material modal
    await page.getByTestId('new-material-btn').click();
    await expect(page.getByTestId('material-form')).toBeVisible();

    // Fill in the form
    await page.getByTestId('material-name-input').fill(uniqueName);

    // Select the first category if available
    const categorySelect = page.getByTestId('material-category-select');
    const options = categorySelect.locator('option');
    const optionCount = await options.count();
    if (optionCount > 1) {
      // Pick the second option (first is "Select category" placeholder)
      const optionValue = await options.nth(1).getAttribute('value');
      if (optionValue) {
        await categorySelect.selectOption(optionValue);
      }
    }

    await page.getByTestId('material-uom-input').fill('units');
    await page.getByTestId('material-description-input').fill('Test description');

    // Save
    await page.getByTestId('modal-save-btn').click();
    await page.waitForLoadState('networkidle');

    // Modal should close
    await expect(page.getByTestId('material-form')).not.toBeVisible();

    // Search for the new material to verify it exists
    await page.getByTestId('materials-search-input').fill(uniqueName);
    await page.waitForLoadState('networkidle');

    // The table should contain the new material
    const table = page.getByTestId('materials-table');
    await expect(table.locator('tbody').getByText(uniqueName)).toBeVisible();
  });

  test('New Category button is visible in toolbar', async ({ page }) => {
    const newCategoryBtn = page.getByTestId('new-category-btn');
    await expect(newCategoryBtn).toBeVisible();
    await expect(newCategoryBtn).toContainText('New Category');
  });

  test('Clicking New Category opens a modal form with category name field', async ({ page }) => {
    await page.getByTestId('new-category-btn').click();

    const categoryForm = page.getByTestId('category-form');
    await expect(categoryForm).toBeVisible();

    const nameInput = page.getByTestId('category-name-input');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue('');

    // Save and Cancel buttons
    await expect(page.getByTestId('modal-save-btn')).toBeVisible();
    await expect(page.getByTestId('modal-cancel-btn')).toBeVisible();
  });

  test('Saving a new category adds it to the category filter dropdown', async ({ page }) => {
    const uniqueCategory = `TestCat ${Date.now()}`;

    // Open the new category modal
    await page.getByTestId('new-category-btn').click();
    await expect(page.getByTestId('category-form')).toBeVisible();

    // Fill in the category name
    await page.getByTestId('category-name-input').fill(uniqueCategory);

    // Save
    await page.getByTestId('modal-save-btn').click();
    await page.waitForLoadState('networkidle');

    // Modal should close
    await expect(page.getByTestId('category-form')).not.toBeVisible();

    // Verify the new category appears in the filter dropdown
    const categoryDropdown = page.getByTestId('filter-category-select');
    await expect(categoryDropdown.locator('option', { hasText: uniqueCategory })).toBeAttached();
  });
});

test.describe('MaterialsFilterBar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/materials');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('materials-page')).toBeVisible();
  });

  test('Search input is visible with placeholder text', async ({ page }) => {
    const searchInput = page.getByTestId('materials-search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /[Ss]earch/);
  });

  test('Typing in search filters materials by name', async ({ page }) => {
    // Get the initial count of material rows
    const table = page.getByTestId('materials-table');
    const initialRows = table.locator('tbody tr[data-testid^="material-row-"]');
    const initialCount = await initialRows.count();
    expect(initialCount).toBeGreaterThan(0);

    // Type a search term that should narrow results
    const searchInput = page.getByTestId('materials-search-input');
    await searchInput.fill('Steel');
    await page.waitForLoadState('networkidle');

    // The table should update - all visible materials should contain "Steel"
    const filteredRows = table.locator('tbody tr[data-testid^="material-row-"]');
    const filteredCount = await filteredRows.count();

    if (filteredCount > 0) {
      for (let i = 0; i < filteredCount; i++) {
        const row = filteredRows.nth(i);
        const testId = await row.getAttribute('data-testid');
        const materialId = testId!.replace('material-row-', '');
        const nameCell = page.getByTestId(`material-name-${materialId}`);
        await expect(nameCell).toContainText(/[Ss]teel/i);
      }
    }
  });

  test("Filter by Category dropdown defaults to 'All Categories'", async ({ page }) => {
    const categorySelect = page.getByTestId('filter-category-select');
    await expect(categorySelect).toBeVisible();

    // The selected option text should be "All Categories"
    const selectedValue = await categorySelect.inputValue();
    expect(selectedValue).toBe('');

    // The first option should be "All Categories"
    const firstOption = categorySelect.locator('option').first();
    await expect(firstOption).toHaveText('All Categories');
  });

  test('Selecting a category filters the table', async ({ page }) => {
    const categorySelect = page.getByTestId('filter-category-select');

    // Get all options (skip the first "All Categories" option)
    const options = categorySelect.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(1);

    // Select the second option (first real category)
    const categoryValue = await options.nth(1).getAttribute('value');
    const categoryName = await options.nth(1).textContent();
    expect(categoryValue).toBeTruthy();

    await categorySelect.selectOption(categoryValue!);
    await page.waitForLoadState('networkidle');

    // All visible material rows should have the selected category
    const table = page.getByTestId('materials-table');
    const rows = table.locator('tbody tr[data-testid^="material-row-"]');
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const testId = await row.getAttribute('data-testid');
      const materialId = testId!.replace('material-row-', '');
      const catCell = page.getByTestId(`material-category-${materialId}`);
      await expect(catCell).toHaveText(categoryName!.trim());
    }
  });

  test("Filter by Account dropdown defaults to 'All Accounts'", async ({ page }) => {
    const accountSelect = page.getByTestId('filter-account-select');
    await expect(accountSelect).toBeVisible();

    const selectedValue = await accountSelect.inputValue();
    expect(selectedValue).toBe('');

    const firstOption = accountSelect.locator('option').first();
    await expect(firstOption).toHaveText('All Accounts');
  });

  test("Sort by dropdown defaults to 'Name (A-Z)'", async ({ page }) => {
    const sortSelect = page.getByTestId('sort-by-select');
    await expect(sortSelect).toBeVisible();

    // The default value should be name_asc
    const selectedValue = await sortSelect.inputValue();
    expect(selectedValue).toBe('name_asc');

    // The selected option text should be "Name (A-Z)"
    const selectedOption = sortSelect.locator('option[value="name_asc"]');
    await expect(selectedOption).toHaveText('Name (A-Z)');
  });

  test('Changing sort order reorders the table', async ({ page }) => {
    // Get the first material name with default sort (A-Z)
    const table = page.getByTestId('materials-table');
    const rows = table.locator('tbody tr[data-testid^="material-row-"]');
    await expect(rows.first()).toBeVisible();

    const firstRowTestId = await rows.first().getAttribute('data-testid');
    const firstMaterialId = firstRowTestId!.replace('material-row-', '');
    const firstNameAZ = await page.getByTestId(`material-name-${firstMaterialId}`).textContent();

    // Change sort to Name (Z-A)
    await page.getByTestId('sort-by-select').selectOption('name_desc');
    await page.waitForLoadState('networkidle');

    // The first material should now be different (Z-A vs A-Z)
    const rowsAfter = table.locator('tbody tr[data-testid^="material-row-"]');
    await expect(rowsAfter.first()).toBeVisible();
    const newFirstTestId = await rowsAfter.first().getAttribute('data-testid');
    const newFirstMaterialId = newFirstTestId!.replace('material-row-', '');
    const firstNameZA = await page.getByTestId(`material-name-${newFirstMaterialId}`).textContent();

    expect(firstNameAZ).not.toBe(firstNameZA);
  });

  test('Filters work in combination', async ({ page }) => {
    // Select a category
    const categorySelect = page.getByTestId('filter-category-select');
    const options = categorySelect.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(1);

    const categoryValue = await options.nth(1).getAttribute('value');
    const categoryName = await options.nth(1).textContent();
    await categorySelect.selectOption(categoryValue!);
    await page.waitForLoadState('networkidle');

    // Get the filtered count after category selection
    const table = page.getByTestId('materials-table');
    const rowsAfterCategory = table.locator('tbody tr[data-testid^="material-row-"]');
    const countAfterCategory = await rowsAfterCategory.count();

    // Now add a search filter on top of the category filter
    if (countAfterCategory > 0) {
      const firstRowId = await rowsAfterCategory.first().getAttribute('data-testid');
      const matId = firstRowId!.replace('material-row-', '');
      const matName = await page.getByTestId(`material-name-${matId}`).textContent();

      // Type part of the material name to narrow results further
      const searchTerm = matName!.substring(0, 3);
      await page.getByTestId('materials-search-input').fill(searchTerm);
      await page.waitForLoadState('networkidle');

      // Remaining rows should match both the category and the search term
      const remainingRows = table.locator('tbody tr[data-testid^="material-row-"]');
      const remainingCount = await remainingRows.count();

      for (let i = 0; i < remainingCount; i++) {
        const row = remainingRows.nth(i);
        const rowTestId = await row.getAttribute('data-testid');
        const rowMatId = rowTestId!.replace('material-row-', '');
        const rowCategory = page.getByTestId(`material-category-${rowMatId}`);
        await expect(rowCategory).toHaveText(categoryName!.trim());
      }
    }
  });
});

test.describe('MaterialsTable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/materials');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('materials-page')).toBeVisible();
  });

  test('Table displays column headers: Material Name, Category, Unit of Measure, Stock, Actions', async ({ page }) => {
    const table = page.getByTestId('materials-table');
    await expect(table).toBeVisible();

    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(5);
    await expect(headers.nth(0)).toHaveText('Material Name');
    await expect(headers.nth(1)).toHaveText('Category');
    await expect(headers.nth(2)).toHaveText('Unit of Measure');
    await expect(headers.nth(3)).toHaveText('Stock');
    await expect(headers.nth(4)).toHaveText('Actions');
  });

  test('Material rows display correct data', async ({ page }) => {
    const table = page.getByTestId('materials-table');
    const rows = table.locator('tbody tr[data-testid^="material-row-"]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Verify the first row has data in all columns
    const firstRow = rows.first();
    const testId = await firstRow.getAttribute('data-testid');
    const materialId = testId!.replace('material-row-', '');

    const nameCell = page.getByTestId(`material-name-${materialId}`);
    const categoryCell = page.getByTestId(`material-category-${materialId}`);
    const uomCell = page.getByTestId(`material-uom-${materialId}`);
    const stockCell = page.getByTestId(`material-stock-${materialId}`);

    await expect(nameCell).toBeVisible();
    const nameText = await nameCell.textContent();
    expect(nameText!.length).toBeGreaterThan(0);

    await expect(categoryCell).toBeVisible();
    await expect(uomCell).toBeVisible();
    await expect(stockCell).toBeVisible();
  });

  test('Eye icon in Actions navigates to MaterialDetailPage', async ({ page }) => {
    const table = page.getByTestId('materials-table');
    const rows = table.locator('tbody tr[data-testid^="material-row-"]');
    await expect(rows.first()).toBeVisible();

    const firstRowTestId = await rows.first().getAttribute('data-testid');
    const materialId = firstRowTestId!.replace('material-row-', '');

    const viewBtn = page.getByTestId(`view-material-${materialId}`);
    await expect(viewBtn).toBeVisible();
    await viewBtn.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(`/materials/${materialId}`);
  });

  test('Pencil icon in Actions opens edit modal', async ({ page }) => {
    const table = page.getByTestId('materials-table');
    const rows = table.locator('tbody tr[data-testid^="material-row-"]');
    await expect(rows.first()).toBeVisible();

    const firstRowTestId = await rows.first().getAttribute('data-testid');
    const materialId = firstRowTestId!.replace('material-row-', '');

    const editBtn = page.getByTestId(`edit-material-${materialId}`);
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // The material form should appear with pre-filled data
    const materialForm = page.getByTestId('material-form');
    await expect(materialForm).toBeVisible();

    // The name input should be pre-filled
    const nameInput = page.getByTestId('material-name-input');
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);

    // Cancel to close
    await page.getByTestId('modal-cancel-btn').click();
    await expect(materialForm).not.toBeVisible();
  });

  test("'View Detail' text link navigates to MaterialDetailPage", async ({ page }) => {
    const table = page.getByTestId('materials-table');
    const rows = table.locator('tbody tr[data-testid^="material-row-"]');
    await expect(rows.first()).toBeVisible();

    const firstRowTestId = await rows.first().getAttribute('data-testid');
    const materialId = firstRowTestId!.replace('material-row-', '');

    const viewDetailLink = page.getByTestId(`view-detail-link-${materialId}`);
    await expect(viewDetailLink).toBeVisible();
    await expect(viewDetailLink).toContainText('View Detail');

    await viewDetailLink.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(`/materials/${materialId}`);
  });

  test("'Edit' text link opens edit modal", async ({ page }) => {
    const table = page.getByTestId('materials-table');
    const rows = table.locator('tbody tr[data-testid^="material-row-"]');
    await expect(rows.first()).toBeVisible();

    const firstRowTestId = await rows.first().getAttribute('data-testid');
    const materialId = firstRowTestId!.replace('material-row-', '');

    const editLink = page.getByTestId(`edit-link-${materialId}`);
    await expect(editLink).toBeVisible();
    await editLink.click();

    // The material form should appear
    const materialForm = page.getByTestId('material-form');
    await expect(materialForm).toBeVisible();

    // The name input should be pre-filled with the material name
    const nameInput = page.getByTestId('material-name-input');
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);

    // Cancel to close
    await page.getByTestId('modal-cancel-btn').click();
    await expect(materialForm).not.toBeVisible();
  });

  test('Empty state displayed when no materials match filters', async ({ page }) => {
    // Type a search term that should match nothing
    const searchInput = page.getByTestId('materials-search-input');
    await searchInput.fill('zzznonexistentmaterial999');
    await page.waitForLoadState('networkidle');

    // The empty state should be visible
    const emptyState = page.getByTestId('materials-empty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No materials');
  });
});

test.describe('Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/materials');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('materials-page')).toBeVisible();
  });

  test("Pagination shows 'Showing X-Y of Z items'", async ({ page }) => {
    const paginationInfo = page.getByTestId('pagination-info');
    await expect(paginationInfo).toBeVisible();

    const infoText = await paginationInfo.textContent();
    // Should match pattern like "Showing 1-8 of 45 items"
    expect(infoText).toMatch(/Showing \d+-\d+ of \d+ items/);
  });

  test('Clicking Next goes to the next page', async ({ page }) => {
    // Verify we are on page 1
    const paginationInfo = page.getByTestId('pagination-info');
    await expect(paginationInfo).toContainText('Showing 1-');

    // Get the first material name on page 1
    const table = page.getByTestId('materials-table');
    const firstRowTestId = await table.locator('tbody tr[data-testid^="material-row-"]').first().getAttribute('data-testid');
    const firstPageFirstName = await page.getByTestId(`material-name-${firstRowTestId!.replace('material-row-', '')}`).textContent();

    // Click Next
    const nextBtn = page.getByTestId('pagination-next');
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();
    await page.waitForLoadState('networkidle');

    // Pagination info should now show "Showing 9-"
    await expect(paginationInfo).toContainText('Showing 9-');

    // The first material on page 2 should be different from page 1
    const newFirstRowTestId = await table.locator('tbody tr[data-testid^="material-row-"]').first().getAttribute('data-testid');
    const secondPageFirstName = await page.getByTestId(`material-name-${newFirstRowTestId!.replace('material-row-', '')}`).textContent();
    expect(secondPageFirstName).not.toBe(firstPageFirstName);
  });

  test('Clicking Previous goes to the previous page', async ({ page }) => {
    // First go to page 2
    const nextBtn = page.getByTestId('pagination-next');
    await nextBtn.click();
    await page.waitForLoadState('networkidle');

    const paginationInfo = page.getByTestId('pagination-info');
    await expect(paginationInfo).toContainText('Showing 9-');

    // Click Previous
    const prevBtn = page.getByTestId('pagination-prev');
    await expect(prevBtn).toBeEnabled();
    await prevBtn.click();
    await page.waitForLoadState('networkidle');

    // Should be back on page 1
    await expect(paginationInfo).toContainText('Showing 1-');
  });

  test('Clicking a page number navigates directly to that page', async ({ page }) => {
    // Click page 3
    const page3Btn = page.getByTestId('pagination-page-3');
    await expect(page3Btn).toBeVisible();
    await page3Btn.click();
    await page.waitForLoadState('networkidle');

    // Pagination info should reflect page 3 (items 17-24)
    const paginationInfo = page.getByTestId('pagination-info');
    await expect(paginationInfo).toContainText('Showing 17-');

    // Page 3 button should be active
    await expect(page3Btn).toHaveClass(/active/);
  });

  test('Pagination updates when filters change', async ({ page }) => {
    // Initially should show all materials
    const paginationInfo = page.getByTestId('pagination-info');
    const initialText = await paginationInfo.textContent();
    const totalMatch = initialText!.match(/of (\d+) items/);
    expect(totalMatch).toBeTruthy();
    const initialTotal = parseInt(totalMatch![1], 10);
    expect(initialTotal).toBeGreaterThan(8);

    // Apply a search filter that should reduce results
    await page.getByTestId('materials-search-input').fill('Steel');
    await page.waitForLoadState('networkidle');

    // Pagination should update with fewer items
    const filteredText = await paginationInfo.textContent();
    const filteredMatch = filteredText!.match(/of (\d+) items/);

    if (filteredMatch) {
      const filteredTotal = parseInt(filteredMatch[1], 10);
      expect(filteredTotal).toBeLessThan(initialTotal);
    } else {
      // If no pagination is shown, the filtered set fits on one page
      // or there might be no matches - pagination element may be hidden
      const table = page.getByTestId('materials-table');
      const rows = table.locator('tbody tr[data-testid^="material-row-"]');
      const count = await rows.count();
      expect(count).toBeLessThan(initialTotal);
    }
  });
});
