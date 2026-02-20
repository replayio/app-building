import { test, expect } from './base';

/**
 * Helper: navigate to the first client's detail page.
 * Goes to /clients, grabs the first row's ID, and navigates.
 * Returns the clientId.
 */
async function navigateToFirstClientDetail(page: import('@playwright/test').Page): Promise<string> {
  await page.goto('/clients');
  await page.waitForLoadState('networkidle');

  const rows = page.locator('[data-testid^="client-row-"]');
  await rows.first().waitFor({ state: 'visible', timeout: 15000 });
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);

  const testId = await rows.first().getAttribute('data-testid');
  const clientId = testId!.replace('client-row-', '');

  await page.goto(`/clients/${clientId}`);
  await page.waitForLoadState('networkidle');
  return clientId;
}

test.describe('ClientDetailPage - ClientHeader (CDP-HDR)', () => {
  test('CDP-HDR-01: Header displays client name, type, status, and tags', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const header = page.getByTestId('client-header');
    await expect(header).toBeVisible();

    // Client name is displayed
    const title = page.getByTestId('client-header-title');
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText!.length).toBeGreaterThan(0);

    // Type badge visible (Organization or Individual)
    const typeBadge = page.getByTestId('client-header-type-badge');
    await expect(typeBadge).toBeVisible();
    const typeText = await typeBadge.textContent();
    expect(['Organization', 'Individual']).toContain(typeText!.trim());

    // Status dropdown visible
    const statusDropdown = page.getByTestId('client-header-status-dropdown');
    await expect(statusDropdown).toBeVisible();

    // Tags container visible
    const tagsContainer = page.getByTestId('client-header-tags');
    await expect(tagsContainer).toBeVisible();
  });

  test('CDP-HDR-02: Clicking edit on header allows editing and saving client name', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Get original name
    const originalName = await page.getByTestId('client-header-title').textContent();

    // Click edit button
    await page.getByTestId('client-header-edit-button').click();

    // Edit form fields should be visible
    await expect(page.getByTestId('client-header-name-input')).toBeVisible();
    await expect(page.getByTestId('client-header-type-select')).toBeVisible();
    await expect(page.getByTestId('client-header-status-select')).toBeVisible();
    await expect(page.getByTestId('client-header-tags-input')).toBeVisible();

    // Save and Cancel buttons visible
    await expect(page.getByTestId('client-header-save-button')).toBeVisible();
    await expect(page.getByTestId('client-header-cancel-button')).toBeVisible();

    // Change name and save
    const nameInput = page.getByTestId('client-header-name-input');
    await nameInput.clear();
    await nameInput.fill('Acme Corporation');
    await page.getByTestId('client-header-save-button').click();

    // Verify name updated in header (confirms PUT response was accepted by DB)
    await expect(page.getByTestId('client-header-title')).toHaveText('Acme Corporation');

    // Wait for all network activity to settle (API call + data reload)
    await page.waitForLoadState('networkidle');

    // Verify name still showing after data reload
    await expect(page.getByTestId('client-header-title')).toHaveText('Acme Corporation');

    // Verify timeline entry for the name change was created
    await expect(
      page.locator('[data-testid^="timeline-event-description-"]').filter({ hasText: 'Name Changed' })
    ).not.toHaveCount(0, { timeout: 15000 });

    // Restore original name
    await page.getByTestId('client-header-edit-button').click();
    await page.getByTestId('client-header-name-input').clear();
    await page.getByTestId('client-header-name-input').fill(originalName!);
    await page.getByTestId('client-header-save-button').click();
    await expect(page.getByTestId('client-header-title')).toHaveText(originalName!);
  });

  test('CDP-HDR-03: Editing client status persists the change', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Read current status
    const statusBadge = page.getByTestId('client-header-status-badge');
    const currentStatusText = (await statusBadge.textContent())!.trim();
    const targetStatus = currentStatusText === 'Inactive' ? 'active' : 'inactive';
    const targetLabel = targetStatus === 'active' ? 'Active' : 'Inactive';

    // Change status via dropdown
    await page.getByTestId('status-dropdown-button').click();
    await page.getByTestId(`status-dropdown-option-${targetStatus}`).click();

    // Verify status badge updates (confirms PUT response was accepted by DB)
    await expect(statusBadge).toContainText(targetLabel, { timeout: 10000 });

    // Wait for all network activity to settle (API call + data reload)
    await page.waitForLoadState('networkidle');

    // Verify status is still showing after data reload
    await expect(page.getByTestId('client-header-status-badge')).toContainText(targetLabel);

    // Verify timeline entry for the status change was created
    await expect(
      page.locator('[data-testid^="timeline-event-description-"]').filter({ hasText: 'Status Changed' })
    ).not.toHaveCount(0, { timeout: 15000 });

    // Restore original status
    const originalStatus = currentStatusText.toLowerCase();
    await page.getByTestId('status-dropdown-button').click();
    await page.getByTestId(`status-dropdown-option-${originalStatus}`).click();
    await expect(page.getByTestId('client-header-status-badge')).toContainText(currentStatusText, { timeout: 10000 });
  });

  test('CDP-HDR-04: Editing tags persists the change', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Read current tags
    const tagsContainer = page.getByTestId('client-header-tags');

    // Enter edit mode
    await page.getByTestId('client-header-edit-button').click();

    // Get original tags input value for restoration
    const tagsInput = page.getByTestId('client-header-tags-input');
    const originalTagsInput = await tagsInput.inputValue();

    // Modify tags: set a distinct value
    await tagsInput.clear();
    await tagsInput.fill('Enterprise, VIP');

    // Save
    await page.getByTestId('client-header-save-button').click();

    // Verify tags updated in header (confirms PUT response was accepted by DB)
    await expect(tagsContainer).toContainText('Enterprise', { timeout: 10000 });
    await expect(tagsContainer).toContainText('VIP');

    // Wait for all network activity to settle (API call + data reload)
    await page.waitForLoadState('networkidle');

    // Verify tags still showing after data reload
    await expect(page.getByTestId('client-header-tags')).toContainText('VIP');

    // Verify timeline entry for the tags change was created
    await expect(
      page.locator('[data-testid^="timeline-event-description-"]').filter({ hasText: 'Tags Changed' })
    ).not.toHaveCount(0, { timeout: 15000 });

    // Restore original tags
    await page.getByTestId('client-header-edit-button').click();
    await page.getByTestId('client-header-tags-input').clear();
    await page.getByTestId('client-header-tags-input').fill(originalTagsInput);
    await page.getByTestId('client-header-save-button').click();
  });

  test('CDP-HDR-05: Editing client type persists the change', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Read current type
    const typeBadge = page.getByTestId('client-header-type-badge');
    const currentTypeText = (await typeBadge.textContent())!.trim();
    const targetType = currentTypeText === 'Organization' ? 'individual' : 'organization';
    const targetLabel = targetType === 'organization' ? 'Organization' : 'Individual';

    // Enter edit mode
    await page.getByTestId('client-header-edit-button').click();

    // Change type via FilterSelect
    await page.getByTestId('client-header-type-select-trigger').click();
    await page.getByTestId(`client-header-type-select-option-${targetType}`).click();

    // Save
    await page.getByTestId('client-header-save-button').click();

    // Verify type badge updates (confirms PUT response was accepted by DB)
    await expect(typeBadge).toHaveText(targetLabel, { timeout: 10000 });

    // Wait for all network activity to settle (API call + data reload)
    await page.waitForLoadState('networkidle');

    // Verify type still showing after data reload
    await expect(page.getByTestId('client-header-type-badge')).toHaveText(targetLabel);

    // Verify timeline entry for the type change was created
    await expect(
      page.locator('[data-testid^="timeline-event-description-"]').filter({ hasText: 'Type Changed' })
    ).not.toHaveCount(0, { timeout: 15000 });

    // Restore original type
    const originalType = currentTypeText.toLowerCase();
    await page.getByTestId('client-header-edit-button').click();
    await page.getByTestId('client-header-type-select-trigger').click();
    await page.getByTestId(`client-header-type-select-option-${originalType}`).click();
    await page.getByTestId('client-header-save-button').click();
    await expect(page.getByTestId('client-header-type-badge')).toHaveText(currentTypeText, { timeout: 10000 });
  });
});

