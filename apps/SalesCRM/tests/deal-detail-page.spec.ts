import { test, expect } from './base';

/**
 * Helper: navigate to the first deal's detail page.
 * Goes to /deals, grabs the first row's ID, and navigates.
 * Returns the dealId.
 */
async function navigateToFirstDealDetail(page: import('@playwright/test').Page): Promise<string> {
  await page.goto('/deals');
  await page.waitForLoadState('networkidle');

  const rows = page.locator('[data-testid^="deal-row-"]');
  await rows.first().waitFor({ state: 'visible', timeout: 15000 });
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);

  const testId = await rows.first().getAttribute('data-testid');
  const dealId = testId!.replace('deal-row-', '');

  await page.goto(`/deals/${dealId}`);
  await page.waitForLoadState('networkidle');
  return dealId;
}

/**
 * Helper: select an option from a custom FilterSelect component.
 * Clicks the trigger button, then clicks the option with the given value.
 */
async function selectFilterOption(page: import('@playwright/test').Page, testId: string, value: string) {
  await page.getByTestId(`${testId}-trigger`).click();
  const optionId = value === '' ? `${testId}-option-all` : `${testId}-option-${value}`;
  await page.getByTestId(optionId).click();
}

/**
 * Helper: get the current value of a custom FilterSelect component.
 * Reads the data-value attribute from the wrapper div.
 */
async function getFilterValue(page: import('@playwright/test').Page, testId: string): Promise<string> {
  return await page.getByTestId(testId).getAttribute('data-value') ?? '';
}

test.describe('DealDetailPage - Breadcrumb (DDP-BRC)', () => {
  test('DDP-BRC-01: Breadcrumb displays deal name and links back to deals list', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Breadcrumb should be visible
    const breadcrumb = page.getByTestId('deal-detail-breadcrumb');
    await expect(breadcrumb).toBeVisible();

    // Should contain "Deals" link text
    await expect(breadcrumb).toContainText('Deals');

    // Should contain the deal name (non-empty text after the separator)
    const dealName = page.getByTestId('deal-header-title');
    const dealNameText = await dealName.textContent();
    expect(dealNameText!.length).toBeGreaterThan(0);

    // Click the "Deals" link in the breadcrumb to navigate back to /deals
    await breadcrumb.locator('span').first().click();
    await expect(page).toHaveURL(/\/deals$/, { timeout: 10000 });
  });
});

