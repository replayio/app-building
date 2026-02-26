import { test, expect, type Page } from "@playwright/test";

// --- Shared state populated in beforeAll ---
let scheduledRunId: string;
let scheduledRunDetail: {
  id: string;
  recipe_id: string;
  recipe_name: string;
  product_name: string;
  start_date: string;
  end_date: string;
  planned_quantity: number;
  unit: string;
  status: string;
  notes: string;
  materials: Array<{
    id: string;
    material_name: string;
    quantity: number;
    unit: string;
  }>;
  forecasts: Array<{
    id: string;
    material_name: string;
    required_amount: number;
    forecast_available: number;
    unit: string;
    pending_delivery: string;
  }>;
  equipment: Array<{
    id: string;
    equipment_name: string;
    status: string;
    notes: string;
  }>;
};
let recipeId: string;
let confirmedRunId: string;
let cancelledRunId: string;
let emptyRunId: string;

test.beforeAll(async ({ request }) => {
  // Get a recipe for creating test runs
  const recipesRes = await request.get("/.netlify/functions/recipes");
  const recipes = await recipesRes.json();
  recipeId = recipes[0].id;

  // Find an existing Scheduled run that has materials, forecasts, and equipment
  const runsRes = await request.get("/.netlify/functions/runs?status=Scheduled");
  const runs = await runsRes.json();

  for (const r of runs) {
    const detailRes = await request.get(`/.netlify/functions/runs/${r.id}`);
    const detail = await detailRes.json();
    if (
      detail.materials?.length > 0 &&
      detail.forecasts?.length > 0 &&
      detail.equipment?.length > 0
    ) {
      scheduledRunId = detail.id;
      scheduledRunDetail = detail;
      break;
    }
  }

  if (!scheduledRunId && runs.length > 0) {
    const detailRes = await request.get(
      `/.netlify/functions/runs/${runs[0].id}`
    );
    scheduledRunDetail = await detailRes.json();
    scheduledRunId = scheduledRunDetail.id;
  }

  if (!scheduledRunId) throw new Error("No Scheduled runs found in database");

  // Create a Confirmed run
  let res = await request.post("/.netlify/functions/runs", {
    data: {
      recipe_id: recipeId,
      start_date: "2024-08-01T08:00:00Z",
      end_date: "2024-08-01T17:00:00Z",
      planned_quantity: 200,
      unit: "Units",
      status: "Confirmed",
    },
  });
  confirmedRunId = (await res.json()).id;

  // Create a Cancelled run
  res = await request.post("/.netlify/functions/runs", {
    data: {
      recipe_id: recipeId,
      start_date: "2024-08-02T08:00:00Z",
      end_date: "2024-08-02T17:00:00Z",
      planned_quantity: 150,
      unit: "Units",
      status: "Cancelled",
    },
  });
  cancelledRunId = (await res.json()).id;

  // Create an empty run (no recipe) for empty state tests
  res = await request.post("/.netlify/functions/runs", {
    data: {
      start_date: "2024-08-03T08:00:00Z",
      end_date: "2024-08-03T17:00:00Z",
      planned_quantity: 50,
      unit: "Units",
    },
  });
  emptyRunId = (await res.json()).id;
});

async function goToRun(page: Page, runId: string) {
  await page.goto(`/runs/${runId}`);
  await expect(page.getByTestId("run-header")).toBeVisible({ timeout: 30000 });
}

// ─── RunHeader ───────────────────────────────────────────────────────────────

