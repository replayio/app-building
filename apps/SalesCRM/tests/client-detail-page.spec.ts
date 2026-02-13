import { test, expect } from '@playwright/test';

/**
 * Helper: navigate to the first client's detail page.
 * Goes to /clients, grabs the first row's ID, and navigates.
 * Returns the clientId.
 */
async function navigateToFirstClientDetail(page: import('@playwright/test').Page): Promise<string> {
  await page.goto('/clients');
  await page.waitForLoadState('networkidle');

  const rows = page.locator('[data-testid^="client-row-"]');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);

  const testId = await rows.first().getAttribute('data-testid');
  const clientId = testId!.replace('client-row-', '');

  await page.goto(`/clients/${clientId}`);
  await page.waitForLoadState('networkidle');
  return clientId;
}

test.describe('ClientDetailPage - ClientHeader (CDP-HDR)', () => {
  test('CDP-HDR-01: Client header displays client name, type badge, and status', async ({ page }) => {
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
  });

  test('CDP-HDR-02: Edit button opens edit mode with form fields', async ({ page }) => {
    await navigateToFirstClientDetail(page);

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
  });

  test('CDP-HDR-03: Cancel edit mode restores original values', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Get original name
    const originalName = await page.getByTestId('client-header-title').textContent();

    // Enter edit mode
    await page.getByTestId('client-header-edit-button').click();

    // Change name
    const nameInput = page.getByTestId('client-header-name-input');
    await nameInput.clear();
    await nameInput.fill('Changed Name');

    // Cancel
    await page.getByTestId('client-header-cancel-button').click();

    // Name should be restored to original
    await expect(page.getByTestId('client-header-title')).toHaveText(originalName!);
  });

  test('CDP-HDR-04: Status dropdown shows all status options', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Click status dropdown button
    await page.getByTestId('status-dropdown-button').click();

    // All status options should be visible
    const options = page.getByTestId('status-dropdown-options');
    await expect(options).toBeVisible();
    await expect(page.getByTestId('status-dropdown-option-active')).toBeVisible();
    await expect(page.getByTestId('status-dropdown-option-inactive')).toBeVisible();
    await expect(page.getByTestId('status-dropdown-option-prospect')).toBeVisible();
    await expect(page.getByTestId('status-dropdown-option-churned')).toBeVisible();
  });

  test('CDP-HDR-05: Tags are displayed in the header', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Tags container should exist
    const tagsContainer = page.getByTestId('client-header-tags');
    await expect(tagsContainer).toBeVisible();
  });
});

test.describe('ClientDetailPage - QuickActions (CDP-QA)', () => {
  test('CDP-QA-01: Quick action buttons are all visible', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const quickActions = page.getByTestId('quick-actions');
    await expect(quickActions).toBeVisible();

    await expect(page.getByTestId('quick-action-add-task')).toBeVisible();
    await expect(page.getByTestId('quick-action-add-deal')).toBeVisible();
    await expect(page.getByTestId('quick-action-add-attachment')).toBeVisible();
    await expect(page.getByTestId('quick-action-add-person')).toBeVisible();
  });

  test('CDP-QA-02: Add Task button opens Add Task modal', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-task').click();
    await expect(page.getByTestId('add-task-modal')).toBeVisible();
  });

  test('CDP-QA-03: Add Deal button opens Add Deal modal', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-deal').click();
    await expect(page.getByTestId('add-deal-modal')).toBeVisible();
  });

  test('CDP-QA-04: Add Attachment button opens Add Attachment modal', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-attachment').click();
    await expect(page.getByTestId('add-attachment-modal')).toBeVisible();
  });

  test('CDP-QA-05: Add Person button opens Add Person modal', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-person').click();
    await expect(page.getByTestId('add-person-modal')).toBeVisible();
  });
});