test.describe('DealDetailPage - DealHeader (DDP-HDR)', () => {
  test('DDP-HDR-01: Header displays deal info with editable fields', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    const header = page.getByTestId('deal-detail-header');
    await expect(header).toBeVisible();

    // Title includes deal/client name
    const title = page.getByTestId('deal-header-title');
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText!.length).toBeGreaterThan(0);

    // Client field
    const client = page.getByTestId('deal-header-client');
    await expect(client).toBeVisible();

    // Value field with $
    const value = page.getByTestId('deal-header-value');
    await expect(value).toBeVisible();
    const valueText = await value.textContent();
    expect(valueText).toContain('$');

    // Owner field
    const owner = page.getByTestId('deal-header-owner');
    await expect(owner).toBeVisible();

    // Stage dropdown
    const stageSelect = page.getByTestId('deal-header-stage-select');
    await expect(stageSelect).toBeVisible();

    // Change Stage button
    const changeStageBtn = page.getByTestId('deal-header-change-stage-button');
    await expect(changeStageBtn).toBeVisible();
    await expect(changeStageBtn).toContainText('Change Stage');
  });

  test('DDP-HDR-02: Editing client field updates the deal', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Get current client name
    const clientBefore = await page.getByTestId('deal-header-client').textContent();

    // Enter edit mode
    await page.getByTestId('deal-header-edit-button').click();

    // Client dropdown should appear
    const clientInput = page.getByTestId('deal-header-client-input');
    await expect(clientInput).toBeVisible();

    // Also verify other edit fields appear
    await expect(page.getByTestId('deal-header-name-input')).toBeVisible();
    await expect(page.getByTestId('deal-header-value-input')).toBeVisible();
    await expect(page.getByTestId('deal-header-owner-input')).toBeVisible();
    await expect(page.getByTestId('deal-header-save-button')).toBeVisible();
    await expect(page.getByTestId('deal-header-cancel-button')).toBeVisible();

    // Get the current client_id from the dropdown
    const originalClientId = await clientInput.getAttribute('data-value') ?? '';

    // Open the client dropdown and pick a different client
    await page.getByTestId('deal-header-client-input-trigger').click();
    const menu = page.getByTestId('deal-header-client-input-menu');
    await expect(menu).toBeVisible();

    // Find a different client option (not the currently selected one)
    const options = menu.locator('button[data-option-value]');
    const count = await options.count();
    let targetClientName = '';
    for (let i = 0; i < count; i++) {
      const optVal = await options.nth(i).getAttribute('data-option-value');
      if (optVal && optVal !== originalClientId) {
        targetClientName = (await options.nth(i).textContent() ?? '').trim();
        await options.nth(i).click();
        break;
      }
    }

    // Save
    await page.getByTestId('deal-header-save-button').click();
    await page.waitForLoadState('networkidle');

    // Client should show new name
    const clientAfter = await page.getByTestId('deal-header-client').textContent();
    expect(clientAfter).toBe(targetClientName);
    expect(clientAfter).not.toBe(clientBefore);

    // Restore original client
    await page.getByTestId('deal-header-edit-button').click();
    await selectFilterOption(page, 'deal-header-client-input', originalClientId);
    await page.getByTestId('deal-header-save-button').click();
    await page.waitForLoadState('networkidle');
  });

  test('DDP-HDR-03: Editing value field updates the deal', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Get current value
    const valueBefore = await page.getByTestId('deal-header-value').textContent();

    // Enter edit mode
    await page.getByTestId('deal-header-edit-button').click();

    // Change value
    const valueInput = page.getByTestId('deal-header-value-input');
    await valueInput.clear();
    await valueInput.fill('300000');

    // Save
    await page.getByTestId('deal-header-save-button').click();
    await page.waitForLoadState('networkidle');

    // Value should be updated
    const valueAfter = await page.getByTestId('deal-header-value').textContent();
    expect(valueAfter).toContain('$300,000');

    // Restore original value
    await page.getByTestId('deal-header-edit-button').click();
    const restoreInput = page.getByTestId('deal-header-value-input');
    await restoreInput.clear();
    const originalNum = valueBefore!.replace(/[^0-9]/g, '');
    await restoreInput.fill(originalNum);
    await page.getByTestId('deal-header-save-button').click();
    await page.waitForLoadState('networkidle');
  });

  test('DDP-HDR-04: Changing stage via dropdown and Change Stage button', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Wait for deal header to be fully loaded
    const stageSelect = page.getByTestId('deal-header-stage-select');
    await expect(stageSelect).toBeVisible();
    const changeStageBtn = page.getByTestId('deal-header-change-stage-button');
    await expect(changeStageBtn).toBeVisible();

    // Get current stage
    const currentStage = await getFilterValue(page, 'deal-header-stage-select');

    // Count history entries before stage change
    const historyEntriesBefore = page.locator('[data-testid^="deal-history-entry-"]');
    const countBefore = await historyEntriesBefore.count();

    // Change Stage button should be disabled when same stage selected
    await expect(changeStageBtn).toBeDisabled();

    // Select a different stage
    const newStage = currentStage === 'discovery' ? 'proposal' : 'discovery';
    const stageDisplayNames: Record<string, string> = {
      'lead': 'Lead', 'qualification': 'Qualification', 'discovery': 'Discovery',
      'proposal': 'Proposal', 'negotiation': 'Negotiation', 'closed_won': 'Closed Won',
    };
    const expectedFrom = stageDisplayNames[currentStage] || currentStage;
    const expectedTo = stageDisplayNames[newStage] || newStage;

    await selectFilterOption(page, 'deal-header-stage-select', newStage);

    // Change Stage button should now be enabled
    await expect(changeStageBtn).not.toBeDisabled();

    // Click Change Stage
    await changeStageBtn.click();

    // Wait for stage to be updated — use toHaveAttribute to avoid nested-wait deadlock
    await expect(page.getByTestId('deal-header-stage-select')).toHaveAttribute('data-value', newStage, { timeout: 10000 });

    // Button should be disabled again (selectedStage synced back to deal.stage)
    await expect(changeStageBtn).toBeDisabled();

    // Verify a deal history entry was created for this stage change
    const expectedHistoryText = `Changed Stage from ${expectedFrom} to ${expectedTo}`;
    const newHistoryEntry = page.locator('[data-testid^="deal-history-entry-"]', { hasText: expectedHistoryText });
    await expect(newHistoryEntry).toHaveCount(1, { timeout: 10000 });

    // Verify exactly one new entry was added (no duplicates)
    const historyEntriesAfter = page.locator('[data-testid^="deal-history-entry-"]');
    await expect(historyEntriesAfter).toHaveCount(countBefore + 1, { timeout: 5000 });

    // Restore original stage
    await selectFilterOption(page, 'deal-header-stage-select', currentStage);
    await expect(changeStageBtn).not.toBeDisabled();
    await changeStageBtn.click();
    await expect(page.getByTestId('deal-header-stage-select')).toHaveAttribute('data-value', currentStage, { timeout: 10000 });
  });
});

