import { test, expect } from '@playwright/test'

// Helper: fetch an individual by name from the API
async function findIndividual(request: { get: (url: string) => Promise<{ json: () => Promise<unknown> }> }, name: string) {
  const res = await request.get('/.netlify/functions/individuals')
  const data = res.json() as Promise<{ individuals: { id: string; name: string; title: string | null; email: string | null }[] }>
  const individuals = (await data).individuals
  return individuals.find(i => i.name === name) || individuals[0]
}

// Helper: fetch full individual details
async function getIndividualDetails(request: { get: (url: string) => Promise<{ json: () => Promise<unknown> }> }, id: string) {
  const res = await request.get(`/.netlify/functions/individuals/${id}`)
  return res.json() as Promise<{
    id: string
    name: string
    title: string | null
    email: string | null
    phone: string | null
    location: string | null
    associated_clients: { client_id: string; client_name: string; role: string; is_primary: boolean }[]
  }>
}

// =========================================================================
// PersonHeader
// =========================================================================
test.describe('PersonHeader', () => {
  test('Header displays person\'s full name prominently', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('person-header')).toBeVisible()

    const nameEl = page.getByTestId('person-name')
    await expect(nameEl).toBeVisible()
    await expect(nameEl).toHaveText(individual.name)

    // Verify it's rendered as an h1
    const tagName = await nameEl.evaluate(el => el.tagName)
    expect(tagName).toBe('H1')
  })

  test('Header displays title and client associations', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    const details = await getIndividualDetails(page.request, individual.id)
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('person-header')).toBeVisible()

    const titleRow = page.getByTestId('person-title')
    await expect(titleRow).toBeVisible()

    // Should contain the title
    if (details.title) {
      await expect(titleRow).toContainText(details.title)
    }

    // Should contain client associations joined with &
    if (details.associated_clients.length > 0) {
      const clientNames = details.associated_clients.map(c => c.client_name)
      for (const name of clientNames) {
        await expect(titleRow).toContainText(name)
      }
    }
  })

  test('Header displays email with mail icon', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('person-header')).toBeVisible()

    const emailEl = page.getByTestId('person-email')
    await expect(emailEl).toBeVisible()

    // Has an SVG icon
    await expect(emailEl.locator('svg')).toBeVisible()

    // Shows the email address
    await expect(emailEl).toContainText('sarah.jenkins@acmecorp.com')
  })

  test('Header displays phone number with phone icon', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('person-header')).toBeVisible()

    const phoneEl = page.getByTestId('person-phone')
    await expect(phoneEl).toBeVisible()

    // Has an SVG icon
    await expect(phoneEl.locator('svg')).toBeVisible()

    // Shows the phone number
    await expect(phoneEl).toContainText('+1 (555) 123-4567')
  })

  test('Header displays location with location pin icon', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('person-header')).toBeVisible()

    const locationEl = page.getByTestId('person-location')
    await expect(locationEl).toBeVisible()

    // Has an SVG icon
    await expect(locationEl.locator('svg')).toBeVisible()

    // Shows the location
    await expect(locationEl).toContainText('San Francisco, CA')
  })

  test('Header displays associated clients as clickable links', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    const details = await getIndividualDetails(page.request, individual.id)
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('person-header')).toBeVisible()

    const associatedClientsSection = page.getByTestId('person-associated-clients')
    await expect(associatedClientsSection).toBeVisible()
    await expect(associatedClientsSection).toContainText('Associated Clients:')

    // Each associated client should be a clickable link
    const clientLinks = page.getByTestId('associated-client-link')
    const linkCount = await clientLinks.count()
    expect(linkCount).toBe(details.associated_clients.length)

    // Verify each client name appears
    for (const client of details.associated_clients) {
      await expect(clientLinks.filter({ hasText: client.client_name })).toBeVisible()
    }
  })

  test('Associated client link navigates to client detail page', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    const details = await getIndividualDetails(page.request, individual.id)
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('person-header')).toBeVisible()

    // Find the first associated client and click it
    const firstClient = details.associated_clients[0]
    const link = page.getByTestId('associated-client-link').filter({ hasText: firstClient.client_name })
    await link.click()

    // Should navigate to the client detail page
    await expect(page).toHaveURL(`/clients/${firstClient.client_id}`)
  })

  test('Each associated client link navigates correctly', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    const details = await getIndividualDetails(page.request, individual.id)
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('person-header')).toBeVisible()

    // If there's more than one client, test the second link too
    if (details.associated_clients.length > 1) {
      const secondClient = details.associated_clients[1]
      const link = page.getByTestId('associated-client-link').filter({ hasText: secondClient.client_name })
      await link.click()
      await expect(page).toHaveURL(`/clients/${secondClient.client_id}`)
    }
  })
})

