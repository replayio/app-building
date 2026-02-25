import { test, expect } from "@playwright/test";

// Helper to get equipment ID by name using the API (avoids pagination issues)
async function getEquipmentId(
  page: import("@playwright/test").Page,
  equipmentName: string
): Promise<string> {
  const response = await page.request.get("/.netlify/functions/equipment");
  const equipment = await response.json();
  const item = (equipment as Array<{ name: string; id: string }>).find(
    (e) => e.name === equipmentName
  );
  if (!item) throw new Error(`Equipment "${equipmentName}" not found`);
  return item.id;
}

// Minimal 1x1 red PNG for photo upload tests
const TEST_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
const TEST_PNG_BUFFER = Buffer.from(TEST_PNG_BASE64, "base64");

test.describe("EquipmentDetailHeader", () => {
  test("ED-HDR-1: Breadcrumb displays Equipment > Details link", async ({
    page,
  }) => {
    const equipId = await getEquipmentId(page, "Conveyor Belt");
    await page.goto(`/equipment/${equipId}`);

    await expect(page.getByTestId("equipment-detail-header")).toBeVisible({
      timeout: 30000,
    });

    // Verify breadcrumb shows "Equipment" link and "Details: <id>"
    const breadcrumb = page.getByTestId("breadcrumb");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText("Equipment");
    await expect(breadcrumb).toContainText(`Details: ${equipId}`);

    // Click "Equipment" link in breadcrumb and verify navigation
    await breadcrumb.locator("a").filter({ hasText: "Equipment" }).click();
    await expect(page).toHaveURL(/\/equipment$/, { timeout: 15000 });
  });

  test("ED-HDR-2: Page title shows equipment name and ID", async ({
    page,
  }) => {
    const equipId = await getEquipmentId(page, "Conveyor Belt");
    await page.goto(`/equipment/${equipId}`);

    const title = page.getByTestId("equipment-detail-title");
    await expect(title).toBeVisible({ timeout: 30000 });
    await expect(title).toContainText("Conveyor Belt");
    await expect(title).toContainText(equipId);
  });

  test("ED-HDR-3: Operational status badge is displayed", async ({ page }) => {
    // Conveyor Belt has "Operational" status in seed data
    const equipId = await getEquipmentId(page, "Conveyor Belt");
    await page.goto(`/equipment/${equipId}`);

    await expect(page.getByTestId("equipment-detail-header")).toBeVisible({
      timeout: 30000,
    });

    const badge = page.getByTestId("equipment-status-badge");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("Operational");
    await expect(badge).toHaveClass(/badge--operational/);
  });

  test("ED-HDR-4: Maintenance status badge is displayed", async ({ page }) => {
    // CNC Router has "Maintenance" status in seed data
    const equipId = await getEquipmentId(page, "CNC Router");
    await page.goto(`/equipment/${equipId}`);

    await expect(page.getByTestId("equipment-detail-header")).toBeVisible({
      timeout: 30000,
    });

    const badge = page.getByTestId("equipment-status-badge");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("Maintenance");
    await expect(badge).toHaveClass(/badge--maintenance/);
  });
});

