import { test, expect } from "@playwright/test";

/**
 * Navigate to the first supplier's detail page by clicking the first supplier card.
 * Returns the supplier ID extracted from the URL.
 */
async function navigateToFirstSupplier(page: import("@playwright/test").Page): Promise<string> {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("suppliers-grid")).toBeVisible({ timeout: 30000 });

  const firstCard = page.locator("[data-testid^='supplier-card-']").first();
  await expect(firstCard).toBeVisible({ timeout: 30000 });

  const testId = await firstCard.getAttribute("data-testid");
  const supplierId = testId?.replace("supplier-card-", "") ?? "";
  expect(supplierId).toBeTruthy();

  await firstCard.click();
  await expect(page).toHaveURL(new RegExp(`/suppliers/${supplierId}`), { timeout: 30000 });
  await expect(page.getByTestId("supplier-details-page")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("supplier-overview")).toBeVisible({ timeout: 30000 });

  return supplierId;
}

test.describe("SupplierDetailsPage - SupplierOverview", () => {
  test("Display Supplier Name", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const overview = page.getByTestId("supplier-overview");
    await expect(overview).toContainText("Supplier Overview");

    const nameField = page.getByTestId("supplier-field-name");
    await expect(nameField).toBeVisible();
    await expect(nameField.locator(".detail-field-label")).toHaveText("Supplier Name");
    await expect(nameField.locator(".detail-field-value")).not.toBeEmpty();
  });

  test("Display Supplier Address", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const addressField = page.getByTestId("supplier-field-address");
    await expect(addressField).toBeVisible();
    await expect(addressField.locator(".detail-field-label")).toHaveText("Address");
    await expect(addressField.locator(".detail-field-value")).not.toBeEmpty();
  });

  test("Display Contact Information", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const contactField = page.getByTestId("supplier-field-contact");
    await expect(contactField).toBeVisible();
    await expect(contactField.locator(".detail-field-label")).toHaveText("Contact");
    // Contact field should show contact name, phone, and email
    const contactValue = contactField.locator(".detail-field-value");
    await expect(contactValue).not.toBeEmpty();
  });

  test("Display Supplier Description", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const descField = page.getByTestId("supplier-field-description");
    await expect(descField).toBeVisible();
    await expect(descField.locator(".detail-field-label")).toHaveText("Description");
    await expect(descField.locator(".detail-field-value")).not.toBeEmpty();
  });

  test("Display Status Badge", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const statusBadge = page.getByTestId("supplier-status-badge");
    await expect(statusBadge).toBeVisible();
    // Should show "Status: <status>" text
    await expect(statusBadge).toContainText("Status:");
    // Should have a colored dot indicator
    await expect(statusBadge.locator(".status-dot")).toBeVisible();
  });

  test("Back to Dashboard Button Navigates to Dashboard", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const backBtn = page.getByTestId("back-to-dashboard-btn");
    await expect(backBtn).toBeVisible();
    await expect(backBtn).toContainText("Back to Dashboard");

    await backBtn.click();

    // Should navigate to the dashboard
    await expect(page).toHaveURL("/", { timeout: 30000 });
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });
  });

  test("Edit Supplier Opens Edit Dialog", async ({ page }) => {
    test.slow();

    await navigateToFirstSupplier(page);

    // Read current phone value from contact field
    const contactField = page.getByTestId("supplier-field-contact");
    await expect(contactField).toBeVisible();

    // Click Edit button
    const editBtn = page.getByTestId("supplier-edit-btn");
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Edit modal should appear
    const modal = page.getByTestId("edit-supplier-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.locator(".modal-title")).toHaveText("Edit Supplier");

    // All fields should be pre-filled
    await expect(page.getByTestId("edit-supplier-form-name")).not.toHaveValue("");
    await expect(page.getByTestId("edit-supplier-form-phone")).toBeVisible();
    await expect(page.getByTestId("edit-supplier-form-email")).toBeVisible();
    await expect(page.getByTestId("edit-supplier-form-contact-name")).toBeVisible();
    await expect(page.getByTestId("edit-supplier-form-address")).toBeVisible();
    await expect(page.getByTestId("edit-supplier-form-description")).toBeVisible();
    await expect(page.getByTestId("edit-supplier-form-status")).toBeVisible();

    // Change the phone number
    const phoneInput = page.getByTestId("edit-supplier-form-phone");
    await phoneInput.clear();
    await phoneInput.fill("(555) 999-0000");

    // Click Save
    await page.getByTestId("edit-supplier-save").click();

    // Modal should close
    await expect(modal).toBeHidden({ timeout: 30000 });

    // Verify updated phone number is reflected in the overview
    await expect(contactField).toContainText("(555) 999-0000", { timeout: 30000 });
  });

  test("Delete Supplier with Confirmation", async ({ page }) => {
    test.slow();

    // First create a supplier to delete so we don't remove seed data
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });

    // Create a new supplier via the quick action
    await page.getByTestId("quick-action-add-supplier").click();
    await expect(page.getByTestId("add-supplier-modal")).toBeVisible({ timeout: 5000 });

    const uniqueName = `Delete Test Supplier ${Date.now()}`;
    await page.getByTestId("supplier-form-name").fill(uniqueName);
    await page.getByTestId("supplier-form-address").fill("123 Test St");
    await page.getByTestId("supplier-form-contact-name").fill("Test Contact");
    await page.getByTestId("supplier-form-phone").fill("(555) 000-0000");
    await page.getByTestId("supplier-form-email").fill("test@delete.com");
    await page.getByTestId("supplier-form-description").fill("Test supplier for deletion");
    await page.getByTestId("add-supplier-save").click();
    await expect(page.getByTestId("add-supplier-modal")).toBeHidden({ timeout: 30000 });

    // Find the newly created supplier card and navigate to it
    const newCard = page.locator("[data-testid^='supplier-card-']").filter({ hasText: uniqueName });
    await expect(newCard).toBeVisible({ timeout: 30000 });
    await newCard.click();

    // Wait for supplier details page
    await expect(page.getByTestId("supplier-details-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("supplier-overview")).toBeVisible({ timeout: 30000 });

    // Click Delete button
    const deleteBtn = page.getByTestId("supplier-delete-btn");
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Confirmation dialog should appear
    const confirmDialog = page.getByTestId("confirm-dialog");
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await expect(confirmDialog).toContainText("Are you sure you want to delete this supplier?");
    await expect(confirmDialog).toContainText("This action cannot be undone.");

    // Confirm deletion
    await page.getByTestId("confirm-dialog-confirm").click();

    // Should navigate to dashboard
    await expect(page).toHaveURL("/", { timeout: 30000 });
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });

    // The deleted supplier should no longer appear
    await expect(
      page.locator("[data-testid^='supplier-card-']").filter({ hasText: uniqueName })
    ).toHaveCount(0, { timeout: 15000 });
  });
});
