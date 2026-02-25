import { test, expect } from "@playwright/test";

test.describe("DashboardPage - QuickActions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });
  });

  test("Display Add New Supplier Button", async ({ page }) => {
    const btn = page.getByTestId("quick-action-add-supplier");
    await expect(btn).toBeVisible();
    await expect(btn).toContainText("Add New Supplier");
    // Verify person-plus icon (SVG) is present inside the button
    await expect(btn.locator("svg")).toBeVisible();
  });

  test("Display Create Purchase Order Button", async ({ page }) => {
    const btn = page.getByTestId("quick-action-create-order");
    await expect(btn).toBeVisible();
    await expect(btn).toContainText("Create Purchase Order");
    // Verify document icon (SVG) is present inside the button
    await expect(btn.locator("svg")).toBeVisible();
  });

  test("Add New Supplier Button Opens Create Supplier Dialog", async ({ page }) => {
    await page.getByTestId("quick-action-add-supplier").click();

    const modal = page.getByTestId("add-supplier-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Verify dialog title
    await expect(modal.locator(".modal-title")).toHaveText("Add New Supplier");

    // Verify all form fields exist
    await expect(page.getByTestId("supplier-form-name")).toBeVisible();
    await expect(page.getByTestId("supplier-form-address")).toBeVisible();
    await expect(page.getByTestId("supplier-form-contact-name")).toBeVisible();
    await expect(page.getByTestId("supplier-form-phone")).toBeVisible();
    await expect(page.getByTestId("supplier-form-email")).toBeVisible();
    await expect(page.getByTestId("supplier-form-description")).toBeVisible();
    await expect(page.getByTestId("supplier-form-status")).toBeVisible();

    // Verify status defaults to "Active"
    await expect(page.getByTestId("supplier-form-status")).toContainText("Active");

    // Verify status dropdown has all options
    await page.getByTestId("supplier-form-status").click();
    const dropdown = page.getByTestId("supplier-form-status-dropdown");
    await expect(dropdown).toBeVisible();
    await expect(page.getByTestId("supplier-form-status-option-active")).toBeVisible();
    await expect(page.getByTestId("supplier-form-status-option-inactive")).toBeVisible();
    await expect(page.getByTestId("supplier-form-status-option-on-hold")).toBeVisible();
    await expect(page.getByTestId("supplier-form-status-option-suspended")).toBeVisible();
  });

  test("Create Supplier via Dialog Saves and Updates Dashboard", async ({ page }) => {
    test.slow();

    await page.getByTestId("quick-action-add-supplier").click();
    await expect(page.getByTestId("add-supplier-modal")).toBeVisible({ timeout: 5000 });

    // Fill in all fields
    await page.getByTestId("supplier-form-name").fill("New Parts Co.");
    await page.getByTestId("supplier-form-address").fill("456 Industrial Blvd, Chicago, IL 60601");
    await page.getByTestId("supplier-form-contact-name").fill("Alice Johnson");
    await page.getByTestId("supplier-form-phone").fill("(312) 555-0199");
    await page.getByTestId("supplier-form-email").fill("alice@newparts.com");
    await page.getByTestId("supplier-form-description").fill("Precision parts manufacturer");
    // Status defaults to "Active", keep it

    // Click Save
    await page.getByTestId("add-supplier-save").click();

    // Modal should close
    await expect(page.getByTestId("add-supplier-modal")).toBeHidden({ timeout: 30000 });

    // Verify the new supplier appears in the SuppliersList
    const supplierCard = page.locator("[data-testid^='supplier-card-']").filter({ hasText: "New Parts Co." });
    await expect(supplierCard).toBeVisible({ timeout: 30000 });

    // Verify card details
    await expect(supplierCard).toContainText("Active");
    await expect(supplierCard).toContainText("Alice Johnson");
    await expect(supplierCard).toContainText("alice@newparts.com");
  });

  test("Create Supplier Dialog Cancel Does Not Create Supplier", async ({ page }) => {
    // Count existing supplier cards before
    const suppliersGrid = page.getByTestId("suppliers-grid");
    await expect(suppliersGrid).toBeVisible({ timeout: 30000 });
    const initialCount = await page.locator("[data-testid^='supplier-card-']").count();

    // Open dialog and enter some data
    await page.getByTestId("quick-action-add-supplier").click();
    await expect(page.getByTestId("add-supplier-modal")).toBeVisible({ timeout: 5000 });
    await page.getByTestId("supplier-form-name").fill("Cancelled Supplier");

    // Click Cancel
    await page.getByTestId("add-supplier-cancel").click();

    // Modal should close
    await expect(page.getByTestId("add-supplier-modal")).toBeHidden({ timeout: 5000 });

    // No new supplier card should appear with that name
    await expect(
      page.locator("[data-testid^='supplier-card-']").filter({ hasText: "Cancelled Supplier" })
    ).toHaveCount(0);

    // Count should remain the same
    await expect(page.locator("[data-testid^='supplier-card-']")).toHaveCount(initialCount);
  });

  test("Create Supplier Dialog Validation", async ({ page }) => {
    await page.getByTestId("quick-action-add-supplier").click();
    await expect(page.getByTestId("add-supplier-modal")).toBeVisible({ timeout: 5000 });

    // Try to save without filling in the required Supplier Name field
    await page.getByTestId("add-supplier-save").click();

    // Validation error should appear
    await expect(page.getByTestId("supplier-form-name-error")).toBeVisible();
    await expect(page.getByTestId("supplier-form-name-error")).toContainText("Supplier name is required");

    // Dialog should still be open
    await expect(page.getByTestId("add-supplier-modal")).toBeVisible();
  });

  test("Create Purchase Order Button Opens Create Order Dialog", async ({ page }) => {
    await page.getByTestId("quick-action-create-order").click();

    const modal = page.getByTestId("create-order-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Verify dialog title
    await expect(modal.locator(".modal-title")).toHaveText("Create Purchase Order");

    // Verify form fields
    await expect(page.getByTestId("order-form-supplier")).toBeVisible();
    await expect(page.getByTestId("order-form-order-date")).toBeVisible();
    await expect(page.getByTestId("order-form-expected-delivery")).toBeVisible();

    // Verify Order Date defaults to today
    const today = new Date().toISOString().split("T")[0];
    await expect(page.getByTestId("order-form-order-date")).toHaveValue(today);

    // Verify initial line item section
    await expect(page.getByTestId("order-form-line-item-0")).toBeVisible();
    await expect(page.getByTestId("order-form-line-item-sku-0")).toBeVisible();
    await expect(page.getByTestId("order-form-line-item-name-0")).toBeVisible();
    await expect(page.getByTestId("order-form-line-item-qty-0")).toBeVisible();
    await expect(page.getByTestId("order-form-line-item-price-0")).toBeVisible();
  });

  test("Create Order via Dialog Saves and Updates Dashboard", async ({ page }) => {
    test.slow();

    await page.getByTestId("quick-action-create-order").click();
    await expect(page.getByTestId("create-order-modal")).toBeVisible({ timeout: 5000 });

    // Select supplier "Apex Logistics" via the searchable select
    const supplierInput = page.getByTestId("order-form-supplier");
    await supplierInput.click();
    await supplierInput.fill("Apex");
    // Wait for dropdown options and click the first "Apex Logistics"
    const apexOption = page.locator(".searchable-select-option").filter({ hasText: "Apex Logistics" }).first();
    await expect(apexOption).toBeVisible({ timeout: 5000 });
    await apexOption.click();

    // Set Expected Delivery to Dec 15, 2023
    await page.getByTestId("order-form-expected-delivery").fill("2023-12-15");

    // Fill in line item
    await page.getByTestId("order-form-line-item-sku-0").fill("SKU-X100");
    await page.getByTestId("order-form-line-item-name-0").fill("Widget A");
    await page.getByTestId("order-form-line-item-qty-0").fill("10");
    await page.getByTestId("order-form-line-item-price-0").fill("25");

    // Click Save
    await page.getByTestId("create-order-save").click();

    // Modal should close
    await expect(page.getByTestId("create-order-modal")).toBeHidden({ timeout: 30000 });

    // Verify the new order appears in the UpcomingOrdersTable
    const ordersTable = page.getByTestId("upcoming-orders-table");
    await expect(ordersTable).toBeVisible({ timeout: 30000 });

    // Find the row with "Apex Logistics" and "$250.00" and "Pending" status
    const newOrderRow = page.locator("tr").filter({ hasText: "Apex Logistics" }).filter({ hasText: "$250.00" });
    await expect(newOrderRow).toBeVisible({ timeout: 30000 });
    await expect(newOrderRow).toContainText("Pending");
    await expect(newOrderRow).toContainText("Dec 15, 2023");
  });

  test("Create Order Dialog Cancel Does Not Create Order", async ({ page }) => {
    // Wait for orders table to load
    await expect(page.getByTestId("upcoming-orders")).toBeVisible({ timeout: 30000 });

    // Count existing rows
    const initialRowCount = await page.locator("[data-testid^='upcoming-order-row-']").count();

    // Open dialog and enter some data
    await page.getByTestId("quick-action-create-order").click();
    await expect(page.getByTestId("create-order-modal")).toBeVisible({ timeout: 5000 });

    // Enter data in the line item but don't save
    await page.getByTestId("order-form-line-item-name-0").fill("Test Item");

    // Click Cancel
    await page.getByTestId("create-order-cancel").click();

    // Modal should close
    await expect(page.getByTestId("create-order-modal")).toBeHidden({ timeout: 5000 });

    // Order count should remain the same
    await expect(page.locator("[data-testid^='upcoming-order-row-']")).toHaveCount(initialRowCount);
  });

  test("Create Order Dialog Validation", async ({ page }) => {
    await page.getByTestId("quick-action-create-order").click();
    await expect(page.getByTestId("create-order-modal")).toBeVisible({ timeout: 5000 });

    // Try to save without selecting a supplier
    await page.getByTestId("create-order-save").click();

    // Validation error should appear
    await expect(page.getByTestId("order-form-supplier-error")).toBeVisible();
    await expect(page.getByTestId("order-form-supplier-error")).toContainText("Supplier is required");

    // Dialog should still be open
    await expect(page.getByTestId("create-order-modal")).toBeVisible();
  });
});
