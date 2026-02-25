import { test, expect } from "@playwright/test";

test.describe("RunDetailsPopup", () => {
  test("CAL-POP-1: RunDetailsPopup displays the run title with recipe name", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Wait for events to load and click the first one
    const firstEvent = page.locator('[data-testid^="calendar-event-"]').first();
    await expect(firstEvent).toBeVisible({ timeout: 15000 });
    await firstEvent.click();

    // Popup should open with title
    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });
    const title = page.getByTestId("run-popup-title");
    await expect(title).toBeVisible();

    // Title should follow "Run Details: [Product] ([Recipe])" format
    const titleText = await title.textContent();
    expect(titleText).toMatch(/^Run Details: .+/);
  });

  test("CAL-POP-2: Start date/time is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="calendar-event-"]').first().click({ timeout: 15000 });
    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

    const startField = page.getByTestId("run-popup-start");
    await expect(startField).toBeVisible();
    await expect(startField).toContainText("Start:");

    // Value should contain a date and time format (e.g., "Feb 26, 2026 07:00 AM")
    const text = await startField.textContent();
    expect(text).toMatch(/Start:\s*\w{3} \d{1,2}, \d{4} \d{2}:\d{2} [AP]M/);
  });

  test("CAL-POP-3: End date/time is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="calendar-event-"]').first().click({ timeout: 15000 });
    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

    const endField = page.getByTestId("run-popup-end");
    await expect(endField).toBeVisible();
    await expect(endField).toContainText("End:");

    const text = await endField.textContent();
    expect(text).toMatch(/End:\s*\w{3} \d{1,2}, \d{4} \d{2}:\d{2} [AP]M/);
  });

  test("CAL-POP-4: Quantity is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="calendar-event-"]').first().click({ timeout: 15000 });
    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

    const quantityField = page.getByTestId("run-popup-quantity");
    await expect(quantityField).toBeVisible();
    await expect(quantityField).toContainText("Quantity:");

    // Should contain a number followed by a unit
    const text = await quantityField.textContent();
    expect(text).toMatch(/Quantity:\s*\d+/);
  });

  test("CAL-POP-5: Status is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="calendar-event-"]').first().click({ timeout: 15000 });
    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

    const statusField = page.getByTestId("run-popup-status");
    await expect(statusField).toBeVisible();
    await expect(statusField).toContainText("Status:");

    // Status badge should be visible inside the field
    await expect(statusField.locator(".badge")).toBeVisible();
  });

  test("CAL-POP-6: Materials list with stock levels is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Click an event to open popup
    await page.locator('[data-testid^="calendar-event-"]').first().click({ timeout: 15000 });
    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

    const materialsSection = page.getByTestId("run-popup-materials");
    await expect(materialsSection).toBeVisible();
    await expect(materialsSection).toContainText("Materials:");

    // Wait for materials data to load (fetched async)
    // Should show either material items with availability indicators or "No materials data available"
    await expect(
      page.locator('[data-testid^="run-popup-material-"]').first()
        .or(page.getByTestId("run-popup-no-materials"))
    ).toBeVisible({ timeout: 15000 });
  });

  test("CAL-POP-7: Notes field is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="calendar-event-"]').first().click({ timeout: 15000 });
    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

    const notesField = page.getByTestId("run-popup-notes");
    await expect(notesField).toBeVisible();
    await expect(notesField).toContainText("Notes:");
  });

  test("CAL-POP-8: Edit Run button is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="calendar-event-"]').first().click({ timeout: 15000 });
    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

    const editBtn = page.getByTestId("run-popup-edit-btn");
    await expect(editBtn).toBeVisible();
    await expect(editBtn).toHaveText("Edit Run");
  });

  test("CAL-POP-9: Edit Run button navigates to the run details page", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Click on an event card
    const firstEvent = page.locator('[data-testid^="calendar-event-"]').first();
    await expect(firstEvent).toBeVisible({ timeout: 15000 });

    // Get the run ID from the event's data-testid
    const eventTestId = await firstEvent.getAttribute("data-testid");
    const runId = eventTestId!.replace("calendar-event-", "");

    await firstEvent.click();
    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

    // Click Edit Run
    await page.getByTestId("run-popup-edit-btn").click();

    // Should navigate to the run details page
    await expect(page).toHaveURL(new RegExp(`/runs/${runId}`), { timeout: 30000 });
  });

  test("CAL-POP-10: Close button is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="calendar-event-"]').first().click({ timeout: 15000 });
    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

    const closeBtn = page.getByTestId("run-popup-close-btn");
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toHaveText("Close");
  });

  test("CAL-POP-11: Close button closes the popup", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="calendar-event-"]').first().click({ timeout: 15000 });
    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

    // Click Close
    await page.getByTestId("run-popup-close-btn").click();

    // Popup should be hidden
    await expect(page.getByTestId("run-details-popup")).toBeHidden({ timeout: 15000 });

    // Calendar grid should be fully visible
    await expect(page.getByTestId("calendar-grid")).toBeVisible();
  });

  test("CAL-POP-12: Popup displays empty notes when run has no notes", async ({ page }) => {
    // Create a run with no notes
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const response = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${year}-${month}-03T08:00:00Z`,
        end_date: `${year}-${month}-03T16:00:00Z`,
        planned_quantity: 100,
        unit: "Units",
        status: "Scheduled",
        notes: "",
      },
    });
    const run = await response.json();

    try {
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      // Click on the created event
      const eventCard = page.getByTestId(`calendar-event-${run.id}`);
      await expect(eventCard).toBeVisible({ timeout: 15000 });
      await eventCard.click();

      await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

      // Notes field should show empty or placeholder
      const notesField = page.getByTestId("run-popup-notes");
      await expect(notesField).toBeVisible();
      await expect(notesField).toContainText("Notes:");
      // Should show "No notes" placeholder
      await expect(notesField).toContainText("No notes");
    } finally {
      await page.request.delete(`/.netlify/functions/runs/${run.id}`);
    }
  });

  test("CAL-POP-13: Popup materials show shortage indicators when materials are insufficient", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Navigate to March 2026 which has a "Material Shortage" run (Protein Energy Bar on March 10)
    // with forecasts where required_amount > forecast_available
    const now = new Date();
    const targetYear = 2026;
    const targetMonth = 2; // March (0-indexed)
    const monthsDiff = (targetYear - now.getFullYear()) * 12 + (targetMonth - now.getMonth());
    if (monthsDiff > 0) {
      for (let i = 0; i < monthsDiff; i++) {
        await page.getByTestId("calendar-next-btn").click();
      }
    } else if (monthsDiff < 0) {
      for (let i = 0; i < Math.abs(monthsDiff); i++) {
        await page.getByTestId("calendar-prev-btn").click();
      }
    }
    await expect(page.getByTestId("calendar-period-label")).toHaveText("March 2026");

    // Find the Material Shortage event
    const materialShortageEvent = page.locator('[data-testid^="calendar-event-"]').filter({
      hasText: "Material Shortage",
    });
    await expect(materialShortageEvent.first()).toBeVisible({ timeout: 15000 });
    await materialShortageEvent.first().click();

    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

    // Wait for materials data to load
    const materialsSection = page.getByTestId("run-popup-materials");
    await expect(materialsSection).toBeVisible();

    // Should show material items with shortage indicators
    // The Protein Energy Bar March 10 run has forecasts with shortages
    // (Whey Protein Powder required 16.67 but only 5.00 available)
    await expect(
      materialsSection.locator(".run-popup-material-status--shortage").first()
    ).toBeVisible({ timeout: 15000 });
  });

  test("CAL-POP-14: Clicking outside the popup closes it", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    await page.locator('[data-testid^="calendar-event-"]').first().click({ timeout: 15000 });
    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

    // Click on the overlay (outside the popup content)
    await page.getByTestId("run-details-popup-overlay").click({ position: { x: 10, y: 10 } });

    // Popup should close
    await expect(page.getByTestId("run-details-popup")).toBeHidden({ timeout: 15000 });
  });
});