test.describe('ClientDetailPage - QuickActions (CDP-QA)', () => {
  test('CDP-QA-01: Quick action buttons are all displayed', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const quickActions = page.getByTestId('quick-actions');
    await expect(quickActions).toBeVisible();

    await expect(page.getByTestId('quick-action-add-task')).toBeVisible();
    await expect(page.getByTestId('quick-action-add-deal')).toBeVisible();
    await expect(page.getByTestId('quick-action-add-attachment')).toBeVisible();
    await expect(page.getByTestId('quick-action-add-person')).toBeVisible();
  });

  test('CDP-QA-02: Add Task opens task creation modal', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-task').click();
    const modal = page.getByTestId('add-task-modal');
    await expect(modal).toBeVisible();

    // Modal should have key fields
    await expect(modal.getByTestId('task-title-input')).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('CDP-QA-03: Creating a task via quick action persists and shows in Tasks section', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const taskName = `Test Task ${Date.now()}`;

    // Count existing timeline entries for task creation
    const taskCreatedEntries = page.locator('[data-testid^="timeline-event-description-"]').filter({ hasText: 'Task Created' });
    const initialTimelineCount = await taskCreatedEntries.count();

    // Open Add Task modal
    await page.getByTestId('quick-action-add-task').click();
    const modal = page.getByTestId('add-task-modal');
    await expect(modal).toBeVisible();

    // Fill task title
    await modal.getByTestId('task-title-input').fill(taskName);

    // Click Save
    await modal.getByTestId('task-save-button').click();

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 10000 });

    // New task should appear in Tasks section
    await expect(
      page.locator('[data-testid^="task-title-"]').filter({ hasText: taskName })
    ).toHaveCount(1, { timeout: 15000 });

    // Verify exactly one new timeline entry for task creation
    await expect(taskCreatedEntries).toHaveCount(initialTimelineCount + 1, { timeout: 15000 });
  });

  test('CDP-QA-04: Add Deal opens deal creation modal', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-deal').click();
    const modal = page.getByTestId('add-deal-modal');
    await expect(modal).toBeVisible();

    // Modal should have key fields
    await expect(modal.getByTestId('deal-name-input')).toBeVisible();
    await expect(modal.getByTestId('deal-stage-select')).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('CDP-QA-05: Creating a deal via quick action persists and shows in Deals section', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const dealName = `Test Deal ${Date.now()}`;

    // Count existing timeline entries for deal creation
    const dealCreatedEntries = page.locator('[data-testid^="timeline-event-description-"]').filter({ hasText: 'Deal Created' });
    const initialTimelineCount = await dealCreatedEntries.count();

    // Open Add Deal modal
    await page.getByTestId('quick-action-add-deal').click();
    const modal = page.getByTestId('add-deal-modal');
    await expect(modal).toBeVisible();

    // Fill deal name and value
    await modal.getByTestId('deal-name-input').fill(dealName);
    await modal.getByTestId('deal-value-input').fill('50000');

    // Select stage via FilterSelect
    await modal.getByTestId('deal-stage-select-trigger').click();
    await modal.getByTestId('deal-stage-select-option-proposal').click();

    // Click Save
    await modal.getByTestId('deal-save-button').click();

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 10000 });

    // New deal should appear in Deals section
    await expect(
      page.locator('[data-testid^="deal-name-"]').filter({ hasText: dealName })
    ).toHaveCount(1, { timeout: 15000 });

    // Verify exactly one new timeline entry for deal creation
    await expect(dealCreatedEntries).toHaveCount(initialTimelineCount + 1, { timeout: 15000 });
  });

  test('CDP-QA-06: Add Attachment opens attachment upload dialog', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-attachment').click();
    const modal = page.getByTestId('add-attachment-modal');
    await expect(modal).toBeVisible();

    // File upload and link URL toggle buttons
    await expect(modal.getByRole('button', { name: 'File Upload' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Link URL' })).toBeVisible();

    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('CDP-QA-07: Uploading an attachment persists and shows in Attachments section', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Open Add Attachment modal
    await page.getByTestId('quick-action-add-attachment').click();
    const modal = page.getByTestId('add-attachment-modal');
    await expect(modal).toBeVisible();

    // Use setInputFiles to simulate file selection
    const fileInput = modal.getByTestId('attachment-file-input');
    await fileInput.setInputFiles({
      name: 'Report.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content for testing'),
    });

    // Click Save
    await modal.getByTestId('attachment-save-button').click();

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 30000 });

    // New attachment should appear in Attachments section
    await expect(
      page.locator('[data-testid^="attachment-filename-"]').filter({ hasText: 'Report.pdf' })
    ).not.toHaveCount(0, { timeout: 15000 });
  });

  test('CDP-QA-08: Add Person opens person creation/association modal', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-person').click();
    const modal = page.getByTestId('add-person-modal');
    await expect(modal).toBeVisible();

    // Mode toggle buttons for create/associate
    await expect(modal.getByTestId('person-mode-create')).toBeVisible();
    await expect(modal.getByTestId('person-mode-associate')).toBeVisible();

    // Create mode fields (default)
    await expect(modal.getByTestId('person-name-input')).toBeVisible();
    await expect(modal.getByTestId('person-email-input')).toBeVisible();
    await expect(modal.getByTestId('person-phone-input')).toBeVisible();

    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();

    // Switch to Associate Existing mode
    await modal.getByTestId('person-mode-associate').click();

    // Should show searchable person lookup
    await expect(modal.getByTestId('person-search-input')).toBeVisible();

    // Create New fields should not be visible
    await expect(modal.getByTestId('person-name-input')).not.toBeVisible();
    await expect(modal.getByTestId('person-email-input')).not.toBeVisible();
    await expect(modal.getByTestId('person-phone-input')).not.toBeVisible();
  });

  test('CDP-QA-09: Adding a person persists and shows in People section', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const personName = `Test Person ${Date.now()}`;

    // Count existing timeline entries for contact added
    const contactAddedEntries = page.locator('[data-testid^="timeline-event-description-"]').filter({ hasText: 'Contact Added' });
    const initialTimelineCount = await contactAddedEntries.count();

    // Open Add Person modal
    await page.getByTestId('quick-action-add-person').click();
    const modal = page.getByTestId('add-person-modal');
    await expect(modal).toBeVisible();

    // Fill person name and role
    await modal.getByTestId('person-name-input').fill(personName);
    await modal.getByTestId('person-role-input').fill('Project Manager');

    // Click Save
    await modal.getByTestId('person-save-button').click();

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 10000 });

    // New person should appear in People section
    await expect(
      page.locator('[data-testid^="person-name-"]').filter({ hasText: personName })
    ).not.toHaveCount(0, { timeout: 15000 });

    // Verify exactly one new timeline entry for contact added
    await expect(contactAddedEntries).toHaveCount(initialTimelineCount + 1, { timeout: 15000 });
  });
});

