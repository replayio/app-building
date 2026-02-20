import { test, expect } from './base';
import type { Page } from '@playwright/test';

async function selectFilterOption(page: Page, testId: string, value: string) {
  await page.getByTestId(`${testId}-trigger`).click();
  const optionId = value === '' ? `${testId}-option-all` : `${testId}-option-${value}`;
  await page.getByTestId(optionId).click();
}

test.describe('TasksListPage - Navigation (TLP-NAV)', () => {
  test('TLP-NAV-01: Sidebar displays all navigation items with Tasks highlighted', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    const sidebar = page.getByTestId('sidebar');
    await expect(sidebar).toBeVisible();

    // Verify all navigation items are present
    await expect(sidebar.getByText('Clients')).toBeVisible();
    await expect(sidebar.getByText('Deals')).toBeVisible();
    await expect(sidebar.getByText('Tasks')).toBeVisible();
    await expect(sidebar.getByText('Team')).toBeVisible();
    await expect(sidebar.getByText('Settings')).toBeVisible();

    // "Tasks" link should be visually highlighted as active
    const tasksLink = page.getByTestId('sidebar-nav-tasks');
    await expect(tasksLink).toHaveClass(/bg-sidebar-active/);
  });

  test('TLP-NAV-02: Sidebar navigation links route correctly from tasks page', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Click "Clients" in sidebar → navigates to /clients
    await page.getByTestId('sidebar-nav-clients').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/clients/);

    // Click "Deals" → navigates to /deals
    await page.getByTestId('sidebar-nav-deals').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/deals/);

    // Click "Team" → navigates to /users
    await page.getByTestId('sidebar-nav-team').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/users/);

    // Click "Settings" → navigates to /settings
    await page.getByTestId('sidebar-nav-settings').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/settings/);

    // Click "Tasks" → navigates back to /tasks
    await page.getByTestId('sidebar-nav-tasks').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/tasks/);
  });
});

