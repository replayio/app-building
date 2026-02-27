import { test, expect } from "@playwright/test";

test.describe("RecipesHeader", () => {
  test('REC-HDR-1: Page title displays "Recipes"', async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-page-title")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("recipes-page-title")).toHaveText("Recipes");
    await expect(page.getByTestId("recipes-page-route")).toHaveText("/recipes");
  });

  test("REC-HDR-2: Search bar is displayed with placeholder text", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-page-title")).toBeVisible({ timeout: 30000 });

    const searchInput = page.getByTestId("recipes-search-input");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute("placeholder", "Search by name or product...");
  });

  test("REC-HDR-3: Search bar filters recipes by name", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("recipes-search-input").fill("Granola");

    // Only "Organic Granola Mix" matches (name contains "Granola")
    await expect(page.locator('[data-testid^="recipe-row-"]')).toHaveCount(1);
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Organic Granola Mix" })
    ).toBeVisible();
  });

  test("REC-HDR-4: Search bar filters recipes by product", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // "Jam" matches product "Strawberry Jam" but no recipe name contains "Jam"
    await page.getByTestId("recipes-search-input").fill("Jam");

    await expect(page.locator('[data-testid^="recipe-row-"]')).toHaveCount(1);
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Fruit Preserve" })
    ).toBeVisible();
  });

  test("REC-HDR-5: Clearing the search bar restores all recipes", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Filter to one result
    await page.getByTestId("recipes-search-input").fill("Granola");
    await expect(page.locator('[data-testid^="recipe-row-"]')).toHaveCount(1);

    // Clear search
    await page.getByTestId("recipes-search-input").fill("");

    // Page 1 shows PAGE_SIZE (5) recipes
    await expect(page.locator('[data-testid^="recipe-row-"]')).toHaveCount(5, { timeout: 15000 });
  });

  test('REC-HDR-6: Filter Status dropdown is displayed with default value "(All)"', async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-header")).toBeVisible({ timeout: 30000 });

    const filterBtn = page.getByTestId("recipes-status-filter-btn");
    await expect(filterBtn).toBeVisible();
    await expect(filterBtn).toContainText("(All)");
  });

  test("REC-HDR-7: Filter Status dropdown shows status options", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-header")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("recipes-status-filter-btn").click();

    await expect(page.getByTestId("recipes-status-dropdown")).toBeVisible();
    await expect(page.getByTestId("recipes-status-option-all")).toBeVisible();
    await expect(page.getByTestId("recipes-status-option-active")).toBeVisible();
    await expect(page.getByTestId("recipes-status-option-draft")).toBeVisible();
    await expect(page.getByTestId("recipes-status-option-archived")).toBeVisible();
  });

  test('REC-HDR-8: Selecting "Active" filter shows only active recipes', async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("recipes-status-filter-btn").click();
    await page.getByTestId("recipes-status-option-active").click();

    // Wait for filter to apply - active recipes should be visible
    await expect(page.locator('[data-testid^="recipe-row-"]').first()).toBeVisible();

    // Draft recipes should not appear
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Trail Mix Classic" })
    ).toHaveCount(0);
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Yogurt Bark Bites" })
    ).toHaveCount(0);
    // Archived recipes should not appear
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Almond Butter Smooth" })
    ).toHaveCount(0);
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Pumpkin Spice Blend" })
    ).toHaveCount(0);
  });

  test('REC-HDR-9: Selecting "Draft" filter shows only draft recipes', async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("recipes-status-filter-btn").click();
    await page.getByTestId("recipes-status-option-draft").click();

    // Only Draft recipes should be visible
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Trail Mix Classic" })
    ).toBeVisible();
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Yogurt Bark Bites" })
    ).toBeVisible();

    // Active recipes should not appear
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Organic Granola Mix" })
    ).toHaveCount(0);
  });

  test('REC-HDR-10: Selecting "Archived" filter shows only archived recipes', async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("recipes-status-filter-btn").click();
    await page.getByTestId("recipes-status-option-archived").click();

    // Only Archived recipes should be visible
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Almond Butter Smooth" })
    ).toBeVisible();
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Pumpkin Spice Blend" })
    ).toBeVisible();

    // Active recipes should not appear
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Organic Granola Mix" })
    ).toHaveCount(0);
  });

  test('REC-HDR-11: Selecting "All" filter restores all recipes', async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // First filter to Active
    await page.getByTestId("recipes-status-filter-btn").click();
    await page.getByTestId("recipes-status-option-active").click();

    // Archived recipe should be hidden
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Almond Butter Smooth" })
    ).toHaveCount(0);

    // Now select All
    await page.getByTestId("recipes-status-filter-btn").click();
    await page.getByTestId("recipes-status-option-all").click();

    // All recipes should be shown (page 1 = 5 items)
    await expect(page.locator('[data-testid^="recipe-row-"]')).toHaveCount(5, { timeout: 15000 });

    // Previously hidden Archived recipe should be visible on page 1 (first alphabetically)
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Almond Butter Smooth" })
    ).toBeVisible();
  });

  test("REC-HDR-12: Add Recipe button is displayed", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-header")).toBeVisible({ timeout: 30000 });

    const addBtn = page.getByTestId("add-recipe-btn");
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText("Add Recipe");
  });

  test("REC-HDR-13: Add Recipe button opens a creation form", async ({ page }) => {
    test.slow();
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Click Add Recipe
    await page.getByTestId("add-recipe-btn").click();

    // Modal appears with all fields
    await expect(page.getByTestId("add-recipe-modal")).toBeVisible();
    await expect(page.getByTestId("add-recipe-name-input")).toBeVisible();
    await expect(page.getByTestId("add-recipe-product-input")).toBeVisible();
    await expect(page.getByTestId("add-recipe-version-input")).toBeVisible();
    await expect(page.getByTestId("add-recipe-status-select")).toBeVisible();

    // Fill in the form
    await page.getByTestId("add-recipe-name-input").fill("Test Recipe");
    await page.getByTestId("add-recipe-product-input").fill("Test Product");
    await page.getByTestId("add-recipe-version-input").fill("1.0");

    // Select Draft status
    await page.getByTestId("add-recipe-status-select").click();
    await page.getByTestId("add-recipe-status-option-draft").click();

    // Submit
    await page.getByTestId("add-recipe-submit-btn").click();

    // Modal closes
    await expect(page.getByTestId("add-recipe-modal")).toBeHidden({ timeout: 30000 });

    // Search for the new recipe
    await page.getByTestId("recipes-search-input").fill("Test Recipe");
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Test Recipe" });
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row).toContainText("Test Product");
    await expect(row).toContainText("1.0");
    await expect(row.locator('[data-testid^="recipe-status-"]')).toContainText("Draft");

    // Verify persistence: navigate away and return
    await page.goto("/calendar");
    await expect(page).toHaveURL(/\/calendar/);
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("recipes-search-input").fill("Test Recipe");
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Test Recipe" })
    ).toBeVisible({ timeout: 15000 });
  });

  test("REC-HDR-14: Search and filter work together", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Select Active filter
    await page.getByTestId("recipes-status-filter-btn").click();
    await page.getByTestId("recipes-status-option-active").click();

    // Type search for "Granola"
    await page.getByTestId("recipes-search-input").fill("Granola");

    // Only "Organic Granola Mix" (Active AND name contains "Granola") should match
    await expect(page.locator('[data-testid^="recipe-row-"]')).toHaveCount(1);
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Organic Granola Mix" })
    ).toBeVisible();
  });

  test("REC-HDR-15: Cancelling Add Recipe modal does not create a recipe", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Count current rows on page 1
    const initialCount = await page.locator('[data-testid^="recipe-row-"]').count();

    // Open Add Recipe modal
    await page.getByTestId("add-recipe-btn").click();
    await expect(page.getByTestId("add-recipe-modal")).toBeVisible();

    // Fill in some data
    await page.getByTestId("add-recipe-name-input").fill("CancelledRecipe");
    await page.getByTestId("add-recipe-product-input").fill("CancelledProduct");

    // Click Cancel
    await page.getByTestId("add-recipe-cancel-btn").click();

    // Modal closes
    await expect(page.getByTestId("add-recipe-modal")).toBeHidden();

    // Row count remains the same
    await expect(page.locator('[data-testid^="recipe-row-"]')).toHaveCount(initialCount);

    // The cancelled recipe does not appear
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "CancelledRecipe" })
    ).toHaveCount(0);
  });
});