test.describe("RunHeader", () => {
  test("RUN-HDR-1: Breadcrumb displays Home > Runs > Run ID", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const breadcrumb = page.getByTestId("breadcrumb");
    await expect(breadcrumb).toBeVisible();

    // Home link
    await expect(breadcrumb.locator("a").first()).toHaveText("Home");
    // Separator
    await expect(breadcrumb.locator(".breadcrumb-separator")).toHaveCount(2);
    // Runs link
    await expect(breadcrumb.locator("a").nth(1)).toHaveText("Runs");
    // Current item (run ID)
    await expect(breadcrumb.locator(".breadcrumb-current")).toHaveText(
      scheduledRunId
    );
  });

  test("RUN-HDR-2: Breadcrumb Home link navigates to home/dashboard", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    await page
      .getByTestId("breadcrumb")
      .locator("a", { hasText: "Home" })
      .click();
    // "/" redirects to "/recipes" in this app
    await expect(page).toHaveURL(/\/recipes/, { timeout: 30000 });
  });

  test("RUN-HDR-3: Breadcrumb Runs link navigates to CalendarPage", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    await page
      .getByTestId("breadcrumb")
      .locator("a", { hasText: "Runs" })
      .click();
    await expect(page).toHaveURL(/\/calendar/, { timeout: 30000 });
  });

  test('RUN-HDR-4: Page title displays "Run Details: RUN-ID"', async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    await expect(page.getByTestId("run-detail-title")).toHaveText(
      `Run Details: ${scheduledRunId}`
    );
  });

  test("RUN-HDR-5: High-Level Information section heading is displayed", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    await expect(page.getByTestId("run-info-heading")).toBeVisible();
    await expect(page.getByTestId("run-info-heading")).toHaveText(
      "High-Level Information"
    );
  });

  test("RUN-HDR-6: Run ID field displays the run identifier", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    await expect(page.getByTestId("run-info-id")).toBeVisible();
    await expect(page.getByTestId("run-info-id")).toHaveText(scheduledRunId);
  });

  test("RUN-HDR-7: Date/Time field displays the scheduled date and time", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const dateTimeField = page.getByTestId("run-info-datetime");
    await expect(dateTimeField).toBeVisible();

    const text = await dateTimeField.textContent();
    expect(text).toBeTruthy();
    // Verify date-time format: YYYY-MM-DD HH:MM AM/PM
    expect(text).toMatch(/\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}\s+(AM|PM)/);
  });

  test("RUN-HDR-8: Product field displays the product name", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const productField = page.getByTestId("run-info-product");
    await expect(productField).toBeVisible();
    await expect(productField).toHaveText(scheduledRunDetail.product_name);
  });

  test("RUN-HDR-9: Associated Recipe field displays the recipe name", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const recipeField = page.getByTestId("run-info-recipe");
    await expect(recipeField).toBeVisible();

    // Format: "RecipeName (ProductName)"
    const expected = `${scheduledRunDetail.recipe_name} (${scheduledRunDetail.product_name})`;
    await expect(recipeField).toHaveText(expected);
  });

  test("RUN-HDR-10: Planned Quantity field displays the quantity with units", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const qtyField = page.getByTestId("run-info-quantity");
    await expect(qtyField).toBeVisible();
    await expect(qtyField).toHaveText(
      `${parseFloat(String(scheduledRunDetail.planned_quantity))} ${scheduledRunDetail.unit}`
    );
  });

  test('RUN-HDR-11: Status field displays a "Scheduled" badge', async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const statusField = page.getByTestId("run-info-status");
    await expect(statusField).toBeVisible();

    const badge = statusField.locator(".badge");
    await expect(badge).toHaveText("Scheduled");
    await expect(badge).toHaveClass(/badge--scheduled/);
  });

  test('RUN-HDR-12: Status badge shows "Confirmed" styling when run is confirmed', async ({
    page,
  }) => {
    await goToRun(page, confirmedRunId);

    const statusField = page.getByTestId("run-info-status");
    const badge = statusField.locator(".badge");
    await expect(badge).toHaveText("Confirmed");
    await expect(badge).toHaveClass(/badge--confirmed/);
  });

  test('RUN-HDR-13: Status badge shows "Cancelled" styling when run is cancelled', async ({
    page,
  }) => {
    await goToRun(page, cancelledRunId);

    const statusField = page.getByTestId("run-info-status");
    const badge = statusField.locator(".badge");
    await expect(badge).toHaveText("Cancelled");
    await expect(badge).toHaveClass(/badge--cancelled/);
  });
});

// ─── RunActions ──────────────────────────────────────────────────────────────

