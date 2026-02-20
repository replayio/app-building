import { test, expect } from './base';

test.describe('SettingsPage - Header', () => {
  test('STP-HDR-01: Settings page displays header and sections', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Page header
    const header = page.getByTestId('settings-page-header');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Settings');

    // Email Notifications section (visible when authenticated)
    await expect(page.getByTestId('notification-preferences-section')).toBeVisible();

    // Import & Export section
    await expect(page.getByTestId('import-export-section')).toBeVisible();

    // Webhooks section
    await expect(page.getByTestId('webhook-section')).toBeVisible();
  });
});

test.describe('SettingsPage - ImportExportSection', () => {
  test('STP-IE-01: Import & Export section displays all buttons', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Import buttons
    await expect(page.getByTestId('settings-import-clients')).toBeVisible();
    await expect(page.getByTestId('settings-import-deals')).toBeVisible();
    await expect(page.getByTestId('settings-import-tasks')).toBeVisible();
    await expect(page.getByTestId('settings-import-contacts')).toBeVisible();

    // Export buttons
    await expect(page.getByTestId('settings-export-clients')).toBeVisible();
    await expect(page.getByTestId('settings-export-deals')).toBeVisible();
    await expect(page.getByTestId('settings-export-tasks')).toBeVisible();
  });

  test('STP-IE-02: Import Clients button opens import dialog with CSV columns', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('settings-import-clients').click();

    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Import Clients');

    // CSV format info with expected columns
    const formatInfo = page.getByTestId('csv-format-info');
    await expect(formatInfo).toBeVisible();
    await expect(formatInfo).toContainText('Name');
    await expect(formatInfo).toContainText('Type');
    await expect(formatInfo).toContainText('Status');
    await expect(formatInfo).toContainText('Tags');
    await expect(formatInfo).toContainText('Source Type');
    await expect(formatInfo).toContainText('Source Detail');
    await expect(formatInfo).toContainText('Campaign');
    await expect(formatInfo).toContainText('Channel');
    await expect(formatInfo).toContainText('Date Acquired');

    // Template download button
    await expect(page.getByTestId('download-template-button')).toBeVisible();

    // File input
    await expect(page.getByTestId('csv-file-input')).toBeVisible();

    // Cancel and Import buttons
    await expect(page.getByTestId('import-cancel-button')).toBeVisible();
    const importBtn = page.getByTestId('import-submit-button');
    await expect(importBtn).toBeVisible();
    await expect(importBtn).toBeDisabled();
  });

  test('STP-IE-03: Import Deals button opens import dialog with CSV columns', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('settings-import-deals').click();

    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Import Deals');

    // CSV format info with expected columns
    const formatInfo = page.getByTestId('csv-format-info');
    await expect(formatInfo).toBeVisible();
    await expect(formatInfo).toContainText('Name');
    await expect(formatInfo).toContainText('Client Name');
    await expect(formatInfo).toContainText('Value');
    await expect(formatInfo).toContainText('Stage');
    await expect(formatInfo).toContainText('Owner');
    await expect(formatInfo).toContainText('Probability');
    await expect(formatInfo).toContainText('Expected Close Date');
    await expect(formatInfo).toContainText('Status');

    // Template download button and file input
    await expect(page.getByTestId('download-template-button')).toBeVisible();
    await expect(page.getByTestId('csv-file-input')).toBeVisible();

    // Import button disabled until file selected
    const importBtn = page.getByTestId('import-submit-button');
    await expect(importBtn).toBeVisible();
    await expect(importBtn).toBeDisabled();
  });

  test('STP-IE-04: Import Tasks button opens import dialog with CSV columns', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('settings-import-tasks').click();

    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Import Tasks');

    // CSV format info with expected columns
    const formatInfo = page.getByTestId('csv-format-info');
    await expect(formatInfo).toBeVisible();
    await expect(formatInfo).toContainText('Title');
    await expect(formatInfo).toContainText('Description');
    await expect(formatInfo).toContainText('Due Date');
    await expect(formatInfo).toContainText('Priority');
    await expect(formatInfo).toContainText('Client Name');
    await expect(formatInfo).toContainText('Assignee');

    // Template download button and file input
    await expect(page.getByTestId('download-template-button')).toBeVisible();
    await expect(page.getByTestId('csv-file-input')).toBeVisible();

    // Import button disabled until file selected
    const importBtn = page.getByTestId('import-submit-button');
    await expect(importBtn).toBeVisible();
    await expect(importBtn).toBeDisabled();
  });

  test('STP-IE-05: Import Contacts button opens import dialog with CSV columns', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('settings-import-contacts').click();

    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Import Contacts');

    // CSV format info with expected columns
    const formatInfo = page.getByTestId('csv-format-info');
    await expect(formatInfo).toBeVisible();
    await expect(formatInfo).toContainText('Name');
    await expect(formatInfo).toContainText('Title');
    await expect(formatInfo).toContainText('Email');
    await expect(formatInfo).toContainText('Phone');
    await expect(formatInfo).toContainText('Location');
    await expect(formatInfo).toContainText('Client Name');

    // Template download button and file input
    await expect(page.getByTestId('download-template-button')).toBeVisible();
    await expect(page.getByTestId('csv-file-input')).toBeVisible();

    // Import button disabled until file selected
    const importBtn = page.getByTestId('import-submit-button');
    await expect(importBtn).toBeVisible();
    await expect(importBtn).toBeDisabled();
  });

  test('STP-IE-06: Export Clients button triggers CSV download', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Listen for download event
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('settings-export-clients').click();
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toBe('clients-export.csv');
  });

  test('STP-IE-07: Export Deals button triggers CSV download', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Listen for download event
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('settings-export-deals').click();
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toBe('deals-export.csv');
  });

  test('STP-IE-08: Export Tasks button triggers CSV download', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Listen for download event
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('settings-export-tasks').click();
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toBe('tasks-export.csv');
  });
});