test.describe("RecipesTable", () => {
  test("REC-TBL-1: Table displays Recipe Name, Product, Version, Status, and Actions column headers", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    const table = page.getByTestId("recipes-table");
    const headers = table.locator("thead th");
    await expect(headers.nth(0)).toHaveText("Recipe Name");
    await expect(headers.nth(1)).toHaveText("Product");
    await expect(headers.nth(2)).toHaveText("Version");
    await expect(headers.nth(3)).toHaveText("Status");
    await expect(headers.nth(4)).toHaveText("Actions");
  });

  test("REC-TBL-2: Table rows display recipe data in the correct columns", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // "Cashew Butter Creamy" is Active and on page 1 (2nd alphabetically)
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Cashew Butter Creamy" });
    await expect(row).toBeVisible();

    await expect(row.locator('[data-testid^="recipe-name-"]')).toHaveText("Cashew Butter Creamy");
    await expect(row.locator('[data-testid^="recipe-product-"]')).toHaveText("Cashew Butter");
    await expect(row.locator('[data-testid^="recipe-version-"]')).toHaveText("2.0");
    await expect(row.locator('[data-testid^="recipe-status-"]')).toContainText("Active");
  });

  test("REC-TBL-3: Active status is displayed as a green badge", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // "Cashew Butter Creamy" is Active, on page 1
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Cashew Butter Creamy" });
    const statusBadge = row.locator('[data-testid^="recipe-status-"] .badge');
    await expect(statusBadge).toHaveText("Active");
    await expect(statusBadge).toHaveClass(/badge--active/);
  });

  test("REC-TBL-4: Draft status is displayed as a yellow badge", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Search for Draft recipe "Trail Mix Classic"
    await page.getByTestId("recipes-search-input").fill("Trail Mix Classic");

    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Trail Mix Classic" });
    await expect(row).toBeVisible({ timeout: 15000 });

    const statusBadge = row.locator('[data-testid^="recipe-status-"] .badge');
    await expect(statusBadge).toHaveText("Draft");
    await expect(statusBadge).toHaveClass(/badge--draft/);
  });

  test("REC-TBL-5: Archived status is displayed as a gray badge", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // "Almond Butter Smooth" is Archived, on page 1 (first alphabetically)
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Almond Butter Smooth" });
    await expect(row).toBeVisible();

    const statusBadge = row.locator('[data-testid^="recipe-status-"] .badge');
    await expect(statusBadge).toHaveText("Archived");
    await expect(statusBadge).toHaveClass(/badge--archived/);
  });

  test("REC-TBL-6: Edit pencil icon is displayed in the Actions column", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Check that rows have edit buttons
    const firstRow = page.locator('[data-testid^="recipe-row-"]').first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow.locator('[data-testid^="recipe-edit-btn-"]')).toBeVisible();
  });

  test("REC-TBL-7: Clicking the edit pencil icon opens an edit form for the recipe", async ({ page }) => {
    test.slow();
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Use "Coconut Chips Toasted" (Active, page 1)
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Coconut Chips Toasted" });
    await expect(row).toBeVisible();

    // Click edit button
    await row.locator('[data-testid^="recipe-edit-btn-"]').click();

    // Edit modal appears with pre-filled data
    await expect(page.getByTestId("edit-recipe-modal")).toBeVisible();
    await expect(page.getByTestId("edit-recipe-name-input")).toHaveValue("Coconut Chips Toasted");
    await expect(page.getByTestId("edit-recipe-product-input")).toHaveValue("Coconut Chips");
    await expect(page.getByTestId("edit-recipe-version-input")).toHaveValue("1.0");

    // Change version from "1.0" to "1.1"
    await page.getByTestId("edit-recipe-version-input").clear();
    await page.getByTestId("edit-recipe-version-input").fill("1.1");

    // Save
    await page.getByTestId("edit-recipe-submit-btn").click();

    // Modal closes and row updates
    await expect(page.getByTestId("edit-recipe-modal")).toBeHidden({ timeout: 30000 });
    await expect(
      row.locator('[data-testid^="recipe-version-"]')
    ).toHaveText("1.1", { timeout: 15000 });

    // Verify persistence
    await page.goto("/calendar");
    await expect(page).toHaveURL(/\/calendar/);
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    const updatedRow = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Coconut Chips Toasted" });
    await expect(updatedRow.locator('[data-testid^="recipe-version-"]')).toHaveText("1.1", { timeout: 15000 });
  });

  test("REC-TBL-8: Delete trash icon is displayed in the Actions column", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Check that rows have delete buttons
    const firstRow = page.locator('[data-testid^="recipe-row-"]').first();
    await expect(firstRow).toBeVisible();

    const deleteBtn = firstRow.locator('[data-testid^="recipe-delete-btn-"]');
    await expect(deleteBtn).toBeVisible();
  });

  test("REC-TBL-9: Clicking the delete trash icon removes the recipe after confirmation", async ({ page }) => {
    test.slow();
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Create a temporary recipe for deletion
    await page.getByTestId("add-recipe-btn").click();
    await expect(page.getByTestId("add-recipe-modal")).toBeVisible();
    await page.getByTestId("add-recipe-name-input").fill("TempDeleteRecipe");
    await page.getByTestId("add-recipe-product-input").fill("TempProduct");
    await page.getByTestId("add-recipe-submit-btn").click();
    await expect(page.getByTestId("add-recipe-modal")).toBeHidden({ timeout: 30000 });

    // Search for the created recipe
    await page.getByTestId("recipes-search-input").fill("TempDeleteRecipe");
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "TempDeleteRecipe" });
    await expect(row).toBeVisible({ timeout: 15000 });

    // Click delete button
    await row.locator('[data-testid^="recipe-delete-btn-"]').click();

    // Confirmation dialog appears
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();

    // Confirm deletion
    await page.getByTestId("confirm-dialog-confirm").click();

    // Recipe row is removed
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "TempDeleteRecipe" })
    ).toHaveCount(0, { timeout: 15000 });

    // Verify persistence: navigate away and return
    await page.goto("/calendar");
    await expect(page).toHaveURL(/\/calendar/);
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("recipes-search-input").fill("TempDeleteRecipe");
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "TempDeleteRecipe" })
    ).toHaveCount(0, { timeout: 15000 });
  });

  test("REC-TBL-10: Cancelling delete confirmation does not remove the recipe", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Use "Cashew Butter Creamy" (page 1)
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Cashew Butter Creamy" });
    await expect(row).toBeVisible();

    // Click delete button
    await row.locator('[data-testid^="recipe-delete-btn-"]').click();

    // Confirmation dialog appears
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();

    // Cancel deletion
    await page.getByTestId("confirm-dialog-cancel").click();

    // Dialog closes and recipe remains
    await expect(page.getByTestId("confirm-dialog")).toBeHidden();
    await expect(row).toBeVisible();
  });

  test("REC-TBL-11: Clicking a table row opens the RecipeDetailsPanel", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Click on "Fruit Preserve - Strawberry" row (page 1)
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Fruit Preserve" });
    await expect(row).toBeVisible();
    await row.click();

    // Panel opens showing the recipe details
    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("recipe-panel-title")).toContainText("Fruit Preserve - Strawberry");
  });

  test("REC-TBL-12: Selected row is visually highlighted", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Click on first recipe row
    const firstRow = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Cashew Butter Creamy" });
    await firstRow.click();

    // First row should have "selected" class
    await expect(firstRow).toHaveClass(/selected/);

    // Click on another row
    const secondRow = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Dried Mango Slices" });
    await secondRow.click();

    // Second row highlighted, first row no longer highlighted
    await expect(secondRow).toHaveClass(/selected/);
    await expect(firstRow).not.toHaveClass(/selected/);
  });

  test("REC-TBL-13: Pagination displays page number", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // With 12+ recipes and PAGE_SIZE=5, pagination should be visible
    await expect(page.getByTestId("pagination")).toBeVisible();
    await expect(page.getByTestId("pagination-info")).toContainText("Page 1");
  });

  test("REC-TBL-14: Pagination first-page button navigates to the first page", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Navigate to page 2 first
    await page.getByTestId("pagination-next").click();
    await expect(page.getByTestId("pagination-info")).toContainText("Page 2");

    // Click first page button
    await page.getByTestId("pagination-first").click();
    await expect(page.getByTestId("pagination-info")).toContainText("Page 1");

    // First recipe alphabetically should be visible
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Almond Butter Smooth" })
    ).toBeVisible();
  });

  test("REC-TBL-15: Pagination previous button navigates to the previous page", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Navigate to page 2
    await page.getByTestId("pagination-next").click();
    await expect(page.getByTestId("pagination-info")).toContainText("Page 2");

    // Click previous button
    await page.getByTestId("pagination-prev").click();
    await expect(page.getByTestId("pagination-info")).toContainText("Page 1");
  });

  test("REC-TBL-16: Pagination next button advances to the next page", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Should be on page 1
    await expect(page.getByTestId("pagination-info")).toContainText("Page 1");

    // Click next
    await page.getByTestId("pagination-next").click();
    await expect(page.getByTestId("pagination-info")).toContainText("Page 2");

    // Page 2 recipes should be visible (e.g., "Honey Roasted Peanuts" is 6th alphabetically)
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Honey Roasted Peanuts" })
    ).toBeVisible();
  });

  test("REC-TBL-17: Pagination last-page button navigates to the last page", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Click last page button
    await page.getByTestId("pagination-last").click();

    // Should not be on page 1 anymore
    const paginationInfo = page.getByTestId("pagination-info");
    await expect(paginationInfo).not.toContainText("Page 1");

    // Last page should show recipes at end of alphabet (e.g., "Trail Mix Classic")
    await expect(
      page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Trail Mix Classic" })
    ).toBeVisible();
  });

  test("REC-TBL-18: Pagination previous and first-page buttons are disabled on the first page", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // On page 1, first and prev should be disabled
    await expect(page.getByTestId("pagination-first")).toBeDisabled();
    await expect(page.getByTestId("pagination-prev")).toBeDisabled();
  });

  test("REC-TBL-19: Pagination next and last-page buttons are disabled on the last page", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Navigate to last page
    await page.getByTestId("pagination-last").click();

    // Next and last should be disabled
    await expect(page.getByTestId("pagination-next")).toBeDisabled();
    await expect(page.getByTestId("pagination-last")).toBeDisabled();
  });

  test("REC-TBL-20: Version column displays version with Draft indicator when applicable", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Search for "Trail Mix Classic" (Draft, version "1.0")
    await page.getByTestId("recipes-search-input").fill("Trail Mix Classic");

    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Trail Mix Classic" });
    await expect(row).toBeVisible({ timeout: 15000 });

    // Version should show "1.0 (Draft)"
    await expect(row.locator('[data-testid^="recipe-version-"]')).toHaveText("1.0 (Draft)");
  });

  test("REC-TBL-21: Cancelling Edit Recipe modal does not save changes", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Use "Coconut Chips Toasted" (Active, page 1)
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Coconut Chips Toasted" });
    await expect(row).toBeVisible();

    // Remember original version
    const originalVersion = await row.locator('[data-testid^="recipe-version-"]').textContent();

    // Click edit button
    await row.locator('[data-testid^="recipe-edit-btn-"]').click();

    // Edit modal appears with pre-filled data
    await expect(page.getByTestId("edit-recipe-modal")).toBeVisible();

    // Change version
    await page.getByTestId("edit-recipe-version-input").clear();
    await page.getByTestId("edit-recipe-version-input").fill("99.99");

    // Click Cancel
    await page.getByTestId("edit-recipe-cancel-btn").click();

    // Modal closes
    await expect(page.getByTestId("edit-recipe-modal")).toBeHidden();

    // Version remains unchanged
    await expect(row.locator('[data-testid^="recipe-version-"]')).toHaveText(originalVersion!);
  });
});