test.describe("RunActions", () => {
  test("RUN-ACT-1: Adjust Quantities button is displayed", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    await expect(page.getByTestId("adjust-quantities-btn")).toBeVisible();
    await expect(page.getByTestId("adjust-quantities-btn")).toHaveText(
      "Adjust Quantities"
    );
  });

  test("RUN-ACT-2: Adjust Quantities button opens an edit form", async ({
    page,
    request,
  }) => {
    test.slow();

    // Create a dedicated run for this modification test
    const createRes = await request.post("/.netlify/functions/runs", {
      data: {
        recipe_id: recipeId,
        start_date: "2024-09-01T08:00:00Z",
        end_date: "2024-09-01T17:00:00Z",
        planned_quantity: 500,
        unit: "Units",
      },
    });
    const testRun = await createRes.json();
    const detailRes = await request.get(
      `/.netlify/functions/runs/${testRun.id}`
    );
    const testRunDetail = await detailRes.json();

    await goToRun(page, testRun.id);

    // Verify current quantity
    await expect(page.getByTestId("run-info-quantity")).toHaveText("500 Units");

    // Click Adjust Quantities
    await page.getByTestId("adjust-quantities-btn").click();

    // Modal appears
    await expect(page.getByTestId("adjust-quantity-modal")).toBeVisible();
    await expect(page.getByTestId("adjust-quantity-input")).toBeVisible();

    // Change quantity from 500 to 600
    await page.getByTestId("adjust-quantity-input").clear();
    await page.getByTestId("adjust-quantity-input").fill("600");

    // Save
    await page.getByTestId("adjust-quantity-save").click();

    // Modal closes
    await expect(page.getByTestId("adjust-quantity-modal")).toBeHidden({
      timeout: 30000,
    });

    // Quantity updates
    await expect(page.getByTestId("run-info-quantity")).toHaveText(
      "600 Units",
      { timeout: 15000 }
    );

    // If the run has materials, verify material amounts updated
    if (testRunDetail.materials?.length > 0) {
      const mat = testRunDetail.materials[0];
      const expectedAmount = Number(mat.quantity) * 600;
      const expectedStr =
        expectedAmount % 1 === 0
          ? String(expectedAmount)
          : expectedAmount.toFixed(2);

      const materialRow = page
        .getByTestId("raw-material-row")
        .filter({ hasText: mat.material_name });
      await expect(materialRow.getByTestId("material-amount")).toHaveText(
        expectedStr,
        { timeout: 15000 }
      );
    }

    // Verify persistence
    await page.goto("/calendar");
    await expect(page).toHaveURL(/\/calendar/, { timeout: 30000 });
    await goToRun(page, testRun.id);
    await expect(page.getByTestId("run-info-quantity")).toHaveText(
      "600 Units",
      { timeout: 15000 }
    );
  });

  test("RUN-ACT-3: Confirm Run button is displayed", async ({ page }) => {
    await goToRun(page, scheduledRunId);

    await expect(page.getByTestId("confirm-run-btn")).toBeVisible();
    await expect(page.getByTestId("confirm-run-btn")).toHaveText("Confirm Run");
  });

  test("RUN-ACT-4: Confirm Run button changes status to Confirmed", async ({
    page,
    request,
  }) => {
    test.slow();

    // Create a dedicated Scheduled run with today's date so it appears on the CalendarPage
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8).toISOString();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17).toISOString();
    const createRes = await request.post("/.netlify/functions/runs", {
      data: {
        recipe_id: recipeId,
        start_date: todayStart,
        end_date: todayEnd,
        planned_quantity: 300,
        unit: "Units",
      },
    });
    const testRun = await createRes.json();

    await goToRun(page, testRun.id);

    // Verify initial status is Scheduled
    const badge = page.getByTestId("run-info-status").locator(".badge");
    await expect(badge).toHaveText("Scheduled");
    await expect(badge).toHaveClass(/badge--scheduled/);

    // Click Confirm Run
    await page.getByTestId("confirm-run-btn").click();

    // Status changes to Confirmed
    await expect(badge).toHaveText("Confirmed", { timeout: 30000 });
    await expect(badge).toHaveClass(/badge--confirmed/);

    // Verify persistence — navigate to CalendarPage and verify the run shows as Confirmed
    await page.goto("/calendar");
    await expect(page).toHaveURL(/\/calendar/, { timeout: 30000 });
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });
    await expect(
      page.getByTestId(`calendar-event-${testRun.id}`)
    ).toContainText("Status: Confirmed", { timeout: 15000 });

    // Navigate back and verify persistence on the detail page
    await goToRun(page, testRun.id);
    await expect(
      page.getByTestId("run-info-status").locator(".badge")
    ).toHaveText("Confirmed", { timeout: 15000 });
  });

  test("RUN-ACT-5: Cancel Run button is displayed", async ({ page }) => {
    await goToRun(page, scheduledRunId);

    await expect(page.getByTestId("cancel-run-btn")).toBeVisible();
    await expect(page.getByTestId("cancel-run-btn")).toHaveText("Cancel Run");
  });

  test("RUN-ACT-6: Cancel Run button changes status to Cancelled", async ({
    page,
    request,
  }) => {
    test.slow();

    // Create a dedicated Scheduled run with today's date so it appears on the CalendarPage
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8).toISOString();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17).toISOString();
    const createRes = await request.post("/.netlify/functions/runs", {
      data: {
        recipe_id: recipeId,
        start_date: todayStart,
        end_date: todayEnd,
        planned_quantity: 250,
        unit: "Units",
      },
    });
    const testRun = await createRes.json();

    await goToRun(page, testRun.id);

    // Verify initial status
    const badge = page.getByTestId("run-info-status").locator(".badge");
    await expect(badge).toHaveText("Scheduled");

    // Click Cancel Run
    await page.getByTestId("cancel-run-btn").click();

    // Confirmation dialog appears
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();

    // Confirm the cancellation
    await page.getByTestId("confirm-dialog-confirm").click();

    // Status changes to Cancelled
    await expect(badge).toHaveText("Cancelled", { timeout: 30000 });
    await expect(badge).toHaveClass(/badge--cancelled/);

    // Verify persistence — navigate to CalendarPage and verify the run shows as Cancelled
    await page.goto("/calendar");
    await expect(page).toHaveURL(/\/calendar/, { timeout: 30000 });
    await expect(page.getByTestId("calendar-page")).toBeVisible({ timeout: 30000 });
    await expect(
      page.getByTestId(`calendar-event-${testRun.id}`)
    ).toContainText("Status: Cancelled", { timeout: 15000 });

    // Navigate back and verify persistence on the detail page
    await goToRun(page, testRun.id);
    await expect(
      page.getByTestId("run-info-status").locator(".badge")
    ).toHaveText("Cancelled", { timeout: 15000 });
  });

  test("RUN-ACT-7: Cancel Run confirmation can be dismissed", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    // Click Cancel Run
    await page.getByTestId("cancel-run-btn").click();

    // Dialog appears
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();

    // Dismiss the dialog
    await page.getByTestId("confirm-dialog-cancel").click();

    // Dialog closes
    await expect(page.getByTestId("confirm-dialog")).toBeHidden();

    // Status remains Scheduled
    await expect(
      page.getByTestId("run-info-status").locator(".badge")
    ).toHaveText("Scheduled");
  });

  test("RUN-ACT-8: Action buttons are hidden or disabled for a Cancelled run", async ({
    page,
  }) => {
    await page.goto(`/runs/${cancelledRunId}`);
    await expect(page.getByTestId("run-details-page")).toBeVisible({
      timeout: 30000,
    });

    // Wait for data to load (status badge shows Cancelled)
    await expect(
      page.getByTestId("run-info-status").locator(".badge")
    ).toHaveText("Cancelled", { timeout: 30000 });

    // All action buttons should be hidden
    await expect(page.getByTestId("adjust-quantities-btn")).toHaveCount(0);
    await expect(page.getByTestId("confirm-run-btn")).toHaveCount(0);
    await expect(page.getByTestId("cancel-run-btn")).toHaveCount(0);
  });

  test("RUN-ACT-9: Action buttons are hidden or disabled for a Confirmed run except Cancel", async ({
    page,
  }) => {
    await goToRun(page, confirmedRunId);

    // Adjust Quantities and Confirm Run should be hidden
    await expect(page.getByTestId("adjust-quantities-btn")).toHaveCount(0);
    await expect(page.getByTestId("confirm-run-btn")).toHaveCount(0);

    // Cancel Run should remain visible
    await expect(page.getByTestId("cancel-run-btn")).toBeVisible();
  });

  test("RUN-ACT-10: Adjust Quantities modal can be dismissed without saving", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    // Note the current quantity
    const qtyText = await page.getByTestId("run-info-quantity").textContent();

    // Open the modal
    await page.getByTestId("adjust-quantities-btn").click();
    await expect(page.getByTestId("adjust-quantity-modal")).toBeVisible();

    // Dismiss via Cancel button
    await page.getByTestId("adjust-quantity-cancel").click();
    await expect(page.getByTestId("adjust-quantity-modal")).toBeHidden();

    // Quantity unchanged
    await expect(page.getByTestId("run-info-quantity")).toHaveText(qtyText!);

    // Open the modal again
    await page.getByTestId("adjust-quantities-btn").click();
    await expect(page.getByTestId("adjust-quantity-modal")).toBeVisible();

    // Dismiss via X close button
    await page.getByTestId("adjust-quantity-close").click();
    await expect(page.getByTestId("adjust-quantity-modal")).toBeHidden();

    // Quantity still unchanged
    await expect(page.getByTestId("run-info-quantity")).toHaveText(qtyText!);
  });
});

