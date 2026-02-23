import { test, expect } from '@playwright/test'

test.describe('ClientsTable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByTestId('clients-table').or(page.getByTestId('clients-table-empty'))).toBeVisible()
  })

  test('Table displays all column headers', async ({ page }) => {
    await expect(page.getByTestId('clients-table')).toBeVisible()

    const headers = page.locator('.clients-table-header .table-cell')
    await expect(headers.filter({ hasText: 'Client Name' })).toBeVisible()
    await expect(headers.filter({ hasText: 'Type' })).toBeVisible()
    await expect(headers.filter({ hasText: 'Status' })).toBeVisible()
    await expect(headers.filter({ hasText: 'Tags' })).toBeVisible()
    await expect(headers.filter({ hasText: 'Primary Contact' })).toBeVisible()
    await expect(headers.filter({ hasText: 'Open Deals' })).toBeVisible()
    await expect(headers.filter({ hasText: 'Next Task' })).toBeVisible()

    // Each row should have an action menu button (...)
    const firstRow = page.locator('[data-testid^="client-row-"]').first()
    await expect(firstRow.locator('[data-testid^="client-actions-"]')).toBeVisible()
  })

  test('Client Name column displays client names as clickable links', async ({ page }) => {
    await expect(page.getByTestId('clients-table')).toBeVisible()

    // Find the first client name link
    const firstClientNameLink = page.locator('[data-testid^="client-name-"]').first()
    await expect(firstClientNameLink).toBeVisible()

    // Extract the test ID to get the client ID
    const testId = await firstClientNameLink.getAttribute('data-testid')
    const clientId = testId!.replace('client-name-', '')

    // Click on the client name
    await firstClientNameLink.click()

    // Should navigate to the client detail page
    await expect(page).toHaveURL(`/clients/${clientId}`)
  })

  test('Type column displays Organization or Individual', async ({ page }) => {
    await expect(page.getByTestId('clients-table')).toBeVisible()

    // Check type cells - all should be either Organization or Individual
    const typeCells = page.locator('[data-testid^="client-type-"]')
    const count = await typeCells.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const text = await typeCells.nth(i).textContent()
      expect(['Organization', 'Individual']).toContain(text?.trim())
    }
  })

  test('Status column shows color-coded badges', async ({ page }) => {
    await expect(page.getByTestId('clients-table')).toBeVisible()

    const statusBadges = page.locator('[data-testid^="client-status-"]')
    const count = await statusBadges.count()
    expect(count).toBeGreaterThan(0)

    // Check that each status badge has the correct CSS class
    for (let i = 0; i < count; i++) {
      const badge = statusBadges.nth(i)
      const text = (await badge.textContent())?.trim()

      if (text === 'Active') {
        await expect(badge).toHaveClass(/status-active/)
      } else if (text === 'Inactive') {
        await expect(badge).toHaveClass(/status-inactive/)
      } else if (text === 'Prospect') {
        await expect(badge).toHaveClass(/status-prospect/)
      } else if (text === 'Churned') {
        await expect(badge).toHaveClass(/status-churned/)
      }
    }
  })

  test('Tags column displays multiple tags as chips', async ({ page }) => {
    await expect(page.getByTestId('clients-table')).toBeVisible()

    // Find a client with multiple tags (e.g. Acme Corp has Enterprise, SaaS)
    const acmeRow = page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Acme Corp' })
    await expect(acmeRow).toBeVisible()

    const tagsCell = acmeRow.locator('[data-testid^="client-tags-"]')
    const tagChips = tagsCell.locator('.tag-chip')

    // Should have at least 2 tags
    const chipCount = await tagChips.count()
    expect(chipCount).toBeGreaterThanOrEqual(2)

    // Tags should be individually readable
    const tagTexts = await tagChips.allTextContents()
    expect(tagTexts.some(t => t.includes('Enterprise') || t.includes('SaaS'))).toBe(true)
  })

  test('Primary Contact column shows name and role', async ({ page }) => {
    await expect(page.getByTestId('clients-table')).toBeVisible()

    // Acme Corp should show "Sarah Jenkins (CEO)"
    const acmeRow = page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Acme Corp' })
    await expect(acmeRow).toBeVisible()
    const acmeContact = acmeRow.locator('[data-testid^="client-contact-"]')
    await expect(acmeContact).toContainText('Sarah Jenkins')
    await expect(acmeContact).toContainText('CEO')

    // Jane Doe (Individual) should show "Jane Doe (Self)"
    const janeRow = page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Jane Doe' })
    if (await janeRow.isVisible()) {
      const janeContact = janeRow.locator('[data-testid^="client-contact-"]')
      await expect(janeContact).toContainText('Jane Doe')
      await expect(janeContact).toContainText('Self')
    }
  })

  test('Open Deals column shows count and total value', async ({ page }) => {
    await expect(page.getByTestId('clients-table')).toBeVisible()

    // Acme Corp should have 3 open deals with a value
    const acmeRow = page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Acme Corp' })
    await expect(acmeRow).toBeVisible()
    const acmeDeals = acmeRow.locator('[data-testid^="client-deals-"]')
    await expect(acmeDeals).toContainText('3')
    await expect(acmeDeals).toContainText('Value:')
    await expect(acmeDeals).toContainText('$')

    // A client with 0 deals should show "0"
    const janeRow = page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Jane Doe' })
    if (await janeRow.isVisible()) {
      const janeDeals = janeRow.locator('[data-testid^="client-deals-"]')
      await expect(janeDeals).toHaveText('0')
    }
  })

  test('Next Task column shows upcoming task description and date', async ({ page }) => {
    await expect(page.getByTestId('clients-table')).toBeVisible()

    // Acme Corp should have a "Follow-up call" task with date
    const acmeRow = page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Acme Corp' })
    await expect(acmeRow).toBeVisible()
    const acmeTask = acmeRow.locator('[data-testid^="client-task-"]')
    await expect(acmeTask).toContainText('Follow-up call')

    // Clients without tasks should show "No task scheduled"
    const rows = page.locator('[data-testid^="client-row-"]')
    const count = await rows.count()
    let foundNoTask = false
    for (let i = 0; i < count; i++) {
      const taskText = await rows.nth(i).locator('[data-testid^="client-task-"]').textContent()
      if (taskText?.includes('No task scheduled')) {
        foundNoTask = true
        break
      }
    }
    expect(foundNoTask).toBe(true)
  })

  test('Row action menu opens with options', async ({ page }) => {
    await expect(page.getByTestId('clients-table')).toBeVisible()

    // Get the first client row's action button
    const firstRow = page.locator('[data-testid^="client-row-"]').first()
    const actionBtn = firstRow.locator('[data-testid^="client-actions-"]')
    const testId = await actionBtn.getAttribute('data-testid')
    const clientId = testId!.replace('client-actions-', '')

    // Click the action button
    await actionBtn.click()

    // Action menu should appear with View Details, Edit, Delete
    const menu = page.getByTestId(`action-menu-${clientId}`)
    await expect(menu).toBeVisible()
    await expect(page.getByTestId(`action-view-${clientId}`)).toBeVisible()
    await expect(page.getByTestId(`action-edit-${clientId}`)).toBeVisible()
    await expect(page.getByTestId(`action-delete-${clientId}`)).toBeVisible()
  })

  test('Row action menu "View Details" navigates to client detail', async ({ page }) => {
    await expect(page.getByTestId('clients-table')).toBeVisible()

    // Find Acme Corp and open its action menu
    const acmeRow = page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Acme Corp' })
    await expect(acmeRow).toBeVisible()
    const actionBtn = acmeRow.locator('[data-testid^="client-actions-"]')
    const testId = await actionBtn.getAttribute('data-testid')
    const clientId = testId!.replace('client-actions-', '')

    await actionBtn.click()
    await expect(page.getByTestId(`action-menu-${clientId}`)).toBeVisible()

    // Click View Details
    await page.getByTestId(`action-view-${clientId}`).click()

    // Should navigate to the client detail page
    await expect(page).toHaveURL(`/clients/${clientId}`)
  })

  test('Row action menu "Edit" opens edit dialog', async ({ page }) => {
    await expect(page.getByTestId('clients-table')).toBeVisible()

    // Find a client and open its action menu
    const firstRow = page.locator('[data-testid^="client-row-"]').first()
    const clientName = await firstRow.locator('[data-testid^="client-name-"]').textContent()
    const actionBtn = firstRow.locator('[data-testid^="client-actions-"]')
    const testId = await actionBtn.getAttribute('data-testid')
    const clientId = testId!.replace('client-actions-', '')

    await actionBtn.click()
    await page.getByTestId(`action-edit-${clientId}`).click()

    // Edit dialog should open pre-populated with client data
    await expect(page.getByTestId('client-form-modal')).toBeVisible()
    const nameInput = page.getByTestId('client-form-name')
    await expect(nameInput).toHaveValue(clientName!.trim())

    // Change the name and save
    const updatedName = `${clientName!.trim()} Updated`
    await nameInput.clear()
    await nameInput.fill(updatedName)
    await page.getByTestId('client-form-submit').click()

    // Dialog should close
    await expect(page.getByTestId('client-form-modal')).not.toBeVisible({ timeout: 10000 })

    // Updated name should appear in the table
    await expect(page.locator('[data-testid^="client-row-"]').filter({ hasText: updatedName })).toBeVisible({ timeout: 10000 })
  })

  test('Row action menu "Delete" with confirmation', async ({ page }) => {
    // First create a client to delete
    const uniqueName = `DeleteMe-${Date.now()}`
    await page.getByTestId('add-client-button').click()
    await expect(page.getByTestId('client-form-modal')).toBeVisible()
    await page.getByTestId('client-form-name').fill(uniqueName)
    await page.getByTestId('client-form-submit').click()
    await expect(page.getByTestId('client-form-modal')).not.toBeVisible({ timeout: 10000 })

    // Wait for the new client to appear
    const newRow = page.locator('[data-testid^="client-row-"]').filter({ hasText: uniqueName })
    await expect(newRow).toBeVisible({ timeout: 10000 })

    // Get the client ID and open action menu
    const actionBtn = newRow.locator('[data-testid^="client-actions-"]')
    const testId = await actionBtn.getAttribute('data-testid')
    const clientId = testId!.replace('client-actions-', '')

    await actionBtn.click()
    await page.getByTestId(`action-delete-${clientId}`).click()

    // Confirmation dialog should appear
    await expect(page.getByTestId('delete-confirm-modal')).toBeVisible()
    await expect(page.getByTestId('delete-confirm-message')).toContainText(uniqueName)

    // First test cancelling
    await page.getByTestId('delete-cancel').click()
    await expect(page.getByTestId('delete-confirm-modal')).not.toBeVisible()
    // Client should still be in the table
    await expect(newRow).toBeVisible()

    // Now actually delete
    await actionBtn.click()
    await page.getByTestId(`action-delete-${clientId}`).click()
    await expect(page.getByTestId('delete-confirm-modal')).toBeVisible()
    await page.getByTestId('delete-confirm').click()

    // Client should be removed from the table
    await expect(newRow).not.toBeVisible({ timeout: 10000 })
  })

  test('Table shows empty state when no clients exist', async ({ page }) => {
    // Filter to produce an empty result set
    await page.getByTestId('search-input').fill('zzzzabsolutelynonexistent')

    // Empty state should appear
    await expect(page.getByTestId('clients-table-empty')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('clients-table-empty')).toContainText('No clients')
  })
})
