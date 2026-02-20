import { test, expect } from './base';

async function navigateToFirstTaskDetail(page: import('@playwright/test').Page) {
  await page.goto('/tasks');
  await page.waitForLoadState('networkidle');

  const card = page.locator('[data-testid^="task-card-"]').first();
  await card.waitFor({ state: 'visible', timeout: 15000 });
  await card.click();
  await page.waitForLoadState('networkidle');

  await expect(page.getByTestId('task-detail-page')).toBeVisible();
}

test.describe('TaskDetailPage - Header (TDP-HDR)', () => {
  test('TDP-HDR-01: Task detail page displays task information', async ({ page }) => {
    await navigateToFirstTaskDetail(page);

    // Title and priority badge visible
    await expect(page.getByTestId('task-detail-title')).toBeVisible();
    const title = await page.getByTestId('task-detail-title').textContent();
    expect(title!.trim().length).toBeGreaterThan(0);

    // Description visible (if present on the task)
    const descriptionEl = page.getByTestId('task-detail-description');
    const descriptionCount = await descriptionEl.count();
    if (descriptionCount > 0) {
      await expect(descriptionEl).toBeVisible();
    }

    // Status visible
    await expect(page.getByTestId('task-detail-status')).toBeVisible();
    const status = await page.getByTestId('task-detail-status').textContent();
    expect(['Open', 'Completed']).toContain(status!.trim());

    // Notes section visible
    await expect(page.getByTestId('task-notes-section')).toBeVisible();
  });

  test('TDP-HDR-02: Mark Complete changes task status', async ({ page }) => {
    // Create a task with a client association for timeline verification
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('new-task-button').click();
    const modal = page.getByTestId('create-task-modal');
    await expect(modal).toBeVisible();

    const taskTitle = `CompleteTest_${Date.now()}`;
    await page.getByTestId('create-task-title').fill(taskTitle);

    // Select a client so the timeline entry can be verified
    await page.getByTestId('create-task-client-trigger').click();
    const clientMenu = page.getByTestId('create-task-client-menu');
    await expect(clientMenu).toBeVisible();
    // Pick the first non-empty client option
    const clientOption = clientMenu.locator('[data-testid^="create-task-client-option-"]').filter({ hasNotText: 'None' }).first();
    await clientOption.click();

    await page.getByTestId('create-task-save').click();
    await expect(modal).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    // Find and click the created task
    await expect(async () => {
      const card = page.locator(`[data-testid^="task-card-"]`, { hasText: taskTitle });
      await expect(card).toBeVisible();
    }).toPass({ timeout: 10000 });

    await page.locator(`[data-testid^="task-card-"]`, { hasText: taskTitle }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('task-detail-page')).toBeVisible();

    // Capture the task detail URL so we can verify persistence
    const taskUrl = page.url();

    // Mark complete
    await page.getByTestId('task-detail-mark-complete').click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    await page.getByTestId('confirm-ok').click();
    await page.waitForLoadState('networkidle');

    // Status should change to Completed
    await expect(page.getByTestId('task-detail-status')).toContainText('Completed');

    // Completed date should be shown
    await expect(page.getByTestId('task-detail-completed-at')).toBeVisible();

    // Mark Complete and Cancel Task buttons should be hidden
    await expect(page.getByTestId('task-detail-mark-complete')).not.toBeVisible();
    await expect(page.getByTestId('task-detail-mark-canceled')).not.toBeVisible();

    // Verify persistence: reload the page and confirm status is still Completed
    await page.goto(taskUrl);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('task-detail-status')).toContainText('Completed');

    // Verify timeline side effect: navigate to associated client and check timeline
    const clientSpan = page.getByTestId('task-detail-client');
    if (await clientSpan.isVisible()) {
      const clientText = await clientSpan.textContent();
      const clientName = clientText!.replace('Client:', '').trim();
      // Navigate to the clients list and find this client
      await page.goto('/clients');
      await page.waitForLoadState('networkidle');
      const clientRow = page.locator('[data-testid^="client-row-"]', { hasText: clientName }).first();
      await clientRow.click();
      await page.waitForLoadState('networkidle');
      const timeline = page.getByTestId('timeline-section');
      await expect(timeline).toContainText('Task Completed');
    }
  });

  test('TDP-HDR-03: Cancel Task deletes task and redirects', async ({ page }) => {
    // Create a task specifically for this test
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('new-task-button').click();
    const modal = page.getByTestId('create-task-modal');
    await expect(modal).toBeVisible();

    const taskTitle = `CancelTest_${Date.now()}`;
    await page.getByTestId('create-task-title').fill(taskTitle);
    await page.getByTestId('create-task-save').click();
    await expect(modal).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    // Find and click the created task
    await expect(async () => {
      const card = page.locator(`[data-testid^="task-card-"]`, { hasText: taskTitle });
      await expect(card).toBeVisible();
    }).toPass({ timeout: 10000 });

    await page.locator(`[data-testid^="task-card-"]`, { hasText: taskTitle }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('task-detail-page')).toBeVisible();

    // Cancel (delete) the task
    await page.getByTestId('task-detail-mark-canceled').click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    await page.getByTestId('confirm-ok').click();
    await page.waitForLoadState('networkidle');

    // Should redirect to tasks list
    await expect(page).toHaveURL(/\/tasks$/);

    // Task should not be in the list
    await expect(page.locator(`[data-testid^="task-card-"]`, { hasText: taskTitle })).not.toBeVisible();
  });

  test('TDP-HDR-04: Back button navigates to tasks list', async ({ page }) => {
    await navigateToFirstTaskDetail(page);

    await page.getByTestId('task-detail-back').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/tasks$/);
  });
});