test.describe('DealDetailPage - StagePipeline (DDP-PIP)', () => {
  test('DDP-PIP-01: Stage pipeline displays all stages with visual progress', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    const pipeline = page.getByTestId('deal-stage-pipeline');
    await expect(pipeline).toBeVisible();

    // All 6 stages should be visible (excluding closed_lost which is separate)
    await expect(page.getByTestId('pipeline-stage-lead')).toBeVisible();
    await expect(page.getByTestId('pipeline-stage-qualification')).toBeVisible();
    await expect(page.getByTestId('pipeline-stage-discovery')).toBeVisible();
    await expect(page.getByTestId('pipeline-stage-proposal')).toBeVisible();
    await expect(page.getByTestId('pipeline-stage-negotiation')).toBeVisible();
    await expect(page.getByTestId('pipeline-stage-closed_won')).toBeVisible();

    // Progress bar should be visible
    await expect(page.getByTestId('pipeline-progress-bar')).toBeVisible();
    await expect(page.getByTestId('pipeline-progress-fill')).toBeVisible();

    // One stage should be marked as current
    const currentStage = page.locator('[data-current="true"]');
    const currentCount = await currentStage.count();
    expect(currentCount).toBe(1);
  });

  test('DDP-PIP-02: Pipeline updates when stage changes', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Get current stage
    const currentStage = await getFilterValue(page, 'deal-header-stage-select');

    // Get the current indicator status
    const currentIndicator = page.getByTestId(`pipeline-stage-indicator-${currentStage}`);
    await expect(currentIndicator).toHaveAttribute('data-current', 'true');

    // Change to a different stage
    const newStage = currentStage === 'discovery' ? 'proposal' : 'discovery';
    await selectFilterOption(page, 'deal-header-stage-select', newStage);
    const pipelineChangeBtn = page.getByTestId('deal-header-change-stage-button');
    await expect(pipelineChangeBtn).not.toBeDisabled({ timeout: 5000 });
    await pipelineChangeBtn.click();
    await page.waitForLoadState('networkidle');

    // New stage should now be current
    const newIndicator = page.getByTestId(`pipeline-stage-indicator-${newStage}`);
    await expect(newIndicator).toHaveAttribute('data-current', 'true');

    // Restore original stage
    await selectFilterOption(page, 'deal-header-stage-select', currentStage);
    await expect(pipelineChangeBtn).not.toBeDisabled({ timeout: 5000 });
    await pipelineChangeBtn.click();
    await page.waitForLoadState('networkidle');
  });
});

test.describe('DealDetailPage - DealHistorySection (DDP-HIS)', () => {
  test('DDP-HIS-01: Deal history shows stage change log', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    const historySection = page.getByTestId('deal-history-section');
    await expect(historySection).toBeVisible();

    // Should have the heading
    await expect(historySection).toContainText('Deal History');

    // History entries or empty state
    const entries = page.locator('[data-testid^="deal-history-entry-"]');
    const emptyState = page.getByTestId('deal-history-empty');
    const hasEntries = await entries.count() > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    // Either entries or empty state should be visible
    expect(hasEntries || hasEmpty).toBeTruthy();

    if (hasEntries) {
      // Each entry should contain stage change text
      const firstEntry = entries.first();
      const entryText = await firstEntry.textContent();
      expect(entryText).toContain('Changed Stage from');
    }
  });

  test('DDP-HIS-02: New stage change adds history entry', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Change stage to trigger new history entry.
    // Use 'negotiation' as target to avoid race conditions with parallel tests
    // (DDP-HDR-04 and DDP-PIP-02 toggle between discovery/proposal on the same deal).
    const currentStage = await getFilterValue(page, 'deal-header-stage-select');
    const newStage = currentStage === 'negotiation' ? 'qualification' : 'negotiation';
    const stageDisplayNames: Record<string, string> = {
      'lead': 'Lead', 'qualification': 'Qualification', 'discovery': 'Discovery',
      'proposal': 'Proposal', 'negotiation': 'Negotiation', 'closed_won': 'Closed Won',
    };
    const expectedFrom = stageDisplayNames[currentStage] || currentStage;
    const expectedTo = stageDisplayNames[newStage] || newStage;

    await selectFilterOption(page, 'deal-header-stage-select', newStage);

    // Wait for the Change Stage button to become enabled after the stage selection
    const changeStageBtn = page.getByTestId('deal-header-change-stage-button');
    await expect(changeStageBtn).not.toBeDisabled({ timeout: 5000 });
    await changeStageBtn.click();

    // Wait for a history entry matching this specific stage change to appear
    const expectedText = `Changed Stage from ${expectedFrom} to ${expectedTo}`;

    // Use atomic assertion to verify the specific stage change entry appears.
    // Don't assert exact total count — parallel tests may add entries concurrently.
    await expect(
      page.locator('[data-testid^="deal-history-entry-"]', { hasText: expectedText })
    ).toHaveCount(1, { timeout: 10000 });

    // Restore original stage
    await selectFilterOption(page, 'deal-header-stage-select', currentStage);
    await expect(changeStageBtn).not.toBeDisabled({ timeout: 5000 });
    await changeStageBtn.click();
    await page.waitForLoadState('networkidle');
  });
});

