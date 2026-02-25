import { test, expect } from "@playwright/test";

test("deployment: app displays data and supports updates", async ({ page }) => {
  // 1. Navigate to the dashboard and verify it loads
  await page.goto("/", { waitUntil: "networkidle" });

  // Verify the dashboard page is visible
  await expect(page.getByTestId("dashboard-page")).toBeVisible();

  // 2. Verify suppliers list section renders (may be empty or populated)
  await expect(page.getByTestId("suppliers-list")).toBeVisible();

  // 3. Verify upcoming orders section renders (may be empty or populated)
  await expect(page.getByTestId("upcoming-orders")).toBeVisible();

  // 4. Verify quick actions are available
  await expect(page.getByTestId("quick-action-add-supplier")).toBeVisible();
  await expect(page.getByTestId("quick-action-create-order")).toBeVisible();

  // 5. Perform a write operation: add a new supplier
  await page.getByTestId("quick-action-add-supplier").click();

  // Wait for the modal to appear
  await expect(page.getByTestId("add-supplier-modal")).toBeVisible();

  // Fill in the supplier form
  const timestamp = Date.now();
  const supplierName = `Deploy Test ${timestamp}`;

  await page.getByTestId("supplier-form-name").fill(supplierName);
  await page.getByTestId("supplier-form-address").fill("123 Test Street");
  await page.getByTestId("supplier-form-contact-name").fill("Test Contact");
  await page.getByTestId("supplier-form-email").fill(`test-${timestamp}@example.com`);
  await page.getByTestId("supplier-form-phone").fill("555-0100");

  // Submit the form
  await page.getByTestId("add-supplier-save").click();

  // Wait for the modal to close
  await expect(page.getByTestId("add-supplier-modal")).not.toBeVisible({ timeout: 15000 });

  // Verify the new supplier appears in the suppliers list
  await expect(page.getByText(supplierName)).toBeVisible({ timeout: 15000 });
});