test.describe('SettingsPage - WebhookSection', () => {
  test('STP-WH-01: Webhook section shows empty state', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const section = page.getByTestId('webhook-section');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Webhooks');

    // Add Webhook button visible
    await expect(page.getByTestId('add-webhook-button')).toBeVisible();

    // Empty state message
    await expect(page.getByTestId('webhook-empty-state')).toContainText('No webhooks configured');
  });

  test('STP-WH-02: Add Webhook button opens webhook modal with setup guide', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('add-webhook-button').click();

    const modal = page.getByTestId('webhook-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Add Webhook');

    // Setup guide with platform buttons
    await expect(page.getByTestId('webhook-setup-guide')).toBeVisible();
    await expect(page.getByTestId('webhook-platform-zapier')).toBeVisible();
    await expect(page.getByTestId('webhook-platform-n8n')).toBeVisible();
    await expect(page.getByTestId('webhook-platform-custom')).toBeVisible();

    // Form inputs
    await expect(page.getByTestId('webhook-name-input')).toBeVisible();
    await expect(page.getByTestId('webhook-url-input')).toBeVisible();

    // Payload toggle
    await expect(page.getByTestId('webhook-payload-toggle')).toBeVisible();

    // Cancel and Save buttons
    await expect(page.getByTestId('webhook-cancel-button')).toBeVisible();
    const saveButton = page.getByTestId('webhook-save-button');
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeDisabled();
  });

  test('STP-WH-03: Creating a webhook persists and shows in list', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.getByTestId('add-webhook-button').click();
    await expect(page.getByTestId('webhook-modal')).toBeVisible();

    // Fill in name and URL
    await page.getByTestId('webhook-name-input').fill('Zapier Integration');
    await page.getByTestId('webhook-url-input').fill('https://hooks.zapier.com/test');

    // Select events
    await page.getByTestId('webhook-event-client_created').click();
    await page.getByTestId('webhook-event-deal_stage_changed').click();

    // Save button should now be enabled
    const saveButton = page.getByTestId('webhook-save-button');
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Modal should close
    await expect(page.getByTestId('webhook-modal')).not.toBeVisible();

    // Webhook should appear in the list
    await expect(page.getByTestId('webhook-section')).toContainText('Zapier Integration');
    await expect(page.getByTestId('webhook-section')).toContainText('https://hooks.zapier.com/test');
    await expect(page.getByTestId('webhook-section')).toContainText('New Client Created');
    await expect(page.getByTestId('webhook-section')).toContainText('Deal Stage Changed');

    // Empty state should be gone
    await expect(page.getByTestId('webhook-empty-state')).not.toBeVisible();

    // Verify persistence by reloading
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('webhook-section')).toContainText('Zapier Integration');
  });

  test('STP-WH-04: Platform setup guide shows instructions when clicked', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('add-webhook-button').click();
    await expect(page.getByTestId('webhook-modal')).toBeVisible();

    // Click Zapier — instructions should appear
    await page.getByTestId('webhook-platform-zapier').click();
    const instructions = page.getByTestId('webhook-platform-instructions');
    await expect(instructions).toBeVisible();
    await expect(instructions).toContainText('Zapier');
    await expect(page.getByTestId('webhook-platform-tip')).toBeVisible();

    // Click n8n — instructions should switch
    await page.getByTestId('webhook-platform-n8n').click();
    await expect(instructions).toContainText('n8n');

    // Click Custom Endpoint — instructions should switch
    await page.getByTestId('webhook-platform-custom').click();
    await expect(instructions).toContainText('POST');

    // Click Custom again to collapse
    await page.getByTestId('webhook-platform-custom').click();
    await expect(instructions).not.toBeVisible();
  });

  test('STP-WH-05: Payload format toggle shows JSON example', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('add-webhook-button').click();
    await expect(page.getByTestId('webhook-modal')).toBeVisible();

    // Payload example should be hidden initially
    await expect(page.getByTestId('webhook-payload-example')).not.toBeVisible();

    // Click toggle to show
    await page.getByTestId('webhook-payload-toggle').click();
    const payload = page.getByTestId('webhook-payload-example');
    await expect(payload).toBeVisible();
    await expect(payload).toContainText('"event"');
    await expect(payload).toContainText('"timestamp"');
    await expect(payload).toContainText('"data"');

    // Click toggle to hide
    await page.getByTestId('webhook-payload-toggle').click();
    await expect(payload).not.toBeVisible();
  });

  test('STP-WH-06: Delete webhook removes it after confirmation', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // First create a webhook to delete
    await page.getByTestId('add-webhook-button').click();
    await page.getByTestId('webhook-name-input').fill('Temp Webhook');
    await page.getByTestId('webhook-url-input').fill('https://example.com/webhook');
    await page.getByTestId('webhook-event-task_completed').click();
    await page.getByTestId('webhook-save-button').click();
    await expect(page.getByTestId('webhook-modal')).not.toBeVisible();

    // Wait for the webhook to appear in the list
    await expect(page.getByTestId('webhook-section')).toContainText('Temp Webhook');

    // Find the webhook item containing "Temp Webhook" and click its delete button
    const webhookItem = page.locator('[data-testid^="webhook-item-"]', { hasText: 'Temp Webhook' });
    const deleteButton = webhookItem.locator('[data-testid^="webhook-delete-"]');
    await deleteButton.click();

    // Confirm dialog should appear
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    await page.getByTestId('confirm-ok').click();

    // Webhook should be removed
    await expect(page.getByTestId('webhook-section')).not.toContainText('Temp Webhook');
  });

  test('STP-WH-07: Enable/disable toggle changes webhook state', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Create a webhook to toggle
    await page.getByTestId('add-webhook-button').click();
    await page.getByTestId('webhook-name-input').fill('Toggle Test Webhook');
    await page.getByTestId('webhook-url-input').fill('https://example.com/toggle-test');
    await page.getByTestId('webhook-event-client_created').click();
    await page.getByTestId('webhook-save-button').click();
    await expect(page.getByTestId('webhook-modal')).not.toBeVisible();

    // Wait for webhook to appear
    await expect(page.getByTestId('webhook-section')).toContainText('Toggle Test Webhook');

    // Locate the webhook item — all locators are lazy and re-evaluate on each use
    const webhookItem = page.locator('[data-testid^="webhook-item-"]', { hasText: 'Toggle Test Webhook' });
    const toggleLabel = webhookItem.locator('[data-testid^="webhook-toggle-"]');
    const toggleInput = toggleLabel.locator('input[type="checkbox"]');

    // Toggle should be checked (enabled by default)
    await expect(toggleInput).toBeChecked();

    // Click the visible label to disable (clicking label toggles the sr-only checkbox)
    await toggleLabel.click();
    await expect(toggleInput).not.toBeChecked({ timeout: 10000 });

    // Verify persistence — reload and confirm toggle stays off
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('[data-testid^="webhook-item-"]', { hasText: 'Toggle Test Webhook' })
        .locator('[data-testid^="webhook-toggle-"] input[type="checkbox"]')
    ).not.toBeChecked();

    // Click toggle label to re-enable
    await page.locator('[data-testid^="webhook-item-"]', { hasText: 'Toggle Test Webhook' })
      .locator('[data-testid^="webhook-toggle-"]').click();
    await expect(
      page.locator('[data-testid^="webhook-item-"]', { hasText: 'Toggle Test Webhook' })
        .locator('[data-testid^="webhook-toggle-"] input[type="checkbox"]')
    ).toBeChecked({ timeout: 10000 });

    // Verify re-enable persists
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('[data-testid^="webhook-item-"]', { hasText: 'Toggle Test Webhook' })
        .locator('[data-testid^="webhook-toggle-"] input[type="checkbox"]')
    ).toBeChecked();
  });

  test('STP-WH-08: Edit webhook flow updates webhook details', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Create a webhook to edit
    await page.getByTestId('add-webhook-button').click();
    await page.getByTestId('webhook-name-input').fill('Original Name');
    await page.getByTestId('webhook-url-input').fill('https://example.com/original');
    await page.getByTestId('webhook-event-client_created').click();
    await page.getByTestId('webhook-save-button').click();
    await expect(page.getByTestId('webhook-modal')).not.toBeVisible();

    // Wait for webhook to appear
    await expect(page.getByTestId('webhook-section')).toContainText('Original Name');

    // Click edit button on the webhook
    const webhookItem = page.locator('[data-testid^="webhook-item-"]', { hasText: 'Original Name' });
    const editButton = webhookItem.locator('[data-testid^="webhook-edit-"]');
    await editButton.click();

    // Modal should open with "Edit Webhook" title and pre-filled values
    const modal = page.getByTestId('webhook-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Edit Webhook');
    await expect(page.getByTestId('webhook-name-input')).toHaveValue('Original Name');
    await expect(page.getByTestId('webhook-url-input')).toHaveValue('https://example.com/original');

    // Verify the event checkbox is checked
    const eventCheckbox = page.getByTestId('webhook-event-client_created').locator('input[type="checkbox"]');
    await expect(eventCheckbox).toBeChecked();

    // Update the name
    await page.getByTestId('webhook-name-input').clear();
    await page.getByTestId('webhook-name-input').fill('Updated Name');

    // Save changes
    const saveButton = page.getByTestId('webhook-save-button');
    await expect(saveButton).toContainText('Save Changes');
    await saveButton.click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Updated name should appear in the list
    await expect(page.getByTestId('webhook-section')).toContainText('Updated Name');
    await expect(page.locator('[data-testid^="webhook-name-"]', { hasText: 'Original Name' })).toHaveCount(0);

    // Verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('webhook-section')).toContainText('Updated Name');
  });
});

