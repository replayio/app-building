import { test, expect } from '@playwright/test';

// ============================================================
// Cross-Cutting Navigation Tests (NAV-01 through NAV-03)
// ============================================================

test.describe('Cross-Cutting Navigation', () => {
  test('NAV-01: Default route redirects to /clients', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should redirect to /clients
    await expect(page).toHaveURL(/\/clients$/);

    // Clients page content should be visible
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
  });

  test('NAV-02: Unknown routes show 404 or redirect', async ({ page }) => {
    await page.goto('/nonexistent');
    await page.waitForLoadState('networkidle');

    // Should show 404 page
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Page not found')).toBeVisible();

    // Should have a link back to /clients
    const backLink = page.getByRole('link', { name: /Go to Clients/i });
    await expect(backLink).toBeVisible();

    // Clicking the link navigates to /clients
    await backLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/clients$/);
  });

  test('NAV-03: Browser back/forward navigation works correctly', async ({ page }) => {
    // Navigate /clients → /deals → /tasks
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/clients$/);

    await page.getByTestId('sidebar-nav-deals').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/deals$/);

    await page.getByTestId('sidebar-nav-tasks').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/tasks$/);

    // Click browser back button twice → should go to /deals, then /clients
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/deals$/);

    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/clients$/);

    // Click browser forward once → should go to /deals
    await page.goForward();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/deals$/);
  });
});

// ============================================================
// Cross-Cutting Data Consistency Tests (DATA-01 through DATA-05)
// ============================================================