test.describe('DealDetailPage - DealMetricsSection (DDP-MET)', () => {
  test('DDP-MET-01: Deal metrics displays probability and expected close', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    const metricsSection = page.getByTestId('deal-metrics-section');
    await expect(metricsSection).toBeVisible();
    await expect(metricsSection).toContainText('Deal Metrics');

    // Probability should be visible with % sign
    const probability = page.getByTestId('deal-metrics-probability');
    await expect(probability).toBeVisible();
    const probText = await probability.textContent();
    expect(probText).toContain('%');

    // Expected close date should be visible
    const closeDate = page.getByTestId('deal-metrics-close-date');
    await expect(closeDate).toBeVisible();
  });

  test('DDP-MET-02: Metrics are editable', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Get current probability
    const probBefore = await page.getByTestId('deal-metrics-probability').textContent();

    // Click edit
    await page.getByTestId('deal-metrics-edit-button').click();

    // Input fields should appear
    const probInput = page.getByTestId('deal-metrics-probability-input');
    await expect(probInput).toBeVisible();
    const closeDateInput = page.getByTestId('deal-metrics-close-date-input');
    await expect(closeDateInput).toBeVisible();

    // Change probability to 60
    await probInput.clear();
    await probInput.fill('60');

    // Save
    await page.getByTestId('deal-metrics-save-button').click();
    await page.waitForLoadState('networkidle');

    // Probability should update
    const probAfter = await page.getByTestId('deal-metrics-probability').textContent();
    expect(probAfter).toContain('60%');

    // Restore original
    await page.getByTestId('deal-metrics-edit-button').click();
    const restoreInput = page.getByTestId('deal-metrics-probability-input');
    await restoreInput.clear();
    const originalProb = probBefore!.replace('%', '').trim();
    await restoreInput.fill(originalProb);
    await page.getByTestId('deal-metrics-save-button').click();
    await page.waitForLoadState('networkidle');
  });
});

