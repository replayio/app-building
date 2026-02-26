import { test, expect } from "@playwright/test";

test.describe("Pagination", () => {
  test("Pagination displays First, Previous, page numbers, Next, Last buttons and result count", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    const pagination = page.getByTestId("transactions-pagination");
    await expect(pagination).toBeVisible();

    // Navigation buttons
    await expect(page.getByTestId("pagination-first")).toBeVisible();
    await expect(page.getByTestId("pagination-first")).toHaveText("First");
    await expect(page.getByTestId("pagination-previous")).toBeVisible();
    await expect(page.getByTestId("pagination-previous")).toHaveText("Previous");
    await expect(page.getByTestId("pagination-next")).toBeVisible();
    await expect(page.getByTestId("pagination-next")).toHaveText("Next");
    await expect(page.getByTestId("pagination-last")).toBeVisible();
    await expect(page.getByTestId("pagination-last")).toHaveText("Last");

    // Page 1 should be highlighted
    await expect(page.getByTestId("pagination-page-1")).toBeVisible();
    await expect(page.getByTestId("pagination-page-1")).toHaveClass(/pagination-btn--active/);

    // Result count
    const resultText = await page.getByTestId("pagination-showing").textContent();
    expect(resultText).toMatch(/Showing \d+-\d+ of \d+ results/);
  });

  test("Rows per page dropdown displays with default value of 10", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Rows per page trigger
    await expect(page.getByTestId("rows-per-page-trigger")).toBeVisible();
    await expect(page.getByTestId("rows-per-page-trigger")).toContainText("10");

    // Label
    await expect(page.getByTestId("transactions-pagination").locator(".filter-label")).toContainText("Rows per page:");
  });

  test("Changing rows per page updates the number of visible rows", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Get initial row count (default 10 per page)
    const initialRows = page.locator("[data-testid^='transaction-row-']");
    const initialCount = await initialRows.count();
    expect(initialCount).toBeLessThanOrEqual(10);

    // Get initial showing text
    const initialShowing = await page.getByTestId("pagination-showing").textContent();
    expect(initialShowing).toMatch(/Showing 1-\d+ of \d+ results/);

    // Change to 25 rows per page
    await page.getByTestId("rows-per-page-trigger").click();
    await expect(page.getByTestId("rows-per-page-dropdown")).toBeVisible();
    await page.getByTestId("rows-per-page-option-25").click();

    // Should now show up to 25 rows
    await expect(page.getByTestId("rows-per-page-trigger")).toContainText("25");

    // Showing text should update
    const updatedShowing = await page.getByTestId("pagination-showing").textContent();
    expect(updatedShowing).toMatch(/Showing 1-\d+ of \d+ results/);

    // If there are more than 10 total results, we should now see more rows
    const totalMatch = initialShowing!.match(/of (\d+)/);
    if (totalMatch && parseInt(totalMatch[1]) > 10) {
      const updatedRows = page.locator("[data-testid^='transaction-row-']");
      const updatedCount = await updatedRows.count();
      expect(updatedCount).toBeGreaterThan(initialCount);
    }
  });

  test("Clicking Next button navigates to the next page", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Verify we're on page 1
    await expect(page.getByTestId("pagination-page-1")).toHaveClass(/pagination-btn--active/);

    const page1Showing = await page.getByTestId("pagination-showing").textContent();
    expect(page1Showing).toMatch(/Showing 1-\d+/);

    // Click Next
    await page.getByTestId("pagination-next").click();

    // Page 2 should be active
    await expect(page.getByTestId("pagination-page-2")).toHaveClass(/pagination-btn--active/, { timeout: 15000 });

    // Showing text should update to show page 2 range
    const page2Showing = await page.getByTestId("pagination-showing").textContent();
    expect(page2Showing).toMatch(/Showing 11-\d+/);
  });

  test("Clicking a page number navigates directly to that page", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Click page 3
    await page.getByTestId("pagination-page-3").click();

    // Page 3 should be active
    await expect(page.getByTestId("pagination-page-3")).toHaveClass(/pagination-btn--active/, { timeout: 15000 });

    // Showing text should reflect page 3
    const showingText = await page.getByTestId("pagination-showing").textContent();
    expect(showingText).toMatch(/Showing 21-\d+/);
  });

  test("Clicking Previous button navigates to the previous page", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // First go to page 2
    await page.getByTestId("pagination-next").click();
    await expect(page.getByTestId("pagination-page-2")).toHaveClass(/pagination-btn--active/, { timeout: 15000 });

    // Click Previous
    await page.getByTestId("pagination-previous").click();

    // Should be back on page 1
    await expect(page.getByTestId("pagination-page-1")).toHaveClass(/pagination-btn--active/, { timeout: 15000 });

    const showingText = await page.getByTestId("pagination-showing").textContent();
    expect(showingText).toMatch(/Showing 1-\d+/);
  });

  test("Clicking First button navigates to the first page", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Go to page 3 first
    await page.getByTestId("pagination-page-3").click();
    await expect(page.getByTestId("pagination-page-3")).toHaveClass(/pagination-btn--active/, { timeout: 15000 });

    // Click First
    await page.getByTestId("pagination-first").click();

    // Should be on page 1
    await expect(page.getByTestId("pagination-page-1")).toHaveClass(/pagination-btn--active/, { timeout: 15000 });

    const showingText = await page.getByTestId("pagination-showing").textContent();
    expect(showingText).toMatch(/Showing 1-\d+/);
  });

  test("Clicking Last button navigates to the last page", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Get total pages from showing text
    const showingText = await page.getByTestId("pagination-showing").textContent();
    const totalMatch = showingText!.match(/of (\d+)/);
    const total = parseInt(totalMatch![1]);
    const lastPage = Math.ceil(total / 10);

    // Click Last
    await page.getByTestId("pagination-last").click();

    // Last page should be active
    await expect(page.getByTestId(`pagination-page-${lastPage}`)).toHaveClass(/pagination-btn--active/, { timeout: 15000 });

    // Showing text should reflect last page
    const lastShowing = await page.getByTestId("pagination-showing").textContent();
    expect(lastShowing).toContain(`of ${total} results`);

    // Start of range should be past the first page
    const lastPageMatch = lastShowing!.match(/Showing (\d+)-/);
    expect(parseInt(lastPageMatch![1])).toBeGreaterThan(1);
  });

  test("First and Previous buttons are disabled on first page", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // On page 1, First and Previous should be disabled
    await expect(page.getByTestId("pagination-first")).toBeDisabled();
    await expect(page.getByTestId("pagination-previous")).toBeDisabled();

    // Next and Last should be enabled (assuming more than 1 page of data)
    await expect(page.getByTestId("pagination-next")).toBeEnabled();
    await expect(page.getByTestId("pagination-last")).toBeEnabled();
  });

  test("Next and Last buttons are disabled on last page", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Navigate to last page
    await page.getByTestId("pagination-last").click();

    // Wait for last page to load
    const showingText = await page.getByTestId("pagination-showing").textContent();
    const totalMatch = showingText!.match(/of (\d+)/);
    const total = parseInt(totalMatch![1]);
    const lastPage = Math.ceil(total / 10);
    await expect(page.getByTestId(`pagination-page-${lastPage}`)).toHaveClass(/pagination-btn--active/, { timeout: 15000 });

    // Next and Last should be disabled
    await expect(page.getByTestId("pagination-next")).toBeDisabled();
    await expect(page.getByTestId("pagination-last")).toBeDisabled();

    // First and Previous should be enabled
    await expect(page.getByTestId("pagination-first")).toBeEnabled();
    await expect(page.getByTestId("pagination-previous")).toBeEnabled();
  });

  test("Pagination updates when filters reduce the number of results", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Record initial total
    const initialText = await page.getByTestId("pagination-showing").textContent();
    const initialTotal = parseInt(initialText!.match(/of (\d+)/)![1]);

    // Apply transaction type filter to get fewer results
    await page.getByTestId("transaction-type-filter-trigger").click();
    await expect(page.getByTestId("transaction-type-filter-dropdown")).toBeVisible();
    await page.getByTestId("transaction-type-option-transfer").click();

    // Wait for filter to apply
    await expect(page.getByTestId("transactions-result-count")).not.toHaveText(
      new RegExp(`of ${initialTotal} results`),
      { timeout: 15000 }
    );

    // Filtered total should be less
    const filteredText = await page.getByTestId("pagination-showing").textContent();
    const filteredTotal = parseInt(filteredText!.match(/of (\d+)/)![1]);
    expect(filteredTotal).toBeLessThan(initialTotal);

    // If results fit in one page, all nav buttons should be disabled
    if (filteredTotal <= 10) {
      await expect(page.getByTestId("pagination-first")).toBeDisabled();
      await expect(page.getByTestId("pagination-previous")).toBeDisabled();
      await expect(page.getByTestId("pagination-next")).toBeDisabled();
      await expect(page.getByTestId("pagination-last")).toBeDisabled();
    }
  });

  test("Ellipsis is shown between non-contiguous page numbers", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Get total to verify there are enough pages for ellipsis
    const showingText = await page.getByTestId("pagination-showing").textContent();
    const totalMatch = showingText!.match(/of (\d+)/);
    const total = parseInt(totalMatch![1]);
    const totalPages = Math.ceil(total / 10);

    // Ellipsis appears when there are more than 5 pages
    if (totalPages > 5) {
      await expect(page.getByTestId("pagination-ellipsis")).toBeVisible();

      // Page 1, 2, 3 should be visible
      await expect(page.getByTestId("pagination-page-1")).toBeVisible();
      await expect(page.getByTestId("pagination-page-2")).toBeVisible();
      await expect(page.getByTestId("pagination-page-3")).toBeVisible();

      // Last page should be visible
      await expect(page.getByTestId(`pagination-page-${totalPages}`)).toBeVisible();
    }
  });

  test("Applying a filter resets pagination to page 1", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Go to page 3
    await page.getByTestId("pagination-page-3").click();
    await expect(page.getByTestId("pagination-page-3")).toHaveClass(/pagination-btn--active/, { timeout: 15000 });

    // Apply account filter
    await page.getByTestId("account-filter-trigger").click();
    await expect(page.getByTestId("account-filter-dropdown")).toBeVisible();
    await page.locator("[data-testid^='account-filter-option-']").first().click();
    await page.getByTestId("transactions-page-title").click();

    // Pagination should reset to page 1
    await expect(page.getByTestId("pagination-page-1")).toHaveClass(/pagination-btn--active/, { timeout: 15000 });

    // Showing text should start from 1
    const showingText = await page.getByTestId("pagination-showing").textContent();
    expect(showingText).toMatch(/Showing 1-\d+/);
  });

  test("Sort selection persists across page navigation", async ({ page }) => {
    test.slow();
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-testid^='transaction-row-']").first()).toBeVisible({ timeout: 30000 });

    // Select "Date (Oldest First)" sort
    await page.getByTestId("transactions-sort-dropdown").click();
    await expect(page.getByTestId("transactions-sort-options")).toBeVisible();
    await page.getByTestId("sort-option-date-asc").click();

    // Verify sort dropdown shows the selection
    await expect(page.getByTestId("transactions-sort-dropdown")).toContainText("Date (Oldest First)");

    // Get dates on page 1
    const page1Rows = page.locator("[data-testid^='transaction-row-']");
    const page1Count = await page1Rows.count();
    const page1LastRowTestId = await page1Rows.nth(page1Count - 1).getAttribute("data-testid");
    const page1LastTxnId = page1LastRowTestId!.replace("transaction-row-", "");
    const page1LastDate = await page.getByTestId(`transaction-date-${page1LastTxnId}`).textContent();

    // Navigate to page 2
    await page.getByTestId("pagination-next").click();
    await expect(page.getByTestId("pagination-page-2")).toHaveClass(/pagination-btn--active/, { timeout: 15000 });

    // Sort dropdown should still show "Date (Oldest First)"
    await expect(page.getByTestId("transactions-sort-dropdown")).toContainText("Date (Oldest First)");

    // First date on page 2 should be >= last date on page 1
    const page2Rows = page.locator("[data-testid^='transaction-row-']");
    const page2FirstRowTestId = await page2Rows.first().getAttribute("data-testid");
    const page2FirstTxnId = page2FirstRowTestId!.replace("transaction-row-", "");
    const page2FirstDate = await page.getByTestId(`transaction-date-${page2FirstTxnId}`).textContent();

    const date1 = new Date(page1LastDate!).getTime();
    const date2 = new Date(page2FirstDate!).getTime();
    expect(date2).toBeGreaterThanOrEqual(date1);
  });
});