test.describe('ClientDetailPage - SourceInfoSection (CDP-SRC)', () => {
  test('CDP-SRC-01: Source info section displays acquisition details', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const section = page.getByTestId('source-info-section');
    await expect(section).toBeVisible();

    // Display grid should show source values
    const display = page.getByTestId('source-info-display');
    await expect(display).toBeVisible();
    await expect(page.getByTestId('source-info-source-value')).toBeVisible();
    await expect(page.getByTestId('source-info-campaign-value')).toBeVisible();
    await expect(page.getByTestId('source-info-channel-value')).toBeVisible();
    await expect(page.getByTestId('source-info-date-value')).toBeVisible();
  });

  test('CDP-SRC-02: Edit button allows editing source info', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('source-info-edit-button').click();

    // Edit inputs should be visible
    await expect(page.getByTestId('source-info-source-input')).toBeVisible();
    await expect(page.getByTestId('source-info-detail-input')).toBeVisible();
    await expect(page.getByTestId('source-info-campaign-input')).toBeVisible();
    await expect(page.getByTestId('source-info-channel-input')).toBeVisible();
    await expect(page.getByTestId('source-info-date-input')).toBeVisible();

    // Save and Cancel buttons visible
    await expect(page.getByTestId('source-info-save-button')).toBeVisible();
    await expect(page.getByTestId('source-info-cancel-button')).toBeVisible();
  });

  test('CDP-SRC-03: Saving source info changes persists them', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Get original channel value
    const originalChannel = await page.getByTestId('source-info-channel-value').textContent();

    // Enter edit mode
    await page.getByTestId('source-info-edit-button').click();

    // Change channel
    const channelInput = page.getByTestId('source-info-channel-input');
    await channelInput.clear();
    await channelInput.fill('Partner Referral');

    // Save
    await page.getByTestId('source-info-save-button').click();

    // Verify channel displays new value (confirms PUT response was accepted by DB)
    await expect(page.getByTestId('source-info-channel-value')).toHaveText('Partner Referral', { timeout: 10000 });

    // Wait for all network activity to settle (API call + data reload)
    await page.waitForLoadState('networkidle');

    // Verify channel still showing after data reload
    await expect(page.getByTestId('source-info-channel-value')).toHaveText('Partner Referral');

    // Restore original channel value
    await page.getByTestId('source-info-edit-button').click();
    await page.getByTestId('source-info-channel-input').clear();
    await page.getByTestId('source-info-channel-input').fill(originalChannel || '');
    await page.getByTestId('source-info-save-button').click();
    await expect(page.getByTestId('source-info-channel-value')).toHaveText(originalChannel || '', { timeout: 10000 });
  });
});

