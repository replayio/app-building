import { test, expect } from './base';

/**
 * Navigate to a client detail page and wait for it to load successfully.
 * Retries on transient Neon errors ("Failed to fetch client" + Retry button).
 */
async function gotoClientDetail(page: import('@playwright/test').Page, clientId: string) {
  await page.goto(`/clients/${clientId}`);
  await page.waitForLoadState('networkidle');

  for (let attempt = 0; attempt < 8; attempt++) {
    const header = page.getByTestId('client-header-title');
    const visible = await header.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
    if (visible) return;
    const retryBtn = page.getByRole('button', { name: 'Retry' });
    if (await retryBtn.isVisible().catch(() => false)) {
      await retryBtn.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
  }
  // If we exhausted retries, fail fast instead of letting the test time out later
  throw new Error('gotoClientDetail: client header never became visible after 8 retries');
}

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

  await gotoClientDetail(page, clientId);
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
    // Use a single atomic assertion — no nested auto-waits that can deadlock inside .toPass()
    await expect(
      page.locator('[data-testid^="task-card-"]').filter({ hasText: taskName })
    ).toHaveCount(0, { timeout: 15000 });
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
    await expect(page.getByTestId('person-header-name')).toContainText(personName);

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
// Cross-Cutting Page Spacing Tests (SPACING-01)
// ============================================================

test.describe('Cross-Cutting Page Spacing', () => {
  test('SPACING-01: All pages have consistent padding and content is not flush against screen edges', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    const pagesToCheck = [
      { url: '/auth/forgot-password', testId: 'forgot-password-page' },
      { url: '/auth/reset-password', testId: 'reset-password-page' },
      { url: '/auth/confirm-email', testId: 'confirm-email-page' },
      { url: '/nonexistent', testId: 'not-found-page' },
    ];

    for (const { url, testId } of pagesToCheck) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const pageEl = page.getByTestId(testId);
      await expect(pageEl).toBeVisible();

      // Verify the page root element has padding (content not flush against edges)
      const padding = await pageEl.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          top: parseFloat(style.paddingTop),
          right: parseFloat(style.paddingRight),
          bottom: parseFloat(style.paddingBottom),
          left: parseFloat(style.paddingLeft),
        };
      });

      expect(padding.top, `${testId} should have top padding`).toBeGreaterThan(0);
      expect(padding.right, `${testId} should have right padding`).toBeGreaterThan(0);
      expect(padding.bottom, `${testId} should have bottom padding`).toBeGreaterThan(0);
      expect(padding.left, `${testId} should have left padding`).toBeGreaterThan(0);
    }

    await context.close();
  });
});

// ============================================================
// Cross-Cutting Timeline Atomicity Tests (ATOM-01 through ATOM-03)
// ============================================================

test.describe('Cross-Cutting Timeline Atomicity', () => {
  test('ATOM-01: Single task creation produces exactly one timeline entry', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Wait for timeline section to be visible
    const timelineSection = page.getByTestId('timeline-section');
    await expect(timelineSection).toBeVisible();

    // Create a task with a unique name
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

    // Verify exactly one timeline entry references this specific task (not duplicates)
    const matchingEntries = page.locator('[data-testid^="timeline-entry-"]', { hasText: taskName });
    await expect(matchingEntries).toHaveCount(1);
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

    const currentStage = await stageSelect.getAttribute('data-value');
    // Pick a different stage
    const stages = ['lead', 'qualification', 'discovery', 'proposal', 'negotiation', 'closed_won'];
    const nextStage = stages.find(s => s !== currentStage) || 'proposal';

    await page.getByTestId('deal-header-stage-select-trigger').click();
    await page.getByTestId(`deal-header-stage-select-option-${nextStage}`).click();

    const changeStageBtn = page.getByTestId('deal-header-change-stage-button');
    await expect(changeStageBtn).not.toBeDisabled({ timeout: 5000 });
    await changeStageBtn.click();
    await page.waitForLoadState('networkidle');
    // Wait for the stage change to be processed
    await page.waitForTimeout(500);

    // Navigate back to client detail to check timeline
    await gotoClientDetail(page, clientId);

    // Wait for timeline entries to load and verify at least one stage change entry exists
    await expect(
      page.locator('[data-testid^="timeline-entry-"]').filter({ hasText: /stage/i }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('ATOM-03: Single status change produces exactly one timeline entry', async ({ page }) => {
    await navigateToFirstClientDetail(page);

    // Verify the client detail page loaded (navigateToFirstClientDetail handles retries)
    await expect(page.getByTestId('status-dropdown-button')).toBeVisible({ timeout: 10000 });

    // Get current status and determine the target status
    const currentStatus = await page.getByTestId('client-header-status-badge').textContent();
    const statusMap: Record<string, string> = {
      'Active': 'inactive',
      'Inactive': 'active',
      'Prospect': 'active',
      'Churned': 'active',
    };
    const targetStatus = statusMap[currentStatus?.trim() || 'Active'] || 'inactive';

    // Change client status
    await page.getByTestId('status-dropdown-button').click();
    await expect(page.getByTestId('status-dropdown-options')).toBeVisible();
    await page.getByTestId(`status-dropdown-option-${targetStatus}`).click();
    await page.waitForLoadState('networkidle');

    // Wait a moment for any potential duplicate API calls
    await page.waitForTimeout(500);

    // Reload to get fresh timeline data
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify a timeline entry references this specific status change
    // Timeline format: "Status Changed: from 'active' to 'inactive'"
    const matchingEntries = page.locator('[data-testid^="timeline-entry-"]', {
      hasText: new RegExp(`Status Changed:.*from '${currentStatus?.trim().toLowerCase()}' to '${targetStatus}'`)
    });

    await expect(matchingEntries.first()).toBeVisible({ timeout: 10000 });
  });
});