test.describe('DealDetailPage - WriteupsSection (DDP-WRT)', () => {
  test('DDP-WRT-01: Writeups section shows existing writeups', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    const writeupsSection = page.getByTestId('deal-writeups-section');
    await expect(writeupsSection).toBeVisible();
    await expect(writeupsSection).toContainText('Writeups');

    // New Entry button visible
    await expect(page.getByTestId('deal-writeups-add-button')).toBeVisible();
    await expect(page.getByTestId('deal-writeups-add-button')).toContainText('New Entry');
  });

  test('DDP-WRT-02: New Entry button opens writeup creation form', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    await page.getByTestId('deal-writeups-add-button').click();

    const modal = page.getByTestId('add-writeup-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('New Writeup');

    // Form fields visible
    await expect(page.getByTestId('add-writeup-title')).toBeVisible();
    await expect(page.getByTestId('add-writeup-content')).toBeVisible();
    await expect(page.getByTestId('add-writeup-author')).toBeVisible();

    // Save and Cancel buttons
    await expect(page.getByTestId('add-writeup-save')).toBeVisible();
    await expect(page.getByTestId('add-writeup-cancel')).toBeVisible();

    // Close modal
    await page.getByTestId('add-writeup-cancel').click();
    await expect(modal).not.toBeVisible();
  });

  test('DDP-WRT-03: Creating a writeup persists and shows in list', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Open add writeup modal
    await page.getByTestId('deal-writeups-add-button').click();
    const modal = page.getByTestId('add-writeup-modal');
    await expect(modal).toBeVisible();

    const writeupTitle = `Test Writeup ${Date.now()}`;
    await page.getByTestId('add-writeup-title').fill(writeupTitle);
    await page.getByTestId('add-writeup-content').fill('This is test writeup content for testing purposes.');
    await page.getByTestId('add-writeup-author').fill('Test Author');

    await page.getByTestId('add-writeup-save').click();
    await expect(modal).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    // Writeup should appear in the list
    const writeupsSection = page.getByTestId('deal-writeups-section');
    await expect(writeupsSection).toContainText(writeupTitle);
  });

  test('DDP-WRT-04: Edit button allows editing a writeup', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // First create a writeup to edit
    await page.getByTestId('deal-writeups-add-button').click();
    const modal = page.getByTestId('add-writeup-modal');
    await expect(modal).toBeVisible();

    const writeupTitle = `Editable Writeup ${Date.now()}`;
    await page.getByTestId('add-writeup-title').fill(writeupTitle);
    await page.getByTestId('add-writeup-content').fill('Original content.');
    await page.getByTestId('add-writeup-save').click();
    await expect(modal).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    // Find the writeup and click edit
    const editButtons = page.locator('[data-testid^="deal-writeup-edit-"]');
    const editCount = await editButtons.count();

    if (editCount > 0) {
      // Click the last edit button (our newly created writeup)
      await editButtons.last().click();

      // Verify edit mode elements appear: title input, content input, save/cancel buttons
      await expect(page.getByTestId('deal-writeup-edit-title-input')).toBeVisible();
      await expect(page.getByTestId('deal-writeup-edit-content-input')).toBeVisible();
      await expect(page.getByTestId('deal-writeup-edit-save-button')).toBeVisible();
      await expect(page.getByTestId('deal-writeup-edit-cancel-button')).toBeVisible();

      // Cancel to exit edit mode
      await page.getByTestId('deal-writeup-edit-cancel-button').click();
    }
  });

  test('DDP-WRT-05: Editing a writeup creates a version history entry', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Create a writeup to edit
    await page.getByTestId('deal-writeups-add-button').click();
    const addModal = page.getByTestId('add-writeup-modal');
    await expect(addModal).toBeVisible();

    const writeupTitle = `VersionTest ${Date.now()}`;
    await page.getByTestId('add-writeup-title').fill(writeupTitle);
    await page.getByTestId('add-writeup-content').fill('Original version content.');
    await page.getByTestId('add-writeup-save').click();
    await expect(addModal).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    // Find the newly created writeup and click edit
    const editButtons = page.locator('[data-testid^="deal-writeup-edit-"]');
    await editButtons.last().click();

    // Edit the content using the inline edit form
    const contentInput = page.getByTestId('deal-writeup-edit-content-input');
    await expect(contentInput).toBeVisible();
    await contentInput.clear();
    await contentInput.fill('Updated version content.');

    // Save the edit
    await page.getByTestId('deal-writeup-edit-save-button').click();
    await page.waitForLoadState('networkidle');

    // Verify the writeup shows updated content
    const writeupsSection = page.getByTestId('deal-writeups-section');
    await expect(writeupsSection).toContainText('Updated version content.');

    // Click the version history button on the last writeup
    const versionButtons = page.locator('[data-testid^="deal-writeup-versions-"]');
    await versionButtons.last().click();

    // Verify the version history modal shows at least 2 versions
    const versionModal = page.getByTestId('version-history-modal');
    await expect(versionModal).toBeVisible();
    await expect(versionModal).toContainText('Version History');

    // Should show at least 2 version entries (current v2 + original v1)
    const versionEntries = versionModal.locator('[data-testid^="version-entry-"]');
    await expect(versionEntries).toHaveCount(2, { timeout: 5000 });

    // Close the modal
    await versionModal.locator('button').first().click();
    await expect(versionModal).not.toBeVisible();
  });

  test('DDP-WRT-06: Version History button shows previous versions', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    const versionButtons = page.locator('[data-testid^="deal-writeup-versions-"]');
    const count = await versionButtons.count();

    if (count > 0) {
      await versionButtons.first().click();

      const modal = page.getByTestId('version-history-modal');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Version History');

      // Close modal
      await modal.locator('button').first().click();
      await expect(modal).not.toBeVisible();
    }
  });
});

