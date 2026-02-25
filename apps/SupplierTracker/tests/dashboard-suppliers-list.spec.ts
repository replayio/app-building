import { test, expect } from "@playwright/test";

test.describe("DashboardPage - SuppliersList", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("suppliers-list")).toBeVisible({ timeout: 30000 });
  });

  test("Display Suppliers List Heading", async ({ page }) => {
    const heading = page.getByTestId("suppliers-list-heading");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("Suppliers List");
  });

  test("Display Supplier Cards in Grid Layout", async ({ page }) => {
    const grid = page.getByTestId("suppliers-grid");
    await expect(grid).toBeVisible({ timeout: 30000 });

    // Verify grid layout exists and has supplier cards
    const cards = page.locator("[data-testid^='supplier-card-']");
    // There should be at least 8 supplier cards from seed data
    // (8 original + Techcom + Acme = 10 total)
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(8);

    // Verify grid CSS class for layout
    await expect(grid).toHaveClass(/suppliers-grid/);
  });

  test("Supplier Card Displays Supplier Name", async ({ page }) => {
    const grid = page.getByTestId("suppliers-grid");
    await expect(grid).toBeVisible({ timeout: 30000 });

    // Find the card with "Apex Logistics" text
    const apexCard = page.locator("[data-testid^='supplier-card-']").filter({ hasText: "Apex Logistics" }).first();
    await expect(apexCard).toBeVisible();

    // Verify the name is displayed in bold text at the top
    const nameEl = apexCard.locator("[data-testid^='supplier-name-']");
    await expect(nameEl).toBeVisible();
    await expect(nameEl).toContainText("Apex Logistics");
    await expect(nameEl).toHaveClass(/supplier-card-name/);
  });

  test("Supplier Card Displays Status Badge", async ({ page }) => {
    const grid = page.getByTestId("suppliers-grid");
    await expect(grid).toBeVisible({ timeout: 30000 });

    // Find an "Apex Logistics" card (Active status)
    const apexCard = page.locator("[data-testid^='supplier-card-']").filter({ hasText: "Apex Logistics" }).first();
    await expect(apexCard).toBeVisible();

    // Verify status badge shows "Active" with green background class
    const statusBadge = apexCard.locator("[data-testid^='supplier-status-']");
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toHaveText("Active");
    await expect(statusBadge).toHaveClass(/badge--active/);
  });

  test("Supplier Card Displays Contact Name", async ({ page }) => {
    const grid = page.getByTestId("suppliers-grid");
    await expect(grid).toBeVisible({ timeout: 30000 });

    // Find a card that has "John Smith" as contact
    const card = page.locator("[data-testid^='supplier-card-']").filter({ hasText: "John Smith" }).first();
    await expect(card).toBeVisible();

    const contactEl = card.locator("[data-testid^='supplier-contact-']");
    await expect(contactEl).toBeVisible();
    await expect(contactEl).toContainText("John Smith");
  });

  test("Supplier Card Displays Contact Email", async ({ page }) => {
    const grid = page.getByTestId("suppliers-grid");
    await expect(grid).toBeVisible({ timeout: 30000 });

    // Find a card that has the expected email
    const card = page.locator("[data-testid^='supplier-card-']").filter({ hasText: "jane.doe@example.com" }).first();
    await expect(card).toBeVisible();

    const emailEl = card.locator("[data-testid^='supplier-email-']");
    await expect(emailEl).toBeVisible();
    await expect(emailEl).toContainText("jane.doe@example.com");
  });

  test("Supplier Card Displays Orders Summary", async ({ page }) => {
    const grid = page.getByTestId("suppliers-grid");
    await expect(grid).toBeVisible({ timeout: 30000 });

    // Find the first Apex Logistics card which has open orders (Pending, In Transit, Processing)
    const apexCard = page.locator("[data-testid^='supplier-card-']").filter({ hasText: "Apex Logistics" }).first();
    await expect(apexCard).toBeVisible();

    const ordersEl = apexCard.locator("[data-testid^='supplier-orders-']");
    await expect(ordersEl).toBeVisible();
    // Verify the summary contains "Open Orders" and "Value" text
    await expect(ordersEl).toContainText("Open Orders");
    await expect(ordersEl).toContainText("Value");
  });

  test("Supplier Card Shows All Fields Together", async ({ page }) => {
    const grid = page.getByTestId("suppliers-grid");
    await expect(grid).toBeVisible({ timeout: 30000 });

    // Find Global Sourcing Inc. card
    const card = page.locator("[data-testid^='supplier-card-']").filter({ hasText: "Global Sourcing Inc." });
    await expect(card).toBeVisible();

    // Verify name (bold, top-left)
    const nameEl = card.locator("[data-testid^='supplier-name-']");
    await expect(nameEl).toContainText("Global Sourcing Inc.");

    // Verify "On Hold" badge (yellow/amber, top-right)
    const statusBadge = card.locator("[data-testid^='supplier-status-']");
    await expect(statusBadge).toHaveText("On Hold");
    await expect(statusBadge).toHaveClass(/badge--on-hold/);

    // Verify contact name
    const contactEl = card.locator("[data-testid^='supplier-contact-']");
    await expect(contactEl).toContainText("John Smith");

    // Verify email
    const emailEl = card.locator("[data-testid^='supplier-email-']");
    await expect(emailEl).toContainText("jane.doe@example.com");

    // Verify orders summary
    const ordersEl = card.locator("[data-testid^='supplier-orders-']");
    await expect(ordersEl).toContainText("Open Orders");
    await expect(ordersEl).toContainText("Value");
  });

  test("Clicking Supplier Card Navigates to Supplier Details", async ({ page }) => {
    const grid = page.getByTestId("suppliers-grid");
    await expect(grid).toBeVisible({ timeout: 30000 });

    // Find an Apex Logistics card and get its ID from the testid
    const apexCard = page.locator("[data-testid^='supplier-card-']").filter({ hasText: "Apex Logistics" }).first();
    await expect(apexCard).toBeVisible();

    // Extract the supplier ID from the data-testid attribute
    const testId = await apexCard.getAttribute("data-testid");
    const supplierId = testId?.replace("supplier-card-", "");
    expect(supplierId).toBeTruthy();

    // Click the card
    await apexCard.click();

    // Verify navigation to the supplier details page
    await expect(page).toHaveURL(new RegExp(`/suppliers/${supplierId}`), { timeout: 30000 });
  });

  test("Multiple Supplier Cards Displayed", async ({ page }) => {
    const grid = page.getByTestId("suppliers-grid");
    await expect(grid).toBeVisible({ timeout: 30000 });

    // Verify all 8 suppliers from the seed are displayed (plus Techcom + Acme = 10)
    // Check for specific supplier names
    await expect(
      page.locator("[data-testid^='supplier-card-']").filter({ hasText: "Apex Logistics" })
    ).toHaveCount(2, { timeout: 15000 });

    await expect(
      page.locator("[data-testid^='supplier-card-']").filter({ hasText: "Global Sourcing Inc." })
    ).toHaveCount(1, { timeout: 15000 });

    await expect(
      page.locator("[data-testid^='supplier-card-']").filter({ hasText: "Binmant Inc." })
    ).toHaveCount(1, { timeout: 15000 });

    await expect(
      page.locator("[data-testid^='supplier-card-']").filter({ hasText: "Minmer Logistics" })
    ).toHaveCount(1, { timeout: 15000 });

    await expect(
      page.locator("[data-testid^='supplier-card-']").filter({ hasText: "Charralets Inc." })
    ).toHaveCount(1, { timeout: 15000 });

    await expect(
      page.locator("[data-testid^='supplier-card-']").filter({ hasText: "Merianastillers Inc." })
    ).toHaveCount(1, { timeout: 15000 });

    await expect(
      page.locator("[data-testid^='supplier-card-']").filter({ hasText: "Peaor Logistics" })
    ).toHaveCount(1, { timeout: 15000 });

    // Verify at least 8 total cards
    const totalCards = await page.locator("[data-testid^='supplier-card-']").count();
    expect(totalCards).toBeGreaterThanOrEqual(8);
  });

  test("Empty State When No Suppliers Exist", async ({ page }) => {
    // Intercept the suppliers API to return an empty array, then reload
    await page.route("**/.netlify/functions/suppliers", async (route) => {
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
    await expect(page.getByTestId("suppliers-list-empty")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("suppliers-list-empty")).toContainText(
      "No suppliers found. Click 'Add New Supplier' to get started."
    );
  });
});