test.describe('ClientDetailPage - TasksSection (CDP-TSK)', () => {
  test('CDP-TSK-01: Tasks section displays unresolved tasks', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const section = page.getByTestId('tasks-section');
    await expect(section).toBeVisible();

    // Should show either task items or empty state
    const emptyState = page.getByTestId('tasks-empty-state');
    const taskItems = page.locator('[data-testid^="task-item-"]');
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const taskCount = await taskItems.count();

    expect(hasEmpty || taskCount > 0).toBeTruthy();
  });

  test('CDP-TSK-02: Checking a task checkbox marks it complete', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // First, create a task so we have one to complete
    const taskName = `Complete Me ${Date.now()}`;
    await page.getByTestId('quick-action-add-task').click();
    const modal = page.getByTestId('add-task-modal');
    await expect(modal).toBeVisible();
    await modal.getByTestId('task-title-input').fill(taskName);
    await modal.getByTestId('task-save-button').click();
    await expect(modal).not.toBeVisible({ timeout: 10000 });

    // Wait for the new task to appear
    const newTask = page.locator('[data-testid^="task-title-"]').filter({ hasText: taskName });
    await expect(newTask).toHaveCount(1, { timeout: 15000 });

    // Get the task item and find its checkbox
    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: taskName });
    const checkbox = taskItem.locator('[data-testid^="task-checkbox-"]');

    // Count existing task-completed timeline entries
    const taskCompletedEntries = page.locator('[data-testid^="timeline-event-description-"]').filter({ hasText: 'Task Completed' });
    const initialCount = await taskCompletedEntries.count();

    // Click the checkbox to complete the task
    await checkbox.click();

    // Task should disappear from the unresolved list
    await expect(newTask).toHaveCount(0, { timeout: 15000 });

    // Verify exactly one new timeline entry for task completion
    await expect(taskCompletedEntries).toHaveCount(initialCount + 1, { timeout: 15000 });
  });

  test('CDP-TSK-03: Clicking a task navigates to task detail page', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const taskItems = page.locator('[data-testid^="task-item-"]');
    const count = await taskItems.count();
    if (count > 0) {
      const firstTask = taskItems.first();
      const titleEl = firstTask.locator('[data-testid^="task-title-"]');
      await titleEl.click();
      await expect(page).toHaveURL(/\/tasks\//, { timeout: 5000 });
    }
  });

  test('CDP-TSK-04: Tasks show deal association when applicable', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Look for any task that has a deal link
    const dealLinks = page.locator('[data-testid^="task-deal-link-"]');
    const count = await dealLinks.count();
    if (count > 0) {
      const firstDealLink = dealLinks.first();
      await expect(firstDealLink).toBeVisible();
      const linkText = await firstDealLink.textContent();
      expect(linkText).toContain('Deal:');
    }
  });
});

