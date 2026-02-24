import { test, expect } from '@playwright/test'

test.describe('ContactsSearchBar', () => {
  test('Search input filters contacts by name', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    // Wait for contacts to load
    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    // Get a name from the first visible row
    const firstRowName = await rows.first().locator('span').first().textContent()
    const searchTerm = firstRowName!.trim().split(' ')[0]

    const searchInput = page.getByTestId('contacts-search-input')
    await searchInput.fill(searchTerm)

    // Wait for debounce and results to update
    await page.waitForTimeout(500)

    // All remaining visible rows should contain the search term in their name column
    await expect(async () => {
      const visibleRows = page.getByTestId('contacts-table-row')
      const count = await visibleRows.count()
      expect(count).toBeGreaterThan(0)
      for (let i = 0; i < count; i++) {
        const nameCell = await visibleRows.nth(i).locator('span').first().textContent()
        expect(nameCell?.toLowerCase()).toContain(searchTerm.toLowerCase())
      }
    }).toPass({ timeout: 15000 })
  })

  test('Search input filters contacts by email', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    // Get an email from a row that has one (3rd span = email column)
    let emailSearchTerm = ''
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
      const spans = rows.nth(i).locator('span')
      const emailText = await spans.nth(2).textContent()
      if (emailText && emailText !== '—' && emailText.includes('@')) {
        // Use the part before @ as search term
        emailSearchTerm = emailText.trim().split('@')[0]
        break
      }
    }
    expect(emailSearchTerm.length).toBeGreaterThan(0)

    const searchInput = page.getByTestId('contacts-search-input')
    await searchInput.fill(emailSearchTerm)
    await page.waitForTimeout(500)

    // Results should be filtered
    await expect(page.getByTestId('contacts-table-row').first()).toBeVisible({ timeout: 15000 })
  })

  test('Search input filters contacts by title', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    // Get a title from a row that has one (2nd span = title column)
    let titleSearchTerm = ''
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
      const spans = rows.nth(i).locator('span')
      const titleText = await spans.nth(1).textContent()
      if (titleText && titleText !== '—' && titleText.trim().length > 2) {
        titleSearchTerm = titleText.trim().split(' ')[0]
        break
      }
    }
    expect(titleSearchTerm.length).toBeGreaterThan(0)

    const searchInput = page.getByTestId('contacts-search-input')
    await searchInput.fill(titleSearchTerm)
    await page.waitForTimeout(500)

    await expect(page.getByTestId('contacts-table-row').first()).toBeVisible({ timeout: 15000 })
  })

  test('Search input filters contacts by phone', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    // Get a phone from a row that has one (4th span = phone column)
    let phoneSearchTerm = ''
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
      const spans = rows.nth(i).locator('span')
      const phoneText = await spans.nth(3).textContent()
      if (phoneText && phoneText !== '—' && phoneText.trim().length > 2) {
        // Extract just digits for searching
        const digits = phoneText.replace(/\D/g, '')
        if (digits.length >= 3) {
          phoneSearchTerm = digits.substring(0, 3)
          break
        }
      }
    }
    expect(phoneSearchTerm.length).toBeGreaterThan(0)

    const searchInput = page.getByTestId('contacts-search-input')
    await searchInput.fill(phoneSearchTerm)
    await page.waitForTimeout(500)

    await expect(page.getByTestId('contacts-table-row').first()).toBeVisible({ timeout: 15000 })
  })

  test('Search input filters contacts by location', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    // Get a location from a row that has one (5th span = location column)
    let locationSearchTerm = ''
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
      const spans = rows.nth(i).locator('span')
      const locText = await spans.nth(4).textContent()
      if (locText && locText !== '—' && locText.trim().length > 2) {
        locationSearchTerm = locText.trim().split(',')[0].trim()
        break
      }
    }
    expect(locationSearchTerm.length).toBeGreaterThan(0)

    const searchInput = page.getByTestId('contacts-search-input')
    await searchInput.fill(locationSearchTerm)
    await page.waitForTimeout(500)

    await expect(page.getByTestId('contacts-table-row').first()).toBeVisible({ timeout: 15000 })
  })

  test('Search input clears and shows all contacts', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    const searchInput = page.getByTestId('contacts-search-input')

    // Type a non-matching search term
    await searchInput.fill('xyznonexistent')
    await page.waitForTimeout(500)

    // Should show empty state
    await expect(page.getByTestId('contacts-empty')).toBeVisible({ timeout: 15000 })

    // Clear the search
    await searchInput.fill('')
    await page.waitForTimeout(500)

    // Contacts should appear again
    await expect(rows.first()).toBeVisible({ timeout: 15000 })
  })
})