// ─── RawMaterialsTable ──────────────────────────────────────────────────────

test.describe("RawMaterialsTable", () => {
  test("RUN-MAT-1: Recipe and Raw Materials section heading is displayed", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    await expect(page.getByTestId("raw-materials-heading")).toBeVisible();
    await expect(page.getByTestId("raw-materials-heading")).toHaveText(
      "Recipe and Raw Materials"
    );
  });

  test("RUN-MAT-2: Table displays Material, Amount Needed, and Units column headers", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const table = page.getByTestId("raw-materials-table");
    await expect(table).toBeVisible();

    const headers = table.locator("thead th");
    await expect(headers.nth(0)).toHaveText("Material");
    await expect(headers.nth(1)).toHaveText("Amount Needed");
    await expect(headers.nth(2)).toHaveText("Units");
  });

  test("RUN-MAT-3: Table rows display raw material data for the run", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const materials = scheduledRunDetail.materials;
    if (materials.length === 0) {
      test.skip();
      return;
    }

    // Verify each material row displays correct data
    for (const mat of materials) {
      const row = page
        .getByTestId("raw-material-row")
        .filter({ hasText: mat.material_name });
      await expect(row).toBeVisible();
      await expect(row.getByTestId("material-name")).toHaveText(
        mat.material_name
      );
      await expect(row.getByTestId("material-unit")).toHaveText(mat.unit);
    }
  });

  test("RUN-MAT-4: Material amounts reflect the planned quantity", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const materials = scheduledRunDetail.materials;
    if (materials.length === 0) {
      test.skip();
      return;
    }

    const plannedQty = scheduledRunDetail.planned_quantity;

    for (const mat of materials) {
      const expected = Number(mat.quantity) * plannedQty;
      const expectedStr =
        expected % 1 === 0 ? String(expected) : expected.toFixed(2);

      const row = page
        .getByTestId("raw-material-row")
        .filter({ hasText: mat.material_name });
      await expect(row.getByTestId("material-amount")).toHaveText(expectedStr);
    }
  });

  test("RUN-MAT-5: Material amounts update when quantity is adjusted", async ({
    page,
    request,
  }) => {
    test.slow();

    // Create a dedicated run for this test
    const createRes = await request.post("/.netlify/functions/runs", {
      data: {
        recipe_id: recipeId,
        start_date: "2024-09-04T08:00:00Z",
        end_date: "2024-09-04T17:00:00Z",
        planned_quantity: 500,
        unit: "Units",
      },
    });
    const testRun = await createRes.json();
    const detailRes = await request.get(
      `/.netlify/functions/runs/${testRun.id}`
    );
    const detail = await detailRes.json();

    if (!detail.materials || detail.materials.length === 0) {
      test.skip();
      return;
    }

    await goToRun(page, testRun.id);

    // Verify initial amounts
    const mat = detail.materials[0];
    const initialAmount = Number(mat.quantity) * 500;
    const initialStr =
      initialAmount % 1 === 0 ? String(initialAmount) : initialAmount.toFixed(2);

    const materialRow = page
      .getByTestId("raw-material-row")
      .filter({ hasText: mat.material_name });
    await expect(materialRow.getByTestId("material-amount")).toHaveText(
      initialStr
    );

    // Adjust quantity to 1000
    await page.getByTestId("adjust-quantities-btn").click();
    await expect(page.getByTestId("adjust-quantity-modal")).toBeVisible();
    await page.getByTestId("adjust-quantity-input").clear();
    await page.getByTestId("adjust-quantity-input").fill("1000");
    await page.getByTestId("adjust-quantity-save").click();
    await expect(page.getByTestId("adjust-quantity-modal")).toBeHidden({
      timeout: 30000,
    });

    // Verify updated amounts
    const newAmount = Number(mat.quantity) * 1000;
    const newStr =
      newAmount % 1 === 0 ? String(newAmount) : newAmount.toFixed(2);

    await expect(materialRow.getByTestId("material-amount")).toHaveText(
      newStr,
      { timeout: 15000 }
    );
  });

  test("RUN-MAT-6: Empty materials table shows placeholder when run has no recipe materials", async ({
    page,
  }) => {
    await goToRun(page, emptyRunId);

    await expect(page.getByTestId("raw-materials-empty")).toBeVisible();
  });
});