test.describe("EquipmentInfo", () => {
  test("ED-INFO-1: Equipment photo is displayed", async ({ page }) => {
    test.slow();
    // Set a photo via API, then navigate and verify display
    const equipId = await getEquipmentId(page, "Quality Scanner");

    const dataUrl = `data:image/png;base64,${TEST_PNG_BASE64}`;
    await page.request.put(`/.netlify/functions/equipment/${equipId}`, {
      data: { photo_url: dataUrl },
    });

    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("equipment-info")).toBeVisible({
      timeout: 30000,
    });

    // Photo should be displayed as an <img> element
    const photo = page.getByTestId("equipment-photo");
    await expect(photo).toBeVisible({ timeout: 15000 });
    await expect(photo).toHaveAttribute("src", /data:image|http/);
  });

  test("ED-INFO-2: Upload a new equipment photo", async ({ page }) => {
    test.slow();
    const equipId = await getEquipmentId(page, "Heat Press");
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("equipment-info")).toBeVisible({
      timeout: 30000,
    });

    // Should initially show placeholder since no photo in seed data
    await expect(page.getByTestId("equipment-photo-placeholder")).toBeVisible();

    // Set up file chooser listener before clicking the upload area
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByTestId("equipment-photo-placeholder").click();
    const fileChooser = await fileChooserPromise;

    // Select a test image file
    await fileChooser.setFiles({
      name: "test-photo.png",
      mimeType: "image/png",
      buffer: TEST_PNG_BUFFER,
    });

    // Photo should now be displayed (placeholder replaced by img)
    await expect(page.getByTestId("equipment-photo")).toBeVisible({
      timeout: 30000,
    });

    // Verify persistence - navigate away and return
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({
      timeout: 30000,
    });
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("equipment-info")).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByTestId("equipment-photo")).toBeVisible({
      timeout: 15000,
    });
  });

  test("ED-INFO-3: Placeholder shown when no photo exists", async ({
    page,
  }) => {
    // Packaging Line has no photo in seed data
    const equipId = await getEquipmentId(page, "Packaging Line");
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("equipment-info")).toBeVisible({
      timeout: 30000,
    });

    // Should show placeholder image/upload prompt
    await expect(page.getByTestId("equipment-photo-placeholder")).toBeVisible();
  });

  test("ED-INFO-4: Details panel displays all equipment fields", async ({
    page,
  }) => {
    // Conveyor Belt: Model "CB-1200", Serial "SN-CB-001", Location "Building A, Main Floor",
    // Manufacturer "ConveyAll Corp", Installation Date "2023-06-10"
    const equipId = await getEquipmentId(page, "Conveyor Belt");
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("equipment-details-panel")).toBeVisible({
      timeout: 30000,
    });

    // Verify all 5 detail fields are present
    const detailFields = page.getByTestId("equipment-detail-field");
    await expect(detailFields).toHaveCount(5);

    // Verify specific field labels and values
    const panel = page.getByTestId("equipment-details-panel");
    await expect(panel).toContainText("Model:");
    await expect(panel).toContainText("CB-1200");
    await expect(panel).toContainText("Serial No.:");
    await expect(panel).toContainText("SN-CB-001");
    await expect(panel).toContainText("Location:");
    await expect(panel).toContainText("Building A, Main Floor");
    await expect(panel).toContainText("Manufacturer:");
    await expect(panel).toContainText("ConveyAll Corp");
    await expect(panel).toContainText("Installation Date:");
    await expect(panel).toContainText("2023");
  });

  test("ED-INFO-5: Edit equipment details", async ({ page }) => {
    test.slow();
    const equipId = await getEquipmentId(page, "Industrial Mixer");
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("equipment-details-panel")).toBeVisible({
      timeout: 30000,
    });

    // Click edit button on details panel
    await page.getByTestId("equipment-edit-details-btn").click();

    // Verify all detail fields become editable
    await expect(page.getByTestId("equipment-edit-form")).toBeVisible();
    await expect(page.getByTestId("equipment-edit-model")).toBeVisible();
    await expect(page.getByTestId("equipment-edit-serial")).toBeVisible();
    await expect(page.getByTestId("equipment-edit-location")).toBeVisible();
    await expect(page.getByTestId("equipment-edit-manufacturer")).toBeVisible();
    await expect(
      page.getByTestId("equipment-edit-installation-date")
    ).toBeVisible();

    // Change Location
    await page.getByTestId("equipment-edit-location").clear();
    await page.getByTestId("equipment-edit-location").fill("Zone A, Bay 1");

    // Save
    await page.getByTestId("equipment-edit-save-btn").click();

    // Verify update is reflected in view mode
    await expect(page.getByTestId("equipment-edit-form")).toBeHidden({
      timeout: 15000,
    });
    await expect(
      page.getByTestId("equipment-details-panel")
    ).toContainText("Zone A, Bay 1", { timeout: 15000 });

    // Verify persistence - navigate away and return
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({
      timeout: 30000,
    });
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("equipment-details-panel")).toBeVisible({
      timeout: 30000,
    });
    await expect(
      page.getByTestId("equipment-details-panel")
    ).toContainText("Zone A, Bay 1", { timeout: 15000 });
  });

  test("ED-INFO-6: Description text is displayed", async ({ page }) => {
    // Industrial Mixer has description "Heavy-duty mixer for blending raw materials"
    const equipId = await getEquipmentId(page, "Industrial Mixer");
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("equipment-info")).toBeVisible({
      timeout: 30000,
    });

    // Verify description section heading
    const descSection = page.getByTestId("equipment-description-section");
    await expect(descSection).toBeVisible();
    await expect(descSection).toContainText("Description");

    // Verify description text
    const descText = page.getByTestId("equipment-description-text");
    await expect(descText).toBeVisible();
    await expect(descText).toContainText(
      "Heavy-duty mixer for blending raw materials"
    );
  });

  test("ED-INFO-7: Edit equipment description", async ({ page }) => {
    test.slow();
    const equipId = await getEquipmentId(page, "Packaging Line");
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("equipment-info")).toBeVisible({
      timeout: 30000,
    });

    // Click edit button on description section
    await page.getByTestId("equipment-edit-description-btn").click();

    // Verify edit form appears with textarea
    await expect(
      page.getByTestId("equipment-edit-description-form")
    ).toBeVisible();
    await expect(page.getByTestId("equipment-edit-description")).toBeVisible();

    // Modify description
    const newDescription = `Updated packaging line description ${Date.now()}`;
    await page.getByTestId("equipment-edit-description").clear();
    await page.getByTestId("equipment-edit-description").fill(newDescription);

    // Save
    await page.getByTestId("equipment-edit-description-save-btn").click();

    // Verify updated description is displayed
    await expect(
      page.getByTestId("equipment-edit-description-form")
    ).toBeHidden({ timeout: 15000 });
    await expect(page.getByTestId("equipment-description-text")).toHaveText(
      newDescription,
      { timeout: 15000 }
    );

    // Verify persistence - navigate away and return
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({
      timeout: 30000,
    });
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("equipment-info")).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByTestId("equipment-description-text")).toHaveText(
      newDescription,
      { timeout: 15000 }
    );
  });
});

