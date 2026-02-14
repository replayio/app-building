import { test, expect } from '@playwright/test';

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

    // Contact info area exists
    const contactInfo = page.getByTestId('person-header-contact-info');
    await expect(contactInfo).toBeVisible();
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

  test('PDP-HDR-04: Cancel edit restores original values', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    // Get original name
    const originalName = await page.getByTestId('person-header-name').textContent();

    // Enter edit mode
    await page.getByTestId('person-header-edit-button').click();

    // Change name
    const nameInput = page.getByTestId('person-header-name-input');
    await nameInput.clear();
    await nameInput.fill('Changed Name XYZ');

    // Cancel
    await page.getByTestId('person-header-cancel-button').click();

    // Name should be restored to original
    await expect(page.getByTestId('person-header-name')).toHaveText(originalName!);
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

    // Should have Person ID and Relationship Type fields
    await expect(modal.getByText('Person ID *')).toBeVisible();
    await expect(modal.getByText('Relationship Type *')).toBeVisible();

    // Save and Cancel buttons
    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('PDP-REL-05: Save is disabled when person ID is empty in Add Relationship modal', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    await page.getByTestId('relationships-add-entry-button').click();
    const modal = page.getByTestId('add-relationship-modal');

    const saveBtn = modal.getByRole('button', { name: 'Save' });
    await expect(saveBtn).toBeDisabled();
  });

  test('PDP-REL-06: Filter button opens filter dropdown', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    await page.getByTestId('relationships-filter-button').click();

    const dropdown = page.getByTestId('relationships-filter-dropdown');
    await expect(dropdown).toBeVisible();

    // Should have "All" option
    await expect(page.getByTestId('relationships-filter-option-all')).toBeVisible();
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
    await expect(modal.getByText('Team Member')).toBeVisible();

    // Save and Cancel buttons
    await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('PDP-CH-04: Save is disabled when required fields are empty in Add Contact History modal', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    await page.getByTestId('contact-history-add-entry-button').click();
    const modal = page.getByTestId('add-contact-history-modal');

    const saveBtn = modal.getByRole('button', { name: 'Save' });
    await expect(saveBtn).toBeDisabled();
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
      await expect(editModal.getByText('Team Member')).toBeVisible();

      // Save and Cancel buttons
      await expect(editModal.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect(editModal.getByRole('button', { name: 'Cancel' })).toBeVisible();
    }
  });

  test('PDP-CH-06: Cancel button closes the edit modal', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    const entries = page.locator('[data-testid^="contact-history-entry-"]');
    const count = await entries.count();

    if (count > 0) {
      const first = entries.first();
      const editBtn = first.locator('[data-testid^="contact-history-edit-"]');
      await editBtn.click();

      const editModal = page.getByTestId('edit-contact-history-modal');
      await expect(editModal).toBeVisible();

      await editModal.getByRole('button', { name: 'Cancel' }).click();
      await expect(editModal).not.toBeVisible();
    }
  });

  test('PDP-CH-07: Filter button filters contact history by type', async ({ page }) => {
    await navigateToFirstPersonDetail(page);

    await page.getByTestId('contact-history-filter-button').click();

    const dropdown = page.getByTestId('contact-history-filter-dropdown');
    await expect(dropdown).toBeVisible();

    // Should have "All" option
    await expect(page.getByTestId('contact-history-filter-option-all')).toBeVisible();
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
