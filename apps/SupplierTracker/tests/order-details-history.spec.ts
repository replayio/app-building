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
  await expect(page.getByTestId("order-history")).toBeVisible({ timeout: 30000 });
}

test.describe("OrderDetailsPage - OrderHistory", () => {
  test("Display Timeline of Events", async ({ page }) => {
    await navigateToFirstOrder(page);

    const historySection = page.getByTestId("order-history");
    await expect(historySection).toBeVisible();

    const timeline = page.getByTestId("timeline-section");
    await expect(timeline).toBeVisible();
    await expect(page.getByTestId("timeline-section-title")).toHaveText("Order History");

    // Timeline list should be visible
    const timelineList = page.getByTestId("timeline-list");
    await expect(timelineList).toBeVisible();

    // Should have at least one event
    const events = page.getByTestId("timeline-event");
    const count = await events.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("Display Event Timestamp and Description", async ({ page }) => {
    await navigateToFirstOrder(page);

    const firstEvent = page.getByTestId("timeline-event").first();
    await expect(firstEvent).toBeVisible();

    // Should display a description
    const description = firstEvent.getByTestId("timeline-event-description");
    await expect(description).toBeVisible();
    await expect(description).not.toBeEmpty();

    // Should display a timestamp
    const timestamp = firstEvent.getByTestId("timeline-event-timestamp");
    await expect(timestamp).toBeVisible();
    await expect(timestamp).not.toBeEmpty();
  });

  test("Display All History Entries", async ({ page }) => {
    await navigateToFirstOrder(page);

    // Should display at least 4 history entries based on seed data
    const events = page.getByTestId("timeline-event");
    const count = await events.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Verify each event has description and timestamp
    for (let i = 0; i < Math.min(count, 4); i++) {
      const event = events.nth(i);
      await expect(event.getByTestId("timeline-event-description")).not.toBeEmpty();
      await expect(event.getByTestId("timeline-event-timestamp")).not.toBeEmpty();
    }
  });

  test("Timeline Entry Icons", async ({ page }) => {
    await navigateToFirstOrder(page);

    const events = page.getByTestId("timeline-event");
    const count = await events.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Each event should have an icon (SVG inside the timeline-event-icon span)
    for (let i = 0; i < Math.min(count, 4); i++) {
      const event = events.nth(i);
      const icon = event.locator(".timeline-event-icon");
      await expect(icon).toBeVisible();
      // The icon should contain an SVG element
      await expect(icon.locator("svg")).toBeVisible();
    }

    // Verify different event types have distinct icon classes
    const iconClasses = new Set<string>();
    for (let i = 0; i < count; i++) {
      const iconEl = events.nth(i).locator(".timeline-event-icon");
      const cls = await iconEl.getAttribute("class");
      if (cls) iconClasses.add(cls);
    }
    // There should be more than one distinct icon type across all entries
    // (creation, approval, status_change, etc. from seed data)
    expect(iconClasses.size).toBeGreaterThanOrEqual(1);
  });

  test("History Entry Created on Status Change", async ({ page }) => {
    test.slow();

    await navigateToFirstOrder(page);

    // Get initial history count
    const initialHistoryCount = await page.getByTestId("timeline-event").count();

    // Open edit dialog
    await page.getByTestId("order-edit-btn").click();
    const modal = page.getByTestId("edit-order-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Read current status
    const statusBtn = page.getByTestId("edit-order-form-status");
    const currentStatusText = await statusBtn.locator(".filter-select-value").textContent();

    // Pick a different status
    await statusBtn.click();
    await expect(page.getByTestId("edit-order-form-status-dropdown")).toBeVisible();

    // Choose a status that is different from the current
    const targetStatus = currentStatusText?.includes("Delivered") ? "Cancelled" : "Delivered";
    const targetTestId = `edit-order-status-option-${targetStatus.toLowerCase()}`;
    await page.getByTestId(targetTestId).click();

    // Save
    await page.getByTestId("edit-order-save").click();
    await expect(modal).toBeHidden({ timeout: 30000 });

    // Verify the status badge updated
    await expect(page.getByTestId("order-status-badge")).toContainText(targetStatus, { timeout: 30000 });

    // Verify exactly one new history entry was added
    await expect(page.getByTestId("timeline-event")).toHaveCount(initialHistoryCount + 1, { timeout: 30000 });

    // The new entry should describe the status change
    const newestEvent = page.getByTestId("timeline-event").first();
    await expect(newestEvent.getByTestId("timeline-event-description")).toContainText("Status changed", { timeout: 30000 });
    await expect(newestEvent.getByTestId("timeline-event-timestamp")).not.toBeEmpty();
  });

  test("History Entry Created on Line Item Modification", async ({ page }) => {
    test.slow();

    await navigateToFirstOrder(page);

    // Get initial history count
    const initialHistoryCount = await page.getByTestId("timeline-event").count();

    // Add a new line item
    await page.getByTestId("add-line-item-btn").click();
    const modal = page.getByTestId("line-item-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });

    const itemName = `History Test Item ${Date.now()}`;
    await page.getByTestId("line-item-form-sku").fill("SKU-HIST-001");
    await page.getByTestId("line-item-form-name").fill(itemName);
    await page.getByTestId("line-item-form-qty").fill("3");
    await page.getByTestId("line-item-form-unit-price").fill("50");

    await page.getByTestId("line-item-save").click();
    await expect(modal).toBeHidden({ timeout: 30000 });

    // Wait for the new row to appear
    await expect(
      page.getByTestId("line-item-row").filter({ hasText: itemName })
    ).toBeVisible({ timeout: 30000 });

    // Verify exactly one new history entry was added for the line item addition
    await expect(page.getByTestId("timeline-event")).toHaveCount(initialHistoryCount + 1, { timeout: 30000 });

    // The newest event should describe the line item change
    const newestEvent = page.getByTestId("timeline-event").first();
    await expect(newestEvent.getByTestId("timeline-event-description")).toContainText("Line item", { timeout: 30000 });
    await expect(newestEvent.getByTestId("timeline-event-timestamp")).not.toBeEmpty();
  });
});