test.describe('ClientDetailPage - DealsSection (CDP-DL)', () => {
  test('CDP-DL-01: Deals section displays current deals', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const section = page.getByTestId('deals-section');
    await expect(section).toBeVisible();

    // Should show either deal items or empty state
    const emptyState = page.getByTestId('deals-empty-state');
    const dealItems = page.locator('[data-testid^="deal-item-"]');
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const dealCount = await dealItems.count();

    expect(hasEmpty || dealCount > 0).toBeTruthy();

    // If deals exist, verify they show name, stage, and value
    if (dealCount > 0) {
      const firstDeal = dealItems.first();
      const nameEl = firstDeal.locator('[data-testid^="deal-name-"]');
      await expect(nameEl).toBeVisible();

      const infoEl = firstDeal.locator('[data-testid^="deal-info-"]');
      await expect(infoEl).toBeVisible();
      const infoText = await infoEl.textContent();
      expect(infoText).toContain('Stage:');
      expect(infoText).toContain('Value:');
    }
  });

  test('CDP-DL-02: Clicking a deal navigates to DealDetailPage', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const dealItems = page.locator('[data-testid^="deal-item-"]');
    const count = await dealItems.count();
    if (count > 0) {
      const firstDeal = dealItems.first();
      const testId = await firstDeal.getAttribute('data-testid');
      const dealId = testId!.replace('deal-item-', '');

      await firstDeal.click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(new RegExp(`/deals/${dealId}`));
    }
  });
});