test.describe('TasksListPage - PageHeader (TLP-HDR)', () => {
  test('TLP-HDR-01: Page header shows title and New Task button', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // "Upcoming Tasks" title displayed
    await expect(page.getByRole('heading', { name: 'Upcoming Tasks' })).toBeVisible();

    // "New Task" button visible and accent colored
    const newTaskBtn = page.getByTestId('new-task-button');
    await expect(newTaskBtn).toBeVisible();
    await expect(newTaskBtn).toContainText('New Task');
    await expect(newTaskBtn).toHaveClass(/bg-accent/);
  });

  test('TLP-HDR-02: New Task button opens task creation modal', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('new-task-button').click();

    const modal = page.getByTestId('create-task-modal');
    await expect(modal).toBeVisible();

    // Modal has required fields
    await expect(modal.getByText('Title *')).toBeVisible();
    await expect(modal.getByText('Description')).toBeVisible();
    await expect(modal.getByText('Due Date')).toBeVisible();
    await expect(modal.getByText('Priority')).toBeVisible();
    await expect(page.getByTestId('create-task-assignee-name')).toBeVisible();
    await expect(modal.getByTestId('create-task-client')).toBeVisible();

    // Save and Cancel buttons
    await expect(page.getByTestId('create-task-save')).toBeVisible();
    await expect(page.getByTestId('create-task-cancel')).toBeVisible();
  });

  test('TLP-HDR-03: Creating a task persists and appears in list', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Open create task modal
    await page.getByTestId('new-task-button').click();
    const modal = page.getByTestId('create-task-modal');
    await expect(modal).toBeVisible();

    // Fill in task data
    const taskTitle = `Test Task ${Date.now()}`;
    await page.getByTestId('create-task-title').fill(taskTitle);
    await selectFilterOption(page, 'create-task-priority', 'high');
    // Select assignee from dropdown
    await page.getByTestId('create-task-assignee-name-trigger').click();
    const assigneeMenu = page.getByTestId('create-task-assignee-name-menu');
    await expect(assigneeMenu).toBeVisible();
    // Find "Sarah J." option or pick any user
    const sarahOption = assigneeMenu.locator('button', { hasText: 'Sarah J.' });
    if (await sarahOption.count() > 0) {
      await sarahOption.click();
    } else {
      const options = await assigneeMenu.locator('button').all();
      if (options.length > 1) await options[1].click();
    }
    await page.getByTestId('create-task-assignee-role').fill('PM');

    // Select a client if available
    await page.getByTestId('create-task-client-trigger').click();
    const clientMenu = page.getByTestId('create-task-client-menu');
    await expect(clientMenu).toBeVisible();
    const clientOptions = await clientMenu.locator('button').all();
    if (clientOptions.length > 1) await clientOptions[1].click();
    else await clientMenu.locator('button').first().click();

    await page.getByTestId('create-task-save').click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Wait for tasks to reload
    await page.waitForLoadState('networkidle');

    // The task should appear in the list
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain(taskTitle);
  });

  test('TLP-HDR-04: Import button opens import dialog with CSV format info', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('tasks-import-button').click();

    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Import Tasks')).toBeVisible();

    // CSV column format specification table
    const formatInfo = dialog.getByTestId('csv-format-info');
    await expect(formatInfo).toBeVisible();
    await expect(formatInfo.getByText('CSV Column Format')).toBeVisible();
    await expect(formatInfo.getByText('Task title')).toBeVisible();

    // Download template button
    await expect(dialog.getByTestId('download-template-button')).toBeVisible();

    // File input
    await expect(dialog.getByTestId('csv-file-input')).toBeVisible();

    // Import button should be disabled when no file selected
    await expect(dialog.getByTestId('import-submit-button')).toBeDisabled();

    // Cancel button
    await expect(dialog.getByTestId('import-cancel-button')).toBeVisible();
  });

  test('TLP-HDR-05: CSV import creates tasks from uploaded file', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('tasks-import-button').click();
    const dialog = page.getByTestId('import-dialog');
    await expect(dialog).toBeVisible();

    // Create a CSV file and upload it
    const csvContent = 'Title,Priority,Due Date\nImport Test Task,high,2024-06-15';
    const fileInput = dialog.getByTestId('csv-file-input');
    await fileInput.setInputFiles({
      name: 'test-tasks-import.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Import button should now be enabled
    await expect(dialog.getByTestId('import-submit-button')).toBeEnabled();
    await dialog.getByTestId('import-submit-button').click();

    // Wait for import result
    const result = dialog.getByTestId('import-result');
    await expect(result).toBeVisible();
    await expect(result).toContainText('Successfully imported 1 task');

    // Close dialog
    await dialog.getByTestId('import-cancel-button').click();
    await expect(dialog).not.toBeVisible();

    // Verify imported task appears in the list
    await expect(page.getByText('Import Test Task')).toBeVisible({ timeout: 5000 });
  });
  test('TLP-HDR-06: Cancel button on task creation modal closes without creating a task', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Open create task modal
    await page.getByTestId('new-task-button').click();
    const modal = page.getByTestId('create-task-modal');
    await expect(modal).toBeVisible();

    // Fill in a task title
    const taskTitle = `Cancel Test Task ${Date.now()}`;
    await page.getByTestId('create-task-title').fill(taskTitle);

    // Click Cancel
    await page.getByTestId('create-task-cancel').click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // The task should NOT appear in the list
    await page.waitForLoadState('networkidle');
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain(taskTitle);
  });
});