test.describe('ClientDetailPage - SourceInfo (CDP-SRC)', () => {
  test('CDP-SRC-01: Source info section displays with source data', async ({ page }) => {
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

  test('CDP-SRC-02: Edit button opens source info edit mode', async ({ page }) => {
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

  test('CDP-SRC-03: Cancel edit restores original source values', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Get original source value
    const originalSource = await page.getByTestId('source-info-source-value').textContent();

    // Enter edit mode
    await page.getByTestId('source-info-edit-button').click();

    // Modify a field
    const sourceInput = page.getByTestId('source-info-source-input');
    await sourceInput.clear();
    await sourceInput.fill('Modified Source');

    // Cancel
    await page.getByTestId('source-info-cancel-button').click();

    // Value should be restored
    await expect(page.getByTestId('source-info-source-value')).toHaveText(originalSource!);
  });
});

test.describe('ClientDetailPage - Tasks (CDP-TSK)', () => {
  test('CDP-TSK-01: Tasks section is visible', async ({ page }) => {
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

  test('CDP-TSK-02: Task items display title', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const taskItems = page.locator('[data-testid^="task-item-"]');
    const count = await taskItems.count();
    if (count > 0) {
      const firstTask = taskItems.first();
      const titleEl = firstTask.locator('[data-testid^="task-title-"]');
      await expect(titleEl).toBeVisible();
      const titleText = await titleEl.textContent();
      expect(titleText!.length).toBeGreaterThan(0);
    }
  });

  test('CDP-TSK-03: Task items have a checkbox for toggling completion', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const taskItems = page.locator('[data-testid^="task-item-"]');
    const count = await taskItems.count();
    if (count > 0) {
      const firstTask = taskItems.first();
      const checkbox = firstTask.locator('[data-testid^="task-checkbox-"]');
      await expect(checkbox).toBeVisible();
    }
  });
});

test.describe('ClientDetailPage - Deals (CDP-DL)', () => {
  test('CDP-DL-01: Deals section is visible', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const section = page.getByTestId('deals-section');
    await expect(section).toBeVisible();

    // Should show either deal items or empty state
    const emptyState = page.getByTestId('deals-empty-state');
    const dealItems = page.locator('[data-testid^="deal-item-"]');
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const dealCount = await dealItems.count();

    expect(hasEmpty || dealCount > 0).toBeTruthy();
  });

  test('CDP-DL-02: Deal items display name, stage, and value', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const dealItems = page.locator('[data-testid^="deal-item-"]');
    const count = await dealItems.count();
    if (count > 0) {
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

  test('CDP-DL-03: Clicking a deal navigates to deal detail page', async ({ page }) => {
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

test.describe('ClientDetailPage - Attachments (CDP-ATT)', () => {
  test('CDP-ATT-01: Attachments section is visible', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const section = page.getByTestId('attachments-section');
    await expect(section).toBeVisible();

    // Should show either items or empty state
    const emptyState = page.getByTestId('attachments-empty-state');
    const items = page.locator('[data-testid^="attachment-item-"]');
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const itemCount = await items.count();

    expect(hasEmpty || itemCount > 0).toBeTruthy();
  });

  test('CDP-ATT-02: Attachment items display filename and type', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const items = page.locator('[data-testid^="attachment-item-"]');
    const count = await items.count();
    if (count > 0) {
      const first = items.first();
      const filename = first.locator('[data-testid^="attachment-filename-"]');
      await expect(filename).toBeVisible();

      const type = first.locator('[data-testid^="attachment-type-"]');
      await expect(type).toBeVisible();
      const typeText = await type.textContent();
      expect(['Document', 'Link']).toContain(typeText!.trim());
    }
  });

  test('CDP-ATT-03: Attachment items have a delete button', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const items = page.locator('[data-testid^="attachment-item-"]');
    const count = await items.count();
    if (count > 0) {
      const first = items.first();
      const deleteBtn = first.locator('[data-testid^="attachment-delete-"]');
      await expect(deleteBtn).toBeVisible();
    }
  });

  test('CDP-ATT-04: Delete attachment shows confirmation dialog', async ({ page }) => {
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

test.describe('ClientDetailPage - People (CDP-PPL)', () => {
  test('CDP-PPL-01: People section is visible', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const section = page.getByTestId('people-section');
    await expect(section).toBeVisible();

    // Should show either items or empty state
    const emptyState = page.getByTestId('people-empty-state');
    const items = page.locator('[data-testid^="person-item-"]');
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const itemCount = await items.count();

    expect(hasEmpty || itemCount > 0).toBeTruthy();
  });

  test('CDP-PPL-02: Person items display name', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    const items = page.locator('[data-testid^="person-item-"]');
    const count = await items.count();
    if (count > 0) {
      const first = items.first();
      const nameEl = first.locator('[data-testid^="person-name-"]');
      await expect(nameEl).toBeVisible();
      const nameText = await nameEl.textContent();
      expect(nameText!.length).toBeGreaterThan(0);
    }
  });

  test('CDP-PPL-03: Clicking a person navigates to individual detail page', async ({ page }) => {
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

test.describe('ClientDetailPage - Timeline (CDP-TL)', () => {
  test('CDP-TL-01: Timeline section is visible', async ({ page }) => {
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

  test('CDP-TL-02: Timeline events are grouped by date', async ({ page }) => {
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

    const events = page.locator('[data-testid^="timeline-event-"]:not([data-testid*="description"]):not([data-testid*="user"])');
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
    await expect(modal.getByText('Task Title *')).toBeVisible();
    await expect(modal.getByText('Description')).toBeVisible();
    await expect(modal.getByText('Due Date')).toBeVisible();
    await expect(modal.getByText('Priority')).toBeVisible();
    await expect(modal.getByText('Associated Deal (optional)')).toBeVisible();

    // Save and Cancel buttons
    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('CDP-ATSK-02: Save button is disabled when title is empty', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-task').click();
    const modal = page.getByTestId('add-task-modal');

    const saveBtn = modal.getByRole('button', { name: 'Save' });
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

    await expect(modal.getByText('Deal Name *')).toBeVisible();
    await expect(modal.getByText('Value ($)')).toBeVisible();
    await expect(modal.getByText('Stage')).toBeVisible();
    await expect(modal.getByText('Owner')).toBeVisible();
    await expect(modal.getByText('Probability (%)')).toBeVisible();
    await expect(modal.getByText('Expected Close Date')).toBeVisible();

    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('CDP-ADL-02: Save button is disabled when name is empty', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-deal').click();
    const modal = page.getByTestId('add-deal-modal');

    const saveBtn = modal.getByRole('button', { name: 'Save' });
    await expect(saveBtn).toBeDisabled();
  });
});

test.describe('ClientDetailPage - AddPersonModal (CDP-APER)', () => {
  test('CDP-APER-01: Add Person modal has all required form fields', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-person').click();
    const modal = page.getByTestId('add-person-modal');
    await expect(modal).toBeVisible();

    await expect(modal.getByText('Name *')).toBeVisible();
    await expect(modal.getByText('Role/Title')).toBeVisible();
    await expect(modal.getByText('Email')).toBeVisible();
    await expect(modal.getByText('Phone')).toBeVisible();

    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('CDP-APER-02: Save button is disabled when name is empty', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-person').click();
    const modal = page.getByTestId('add-person-modal');

    const saveBtn = modal.getByRole('button', { name: 'Save' });
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
    await expect(modal.getByRole('button', { name: 'File Upload' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Link URL' })).toBeVisible();

    // Associated deal dropdown
    await expect(modal.getByText('Associated Deal (optional)')).toBeVisible();

    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('CDP-AATT-02: Link URL mode shows link name and URL inputs', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    await page.getByTestId('quick-action-add-attachment').click();
    const modal = page.getByTestId('add-attachment-modal');

    // Switch to Link URL mode
    await modal.getByRole('button', { name: 'Link URL' }).click();

    await expect(modal.getByText('Link Name')).toBeVisible();
    await expect(modal.getByText('URL *')).toBeVisible();
  });
});