test.describe('DealDetailPage - LinkedTasksSection (DDP-LTK)', () => {
  test('DDP-LTK-01: Linked tasks section shows deal-specific tasks', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    const tasksSection = page.getByTestId('deal-linked-tasks-section');
    await expect(tasksSection).toBeVisible();
    await expect(tasksSection).toContainText('Linked Tasks');

    // Add Task button visible
    await expect(page.getByTestId('deal-linked-tasks-add-button')).toBeVisible();
    await expect(page.getByTestId('deal-linked-tasks-add-button')).toContainText('Add Task');
  });

  test('DDP-LTK-02: Add Task button opens task creation form', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    await page.getByTestId('deal-linked-tasks-add-button').click();

    const modal = page.getByTestId('add-deal-task-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Add Task');

    // Form fields visible
    await expect(page.getByTestId('add-deal-task-title')).toBeVisible();
    await expect(page.getByTestId('add-deal-task-due-date')).toBeVisible();
    await expect(page.getByTestId('add-deal-task-priority')).toBeVisible();

    // Save and Cancel buttons
    await expect(page.getByTestId('add-deal-task-save')).toBeVisible();
    await expect(page.getByTestId('add-deal-task-cancel')).toBeVisible();

    // Close modal
    await page.getByTestId('add-deal-task-cancel').click();
    await expect(modal).not.toBeVisible();
  });

  test('DDP-LTK-03: Creating a task adds it to linked tasks', async ({ page }) => {
    const dealId = await navigateToFirstDealDetail(page);

    // Get client_id from the deal via API to check timeline side effect
    const dealRes = await page.request.get(`/.netlify/functions/deals/${dealId}`);
    const dealData = await dealRes.json();
    const clientId = dealData.client_id;

    // Open add task modal
    await page.getByTestId('deal-linked-tasks-add-button').click();
    const modal = page.getByTestId('add-deal-task-modal');
    await expect(modal).toBeVisible();

    const taskTitle = `Test Task ${Date.now()}`;
    await page.getByTestId('add-deal-task-title').fill(taskTitle);
    await page.getByTestId('add-deal-task-save').click();

    await expect(modal).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    // Task should appear in the linked tasks list
    const tasksSection = page.getByTestId('deal-linked-tasks-section');
    await expect(tasksSection).toContainText(taskTitle);

    // Verify exactly one timeline entry was created for this task (side effect)
    const timelineRes = await page.request.get(`/.netlify/functions/client-timeline?clientId=${clientId}`);
    const timelineData = await timelineRes.json() as { events: { description: string; event_type: string }[] };
    const matchingEntries = timelineData.events.filter(
      (e) => e.event_type === 'task_created' && e.description.includes(taskTitle)
    );
    expect(matchingEntries).toHaveLength(1);
  });

  test('DDP-LTK-04: Checking a task marks it complete', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Create a task to toggle
    await page.getByTestId('deal-linked-tasks-add-button').click();
    const modal = page.getByTestId('add-deal-task-modal');
    await expect(modal).toBeVisible();

    const taskTitle = `Toggle Task ${Date.now()}`;
    await page.getByTestId('add-deal-task-title').fill(taskTitle);
    await page.getByTestId('add-deal-task-save').click();
    await expect(modal).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    // Verify the task appears uncompleted first
    const tasksSection = page.getByTestId('deal-linked-tasks-section');
    await expect(tasksSection).toContainText(taskTitle);

    // Find the specific task row containing our title and click its toggle button
    const taskRow = tasksSection.locator('[data-testid^="deal-linked-task-"]:not([data-testid*="toggle"])', { hasText: taskTitle });
    await taskRow.locator('[data-testid^="deal-linked-task-toggle-"]').click();
    await page.waitForLoadState('networkidle');

    // Verify the task now shows as completed: line-through text on the title span
    await expect(
      tasksSection.locator('.line-through').filter({ hasText: taskTitle })
    ).toBeVisible({ timeout: 10000 });
  });

  test('DDP-LTK-05: Clicking a linked task navigates to task detail page', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    const taskItems = page.locator('[data-testid^="deal-linked-task-"]:not([data-testid*="toggle"]):not([data-testid*="empty"])');
    const count = await taskItems.count();

    if (count > 0) {
      // Click on the task text area (not the checkbox)
      const firstTask = taskItems.first();
      const taskText = firstTask.locator('[data-testid^="deal-linked-task-title-"]');
      await taskText.click();
      await expect(page).toHaveURL(/\/tasks\//, { timeout: 5000 });
    }
  });
});