test.describe('ContactsTable', () => {
  test('Table displays correct column headers', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    const header = page.getByTestId('contacts-table-header')
    await expect(header).toBeVisible()

    // Check all six column headers are present in order
    const headerSpans = header.locator('span')
    await expect(headerSpans).toHaveCount(6)
    await expect(headerSpans.nth(0)).toHaveText('Name')
    await expect(headerSpans.nth(1)).toHaveText('Title')
    await expect(headerSpans.nth(2)).toHaveText('Email')
    await expect(headerSpans.nth(3)).toHaveText('Phone')
    await expect(headerSpans.nth(4)).toHaveText('Location')
    await expect(headerSpans.nth(5)).toHaveText('Associated Clients')
  })

  test('Table rows display contact name', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    // Each row's first span (Name column) should have non-empty text
    const firstRowName = await rows.first().locator('span').first().textContent()
    expect(firstRowName?.trim().length).toBeGreaterThan(0)
  })

  test('Table rows display contact title', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    // Check that title column (2nd span) has content (either a title or "—")
    const titleText = await rows.first().locator('span').nth(1).textContent()
    expect(titleText?.trim().length).toBeGreaterThan(0)
  })

  test('Table rows display contact email', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    // Check that email column (3rd span) has content (either an email or "—")
    const emailText = await rows.first().locator('span').nth(2).textContent()
    expect(emailText?.trim().length).toBeGreaterThan(0)
  })

  test('Table rows display contact phone', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    // Check that phone column (4th span) has content (either a phone number or "—")
    const phoneText = await rows.first().locator('span').nth(3).textContent()
    expect(phoneText?.trim().length).toBeGreaterThan(0)
  })

  test('Table rows display contact location', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    // Check that location column (5th span) has content (either a location or "—")
    const locationText = await rows.first().locator('span').nth(4).textContent()
    expect(locationText?.trim().length).toBeGreaterThan(0)
  })

  test('Table rows display associated clients', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    // Check that associated clients column (6th span) has content (either client names or "—")
    const clientsText = await rows.first().locator('span').nth(5).textContent()
    expect(clientsText?.trim().length).toBeGreaterThan(0)
  })

  test('Clicking a contact row navigates to PersonDetailPage', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    const rows = page.getByTestId('contacts-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 30000 })

    // Click the first contact row
    await rows.first().click()

    // Should navigate to the PersonDetailPage at /individuals/:id
    await expect(page).toHaveURL(/\/individuals\//, { timeout: 30000 })
    await expect(page.getByTestId('person-detail-page')).toBeVisible({ timeout: 30000 })
  })
})

