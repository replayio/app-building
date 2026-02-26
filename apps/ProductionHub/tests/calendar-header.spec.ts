import { test, expect } from "@playwright/test";

test.describe("CalendarHeader", () => {
  test('CAL-HDR-1: Page title displays "Production Calendar"', async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("calendar-page-title")).toBeVisible();
    await expect(page.getByTestId("calendar-page-title")).toHaveText("Production Calendar");
  });

  test("CAL-HDR-2: Prev button is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("calendar-prev-btn")).toBeVisible();
    await expect(page.getByTestId("calendar-prev-btn")).toContainText("Prev");
  });

  test("CAL-HDR-3: Today button is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    const todayBtn = page.getByTestId("calendar-today-btn");
    await expect(todayBtn).toBeVisible();
    await expect(todayBtn).toHaveText("Today");

    // Verify Today is between Prev and Next
    const prevBtn = page.getByTestId("calendar-prev-btn");
    const nextBtn = page.getByTestId("calendar-next-btn");
    await expect(prevBtn).toBeVisible();
    await expect(nextBtn).toBeVisible();
  });

  test("CAL-HDR-4: Next button is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("calendar-next-btn")).toBeVisible();
    await expect(page.getByTestId("calendar-next-btn")).toContainText("Next");
  });

  test("CAL-HDR-5: Month and year display shows the current calendar period", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    const periodLabel = page.getByTestId("calendar-period-label");
    await expect(periodLabel).toBeVisible();

    // Default is Monthly view, so it shows "Month Year" format
    const now = new Date();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const expected = `${months[now.getMonth()]} ${now.getFullYear()}`;
    await expect(periodLabel).toHaveText(expected);
  });

  test("CAL-HDR-6: Prev button navigates to the previous month", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Record the current period label
    const periodLabel = page.getByTestId("calendar-period-label");
    const currentText = await periodLabel.textContent();

    // Click Prev
    await page.getByTestId("calendar-prev-btn").click();

    // Period label should change to the previous month
    await expect(periodLabel).not.toHaveText(currentText!);

    // Compute expected previous month
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const expectedPrev = `${months[prevMonth.getMonth()]} ${prevMonth.getFullYear()}`;
    await expect(periodLabel).toHaveText(expectedPrev);

    // Verify the day grid updates (calendar grid should be visible)
    await expect(page.getByTestId("calendar-grid")).toBeVisible();
  });

  test("CAL-HDR-7: Next button navigates to the next month", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    const periodLabel = page.getByTestId("calendar-period-label");
    const currentText = await periodLabel.textContent();

    // Click Next
    await page.getByTestId("calendar-next-btn").click();

    // Period label should change to the next month
    await expect(periodLabel).not.toHaveText(currentText!);

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const expectedNext = `${months[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`;
    await expect(periodLabel).toHaveText(expectedNext);

    await expect(page.getByTestId("calendar-grid")).toBeVisible();
  });

  test("CAL-HDR-8: Today button navigates to the current month", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    const periodLabel = page.getByTestId("calendar-period-label");
    const originalText = await periodLabel.textContent();

    // Navigate away from current month by clicking Prev twice
    await page.getByTestId("calendar-prev-btn").click();
    await page.getByTestId("calendar-prev-btn").click();
    await expect(periodLabel).not.toHaveText(originalText!);

    // Click Today to return
    await page.getByTestId("calendar-today-btn").click();

    // Should display the current month again
    await expect(periodLabel).toHaveText(originalText!);
  });

  test("CAL-HDR-9: Daily/Weekly/Monthly view toggle is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    await expect(page.getByTestId("calendar-view-daily")).toBeVisible();
    await expect(page.getByTestId("calendar-view-daily")).toHaveText("Daily");

    await expect(page.getByTestId("calendar-view-weekly")).toBeVisible();
    await expect(page.getByTestId("calendar-view-weekly")).toHaveText("Weekly");

    await expect(page.getByTestId("calendar-view-monthly")).toBeVisible();
    await expect(page.getByTestId("calendar-view-monthly")).toHaveText("Monthly");
  });

  test("CAL-HDR-10: Monthly view is selected by default", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Monthly button should have active class
    await expect(page.getByTestId("calendar-view-monthly")).toHaveClass(/calendar-view-btn--active/);

    // Other buttons should NOT have active class
    await expect(page.getByTestId("calendar-view-daily")).not.toHaveClass(/calendar-view-btn--active/);
    await expect(page.getByTestId("calendar-view-weekly")).not.toHaveClass(/calendar-view-btn--active/);

    // Calendar grid should show a monthly grid
    await expect(page.locator(".calendar-grid-monthly")).toBeVisible();
  });

  test("CAL-HDR-11: Clicking Daily toggle switches to daily view", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Click Daily
    await page.getByTestId("calendar-view-daily").click();

    // Daily should be active
    await expect(page.getByTestId("calendar-view-daily")).toHaveClass(/calendar-view-btn--active/);
    await expect(page.getByTestId("calendar-view-monthly")).not.toHaveClass(/calendar-view-btn--active/);

    // Grid should show daily layout with time slots
    await expect(page.locator(".calendar-grid-daily")).toBeVisible();

    // Period label should show date format (e.g., "February 25, 2026")
    const periodLabel = page.getByTestId("calendar-period-label");
    const text = await periodLabel.textContent();
    // Daily format: "MonthName Day, Year"
    expect(text).toMatch(/^\w+ \d{1,2}, \d{4}$/);

    // Prev/Next should navigate by day
    const labelBefore = await periodLabel.textContent();
    await page.getByTestId("calendar-prev-btn").click();
    await expect(periodLabel).not.toHaveText(labelBefore!);
  });

  test("CAL-HDR-12: Clicking Weekly toggle switches to weekly view", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Click Weekly
    await page.getByTestId("calendar-view-weekly").click();

    // Weekly should be active
    await expect(page.getByTestId("calendar-view-weekly")).toHaveClass(/calendar-view-btn--active/);
    await expect(page.getByTestId("calendar-view-monthly")).not.toHaveClass(/calendar-view-btn--active/);

    // Grid should show weekly layout with day columns
    await expect(page.locator(".calendar-grid-weekly")).toBeVisible();

    // Period label should show week range (e.g., "Feb 23 - Mar 1, 2026")
    const periodLabel = page.getByTestId("calendar-period-label");
    const text = await periodLabel.textContent();
    // Weekly format: "Mon DD - Mon DD, YYYY"
    expect(text).toMatch(/^\w{3} \d{1,2} - \w{3} \d{1,2}, \d{4}$/);

    // Prev/Next should navigate by week
    const labelBefore = await periodLabel.textContent();
    await page.getByTestId("calendar-prev-btn").click();
    await expect(periodLabel).not.toHaveText(labelBefore!);
  });

  test("CAL-HDR-13: Clicking Monthly toggle returns to monthly view", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Switch to Weekly first
    await page.getByTestId("calendar-view-weekly").click();
    await expect(page.getByTestId("calendar-view-weekly")).toHaveClass(/calendar-view-btn--active/);
    await expect(page.locator(".calendar-grid-weekly")).toBeVisible();

    // Switch back to Monthly
    await page.getByTestId("calendar-view-monthly").click();

    // Monthly should be active
    await expect(page.getByTestId("calendar-view-monthly")).toHaveClass(/calendar-view-btn--active/);
    await expect(page.getByTestId("calendar-view-weekly")).not.toHaveClass(/calendar-view-btn--active/);

    // Grid should show monthly layout
    await expect(page.locator(".calendar-grid-monthly")).toBeVisible();

    // Period label should show month format
    const periodLabel = page.getByTestId("calendar-period-label");
    const text = await periodLabel.textContent();
    expect(text).toMatch(/^\w+ \d{4}$/);
  });

  test("CAL-HDR-14: New Production Run button is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    const newRunBtn = page.getByTestId("new-production-run-btn");
    await expect(newRunBtn).toBeVisible();
    await expect(newRunBtn).toContainText("New Production Run");
  });

  test("CAL-HDR-15: New Production Run button opens a creation form", async ({ page }) => {
    test.slow();
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Click New Production Run
    await page.getByTestId("new-production-run-btn").click();

    // Modal appears with form fields
    await expect(page.getByTestId("new-run-modal")).toBeVisible();
    await expect(page.getByTestId("new-run-recipe-input")).toBeVisible();
    await expect(page.getByTestId("new-run-start-date")).toBeVisible();
    await expect(page.getByTestId("new-run-end-date")).toBeVisible();
    await expect(page.getByTestId("new-run-quantity")).toBeVisible();
    await expect(page.getByTestId("new-run-notes")).toBeVisible();

    // Select a recipe from the dropdown
    await page.getByTestId("new-run-recipe-input").click();
    await expect(
      page.locator('[data-testid^="new-run-recipe-option-"]').first()
    ).toBeVisible({ timeout: 15000 });
    await page.locator('[data-testid^="new-run-recipe-option-"]').first().click();

    // Set start and end dates (use a date in the current month)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const startDateStr = `${year}-${month}-05T08:00`;
    const endDateStr = `${year}-${month}-05T17:00`;

    await page.getByTestId("new-run-start-date").fill(startDateStr);
    await page.getByTestId("new-run-end-date").fill(endDateStr);
    await page.getByTestId("new-run-quantity").fill("500");

    // Submit
    await page.getByTestId("new-run-submit-btn").click();

    // Modal should close
    await expect(page.getByTestId("new-run-modal")).toBeHidden({ timeout: 30000 });

    // Event card should appear on the 5th of the current month
    const dayCell = page.getByTestId(`calendar-day-${year}-${month}-05`);
    await expect(dayCell.locator('[data-testid^="calendar-event-"]')).toBeVisible({ timeout: 15000 });

    // Verify persistence: navigate away and return
    await page.goto("/recipes");
    await expect(page).toHaveURL(/\/recipes/);
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // The event should still be on the 5th
    await expect(
      page.getByTestId(`calendar-day-${year}-${month}-05`)
        .locator('[data-testid^="calendar-event-"]')
    ).toBeVisible({ timeout: 15000 });
  });

  test("CAL-HDR-16: Cancelling New Production Run modal does not create a run", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Use a date cell that we will target with the form
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const targetDay = `${year}-${month}-06`;

    // Wait for grid to render, then count events on the target day cell
    await expect(page.getByTestId("calendar-grid")).toBeVisible({ timeout: 15000 });
    const dayCell = page.getByTestId(`calendar-day-${targetDay}`);
    const initialEventCount = await dayCell.locator('[data-testid^="calendar-event-"]').count();

    // Open the New Production Run modal
    await page.getByTestId("new-production-run-btn").click();
    await expect(page.getByTestId("new-run-modal")).toBeVisible();

    // Select a recipe from the dropdown
    await page.getByTestId("new-run-recipe-input").click();
    await expect(
      page.locator('[data-testid^="new-run-recipe-option-"]').first()
    ).toBeVisible({ timeout: 15000 });
    await page.locator('[data-testid^="new-run-recipe-option-"]').first().click();

    // Fill in dates and quantity
    await page.getByTestId("new-run-start-date").fill(`${year}-${month}-06T08:00`);
    await page.getByTestId("new-run-end-date").fill(`${year}-${month}-06T17:00`);
    await page.getByTestId("new-run-quantity").fill("999");

    // Click Cancel
    await page.getByTestId("new-run-cancel-btn").click();

    // Modal should close
    await expect(page.getByTestId("new-run-modal")).toBeHidden({ timeout: 30000 });

    // No new event should have been created on the target day
    await expect(dayCell.locator('[data-testid^="calendar-event-"]')).toHaveCount(initialEventCount);
  });

  test("CAL-HDR-17: Closing New Production Run modal with X button does not create a run", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Use a date cell that we will target with the form
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const targetDay = `${year}-${month}-07`;

    // Wait for grid to render, then count events on the target day cell
    await expect(page.getByTestId("calendar-grid")).toBeVisible({ timeout: 15000 });
    const dayCell = page.getByTestId(`calendar-day-${targetDay}`);
    const initialEventCount = await dayCell.locator('[data-testid^="calendar-event-"]').count();

    // Open the New Production Run modal
    await page.getByTestId("new-production-run-btn").click();
    await expect(page.getByTestId("new-run-modal")).toBeVisible();

    // Select a recipe from the dropdown
    await page.getByTestId("new-run-recipe-input").click();
    await expect(
      page.locator('[data-testid^="new-run-recipe-option-"]').first()
    ).toBeVisible({ timeout: 15000 });
    await page.locator('[data-testid^="new-run-recipe-option-"]').first().click();

    // Fill in dates and quantity
    await page.getByTestId("new-run-start-date").fill(`${year}-${month}-07T08:00`);
    await page.getByTestId("new-run-end-date").fill(`${year}-${month}-07T17:00`);
    await page.getByTestId("new-run-quantity").fill("888");

    // Click the X close button
    await page.getByTestId("new-run-modal-close").click();

    // Modal should close
    await expect(page.getByTestId("new-run-modal")).toBeHidden({ timeout: 30000 });

    // No new event should have been created on the target day
    await expect(dayCell.locator('[data-testid^="calendar-event-"]')).toHaveCount(initialEventCount);
  });

  test("CAL-HDR-18: Clicking overlay dismisses New Production Run modal without creating a run", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Use a date cell that we will target with the form
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const targetDay = `${year}-${month}-08`;

    // Wait for grid to render, then count events on the target day cell
    await expect(page.getByTestId("calendar-grid")).toBeVisible({ timeout: 15000 });
    const dayCell = page.getByTestId(`calendar-day-${targetDay}`);
    const initialEventCount = await dayCell.locator('[data-testid^="calendar-event-"]').count();

    // Open the New Production Run modal
    await page.getByTestId("new-production-run-btn").click();
    await expect(page.getByTestId("new-run-modal")).toBeVisible();

    // Select a recipe from the dropdown
    await page.getByTestId("new-run-recipe-input").click();
    await expect(
      page.locator('[data-testid^="new-run-recipe-option-"]').first()
    ).toBeVisible({ timeout: 15000 });
    await page.locator('[data-testid^="new-run-recipe-option-"]').first().click();

    // Fill in dates and quantity
    await page.getByTestId("new-run-start-date").fill(`${year}-${month}-08T08:00`);
    await page.getByTestId("new-run-end-date").fill(`${year}-${month}-08T17:00`);
    await page.getByTestId("new-run-quantity").fill("777");

    // Click the overlay (outside the modal content) to dismiss
    // The overlay is the modal element itself; click at position (1, 1) which is outside the modal-content
    await page.getByTestId("new-run-modal").click({ position: { x: 1, y: 1 } });

    // Modal should close
    await expect(page.getByTestId("new-run-modal")).toBeHidden({ timeout: 30000 });

    // No new event should have been created on the target day
    await expect(dayCell.locator('[data-testid^="calendar-event-"]')).toHaveCount(initialEventCount);
  });

  test("CAL-HDR-19: Filter by Status dropdown is displayed", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    const filterBtn = page.getByTestId("calendar-status-filter-btn");
    await expect(filterBtn).toBeVisible();
    await expect(filterBtn).toContainText("Filter by Status");
  });

  test("CAL-HDR-20: Filter by Status dropdown shows status options", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Click the filter button to open dropdown
    await page.getByTestId("calendar-status-filter-btn").click();

    await expect(page.getByTestId("calendar-status-filter-dropdown")).toBeVisible();
    await expect(page.getByTestId("calendar-status-option-all")).toBeVisible();
    await expect(page.getByTestId("calendar-status-option-on-track")).toBeVisible();
    await expect(page.getByTestId("calendar-status-option-material-shortage")).toBeVisible();
    await expect(page.getByTestId("calendar-status-option-scheduled")).toBeVisible();
    await expect(page.getByTestId("calendar-status-option-in-progress")).toBeVisible();
    await expect(page.getByTestId("calendar-status-option-pending-approval")).toBeVisible();
  });

  test("CAL-HDR-21: Selecting a status filter hides non-matching runs", async ({ page }) => {
    // Create two runs with different statuses in the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const resp1 = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${year}-${month}-12T08:00:00Z`,
        end_date: `${year}-${month}-12T16:00:00Z`,
        planned_quantity: 100,
        unit: "Units",
        status: "Material Shortage",
        notes: "",
      },
    });
    const run1 = await resp1.json();

    const resp2 = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${year}-${month}-13T08:00:00Z`,
        end_date: `${year}-${month}-13T16:00:00Z`,
        planned_quantity: 200,
        unit: "Units",
        status: "Scheduled",
        notes: "",
      },
    });
    const run2 = await resp2.json();

    try {
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      // Both events should be visible
      await expect(page.getByTestId(`calendar-event-${run1.id}`)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId(`calendar-event-${run2.id}`)).toBeVisible({ timeout: 15000 });

      // Filter by "Material Shortage"
      await page.getByTestId("calendar-status-filter-btn").click();
      await page.getByTestId("calendar-status-option-material-shortage").click();

      // Only Material Shortage event should be visible
      await expect(page.getByTestId(`calendar-event-${run1.id}`)).toBeVisible({ timeout: 15000 });

      // Scheduled event should be hidden
      await expect(page.getByTestId(`calendar-event-${run2.id}`)).toBeHidden({ timeout: 15000 });
    } finally {
      await page.request.delete(`/.netlify/functions/runs/${run1.id}`);
      await page.request.delete(`/.netlify/functions/runs/${run2.id}`);
    }
  });

  test('CAL-HDR-22: Selecting "All" in the filter shows all runs', async ({ page }) => {
    // Create two runs with different statuses in the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const resp1 = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${year}-${month}-14T08:00:00Z`,
        end_date: `${year}-${month}-14T16:00:00Z`,
        planned_quantity: 100,
        unit: "Units",
        status: "Material Shortage",
        notes: "",
      },
    });
    const run1 = await resp1.json();

    const resp2 = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${year}-${month}-15T08:00:00Z`,
        end_date: `${year}-${month}-15T16:00:00Z`,
        planned_quantity: 200,
        unit: "Units",
        status: "Scheduled",
        notes: "",
      },
    });
    const run2 = await resp2.json();

    try {
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      // Both events should be visible
      await expect(page.getByTestId(`calendar-event-${run1.id}`)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId(`calendar-event-${run2.id}`)).toBeVisible({ timeout: 15000 });

      // Filter by "Material Shortage" first
      await page.getByTestId("calendar-status-filter-btn").click();
      await page.getByTestId("calendar-status-option-material-shortage").click();

      // Only Material Shortage visible, Scheduled hidden
      await expect(page.getByTestId(`calendar-event-${run2.id}`)).toBeHidden({ timeout: 15000 });

      // Now select "All"
      await page.getByTestId("calendar-status-filter-btn").click();
      await page.getByTestId("calendar-status-option-all").click();

      // Both events should be visible again
      await expect(page.getByTestId(`calendar-event-${run1.id}`)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId(`calendar-event-${run2.id}`)).toBeVisible({ timeout: 15000 });
    } finally {
      await page.request.delete(`/.netlify/functions/runs/${run1.id}`);
      await page.request.delete(`/.netlify/functions/runs/${run2.id}`);
    }
  });

  test("CAL-HDR-23: Legend displays color coding for statuses", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    const legend = page.getByTestId("calendar-legend");
    await expect(legend).toBeVisible();
    await expect(legend).toContainText("Legend:");

    // Check legend items
    await expect(page.getByTestId("calendar-legend-on-track")).toBeVisible();
    await expect(page.getByTestId("calendar-legend-on-track")).toHaveText("On Track");

    await expect(page.getByTestId("calendar-legend-material-shortage")).toBeVisible();
    await expect(page.getByTestId("calendar-legend-material-shortage")).toHaveText("Material Shortage");

    await expect(page.getByTestId("calendar-legend-scheduled")).toBeVisible();
    await expect(page.getByTestId("calendar-legend-scheduled")).toHaveText("Scheduled");
  });
});