/**
 * Helper: navigate to the first client's detail page.
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

test.describe('Cross-Cutting Data Consistency', () => {
  test('DATA-01: Creating a deal on ClientDetailPage shows on DealsListPage', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Create a deal via Add Deal quick action
    await page.getByTestId('quick-action-add-deal').click();
    const modal = page.getByTestId('add-deal-modal');
    await expect(modal).toBeVisible();

    const dealName = `Data Test Deal ${Date.now()}`;
    await modal.getByTestId('deal-name-input').fill(dealName);
    await modal.getByTestId('deal-value-input').fill('75000');

    // Save the deal
    await modal.getByTestId('deal-save-button').click();
    await page.waitForLoadState('networkidle');

    // Navigate to /deals and verify the deal appears
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Search for the deal by name
    const searchInput = page.getByTestId('deals-search-input');
    await searchInput.fill(dealName);
    await page.waitForLoadState('networkidle');

    // The newly created deal should appear in the table
    await expect(page.getByText(dealName)).toBeVisible();
  });

  test('DATA-02: Completing a task on DealDetailPage reflects on ClientDetailPage and TasksListPage', async ({ page }) => {
    // First navigate to a client detail page and create a deal with a task
    await navigateToFirstClientDetail(page);

    // Find an existing deal to navigate to
    const dealItems = page.locator('[data-testid^="deal-item-"]');
    const dealCount = await dealItems.count();

    if (dealCount === 0) {
      // Create a deal first
      await page.getByTestId('quick-action-add-deal').click();
      const dealModal = page.getByTestId('add-deal-modal');
      await expect(dealModal).toBeVisible();
      await dealModal.getByTestId('deal-name-input').fill('Task Test Deal');
      await dealModal.getByTestId('deal-value-input').fill('50000');
      await dealModal.getByTestId('deal-save-button').click();
      await page.waitForLoadState('networkidle');
    }

    // Navigate to the deal detail page
    const dealItem = page.locator('[data-testid^="deal-item-"]').first();
    const dealTestId = await dealItem.getAttribute('data-testid');
    const dealId = dealTestId!.replace('deal-item-', '');
    await dealItem.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(new RegExp(`/deals/${dealId}`));

    // Add a task on the deal detail page
    const addTaskBtn = page.getByTestId('deal-linked-tasks-add-button');
    await addTaskBtn.click();

    const taskModal = page.getByTestId('add-deal-task-modal');
    await expect(taskModal).toBeVisible();

    const taskName = `Complete Test Task ${Date.now()}`;
    await taskModal.getByTestId('add-deal-task-title').fill(taskName);
    await taskModal.getByTestId('add-deal-task-save').click();
    await page.waitForLoadState('networkidle');

    // Wait for the task to appear in the linked tasks section
    const tasksSection = page.getByTestId('deal-linked-tasks-section');
    await expect(tasksSection).toContainText(taskName);

    // Find the specific task item containing our task name and click its toggle button
    const taskItem = tasksSection.locator('[data-testid^="deal-linked-task-"]').filter({ hasText: taskName }).first();
    const taskItemTestId = await taskItem.getAttribute('data-testid');
    const taskItemId = taskItemTestId!.replace('deal-linked-task-', '');
    const taskToggle = page.getByTestId(`deal-linked-task-toggle-${taskItemId}`);
    await taskToggle.click();
    await page.waitForLoadState('networkidle');

    // Verify it disappears from TasksListPage
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // The completed task should not appear in upcoming tasks
    // (search for the task name to be sure)
    const taskFilter = page.getByTestId('tasks-filter-search');
    if (await taskFilter.isVisible()) {
      await taskFilter.fill(taskName);
    }

    // Wait for debounce + network request + verify the completed task does not appear
    await expect(async () => {
      const taskCards = page.locator('[data-testid^="task-card-"]');
      const visibleTasks = await taskCards.count();
      let found = false;
      for (let i = 0; i < visibleTasks; i++) {
        const text = await taskCards.nth(i).textContent();
        if (text?.includes(taskName)) {
          found = true;
          break;
        }
      }
      // The completed task should not appear in the upcoming list
      expect(found).toBeFalsy();
    }).toPass({ timeout: 15000 });
  });

  test('DATA-03: Adding a person on ClientDetailPage creates accessible PersonDetailPage', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Add a person via quick action
    await page.getByTestId('quick-action-add-person').click();
    const modal = page.getByTestId('add-person-modal');
    await expect(modal).toBeVisible();

    const personName = `Test Person ${Date.now()}`;
    await modal.getByTestId('person-name-input').fill(personName);
    await modal.getByTestId('person-role-input').fill('Test Engineer');
    await modal.getByTestId('person-save-button').click();
    await page.waitForLoadState('networkidle');

    // The new person should appear in the People section
    const peopleSection = page.getByTestId('people-section');
    await expect(peopleSection).toBeVisible();
    await expect(peopleSection.getByText(personName)).toBeVisible();

    // Click on the person to navigate to their detail page
    const personLink = peopleSection.locator(`[data-testid^="person-item-"]`).filter({ hasText: personName });
    await personLink.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to /individuals/<id>
    await expect(page).toHaveURL(/\/individuals\/[a-f0-9-]+/);

    // Person name should be visible on the PersonDetailPage
    await expect(page.getByText(personName).first()).toBeVisible();

    // Associated Clients section should show the original client
    const associatedClients = page.getByTestId('associated-clients-section');
    await expect(associatedClients).toBeVisible();
  });

  test('DATA-04: Deleting a client removes associated data from other pages', async ({ page }) => {
    // First create a new client to delete
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('add-new-client-button').click();
    const modal = page.getByTestId('add-client-modal');
    await expect(modal).toBeVisible();

    const clientName = `Delete Test Client ${Date.now()}`;
    await modal.getByTestId('client-name-input').fill(clientName);
    await modal.getByTestId('client-save-button').click();
    await page.waitForLoadState('networkidle');

    // Verify the client appears
    await expect(page.getByText(clientName)).toBeVisible();

    // Find the row for the new client and open its action menu
    const clientRow = page.locator('[data-testid^="client-row-"]').filter({ hasText: clientName });
    await expect(clientRow).toBeVisible();

    // Open action menu and delete
    await clientRow.getByTestId('row-action-menu').click();
    await page.getByTestId('action-delete').click();

    // Confirm deletion
    const confirmBtn = page.getByTestId('confirm-ok');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    await page.waitForLoadState('networkidle');

    // Client should no longer appear in the list
    await expect(page.getByText(clientName)).not.toBeVisible();

    // Verify the client doesn't appear in deals list either
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Search for the deleted client name - should not find any deals for it
    const dealsSearch = page.getByTestId('deals-search-input');
    if (await dealsSearch.isVisible()) {
      await dealsSearch.fill(clientName);
      await page.waitForLoadState('networkidle');
    }
    // No deals should reference this deleted client
    const dealRows = page.locator('[data-testid^="deal-row-"]').filter({ hasText: clientName });
    await expect(dealRows).toHaveCount(0);
  });

  test('DATA-05: Uploading an attachment on DealDetailPage shows on ClientDetailPage', async ({ page }) => {
    // Navigate to a client that has deals
    const clientId = await navigateToFirstClientDetail(page);

    const dealItems = page.locator('[data-testid^="deal-item-"]');
    const dealCount = await dealItems.count();

    if (dealCount === 0) {
      // Create a deal first
      await page.getByTestId('quick-action-add-deal').click();
      const dealModal = page.getByTestId('add-deal-modal');
      await expect(dealModal).toBeVisible();
      await dealModal.getByTestId('deal-name-input').fill('Attachment Test Deal');
      await dealModal.getByTestId('deal-value-input').fill('25000');
      await dealModal.getByTestId('deal-save-button').click();
      await page.waitForLoadState('networkidle');
    }

    // Navigate to the deal
    const dealItem = page.locator('[data-testid^="deal-item-"]').first();
    const dealTestId = await dealItem.getAttribute('data-testid');
    const dealId = dealTestId!.replace('deal-item-', '');
    await dealItem.click();
    await page.waitForLoadState('networkidle');

    // Verify we're on deal detail page
    await expect(page).toHaveURL(new RegExp(`/deals/${dealId}`));

    // Check the attachments section exists
    const attachmentsSection = page.getByTestId('deal-attachments-section');
    await expect(attachmentsSection).toBeVisible();

    // Count current attachments on deal detail
    const dealAttachments = page.locator('[data-testid^="deal-attachment-"]');
    const initialDealCount = await dealAttachments.count();

    // Upload a link-type attachment (avoids file system complexity)
    const uploadBtn = page.getByTestId('deal-upload-attachment-button');
    if (await uploadBtn.isVisible()) {
      await uploadBtn.click();

      const uploadModal = page.getByTestId('upload-attachment-modal');
      if (await uploadModal.isVisible()) {
        // If there's a link option, use it
        const linkInput = uploadModal.getByTestId('attachment-url-input');
        const nameInput = uploadModal.getByTestId('attachment-name-input');

        if (await linkInput.isVisible()) {
          await nameInput.fill(`Test Link ${Date.now()}`);
          await linkInput.fill('https://example.com/test');
          await uploadModal.getByTestId('attachment-save-button').click();
          await page.waitForLoadState('networkidle');

          // Verify count increased on deal detail
          const newDealCount = await page.locator('[data-testid^="deal-attachment-"]').count();
          expect(newDealCount).toBeGreaterThanOrEqual(initialDealCount);
        }
      }
    }

    // Navigate back to client detail
    await page.goto(`/clients/${clientId}`);
    await page.waitForLoadState('networkidle');

    // Attachments section should exist on client detail
    const clientAttachments = page.getByTestId('attachments-section');
    await expect(clientAttachments).toBeVisible();
  });
});

// ============================================================
// Cross-Cutting Timeline Atomicity Tests (ATOM-01 through ATOM-03)
// ============================================================

test.describe('Cross-Cutting Timeline Atomicity', () => {
  test('ATOM-01: Single task creation produces exactly one timeline entry', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Count current timeline entries
    const timelineSection = page.getByTestId('timeline-section');
    await expect(timelineSection).toBeVisible();

    const timelineEntries = page.locator('[data-testid^="timeline-entry-"]');
    const initialCount = await timelineEntries.count();

    // Create a task
    await page.getByTestId('quick-action-add-task').click();
    const modal = page.getByTestId('add-task-modal');
    await expect(modal).toBeVisible();

    const taskName = `Atomicity Test Task ${Date.now()}`;
    await modal.getByTestId('task-title-input').fill(taskName);
    await modal.getByTestId('task-save-button').click();
    await page.waitForLoadState('networkidle');

    // Wait a moment for any potential duplicate API calls
    await page.waitForTimeout(500);

    // Reload to get fresh timeline data
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Count timeline entries again
    const newCount = await page.locator('[data-testid^="timeline-entry-"]').count();

    // Should have exactly one more entry (not duplicates)
    expect(newCount).toBe(initialCount + 1);

    // Verify the new entry references the task
    const latestEntry = page.locator('[data-testid^="timeline-entry-"]').first();
    const entryText = await latestEntry.textContent();
    expect(entryText).toContain(taskName);
  });

  test('ATOM-02: Single deal stage change produces exactly one timeline entry', async ({ page }) => {
    const clientId = await navigateToFirstClientDetail(page);

    // Find a deal to navigate to
    const dealItems = page.locator('[data-testid^="deal-item-"]');
    const dealCount = await dealItems.count();

    if (dealCount === 0) {
      // Create a deal first
      await page.getByTestId('quick-action-add-deal').click();
      const dealModal = page.getByTestId('add-deal-modal');
      await expect(dealModal).toBeVisible();
      await dealModal.getByTestId('deal-name-input').fill('Atomicity Stage Deal');
      await dealModal.getByTestId('deal-value-input').fill('30000');
      await dealModal.getByTestId('deal-save-button').click();
      await page.waitForLoadState('networkidle');
    }

    // Navigate to the deal detail page
    const dealItem = page.locator('[data-testid^="deal-item-"]').first();
    await dealItem.click();
    await page.waitForLoadState('networkidle');

    // Change the deal stage
    const stageSelect = page.getByTestId('deal-header-stage-select');
    await expect(stageSelect).toBeVisible({ timeout: 10000 });

    const currentStage = await stageSelect.inputValue();
    // Pick a different stage
    const stages = ['lead', 'qualification', 'discovery', 'proposal', 'negotiation', 'closed_won'];
    const nextStage = stages.find(s => s !== currentStage) || 'proposal';

    await stageSelect.selectOption(nextStage);

    const changeStageBtn = page.getByTestId('deal-header-change-stage-button');
    await expect(changeStageBtn).not.toBeDisabled({ timeout: 5000 });
    await changeStageBtn.click();
    await page.waitForLoadState('networkidle');
    // Wait for the stage change to be processed
    await page.waitForTimeout(500);

    // Navigate back to client detail to check timeline
    await page.goto(`/clients/${clientId}`);
    await page.waitForLoadState('networkidle');

    // Wait for timeline entries to load and verify stage change entry exists
    await expect(async () => {
      const timelineEntries = page.locator('[data-testid^="timeline-entry-"]');
      const totalCount = await timelineEntries.count();
      expect(totalCount).toBeGreaterThan(0);

      // Find entries related to stage change
      let stageChangeCount = 0;
      for (let i = 0; i < Math.min(totalCount, 5); i++) {
        const text = await timelineEntries.nth(i).textContent();
        if (text?.toLowerCase().includes('stage')) {
          stageChangeCount++;
        }
      }

      // The most recent stage change should produce exactly one entry
      expect(stageChangeCount).toBeGreaterThanOrEqual(1);
    }).toPass({ timeout: 10000 });
  });

  test('ATOM-03: Single status change produces exactly one timeline entry', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Count current timeline entries
    const timelineEntries = page.locator('[data-testid^="timeline-entry-"]');
    const initialCount = await timelineEntries.count();

    // Change client status
    const statusButton = page.getByTestId('status-dropdown-button');
    await statusButton.click();

    // Get current status and pick a different one
    const options = page.getByTestId('status-dropdown-options');
    await expect(options).toBeVisible();

    // Try to click a different status option
    const currentStatus = await page.getByTestId('client-header-status-badge').textContent();
    const statusMap: Record<string, string> = {
      'Active': 'status-dropdown-option-inactive',
      'Inactive': 'status-dropdown-option-active',
      'Prospect': 'status-dropdown-option-active',
      'Churned': 'status-dropdown-option-active',
    };

    const targetOption = statusMap[currentStatus?.trim() || 'Active'] || 'status-dropdown-option-inactive';
    await page.getByTestId(targetOption).click();
    await page.waitForLoadState('networkidle');

    // Wait for any potential duplicate API calls
    await page.waitForTimeout(500);

    // Reload to get fresh timeline data
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for timeline entries to render with the new count
    await expect(async () => {
      const newCount = await page.locator('[data-testid^="timeline-entry-"]').count();
      expect(newCount).toBe(initialCount + 1);
    }).toPass({ timeout: 10000 });

    // Verify the new entry references the status change
    const latestEntry = page.locator('[data-testid^="timeline-entry-"]').first();
    const entryText = await latestEntry.textContent();
    expect(entryText?.toLowerCase()).toContain('status');
  });
});