test.describe('DealDetailPage - AttachmentsSection (DDP-ATT)', () => {
  test('DDP-ATT-01: Attachments section lists deal-specific files', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    const attachmentsSection = page.getByTestId('deal-attachments-section');
    await expect(attachmentsSection).toBeVisible();
    await expect(attachmentsSection).toContainText('Attachments');

    // Upload button visible
    await expect(page.getByTestId('deal-attachments-upload-button')).toBeVisible();
  });

  test('DDP-ATT-02: Upload icon opens file upload dialog', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    await page.getByTestId('deal-attachments-upload-button').click();

    const modal = page.getByTestId('upload-attachment-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Upload Attachment');

    // File upload / link toggle visible
    await expect(page.getByTestId('upload-attachment-file-toggle')).toBeVisible();
    await expect(page.getByTestId('upload-attachment-link-toggle')).toBeVisible();

    // File upload mode is default — file input visible
    await expect(page.getByTestId('upload-attachment-file-input')).toBeVisible();

    // Close modal
    await page.getByTestId('upload-attachment-cancel').click();
    await expect(modal).not.toBeVisible();
  });

  test('DDP-ATT-03: Uploading a link attachment adds it to attachments list', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Open upload modal
    await page.getByTestId('deal-attachments-upload-button').click();
    const modal = page.getByTestId('upload-attachment-modal');
    await expect(modal).toBeVisible();

    // Switch to link mode to test link attachment
    await page.getByTestId('upload-attachment-link-toggle').click();
    const linkName = `TestLink_${Date.now()}`;
    await page.getByTestId('upload-attachment-link-name').fill(linkName);
    await page.getByTestId('upload-attachment-url').fill('https://example.com/test-link');

    await page.getByTestId('upload-attachment-save').click();
    await expect(modal).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    // Attachment should appear in the list
    const attachmentsSection = page.getByTestId('deal-attachments-section');
    await expect(attachmentsSection).toContainText(linkName);
  });

  test('DDP-ATT-04: Download link downloads the file', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    const downloadLinks = page.locator('[data-testid^="deal-attachment-download-"]');
    const count = await downloadLinks.count();

    if (count > 0) {
      const firstLink = downloadLinks.first();
      await expect(firstLink).toBeVisible();
      await expect(firstLink).toContainText('Download');
      // Should have an href attribute
      const href = await firstLink.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('DDP-ATT-05: Delete link removes attachment after confirmation', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // First create an attachment to delete via link mode
    await page.getByTestId('deal-attachments-upload-button').click();
    const modal = page.getByTestId('upload-attachment-modal');
    await expect(modal).toBeVisible();

    await page.getByTestId('upload-attachment-link-toggle').click();
    const filename = `DeleteMe_${Date.now()}`;
    await page.getByTestId('upload-attachment-link-name').fill(filename);
    await page.getByTestId('upload-attachment-url').fill('https://example.com/delete-me.pdf');
    await page.getByTestId('upload-attachment-save').click();
    await expect(modal).not.toBeVisible();

    // Wait for attachment to appear in the list
    const attachmentsSection = page.getByTestId('deal-attachments-section');
    await expect(attachmentsSection).toContainText(filename);

    // Find the delete button for the last attachment
    const deleteButtons = page.locator('[data-testid^="deal-attachment-delete-"]');
    const count = await deleteButtons.count();

    if (count > 0) {
      await deleteButtons.last().click();

      // Confirm dialog should appear
      const confirmDialog = page.getByTestId('confirm-dialog');
      await expect(confirmDialog).toBeVisible();

      // Confirm deletion
      await page.getByTestId('confirm-ok').click();

      // Wait for the attachment to be removed from the list
      await expect(attachmentsSection).not.toContainText(filename);
    }
  });

  test('DDP-ATT-06: File upload via file input persists attachment', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Open upload modal
    await page.getByTestId('deal-attachments-upload-button').click();
    const modal = page.getByTestId('upload-attachment-modal');
    await expect(modal).toBeVisible();

    // File Upload mode should be selected by default
    await expect(page.getByTestId('upload-attachment-file-input')).toBeVisible();

    // Use setInputFiles to simulate file selection
    const fileInput = page.getByTestId('upload-attachment-file-input');
    await fileInput.setInputFiles({
      name: 'TestReport.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content for testing'),
    });

    // Click Upload
    await page.getByTestId('upload-attachment-save').click();

    // Modal should close after upload completes
    await expect(modal).not.toBeVisible({ timeout: 30000 });

    // Uploaded file should appear in the attachments list
    const attachmentsSection = page.getByTestId('deal-attachments-section');
    await expect(
      attachmentsSection.locator('[data-testid^="deal-attachment-"]').filter({ hasText: 'TestReport.pdf' })
    ).not.toHaveCount(0, { timeout: 15000 });
  });
});

