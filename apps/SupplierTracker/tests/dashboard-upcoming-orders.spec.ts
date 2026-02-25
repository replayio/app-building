import { test, expect } from "@playwright/test";

test.describe("DashboardPage - UpcomingOrdersTable", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("upcoming-orders")).toBeVisible({ timeout: 30000 });
  });

  test("Display Upcoming Orders Heading", async ({ page }) => {
    const heading = page.getByTestId("upcoming-orders-heading");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("Upcoming Orders");
  });

  test("Display Table with Correct Columns", async ({ page }) => {
    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    const headers = table.locator("thead th");
    await expect(headers.nth(0)).toHaveText("Order Id");
    await expect(headers.nth(1)).toHaveText("Supplier");
    await expect(headers.nth(2)).toHaveText("Expected Delivery");
    await expect(headers.nth(3)).toHaveText("Status");
    await expect(headers.nth(4)).toHaveText("Total Cost");
  });

  test("Display Order Data Rows", async ({ page }) => {
    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    const row1 = page.getByTestId("upcoming-order-row-PO-2023-001");
    await expect(row1).toBeVisible();
    await expect(row1).toContainText("#PO-2023-001");
    await expect(row1).toContainText("Techcom Solutions");
    await expect(row1).toContainText("Oct 28, 2023");
    await expect(row1).toContainText("In Transit");
    await expect(row1).toContainText("$4,500.00");

    const row2 = page.getByTestId("upcoming-order-row-PO-2023-002");
    await expect(row2).toBeVisible();
    await expect(row2).toContainText("#PO-2023-002");
    await expect(row2).toContainText("Techcom Solutions");
    await expect(row2).toContainText("Oct 28, 2023");
    await expect(row2).toContainText("Pending");
    await expect(row2).toContainText("$4,500.00");

    const row3 = page.getByTestId("upcoming-order-row-PO-2023-003");
    await expect(row3).toBeVisible();
    await expect(row3).toContainText("#PO-2023-003");
    await expect(row3).toContainText("Techcom Solutions");
    await expect(row3).toContainText("Oct 28, 2023");
    await expect(row3).toContainText("Fulfilled");
    await expect(row3).toContainText("$2,500.00");

    const row4 = page.getByTestId("upcoming-order-row-PO-2023-004");
    await expect(row4).toBeVisible();
    await expect(row4).toContainText("#PO-2023-004");
    await expect(row4).toContainText("Techcom Solutions");
    await expect(row4).toContainText("Dec 17, 2023");
    await expect(row4).toContainText("Fulfilled");
    await expect(row4).toContainText("$1,700.00");

    const row5 = page.getByTestId("upcoming-order-row-PO-2023-005");
    await expect(row5).toBeVisible();
    await expect(row5).toContainText("#PO-2023-005");
    await expect(row5).toContainText("Techcom Solutions");
    await expect(row5).toContainText("Nov 20, 2023");
    await expect(row5).toContainText("Fulfilled");
    await expect(row5).toContainText("$3,500.00");
  });

  test("Order ID Links Navigate to Order Details", async ({ page }) => {
    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    const orderLink = page.getByTestId("order-link-PO-2023-001");
    await expect(orderLink).toBeVisible();
    await orderLink.click();

    await expect(page).toHaveURL(/\/orders\/PO-2023-001/, { timeout: 30000 });
  });

  test("Order ID Links Are Styled as Clickable", async ({ page }) => {
    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    const orderLink = page.getByTestId("order-link-PO-2023-001");
    await expect(orderLink).toBeVisible();
    await expect(orderLink).toHaveClass(/order-id-link/);

    const color = await orderLink.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.color;
    });
    // Blue color check - the blue channel should be prominent
    expect(color).toMatch(/rgb\(\s*\d+,\s*\d+,\s*[1-9]\d*\s*\)/);

    const textDecoration = await orderLink.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.textDecoration || style.textDecorationLine;
    });
    expect(textDecoration).toContain("underline");
  });

  test("Status Badges with Correct Colors", async ({ page }) => {
    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // "In Transit" badge with blue/teal class
    const inTransitBadge = page.getByTestId("order-status-PO-2023-001");
    await expect(inTransitBadge).toBeVisible();
    await expect(inTransitBadge).toHaveText("In Transit");
    await expect(inTransitBadge).toHaveClass(/badge--in-transit/);

    // "Pending" badge with yellow class
    const pendingBadge = page.getByTestId("order-status-PO-2023-002");
    await expect(pendingBadge).toBeVisible();
    await expect(pendingBadge).toHaveText("Pending");
    await expect(pendingBadge).toHaveClass(/badge--pending/);

    // "Fulfilled" badge with green class
    const fulfilledBadge = page.getByTestId("order-status-PO-2023-003");
    await expect(fulfilledBadge).toBeVisible();
    await expect(fulfilledBadge).toHaveText("Fulfilled");
    await expect(fulfilledBadge).toHaveClass(/badge--fulfilled/);
  });

  test("Filter by Status Dropdown", async ({ page }) => {
    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Open status filter and select "Pending"
    await page.getByTestId("upcoming-orders-status-filter-trigger").click();
    const pendingOption = page.getByTestId("upcoming-orders-status-filter-option-Pending");
    await expect(pendingOption).toBeVisible();
    await pendingOption.click();

    // Only Pending orders should be visible
    await expect(page.getByTestId("upcoming-order-row-PO-2023-002")).toBeVisible();
    // Non-pending orders should be hidden
    await expect(page.getByTestId("upcoming-order-row-PO-2023-001")).toBeHidden();
    await expect(page.getByTestId("upcoming-order-row-PO-2023-003")).toBeHidden();

    // Clear filter by selecting "All Statuses"
    await page.getByTestId("upcoming-orders-status-filter-trigger").click();
    await page.getByTestId("upcoming-orders-status-filter-option-").click();

    // All orders should be visible again
    await expect(page.getByTestId("upcoming-order-row-PO-2023-001")).toBeVisible();
    await expect(page.getByTestId("upcoming-order-row-PO-2023-002")).toBeVisible();
    await expect(page.getByTestId("upcoming-order-row-PO-2023-003")).toBeVisible();
  });

  test("Filter by Supplier Dropdown", async ({ page }) => {
    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Open supplier filter dropdown
    await page.getByTestId("upcoming-orders-supplier-filter-trigger").click();
    const dropdown = page.getByTestId("upcoming-orders-supplier-filter-dropdown");
    await expect(dropdown).toBeVisible();

    // Select "Techcom Solutions"
    await page.getByTestId("upcoming-orders-supplier-filter-option-Techcom Solutions").click();

    // Techcom orders should be visible
    await expect(page.getByTestId("upcoming-order-row-PO-2023-001")).toBeVisible();
    await expect(page.getByTestId("upcoming-order-row-PO-2023-002")).toBeVisible();

    // Non-Techcom orders (e.g. Apex orders) should be hidden
    await expect(page.getByTestId("upcoming-order-row-PO-78901")).toBeHidden();

    // Clear filter
    await page.getByTestId("upcoming-orders-supplier-filter-trigger").click();
    await page.getByTestId("upcoming-orders-supplier-filter-option-").click();

    // All orders should be visible again
    await expect(page.getByTestId("upcoming-order-row-PO-2023-001")).toBeVisible();
    await expect(page.getByTestId("upcoming-order-row-PO-78901")).toBeVisible();
  });

  test("Both Filters Applied Together", async ({ page }) => {
    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Apply status filter: "Pending"
    await page.getByTestId("upcoming-orders-status-filter-trigger").click();
    await page.getByTestId("upcoming-orders-status-filter-option-Pending").click();

    // Apply supplier filter: "Techcom Solutions"
    await page.getByTestId("upcoming-orders-supplier-filter-trigger").click();
    await page.getByTestId("upcoming-orders-supplier-filter-option-Techcom Solutions").click();

    // Only PO-2023-002 should match (Pending + Techcom Solutions)
    await expect(page.getByTestId("upcoming-order-row-PO-2023-002")).toBeVisible();
    await expect(page.getByTestId("upcoming-order-row-PO-2023-001")).toBeHidden();
    await expect(page.getByTestId("upcoming-order-row-PO-2023-003")).toBeHidden();

    // Clear status filter (supplier filter should still apply)
    await page.getByTestId("upcoming-orders-status-filter-trigger").click();
    await page.getByTestId("upcoming-orders-status-filter-option-").click();

    // All Techcom orders should show (supplier filter still active)
    await expect(page.getByTestId("upcoming-order-row-PO-2023-001")).toBeVisible();
    await expect(page.getByTestId("upcoming-order-row-PO-2023-002")).toBeVisible();
    await expect(page.getByTestId("upcoming-order-row-PO-2023-003")).toBeVisible();
  });

  test("Empty State When No Orders Match Filters", async ({ page }) => {
    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Apply "Approved" status filter (only Acme Corp has an Approved order)
    await page.getByTestId("upcoming-orders-status-filter-trigger").click();
    await page.getByTestId("upcoming-orders-status-filter-option-Approved").click();

    // Apply "Techcom Solutions" supplier filter (Techcom has no Approved orders)
    await page.getByTestId("upcoming-orders-supplier-filter-trigger").click();
    await page.getByTestId("upcoming-orders-supplier-filter-option-Techcom Solutions").click();

    // Should show the empty filtered state
    await expect(page.getByTestId("upcoming-orders-empty-filtered")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("upcoming-orders-empty-filtered")).toContainText(
      "No upcoming orders match the selected filters."
    );
  });

  test("Empty State When No Upcoming Orders Exist", async ({ page }) => {
    // Intercept the orders API to return an empty array, then reload
    await page.route("**/.netlify/functions/orders", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });

    // The empty state should be visible
    await expect(page.getByTestId("upcoming-orders-empty")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("upcoming-orders-empty")).toContainText("No upcoming orders.");
  });

  test("Currency Formatting in Total Cost Column", async ({ page }) => {
    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Verify currency formatting: dollar sign, comma separators, two decimal places
    await expect(page.getByTestId("upcoming-order-row-PO-2023-001")).toContainText("$4,500.00");
    await expect(page.getByTestId("upcoming-order-row-PO-2023-003")).toContainText("$2,500.00");
    await expect(page.getByTestId("upcoming-order-row-PO-2023-004")).toContainText("$1,700.00");
    await expect(page.getByTestId("upcoming-order-row-PO-2023-005")).toContainText("$3,500.00");
  });

  test("Date Formatting in Expected Delivery Column", async ({ page }) => {
    const table = page.getByTestId("upcoming-orders-table");
    await expect(table).toBeVisible({ timeout: 30000 });

    // Verify date formatting in "MMM DD, YYYY" format
    await expect(page.getByTestId("upcoming-order-row-PO-2023-001")).toContainText("Oct 28, 2023");
    await expect(page.getByTestId("upcoming-order-row-PO-2023-004")).toContainText("Dec 17, 2023");
    await expect(page.getByTestId("upcoming-order-row-PO-2023-005")).toContainText("Nov 20, 2023");
  });
});