test.describe("RecipeDetailsPanel", () => {
  test("REC-PNL-1: Side panel displays with recipe title", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Click "Fruit Preserve - Strawberry" (page 1)
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Fruit Preserve" });
    await row.click();

    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("recipe-panel-title")).toHaveText(
      "Recipe Details: Fruit Preserve - Strawberry"
    );
  });

  test("REC-PNL-2: Side panel title updates when a different recipe is selected", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Click first recipe
    const firstRow = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Cashew Butter Creamy" });
    await firstRow.click();
    await expect(page.getByTestId("recipe-panel-title")).toHaveText(
      "Recipe Details: Cashew Butter Creamy",
      { timeout: 15000 }
    );

    // Click another recipe
    const secondRow = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Dried Mango Slices" });
    await secondRow.click();
    await expect(page.getByTestId("recipe-panel-title")).toHaveText(
      "Recipe Details: Dried Mango Slices",
      { timeout: 15000 }
    );
  });

  test("REC-PNL-3: General Info tab is displayed", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Fruit Preserve" }).click();
    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    await expect(page.getByTestId("recipe-panel-tab-general")).toBeVisible();
    await expect(page.getByTestId("recipe-panel-tab-general")).toContainText("General Info");
  });

  test("REC-PNL-4: Materials Breakdown tab is displayed", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Fruit Preserve" }).click();
    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    await expect(page.getByTestId("recipe-panel-tab-materials")).toBeVisible();
    await expect(page.getByTestId("recipe-panel-tab-materials")).toContainText("Materials Breakdown");
  });

  test("REC-PNL-5: Instructions tab is displayed", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Fruit Preserve" }).click();
    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    await expect(page.getByTestId("recipe-panel-tab-instructions")).toBeVisible();
    await expect(page.getByTestId("recipe-panel-tab-instructions")).toContainText("Instructions");
  });

  test("REC-PNL-6: General Info tab shows recipe general information", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Fruit Preserve" }).click();
    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    // General Info tab is active by default
    await page.getByTestId("recipe-panel-tab-general").click();

    await expect(page.getByTestId("recipe-panel-general-name")).toHaveText("Fruit Preserve - Strawberry");
    await expect(page.getByTestId("recipe-panel-general-product")).toHaveText("Strawberry Jam");
    await expect(page.getByTestId("recipe-panel-general-version")).toHaveText("3.0");
    await expect(page.getByTestId("recipe-panel-general-status")).toContainText("Active");
  });

  test("REC-PNL-7: Materials Breakdown tab shows materials table", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Fruit Preserve" }).click();
    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    await page.getByTestId("recipe-panel-tab-materials").click();

    const materialsTable = page.getByTestId("recipe-materials-table");
    await expect(materialsTable).toBeVisible({ timeout: 15000 });

    // Check column headers
    const headers = materialsTable.locator("thead th");
    await expect(headers.nth(0)).toHaveText("Material");
    await expect(headers.nth(1)).toHaveText("Quantity (per unit)");
    await expect(headers.nth(2)).toHaveText("Unit");
  });

  test("REC-PNL-8: Materials table displays material rows with correct data", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Click "Fruit Preserve - Strawberry" (has Strawberries, Cane Sugar, Pectin)
    await page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Fruit Preserve" }).click();
    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    await page.getByTestId("recipe-panel-tab-materials").click();
    await expect(page.getByTestId("recipe-materials-table")).toBeVisible({ timeout: 15000 });

    const materialsTable = page.getByTestId("recipe-materials-table");

    // Check for Cane Sugar row
    const sugarRow = materialsTable.locator("tr").filter({ hasText: "Cane Sugar" });
    await expect(sugarRow).toBeVisible();
    await expect(sugarRow).toContainText("20");
    await expect(sugarRow).toContainText("kg");

    // Check for Pectin row
    const pectinRow = materialsTable.locator("tr").filter({ hasText: "Pectin" });
    await expect(pectinRow).toBeVisible();
    await expect(pectinRow).toContainText("0.5");
    await expect(pectinRow).toContainText("kg");

    // Check for Strawberries row
    const strawberryRow = materialsTable.locator("tr").filter({ hasText: "Strawberries" });
    await expect(strawberryRow).toBeVisible();
    await expect(strawberryRow).toContainText("40");
    await expect(strawberryRow).toContainText("kg");
  });

  test("REC-PNL-9: Materials Breakdown tab shows Notes & Instructions section", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Use "Fruit Preserve - Strawberry" which has instructions
    await page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Fruit Preserve" }).click();
    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    await page.getByTestId("recipe-panel-tab-materials").click();
    await expect(page.getByTestId("recipe-materials-table")).toBeVisible({ timeout: 15000 });

    // Notes section should be visible with the instructions text
    const notesSection = page.getByTestId("recipe-panel-notes-section");
    await expect(notesSection).toBeVisible();

    await expect(page.getByTestId("recipe-panel-notes-text")).toBeVisible();
    await expect(page.getByTestId("recipe-panel-notes-text")).toContainText("Wash and hull strawberries");
  });

  test("REC-PNL-10: Notes & Instructions section shows placeholder when empty", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Search for "Mixed Seed Brittle" which has materials but no instructions
    await page.getByTestId("recipes-search-input").fill("Mixed Seed Brittle");
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Mixed Seed Brittle" });
    await expect(row).toBeVisible({ timeout: 15000 });

    await row.click();
    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    await page.getByTestId("recipe-panel-tab-materials").click();
    await expect(page.getByTestId("recipe-materials-table")).toBeVisible({ timeout: 15000 });

    // Notes section should show empty placeholder
    await expect(page.getByTestId("recipe-panel-notes-empty")).toBeVisible();
  });

  test("REC-PNL-11: Instructions tab shows recipe instructions", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Fruit Preserve" }).click();
    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    await page.getByTestId("recipe-panel-tab-instructions").click();

    await expect(page.getByTestId("recipe-panel-instructions-text")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("recipe-panel-instructions-text")).toContainText(
      "Wash and hull strawberries"
    );
  });

  test("REC-PNL-12: Instructions tab shows placeholder when no instructions exist", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // "Almond Butter Smooth" has no instructions (page 1, first alphabetically)
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Almond Butter Smooth" });
    await expect(row).toBeVisible();
    await row.click();

    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    await page.getByTestId("recipe-panel-tab-instructions").click();

    await expect(page.getByTestId("recipe-panel-instructions-empty")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("recipe-panel-instructions-empty")).toContainText(
      "No instructions available"
    );
  });

  test("REC-PNL-13: Switching between tabs preserves selected recipe", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Select "Fruit Preserve - Strawberry"
    await page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Fruit Preserve" }).click();
    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    // On General Info tab, verify recipe
    await expect(page.getByTestId("recipe-panel-title")).toContainText("Fruit Preserve - Strawberry");

    // Switch to Materials Breakdown
    await page.getByTestId("recipe-panel-tab-materials").click();
    await expect(page.getByTestId("recipe-panel-title")).toContainText("Fruit Preserve - Strawberry");

    // Switch to Instructions
    await page.getByTestId("recipe-panel-tab-instructions").click();
    await expect(page.getByTestId("recipe-panel-title")).toContainText("Fruit Preserve - Strawberry");
  });

  test("REC-PNL-14: Materials table shows empty state when recipe has no materials", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // "Almond Butter Smooth" has no materials
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Almond Butter Smooth" });
    await expect(row).toBeVisible();
    await row.click();

    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    await page.getByTestId("recipe-panel-tab-materials").click();

    // Should show empty state
    const materialsSection = page.getByTestId("recipe-panel-materials");
    await expect(materialsSection).toBeVisible({ timeout: 15000 });
    await expect(materialsSection.locator(".empty-state")).toBeVisible();
    await expect(materialsSection).toContainText("No materials defined");
  });

  test("REC-PNL-15: Close button closes the RecipeDetailsPanel", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Open the details panel by clicking a recipe row
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Fruit Preserve" });
    await row.click();
    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    // Click the close button
    await page.getByTestId("recipe-panel-close").click();

    // Panel should be hidden
    await expect(page.getByTestId("recipe-details-panel")).toBeHidden();
  });

  test("REC-PNL-16: Editing a recipe updates the RecipeDetailsPanel", async ({ page }) => {
    test.slow();
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Click on "Cashew Butter Creamy" row to open the details panel
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "Cashew Butter Creamy" });
    await expect(row).toBeVisible();
    await row.click();

    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    // Verify current version in the panel
    await expect(page.getByTestId("recipe-panel-general-version")).toHaveText("2.0", { timeout: 15000 });

    // Click the edit pencil icon for the same recipe
    await row.locator('[data-testid^="recipe-edit-btn-"]').click();
    await expect(page.getByTestId("edit-recipe-modal")).toBeVisible();

    // Change version from "2.0" to "2.1"
    await page.getByTestId("edit-recipe-version-input").clear();
    await page.getByTestId("edit-recipe-version-input").fill("2.1");

    // Save
    await page.getByTestId("edit-recipe-submit-btn").click();
    await expect(page.getByTestId("edit-recipe-modal")).toBeHidden({ timeout: 30000 });

    // Verify the panel updates to show the new version
    await expect(page.getByTestId("recipe-panel-general-version")).toHaveText("2.1", { timeout: 15000 });
  });

  test("REC-PNL-17: Deleting a recipe closes the RecipeDetailsPanel", async ({ page }) => {
    test.slow();
    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 30000 });

    // Create a temporary recipe for this test
    await page.getByTestId("add-recipe-btn").click();
    await expect(page.getByTestId("add-recipe-modal")).toBeVisible();
    await page.getByTestId("add-recipe-name-input").fill("TempPanelDeleteRecipe");
    await page.getByTestId("add-recipe-product-input").fill("TempProduct");
    await page.getByTestId("add-recipe-submit-btn").click();
    await expect(page.getByTestId("add-recipe-modal")).toBeHidden({ timeout: 30000 });

    // Search for the created recipe
    await page.getByTestId("recipes-search-input").fill("TempPanelDeleteRecipe");
    const row = page.locator('[data-testid^="recipe-row-"]').filter({ hasText: "TempPanelDeleteRecipe" });
    await expect(row).toBeVisible({ timeout: 15000 });

    // Click the row to open the details panel
    await row.click();
    await expect(page.getByTestId("recipe-details-panel")).toBeVisible({ timeout: 15000 });

    // Click the delete button
    await row.locator('[data-testid^="recipe-delete-btn-"]').click();
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();

    // Confirm deletion
    await page.getByTestId("confirm-dialog-confirm").click();

    // Recipe row should be removed and panel should close
    await expect(row).toHaveCount(0, { timeout: 15000 });
    await expect(page.getByTestId("recipe-details-panel")).toBeHidden();
  });
});