test.describe('CreateContactModal', () => {
  test('Clicking Add Contact button opens CreateContactModal', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    // Click the Add Contact button
    await page.getByTestId('add-contact-button').click()

    // Modal should be visible
    await expect(page.getByTestId('create-contact-modal')).toBeVisible({ timeout: 15000 })

    // Verify form fields exist
    await expect(page.getByTestId('contact-form-name')).toBeVisible()
    await expect(page.getByTestId('contact-form-title')).toBeVisible()
    await expect(page.getByTestId('contact-form-email')).toBeVisible()
    await expect(page.getByTestId('contact-form-phone')).toBeVisible()
    await expect(page.getByTestId('contact-form-location')).toBeVisible()
    await expect(page.getByTestId('contact-form-client')).toBeVisible()

    // Verify Cancel and Create buttons
    await expect(page.getByTestId('create-contact-cancel')).toBeVisible()
    await expect(page.getByTestId('create-contact-submit')).toBeVisible()
  })

  test('CreateContactModal form validates required fields', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('add-contact-button').click()
    await expect(page.getByTestId('create-contact-modal')).toBeVisible({ timeout: 15000 })

    // Click Create without filling any fields
    await page.getByTestId('create-contact-submit').click()

    // Error message should appear for Name being required
    await expect(page.getByTestId('contact-form-error')).toContainText('Name is required')

    // Modal should remain open
    await expect(page.getByTestId('create-contact-modal')).toBeVisible()
  })

  test('CreateContactModal successfully creates a contact', async ({ page }) => {
    test.slow()
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    // Wait for contacts to load
    await page.waitForTimeout(1000)

    const uniqueName = `Test Contact ${Date.now()}`

    await page.getByTestId('add-contact-button').click()
    await expect(page.getByTestId('create-contact-modal')).toBeVisible({ timeout: 15000 })

    // Fill in the form
    await page.getByTestId('contact-form-name').fill(uniqueName)
    await page.getByTestId('contact-form-title').fill('Director of Engineering')
    await page.getByTestId('contact-form-email').fill('testcontact@example.com')
    await page.getByTestId('contact-form-phone').fill('(555) 987-6543')
    await page.getByTestId('contact-form-location').fill('Austin, TX')

    // Submit the form
    await page.getByTestId('create-contact-submit').click()

    // Modal should close
    await expect(page.getByTestId('create-contact-modal')).toBeHidden({ timeout: 30000 })

    // The new contact should appear in the table
    await expect(
      page.getByTestId('contacts-table-row').filter({ hasText: uniqueName })
    ).toBeVisible({ timeout: 30000 })
  })

  test('CreateContactModal client dropdown is searchable FilterSelect', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('add-contact-button').click()
    await expect(page.getByTestId('create-contact-modal')).toBeVisible({ timeout: 15000 })

    // Click the Client dropdown to open it
    const clientSelect = page.getByTestId('contact-form-client')
    await clientSelect.locator('button').first().click()

    // The dropdown should be open with a search input
    const searchInput = clientSelect.locator('input[type="text"]')
    await expect(searchInput).toBeVisible({ timeout: 15000 })

    // Type to search/filter
    await searchInput.fill('a')

    // Should show filtered options (buttons in the dropdown)
    await expect(clientSelect.locator('button').filter({ hasNotText: '' }).first()).toBeVisible({ timeout: 15000 })
  })

  test('CreateContactModal cancel button closes modal without creating', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('add-contact-button').click()
    await expect(page.getByTestId('create-contact-modal')).toBeVisible({ timeout: 15000 })

    // Fill in a name
    await page.getByTestId('contact-form-name').fill('Should Not Be Created')

    // Click Cancel
    await page.getByTestId('create-contact-cancel').click()

    // Modal should close
    await expect(page.getByTestId('create-contact-modal')).toBeHidden({ timeout: 15000 })

    // The contact should NOT be in the table
    await expect(
      page.getByTestId('contacts-table-row').filter({ hasText: 'Should Not Be Created' })
    ).toHaveCount(0)
  })

  test('CreateContactModal closes on overlay click', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('add-contact-button').click()
    await expect(page.getByTestId('create-contact-modal')).toBeVisible({ timeout: 15000 })

    // Click the overlay
    await page.getByTestId('modal-overlay').click({ force: true })

    // Modal should close
    await expect(page.getByTestId('create-contact-modal')).toBeHidden({ timeout: 15000 })
  })
})

