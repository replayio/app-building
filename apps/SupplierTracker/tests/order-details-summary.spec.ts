import { test, expect } from "@playwright/test";

/**
 * Navigate to the first order's detail page by clicking an order ID link
 * from the dashboard's UpcomingOrdersTable.
 * Returns the order ID string extracted from the URL.
 */
async function navigateToFirstOrder(page: import("@playwright/test").Page): Promise<string> {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("upcoming-orders")).toBeVisible({ timeout: 30000 });

  const firstLink = page.locator("[data-testid^='order-link-']").first();
  await expect(firstLink).toBeVisible({ timeout: 30000 });

  const testId = await firstLink.getAttribute("data-testid");
  // Extract order ID from data-testid like "order-link-PO-2023-001"
  const orderId = testId?.replace("order-link-", "") ?? "";
  expect(orderId).toBeTruthy();

  await firstLink.click();
  await expect(page).toHaveURL(new RegExp(`/orders/${orderId}`), { timeout: 30000 });
  await expect(page.getByTestId("order-details-page")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("order-summary")).toBeVisible({ timeout: 30000 });

  return orderId;
}

test.describe("OrderDetailsPage - OrderSummary", () => {
  test("Display Order ID in Header", async ({ page }) => {
    const orderId = await navigateToFirstOrder(page);

    const summary = page.getByTestId("order-summary");
    await expect(summary).toContainText("Order Summary");

    const subtitle = page.getByTestId("order-summary-subtitle");
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toContainText(`Purchase Order #${orderId} Details`);
  });

  test("Display Supplier Name as Link", async ({ page }) => {
    await navigateToFirstOrder(page);

    const supplierField = page.getByTestId("order-field-supplier");
    await expect(supplierField).toBeVisible();
    await expect(supplierField).toContainText("Supplier");

    const supplierLink = page.getByTestId("order-supplier-link");
    await expect(supplierLink).toBeVisible();

    // Should have non-empty supplier name text
    const linkText = await supplierLink.textContent();
    expect(linkText?.trim()).toBeTruthy();

    // Should have an external-link SVG icon
    await expect(supplierLink.locator("svg")).toBeVisible();

    // Click and verify it navigates to /suppliers/<id>
    await supplierLink.click();
    await expect(page).toHaveURL(/\/suppliers\//, { timeout: 30000 });
    await expect(page.getByTestId("supplier-details-page")).toBeVisible({ timeout: 30000 });
  });

  test("Display Order Date", async ({ page }) => {
    await navigateToFirstOrder(page);

    const orderDateField = page.getByTestId("order-field-order-date");
    await expect(orderDateField).toBeVisible();

    // Should display label "Order Date"
    await expect(orderDateField.locator(".order-summary-field-label")).toHaveText("Order Date");

    // Should display a formatted date value (e.g., "Oct 26, 2024")
    const value = orderDateField.locator(".order-summary-field-value");
    await expect(value).not.toBeEmpty();
    // Date format: "MMM DD, YYYY"
    await expect(value).toHaveText(/[A-Z][a-z]{2} \d{1,2}, \d{4}/);
  });

  test("Display Expected Delivery Date", async ({ page }) => {
    await navigateToFirstOrder(page);

    const deliveryField = page.getByTestId("order-field-expected-delivery");
    await expect(deliveryField).toBeVisible();

    // Should display label "Expected Delivery"
    await expect(deliveryField.locator(".order-summary-field-label")).toHaveText("Expected Delivery");

    // Should display a formatted date value
    const value = deliveryField.locator(".order-summary-field-value");
    await expect(value).not.toBeEmpty();
    await expect(value).toHaveText(/[A-Z][a-z]{2} \d{1,2}, \d{4}/);
  });

  test("Display Status Badge", async ({ page }) => {
    await navigateToFirstOrder(page);

    const statusField = page.getByTestId("order-field-status");
    await expect(statusField).toBeVisible();
    await expect(statusField.locator(".order-summary-field-label")).toHaveText("Status");

    const badge = page.getByTestId("order-status-badge");
    await expect(badge).toBeVisible();

    // Badge should contain an SVG icon
    await expect(badge.locator("svg")).toBeVisible();

    // Badge text should be one of the known statuses
    const badgeText = await badge.textContent();
    const validStatuses = ["Pending", "Approved", "Shipped", "Delivered", "Cancelled", "In Transit", "Fulfilled", "Processing"];
    const found = validStatuses.some((s) => badgeText?.includes(s));
    expect(found).toBeTruthy();
  });

  test("Display Overall Cost", async ({ page }) => {
    await navigateToFirstOrder(page);

    const costField = page.getByTestId("order-field-overall-cost");
    await expect(costField).toBeVisible();
    await expect(costField.locator(".order-summary-field-label")).toHaveText("Overall Cost");

    const costValue = page.getByTestId("order-overall-cost");
    await expect(costValue).toBeVisible();

    // Should display currency-formatted value (e.g., "$12,450.00")
    await expect(costValue).toHaveText(/\$[\d,]+\.\d{2}/);
  });

  test("Edit Button Opens Edit Dialog", async ({ page }) => {
    test.slow();

    await navigateToFirstOrder(page);

    // Read current status for later verification
    const badge = page.getByTestId("order-status-badge");
    const originalStatus = await badge.textContent();

    // Click Edit button
    const editBtn = page.getByTestId("order-edit-btn");
    await expect(editBtn).toBeVisible();
    await expect(editBtn).toContainText("Edit");
    await editBtn.click();

    // Edit modal should appear with correct title
    const modal = page.getByTestId("edit-order-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.locator(".modal-title")).toHaveText("Edit Order");

    // Should have status dropdown and expected delivery date field
    await expect(page.getByTestId("edit-order-form-status")).toBeVisible();
    await expect(page.getByTestId("edit-order-form-expected-delivery")).toBeVisible();

    // Change the status to "Shipped"
    await page.getByTestId("edit-order-form-status").click();
    await expect(page.getByTestId("edit-order-form-status-dropdown")).toBeVisible();
    await page.getByTestId("edit-order-status-option-shipped").click();

    // Click Save
    await page.getByTestId("edit-order-save").click();

    // Modal should close
    await expect(modal).toBeHidden({ timeout: 30000 });

    // Verify updated status is reflected
    await expect(page.getByTestId("order-status-badge")).toContainText("Shipped", { timeout: 30000 });

    // Verify a history entry was added for the status change
    const historySection = page.getByTestId("order-history");
    await expect(historySection).toBeVisible({ timeout: 30000 });

    const historyEvents = page.getByTestId("timeline-event-description");
    await expect(
      historyEvents.filter({ hasText: /Status changed/ }).first()
    ).toBeVisible({ timeout: 30000 });
  });

  test("Print Button Triggers Print", async ({ page }) => {
    await navigateToFirstOrder(page);

    // Verify print button is visible and has correct text
    const printBtn = page.getByTestId("order-print-btn");
    await expect(printBtn).toBeVisible();
    await expect(printBtn).toContainText("Print");

    // Intercept window.print to verify it is called
    let printCalled = false;
    await page.evaluate(() => {
      (window as unknown as Record<string, unknown>).__printCalled = false;
      window.print = () => {
        (window as unknown as Record<string, unknown>).__printCalled = true;
      };
    });

    await printBtn.click();

    const wasPrintCalled = await page.evaluate(
      () => (window as unknown as Record<string, boolean>).__printCalled
    );
    expect(wasPrintCalled).toBeTruthy();
  });
});