test.describe('TaskDetailPage - Notes (TDP-NTS)', () => {
  test('TDP-NTS-01: Notes section shows empty state', async ({ page }) => {
    // Create a fresh task with no notes
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('new-task-button').click();
    const modal = page.getByTestId('create-task-modal');
    await expect(modal).toBeVisible();

    const taskTitle = `NotesTest_${Date.now()}`;
    await page.getByTestId('create-task-title').fill(taskTitle);
    await page.getByTestId('create-task-save').click();
    await expect(modal).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    await expect(async () => {
      const card = page.locator(`[data-testid^="task-card-"]`, { hasText: taskTitle });
      await expect(card).toBeVisible();
    }).toPass({ timeout: 10000 });

    await page.locator(`[data-testid^="task-card-"]`, { hasText: taskTitle }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('task-notes-empty')).toBeVisible();
    await expect(page.getByTestId('task-notes-empty')).toContainText('No notes yet');
  });

  test('TDP-NTS-02: Adding a note persists and shows in list', async ({ page }) => {
    await navigateToFirstTaskDetail(page);

    const noteContent = `Test note ${Date.now()}`;
    await page.getByTestId('task-note-input').fill(noteContent);
    await page.getByTestId('task-note-add').click();
    await page.waitForLoadState('networkidle');

    // Note should appear in the list
    await expect(async () => {
      const notesSection = page.getByTestId('task-notes-section');
      await expect(notesSection).toContainText(noteContent);
    }).toPass({ timeout: 10000 });

    // Input should be cleared
    await expect(page.getByTestId('task-note-input')).toHaveValue('');

    // Verify persistence: reload and confirm note is still visible
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('task-notes-section')).toContainText(noteContent);
  });

  test('TDP-NTS-03: Deleting a note removes it from list', async ({ page }) => {
    await navigateToFirstTaskDetail(page);

    // First add a note
    const noteContent = `DeleteNote_${Date.now()}`;
    await page.getByTestId('task-note-input').fill(noteContent);
    await page.getByTestId('task-note-add').click();
    await page.waitForLoadState('networkidle');

    // Verify it appeared
    await expect(async () => {
      const notesSection = page.getByTestId('task-notes-section');
      await expect(notesSection).toContainText(noteContent);
    }).toPass({ timeout: 10000 });

    // Find and delete the note
    const noteEl = page.locator(`[data-testid^="task-note-"]`, { hasText: noteContent }).first();
    const deleteBtn = noteEl.locator('[data-testid^="task-note-delete-"]');
    await deleteBtn.click();
    await page.waitForLoadState('networkidle');

    // Note should be gone
    await expect(page.getByTestId('task-notes-section')).not.toContainText(noteContent);

    // Verify persistence: reload and confirm note is still removed
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('task-notes-section')).not.toContainText(noteContent);
  });
});
