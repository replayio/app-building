import { test, expect } from '@playwright/test';

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

  test('STP-WH-02: Add Webhook button opens webhook modal', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('add-webhook-button').click();

    const modal = page.getByTestId('webhook-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Add Webhook');

    // Form inputs
    await expect(page.getByTestId('webhook-name-input')).toBeVisible();
    await expect(page.getByTestId('webhook-url-input')).toBeVisible();

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

  test('STP-WH-04: Delete webhook removes it after confirmation', async ({ page }) => {
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

    // Find and click the delete button for this webhook
    // The webhook items have dynamic IDs, so we find the one containing our text
    const webhookSection = page.getByTestId('webhook-section');
    const deleteButton = webhookSection.locator('[data-testid^="webhook-delete-"]').first();
    await deleteButton.click();

    // Confirm dialog should appear
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    await page.getByTestId('confirm-ok').click();

    // Webhook should be removed
    await expect(page.getByTestId('webhook-section')).not.toContainText('Temp Webhook');
  });
});
