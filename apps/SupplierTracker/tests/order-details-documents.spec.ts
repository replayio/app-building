import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

/**
 * Navigate to the first order's detail page by clicking an order ID link
 * from the dashboard's UpcomingOrdersTable.
 */
async function navigateToFirstOrder(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("upcoming-orders")).toBeVisible({ timeout: 30000 });

  const firstLink = page.locator("[data-testid^='order-link-']").first();
  await expect(firstLink).toBeVisible({ timeout: 30000 });

  await firstLink.click();
  await expect(page.getByTestId("order-details-page")).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId("order-documents")).toBeVisible({ timeout: 30000 });
}

test.describe("OrderDetailsPage - OrderDocuments", () => {
  test("Display Document List", async ({ page }) => {
    await navigateToFirstOrder(page);

    const section = page.getByTestId("order-documents");
    await expect(section).toBeVisible();
    await expect(section).toContainText("Documents");

    const docList = page.getByTestId("order-documents-list");
    await expect(docList).toBeVisible();

    // Each document should show file icon (svg), file name, type, and date
    const firstDoc = page.getByTestId("order-document-item").first();
    await expect(firstDoc).toBeVisible();
    await expect(firstDoc.locator("svg")).toBeVisible();
    await expect(firstDoc.getByTestId("order-document-name")).not.toBeEmpty();
    await expect(firstDoc.getByTestId("order-document-type")).not.toBeEmpty();
    await expect(firstDoc.getByTestId("order-document-date")).not.toBeEmpty();
  });

  test("Display Document Details", async ({ page }) => {
    await navigateToFirstOrder(page);

    // Find the first document and check all detail fields
    const firstDoc = page.getByTestId("order-document-item").first();
    await expect(firstDoc).toBeVisible();

    const docName = firstDoc.getByTestId("order-document-name");
    await expect(docName).toBeVisible();
    const nameText = await docName.textContent();
    // Document name should have a file extension
    expect(nameText).toMatch(/\.\w+$/);

    const docType = firstDoc.getByTestId("order-document-type");
    await expect(docType).toBeVisible();
    await expect(docType).not.toBeEmpty();

    const docDate = firstDoc.getByTestId("order-document-date");
    await expect(docDate).toBeVisible();
    // Date format: "MMM DD, YYYY"
    await expect(docDate).toHaveText(/[A-Z][a-z]{2} \d{1,2}, \d{4}/);
  });

  test("Display Multiple Documents", async ({ page }) => {
    await navigateToFirstOrder(page);

    const docItems = page.getByTestId("order-document-item");
    // Should display at least 3 documents based on seed data
    const count = await docItems.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Verify each has the required fields
    for (let i = 0; i < Math.min(count, 3); i++) {
      const doc = docItems.nth(i);
      await expect(doc.getByTestId("order-document-name")).not.toBeEmpty();
      await expect(doc.getByTestId("order-document-type")).not.toBeEmpty();
      await expect(doc.getByTestId("order-document-date")).not.toBeEmpty();
    }
  });

  test("View Button Opens Document", async ({ page, context }) => {
    await navigateToFirstOrder(page);

    const firstDoc = page.getByTestId("order-document-item").first();
    await expect(firstDoc).toBeVisible();

    const viewBtn = firstDoc.getByTestId("order-document-view-btn");
    await expect(viewBtn).toBeVisible();
    await expect(viewBtn).toContainText("View");

    // Listen for new page/tab opening
    const pagePromise = context.waitForEvent("page");
    await viewBtn.click();
    const newPage = await pagePromise;

    // The new tab should have navigated to a URL (the file_url)
    expect(newPage.url()).toBeTruthy();
    await newPage.close();
  });

  test("Download Button Downloads Document", async ({ page }) => {
    await navigateToFirstOrder(page);

    const firstDoc = page.getByTestId("order-document-item").first();
    await expect(firstDoc).toBeVisible();

    const downloadBtn = firstDoc.getByTestId("order-document-download-btn");
    await expect(downloadBtn).toBeVisible();

    // Listen for download event
    const downloadPromise = page.waitForEvent("download");
    await downloadBtn.click();
    const download = await downloadPromise;

    // Download should have a suggested filename
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test("Upload Document", async ({ page }) => {
    test.slow();

    await navigateToFirstOrder(page);

    // Count initial documents
    const initialCount = await page.getByTestId("order-document-item").count();

    // Count initial history entries
    const historySection = page.getByTestId("order-history");
    await expect(historySection).toBeVisible({ timeout: 30000 });
    const initialHistoryCount = await page.getByTestId("timeline-event").count();

    // Create a temporary test file
    const testFileName = `test-upload-${Date.now()}.pdf`;
    const testFilePath = path.join("/tmp", testFileName);
    fs.writeFileSync(testFilePath, "test file content for upload");

    // Click Upload Document triggers file input
    const fileInput = page.getByTestId("order-documents-file-input");

    // Set the file via the hidden file input
    await fileInput.setInputFiles(testFilePath);

    // Upload dialog should appear
    const uploadModal = page.getByTestId("upload-order-document-modal");
    await expect(uploadModal).toBeVisible({ timeout: 5000 });
    await expect(uploadModal.locator(".modal-title")).toHaveText("Upload Document");

    // File name should be shown in the dialog
    await expect(uploadModal).toContainText(testFileName);

    // Select a document type
    await page.getByTestId("upload-order-document-type").click();
    await expect(page.getByTestId("upload-order-document-type-dropdown")).toBeVisible();
    await page.getByTestId("upload-order-document-type-option-invoice").click();

    // Confirm upload
    await page.getByTestId("upload-order-document-confirm").click();

    // Modal should close
    await expect(uploadModal).toBeHidden({ timeout: 30000 });

    // New document should appear in the list
    await expect(page.getByTestId("order-document-item")).toHaveCount(initialCount + 1, { timeout: 30000 });

    // Verify the uploaded document details
    const newDoc = page.getByTestId("order-document-item").filter({ hasText: testFileName });
    await expect(newDoc).toBeVisible({ timeout: 30000 });
    await expect(newDoc.getByTestId("order-document-type")).toHaveText("Invoice");

    // History should have exactly one new entry for the upload
    await expect(page.getByTestId("timeline-event")).toHaveCount(initialHistoryCount + 1, { timeout: 30000 });
    await expect(
      page.getByTestId("timeline-event-description").filter({ hasText: /Document uploaded/ }).first()
    ).toBeVisible({ timeout: 30000 });

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test("Upload Document Dialog Cancel Does Not Upload", async ({ page }) => {
    await navigateToFirstOrder(page);

    // Count initial documents
    const initialCount = await page.getByTestId("order-document-item").count();

    // Create a temporary test file
    const testFileName = `test-cancel-${Date.now()}.pdf`;
    const testFilePath = path.join("/tmp", testFileName);
    fs.writeFileSync(testFilePath, "test file content for cancel");

    // Set the file via the hidden file input to trigger the upload dialog
    const fileInput = page.getByTestId("order-documents-file-input");
    await fileInput.setInputFiles(testFilePath);

    // Upload dialog should appear
    const uploadModal = page.getByTestId("upload-order-document-modal");
    await expect(uploadModal).toBeVisible({ timeout: 5000 });

    // Click Cancel
    await page.getByTestId("upload-order-document-cancel").click();

    // Modal should close
    await expect(uploadModal).toBeHidden({ timeout: 5000 });

    // Document count should remain the same
    await expect(page.getByTestId("order-document-item")).toHaveCount(initialCount);

    // The cancelled file should not appear in the list
    await expect(
      page.getByTestId("order-document-item").filter({ hasText: testFileName })
    ).toHaveCount(0);

    // Clean up
    fs.unlinkSync(testFilePath);
  });
});
