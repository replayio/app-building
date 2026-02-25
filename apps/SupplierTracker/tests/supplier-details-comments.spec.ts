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
  await expect(page.getByTestId("comments-section")).toBeVisible({ timeout: 30000 });
}

test.describe("SupplierDetailsPage - CommentsSection", () => {
  test("Display Comments Header with Count", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const header = page.getByTestId("comments-header");
    await expect(header).toBeVisible();

    // Header should show "Comments (N)" with a count
    const title = page.getByTestId("comments-title");
    await expect(title).toBeVisible();
    await expect(title).toContainText("Comments (");

    // Collapse/expand toggle icon should be present
    const toggle = page.getByTestId("comments-toggle");
    await expect(toggle).toBeVisible();
  });

  test("Display Comment List with Timestamps and Authors", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const commentsList = page.getByTestId("comments-list");
    await expect(commentsList).toBeVisible({ timeout: 30000 });

    // Should have at least 3 comments
    const commentItems = page.getByTestId("comment-item");
    const count = await commentItems.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Each comment shows date, text, and author in format: "MM/DD/YYYY - text - Author"
    // Verify the comments contain expected content
    await expect(commentsList).toContainText("Discussed Q4 shipment projections");
    await expect(commentsList).toContainText("Sarah L.");
    await expect(commentsList).toContainText("Payment terms updated to net 60 days");
    await expect(commentsList).toContainText("Michael B.");
    await expect(commentsList).toContainText("Initial onboarding meeting completed");
    await expect(commentsList).toContainText("David K.");
  });

  test("Add Comment via Input Field", async ({ page }) => {
    test.slow();

    await navigateToFirstSupplier(page);

    const commentsList = page.getByTestId("comments-list");
    await expect(commentsList).toBeVisible({ timeout: 30000 });

    // Get initial comment count from header
    const title = page.getByTestId("comments-title");
    const titleText = await title.textContent();
    const initialCountMatch = titleText?.match(/Comments \((\d+)\)/);
    const initialCount = initialCountMatch ? parseInt(initialCountMatch[1], 10) : 0;

    // Click on the input and type a comment
    const commentInput = page.getByTestId("comment-input");
    await expect(commentInput).toBeVisible();
    await expect(commentInput).toHaveAttribute("placeholder", "Add a note about this supplier...");

    await commentInput.fill("Reviewed annual pricing terms.");

    // Submit the comment by clicking the submit button
    await page.getByTestId("comment-submit-btn").click();

    // New comment should appear at the top of the list
    await expect(
      page.getByTestId("comment-item").first()
    ).toContainText("Reviewed annual pricing terms.", { timeout: 30000 });

    // Comment count should increment
    await expect(title).toContainText(`Comments (${initialCount + 1})`, { timeout: 30000 });

    // Input field should be cleared
    await expect(commentInput).toHaveValue("");
  });

  test("Add Comment Persists After Reload", async ({ page }) => {
    test.slow();

    await navigateToFirstSupplier(page);

    const commentsList = page.getByTestId("comments-list");
    await expect(commentsList).toBeVisible({ timeout: 30000 });

    // Add a unique comment
    const uniqueText = `Persistence test comment ${Date.now()}`;
    const commentInput = page.getByTestId("comment-input");
    await commentInput.fill(uniqueText);
    await page.getByTestId("comment-submit-btn").click();

    // Wait for the comment to appear
    await expect(
      page.getByTestId("comment-item").filter({ hasText: uniqueText })
    ).toBeVisible({ timeout: 30000 });

    // Navigate away from the page
    await page.getByTestId("back-to-dashboard-btn").click();
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });

    // Navigate back by clicking the same supplier card
    const firstCard = page.locator("[data-testid^='supplier-card-']").first();
    await expect(firstCard).toBeVisible({ timeout: 30000 });
    await firstCard.click();

    await expect(page.getByTestId("supplier-details-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("comments-list")).toBeVisible({ timeout: 30000 });

    // The comment should still be present
    await expect(
      page.getByTestId("comment-item").filter({ hasText: uniqueText })
    ).toBeVisible({ timeout: 30000 });
  });

  test("Collapse and Expand Comments Section", async ({ page }) => {
    await navigateToFirstSupplier(page);

    // Comments body should initially be visible (expanded)
    const commentsBody = page.getByTestId("comments-body");
    await expect(commentsBody).toBeVisible({ timeout: 30000 });

    // Click the collapse toggle
    const toggle = page.getByTestId("comments-toggle");
    await toggle.click();

    // Comments body (list + input) should be hidden
    await expect(commentsBody).toBeHidden({ timeout: 5000 });

    // Click toggle again to expand
    await toggle.click();

    // Comments body should be visible again
    await expect(commentsBody).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("comment-input")).toBeVisible();
    await expect(page.getByTestId("comments-list")).toBeVisible();
  });

  test("Empty Comment Validation", async ({ page }) => {
    await navigateToFirstSupplier(page);

    await expect(page.getByTestId("comments-list")).toBeVisible({ timeout: 30000 });

    // Get initial comment count from header
    const title = page.getByTestId("comments-title");
    const titleText = await title.textContent();

    // Try to submit with empty input by pressing Enter
    const commentInput = page.getByTestId("comment-input");
    await expect(commentInput).toBeVisible();
    await commentInput.focus();
    await page.keyboard.press("Enter");

    // Count should not change
    await expect(title).toHaveText(titleText ?? "", { timeout: 5000 });

    // Also try clicking submit with empty input - button should be disabled
    const submitBtn = page.getByTestId("comment-submit-btn");
    await expect(submitBtn).toBeDisabled();
  });
});