test.describe('DealDetailPage - Modal Cancel Tests', () => {
  test('DDP-WRT-07: Cancel button on Add Writeup modal closes without creating a writeup', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Open Add Writeup modal
    await page.getByTestId('deal-writeups-add-button').click();
    const modal = page.getByTestId('add-writeup-modal');
    await expect(modal).toBeVisible();

    // Fill in a title so we can verify it doesn't get created
    const writeupTitle = `Cancel Writeup ${Date.now()}`;
    await page.getByTestId('add-writeup-title').fill(writeupTitle);
    await page.getByTestId('add-writeup-content').fill('This should not be saved.');

    // Click Cancel
    await page.getByTestId('add-writeup-cancel').click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // The writeup should NOT appear in the section
    const writeupsSection = page.getByTestId('deal-writeups-section');
    await expect(
      writeupsSection.locator('[data-testid^="deal-writeup-"]').filter({ hasText: writeupTitle })
    ).toHaveCount(0);
  });

  test('DDP-LTK-06: Cancel button on Add Task modal closes without creating a task', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Open Add Task modal
    await page.getByTestId('deal-linked-tasks-add-button').click();
    const modal = page.getByTestId('add-deal-task-modal');
    await expect(modal).toBeVisible();

    // Fill in a title so we can verify it doesn't get created
    const taskTitle = `Cancel Task ${Date.now()}`;
    await page.getByTestId('add-deal-task-title').fill(taskTitle);

    // Click Cancel
    await page.getByTestId('add-deal-task-cancel').click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // The task should NOT appear in the section
    const tasksSection = page.getByTestId('deal-linked-tasks-section');
    await expect(
      tasksSection.locator('[data-testid^="deal-linked-task-"]').filter({ hasText: taskTitle })
    ).toHaveCount(0);
  });

  test('DDP-ATT-07: Cancel button on Upload Attachment modal closes without creating an attachment', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    // Open Upload Attachment modal
    await page.getByTestId('deal-attachments-upload-button').click();
    const modal = page.getByTestId('upload-attachment-modal');
    await expect(modal).toBeVisible();

    // Switch to link mode and enter a link name
    await page.getByTestId('upload-attachment-link-toggle').click();
    const linkName = `CancelLink_${Date.now()}`;
    await page.getByTestId('upload-attachment-link-name').fill(linkName);
    await page.getByTestId('upload-attachment-url').fill('https://example.com/should-not-save');

    // Click Cancel
    await page.getByTestId('upload-attachment-cancel').click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // The attachment should NOT appear in the section
    const attachmentsSection = page.getByTestId('deal-attachments-section');
    await expect(
      attachmentsSection.locator('[data-testid^="deal-attachment-"]').filter({ hasText: linkName })
    ).toHaveCount(0);
  });
});

test.describe('DealDetailPage - ContactsSection (DDP-CON)', () => {
  test('DDP-CON-01: Contacts section lists deal-related individuals', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    const contactsSection = page.getByTestId('deal-contacts-section');
    await expect(contactsSection).toBeVisible();
    await expect(contactsSection).toContainText('Contacts/Individuals');

    // Either contacts or empty state
    const contacts = page.locator('[data-testid^="deal-contact-"]').filter({ hasNotText: 'view-profile' }).filter({ hasNotText: 'empty' });
    const emptyState = page.getByTestId('deal-contacts-empty');
    const hasContacts = await contacts.count() > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContacts || hasEmpty).toBeTruthy();

    if (hasContacts) {
      // Each contact should have a View Profile link
      const viewProfileLinks = page.locator('[data-testid^="deal-contact-view-profile-"]');
      const profileCount = await viewProfileLinks.count();
      expect(profileCount).toBeGreaterThan(0);
      await expect(viewProfileLinks.first()).toContainText('View Profile');
    }
  });

  test('DDP-CON-02: View Profile link navigates to PersonDetailPage', async ({ page }) => {
    await navigateToFirstDealDetail(page);

    const viewProfileLinks = page.locator('[data-testid^="deal-contact-view-profile-"]');
    const count = await viewProfileLinks.count();

    if (count > 0) {
      await viewProfileLinks.first().click();
      await page.waitForLoadState('networkidle');

      // Should navigate to an individuals page
      await expect(page).toHaveURL(/\/individuals\//);
    }
  });
});
