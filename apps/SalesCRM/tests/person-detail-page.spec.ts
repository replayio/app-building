import { test, expect } from './base';

/**
 * Helper: navigate to the first individual's detail page.
 * Goes to /clients, finds a client with people, then navigates to the first person.
 * Returns the individualId.
 */
async function navigateToFirstPersonDetail(page: import('@playwright/test').Page): Promise<string> {
  // Go to clients list to find a client with people
  await page.goto('/clients');
  await page.waitForLoadState('networkidle');

  // Wait for client rows to render after API data loads
  const rows = page.locator('[data-testid^="client-row-"]');
  await rows.first().waitFor({ state: 'visible', timeout: 15000 });
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);

  const testId = await rows.first().getAttribute('data-testid');
  const clientId = testId!.replace('client-row-', '');

  await page.goto(`/clients/${clientId}`);
  await page.waitForLoadState('networkidle');

  // Wait for people section to load
  await page.getByTestId('people-section').waitFor({ state: 'visible', timeout: 10000 });

  // Find a person in the people section
  const personItems = page.locator('[data-testid^="person-item-"]');
  const personCount = await personItems.count();

  if (personCount > 0) {
    const personTestId = await personItems.first().getAttribute('data-testid');
    const personId = personTestId!.replace('person-item-', '');

    await page.goto(`/individuals/${personId}`);
    await page.waitForLoadState('networkidle');
    return personId;
  }

  // Fallback: try to find any individual via the clients list
  await page.goto('/clients');
  await page.waitForLoadState('networkidle');
  await rows.first().waitFor({ state: 'visible', timeout: 15000 });

  for (let i = 1; i < count && i < 10; i++) {
    const rowTestId = await rows.nth(i).getAttribute('data-testid');
    const cId = rowTestId!.replace('client-row-', '');
    await page.goto(`/clients/${cId}`);
    await page.waitForLoadState('networkidle');
    await page.getByTestId('people-section').waitFor({ state: 'visible', timeout: 10000 });

    const pItems = page.locator('[data-testid^="person-item-"]');
    const pCount = await pItems.count();
    if (pCount > 0) {
      const pTestId = await pItems.first().getAttribute('data-testid');
      const pId = pTestId!.replace('person-item-', '');
      await page.goto(`/individuals/${pId}`);
      await page.waitForLoadState('networkidle');
      return pId;
    }
  }

  throw new Error('No individuals found across clients');
}

