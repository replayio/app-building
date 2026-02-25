import { test, expect } from "@playwright/test";

test.describe("CalendarGrid", () => {
  test("CAL-GRID-1: Monthly grid displays day-of-week column headers", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (const day of dayNames) {
      await expect(
        page.getByTestId(`calendar-header-${day.toLowerCase()}`)
      ).toBeVisible();
      await expect(
        page.getByTestId(`calendar-header-${day.toLowerCase()}`)
      ).toHaveText(day);
    }
  });

  test("CAL-GRID-2: Monthly grid displays day cells with date numbers", async ({ page }) => {
    test.slow();
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // The grid should have day cells
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthStr = String(month + 1).padStart(2, "0");
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Check first, middle, and last day cells exist with correct date numbers
    const sampleDays = [1, Math.floor(daysInMonth / 2), daysInMonth];
    for (const day of sampleDays) {
      const dateStr = `${year}-${monthStr}-${String(day).padStart(2, "0")}`;
      const cell = page.getByTestId(`calendar-day-${dateStr}`);
      await expect(cell).toBeVisible();
      await expect(cell).toContainText(String(day));
    }

    // Verify all day cells for the month exist by checking count via page.evaluate
    const allDaysPresent = await page.evaluate(({ yr, mo, days }: { yr: number; mo: string; days: number }) => {
      let count = 0;
      for (let d = 1; d <= days; d++) {
        const ds = `${yr}-${mo}-${String(d).padStart(2, "0")}`;
        if (document.querySelector(`[data-testid="calendar-day-${ds}"]`)) count++;
      }
      return count;
    }, { yr: year, mo: monthStr, days: daysInMonth });
    expect(allDaysPresent).toBe(daysInMonth);

    // Verify dimmed cells exist for previous/next month days
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    if (firstDayOfMonth > 0) {
      const prevMonth = new Date(year, month, 0);
      const prevMonthDay = prevMonth.getDate();
      const prevDateStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}-${String(prevMonthDay).padStart(2, "0")}`;
      const dimmedCell = page.getByTestId(`calendar-day-${prevDateStr}`);
      await expect(dimmedCell).toBeVisible();
      await expect(dimmedCell).toHaveClass(/calendar-day-cell--dimmed/);
    }
  });

  test("CAL-GRID-3: Production run event cards are displayed on the correct dates", async ({ page }) => {
    // Create a run on a known date in the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const startDate = `${year}-${month}-10T08:00:00Z`;
    const endDate = `${year}-${month}-10T16:00:00Z`;

    const response = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: startDate,
        end_date: endDate,
        planned_quantity: 500,
        unit: "Units",
        status: "Scheduled",
        notes: "",
      },
    });
    const run = await response.json();

    try {
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      // The event card should appear in the correct day cell
      const dayCell = page.getByTestId(`calendar-day-${year}-${month}-10`);
      await expect(dayCell).toBeVisible();
      const eventCard = dayCell.locator(`[data-testid="calendar-event-${run.id}"]`);
      await expect(eventCard).toBeVisible({ timeout: 15000 });
      await expect(eventCard).toContainText("Status: Scheduled");
    } finally {
      await page.request.delete(`/.netlify/functions/runs/${run.id}`);
    }
  });

  test("CAL-GRID-4: Event cards display product name, recipe, quantity, and status", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Wait for events to load
    await expect(
      page.locator('[data-testid^="calendar-event-"]').first()
    ).toBeVisible({ timeout: 15000 });

    // Check that at least one event card has the expected format:
    // "[Product] ([Recipe]) | [Quantity] [Unit] | Status: [Status]"
    const firstEvent = page.locator('[data-testid^="calendar-event-"]').first();
    const text = await firstEvent.textContent();
    // Format: "ProductName (RecipeName) | Qty Unit | Status: StatusName"
    expect(text).toMatch(/.+ \(.+\) \| \d+ \w+ \| Status: .+/);
  });

  test("CAL-GRID-5: On Track events are displayed with green background", async ({ page }) => {
    // Create an On Track run in the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const response = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${year}-${month}-06T08:00:00Z`,
        end_date: `${year}-${month}-06T16:00:00Z`,
        planned_quantity: 200,
        unit: "Units",
        status: "On Track",
        notes: "",
      },
    });
    const run = await response.json();

    try {
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      const eventCard = page.getByTestId(`calendar-event-${run.id}`);
      await expect(eventCard).toBeVisible({ timeout: 15000 });

      // Should have the on-track CSS class (green background)
      await expect(eventCard).toHaveClass(/calendar-event-card--on-track/);

      // Should have a checkmark icon (SVG with polyline check mark)
      await expect(eventCard.locator("svg.calendar-event-icon")).toBeVisible();
    } finally {
      await page.request.delete(`/.netlify/functions/runs/${run.id}`);
    }
  });

  test("CAL-GRID-6: Material Shortage events are displayed with red/pink background", async ({ page }) => {
    // Create a Material Shortage run in the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const response = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${year}-${month}-07T08:00:00Z`,
        end_date: `${year}-${month}-07T16:00:00Z`,
        planned_quantity: 150,
        unit: "Units",
        status: "Material Shortage",
        notes: "",
      },
    });
    const run = await response.json();

    try {
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      const eventCard = page.getByTestId(`calendar-event-${run.id}`);
      await expect(eventCard).toBeVisible({ timeout: 15000 });

      // Should have the material-shortage CSS class (red/pink background)
      await expect(eventCard).toHaveClass(/calendar-event-card--material-shortage/);

      // Should have a warning triangle icon
      await expect(eventCard.locator("svg.calendar-event-icon")).toBeVisible();
    } finally {
      await page.request.delete(`/.netlify/functions/runs/${run.id}`);
    }
  });

  test("CAL-GRID-7: Scheduled events are displayed with yellow background", async ({ page }) => {
    // Create a Scheduled run in the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const response = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${year}-${month}-08T08:00:00Z`,
        end_date: `${year}-${month}-08T16:00:00Z`,
        planned_quantity: 300,
        unit: "Units",
        status: "Scheduled",
        notes: "",
      },
    });
    const run = await response.json();

    try {
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      const eventCard = page.getByTestId(`calendar-event-${run.id}`);
      await expect(eventCard).toBeVisible({ timeout: 15000 });

      // Should have the scheduled CSS class (yellow/blue background)
      await expect(eventCard).toHaveClass(/calendar-event-card--scheduled/);
    } finally {
      await page.request.delete(`/.netlify/functions/runs/${run.id}`);
    }
  });

  test("CAL-GRID-8: In Progress events are displayed with a distinct color", async ({ page }) => {
    // Create an In Progress run in the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const response = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${year}-${month}-09T08:00:00Z`,
        end_date: `${year}-${month}-09T16:00:00Z`,
        planned_quantity: 250,
        unit: "Units",
        status: "In Progress",
        notes: "",
      },
    });
    const run = await response.json();

    try {
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      const eventCard = page.getByTestId(`calendar-event-${run.id}`);
      await expect(eventCard).toBeVisible({ timeout: 15000 });

      // Should have the in-progress CSS class (teal/cyan background)
      await expect(eventCard).toHaveClass(/calendar-event-card--in-progress/);
    } finally {
      await page.request.delete(`/.netlify/functions/runs/${run.id}`);
    }
  });

  test("CAL-GRID-9: Pending Approval events are displayed with a distinct color", async ({ page }) => {
    // Create a Pending Approval run in the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const response = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${year}-${month}-11T08:00:00Z`,
        end_date: `${year}-${month}-11T16:00:00Z`,
        planned_quantity: 100,
        unit: "Units",
        status: "Pending Approval",
        notes: "",
      },
    });
    const run = await response.json();

    try {
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      const eventCard = page.getByTestId(`calendar-event-${run.id}`);
      await expect(eventCard).toBeVisible({ timeout: 15000 });

      // Should have the pending-approval CSS class (amber/orange background)
      await expect(eventCard).toHaveClass(/calendar-event-card--pending-approval/);
    } finally {
      await page.request.delete(`/.netlify/functions/runs/${run.id}`);
    }
  });

  test("CAL-GRID-10: Multi-day events span across multiple day cells", async ({ page }) => {
    // Create a multi-day run spanning Monday to Friday in the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // Find the second Monday of the month
    const firstDay = new Date(year, month, 1);
    let monday = 1;
    while (new Date(year, month, monday).getDay() !== 1) {
      monday++;
    }
    monday += 7; // Second Monday
    const friday = monday + 4;

    const monthStr = String(month + 1).padStart(2, "0");
    const startDate = `${year}-${monthStr}-${String(monday).padStart(2, "0")}T08:00:00Z`;
    const endDate = `${year}-${monthStr}-${String(friday).padStart(2, "0")}T16:00:00Z`;

    const response = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: startDate,
        end_date: endDate,
        planned_quantity: 1000,
        unit: "Units",
        status: "Scheduled",
        notes: "",
      },
    });
    const run = await response.json();

    try {
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      // The event should appear on the start date
      const startCell = page.getByTestId(
        `calendar-day-${year}-${monthStr}-${String(monday).padStart(2, "0")}`
      );
      const eventCard = startCell.locator(`[data-testid="calendar-event-${run.id}"]`);
      await expect(eventCard).toBeVisible({ timeout: 15000 });

      // Multi-day event should have the span class
      await expect(eventCard).toHaveClass(/calendar-event-card--span/);

      // The event should NOT be rendered separately in the intermediate day cells (Tue-Thu)
      for (let d = monday + 1; d < friday; d++) {
        const intermediateCell = page.getByTestId(
          `calendar-day-${year}-${monthStr}-${String(d).padStart(2, "0")}`
        );
        await expect(
          intermediateCell.locator(`[data-testid="calendar-event-${run.id}"]`)
        ).toHaveCount(0);
      }
    } finally {
      await page.request.delete(`/.netlify/functions/runs/${run.id}`);
    }
  });

  test("CAL-GRID-11: Clicking an event card opens the RunDetailsPopup", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Wait for events to load
    await expect(
      page.locator('[data-testid^="calendar-event-"]').first()
    ).toBeVisible({ timeout: 15000 });

    // Click on the first event card
    await page.locator('[data-testid^="calendar-event-"]').first().click();

    // RunDetailsPopup should open
    await expect(page.getByTestId("run-details-popup")).toBeVisible({ timeout: 15000 });

    // Popup should show run details
    await expect(page.getByTestId("run-popup-title")).toBeVisible();
    await expect(page.getByTestId("run-popup-start")).toBeVisible();
    await expect(page.getByTestId("run-popup-end")).toBeVisible();
    await expect(page.getByTestId("run-popup-quantity")).toBeVisible();
    await expect(page.getByTestId("run-popup-status")).toBeVisible();
    await expect(page.getByTestId("run-popup-materials")).toBeVisible();
    await expect(page.getByTestId("run-popup-notes")).toBeVisible();
  });

  test("CAL-GRID-12: Multiple events on the same day are stacked within the cell", async ({ page }) => {
    test.slow();
    // Create two runs on the same day in the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = "04";
    const dateStr = `${year}-${month}-${day}`;

    const response1 = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${dateStr}T08:00:00Z`,
        end_date: `${dateStr}T12:00:00Z`,
        planned_quantity: 100,
        unit: "Units",
        status: "Scheduled",
        notes: "First run",
      },
    });
    const run1 = await response1.json();

    const response2 = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${dateStr}T13:00:00Z`,
        end_date: `${dateStr}T17:00:00Z`,
        planned_quantity: 200,
        unit: "Units",
        status: "Scheduled",
        notes: "Second run",
      },
    });
    const run2 = await response2.json();

    try {
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      // Both events should be visible in the same day cell
      const dayCell = page.getByTestId(`calendar-day-${dateStr}`);
      await expect(dayCell).toBeVisible();

      await expect(
        dayCell.locator(`[data-testid="calendar-event-${run1.id}"]`)
      ).toBeVisible({ timeout: 15000 });
      await expect(
        dayCell.locator(`[data-testid="calendar-event-${run2.id}"]`)
      ).toBeVisible({ timeout: 15000 });

      // Both events should be stacked (both visible, count >= 2)
      const eventsInCell = dayCell.locator('[data-testid^="calendar-event-"]');
      const count = await eventsInCell.count();
      expect(count).toBeGreaterThanOrEqual(2);
    } finally {
      await page.request.delete(`/.netlify/functions/runs/${run1.id}`);
      await page.request.delete(`/.netlify/functions/runs/${run2.id}`);
    }
  });

  test("CAL-GRID-13: Empty day cells show no event cards", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Wait for events to load (at least one event should exist on some day)
    await expect(
      page.locator('[data-testid^="calendar-event-"]').first()
    ).toBeVisible({ timeout: 15000 });

    // Find a day cell in the current month that has no events
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // Day 1 is unlikely to have seed data events (seed data is on specific dates)
    // Check that a day cell with no events has zero event cards
    const emptyCell = page.getByTestId(`calendar-day-${year}-${month}-01`);
    await expect(emptyCell).toBeVisible();
    await expect(
      emptyCell.locator('[data-testid^="calendar-event-"]')
    ).toHaveCount(0);
  });

  test("CAL-GRID-14: Drag-and-drop an event card to reschedule a run", async ({ page }) => {
    test.slow();

    // Create a run on a known date for drag testing
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const sourceDay = "16";
    const targetDay = "15";

    const response = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${year}-${month}-${sourceDay}T08:00:00Z`,
        end_date: `${year}-${month}-${sourceDay}T16:00:00Z`,
        planned_quantity: 300,
        unit: "Units",
        status: "Scheduled",
        notes: "",
      },
    });
    const run = await response.json();

    try {
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      const eventCard = page.getByTestId(`calendar-event-${run.id}`);
      await expect(eventCard).toBeVisible({ timeout: 15000 });

      const targetCell = page.getByTestId(`calendar-day-${year}-${month}-${targetDay}`);

      // Drag event from source to target
      await eventCard.dragTo(targetCell);

      // Reschedule tooltip should appear
      await expect(page.getByTestId("reschedule-tooltip")).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId("reschedule-tooltip-text")).toBeVisible();

      // Confirm the reschedule
      await page.getByTestId("reschedule-confirm-btn").click();

      // Tooltip should close
      await expect(page.getByTestId("reschedule-tooltip")).toBeHidden({ timeout: 15000 });

      // Event should now be on the target date
      await expect(
        page.getByTestId(`calendar-day-${year}-${month}-${targetDay}`)
          .locator(`[data-testid="calendar-event-${run.id}"]`)
      ).toBeVisible({ timeout: 15000 });

      // Verify persistence by reloading
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      await expect(
        page.getByTestId(`calendar-day-${year}-${month}-${targetDay}`)
          .locator(`[data-testid="calendar-event-${run.id}"]`)
      ).toBeVisible({ timeout: 15000 });
    } finally {
      await page.request.delete(`/.netlify/functions/runs/${run.id}`);
    }
  });

  test("CAL-GRID-15: Drag-and-drop reschedule can be cancelled", async ({ page }) => {
    test.slow();
    // Create a run for drag testing
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const sourceDay = "18";
    const targetDay = "19";

    const response = await page.request.post("/.netlify/functions/runs", {
      data: {
        start_date: `${year}-${month}-${sourceDay}T08:00:00Z`,
        end_date: `${year}-${month}-${sourceDay}T16:00:00Z`,
        planned_quantity: 300,
        unit: "Units",
        status: "Scheduled",
        notes: "",
      },
    });
    const run = await response.json();

    try {
      await page.goto("/calendar");
      await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

      const eventCard = page.getByTestId(`calendar-event-${run.id}`);
      await expect(eventCard).toBeVisible({ timeout: 15000 });

      const targetCell = page.getByTestId(`calendar-day-${year}-${month}-${targetDay}`);
      await expect(targetCell).toBeVisible({ timeout: 15000 });

      // Use manual HTML5 drag event dispatch for Replay browser reliability
      const sourceTestId = `calendar-event-${run.id}`;
      const targetTestId = `calendar-day-${year}-${month}-${targetDay}`;
      await page.evaluate(({ sourceId, targetId }) => {
        const source = document.querySelector(`[data-testid="${sourceId}"]`)!;
        const target = document.querySelector(`[data-testid="${targetId}"]`)!;
        const targetRect = target.getBoundingClientRect();

        const dataTransfer = new DataTransfer();
        source.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer }));
        target.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer }));
        target.dispatchEvent(new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer,
          clientX: targetRect.left + targetRect.width / 2,
          clientY: targetRect.top + targetRect.height / 2,
        }));
      }, { sourceId: sourceTestId, targetId: targetTestId });

      // Reschedule tooltip should appear
      await expect(page.getByTestId("reschedule-tooltip")).toBeVisible({ timeout: 30000 });

      // Cancel the reschedule
      await page.getByTestId("reschedule-cancel-btn").click();

      // Tooltip should close
      await expect(page.getByTestId("reschedule-tooltip")).toBeHidden({ timeout: 15000 });

      // Event should remain on original date
      await expect(
        page.getByTestId(`calendar-day-${year}-${month}-${sourceDay}`)
          .locator(`[data-testid="calendar-event-${run.id}"]`)
      ).toBeVisible({ timeout: 15000 });
    } finally {
      await page.request.delete(`/.netlify/functions/runs/${run.id}`);
    }
  });

  test("CAL-GRID-16: Weekly view displays single week with day columns", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Switch to Weekly view
    await page.getByTestId("calendar-view-weekly").click();
    await expect(page.locator(".calendar-grid-weekly")).toBeVisible();

    // Should display 7 day column headers (Sun through Sat)
    const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    for (const day of dayNames) {
      await expect(
        page.getByTestId(`calendar-weekly-header-${day}`)
      ).toBeVisible();
    }

    // Should have time slots
    await expect(page.locator(".calendar-time-label").first()).toBeVisible();

    // Production run events should be visible if any exist in the current week
    // (This verifies the structure, events depend on data)
    await expect(page.locator(".calendar-weekly-body")).toBeVisible();
  });

  test("CAL-GRID-17: Daily view displays a single day with time slots", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });

    // Switch to Daily view
    await page.getByTestId("calendar-view-daily").click();
    await expect(page.locator(".calendar-grid-daily")).toBeVisible();

    // Should display a single day header
    await expect(page.getByTestId("calendar-daily-header")).toBeVisible();

    // Should have time slots along the vertical axis
    await expect(page.locator(".calendar-time-label").first()).toBeVisible();

    // Time slot cells should exist
    await expect(page.getByTestId("calendar-daily-cell-0")).toBeVisible();
    await expect(page.getByTestId("calendar-daily-cell-8")).toBeVisible();
    await expect(page.getByTestId("calendar-daily-cell-12")).toBeVisible();
    await expect(page.getByTestId("calendar-daily-cell-23")).toBeVisible();
  });
});
