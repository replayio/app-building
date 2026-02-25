import { test, expect } from "@playwright/test";

test.describe("EquipmentHeader", () => {
  test('EQ-HDR-1: Page title displays "Equipment Inventory"', async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-page-title")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("equipment-page-title")).toHaveText("Equipment Inventory");
  });

  test("EQ-HDR-2: Page subtitle describes the equipment listing", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-page-title")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("equipment-page-subtitle")).toBeVisible();
    await expect(page.getByTestId("equipment-page-subtitle")).toHaveText(
      "Describes all the equipment available for production runs."
    );
  });

  test("EQ-HDR-3: Add Equipment button is displayed", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-header")).toBeVisible({ timeout: 30000 });

    const addBtn = page.getByTestId("add-equipment-btn");
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText("Add Equipment");
  });

  test("EQ-HDR-4: Add Equipment button opens a form to create new equipment", async ({ page }) => {
    test.slow();
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    // Click Add Equipment
    await page.getByTestId("add-equipment-btn").click();

    // Modal appears with all fields
    await expect(page.getByTestId("add-equipment-modal")).toBeVisible();
    await expect(page.getByTestId("add-equipment-title-input")).toBeVisible();
    await expect(page.getByTestId("add-equipment-description-input")).toBeVisible();
    await expect(page.getByTestId("add-equipment-units-input")).toBeVisible();

    // Fill in the form
    const uniqueName = `Test Equipment ${Date.now()}`;
    await page.getByTestId("add-equipment-title-input").fill(uniqueName);
    await page.getByTestId("add-equipment-description-input").fill("A test item");
    await page.getByTestId("add-equipment-units-input").fill("2");

    // Submit
    await page.getByTestId("add-equipment-submit-btn").click();

    // Modal closes
    await expect(page.getByTestId("add-equipment-modal")).toBeHidden({ timeout: 30000 });

    // New item is appended to end of list; navigate to last page to find it
    const paginationLast = page.getByTestId("pagination-last");
    if (await paginationLast.isVisible()) {
      await paginationLast.click();
    }

    const newRow = page.locator('[data-testid^="equipment-row-"]').filter({ hasText: uniqueName });
    await expect(newRow).toBeVisible({ timeout: 15000 });
    await expect(newRow).toContainText("A test item");
    await expect(newRow).toContainText("2");

    // Verify persistence: navigate away and return
    await page.goto("/recipes");
    await expect(page).toHaveURL(/\/recipes/);
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    // After re-fetch, items are sorted by name; "Test Equipment..." sorts near the end
    const paginationLastAfter = page.getByTestId("pagination-last");
    if (await paginationLastAfter.isVisible()) {
      await paginationLastAfter.click();
    }

    await expect(
      page.locator('[data-testid^="equipment-row-"]').filter({ hasText: uniqueName })
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe("EquipmentTable", () => {
  test("EQ-TBL-1: Table displays Title, Description, Available Units, and Actions column headers", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    const table = page.getByTestId("equipment-table");
    const headers = table.locator("thead th");
    await expect(headers.nth(0)).toHaveText("Title");
    await expect(headers.nth(1)).toHaveText("Description");
    await expect(headers.nth(2)).toHaveText("Available Units");
    await expect(headers.nth(3)).toHaveText("Actions");
  });

  test("EQ-TBL-2: Table rows display equipment data in the correct columns", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    // "Conveyor Belt" is in the seed data (page 1, sorted alphabetically)
    const row = page.locator('[data-testid^="equipment-row-"]').filter({ hasText: "Conveyor Belt" });
    await expect(row).toBeVisible();

    await expect(row.locator('[data-testid^="equipment-title-"]')).toHaveText("Conveyor Belt");
    await expect(row.locator('[data-testid^="equipment-description-"]')).toHaveText(
      "Main production floor conveyor system"
    );
    await expect(row.locator('[data-testid^="equipment-units-"]')).toHaveText("4");
  });

  test("EQ-TBL-3: Edit pencil icon is displayed in the Actions column", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    const firstRow = page.locator('[data-testid^="equipment-row-"]').first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow.locator('[data-testid^="equipment-edit-btn-"]')).toBeVisible();
  });

  test("EQ-TBL-4: Clicking the edit pencil icon opens an edit form for the equipment", async ({ page }) => {
    test.slow();
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    // "Industrial Mixer" has 3 available units (seed data, page 1)
    const row = page.locator('[data-testid^="equipment-row-"]').filter({ hasText: "Industrial Mixer" });
    await expect(row).toBeVisible();

    // Click edit button
    await row.locator('[data-testid^="equipment-edit-btn-"]').click();

    // Edit modal appears with pre-filled data
    await expect(page.getByTestId("edit-equipment-modal")).toBeVisible();
    await expect(page.getByTestId("edit-equipment-title-input")).toHaveValue("Industrial Mixer");
    await expect(page.getByTestId("edit-equipment-description-input")).toHaveValue(
      "Heavy-duty mixer for blending raw materials"
    );
    await expect(page.getByTestId("edit-equipment-units-input")).toHaveValue("3");

    // Change Available Units from "3" to "4"
    await page.getByTestId("edit-equipment-units-input").clear();
    await page.getByTestId("edit-equipment-units-input").fill("4");

    // Save
    await page.getByTestId("edit-equipment-submit-btn").click();

    // Modal closes and row updates
    await expect(page.getByTestId("edit-equipment-modal")).toBeHidden({ timeout: 30000 });
    await expect(
      row.locator('[data-testid^="equipment-units-"]')
    ).toHaveText("4", { timeout: 15000 });

    // Verify persistence
    await page.goto("/recipes");
    await expect(page).toHaveURL(/\/recipes/);
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    const updatedRow = page.locator('[data-testid^="equipment-row-"]').filter({ hasText: "Industrial Mixer" });
    await expect(updatedRow.locator('[data-testid^="equipment-units-"]')).toHaveText("4", { timeout: 15000 });
  });

  test("EQ-TBL-5: Delete trash icon is displayed in the Actions column", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    const firstRow = page.locator('[data-testid^="equipment-row-"]').first();
    await expect(firstRow).toBeVisible();

    const editBtn = firstRow.locator('[data-testid^="equipment-edit-btn-"]');
    const deleteBtn = firstRow.locator('[data-testid^="equipment-delete-btn-"]');
    await expect(editBtn).toBeVisible();
    await expect(deleteBtn).toBeVisible();
  });

  test("EQ-TBL-6: Clicking the delete trash icon removes the equipment after confirmation", async ({ page }) => {
    test.slow();
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    // Create a temporary equipment for deletion
    await page.getByTestId("add-equipment-btn").click();
    await expect(page.getByTestId("add-equipment-modal")).toBeVisible();
    const tempName = `TempDeleteEquipment ${Date.now()}`;
    await page.getByTestId("add-equipment-title-input").fill(tempName);
    await page.getByTestId("add-equipment-description-input").fill("Temp for delete test");
    await page.getByTestId("add-equipment-units-input").fill("1");
    await page.getByTestId("add-equipment-submit-btn").click();
    await expect(page.getByTestId("add-equipment-modal")).toBeHidden({ timeout: 30000 });

    // Navigate to last page to find the newly created item
    const paginationLast = page.getByTestId("pagination-last");
    if (await paginationLast.isVisible()) {
      await paginationLast.click();
    }

    const row = page.locator('[data-testid^="equipment-row-"]').filter({ hasText: tempName });
    await expect(row).toBeVisible({ timeout: 15000 });

    // Click delete button
    await row.locator('[data-testid^="equipment-delete-btn-"]').click();

    // Confirmation dialog appears
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();

    // Confirm deletion
    await page.getByTestId("confirm-dialog-confirm").click();

    // Equipment row is removed
    await expect(
      page.locator('[data-testid^="equipment-row-"]').filter({ hasText: tempName })
    ).toHaveCount(0, { timeout: 15000 });

    // Verify persistence: navigate away and return
    await page.goto("/recipes");
    await expect(page).toHaveURL(/\/recipes/);
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    // Check all pages — navigate to last page
    const paginationLastAfter = page.getByTestId("pagination-last");
    if (await paginationLastAfter.isVisible()) {
      await paginationLastAfter.click();
    }

    await expect(
      page.locator('[data-testid^="equipment-row-"]').filter({ hasText: tempName })
    ).toHaveCount(0, { timeout: 15000 });
  });

  test("EQ-TBL-7: Cancelling delete confirmation does not remove the equipment", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    // Use "Conveyor Belt" (page 1, seed data)
    const row = page.locator('[data-testid^="equipment-row-"]').filter({ hasText: "Conveyor Belt" });
    await expect(row).toBeVisible();

    // Click delete button
    await row.locator('[data-testid^="equipment-delete-btn-"]').click();

    // Confirmation dialog appears
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();

    // Cancel deletion
    await page.getByTestId("confirm-dialog-cancel").click();

    // Dialog closes and equipment remains
    await expect(page.getByTestId("confirm-dialog")).toBeHidden();
    await expect(row).toBeVisible();
  });

  test("EQ-TBL-8: Clicking a table row navigates to the equipment details page", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    // Click on the first visible row
    const firstRow = page.locator('[data-testid^="equipment-row-"]').first();
    await expect(firstRow).toBeVisible();

    // Extract the equipment ID from the row's data-testid
    const testId = await firstRow.getAttribute("data-testid");
    const equipmentId = testId!.replace("equipment-row-", "");

    await firstRow.click();

    // Verify navigation to the equipment details page
    await expect(page).toHaveURL(new RegExp(`/equipment/${equipmentId}`), { timeout: 15000 });
  });

  test("EQ-TBL-9: Pagination displays page count text", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    // With 6+ equipment records and PAGE_SIZE=5, pagination should be visible
    await expect(page.getByTestId("pagination")).toBeVisible();
    await expect(page.getByTestId("pagination-info")).toContainText(/Page 1 of \d+/);
  });

  test("EQ-TBL-10: Pagination next button advances to the next page", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    // Should be on page 1
    await expect(page.getByTestId("pagination-info")).toContainText("Page 1");

    // Click next
    await page.getByTestId("pagination-next").click();

    // Table updates and pagination shows page 2
    await expect(page.getByTestId("pagination-info")).toContainText("Page 2");
  });

  test("EQ-TBL-11: Pagination previous button goes to the previous page", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    // Navigate to page 2 first
    await page.getByTestId("pagination-next").click();
    await expect(page.getByTestId("pagination-info")).toContainText("Page 2");

    // Click previous
    await page.getByTestId("pagination-prev").click();
    await expect(page.getByTestId("pagination-info")).toContainText("Page 1");
  });

  test("EQ-TBL-12: Pagination previous button is disabled on the first page", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    // On page 1, prev and first should be disabled
    await expect(page.getByTestId("pagination-prev")).toBeDisabled();
    await expect(page.getByTestId("pagination-first")).toBeDisabled();
  });

  test("EQ-TBL-13: Pagination next button is disabled on the last page", async ({ page }) => {
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({ timeout: 30000 });

    // Navigate to last page
    await page.getByTestId("pagination-last").click();

    // Next and last should be disabled
    await expect(page.getByTestId("pagination-next")).toBeDisabled();
    await expect(page.getByTestId("pagination-last")).toBeDisabled();
  });
});