test.describe('PersonDetailPage - PersonHeader (PDP-HDR)', () => {
  test('PDP-HDR-01: Header displays person name, title, and contact info', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    const header = page.getByTestId('person-header');
    await expect(header).toBeVisible();

    // Person name is displayed
    const nameEl = page.getByTestId('person-header-name');
    await expect(nameEl).toBeVisible();
    const nameText = await nameEl.textContent();
    expect(nameText!.length).toBeGreaterThan(0);

    // Contact info area exists (may be empty if the individual has no email/phone/location)
    const contactInfo = page.getByTestId('person-header-contact-info');
    await expect(contactInfo).toHaveCount(1);
  });

  test('PDP-HDR-02: Clicking associated client link navigates to ClientDetailPage', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    const associatedClients = page.getByTestId('person-header-associated-clients');
    const isVisible = await associatedClients.isVisible().catch(() => false);

    if (isVisible) {
      // Find the first client link
      const clientLinks = page.locator('[data-testid^="person-header-client-link-"]');
      const linkCount = await clientLinks.count();
      if (linkCount > 0) {
        const linkTestId = await clientLinks.first().getAttribute('data-testid');
        const clientId = linkTestId!.replace('person-header-client-link-', '');

        await clientLinks.first().click();
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(new RegExp(`/clients/${clientId}`));
      }
    }
  });

  test('PDP-HDR-03: Person header info is editable', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    // Click edit button
    await page.getByTestId('person-header-edit-button').click();

    // Edit form should be visible with all fields
    await expect(page.getByTestId('person-header-edit-form')).toBeVisible();
    await expect(page.getByTestId('person-header-name-input')).toBeVisible();
    await expect(page.getByTestId('person-header-title-input')).toBeVisible();
    await expect(page.getByTestId('person-header-email-input')).toBeVisible();
    await expect(page.getByTestId('person-header-phone-input')).toBeVisible();
    await expect(page.getByTestId('person-header-location-input')).toBeVisible();

    // Save and Cancel buttons visible
    await expect(page.getByTestId('person-header-save-button')).toBeVisible();
    await expect(page.getByTestId('person-header-cancel-button')).toBeVisible();
  });

  test('PDP-HDR-04: Saving edited person info persists the change', async ({ page }) => {
    const personId = await navigateToFirstPersonDetail(page);

    // Get original phone to restore later
    const originalPhone = await page.getByTestId('person-header-phone').textContent().catch(() => '');

    // Enter edit mode
    await page.getByTestId('person-header-edit-button').click();
    await expect(page.getByTestId('person-header-edit-form')).toBeVisible();

    // Change phone number
    const newPhone = '+1 (555) 999-8888';
    const phoneInput = page.getByTestId('person-header-phone-input');
    await phoneInput.clear();
    await phoneInput.fill(newPhone);

    // Intercept the PUT request to verify persistence
    const [updateRequest] = await Promise.all([
      page.waitForRequest(req =>
        req.method() === 'PUT' && req.url().includes(`/.netlify/functions/individuals`)
      ),
      page.getByTestId('person-header-save-button').click(),
    ]);

    // Verify the API was called with the new phone value
    const body = updateRequest.postDataJSON();
    expect(body.phone).toBe(newPhone);

    // Verify the UI shows the updated phone
    await expect(page.getByTestId('person-header-phone')).toContainText(newPhone);

    // Verify persistence: reload page and check phone is still updated
    await page.goto(`/individuals/${personId}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('person-header-phone')).toContainText(newPhone);

    // Restore original phone
    await page.getByTestId('person-header-edit-button').click();
    await page.getByTestId('person-header-phone-input').clear();
    await page.getByTestId('person-header-phone-input').fill(originalPhone || '');
    await page.getByTestId('person-header-save-button').click();
    await page.waitForLoadState('networkidle');
  });
});

test.describe('PersonDetailPage - RelationshipsSection (PDP-REL)', () => {
  test('PDP-REL-01: Relationships section displays with view toggle', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    const section = page.getByTestId('relationships-section');
    await expect(section).toBeVisible();

    // View toggle tabs should be visible
    const viewToggle = page.getByTestId('relationships-view-toggle');
    await expect(viewToggle).toBeVisible();

    // Graph View and List View tabs
    await expect(page.getByTestId('relationships-graph-view-tab')).toBeVisible();
    await expect(page.getByTestId('relationships-list-view-tab')).toBeVisible();

    // Filter and Add Entry buttons
    await expect(page.getByTestId('relationships-filter-button')).toBeVisible();
    await expect(page.getByTestId('relationships-add-entry-button')).toBeVisible();
  });

  test('PDP-REL-02: List View shows relationship entries', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    // Click list view tab to ensure we're in list view
    await page.getByTestId('relationships-list-view-tab').click();

    const listView = page.getByTestId('relationships-list-view');
    await expect(listView).toBeVisible();

    // Check for relationship items or empty state
    const emptyState = page.getByTestId('relationships-empty-state');
    const items = page.locator('[data-testid^="relationship-item-"]');
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const itemCount = await items.count();

    expect(hasEmpty || itemCount > 0).toBeTruthy();

    if (itemCount > 0) {
      // First item should have name and type
      const first = items.first();
      const nameEl = first.locator('[data-testid^="relationship-name-"]');
      await expect(nameEl).toBeVisible();

      const typeEl = first.locator('[data-testid^="relationship-type-"]');
      await expect(typeEl).toBeVisible();

      // Link button should be visible
      const linkBtn = first.locator('[data-testid^="relationship-link-"]');
      await expect(linkBtn).toBeVisible();
    }
  });

  test('PDP-REL-03: Clicking Link on a relationship navigates to that person', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    // Ensure list view
    await page.getByTestId('relationships-list-view-tab').click();

    const items = page.locator('[data-testid^="relationship-item-"]');
    const count = await items.count();

    if (count > 0) {
      const linkBtn = items.first().locator('[data-testid^="relationship-link-"]');
      await linkBtn.click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/individuals\//);
    }
  });

  test('PDP-REL-04: Add Entry button opens relationship creation form', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    await page.getByTestId('relationships-add-entry-button').click();

    const modal = page.getByTestId('add-relationship-modal');
    await expect(modal).toBeVisible();

    // Should have Person and Relationship Type fields
    await expect(modal.getByText('Person *')).toBeVisible();
    await expect(modal.getByText('Relationship Type *')).toBeVisible();

    // Save and Cancel buttons
    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('PDP-REL-05: Adding a relationship persists and shows in list', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    // Switch to list view
    await page.getByTestId('relationships-list-view-tab').click();

    // Count existing relationships
    const itemsBefore = page.locator('[data-testid^="relationship-item-"]');
    const countBefore = await itemsBefore.count();

    // Open Add Relationship modal
    await page.getByTestId('relationships-add-entry-button').click();
    const modal = page.getByTestId('add-relationship-modal');
    await expect(modal).toBeVisible();

    // Search for a person to add as relationship
    const searchInput = page.getByTestId('relationship-person-search');
    await searchInput.fill('a');
    // Wait for search results to appear and select the first person option
    const personOption = page.locator('[data-testid^="person-option-"]').first();
    await personOption.waitFor({ state: 'visible', timeout: 10000 });
    await personOption.click();

    // Select relationship type via custom FilterSelect dropdown
    await page.getByTestId('relationship-type-select-trigger').click();
    await page.getByTestId('relationship-type-select-option-manager').click();

    // Intercept the POST request to verify persistence
    const [createRequest] = await Promise.all([
      page.waitForRequest(req =>
        req.method() === 'POST' && req.url().includes('/relationships')
      ),
      page.getByTestId('relationship-save-button').click(),
    ]);

    // Verify the API was called with correct payload
    const body = createRequest.postDataJSON();
    expect(body.relationship_type).toBe('manager');
    expect(body.related_individual_id).toBeTruthy();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Verify the new relationship appears in the list
    const itemsAfter = page.locator('[data-testid^="relationship-item-"]');
    await expect(itemsAfter).toHaveCount(countBefore + 1, { timeout: 10000 });

    // Clean up: delete the newly added relationship
    const newItem = itemsAfter.last();
    const deleteBtn = newItem.locator('[data-testid^="relationship-delete-"]');
    const isDeleteVisible = await deleteBtn.isVisible().catch(() => false);
    if (isDeleteVisible) {
      await deleteBtn.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('PDP-REL-06: Filter button filters relationships', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    // Switch to list view
    await page.getByTestId('relationships-list-view-tab').click();

    const items = page.locator('[data-testid^="relationship-item-"]');
    const totalCount = await items.count();

    if (totalCount > 0) {
      // Get the type of the first relationship to use as filter
      const firstTypeEl = items.first().locator('[data-testid^="relationship-type-"]');
      const firstTypeText = await firstTypeEl.textContent();
      const filterType = firstTypeText!.replace(/[()]/g, '').trim().toLowerCase().replace(/\s+/g, '_');

      // Open the filter dropdown
      await page.getByTestId('relationships-filter-button').click();
      const dropdown = page.getByTestId('relationships-filter-dropdown');
      await expect(dropdown).toBeVisible();

      // Click a specific filter type option
      const filterOption = page.getByTestId(`relationships-filter-option-${filterType}`);
      await filterOption.click();

      // Verify all remaining items have the selected type
      const filteredItems = page.locator('[data-testid^="relationship-item-"]');
      const filteredCount = await filteredItems.count();
      expect(filteredCount).toBeGreaterThan(0);
      expect(filteredCount).toBeLessThanOrEqual(totalCount);

      for (let i = 0; i < filteredCount; i++) {
        const typeEl = filteredItems.nth(i).locator('[data-testid^="relationship-type-"]');
        const typeText = await typeEl.textContent();
        expect(typeText!.toLowerCase().replace(/[()]/g, '').trim().replace(/\s+/g, '_')).toBe(filterType);
      }

      // Reset filter to "All"
      await page.getByTestId('relationships-filter-button').click();
      await page.getByTestId('relationships-filter-option-all').click();

      // All items should be visible again
      await expect(page.locator('[data-testid^="relationship-item-"]')).toHaveCount(totalCount);
    }
  });

  test('PDP-REL-07: Graph View displays visual relationship graph', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    // Click Graph View tab
    await page.getByTestId('relationships-graph-view-tab').click();

    const graphView = page.getByTestId('relationships-graph-view');
    await expect(graphView).toBeVisible();

    // Center node should be visible
    const centerNode = page.getByTestId('relationships-graph-center');
    await expect(centerNode).toBeVisible();
    await expect(centerNode).toContainText('You');
  });

  test('PDP-REL-08: Delete button removes a relationship', async ({ page }) => {
    const personId = await navigateToFirstPersonDetail(page);

    // Switch to list view
    await page.getByTestId('relationships-list-view-tab').click();

    const items = page.locator('[data-testid^="relationship-item-"]');
    const countBefore = await items.count();

    if (countBefore > 0) {
      // Get the last relationship's info so we can re-add it if needed
      const lastItem = items.last();
      const lastItemTestId = await lastItem.getAttribute('data-testid');
      const relId = lastItemTestId!.replace('relationship-item-', '');

      // Click the delete button on the last relationship
      const deleteBtn = page.getByTestId(`relationship-delete-${relId}`);
      await expect(deleteBtn).toBeVisible();

      // Intercept the DELETE request to verify persistence
      const [deleteRequest] = await Promise.all([
        page.waitForRequest(req =>
          req.method() === 'DELETE' && req.url().includes('/relationships/')
        ),
        deleteBtn.click(),
      ]);

      // Verify the DELETE API was called
      expect(deleteRequest.url()).toContain(`/relationships/${relId}`);

      // Verify the item is removed from the list
      await expect(items).toHaveCount(countBefore - 1, { timeout: 10000 });

      // Verify persistence: reload and confirm the relationship is gone
      await page.goto(`/individuals/${personId}`);
      await page.waitForLoadState('networkidle');
      await page.getByTestId('relationships-list-view-tab').click();
      await expect(page.locator('[data-testid^="relationship-item-"]')).toHaveCount(countBefore - 1, { timeout: 10000 });
    }
  });
});

test.describe('PersonDetailPage - ContactHistorySection (PDP-CH)', () => {
  test('PDP-CH-01: Contact history displays section with controls', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    const section = page.getByTestId('contact-history-section');
    await expect(section).toBeVisible();

    // Filter and Add Entry buttons should be visible
    await expect(page.getByTestId('contact-history-filter-button')).toBeVisible();
    await expect(page.getByTestId('contact-history-add-entry-button')).toBeVisible();
  });

  test('PDP-CH-02: Contact history entries show correct details', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    const entries = page.locator('[data-testid^="contact-history-entry-"]');
    const count = await entries.count();

    if (count > 0) {
      const first = entries.first();

      // Date should be visible
      const dateEl = first.locator('[data-testid^="contact-history-date-"]');
      await expect(dateEl).toBeVisible();
      const dateText = await dateEl.textContent();
      expect(dateText!.length).toBeGreaterThan(0);

      // Type should be visible
      const typeEl = first.locator('[data-testid^="contact-history-type-"]');
      await expect(typeEl).toBeVisible();

      // Summary should be visible
      const summaryEl = first.locator('[data-testid^="contact-history-summary-"]');
      await expect(summaryEl).toBeVisible();
      const summaryText = await summaryEl.textContent();
      expect(summaryText).toContain('Summary:');

      // Edit button should be visible
      const editBtn = first.locator('[data-testid^="contact-history-edit-"]');
      await expect(editBtn).toBeVisible();
    }
  });

  test('PDP-CH-03: Add Entry button opens contact history creation form', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    await page.getByTestId('contact-history-add-entry-button').click();

    const modal = page.getByTestId('add-contact-history-modal');
    await expect(modal).toBeVisible();

    // Should have Date/Time, Type, Summary, Team Member fields
    await expect(modal.getByText('Date/Time *')).toBeVisible();
    await expect(modal.getByText('Type *')).toBeVisible();
    await expect(modal.getByText('Summary/Notes *')).toBeVisible();
    await expect(modal.getByTestId('contact-history-team-member-input')).toBeVisible();

    // Save and Cancel buttons
    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('PDP-CH-04: Adding a contact history entry persists and shows in log', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    // Count existing entries
    const entriesBefore = page.locator('[data-testid^="contact-history-entry-"]');
    const countBefore = await entriesBefore.count();

    // Open Add Contact History modal
    await page.getByTestId('contact-history-add-entry-button').click();
    const modal = page.getByTestId('add-contact-history-modal');
    await expect(modal).toBeVisible();

    // Fill in the form fields
    const dateInput = page.getByTestId('contact-history-date-input');
    await dateInput.fill('2024-10-28T15:00');

    // Select type via custom FilterSelect dropdown
    await page.getByTestId('contact-history-type-select-trigger').click();
    await page.getByTestId('contact-history-type-select-option-phone_call').click();

    const summaryInput = page.getByTestId('contact-history-summary-input');
    await summaryInput.fill('Discussed pricing options for Q4');

    const teamMemberInput = page.getByTestId('contact-history-team-member-input');
    await teamMemberInput.fill('Sarah K.');

    // Intercept the POST request to verify persistence
    const [createRequest] = await Promise.all([
      page.waitForRequest(req =>
        req.method() === 'POST' && req.url().includes('/contact-history')
      ),
      page.getByTestId('contact-history-save-button').click(),
    ]);

    // Verify the API was called with correct payload
    const body = createRequest.postDataJSON();
    expect(body.type).toBe('phone_call');
    expect(body.summary).toBe('Discussed pricing options for Q4');
    expect(body.team_member).toBe('Sarah K.');

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Verify the new entry appears in the list
    const entriesAfter = page.locator('[data-testid^="contact-history-entry-"]');
    await expect(entriesAfter).toHaveCount(countBefore + 1, { timeout: 10000 });

    // Verify the new entry contains the summary text
    await expect(
      page.locator('[data-testid^="contact-history-summary-"]').filter({ hasText: 'Discussed pricing options for Q4' })
    ).toHaveCount(1);

    // Clean up: delete the newly added entry
    const newEntry = entriesAfter.filter({ hasText: 'Discussed pricing options for Q4' });
    const deleteBtn = newEntry.locator('[data-testid^="contact-history-delete-"]');
    const isDeleteVisible = await deleteBtn.isVisible().catch(() => false);
    if (isDeleteVisible) {
      await deleteBtn.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('PDP-CH-05: Edit icon opens edit form for existing entry', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    const entries = page.locator('[data-testid^="contact-history-entry-"]');
    const count = await entries.count();

    if (count > 0) {
      const first = entries.first();
      const editBtn = first.locator('[data-testid^="contact-history-edit-"]');
      await editBtn.click();

      const editModal = page.getByTestId('edit-contact-history-modal');
      await expect(editModal).toBeVisible();

      // Should have pre-filled fields
      await expect(editModal.getByText('Date/Time *')).toBeVisible();
      await expect(editModal.getByText('Type *')).toBeVisible();
      await expect(editModal.getByText('Summary/Notes *')).toBeVisible();
      await expect(editModal.getByTestId('edit-contact-history-team-member-input')).toBeVisible();

      // Save and Cancel buttons
      await expect(editModal.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect(editModal.getByRole('button', { name: 'Cancel' })).toBeVisible();
    }
  });

  test('PDP-CH-06: Editing a contact history entry persists the change', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    const entries = page.locator('[data-testid^="contact-history-entry-"]');
    const count = await entries.count();

    if (count > 0) {
      const first = entries.first();

      // Get the entry's ID from the data-testid
      const entryTestId = await first.getAttribute('data-testid');
      const entryId = entryTestId!.replace('contact-history-entry-', '');

      // Open the edit modal
      const editBtn = first.locator('[data-testid^="contact-history-edit-"]');
      await editBtn.click();

      const editModal = page.getByTestId('edit-contact-history-modal');
      await expect(editModal).toBeVisible();

      // Get original summary to restore later
      const summaryInput = page.getByTestId('edit-contact-history-summary-input');
      const originalSummary = await summaryInput.inputValue();

      // Change the summary text
      const newSummary = 'Updated summary for persistence test';
      await summaryInput.clear();
      await summaryInput.fill(newSummary);

      // Intercept the PUT request to verify persistence
      const [updateRequest] = await Promise.all([
        page.waitForRequest(req =>
          req.method() === 'PUT' && req.url().includes('/contact-history/')
        ),
        page.getByTestId('edit-contact-history-save-button').click(),
      ]);

      // Verify the API was called with the updated summary
      const body = updateRequest.postDataJSON();
      expect(body.summary).toBe(newSummary);

      // Modal should close
      await expect(editModal).not.toBeVisible();

      // Verify the updated summary is shown in the UI
      await expect(
        page.locator(`[data-testid="contact-history-summary-${entryId}"]`)
      ).toContainText(newSummary);

      // Restore original summary
      const restoreEditBtn = page.locator(`[data-testid="contact-history-edit-${entryId}"]`);
      await restoreEditBtn.click();
      await expect(editModal).toBeVisible();
      const restoreSummaryInput = page.getByTestId('edit-contact-history-summary-input');
      await restoreSummaryInput.clear();
      await restoreSummaryInput.fill(originalSummary);
      await page.getByTestId('edit-contact-history-save-button').click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('PDP-CH-07: Filter button filters contact history by type', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    const entries = page.locator('[data-testid^="contact-history-entry-"]');
    const totalCount = await entries.count();

    if (totalCount > 0) {
      // Get the type of the first entry to use as filter
      const firstTypeEl = entries.first().locator('[data-testid^="contact-history-type-"]');
      const firstTypeText = await firstTypeEl.textContent();
      const filterType = firstTypeText!.trim().toLowerCase().replace(/\s+/g, '_');

      // Open the filter dropdown
      await page.getByTestId('contact-history-filter-button').click();
      const dropdown = page.getByTestId('contact-history-filter-dropdown');
      await expect(dropdown).toBeVisible();

      // Click a specific filter type option
      const filterOption = page.getByTestId(`contact-history-filter-option-${filterType}`);
      await filterOption.click();

      // Verify all remaining entries have the selected type
      const filteredEntries = page.locator('[data-testid^="contact-history-entry-"]');
      const filteredCount = await filteredEntries.count();
      expect(filteredCount).toBeGreaterThan(0);
      expect(filteredCount).toBeLessThanOrEqual(totalCount);

      for (let i = 0; i < filteredCount; i++) {
        const typeEl = filteredEntries.nth(i).locator('[data-testid^="contact-history-type-"]');
        const typeText = await typeEl.textContent();
        expect(typeText!.trim().toLowerCase().replace(/\s+/g, '_')).toBe(filterType);
      }

      // Reset filter to "All"
      await page.getByTestId('contact-history-filter-button').click();
      await page.getByTestId('contact-history-filter-option-all').click();

      // All entries should be visible again
      await expect(page.locator('[data-testid^="contact-history-entry-"]')).toHaveCount(totalCount);
    }
  });

  test('PDP-CH-08: Delete button removes a contact history entry', async ({ page }) => {
    const personId = await navigateToFirstPersonDetail(page);

    const entries = page.locator('[data-testid^="contact-history-entry-"]');
    const countBefore = await entries.count();

    if (countBefore > 0) {
      // Get the last entry's ID
      const lastEntry = entries.last();
      const lastEntryTestId = await lastEntry.getAttribute('data-testid');
      const entryId = lastEntryTestId!.replace('contact-history-entry-', '');

      // Click the delete button on the last entry
      const deleteBtn = page.getByTestId(`contact-history-delete-${entryId}`);
      await expect(deleteBtn).toBeVisible();

      // Intercept the DELETE request to verify persistence
      const [deleteRequest] = await Promise.all([
        page.waitForRequest(req =>
          req.method() === 'DELETE' && req.url().includes('/contact-history/')
        ),
        deleteBtn.click(),
      ]);

      // Verify the DELETE API was called
      expect(deleteRequest.url()).toContain(`/contact-history/${entryId}`);

      // Verify the entry is removed from the list
      await expect(entries).toHaveCount(countBefore - 1, { timeout: 10000 });

      // Verify persistence: reload and confirm the entry is gone
      await page.goto(`/individuals/${personId}`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-testid^="contact-history-entry-"]')).toHaveCount(countBefore - 1, { timeout: 10000 });
    }
  });
});

test.describe('PersonDetailPage - AssociatedClientsSection (PDP-AC)', () => {
  test('PDP-AC-01: Associated clients section shows client cards', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    const section = page.getByTestId('associated-clients-section');
    await expect(section).toBeVisible();

    // Should show either client cards or empty state
    const emptyState = page.getByTestId('associated-clients-empty-state');
    const cards = page.locator('[data-testid^="associated-client-card-"]');
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const cardCount = await cards.count();

    expect(hasEmpty || cardCount > 0).toBeTruthy();

    if (cardCount > 0) {
      const firstCard = cards.first();

      // Client name visible
      const nameEl = firstCard.locator('[data-testid^="associated-client-name-"]');
      await expect(nameEl).toBeVisible();
      const nameText = await nameEl.textContent();
      expect(nameText!.length).toBeGreaterThan(0);

      // Status badge visible
      const statusEl = firstCard.locator('[data-testid^="associated-client-status-"]');
      await expect(statusEl).toBeVisible();
      const statusText = await statusEl.textContent();
      expect(statusText).toContain('Status:');

      // View Client Detail Page button
      const viewBtn = firstCard.locator('[data-testid^="associated-client-view-button-"]');
      await expect(viewBtn).toBeVisible();
      await expect(viewBtn).toContainText('View Client Detail Page');
    }
  });

  test('PDP-AC-02: View Client Detail Page button navigates to client', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    const cards = page.locator('[data-testid^="associated-client-card-"]');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      const firstCard = cards.first();
      const cardTestId = await firstCard.getAttribute('data-testid');
      const clientId = cardTestId!.replace('associated-client-card-', '');

      const viewBtn = firstCard.locator('[data-testid^="associated-client-view-button-"]');
      await viewBtn.click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(new RegExp(`/clients/${clientId}`));
    }
  });
});
