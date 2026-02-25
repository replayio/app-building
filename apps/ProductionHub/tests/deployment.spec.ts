import { test, expect } from "@playwright/test";

test.describe("ProductionHub Deployment", () => {
  test("App loads, displays data, and supports updates", async ({ page }) => {
    // 1. Navigate to the main page (redirects to /recipes)
    await page.goto("/");
    await expect(page).toHaveURL(/\/recipes/);

    // 2. Verify data displays - recipes table should load with real data
    await expect(page.getByTestId("recipes-table")).toBeVisible({ timeout: 60000 });
    const recipeRows = page.locator('[data-testid^="recipe-row-"]');
    await expect(recipeRows.first()).toBeVisible({ timeout: 30000 });
    const recipeCount = await recipeRows.count();
    expect(recipeCount).toBeGreaterThan(0);

    // 3. Navigate to equipment page and verify data there too
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 60000 });
    const equipmentRows = page.locator('[data-testid^="equipment-row-"]');
    await expect(equipmentRows.first()).toBeVisible({ timeout: 30000 });

    // 4. Perform a write operation - add new equipment
    await page.getByTestId("add-equipment-btn").click();
    await expect(page.getByTestId("add-equipment-modal")).toBeVisible();

    const uniqueName = `Deploy Test ${Date.now()}`;
    await page.getByTestId("add-equipment-title-input").fill(uniqueName);
    await page.getByTestId("add-equipment-description-input").fill("Deployment verification");
    await page.getByTestId("add-equipment-units-input").fill("1");
    await page.getByTestId("add-equipment-submit-btn").click();

    // Modal closes after save
    await expect(page.getByTestId("add-equipment-modal")).toBeHidden({ timeout: 30000 });

    // Navigate to last page to find the new item
    const paginationLast = page.getByTestId("pagination-last");
    if (await paginationLast.isVisible()) {
      await paginationLast.click();
      await page.waitForTimeout(1000);
    }

    // Verify the new equipment appears in the table
    const newRow = page.locator('[data-testid^="equipment-row-"]').filter({ hasText: uniqueName });
    await expect(newRow).toBeVisible({ timeout: 30000 });
  });
});
