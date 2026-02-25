import { test, expect } from "@playwright/test";

/**
 * Navigate to the first order's detail page by clicking an order ID link
 * from the dashboard's UpcomingOrdersTable.
 */
async function navigateToFirstOrder(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("upcoming-orders")).toBeVisible({ timeout: 30000 });

  const firstLink = page.locator("[data-testid^='order-link-']").first();
  await expect(firstLink).toBeVisible({ timeout: 30000 });

  await firstLink.click();
  await expect(page.getByTestId("order-details-page")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("line-items-section")).toBeVisible({ timeout: 30000 });
}

test.describe("OrderDetailsPage - LineItemsTable", () => {
  test("Display Line Items Table with Correct Columns", async ({ page }) => {
    await navigateToFirstOrder(page);

    const section = page.getByTestId("line-items-section");
    await expect(section).toBeVisible();
    await expect(section).toContainText("Line Items");

    const table = page.getByTestId("line-items-table");
    await expect(table).toBeVisible();

    // Verify all column headers
    const headers = table.locator("thead th");
    await expect(headers.nth(0)).toHaveText("SKU");
    await expect(headers.nth(1)).toHaveText("Item Name / Description");
    await expect(headers.nth(2)).toHaveText("Qty");
    await expect(headers.nth(3)).toHaveText("Unit Price");
    await expect(headers.nth(4)).toHaveText("Line Total");
  });

  test("Display Line Item Row Data", async ({ page }) => {
    await navigateToFirstOrder(page);

    const table = page.getByTestId("line-items-table");
    await expect(table).toBeVisible();

    // Get the first row and verify its cells contain data
    const firstRow = page.getByTestId("line-item-row").first();
    await expect(firstRow).toBeVisible();

    const sku = firstRow.getByTestId("line-item-sku");
    await expect(sku).not.toBeEmpty();

    const name = firstRow.getByTestId("line-item-name");
    await expect(name).not.toBeEmpty();

    const qty = firstRow.getByTestId("line-item-qty");
    await expect(qty).not.toBeEmpty();

    // Unit Price and Line Total should show currency format
    const unitPrice = firstRow.getByTestId("line-item-unit-price");
    await expect(unitPrice).toHaveText(/\$[\d,]+\.\d{2}/);

    const lineTotal = firstRow.getByTestId("line-item-total");
    await expect(lineTotal).toHaveText(/\$[\d,]+\.\d{2}/);
  });

  test("Display Multiple Line Items", async ({ page }) => {
    await navigateToFirstOrder(page);

    const table = page.getByTestId("line-items-table");
    await expect(table).toBeVisible();

    // There should be at least 3 line item rows based on seed data
    const rows = page.getByTestId("line-item-row");
    await expect(rows).toHaveCount(3, { timeout: 30000 });

    // Verify each row has non-empty content
    for (let i = 0; i < 3; i++) {
      const row = rows.nth(i);
      await expect(row.getByTestId("line-item-sku")).not.toBeEmpty();
      await expect(row.getByTestId("line-item-name")).not.toBeEmpty();
      await expect(row.getByTestId("line-item-qty")).not.toBeEmpty();
      await expect(row.getByTestId("line-item-unit-price")).toHaveText(/\$[\d,]+\.\d{2}/);
      await expect(row.getByTestId("line-item-total")).toHaveText(/\$[\d,]+\.\d{2}/);
    }
  });

  test("Add Line Item", async ({ page }) => {
    test.slow();

    await navigateToFirstOrder(page);

    // Count existing rows
    const initialRows = page.getByTestId("line-item-row");
    const initialCount = await initialRows.count();

    // Count existing history entries
    const historySection = page.getByTestId("order-history");
    await expect(historySection).toBeVisible({ timeout: 30000 });
    const initialHistoryCount = await page.getByTestId("timeline-event").count();

    // Click "Add Item" button
    const addBtn = page.getByTestId("add-line-item-btn");
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Modal should appear
    const modal = page.getByTestId("line-item-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.locator(".modal-title")).toHaveText("Add Line Item");

    // Fill in the form fields
    await page.getByTestId("line-item-form-sku").fill("SKU-TEST-001");
    await page.getByTestId("line-item-form-name").fill("Test Widget");
    await page.getByTestId("line-item-form-qty").fill("5");
    await page.getByTestId("line-item-form-unit-price").fill("100");

    // Click Save
    await page.getByTestId("line-item-save").click();

    // Modal should close
    await expect(modal).toBeHidden({ timeout: 30000 });

    // New row should appear in the table
    await expect(page.getByTestId("line-item-row")).toHaveCount(initialCount + 1, { timeout: 30000 });

    // Verify the new row has the correct data
    const newRow = page.getByTestId("line-item-row").filter({ hasText: "Test Widget" });
    await expect(newRow).toBeVisible({ timeout: 30000 });
    await expect(newRow.getByTestId("line-item-sku")).toHaveText("SKU-TEST-001");
    await expect(newRow.getByTestId("line-item-qty")).toHaveText("5");
    await expect(newRow.getByTestId("line-item-unit-price")).toHaveText("$100.00");
    // Line Total = 5 * $100 = $500.00
    await expect(newRow.getByTestId("line-item-total")).toHaveText("$500.00");

    // Cost breakdown should update
    const subtotal = page.getByTestId("cost-subtotal");
    await expect(subtotal).toBeVisible();

    // History should have exactly one new entry for the addition
    await expect(page.getByTestId("timeline-event")).toHaveCount(initialHistoryCount + 1, { timeout: 30000 });
    await expect(
      page.getByTestId("timeline-event-description").filter({ hasText: /Line item added/ }).first()
    ).toBeVisible({ timeout: 30000 });
  });

  test("Edit Line Item", async ({ page }) => {
    test.slow();

    await navigateToFirstOrder(page);

    const table = page.getByTestId("line-items-table");
    await expect(table).toBeVisible();

    // Get initial history count
    const historySection = page.getByTestId("order-history");
    await expect(historySection).toBeVisible({ timeout: 30000 });
    const initialHistoryCount = await page.getByTestId("timeline-event").count();

    // Click edit on the first row
    const firstRow = page.getByTestId("line-item-row").first();
    await expect(firstRow).toBeVisible();
    await firstRow.getByTestId("line-item-edit-btn").click();

    // Modal should appear with pre-filled values
    const modal = page.getByTestId("line-item-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.locator(".modal-title")).toHaveText("Edit Line Item");

    // Form fields should be pre-filled
    await expect(page.getByTestId("line-item-form-sku")).not.toHaveValue("");
    await expect(page.getByTestId("line-item-form-name")).not.toHaveValue("");

    // Change the quantity
    const qtyInput = page.getByTestId("line-item-form-qty");
    await qtyInput.clear();
    await qtyInput.fill("99");

    // Click Save
    await page.getByTestId("line-item-save").click();

    // Modal should close
    await expect(modal).toBeHidden({ timeout: 30000 });

    // The first row should reflect the new quantity
    await expect(firstRow.getByTestId("line-item-qty")).toHaveText("99", { timeout: 30000 });

    // Cost breakdown should update
    const subtotal = page.getByTestId("cost-subtotal");
    await expect(subtotal).toBeVisible();

    // History should have exactly one new entry for the update
    await expect(page.getByTestId("timeline-event")).toHaveCount(initialHistoryCount + 1, { timeout: 30000 });
    await expect(
      page.getByTestId("timeline-event-description").filter({ hasText: /Line item updated/ }).first()
    ).toBeVisible({ timeout: 30000 });
  });

  test("Delete Line Item", async ({ page }) => {
    test.slow();

    await navigateToFirstOrder(page);

    const table = page.getByTestId("line-items-table");
    await expect(table).toBeVisible();

    // Count existing rows
    const initialCount = await page.getByTestId("line-item-row").count();
    expect(initialCount).toBeGreaterThan(0);

    // Get initial history count
    const historySection = page.getByTestId("order-history");
    await expect(historySection).toBeVisible({ timeout: 30000 });
    const initialHistoryCount = await page.getByTestId("timeline-event").count();

    // Get the name of the last row item (we delete last to not affect other tests in this file)
    const lastRow = page.getByTestId("line-item-row").last();
    const itemName = await lastRow.getByTestId("line-item-name").textContent();

    // Click delete on the last row
    await lastRow.getByTestId("line-item-delete-btn").click();

    // Confirmation dialog should appear
    const confirmDialog = page.getByTestId("confirm-dialog");
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await expect(confirmDialog).toContainText("Are you sure you want to delete this line item?");

    // Confirm deletion
    await page.getByTestId("confirm-dialog-confirm").click();

    // Row count should decrease
    await expect(page.getByTestId("line-item-row")).toHaveCount(initialCount - 1, { timeout: 30000 });

    // The deleted item should no longer appear
    if (itemName) {
      await expect(
        page.getByTestId("line-item-row").filter({ hasText: itemName })
      ).toHaveCount(0, { timeout: 15000 });
    }

    // Cost breakdown should update
    const subtotal = page.getByTestId("cost-subtotal");
    await expect(subtotal).toBeVisible();

    // History should have exactly one new entry for the deletion
    await expect(page.getByTestId("timeline-event")).toHaveCount(initialHistoryCount + 1, { timeout: 30000 });
    await expect(
      page.getByTestId("timeline-event-description").filter({ hasText: /Line item removed/ }).first()
    ).toBeVisible({ timeout: 30000 });
  });
});