test.describe("MaintenanceNotes", () => {
  test('ED-NOTES-1: Maintenance Notes & Comments heading is displayed', async ({
    page,
  }) => {
    const equipId = await getEquipmentId(page, "CNC Router");
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("maintenance-notes")).toBeVisible({
      timeout: 30000,
    });

    await expect(page.getByTestId("comments-section-title")).toHaveText(
      "Maintenance Notes & Comments"
    );
  });

  test("ED-NOTES-2: Add a note text input and Post Note button are displayed", async ({
    page,
  }) => {
    const equipId = await getEquipmentId(page, "CNC Router");
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("maintenance-notes")).toBeVisible({
      timeout: 30000,
    });

    // Verify text input with placeholder
    const input = page.getByTestId("comments-input");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("placeholder", "Add a note...");

    // Verify Post Note button
    const postBtn = page.getByTestId("comments-post-btn");
    await expect(postBtn).toBeVisible();
    await expect(postBtn).toHaveText("Post Note");
  });

  test("ED-NOTES-3: Post a new maintenance note", async ({ page }) => {
    test.slow();
    const equipId = await getEquipmentId(page, "Industrial Mixer");
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("maintenance-notes")).toBeVisible({
      timeout: 30000,
    });

    const noteText = `Replaced worn drive belt. Machine back online. ${Date.now()}`;

    // Type note and post
    await page.getByTestId("comments-input").fill(noteText);
    await page.getByTestId("comments-post-btn").click();

    // Input should be cleared
    await expect(page.getByTestId("comments-input")).toHaveValue("", {
      timeout: 15000,
    });

    // New note should appear at the top of the list
    const newNote = page
      .getByTestId("comment-item")
      .filter({ hasText: noteText });
    await expect(newNote).toBeVisible({ timeout: 15000 });

    // Verify it shows author name, role, date, and text
    await expect(newNote.getByTestId("comment-author")).toContainText("Admin");
    await expect(newNote.getByTestId("comment-role")).toContainText("Operator");
    await expect(newNote.getByTestId("comment-date")).toBeVisible();
    await expect(newNote.getByTestId("comment-text")).toContainText(noteText);

    // Verify the note appears at the top (first in the list)
    const firstComment = page.getByTestId("comment-item").first();
    await expect(firstComment.getByTestId("comment-text")).toContainText(
      noteText
    );

    // Verify no duplicate entries
    await expect(
      page.getByTestId("comment-item").filter({ hasText: noteText })
    ).toHaveCount(1);

    // Verify persistence after page refresh
    await page.goto("/equipment");
    await expect(page.getByTestId("equipment-table")).toBeVisible({
      timeout: 30000,
    });
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("maintenance-notes")).toBeVisible({
      timeout: 30000,
    });
    await expect(
      page.getByTestId("comment-item").filter({ hasText: noteText })
    ).toBeVisible({ timeout: 15000 });
  });

  test("ED-NOTES-4: Post Note button is disabled when text input is empty", async ({
    page,
  }) => {
    const equipId = await getEquipmentId(page, "CNC Router");
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("maintenance-notes")).toBeVisible({
      timeout: 30000,
    });

    // Button should be disabled when input is empty
    await expect(page.getByTestId("comments-input")).toHaveValue("");
    await expect(page.getByTestId("comments-post-btn")).toBeDisabled();

    // Type some text
    await page.getByTestId("comments-input").fill("Some note text");

    // Button should become enabled
    await expect(page.getByTestId("comments-post-btn")).toBeEnabled();
  });

  test("ED-NOTES-5: Comments list displays author name, role, date, and text", async ({
    page,
  }) => {
    // CNC Router has seed notes from "Mike Thompson" and "Sarah Chen"
    const equipId = await getEquipmentId(page, "CNC Router");
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("maintenance-notes")).toBeVisible({
      timeout: 30000,
    });

    // Wait for notes to load
    const comments = page.getByTestId("comment-item");
    await expect(comments.first()).toBeVisible({ timeout: 15000 });

    // Verify each comment displays all required fields
    const firstComment = comments.first();
    await expect(firstComment.getByTestId("comment-author")).toBeVisible();
    await expect(firstComment.getByTestId("comment-role")).toBeVisible();
    await expect(firstComment.getByTestId("comment-date")).toBeVisible();
    await expect(firstComment.getByTestId("comment-text")).toBeVisible();

    // Verify known seed data authors are present
    const commentsList = page.getByTestId("comments-list");
    await expect(commentsList).toContainText("Mike Thompson");
    await expect(commentsList).toContainText("Maintenance Tech");
    await expect(commentsList).toContainText("Sarah Chen");
    await expect(commentsList).toContainText("Floor Supervisor");
  });

  test("ED-NOTES-6: Comments are displayed in reverse chronological order", async ({
    page,
  }) => {
    test.slow();
    const equipId = await getEquipmentId(page, "Quality Scanner");
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("maintenance-notes")).toBeVisible({
      timeout: 30000,
    });

    // Post a new note (which will have the latest timestamp)
    const newNoteText = `Chronological order test note ${Date.now()}`;
    await page.getByTestId("comments-input").fill(newNoteText);
    await page.getByTestId("comments-post-btn").click();

    // Wait for the new note to appear
    await expect(page.getByTestId("comments-input")).toHaveValue("", {
      timeout: 15000,
    });
    await expect(
      page.getByTestId("comment-item").filter({ hasText: newNoteText })
    ).toBeVisible({ timeout: 15000 });

    // The most recent note should be at the top (first in the list)
    const firstComment = page.getByTestId("comment-item").first();
    await expect(firstComment.getByTestId("comment-text")).toContainText(
      newNoteText
    );
  });

  test("ED-NOTES-7: System-generated notes are displayed with System author", async ({
    page,
  }) => {
    test.slow();
    const equipId = await getEquipmentId(page, "Conveyor Belt");

    // Create a system-generated note via the API
    const systemNoteText = `Preventive maintenance check completed ${Date.now()}`;
    await page.request.post("/.netlify/functions/equipment-notes", {
      data: {
        equipment_id: equipId,
        author_name: "System",
        author_role: "Auto",
        text: systemNoteText,
      },
    });

    // Navigate to equipment details page
    await page.goto(`/equipment/${equipId}`);
    await expect(page.getByTestId("maintenance-notes")).toBeVisible({
      timeout: 30000,
    });

    // Find the system note
    const systemNote = page
      .getByTestId("comment-item")
      .filter({ hasText: systemNoteText });
    await expect(systemNote).toBeVisible({ timeout: 15000 });

    // Verify "System" author and "(Auto)" role
    await expect(systemNote.getByTestId("comment-author")).toHaveText("System");
    await expect(systemNote.getByTestId("comment-role")).toContainText("Auto");
    await expect(systemNote.getByTestId("comment-date")).toBeVisible();
    await expect(systemNote.getByTestId("comment-text")).toContainText(
      systemNoteText
    );
  });
});