// ─── ForecastTable ───────────────────────────────────────────────────────────

test.describe("ForecastTable", () => {
  test("RUN-FCST-1: Forecast/Availability section heading is displayed", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    await expect(page.getByTestId("forecast-heading")).toBeVisible();
    await expect(page.getByTestId("forecast-heading")).toHaveText(
      "Forecast/Availability"
    );
  });

  test("RUN-FCST-2: Table displays Material, Required Amount, Forecast Available, Shortage/Excess, and Pending Deliveries column headers", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const table = page.getByTestId("forecast-table");
    await expect(table).toBeVisible();

    const headers = table.locator("thead th");
    await expect(headers.nth(0)).toHaveText("Material");
    await expect(headers.nth(1)).toHaveText("Required Amount");
    await expect(headers.nth(2)).toHaveText("Forecast Available");
    await expect(headers.nth(3)).toHaveText("Shortage/Excess");
    await expect(headers.nth(4)).toHaveText("Pending Deliveries");
  });

  test("RUN-FCST-3: Table rows display forecast data for each material", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const forecasts = scheduledRunDetail.forecasts;
    if (forecasts.length === 0) {
      test.skip();
      return;
    }

    for (const f of forecasts) {
      const row = page
        .getByTestId("forecast-row")
        .filter({ hasText: f.material_name });
      await expect(row).toBeVisible();

      // Check material name
      await expect(row.getByTestId("forecast-material")).toHaveText(
        f.material_name
      );

      // Check required amount
      const required = Number(f.required_amount);
      const requiredStr =
        required % 1 === 0 ? String(required) : required.toFixed(2);
      await expect(row.getByTestId("forecast-required")).toContainText(
        requiredStr
      );

      // Check forecast available
      const available = Number(f.forecast_available);
      const availableStr =
        available % 1 === 0 ? String(available) : available.toFixed(2);
      await expect(row.getByTestId("forecast-available")).toContainText(
        availableStr
      );
    }
  });

  test("RUN-FCST-4: Shortage/Excess column shows green background for surplus", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const forecasts = scheduledRunDetail.forecasts;
    const surplusItem = forecasts.find(
      (f: { forecast_available: number; required_amount: number }) =>
        Number(f.forecast_available) > Number(f.required_amount)
    );
    if (!surplusItem) {
      test.skip();
      return;
    }

    const row = page
      .getByTestId("forecast-row")
      .filter({ hasText: surplusItem.material_name });
    const cell = row.getByTestId("forecast-shortage-excess");
    await expect(cell.locator(".forecast-surplus")).toBeVisible();
    await expect(cell).toContainText("+");
  });

  test("RUN-FCST-5: Shortage/Excess column shows red background for shortage", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const forecasts = scheduledRunDetail.forecasts;
    const shortageItem = forecasts.find(
      (f: { forecast_available: number; required_amount: number }) =>
        Number(f.forecast_available) < Number(f.required_amount)
    );
    if (!shortageItem) {
      test.skip();
      return;
    }

    const row = page
      .getByTestId("forecast-row")
      .filter({ hasText: shortageItem.material_name });
    const cell = row.getByTestId("forecast-shortage-excess");
    await expect(cell.locator(".forecast-shortage")).toBeVisible();
    await expect(cell).toContainText("-");
  });

  test("RUN-FCST-6: Shortage/Excess values are computed from Required Amount and Forecast Available", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const forecasts = scheduledRunDetail.forecasts;
    if (forecasts.length === 0) {
      test.skip();
      return;
    }

    for (const f of forecasts) {
      const required = Number(f.required_amount);
      const available = Number(f.forecast_available);
      const diff = available - required;
      const diffStr =
        diff > 0
          ? `+${diff % 1 === 0 ? diff : diff.toFixed(2)} ${f.unit}`
          : `${diff % 1 === 0 ? diff : diff.toFixed(2)} ${f.unit}`;

      const row = page
        .getByTestId("forecast-row")
        .filter({ hasText: f.material_name });
      await expect(row.getByTestId("forecast-shortage-excess")).toContainText(
        diffStr
      );
    }
  });

  test("RUN-FCST-7: Pending Deliveries column displays delivery references with status", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const forecasts = scheduledRunDetail.forecasts;
    const withDelivery = forecasts.find(
      (f: { pending_delivery: string }) =>
        f.pending_delivery && f.pending_delivery !== "—"
    );
    if (!withDelivery) {
      test.skip();
      return;
    }

    const row = page
      .getByTestId("forecast-row")
      .filter({ hasText: withDelivery.material_name });
    await expect(row.getByTestId("forecast-pending")).toContainText(
      withDelivery.pending_delivery
    );
  });

  test("RUN-FCST-8: Forecast data reflects external inventory and delivery app data", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const forecasts = scheduledRunDetail.forecasts;
    if (forecasts.length === 0) {
      test.skip();
      return;
    }

    // Verify that forecast available and pending deliveries are displayed
    // (sourced from external inventory and delivery systems)
    const f = forecasts[0];
    const row = page
      .getByTestId("forecast-row")
      .filter({ hasText: f.material_name });

    const available = Number(f.forecast_available);
    const availableStr =
      available % 1 === 0 ? String(available) : available.toFixed(2);
    await expect(row.getByTestId("forecast-available")).toContainText(
      availableStr
    );
    await expect(row.getByTestId("forecast-pending")).toBeVisible();
  });

  test("RUN-FCST-9: Empty forecast table shows placeholder when no materials exist", async ({
    page,
  }) => {
    await goToRun(page, emptyRunId);

    await expect(page.getByTestId("forecast-empty")).toBeVisible();
  });
});