test.describe('SettingsPage - NotificationPreferencesSection', () => {
  test('STP-NP-01: Notification preferences section displays all toggles when authenticated', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const section = page.getByTestId('notification-preferences-section');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Email Notifications');

    // All 7 notification toggles should be visible
    await expect(page.getByTestId('notification-toggle-notify_client_updated')).toBeVisible();
    await expect(page.getByTestId('notification-toggle-notify_deal_created')).toBeVisible();
    await expect(page.getByTestId('notification-toggle-notify_deal_stage_changed')).toBeVisible();
    await expect(page.getByTestId('notification-toggle-notify_task_created')).toBeVisible();
    await expect(page.getByTestId('notification-toggle-notify_task_completed')).toBeVisible();
    await expect(page.getByTestId('notification-toggle-notify_contact_added')).toBeVisible();
    await expect(page.getByTestId('notification-toggle-notify_note_added')).toBeVisible();

    // All toggles should default to enabled (aria-checked="true")
    for (const key of [
      'notify_client_updated',
      'notify_deal_created',
      'notify_deal_stage_changed',
      'notify_task_created',
      'notify_task_completed',
      'notify_contact_added',
      'notify_note_added',
    ]) {
      const toggle = page.getByTestId(`notification-toggle-${key}`);
      await expect(toggle).toHaveAttribute('aria-checked', 'true');
    }
  });

  test('STP-NP-02: Toggling a notification preference persists the change', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const toggle = page.getByTestId('notification-toggle-notify_client_updated');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    // Click to disable
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    // Reload and verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('notification-toggle-notify_client_updated')).toHaveAttribute('aria-checked', 'false');

    // Other toggles should still be enabled
    await expect(page.getByTestId('notification-toggle-notify_deal_created')).toHaveAttribute('aria-checked', 'true');
  });

  test('STP-NP-03: Notification preferences section is hidden when not authenticated', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Notification section should NOT be visible
    await expect(page.getByTestId('notification-preferences-section')).not.toBeVisible();

    // Other sections should still be visible
    await expect(page.getByTestId('import-export-section')).toBeVisible();
    await expect(page.getByTestId('webhook-section')).toBeVisible();

    await context.close();
  });
});