// =========================================================================
// RelationshipsSection
// =========================================================================
test.describe('RelationshipsSection', () => {
  test('Relationships section displays heading with icon', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-section')).toBeVisible()

    const heading = page.getByTestId('relationships-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('Relationships with Other Individuals')

    // Icon should be present next to the heading
    const headingContainer = page.locator('[data-testid="relationships-section"] .person-section-heading')
    await expect(headingContainer.locator('svg')).toBeVisible()
  })

  test('Relationships section shows Graph View and List View tabs', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-section')).toBeVisible()

    await expect(page.getByTestId('graph-view-tab')).toBeVisible()
    await expect(page.getByTestId('list-view-tab')).toBeVisible()

    // One tab should be active (List View is default)
    await expect(page.getByTestId('list-view-tab')).toHaveClass(/active/)
  })

  test('List View displays relationship entries with all details', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-section')).toBeVisible()

    // Wait for relationships to load
    await expect(page.getByTestId('relationships-list')).toBeVisible({ timeout: 10000 })

    const entries = page.getByTestId('relationship-entry')
    const count = await entries.count()
    expect(count).toBeGreaterThan(0)

    // Each entry should show name, type in parentheses, and [Link]
    const firstEntry = entries.first()
    // Should have a name (bold)
    await expect(firstEntry.locator('.relationship-name')).toBeVisible()
    // Should have type in parentheses
    await expect(firstEntry.locator('.relationship-type')).toBeVisible()
    // Should have a [Link] button
    await expect(firstEntry.getByTestId('relationship-link')).toBeVisible()
    await expect(firstEntry.getByTestId('relationship-link')).toHaveText('[Link]')
  })

  test('Relationship entry Link navigates to the related person\'s detail page', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-list')).toBeVisible({ timeout: 10000 })

    // Find the entry for Michael Chen (seeded as Colleague)
    const michaelEntry = page.getByTestId('relationship-entry').filter({ hasText: 'Michael Chen' })
    await expect(michaelEntry).toBeVisible()

    // Click [Link] on that entry
    await michaelEntry.getByTestId('relationship-link').click()

    // Should navigate to Michael Chen's person detail page
    await expect(page).toHaveURL(/\/individuals\//)
    await expect(page.getByTestId('person-name')).toHaveText('Michael Chen')
  })

  test('Each relationship Link navigates to the correct person', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-list')).toBeVisible({ timeout: 10000 })

    // Find the entry for Tom Wilson (seeded as Decision Maker)
    const tomEntry = page.getByTestId('relationship-entry').filter({ hasText: 'Tom Wilson' })
    await expect(tomEntry).toBeVisible()

    await tomEntry.getByTestId('relationship-link').click()
    await expect(page).toHaveURL(/\/individuals\//)
    await expect(page.getByTestId('person-name')).toHaveText('Tom Wilson')
  })

  test('Switching to Graph View tab', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-section')).toBeVisible()

    // Click Graph View tab
    await page.getByTestId('graph-view-tab').click()

    // Graph View tab should be active
    await expect(page.getByTestId('graph-view-tab')).toHaveClass(/active/)
    // List View tab should NOT be active
    await expect(page.getByTestId('list-view-tab')).not.toHaveClass(/active/)

    // Graph view container should be visible
    await expect(page.getByTestId('relationships-graph')).toBeVisible()
  })

  test('Switching back to List View from Graph View', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-section')).toBeVisible()

    // First switch to Graph View
    await page.getByTestId('graph-view-tab').click()
    await expect(page.getByTestId('graph-view-tab')).toHaveClass(/active/)

    // Switch back to List View
    await page.getByTestId('list-view-tab').click()
    await expect(page.getByTestId('list-view-tab')).toHaveClass(/active/)
    await expect(page.getByTestId('graph-view-tab')).not.toHaveClass(/active/)

    // List should be visible again
    await expect(page.getByTestId('relationships-list')).toBeVisible({ timeout: 10000 })
  })

  test('Filter button is displayed in Relationships section', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-section')).toBeVisible()

    const filterBtn = page.getByTestId('relationships-filter-button')
    await expect(filterBtn).toBeVisible()

    // Should have a filter icon (SVG)
    await expect(filterBtn.locator('svg')).toBeVisible()
  })

  test('Filter button opens filter options for relationships', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-section')).toBeVisible()

    // Wait for relationships to load so client options are populated
    await expect(page.getByTestId('relationships-list')).toBeVisible({ timeout: 10000 })

    // Click the filter button
    await page.getByTestId('relationships-filter-button').click()

    // Filter menu should appear with type options
    const filterMenu = page.getByTestId('relationships-filter-menu')
    await expect(filterMenu).toBeVisible()

    // Should have relationship type filter section
    await expect(page.getByTestId('relationships-filter-type-label')).toBeVisible()
    await expect(filterMenu).toContainText('All Types')
    await expect(filterMenu).toContainText('Colleague')
    await expect(filterMenu).toContainText('Decision Maker')
    await expect(filterMenu).toContainText('Influencer')

    // Should have client filter section
    await expect(page.getByTestId('relationships-filter-client-label')).toBeVisible()
    await expect(filterMenu).toContainText('All Clients')
  })

  test('Add Entry button is displayed in Relationships section', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-section')).toBeVisible()

    const addBtn = page.getByTestId('relationships-add-button')
    await expect(addBtn).toBeVisible()
    await expect(addBtn).toContainText('+ Add Entry')
  })

  test('Add Entry button opens relationship creation form', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-section')).toBeVisible()

    // Click Add Entry
    await page.getByTestId('relationships-add-button').click()

    // Modal should appear
    const modal = page.getByTestId('add-relationship-modal')
    await expect(modal).toBeVisible()

    // Should have person search field
    await expect(page.getByTestId('relationship-person-search')).toBeVisible()
    // Should have relationship type dropdown
    await expect(page.getByTestId('relationship-type-dropdown')).toBeVisible()
  })

  test('New relationship entry can be created successfully', async ({ page }) => {
    test.setTimeout(90000)
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-section')).toBeVisible()

    // Open add form
    await page.getByTestId('relationships-add-button').click()
    await expect(page.getByTestId('add-relationship-modal')).toBeVisible()

    // Search for a person (Emily Davis)
    const searchInput = page.getByTestId('relationship-person-search')
    await searchInput.fill('Emily')

    // Wait for search results and select
    const option = page.getByTestId('relationship-person-option').filter({ hasText: 'Emily Davis' })
    await expect(option).toBeVisible({ timeout: 10000 })
    await option.click()

    // Select relationship type
    await page.getByTestId('relationship-type-dropdown').click()
    const typeOption = page.getByTestId('relationship-type-option').filter({ hasText: 'Colleague' })
    await typeOption.click()

    // Save
    await page.getByTestId('add-relationship-save').click()

    // Modal should close
    await expect(page.getByTestId('add-relationship-modal')).not.toBeVisible({ timeout: 10000 })

    // New entry should appear in the list
    await expect(
      page.getByTestId('relationship-entry').filter({ hasText: 'Emily Davis' })
    ).toBeVisible({ timeout: 10000 })
  })

  test('Add Entry form validates required fields', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-section')).toBeVisible()

    // Open add form
    await page.getByTestId('relationships-add-button').click()
    await expect(page.getByTestId('add-relationship-modal')).toBeVisible()

    // Click save without filling any fields
    await page.getByTestId('add-relationship-save').click()

    // Validation errors should appear
    await expect(page.getByTestId('relationship-person-error')).toContainText('Related person is required')

    // Modal should still be open
    await expect(page.getByTestId('add-relationship-modal')).toBeVisible()
  })

  test('Add Entry form can be cancelled', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-section')).toBeVisible()

    // Count existing relationships
    await expect(page.getByTestId('relationships-list')).toBeVisible({ timeout: 10000 })
    const beforeCount = await page.getByTestId('relationship-entry').count()

    // Open add form
    await page.getByTestId('relationships-add-button').click()
    await expect(page.getByTestId('add-relationship-modal')).toBeVisible()

    // Cancel
    await page.getByTestId('add-relationship-cancel').click()

    // Modal should close
    await expect(page.getByTestId('add-relationship-modal')).not.toBeVisible()

    // No new entry should appear
    await expect(page.getByTestId('relationship-entry')).toHaveCount(beforeCount)
  })

  test('Relationships section shows empty state when no relationships exist', async ({ page }) => {
    // Use Jane Doe who has no seeded relationships
    const individual = await findIndividual(page.request, 'Jane Doe')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('relationships-section')).toBeVisible()

    // Should show empty state
    await expect(page.getByTestId('relationships-empty')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('relationships-empty')).toContainText('No relationships yet')
  })
})

