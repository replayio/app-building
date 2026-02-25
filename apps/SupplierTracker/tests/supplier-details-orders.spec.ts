import { test, expect } from "@playwright/test";

/**
 * Navigate to the first supplier's detail page by clicking the first supplier card.
 */
async function navigateToFirstSupplier(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("suppliers-grid")).toBeVisible({ timeout: 30000 });

  const firstCard = page.locator("[data-testid^='supplier-card-']").first();
  await expect(firstCard).toBeVisible({ timeout: 30000 });
  await firstCard.click();

  await expect(page.getByTestId("supplier-details-page")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("orders-section")).toBeVisible({ timeout: 30000 });
}

test.describe("SupplierDetailsPage - OrdersSection", () => {
  test("Display Upcoming and Historical Order Tabs", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const ordersSection = page.getByTestId("orders-section");
    await expect(ordersSection).toContainText("Orders");

    // Two tab buttons should be visible
    const upcomingTab = page.getByTestId("orders-tab-upcoming");
    const historicalTab = page.getByTestId("orders-tab-historical");

    await expect(upcomingTab).toBeVisible();
    await expect(upcomingTab).toContainText("Upcoming Orders");
    await expect(historicalTab).toBeVisible();
    await expect(historicalTab).toContainText("Historical Orders");

    // Upcoming tab should be active by default
    await expect(upcomingTab).toHaveClass(/tab-nav-item--active/);
  });

  test("Display Upcoming Orders Table with Correct Columns", async ({ page }) => {
    await navigateToFirstSupplier(page);

    // Upcoming tab is active by default
    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Verify column headers
    const headers = table.locator("thead th");
    await expect(headers.nth(0)).toContainText("Order ID");
    await expect(headers.nth(1)).toContainText("Expected Delivery");
    await expect(headers.nth(2)).toContainText("Status");
    await expect(headers.nth(3)).toContainText("Total Cost");
  });

  test("Display Upcoming Orders Data", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Should have upcoming order rows
    const rows = page.getByTestId("upcoming-order-row");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Verify specific order data - order IDs should be clickable links
    await expect(table).toContainText("PO-78901");
    await expect(table).toContainText("PO-78902");
    await expect(table).toContainText("PO-78903");

    // Verify status and cost data
    await expect(
      page.getByTestId("upcoming-order-row").filter({ hasText: "PO-78901" })
    ).toContainText("Pending");

    await expect(
      page.getByTestId("upcoming-order-row").filter({ hasText: "PO-78902" })
    ).toContainText("In Transit");

    await expect(
      page.getByTestId("upcoming-order-row").filter({ hasText: "PO-78903" })
    ).toContainText("Processing");
  });

  test("Upcoming Order ID Links Navigate to Order Details", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Find the order link for PO-78901
    const orderLink = page.getByTestId("upcoming-order-row")
      .filter({ hasText: "PO-78901" })
      .getByTestId("order-id-link");
    await expect(orderLink).toBeVisible();

    // Click the order ID link
    await orderLink.click();

    // Should navigate to the order details page
    await expect(page).toHaveURL(/\/orders\/PO-78901/, { timeout: 30000 });
  });

  test("Display Historical Orders Table with Correct Columns", async ({ page }) => {
    await navigateToFirstSupplier(page);

    // Click Historical Orders tab
    await page.getByTestId("orders-tab-historical").click();

    const table = page.getByTestId("historical-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Verify column headers
    const headers = table.locator("thead th");
    await expect(headers.nth(0)).toContainText("Order ID");
    await expect(headers.nth(1)).toContainText("Delivery Date");
    await expect(headers.nth(2)).toContainText("Status");
    await expect(headers.nth(3)).toContainText("Final Cost");
  });

  test("Display Historical Orders Data", async ({ page }) => {
    await navigateToFirstSupplier(page);

    // Click Historical Orders tab
    await page.getByTestId("orders-tab-historical").click();

    const table = page.getByTestId("historical-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Should have historical order rows
    const rows = page.getByTestId("historical-order-row");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Verify specific order data
    await expect(table).toContainText("PO-78801");
    await expect(table).toContainText("PO-78802");
    await expect(table).toContainText("PO-78803");

    // Verify statuses
    await expect(
      page.getByTestId("historical-order-row").filter({ hasText: "PO-78801" })
    ).toContainText("Completed");

    await expect(
      page.getByTestId("historical-order-row").filter({ hasText: "PO-78802" })
    ).toContainText("Completed");

    await expect(
      page.getByTestId("historical-order-row").filter({ hasText: "PO-78803" })
    ).toContainText("Cancelled");
  });

  test("Historical Order ID Links Navigate to Order Details", async ({ page }) => {
    await navigateToFirstSupplier(page);

    // Click Historical Orders tab
    await page.getByTestId("orders-tab-historical").click();

    const table = page.getByTestId("historical-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Find the order link for PO-78801
    const orderLink = page.getByTestId("historical-order-row")
      .filter({ hasText: "PO-78801" })
      .getByTestId("order-id-link");
    await expect(orderLink).toBeVisible();

    // Click the order ID link
    await orderLink.click();

    // Should navigate to the order details page
    await expect(page).toHaveURL(/\/orders\/PO-78801/, { timeout: 30000 });
  });

  test("Search Upcoming Orders", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Type in the search field
    const searchInput = page.getByTestId("upcoming-orders-search");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("78901");

    // Only PO-78901 should be visible
    await expect(
      page.getByTestId("upcoming-order-row").filter({ hasText: "PO-78901" })
    ).toBeVisible({ timeout: 15000 });

    // Other rows should be hidden
    await expect(
      page.getByTestId("upcoming-order-row").filter({ hasText: "PO-78902" })
    ).toHaveCount(0, { timeout: 15000 });

    await expect(
      page.getByTestId("upcoming-order-row").filter({ hasText: "PO-78903" })
    ).toHaveCount(0, { timeout: 15000 });
  });

  test("Search Historical Orders", async ({ page }) => {
    await navigateToFirstSupplier(page);

    // Switch to Historical tab
    await page.getByTestId("orders-tab-historical").click();

    const table = page.getByTestId("historical-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Type in the search field
    const searchInput = page.getByTestId("historical-orders-search");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("78802");

    // Only PO-78802 should be visible
    await expect(
      page.getByTestId("historical-order-row").filter({ hasText: "PO-78802" })
    ).toBeVisible({ timeout: 15000 });

    // Other rows should be hidden
    await expect(
      page.getByTestId("historical-order-row").filter({ hasText: "PO-78801" })
    ).toHaveCount(0, { timeout: 15000 });

    await expect(
      page.getByTestId("historical-order-row").filter({ hasText: "PO-78803" })
    ).toHaveCount(0, { timeout: 15000 });
  });

  test("Filter Upcoming Orders by Status", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Open the status filter dropdown
    const filterTrigger = page.getByTestId("upcoming-orders-status-filter-trigger");
    await expect(filterTrigger).toBeVisible();
    await filterTrigger.click();

    // Select "Pending" from the dropdown
    const dropdown = page.getByTestId("upcoming-orders-status-filter-dropdown");
    await expect(dropdown).toBeVisible();
    await page.getByTestId("upcoming-orders-status-filter-option-Pending").click();

    // Only "Pending" orders should be visible
    const rows = page.getByTestId("upcoming-order-row");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // All visible rows should have "Pending" status
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByTestId("order-status-badge")).toHaveText("Pending");
    }

    // Clear the filter by selecting "All Statuses"
    await filterTrigger.click();
    await expect(page.getByTestId("upcoming-orders-status-filter-dropdown")).toBeVisible();
    await page.getByTestId("upcoming-orders-status-filter-option-").click();

    // All upcoming orders should be shown again
    await expect(page.getByTestId("upcoming-order-row")).toHaveCount(3, { timeout: 15000 });
  });

  test("Status Badges in Upcoming Orders", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Verify "Pending" badge has yellow class
    const pendingRow = page.getByTestId("upcoming-order-row").filter({ hasText: "PO-78901" });
    await expect(pendingRow.getByTestId("order-status-badge")).toHaveText("Pending");
    await expect(pendingRow.getByTestId("order-status-badge")).toHaveClass(/badge--pending/);

    // Verify "In Transit" badge has blue class
    const inTransitRow = page.getByTestId("upcoming-order-row").filter({ hasText: "PO-78902" });
    await expect(inTransitRow.getByTestId("order-status-badge")).toHaveText("In Transit");
    await expect(inTransitRow.getByTestId("order-status-badge")).toHaveClass(/badge--in-transit/);

    // Verify "Processing" badge has orange class
    const processingRow = page.getByTestId("upcoming-order-row").filter({ hasText: "PO-78903" });
    await expect(processingRow.getByTestId("order-status-badge")).toHaveText("Processing");
    await expect(processingRow.getByTestId("order-status-badge")).toHaveClass(/badge--processing/);
  });

  test("Status Badges in Historical Orders", async ({ page }) => {
    await navigateToFirstSupplier(page);

    // Switch to Historical tab
    await page.getByTestId("orders-tab-historical").click();

    const table = page.getByTestId("historical-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Verify "Completed" badge has green class
    const completedRow = page.getByTestId("historical-order-row").filter({ hasText: "PO-78801" });
    await expect(completedRow.getByTestId("order-status-badge")).toHaveText("Completed");
    await expect(completedRow.getByTestId("order-status-badge")).toHaveClass(/badge--completed/);

    // Verify "Cancelled" badge has red class
    const cancelledRow = page.getByTestId("historical-order-row").filter({ hasText: "PO-78803" });
    await expect(cancelledRow.getByTestId("order-status-badge")).toHaveText("Cancelled");
    await expect(cancelledRow.getByTestId("order-status-badge")).toHaveClass(/badge--cancelled/);
  });

  test("Switch Between Tabs", async ({ page }) => {
    await navigateToFirstSupplier(page);

    // Initially "Upcoming Orders" tab is active
    const upcomingTab = page.getByTestId("orders-tab-upcoming");
    const historicalTab = page.getByTestId("orders-tab-historical");

    await expect(upcomingTab).toHaveClass(/tab-nav-item--active/);
    await expect(page.getByTestId("upcoming-orders-content")).toBeVisible({ timeout: 30000 });

    // Verify upcoming tab has search field and filter
    await expect(page.getByTestId("upcoming-orders-search")).toBeVisible();
    await expect(page.getByTestId("upcoming-orders-status-filter")).toBeVisible();

    // Click Historical Orders tab
    await historicalTab.click();

    // Historical tab should become active, upcoming should hide
    await expect(historicalTab).toHaveClass(/tab-nav-item--active/);
    await expect(page.getByTestId("historical-orders-content")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("upcoming-orders-content")).toBeHidden();

    // Historical tab has its own search field
    await expect(page.getByTestId("historical-orders-search")).toBeVisible();

    // Switch back to Upcoming
    await upcomingTab.click();

    // Upcoming should be visible again
    await expect(upcomingTab).toHaveClass(/tab-nav-item--active/);
    await expect(page.getByTestId("upcoming-orders-content")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("historical-orders-content")).toBeHidden();
    await expect(page.getByTestId("upcoming-orders-search")).toBeVisible();
    await expect(page.getByTestId("upcoming-orders-status-filter")).toBeVisible();
  });
});
