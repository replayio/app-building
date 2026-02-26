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
  await expect(page.getByTestId("documents-tab")).toBeVisible({ timeout: 30000 });
}

test.describe("SupplierDetailsPage - DocumentsTab", () => {
  test("Display Document Cards with Details", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const docsList = page.getByTestId("documents-list");
    await expect(docsList).toBeVisible({ timeout: 30000 });

    // Each document card should show file name, type, upload date, and action icons
    const firstCard = page.getByTestId("document-card").first();
    await expect(firstCard).toBeVisible();

    // File name (bold) should be visible
    await expect(firstCard.getByTestId("document-name")).toBeVisible();
    await expect(firstCard.getByTestId("document-name")).not.toBeEmpty();

    // Type label and value
    await expect(firstCard.getByTestId("document-type")).toBeVisible();
    await expect(firstCard).toContainText("Type:");

    // Upload date label and value
    await expect(firstCard.getByTestId("document-date")).toBeVisible();
    await expect(firstCard).toContainText("Upload Date:");

    // Action icons should be present
    await expect(firstCard.getByTestId("document-view-btn")).toBeVisible();
    await expect(firstCard.getByTestId("document-download-btn")).toBeVisible();
  });

  test("Display Multiple Document Cards", async ({ page }) => {
    await navigateToFirstSupplier(page);

    const docsList = page.getByTestId("documents-list");
    await expect(docsList).toBeVisible({ timeout: 30000 });

    // Should have at least 3 documents
    await expect(page.getByTestId("document-card")).toHaveCount(3, { timeout: 15000 });

    // Verify specific documents by name
    await expect(
      page.getByTestId("document-card").filter({ hasText: "Service Agreement 2024.pdf" })
    ).toBeVisible();
    await expect(
      page.getByTestId("document-card").filter({ hasText: "ISO 9001 Certification.pdf" })
    ).toBeVisible();
    await expect(
      page.getByTestId("document-card").filter({ hasText: "Non-Disclosure Agreement.docx" })
    ).toBeVisible();

    // Verify types
    const serviceCard = page.getByTestId("document-card").filter({ hasText: "Service Agreement 2024.pdf" });
    await expect(serviceCard.getByTestId("document-type")).toContainText("Contract");

    const isoCard = page.getByTestId("document-card").filter({ hasText: "ISO 9001 Certification.pdf" });
    await expect(isoCard.getByTestId("document-type")).toContainText("Certification");

    const ndaCard = page.getByTestId("document-card").filter({ hasText: "Non-Disclosure Agreement.docx" });
    await expect(ndaCard.getByTestId("document-type")).toContainText("Agreement");
  });

  test("Search Documents by Name", async ({ page }) => {
    await navigateToFirstSupplier(page);

    await expect(page.getByTestId("documents-list")).toBeVisible({ timeout: 30000 });

    // Type "ISO" in the search field
    const searchInput = page.getByTestId("documents-search");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("ISO");

    // Only "ISO 9001 Certification.pdf" should be visible
    await expect(
      page.getByTestId("document-card").filter({ hasText: "ISO 9001 Certification.pdf" })
    ).toBeVisible({ timeout: 15000 });

    // Other documents should be hidden
    await expect(
      page.getByTestId("document-card").filter({ hasText: "Service Agreement 2024.pdf" })
    ).toHaveCount(0, { timeout: 15000 });

    await expect(
      page.getByTestId("document-card").filter({ hasText: "Non-Disclosure Agreement.docx" })
    ).toHaveCount(0, { timeout: 15000 });
  });

  test("Search Documents Clears Results", async ({ page }) => {
    await navigateToFirstSupplier(page);

    await expect(page.getByTestId("documents-list")).toBeVisible({ timeout: 30000 });

    const searchInput = page.getByTestId("documents-search");
    await searchInput.fill("ISO");

    // Only ISO document visible
    await expect(page.getByTestId("document-card")).toHaveCount(1, { timeout: 15000 });

    // Clear the search
    await searchInput.clear();

    // All documents should reappear
    await expect(page.getByTestId("document-card")).toHaveCount(3, { timeout: 15000 });
  });

  test("Upload Document Button Opens Upload Dialog", async ({ page }) => {
    test.slow();

    await navigateToFirstSupplier(page);

    await expect(page.getByTestId("documents-tab")).toBeVisible({ timeout: 30000 });

    // Click Upload Document button - this triggers a hidden file input
    const uploadBtn = page.getByTestId("upload-document-btn");
    await expect(uploadBtn).toBeVisible();
    await expect(uploadBtn).toContainText("Upload Document");

    // Set up file chooser before clicking
    const fileInput = page.getByTestId("documents-file-input");

    // Use setInputFiles to simulate file selection
    await fileInput.setInputFiles({
      name: "test-upload.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("test file content"),
    });

    // Upload dialog modal should appear
    const modal = page.getByTestId("upload-document-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.locator(".modal-title")).toHaveText("Upload Document");

    // Verify the file name is shown
    await expect(modal).toContainText("test-upload.pdf");

    // Verify document type selector is present
    await expect(page.getByTestId("upload-document-type")).toBeVisible();

    // Select a document type
    await page.getByTestId("upload-document-type").click();
    await expect(page.getByTestId("upload-document-type-dropdown")).toBeVisible();
    await page.getByTestId("upload-document-type-option-certification").click();

    // Confirm upload
    await page.getByTestId("upload-document-confirm").click();

    // Modal should close
    await expect(modal).toBeHidden({ timeout: 30000 });

    // New document should appear in the list
    await expect(
      page.getByTestId("document-card").filter({ hasText: "test-upload.pdf" })
    ).toBeVisible({ timeout: 30000 });
  });

  test("Upload Document Dialog Cancel Does Not Upload", async ({ page }) => {
    await navigateToFirstSupplier(page);

    await expect(page.getByTestId("documents-tab")).toBeVisible({ timeout: 30000 });

    // Count initial documents
    const initialCount = await page.getByTestId("document-card").count();

    // Set file via hidden file input to trigger the upload dialog
    const fileInput = page.getByTestId("documents-file-input");
    await fileInput.setInputFiles({
      name: "test-cancel-upload.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("test file content for cancel"),
    });

    // Upload dialog should appear
    const modal = page.getByTestId("upload-document-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Click Cancel
    await page.getByTestId("upload-document-cancel").click();

    // Modal should close
    await expect(modal).toBeHidden({ timeout: 5000 });

    // Document count should remain the same
    await expect(page.getByTestId("document-card")).toHaveCount(initialCount);

    // The cancelled file should not appear in the list
    await expect(
      page.getByTestId("document-card").filter({ hasText: "test-cancel-upload.pdf" })
    ).toHaveCount(0);
  });

  test("View Document Action", async ({ page }) => {
    await navigateToFirstSupplier(page);

    await expect(page.getByTestId("documents-list")).toBeVisible({ timeout: 30000 });

    // Find "Service Agreement 2024.pdf" card
    const docCard = page.getByTestId("document-card").filter({ hasText: "Service Agreement 2024.pdf" });
    await expect(docCard).toBeVisible();

    // Click the view (eye) icon button
    const viewBtn = docCard.getByTestId("document-view-btn");
    await expect(viewBtn).toBeVisible();

    // Set up listener for new tab before clicking
    const popupPromise = page.waitForEvent("popup");
    await viewBtn.click();

    // Should open in a new tab
    const newTab = await popupPromise;
    expect(newTab).toBeTruthy();
    await newTab.close();
  });

  test("Download Document Action", async ({ page }) => {
    await navigateToFirstSupplier(page);

    await expect(page.getByTestId("documents-list")).toBeVisible({ timeout: 30000 });

    // Find "Service Agreement 2024.pdf" card
    const docCard = page.getByTestId("document-card").filter({ hasText: "Service Agreement 2024.pdf" });
    await expect(docCard).toBeVisible();

    // Click the download icon button
    const downloadBtn = docCard.getByTestId("document-download-btn");
    await expect(downloadBtn).toBeVisible();

    // Set up listener for download before clicking
    const downloadPromise = page.waitForEvent("download");
    await downloadBtn.click();

    // Should trigger a download
    const download = await downloadPromise;
    expect(download).toBeTruthy();
  });
});