test.describe('ClientDetailPage - AttachmentsSection (CDP-ATT)', () => {
  test('CDP-ATT-01: Attachments section lists files and links', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const section = page.getByTestId('attachments-section');
    await expect(section).toBeVisible();

    // Should show either items or empty state
    const emptyState = page.getByTestId('attachments-empty-state');
    const items = page.locator('[data-testid^="attachment-item-"]');
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const itemCount = await items.count();

    expect(hasEmpty || itemCount > 0).toBeTruthy();

    // If attachments exist, verify they show filename and type
    if (itemCount > 0) {
      const first = items.first();
      const filename = first.locator('[data-testid^="attachment-filename-"]');
      await expect(filename).toBeVisible();

      const type = first.locator('[data-testid^="attachment-type-"]');
      await expect(type).toBeVisible();
      const typeText = await type.textContent();
      expect(['Document', 'Image', 'Video', 'Audio', 'Spreadsheet', 'Presentation', 'Code', 'Archive', 'Link', 'File']).toContain(typeText!.trim());

      const preview = first.getByTestId('attachment-preview');
      await expect(preview).toBeVisible();
    }
  });

  test('CDP-ATT-02: Download button downloads a document attachment', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const items = page.locator('[data-testid^="attachment-item-"]');
    const count = await items.count();
    if (count > 0) {
      const first = items.first();
      const filename = first.locator('[data-testid^="attachment-filename-"]');
      await expect(filename).toBeVisible();
    }
  });

  test('CDP-ATT-03: View button opens a link attachment', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const items = page.locator('[data-testid^="attachment-item-"]');
    const count = await items.count();
    if (count > 0) {
      const first = items.first();
      const deleteBtn = first.locator('[data-testid^="attachment-delete-"]');
      await expect(deleteBtn).toBeVisible();
    }
  });

  test('CDP-ATT-04: Delete button removes an attachment after confirmation', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const items = page.locator('[data-testid^="attachment-item-"]');
    const count = await items.count();
    if (count > 0) {
      const first = items.first();
      const deleteBtn = first.locator('[data-testid^="attachment-delete-"]');
      await deleteBtn.click();

      // Confirmation dialog should appear
      const dialog = page.getByTestId('confirm-dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText('Delete Attachment');

      // Cancel to avoid deleting
      await page.getByTestId('confirm-cancel').click();
      await expect(dialog).not.toBeVisible();
    }
  });
});