// ─── RunEquipmentTable ───────────────────────────────────────────────────────

test.describe("RunEquipmentTable", () => {
  test("RUN-EQP-1: Equipment and Availability section heading is displayed", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    await expect(page.getByTestId("run-equipment-heading")).toBeVisible();
    await expect(page.getByTestId("run-equipment-heading")).toHaveText(
      "Equipment and Availability"
    );
  });

  test("RUN-EQP-2: Table displays Equipment, Status, and Notes column headers", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const table = page.getByTestId("run-equipment-table");
    await expect(table).toBeVisible();

    const headers = table.locator("thead th");
    await expect(headers.nth(0)).toHaveText("Equipment");
    await expect(headers.nth(1)).toHaveText("Status");
    await expect(headers.nth(2)).toHaveText("Notes");
  });

  test("RUN-EQP-3: Table rows display equipment data for the run", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const equipment = scheduledRunDetail.equipment;
    if (equipment.length === 0) {
      test.skip();
      return;
    }

    for (const eq of equipment) {
      const row = page
        .getByTestId("run-equipment-row")
        .filter({ hasText: eq.equipment_name });
      await expect(row).toBeVisible();
      await expect(row.getByTestId("equipment-name")).toHaveText(
        eq.equipment_name
      );
      await expect(row.getByTestId("equipment-status")).toHaveText(eq.status);
    }
  });

  test("RUN-EQP-4: Equipment status reflects current availability from the equipment system", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const equipment = scheduledRunDetail.equipment;
    const availableEq = equipment.find(
      (e: { status: string }) => e.status === "Available"
    );
    if (!availableEq) {
      // Just verify any equipment status is displayed
      if (equipment.length > 0) {
        const row = page
          .getByTestId("run-equipment-row")
          .filter({ hasText: equipment[0].equipment_name });
        await expect(row.getByTestId("equipment-status")).toBeVisible();
      } else {
        test.skip();
      }
      return;
    }

    const row = page
      .getByTestId("run-equipment-row")
      .filter({ hasText: availableEq.equipment_name });
    await expect(row.getByTestId("equipment-status")).toHaveText("Available");
  });

  test("RUN-EQP-5: Equipment with maintenance shows maintenance details in Status and Notes", async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const equipment = scheduledRunDetail.equipment;
    const maintenanceEq = equipment.find((e: { status: string }) =>
      e.status.toLowerCase().includes("maintenance")
    );
    if (!maintenanceEq) {
      // Just verify equipment rows display status and notes
      if (equipment.length > 0) {
        const row = page
          .getByTestId("run-equipment-row")
          .filter({ hasText: equipment[0].equipment_name });
        await expect(row.getByTestId("equipment-status")).toBeVisible();
        await expect(row.getByTestId("equipment-notes")).toBeVisible();
      } else {
        test.skip();
      }
      return;
    }

    const row = page
      .getByTestId("run-equipment-row")
      .filter({ hasText: maintenanceEq.equipment_name });
    await expect(row.getByTestId("equipment-status")).toContainText(
      "Maintenance"
    );
    await expect(row.getByTestId("equipment-notes")).toContainText(
      maintenanceEq.notes
    );
  });

  test("RUN-EQP-6: Empty equipment table shows placeholder when run requires no equipment", async ({
    page,
  }) => {
    await goToRun(page, emptyRunId);

    await expect(page.getByTestId("run-equipment-empty")).toBeVisible();
  });
});

// ─── ExternalAppLinks ────────────────────────────────────────────────────────

test.describe("ExternalAppLinks", () => {
  test('RUN-EXT-1: "View in Inventory App" link is displayed', async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const link = page.getByTestId("inventory-app-link");
    await expect(link).toBeVisible();
    await expect(link).toHaveText("View in Inventory App");
  });

  test('RUN-EXT-2: "View in Delivery App" link is displayed', async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const link = page.getByTestId("delivery-app-link");
    await expect(link).toBeVisible();
    await expect(link).toHaveText("View in Delivery App");

    // Verify vertical divider between links
    const container = page.getByTestId("external-app-links");
    await expect(container.locator(".external-links-divider")).toBeVisible();
  });

  test('RUN-EXT-3: "View in Inventory App" link opens the external inventory app', async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const link = page.getByTestId("inventory-app-link");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute(
      "href",
      `/inventory?run=${scheduledRunId}`
    );
  });

  test('RUN-EXT-4: "View in Delivery App" link opens the external delivery app', async ({
    page,
  }) => {
    await goToRun(page, scheduledRunId);

    const link = page.getByTestId("delivery-app-link");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute(
      "href",
      `/deliveries?run=${scheduledRunId}`
    );
  });
});
