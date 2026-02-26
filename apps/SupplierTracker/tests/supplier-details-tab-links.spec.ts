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
  await expect(page.getByTestId("supplier-overview")).toBeVisible({ timeout: 30000 });
}

test.describe("SupplierDetailsPage - SectionTabLinks", () => {
  test("Display Section Tab Links", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const tabs = page.getByTestId("supplier-detail-tabs");
    await expect(tabs).toBeVisible();

    await expect(page.getByTestId("tab-documents")).toBeVisible();
    await expect(page.getByTestId("tab-documents")).toHaveText("Documents");

    await expect(page.getByTestId("tab-comments")).toBeVisible();
    await expect(page.getByTestId("tab-comments")).toHaveText("Comments");

    await expect(page.getByTestId("tab-orders")).toBeVisible();
    await expect(page.getByTestId("tab-orders")).toHaveText("Orders");
  });

  test("Click Documents Tab Scrolls to Documents Section", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const documentsSection = page.getByTestId("documents-section");
    await expect(documentsSection).toBeVisible({ timeout: 10000 });

    await page.getByTestId("tab-documents").click();

    // Verify the documents section is in the viewport after scrolling
    await expect(documentsSection).toBeInViewport({ timeout: 5000 });
  });

  test("Click Comments Tab Scrolls to Comments Section", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const commentsSection = page.getByTestId("comments-section-card");
    await expect(commentsSection).toBeVisible({ timeout: 10000 });

    await page.getByTestId("tab-comments").click();

    // Verify the comments section is in the viewport after scrolling
    await expect(commentsSection).toBeInViewport({ timeout: 5000 });
  });

  test("Click Orders Tab Scrolls to Orders Section", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const ordersSection = page.getByTestId("orders-section-card");
    await expect(ordersSection).toBeVisible({ timeout: 10000 });

    await page.getByTestId("tab-orders").click();

    // Verify the orders section is in the viewport after scrolling
    await expect(ordersSection).toBeInViewport({ timeout: 5000 });
  });
});
