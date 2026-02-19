import { test, expect } from './base';

test.describe('SettingsPage - Header', () => {
  test('STP-HDR-01: Settings page displays header and sections', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Page header
    const header = page.getByTestId('settings-page-header');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Settings');

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

  test('STP-IE-02: Import Clients button opens import dialog', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('settings-import-clients').click();

    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Import Clients');
    await expect(page.getByTestId('csv-format-info')).toBeVisible();
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
});