// =========================================================================
// ContactHistorySection
// =========================================================================
test.describe('ContactHistorySection', () => {
  test('Contact History section displays heading with icon', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-section')).toBeVisible()

    const heading = page.getByTestId('contact-history-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('History of Contact')

    // Icon should be present
    const headingContainer = page.locator('[data-testid="contact-history-section"] .person-section-heading')
    await expect(headingContainer.locator('svg')).toBeVisible()
  })

  test('Contact History shows chronological log entries', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-section')).toBeVisible()

    // Wait for entries to load
    await expect(page.getByTestId('contact-history-list')).toBeVisible({ timeout: 10000 })

    const entries = page.getByTestId('contact-history-entry')
    const count = await entries.count()
    expect(count).toBeGreaterThan(0)

    // Each entry should have date, interaction type, summary, and edit icon
    const firstEntry = entries.first()
    await expect(firstEntry.locator('.contact-history-date')).toBeVisible()
    await expect(firstEntry.locator('.contact-history-type')).toBeVisible()
    await expect(firstEntry.locator('.contact-history-summary')).toBeVisible()
    await expect(firstEntry.getByTestId('contact-history-edit-button')).toBeVisible()
  })

  test('Contact History displays various interaction types', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-list')).toBeVisible({ timeout: 10000 })

    // Seeded data includes "Video Call" and "Email" types
    const entries = page.getByTestId('contact-history-entry')
    const allText = await entries.allTextContents()
    const hasVideoCall = allText.some(t => t.includes('Video Call'))
    const hasEmail = allText.some(t => t.includes('Email'))
    expect(hasVideoCall || hasEmail).toBe(true)
  })

  test('Contact History entries show team member with role', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-list')).toBeVisible({ timeout: 10000 })

    // Seeded data has team member "Michael B. (Sales Lead)"
    const entries = page.getByTestId('contact-history-entry')
    const entryWithTeamMember = entries.filter({ hasText: 'Team Member:' })
    await expect(entryWithTeamMember.first()).toBeVisible()
    await expect(entryWithTeamMember.first()).toContainText('Team Member:')
  })

  test('Contact History entry edit icon opens edit form', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-list')).toBeVisible({ timeout: 10000 })

    // Click the edit button on the first entry
    const firstEditBtn = page.getByTestId('contact-history-edit-button').first()
    await firstEditBtn.click()

    // Edit form modal should appear
    const modal = page.getByTestId('contact-history-form-modal')
    await expect(modal).toBeVisible()

    // Should be pre-populated
    await expect(page.getByTestId('contact-history-date-input')).not.toHaveValue('')
    await expect(page.getByTestId('contact-history-summary-input')).not.toHaveValue('')
  })

  test('Contact History entry edit saves changes', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-list')).toBeVisible({ timeout: 10000 })

    // Click edit on the first entry
    await page.getByTestId('contact-history-edit-button').first().click()
    await expect(page.getByTestId('contact-history-form-modal')).toBeVisible()

    // Change the summary
    const newSummary = `Updated summary ${Date.now()}`
    const summaryInput = page.getByTestId('contact-history-summary-input')
    await summaryInput.clear()
    await summaryInput.fill(newSummary)

    // Save
    await page.getByTestId('contact-history-form-save').click()

    // Modal should close
    await expect(page.getByTestId('contact-history-form-modal')).not.toBeVisible({ timeout: 10000 })

    // Updated summary should appear in the list
    await expect(
      page.getByTestId('contact-history-entry').filter({ hasText: newSummary })
    ).toBeVisible({ timeout: 10000 })
  })

  test('Contact History entry edit can be cancelled', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-list')).toBeVisible({ timeout: 10000 })

    // Get original text of first entry
    const firstEntry = page.getByTestId('contact-history-entry').first()
    const originalText = await firstEntry.locator('.contact-history-summary').textContent()

    // Click edit
    await firstEntry.getByTestId('contact-history-edit-button').click()
    await expect(page.getByTestId('contact-history-form-modal')).toBeVisible()

    // Change the summary
    const summaryInput = page.getByTestId('contact-history-summary-input')
    await summaryInput.clear()
    await summaryInput.fill('This should be cancelled')

    // Cancel
    await page.getByTestId('contact-history-form-cancel').click()

    // Modal should close
    await expect(page.getByTestId('contact-history-form-modal')).not.toBeVisible()

    // Original text should remain
    await expect(firstEntry.locator('.contact-history-summary')).toHaveText(originalText!)
  })

  test('Filter button is displayed in Contact History section', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-section')).toBeVisible()

    const filterBtn = page.getByTestId('contact-history-filter-button')
    await expect(filterBtn).toBeVisible()
    await expect(filterBtn.locator('svg')).toBeVisible()
  })

  test('Filter button opens filter options for contact history', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-section')).toBeVisible()

    // Click filter button
    await page.getByTestId('contact-history-filter-button').click()

    // Filter menu should appear
    const filterMenu = page.getByTestId('contact-history-filter-menu')
    await expect(filterMenu).toBeVisible()

    // Should have interaction type filter section
    await expect(page.getByTestId('contact-history-filter-type-label')).toBeVisible()
    await expect(filterMenu).toContainText('All Types')
    await expect(filterMenu).toContainText('Video Call')
    await expect(filterMenu).toContainText('Email')
    await expect(filterMenu).toContainText('Meeting (In-person)')
    await expect(filterMenu).toContainText('Note')

    // Should have date range filter section
    await expect(page.getByTestId('contact-history-filter-date-label')).toBeVisible()
    await expect(page.getByTestId('contact-history-date-start')).toBeVisible()
    await expect(page.getByTestId('contact-history-date-end')).toBeVisible()
  })

  test('Add Entry button is displayed in Contact History section', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-section')).toBeVisible()

    const addBtn = page.getByTestId('contact-history-add-button')
    await expect(addBtn).toBeVisible()
    await expect(addBtn).toContainText('+ Add Entry')
  })

  test('Add Entry button opens contact history creation form', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-section')).toBeVisible()

    // Click Add Entry
    await page.getByTestId('contact-history-add-button').click()

    // Modal should appear with all fields
    const modal = page.getByTestId('contact-history-form-modal')
    await expect(modal).toBeVisible()

    await expect(page.getByTestId('contact-history-date-input')).toBeVisible()
    await expect(page.getByTestId('contact-history-type-dropdown')).toBeVisible()
    await expect(page.getByTestId('contact-history-summary-input')).toBeVisible()
    await expect(page.getByTestId('contact-history-team-input')).toBeVisible()
  })

  test('New contact history entry can be created successfully', async ({ page }) => {
    test.setTimeout(90000)
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-section')).toBeVisible()

    // Open add form
    await page.getByTestId('contact-history-add-button').click()
    await expect(page.getByTestId('contact-history-form-modal')).toBeVisible()

    // Fill date/time
    const dateInput = page.getByTestId('contact-history-date-input')
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
    await dateInput.fill(dateStr)

    // Select interaction type
    await page.getByTestId('contact-history-type-dropdown').click()
    await page.getByTestId('contact-history-type-option').filter({ hasText: 'Email' }).click()

    // Fill summary
    const uniqueSummary = `Test entry created ${Date.now()}`
    await page.getByTestId('contact-history-summary-input').fill(uniqueSummary)

    // Fill team member
    await page.getByTestId('contact-history-team-input').fill('Emily R. (Account Manager)')

    // Save
    await page.getByTestId('contact-history-form-save').click()

    // Modal should close
    await expect(page.getByTestId('contact-history-form-modal')).not.toBeVisible({ timeout: 10000 })

    // New entry should appear in the list
    await expect(
      page.getByTestId('contact-history-entry').filter({ hasText: uniqueSummary })
    ).toBeVisible({ timeout: 10000 })
  })

  test('Add Entry form validates required fields', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-section')).toBeVisible()

    // Open add form
    await page.getByTestId('contact-history-add-button').click()
    await expect(page.getByTestId('contact-history-form-modal')).toBeVisible()

    // Leave all fields empty and click save
    await page.getByTestId('contact-history-form-save').click()

    // Validation errors should appear for required fields (date, type, summary, team member)
    await expect(page.locator('.form-error')).toHaveCount(4, { timeout: 5000 })

    // Modal should still be open
    await expect(page.getByTestId('contact-history-form-modal')).toBeVisible()
  })

  test('Add Entry form can be cancelled', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-section')).toBeVisible()

    // Open add form
    await page.getByTestId('contact-history-add-button').click()
    await expect(page.getByTestId('contact-history-form-modal')).toBeVisible()

    // Enter some data
    await page.getByTestId('contact-history-summary-input').fill('This should be cancelled')

    // Cancel
    await page.getByTestId('contact-history-form-cancel').click()

    // Modal should close
    await expect(page.getByTestId('contact-history-form-modal')).not.toBeVisible()

    // The cancelled entry should NOT appear
    await expect(
      page.getByTestId('contact-history-entry').filter({ hasText: 'This should be cancelled' })
    ).toHaveCount(0)
  })

  test('Contact History section shows empty state when no history exists', async ({ page }) => {
    // Use Jane Doe who has no seeded contact history
    const individual = await findIndividual(page.request, 'Jane Doe')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('contact-history-section')).toBeVisible()

    // Should show empty state
    await expect(page.getByTestId('contact-history-empty')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('contact-history-empty')).toContainText('No contact history yet')
  })
})