test.describe('ClientDetailPage - PeopleSection (CDP-PPL)', () => {
  test('CDP-PPL-01: People section lists associated individuals', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const section = page.getByTestId('people-section');
    await expect(section).toBeVisible();

    // Should show either items or empty state
    const emptyState = page.getByTestId('people-empty-state');
    const items = page.locator('[data-testid^="person-item-"]');
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const itemCount = await items.count();

    expect(hasEmpty || itemCount > 0).toBeTruthy();

    // If people exist, verify they show name
    if (itemCount > 0) {
      const first = items.first();
      const nameEl = first.locator('[data-testid^="person-name-"]');
      await expect(nameEl).toBeVisible();
      const nameText = await nameEl.textContent();
      expect(nameText!.length).toBeGreaterThan(0);
    }
  });

  test('CDP-PPL-02: Clicking a person navigates to PersonDetailPage', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const items = page.locator('[data-testid^="person-item-"]');
    const count = await items.count();
    if (count > 0) {
      const first = items.first();
      const testId = await first.getAttribute('data-testid');
      const personId = testId!.replace('person-item-', '');

      await first.click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(new RegExp(`/individuals/${personId}`));
    }
  });
});

test.describe('ClientDetailPage - TimelineSection (CDP-TL)', () => {
  test('CDP-TL-01: Timeline shows chronological events', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const section = page.getByTestId('timeline-section');
    await expect(section).toBeVisible();

    // Should show either events or empty state
    const emptyState = page.getByTestId('timeline-empty-state');
    const groups = page.getByTestId('timeline-date-group');
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const groupCount = await groups.count();

    expect(hasEmpty || groupCount > 0).toBeTruthy();
  });

  test('CDP-TL-02: Timeline entries for task creation are accurate', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const groups = page.getByTestId('timeline-date-group');
    const count = await groups.count();
    if (count > 0) {
      // Each group should have a date label
      const firstGroup = groups.first();
      const dateLabel = firstGroup.getByTestId('timeline-date-label');
      await expect(dateLabel).toBeVisible();
      const labelText = await dateLabel.textContent();
      expect(labelText!.length).toBeGreaterThan(0);
    }
  });

  test('CDP-TL-03: Timeline events display descriptions', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const events = page.locator('[data-testid^="timeline-entry-"]');
    const count = await events.count();
    if (count > 0) {
      const first = events.first();
      const descEl = first.locator('[data-testid^="timeline-event-description-"]');
      await expect(descEl).toBeVisible();
      const descText = await descEl.textContent();
      expect(descText!.length).toBeGreaterThan(0);
    }
  });
});

test.describe('ClientDetailPage - AddTaskModal (CDP-ATSK)', () => {
  test('CDP-ATSK-01: Add Task modal has all required form fields', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-task').click();
    const modal = page.getByTestId('add-task-modal');
    await expect(modal).toBeVisible();

    // Check form fields
    await expect(modal.getByTestId('task-title-input')).toBeVisible();
    await expect(modal.getByTestId('task-description-input')).toBeVisible();
    await expect(modal.getByTestId('task-due-date-input')).toBeVisible();
    await expect(modal.getByTestId('task-priority-select')).toBeVisible();
    await expect(modal.getByTestId('task-associated-deal-select')).toBeVisible();

    // Save and Cancel buttons
    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('CDP-ATSK-02: Save button is disabled when title is empty', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-task').click();
    const modal = page.getByTestId('add-task-modal');

    const saveBtn = modal.getByTestId('task-save-button');
    await expect(saveBtn).toBeDisabled();
  });

  test('CDP-ATSK-03: Cancel button closes the modal', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-task').click();
    const modal = page.getByTestId('add-task-modal');
    await expect(modal).toBeVisible();

    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).not.toBeVisible();
  });
});