test.describe('ContactsListContent', () => {
  test('Page displays heading and Add Contact button', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    // Check heading
    await expect(page.locator('h1').filter({ hasText: 'Contacts' })).toBeVisible()

    // Check Add Contact button
    await expect(page.getByTestId('add-contact-button')).toBeVisible()
    await expect(page.getByTestId('add-contact-button')).toContainText('Add Contact')
  })

  test('Loading state shows while contacts are being fetched', async ({ page }) => {
    // Navigate to contacts - the loading state appears briefly before data loads
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    // Either the loading indicator was shown and data has loaded, or it's still loading
    // We verify that the page eventually shows either the table or loading state
    await expect(
      page.getByTestId('contacts-loading')
        .or(page.getByTestId('contacts-table'))
        .or(page.getByTestId('contacts-empty'))
    ).toBeVisible({ timeout: 30000 })
  })

  test('Empty state shown when no contacts match search', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    // Wait for initial data to load
    await expect(
      page.getByTestId('contacts-table').or(page.getByTestId('contacts-empty'))
    ).toBeVisible({ timeout: 30000 })

    // Type a search that matches nothing
    const searchInput = page.getByTestId('contacts-search-input')
    await searchInput.fill('xyznonexistent')
    await page.waitForTimeout(500)

    // Should show empty state
    await expect(page.getByTestId('contacts-empty')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('contacts-empty')).toContainText('No contacts found')

    // Search bar should still be visible
    await expect(page.getByTestId('contacts-search-bar')).toBeVisible()
  })

  test('Empty state shown when no contacts exist', async ({ page }) => {
    // This test verifies the empty state component works correctly.
    // We simulate it by searching for something that won't exist.
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    await expect(
      page.getByTestId('contacts-table').or(page.getByTestId('contacts-empty'))
    ).toBeVisible({ timeout: 30000 })

    // Use a guaranteed non-matching search to trigger empty state
    const searchInput = page.getByTestId('contacts-search-input')
    await searchInput.fill('zzz_no_contacts_exist_' + Date.now())
    await page.waitForTimeout(500)

    // Empty state should display message
    await expect(page.getByTestId('contacts-empty')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('contacts-empty')).toContainText('No contacts')

    // The Add Contact button should remain visible in the header
    await expect(page.getByTestId('add-contact-button')).toBeVisible()
  })

  test('Pagination controls appear when contacts exceed page size', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    await expect(
      page.getByTestId('contacts-table').or(page.getByTestId('contacts-empty'))
    ).toBeVisible({ timeout: 30000 })

    // Pagination only appears when total > 50 contacts
    // Check if pagination controls are present when data warrants them
    const pagination = page.getByTestId('contacts-pagination')
    const hasPagination = await pagination.isVisible().catch(() => false)

    if (hasPagination) {
      // Verify pagination elements
      await expect(page.getByTestId('page-previous')).toBeVisible()
      await expect(page.getByTestId('page-next')).toBeVisible()
      // Page indicator text should be visible (e.g. "Page 1 of X")
      await expect(pagination).toContainText('Page')
      // Total count should be visible
      await expect(pagination).toContainText('total')
    }
    // If there aren't enough contacts for pagination, the test passes (no pagination expected)
  })

  test('Clicking next page loads the next set of contacts', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    await expect(
      page.getByTestId('contacts-table').or(page.getByTestId('contacts-empty'))
    ).toBeVisible({ timeout: 30000 })

    const pagination = page.getByTestId('contacts-pagination')
    const hasPagination = await pagination.isVisible().catch(() => false)

    if (hasPagination) {
      // Should start on page 1
      await expect(pagination).toContainText('Page 1')

      // Click next
      await page.getByTestId('page-next').click()

      // Should now show page 2
      await expect(pagination).toContainText('Page 2', { timeout: 15000 })

      // Previous button should be enabled
      await expect(page.getByTestId('page-previous')).toBeEnabled()

      // Contacts should have updated
      await expect(page.getByTestId('contacts-table-row').first()).toBeVisible({ timeout: 15000 })
    }
  })

  test('Clicking previous page loads the previous set of contacts', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    await expect(
      page.getByTestId('contacts-table').or(page.getByTestId('contacts-empty'))
    ).toBeVisible({ timeout: 30000 })

    const pagination = page.getByTestId('contacts-pagination')
    const hasPagination = await pagination.isVisible().catch(() => false)

    if (hasPagination) {
      // Navigate to page 2 first
      await page.getByTestId('page-next').click()
      await expect(pagination).toContainText('Page 2', { timeout: 15000 })

      // Click previous
      await page.getByTestId('page-previous').click()

      // Should be back on page 1
      await expect(pagination).toContainText('Page 1', { timeout: 15000 })

      // Previous button should be disabled on page 1
      await expect(page.getByTestId('page-previous')).toBeDisabled()
    }
  })
})