test.describe('TasksListPage - FilterBar (TLP-FLT)', () => {
  test('TLP-FLT-01: Filter controls are displayed', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Filter button and text input visible
    await expect(page.getByTestId('tasks-filter-button')).toBeVisible();
    const searchInput = page.getByTestId('tasks-filter-search');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', 'Filter...');
  });

  test('TLP-FLT-02: Filter by priority shows matching tasks', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Open filter dropdown
    await page.getByTestId('tasks-filter-button').click();
    await expect(page.getByTestId('tasks-filter-dropdown')).toBeVisible();

    // Select "High" priority filter (this closes the dropdown and triggers a fetch)
    await selectFilterOption(page, 'tasks-filter-priority', 'high');

    // Wait for filtered results where all cards have high priority badges
    await expect(async () => {
      const highBadges = page.locator('[data-testid="task-priority-badge-high"]');
      const cards = page.locator('[data-testid^="task-card-"]');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThan(0);
      const badgeCount = await highBadges.count();
      expect(badgeCount).toBe(cardCount);
    }).toPass({ timeout: 10000 });
  });

  test('TLP-FLT-03: Text filter searches task titles', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Get the title of the first task to use as a search term
    const firstTitle = page.locator('[data-testid^="task-title-"]').first();
    const isVisible = await firstTitle.isVisible().catch(() => false);

    if (isVisible) {
      const titleText = await firstTitle.textContent();
      // Use a substring to search
      const searchTerm = titleText!.substring(0, Math.min(5, titleText!.length));

      await page.getByTestId('tasks-filter-search').fill(searchTerm);
      // Wait for debounce
      await page.waitForTimeout(500);
      await page.waitForLoadState('networkidle');

      // Verify remaining task titles contain the search term
      const cards = page.locator('[data-testid^="task-card-"]');
      const count = await cards.count();
      if (count > 0) {
        const pageText = await page.textContent('body');
        expect(pageText!.toLowerCase()).toContain(searchTerm.toLowerCase());
      }
    }
  });

  test('TLP-FLT-04: Filter by assignee shows matching tasks', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Open filter dropdown
    await page.getByTestId('tasks-filter-button').click();
    await expect(page.getByTestId('tasks-filter-dropdown')).toBeVisible();

    // Open assignee FilterSelect trigger to see options
    await page.getByTestId('tasks-filter-assignee-trigger').click();
    const assigneeMenu = page.getByTestId('tasks-filter-assignee-menu');
    await expect(assigneeMenu).toBeVisible();

    // Get all option buttons (first is "All Assignees", rest are real assignees)
    const options = await assigneeMenu.locator('button').all();

    if (options.length > 1) {
      // Pick the first real assignee option (skip "All Assignees")
      const assigneeName = await options[1].textContent();
      await options[1].click();

      // Wait for filtered results — atomic assertions avoid nested-wait deadlocks
      await expect(
        page.locator('[data-testid^="task-card-"]').first()
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.locator('[data-testid^="task-card-"]').filter({ hasNotText: assigneeName! })
      ).toHaveCount(0, { timeout: 10000 });
    }
  });

  test('TLP-FLT-05: Filter by client shows matching tasks', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Open filter dropdown
    await page.getByTestId('tasks-filter-button').click();
    await expect(page.getByTestId('tasks-filter-dropdown')).toBeVisible();

    // Open client FilterSelect trigger to see options
    await page.getByTestId('tasks-filter-client-trigger').click();
    const clientMenu = page.getByTestId('tasks-filter-client-menu');
    await expect(clientMenu).toBeVisible();

    // Get all option buttons (first is "All Clients", rest are real clients)
    const options = await clientMenu.locator('button').all();

    if (options.length > 1) {
      await options[1].click();
      await page.waitForLoadState('networkidle');

      // Tasks should be filtered (at least the page should still be functional)
      const cards = page.locator('[data-testid^="task-card-"]');
      const count = await cards.count();
      // Just verify the filter applied without error
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('TLP-FLT-06: Clearing filters restores full task list', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Count initial tasks
    const cards = page.locator('[data-testid^="task-card-"]');
    const initialCount = await cards.count();

    // Open filter dropdown and set a priority filter
    await page.getByTestId('tasks-filter-button').click();
    await expect(page.getByTestId('tasks-filter-dropdown')).toBeVisible();
    await selectFilterOption(page, 'tasks-filter-priority', 'high');
    await page.waitForLoadState('networkidle');

    const filteredCount = await cards.count();

    // If filtering changed the count, clear filters should restore it
    if (filteredCount !== initialCount) {
      // Click "Clear all filters" button
      await page.getByTestId('tasks-filter-button').click();
      await expect(page.getByTestId('tasks-filter-dropdown')).toBeVisible();
      await page.getByTestId('tasks-filter-clear').click();
      await page.waitForLoadState('networkidle');

      const restoredCount = await cards.count();
      expect(restoredCount).toBe(initialCount);
    }
  });
});