// =========================================================================
// AssociatedClientsSection
// =========================================================================
test.describe('AssociatedClientsSection', () => {
  test('Associated Clients section displays heading with icon', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('associated-clients-section')).toBeVisible()

    const heading = page.getByTestId('associated-clients-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('Associated Clients')

    // Icon should be present
    const headingContainer = page.locator('[data-testid="associated-clients-section"] .person-section-heading')
    await expect(headingContainer.locator('svg')).toBeVisible()
  })

  test('Associated Clients shows client cards with all details', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('associated-clients-section')).toBeVisible()

    // Wait for client cards to load
    await expect(page.getByTestId('associated-clients-list')).toBeVisible({ timeout: 10000 })

    const cards = page.getByTestId('associated-client-card')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    // Each card should show: icon, name, status, industry, and View button
    const firstCard = cards.first()
    await expect(firstCard.locator('svg').first()).toBeVisible()
    await expect(firstCard.getByTestId('associated-client-name')).toBeVisible()
    await expect(firstCard).toContainText('Status:')
    await expect(firstCard).toContainText('Industry:')
    await expect(firstCard.getByTestId('view-client-detail-button')).toBeVisible()
  })

  test('Client card displays correct status for each client', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('associated-clients-list')).toBeVisible({ timeout: 10000 })

    // Sarah Jenkins is associated with Acme Corp (Active) and Globex Solutions (Active)
    const acmeCard = page.getByTestId('associated-client-card').filter({ hasText: 'Acme Corp' })
    await expect(acmeCard).toContainText('Status:')
    await expect(acmeCard).toContainText('Active Client')

    const globexCard = page.getByTestId('associated-client-card').filter({ hasText: 'Globex Solutions' })
    if (await globexCard.isVisible()) {
      await expect(globexCard).toContainText('Status:')
      await expect(globexCard).toContainText('Active Client')
    }
  })

  test('Client card displays correct industry for each client', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('associated-clients-list')).toBeVisible({ timeout: 10000 })

    // Acme Corp has industry "Software"
    const acmeCard = page.getByTestId('associated-client-card').filter({ hasText: 'Acme Corp' })
    await expect(acmeCard).toContainText('Industry:')
    await expect(acmeCard).toContainText('Software')

    // Globex Solutions has industry "Hardware"
    const globexCard = page.getByTestId('associated-client-card').filter({ hasText: 'Globex Solutions' })
    if (await globexCard.isVisible()) {
      await expect(globexCard).toContainText('Industry:')
      await expect(globexCard).toContainText('Hardware')
    }
  })

  test('View Client Detail Page button navigates to client detail page', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('associated-clients-list')).toBeVisible({ timeout: 10000 })

    // Click the View button on the first card
    const firstCard = page.getByTestId('associated-client-card').first()
    await firstCard.getByTestId('view-client-detail-button').click()

    // Should navigate to a client detail page with a valid UUID
    await expect(page).toHaveURL(/\/clients\/[0-9a-f-]+/)
  })

  test('Each View Client Detail Page button navigates correctly', async ({ page }) => {
    const individual = await findIndividual(page.request, 'Sarah Jenkins')
    await page.goto(`/individuals/${individual.id}`)
    await expect(page.getByTestId('associated-clients-list')).toBeVisible({ timeout: 10000 })

    const cards = page.getByTestId('associated-client-card')
    const count = await cards.count()

    if (count > 1) {
      // Click the View button on the second card
      const secondCard = cards.nth(1)
      await secondCard.getByTestId('view-client-detail-button').click()

      // Should navigate to a client detail page
      await expect(page).toHaveURL(/\/clients\/[0-9a-f-]+/)
    }
  })

  test('Associated Clients section shows empty state when no clients exist', async ({ page }) => {
    // Use the seeded "Unlinked Person" who has no client associations
    const individual = await findIndividual(page.request, 'Unlinked Person')
    await page.goto(`/individuals/${individual.id}`)

    await expect(page.getByTestId('associated-clients-section')).toBeVisible()
    await expect(page.getByTestId('associated-clients-empty')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('associated-clients-empty')).toContainText('No associated clients')
  })
})