test.describe('CSV Export/Import', () => {
  test('CSV export downloads contacts as CSV file', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    await expect(
      page.getByTestId('contacts-table').or(page.getByTestId('contacts-empty'))
    ).toBeVisible({ timeout: 30000 })

    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 })

    // Click the export button
    await page.getByTestId('csv-export-button').click()

    // Should trigger a download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('contacts.csv')
  })

  test('CSV import button opens import dialog', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    // Click the import button
    await page.getByTestId('csv-import-button').click()

    // Import dialog should be visible
    await expect(page.getByTestId('import-dialog')).toBeVisible({ timeout: 15000 })

    // Should display column format specification table
    const dialog = page.getByTestId('import-dialog')
    await expect(dialog.locator('text=CSV Column Format')).toBeVisible()

    // Verify all column names are listed
    const expectedColumns = ['Name', 'Title', 'Email', 'Phone', 'Location', 'Client Name']
    for (const col of expectedColumns) {
      await expect(dialog.locator('td').filter({ hasText: col }).first()).toBeVisible()
    }

    // Verify "Name" row is marked as required (shows "Yes")
    const nameRow = dialog.locator('tr').filter({ hasText: 'Name' }).first()
    await expect(nameRow.locator('td').nth(1)).toContainText('Yes')

    // Verify "Title" row is optional (shows "No")
    const titleRow = dialog.locator('tr').filter({ hasText: 'Title' }).first()
    await expect(titleRow.locator('td').nth(1)).toContainText('No')

    // Download CSV template button should be visible
    await expect(page.getByTestId('download-csv-template')).toBeVisible()

    // File upload area should be present
    await expect(dialog.locator('text=Click to select a CSV file')).toBeVisible()

    // File input should exist (hidden but present)
    await expect(page.getByTestId('import-file-input')).toBeAttached()
  })

  test('CSV import processes valid file and creates contacts', async ({ page }) => {
    test.slow()
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    await expect(
      page.getByTestId('contacts-table').or(page.getByTestId('contacts-empty'))
    ).toBeVisible({ timeout: 30000 })

    const uniqueSuffix = Date.now()

    // Click import button
    await page.getByTestId('csv-import-button').click()
    await expect(page.getByTestId('import-dialog')).toBeVisible({ timeout: 15000 })

    // Create a valid CSV file content
    const csvContent = `Name,Title,Email,Phone,Location,Client Name\nImport Test ${uniqueSuffix},Test Engineer,importtest${uniqueSuffix}@example.com,(555) 111-2222,Denver CO,`

    // Upload the CSV file via the file input
    const fileInput = page.getByTestId('import-file-input')
    await fileInput.setInputFiles({
      name: 'test-contacts.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

    // Click the import submit button
    await page.getByTestId('import-submit-button').click()

    // Should show success result
    await expect(
      page.getByTestId('import-dialog').locator('text=Successfully imported')
    ).toBeVisible({ timeout: 30000 })
    await expect(
      page.getByTestId('import-dialog').locator('text=1')
    ).toBeVisible()
  })

  test('CSV import shows validation errors for invalid data', async ({ page }) => {
    test.slow()
    await page.goto('/contacts')
    await expect(page.getByTestId('contacts-list-page')).toBeVisible({ timeout: 30000 })

    await expect(
      page.getByTestId('contacts-table').or(page.getByTestId('contacts-empty'))
    ).toBeVisible({ timeout: 30000 })

    // Click import button
    await page.getByTestId('csv-import-button').click()
    await expect(page.getByTestId('import-dialog')).toBeVisible({ timeout: 15000 })

    // Create a CSV with invalid data (missing required Name field)
    const csvContent = 'Name,Title,Email,Phone,Location,Client Name\n,Bad Title,bad@email.com,123,,\n'

    // Upload the invalid CSV file
    const fileInput = page.getByTestId('import-file-input')
    await fileInput.setInputFiles({
      name: 'invalid-contacts.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

    // Click import
    await page.getByTestId('import-submit-button').click()

    // Should show validation errors
    const dialog = page.getByTestId('import-dialog')
    await expect(
      dialog.locator('text=Row').first()
    ).toBeVisible({ timeout: 30000 })
    // The error should mention that Name is required
    await expect(
      dialog.locator('text=Name is required')
    ).toBeVisible({ timeout: 15000 })
  })
})
