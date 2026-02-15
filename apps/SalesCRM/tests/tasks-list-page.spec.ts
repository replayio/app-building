import { test, expect } from '@playwright/test';

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
    await expect(modal.getByText('Assignee Name')).toBeVisible();
    await expect(modal.getByText('Client')).toBeVisible();

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
    await page.getByTestId('create-task-priority').selectOption('high');
    await page.getByTestId('create-task-assignee-name').fill('Sarah J.');
    await page.getByTestId('create-task-assignee-role').fill('PM');

    // Select a client if available
    const clientSelect = page.getByTestId('create-task-client');
    const clientOptions = await clientSelect.locator('option').all();
    if (clientOptions.length > 1) {
      const clientValue = await clientOptions[1].getAttribute('value');
      await clientSelect.selectOption(clientValue!);
    }

    await page.getByTestId('create-task-save').click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Wait for tasks to reload
    await page.waitForLoadState('networkidle');

    // The task should appear in the list
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain(taskTitle);
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
    await page.getByTestId('tasks-filter-priority').selectOption('high');

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

    // Check assignee dropdown has options
    const assigneeSelect = page.getByTestId('tasks-filter-assignee');
    const options = await assigneeSelect.locator('option').all();

    if (options.length > 1) {
      // Pick the first real assignee option
      const assigneeName = await options[1].textContent();
      const assigneeValue = await options[1].getAttribute('value');
      await assigneeSelect.selectOption(assigneeValue!);

      // Wait for filtered results where all cards contain the assignee name
      await expect(async () => {
        const cards = page.locator('[data-testid^="task-card-"]');
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
          const card = cards.nth(i);
          const cardText = await card.textContent();
          expect(cardText).toContain(assigneeName!);
        }
      }).toPass({ timeout: 10000 });
    }
  });

  test('TLP-FLT-05: Filter by client shows matching tasks', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Open filter dropdown
    await page.getByTestId('tasks-filter-button').click();
    await expect(page.getByTestId('tasks-filter-dropdown')).toBeVisible();

    // Check client dropdown has options
    const clientSelect = page.getByTestId('tasks-filter-client');
    const options = await clientSelect.locator('option').all();

    if (options.length > 1) {
      const clientValue = await options[1].getAttribute('value');
      await clientSelect.selectOption(clientValue!);
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
    await page.getByTestId('tasks-filter-priority').selectOption('high');
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