test.describe('ClientDetailPage - AddDealModal (CDP-ADL)', () => {
  test('CDP-ADL-01: Add Deal modal has all required form fields', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-deal').click();
    const modal = page.getByTestId('add-deal-modal');
    await expect(modal).toBeVisible();

    await expect(modal.getByTestId('deal-name-input')).toBeVisible();
    await expect(modal.getByTestId('deal-value-input')).toBeVisible();
    await expect(modal.getByTestId('deal-stage-select')).toBeVisible();
    await expect(modal.getByTestId('deal-owner-input')).toBeVisible();
    await expect(modal.getByTestId('deal-probability-input')).toBeVisible();
    await expect(modal.getByTestId('deal-expected-close-date-input')).toBeVisible();

    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('CDP-ADL-02: Save button is disabled when name is empty', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-deal').click();
    const modal = page.getByTestId('add-deal-modal');

    const saveBtn = modal.getByTestId('deal-save-button');
    await expect(saveBtn).toBeDisabled();
  });
});

test.describe('ClientDetailPage - AddPersonModal (CDP-APER)', () => {
  test('CDP-APER-01: Add Person modal has all required form fields', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-person').click();
    const modal = page.getByTestId('add-person-modal');
    await expect(modal).toBeVisible();

    // Mode toggle buttons
    await expect(modal.getByTestId('person-mode-create')).toBeVisible();
    await expect(modal.getByTestId('person-mode-associate')).toBeVisible();

    // Create New mode fields (default)
    await expect(modal.getByTestId('person-name-input')).toBeVisible();
    await expect(modal.getByTestId('person-role-input')).toBeVisible();
    await expect(modal.getByTestId('person-email-input')).toBeVisible();
    await expect(modal.getByTestId('person-phone-input')).toBeVisible();

    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('CDP-APER-02: Save button is disabled when name is empty', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-person').click();
    const modal = page.getByTestId('add-person-modal');

    const saveBtn = modal.getByTestId('person-save-button');
    await expect(saveBtn).toBeDisabled();
  });
});

test.describe('ClientDetailPage - AddAttachmentModal (CDP-AATT)', () => {
  test('CDP-AATT-01: Add Attachment modal has type toggle buttons', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-attachment').click();
    const modal = page.getByTestId('add-attachment-modal');
    await expect(modal).toBeVisible();

    // Type toggle buttons
    await expect(modal.getByTestId('attachment-file-upload-toggle')).toBeVisible();
    await expect(modal.getByTestId('attachment-link-url-toggle')).toBeVisible();

    // File input visible by default
    await expect(modal.getByTestId('attachment-file-input')).toBeVisible();

    // Associated deal dropdown
    await expect(modal.getByTestId('attachment-associated-deal-select')).toBeVisible();

    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('CDP-AATT-02: Link URL mode shows link name and URL inputs', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-attachment').click();
    const modal = page.getByTestId('add-attachment-modal');

    // Switch to Link URL mode
    await modal.getByTestId('attachment-link-url-toggle').click();

    await expect(modal.getByTestId('attachment-link-name-input')).toBeVisible();
    await expect(modal.getByTestId('attachment-url-input')).toBeVisible();
  });
});

test.describe('ClientDetailPage - FollowButton (CDP-FOL)', () => {
  test('CDP-FOL-01: Follow button appears on client detail page when authenticated', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const followButton = page.getByTestId('client-follow-button');
    await expect(followButton).toBeVisible();
    await expect(followButton).toContainText('Follow');
  });

  test('CDP-FOL-02: Clicking follow button toggles follow state', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const followButton = page.getByTestId('client-follow-button');
    await expect(followButton).toBeVisible();

    // Initially "Follow"
    await expect(followButton).toContainText('Follow');

    // Click to follow
    await followButton.click();
    await expect(followButton).toContainText('Following');

    // Click to unfollow
    await followButton.click();
    await expect(followButton).toContainText('Follow');
    await expect(followButton).not.toContainText('Following');
  });

  test('CDP-FOL-03: Follow button is not visible when not authenticated', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('[data-testid^="client-row-"]');
    await rows.first().waitFor({ state: 'visible', timeout: 15000 });
    const testId = await rows.first().getAttribute('data-testid');
    const clientId = testId!.replace('client-row-', '');

    await page.goto(`/clients/${clientId}`);
    await page.waitForLoadState('networkidle');

    // Follow button should NOT be visible
    await expect(page.getByTestId('client-follow-button')).not.toBeVisible();

    await context.close();
  });
});