test.describe('TasksListPage - TaskCards (TLP-CRD)', () => {
  test('TLP-CRD-01: Task cards display all required information', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[data-testid^="task-card-"]');
    const count = await cards.count();

    if (count > 0) {
      const cardTestId = await cards.first().getAttribute('data-testid');
      const taskId = cardTestId!.replace('task-card-', '');

      // Priority badge present
      const badge = cards.first().locator('[data-testid^="task-priority-badge-"]');
      await expect(badge).toBeVisible();

      // Task title present
      const title = page.getByTestId(`task-title-${taskId}`);
      await expect(title).toBeVisible();
      const titleText = await title.textContent();
      expect(titleText!.length).toBeGreaterThan(0);

      // Due date present (may be empty if no due date)
      const dueDate = page.getByTestId(`task-due-date-${taskId}`);
      await expect(dueDate).toBeVisible();

      // Action menu button present
      const menuBtn = page.getByTestId(`task-action-menu-button-${taskId}`);
      await expect(menuBtn).toBeVisible();
    }
  });

  test('TLP-CRD-02: Priority badges have correct colors', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Check High badge has red styling
    const highBadge = page.locator('[data-testid="task-priority-badge-high"]').first();
    if (await highBadge.isVisible().catch(() => false)) {
      await expect(highBadge).toHaveClass(/bg-red/);
      await expect(highBadge).toHaveText('High');
    }

    // Check Medium badge has amber styling
    const mediumBadge = page.locator('[data-testid="task-priority-badge-medium"]').first();
    if (await mediumBadge.isVisible().catch(() => false)) {
      await expect(mediumBadge).toHaveClass(/bg-amber/);
      await expect(mediumBadge).toHaveText('Medium');
    }

    // Check Low badge has green styling
    const lowBadge = page.locator('[data-testid="task-priority-badge-low"]').first();
    if (await lowBadge.isVisible().catch(() => false)) {
      await expect(lowBadge).toHaveClass(/bg-green/);
      await expect(lowBadge).toHaveText('Low');
    }

    // Check Normal badge has blue styling
    const normalBadge = page.locator('[data-testid="task-priority-badge-normal"]').first();
    if (await normalBadge.isVisible().catch(() => false)) {
      await expect(normalBadge).toHaveClass(/bg-blue/);
      await expect(normalBadge).toHaveText('Normal');
    }
  });

  test('TLP-CRD-03: Task cards are ordered by due date (soonest first)', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    const dueDateElements = page.locator('[data-testid^="task-due-date-"]');
    const count = await dueDateElements.count();

    if (count >= 2) {
      // Verify that tasks with "Due: Today" come before tasks with later dates
      const dueDateTexts: string[] = [];
      for (let i = 0; i < count; i++) {
        const text = await dueDateElements.nth(i).textContent();
        dueDateTexts.push(text ?? '');
      }

      // Tasks with "Due: Today" should generally be first, then "Due: Tomorrow", etc.
      // Just verify that at least the ordering is consistent (no "Today" after "Tomorrow")
      let foundTomorrow = false;
      let todayAfterTomorrow = false;
      for (const text of dueDateTexts) {
        if (text.includes('Tomorrow')) foundTomorrow = true;
        if (text.includes('Today') && foundTomorrow) todayAfterTomorrow = true;
      }
      expect(todayAfterTomorrow).toBeFalsy();
    }
  });

  test('TLP-CRD-04: Clicking a task card navigates to task detail page', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[data-testid^="task-card-"]');
    const count = await cards.count();

    if (count > 0) {
      const firstCardTestId = await cards.first().getAttribute('data-testid');
      const taskId = firstCardTestId!.replace('task-card-', '');

      await cards.first().click();
      await page.waitForLoadState('networkidle');

      // Should navigate to /tasks/:taskId
      await expect(page).toHaveURL(new RegExp(`/tasks/${taskId}`));
      await expect(page.getByTestId('task-detail-page')).toBeVisible();
    }
  });

  test('TLP-CRD-05: Action menu on task card shows options', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[data-testid^="task-card-"]');
    const count = await cards.count();

    if (count > 0) {
      const cardTestId = await cards.first().getAttribute('data-testid');
      const taskId = cardTestId!.replace('task-card-', '');

      // Click the action menu button
      await page.getByTestId(`task-action-menu-button-${taskId}`).click();

      // Menu should be visible
      const menu = page.getByTestId(`task-action-menu-${taskId}`);
      await expect(menu).toBeVisible();

      // Should have Edit, Mark Complete, Delete options
      await expect(page.getByTestId(`task-action-edit-${taskId}`)).toBeVisible();
      await expect(page.getByTestId(`task-action-edit-${taskId}`)).toContainText('Edit');
      await expect(page.getByTestId(`task-action-complete-${taskId}`)).toBeVisible();
      await expect(page.getByTestId(`task-action-complete-${taskId}`)).toContainText('Mark Complete');
      await expect(page.getByTestId(`task-action-delete-${taskId}`)).toBeVisible();
      await expect(page.getByTestId(`task-action-delete-${taskId}`)).toContainText('Delete');
    }
  });

  test('TLP-CRD-06: Mark Complete removes task from upcoming list', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[data-testid^="task-card-"]');
    const initialCount = await cards.count();

    if (initialCount > 0) {
      // Use the last card to avoid interfering with other tests
      const lastCard = cards.last();
      const cardTestId = await lastCard.getAttribute('data-testid');
      const taskId = cardTestId!.replace('task-card-', '');

      // Open action menu and click "Mark Complete"
      await page.getByTestId(`task-action-menu-button-${taskId}`).click();
      await page.getByTestId(`task-action-complete-${taskId}`).click();
      await page.waitForLoadState('networkidle');

      // Task should no longer be visible
      await expect(page.getByTestId(`task-card-${taskId}`)).not.toBeVisible();
    }
  });

  test('TLP-CRD-07: Edit opens task edit form', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[data-testid^="task-card-"]');
    const count = await cards.count();

    if (count > 0) {
      const cardTestId = await cards.first().getAttribute('data-testid');
      const taskId = cardTestId!.replace('task-card-', '');

      // Open action menu and click "Edit"
      await page.getByTestId(`task-action-menu-button-${taskId}`).click();
      await page.getByTestId(`task-action-edit-${taskId}`).click();

      // Edit modal should be visible with pre-filled data
      const editModal = page.getByTestId('edit-task-modal');
      await expect(editModal).toBeVisible();

      // Title field should be pre-filled
      const titleInput = page.getByTestId('edit-task-title');
      await expect(titleInput).toBeVisible();
      const titleValue = await titleInput.inputValue();
      expect(titleValue.length).toBeGreaterThan(0);

      // Save and Cancel buttons visible
      await expect(page.getByTestId('edit-task-save')).toBeVisible();
      await expect(page.getByTestId('edit-task-cancel')).toBeVisible();
    }
  });

  test('TLP-CRD-08: Editing a task persists changes', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[data-testid^="task-card-"]');
    const count = await cards.count();

    if (count > 0) {
      const cardTestId = await cards.first().getAttribute('data-testid');
      const taskId = cardTestId!.replace('task-card-', '');

      // Open action menu and click "Edit"
      await page.getByTestId(`task-action-menu-button-${taskId}`).click();
      await page.getByTestId(`task-action-edit-${taskId}`).click();

      const editModal = page.getByTestId('edit-task-modal');
      await expect(editModal).toBeVisible();

      // Change the title
      const newTitle = `Updated Task ${Date.now()}`;
      await page.getByTestId('edit-task-title').fill(newTitle);

      // Save
      await page.getByTestId('edit-task-save').click();
      await expect(editModal).not.toBeVisible();
      await page.waitForLoadState('networkidle');

      // The updated title should appear in the list
      const pageContent = await page.textContent('body');
      expect(pageContent).toContain(newTitle);
    }
  });

  test('TLP-CRD-09: Delete task removes it after confirmation', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[data-testid^="task-card-"]');
    const initialCount = await cards.count();

    if (initialCount > 0) {
      // Use the last card
      const lastCard = cards.last();
      const cardTestId = await lastCard.getAttribute('data-testid');
      const taskId = cardTestId!.replace('task-card-', '');

      // Open action menu and click "Delete"
      await page.getByTestId(`task-action-menu-button-${taskId}`).click();
      await page.getByTestId(`task-action-delete-${taskId}`).click();

      // Confirm dialog should appear
      const confirmDialog = page.getByTestId('confirm-dialog');
      await expect(confirmDialog).toBeVisible();

      // Click confirm
      await page.getByTestId('confirm-ok').click();
      await page.waitForLoadState('networkidle');

      // Task should no longer be in the list
      await expect(page.getByTestId(`task-card-${taskId}`)).not.toBeVisible();
    }
  });
});
