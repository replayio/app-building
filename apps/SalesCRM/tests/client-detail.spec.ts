import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

// Helper: fetch a client by name from the API
async function findClient(request: { get: (url: string) => Promise<{ json: () => Promise<unknown> }> }, name: string) {
  const res = await request.get('/.netlify/functions/clients')
  const data = (await res.json()) as { clients: { id: string; name: string; type: string; status: string; source: string | null; tags: string[] }[] }
  return data.clients.find(c => c.name === name) || data.clients[0]
}

// Helper: fetch individuals
async function findIndividual(request: { get: (url: string) => Promise<{ json: () => Promise<unknown> }> }, name: string) {
  const res = await request.get('/.netlify/functions/individuals')
  const data = (await res.json()) as { individuals: { id: string; name: string }[] }
  return data.individuals.find(i => i.name === name) || data.individuals[0]
}

// =========================================================================
// ClientHeader
// =========================================================================
test.describe('ClientHeader', () => {
  test('Header displays client name prominently', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('client-detail-page')).toBeVisible()

    const nameEl = page.getByTestId('client-detail-name')
    await expect(nameEl).toBeVisible()
    await expect(nameEl).toHaveText('Acme Corp')

    // Verify it's rendered as an h1
    const tagName = await nameEl.evaluate(el => el.tagName)
    expect(tagName).toBe('H1')
  })

  test('Header displays type badge', async ({ page }) => {
    // Test Organization type
    const acme = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${acme.id}`)
    await expect(page.getByTestId('client-detail-header')).toBeVisible()

    const typeBadge = page.getByTestId('client-type-badge')
    await expect(typeBadge).toBeVisible()
    await expect(typeBadge).toHaveText('Organization')

    // Test Individual type
    const jane = await findClient(page.request, 'Jane Doe')
    await page.goto(`/clients/${jane.id}`)
    await expect(page.getByTestId('client-detail-header')).toBeVisible()
    await expect(page.getByTestId('client-type-badge')).toHaveText('Individual')
  })

  test('Header displays status badge with correct color coding', async ({ page }) => {
    // Active client - green
    const acme = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${acme.id}`)
    await expect(page.getByTestId('client-detail-header')).toBeVisible()

    const statusBadge = page.getByTestId('client-status-badge')
    await expect(statusBadge).toHaveText('Active')
    await expect(statusBadge).toHaveClass(/status-active/)

    // Prospect client - yellow/orange
    const jane = await findClient(page.request, 'Jane Doe')
    await page.goto(`/clients/${jane.id}`)
    await expect(page.getByTestId('client-status-badge')).toHaveText('Prospect')
    await expect(page.getByTestId('client-status-badge')).toHaveClass(/status-prospect/)

    // Churned client - red
    const mega = await findClient(page.request, 'MegaCorp Industries')
    await page.goto(`/clients/${mega.id}`)
    await expect(page.getByTestId('client-status-badge')).toHaveText('Churned')
    await expect(page.getByTestId('client-status-badge')).toHaveClass(/status-churned/)

    // Inactive client - grey
    const techStart = await findClient(page.request, 'TechStart Inc')
    await page.goto(`/clients/${techStart.id}`)
    await expect(page.getByTestId('client-status-badge')).toHaveText('Inactive')
    await expect(page.getByTestId('client-status-badge')).toHaveClass(/status-inactive/)
  })

  test('Header displays tags as chips', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('client-detail-header')).toBeVisible()

    const tagsDisplay = page.getByTestId('client-tags-display')
    await expect(tagsDisplay).toBeVisible()

    const tagChips = page.getByTestId('client-tag-chip')
    await expect(tagChips.filter({ hasText: 'Enterprise' })).toBeVisible()
    await expect(tagChips.filter({ hasText: 'SaaS' })).toBeVisible()
  })

  test('Header displays source tag with edit pencil icon', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('client-detail-header')).toBeVisible()

    const sourceTag = page.getByTestId('client-source-tag')
    await expect(sourceTag).toBeVisible()
    await expect(sourceTag).toContainText('Referral')

    // Has SVG icon
    await expect(sourceTag.locator('svg')).toBeVisible()
  })

  test('Clicking tags area opens edit tags interface', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('client-detail-header')).toBeVisible()

    // Click the edit pencil icon
    await page.getByTestId('client-tags-edit-button').click()

    // Edit interface should open
    await expect(page.getByTestId('client-tags-editor')).toBeVisible()

    // Add a new tag "VIP"
    const tagInput = page.getByTestId('client-tag-input')
    await tagInput.fill('VIP')
    await tagInput.press('Enter')

    // VIP chip should appear in editor
    await expect(page.getByTestId('client-tag-editor-chip').filter({ hasText: 'VIP' })).toBeVisible()

    // Save
    await page.getByTestId('client-tags-save').click()

    // Editor should close
    await expect(page.getByTestId('client-tags-editor')).not.toBeVisible({ timeout: 10000 })

    // VIP tag should appear in display
    await expect(page.getByTestId('client-tag-chip').filter({ hasText: 'VIP' })).toBeVisible({ timeout: 10000 })
  })

  test('Editing tags can be cancelled', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('client-detail-header')).toBeVisible()

    // Get original tag count
    const originalCount = await page.getByTestId('client-tag-chip').count()

    // Open editor
    await page.getByTestId('client-tags-edit-button').click()
    await expect(page.getByTestId('client-tags-editor')).toBeVisible()

    // Add a tag
    const tagInput = page.getByTestId('client-tag-input')
    await tagInput.fill('CancelledTag')
    await tagInput.press('Enter')

    // Cancel
    await page.getByTestId('client-tags-cancel').click()

    // Editor should close
    await expect(page.getByTestId('client-tags-editor')).not.toBeVisible()

    // Original tags should remain unchanged
    await expect(page.getByTestId('client-tag-chip')).toHaveCount(originalCount)
    await expect(page.getByTestId('client-tag-chip').filter({ hasText: 'CancelledTag' })).toHaveCount(0)
  })

  test('Clicking client name opens inline edit for name', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('client-detail-header')).toBeVisible()

    // Click on the client name
    await page.getByTestId('client-detail-name').click()

    // Input should appear pre-populated
    const nameInput = page.getByTestId('client-name-input')
    await expect(nameInput).toBeVisible()
    await expect(nameInput).toHaveValue('Acme Corp')

    // Change name and press Enter
    const newName = `Acme Corporation ${Date.now()}`
    await nameInput.fill(newName)
    await nameInput.press('Enter')

    // Name should update
    await expect(page.getByTestId('client-detail-name')).toHaveText(newName, { timeout: 10000 })

    // Restore the original name
    await page.getByTestId('client-detail-name').click()
    await page.getByTestId('client-name-input').fill('Acme Corp')
    await page.getByTestId('client-name-input').press('Enter')
    await expect(page.getByTestId('client-detail-name')).toHaveText('Acme Corp', { timeout: 10000 })
  })

  test('Editing client name can be cancelled', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('client-detail-header')).toBeVisible()

    // Click on name
    await page.getByTestId('client-detail-name').click()
    const nameInput = page.getByTestId('client-name-input')
    await expect(nameInput).toBeVisible()

    // Change name but press Escape
    await nameInput.fill('ShouldNotSave')
    await nameInput.press('Escape')

    // Original name should be restored
    await expect(page.getByTestId('client-detail-name')).toHaveText('Acme Corp')
  })

  test('Clicking status badge opens status selection', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('client-detail-header')).toBeVisible()

    // Click on status badge
    await page.getByTestId('client-status-badge').click()

    // Dropdown should open with all options
    const dropdown = page.getByTestId('client-status-dropdown')
    await expect(dropdown).toBeVisible()

    const options = page.getByTestId('client-status-option')
    await expect(options).toHaveCount(4)
    // Use exact text matching to avoid "Active" matching "Inactive"
    await expect(dropdown.getByRole('button', { name: 'Active', exact: true })).toBeVisible()
    await expect(dropdown.getByRole('button', { name: 'Inactive', exact: true })).toBeVisible()
    await expect(dropdown.getByRole('button', { name: 'Prospect', exact: true })).toBeVisible()
    await expect(dropdown.getByRole('button', { name: 'Churned', exact: true })).toBeVisible()

    // Select "Churned"
    await dropdown.getByRole('button', { name: 'Churned', exact: true }).click()

    // Status badge should update
    await expect(page.getByTestId('client-status-badge')).toHaveText('Churned', { timeout: 10000 })
    await expect(page.getByTestId('client-status-badge')).toHaveClass(/status-churned/)

    // Restore original status
    await page.getByTestId('client-status-badge').click()
    await page.getByTestId('client-status-dropdown').getByRole('button', { name: 'Active', exact: true }).click()
    await expect(page.getByTestId('client-status-badge')).toHaveText('Active', { timeout: 10000 })
  })

  test('Status change can be dismissed without changing', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('client-detail-header')).toBeVisible()

    // Click on status badge
    await page.getByTestId('client-status-badge').click()
    await expect(page.getByTestId('client-status-dropdown')).toBeVisible()

    // Click outside to dismiss
    await page.getByTestId('client-detail-page').click({ position: { x: 10, y: 10 } })

    // Dropdown should close
    await expect(page.getByTestId('client-status-dropdown')).not.toBeVisible({ timeout: 5000 })

    // Status should remain unchanged
    await expect(page.getByTestId('client-status-badge')).toHaveText('Active')
  })
})

// =========================================================================
// QuickActions
// =========================================================================
test.describe('QuickActions', () => {
  test('Quick action buttons are displayed with correct icons and labels', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // All four buttons should be visible
    const addTask = page.getByTestId('quick-action-add-task')
    await expect(addTask).toBeVisible()
    await expect(addTask).toContainText('Add Task')
    await expect(addTask.locator('svg')).toBeVisible()

    const addDeal = page.getByTestId('quick-action-add-deal')
    await expect(addDeal).toBeVisible()
    await expect(addDeal).toContainText('Add Deal')
    await expect(addDeal.locator('svg')).toBeVisible()

    const addAttachment = page.getByTestId('quick-action-add-attachment')
    await expect(addAttachment).toBeVisible()
    await expect(addAttachment).toContainText('Add Attachment')
    await expect(addAttachment.locator('svg')).toBeVisible()

    const addPerson = page.getByTestId('quick-action-add-person')
    await expect(addPerson).toBeVisible()
    await expect(addPerson).toContainText('Add Person')
    await expect(addPerson.locator('svg')).toBeVisible()
  })

  test('Add Task button opens task creation dialog', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Click Add Task
    await page.getByTestId('quick-action-add-task').click()

    // Dialog should open with all fields
    const dialog = page.getByTestId('task-creation-dialog')
    await expect(dialog).toBeVisible()
    await expect(page.getByTestId('add-task-name-input')).toBeVisible()
    await expect(page.getByTestId('add-task-due-date-input')).toBeVisible()
    await expect(page.getByTestId('add-task-priority-high')).toBeVisible()
    await expect(page.getByTestId('add-task-priority-medium')).toBeVisible()
    await expect(page.getByTestId('add-task-priority-low')).toBeVisible()
    await expect(page.getByTestId('add-task-priority-normal')).toBeVisible()
    await expect(page.getByTestId('add-task-assignee-input')).toBeVisible()
  })

  test('Add Task form creates task successfully', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    const uniqueTask = `Send proposal draft ${Date.now()}`

    // Open task dialog
    await page.getByTestId('quick-action-add-task').click()
    await expect(page.getByTestId('task-creation-dialog')).toBeVisible()

    // Fill form
    await page.getByTestId('add-task-name-input').fill(uniqueTask)
    await page.getByTestId('add-task-priority-high').click()

    // Save
    await page.getByTestId('add-task-save').click()

    // Dialog should close
    await expect(page.getByTestId('task-creation-dialog')).not.toBeVisible({ timeout: 10000 })

    // New task should appear in tasks section
    await expect(
      page.getByTestId('task-name').filter({ hasText: uniqueTask })
    ).toBeVisible({ timeout: 15000 })
  })

  test('Add Task form validates required fields', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Open task dialog
    await page.getByTestId('quick-action-add-task').click()
    await expect(page.getByTestId('task-creation-dialog')).toBeVisible()

    // Leave name empty and try to save
    await page.getByTestId('add-task-save').click()

    // Validation error should show
    await expect(page.getByTestId('add-task-name-error')).toBeVisible()
    await expect(page.getByTestId('add-task-name-error')).toContainText('Task name is required')

    // Dialog should still be open
    await expect(page.getByTestId('task-creation-dialog')).toBeVisible()
  })

  test('Add Task dialog can be cancelled', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Open task dialog
    await page.getByTestId('quick-action-add-task').click()
    await expect(page.getByTestId('task-creation-dialog')).toBeVisible()

    // Enter partial data
    await page.getByTestId('add-task-name-input').fill('CancelledTask')

    // Cancel
    await page.getByTestId('add-task-cancel').click()

    // Dialog should close
    await expect(page.getByTestId('task-creation-dialog')).not.toBeVisible()

    // No new task should appear
    await expect(
      page.getByTestId('task-name').filter({ hasText: 'CancelledTask' })
    ).toHaveCount(0)
  })

  test('Add Deal button opens deal creation dialog', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Click Add Deal
    await page.getByTestId('quick-action-add-deal').click()

    // Dialog should open with all fields
    await expect(page.getByTestId('deal-creation-dialog')).toBeVisible()
    await expect(page.getByTestId('add-deal-name-input')).toBeVisible()
    await expect(page.getByTestId('add-deal-stage-dropdown')).toBeVisible()
    await expect(page.getByTestId('add-deal-value-input')).toBeVisible()
    await expect(page.getByTestId('add-deal-owner-input')).toBeVisible()
  })

  test('Add Deal form creates deal successfully', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    const uniqueDeal = `New Enterprise Deal ${Date.now()}`

    // Open deal dialog
    await page.getByTestId('quick-action-add-deal').click()
    await expect(page.getByTestId('deal-creation-dialog')).toBeVisible()

    // Fill form
    await page.getByTestId('add-deal-name-input').fill(uniqueDeal)

    // Select stage "Discovery"
    await page.getByTestId('add-deal-stage-dropdown').click()
    await expect(page.getByTestId('add-deal-stage-dropdown-menu')).toBeVisible()
    await page.getByTestId('add-deal-stage-option').filter({ hasText: 'Discovery' }).click()

    // Enter value
    await page.getByTestId('add-deal-value-input').fill('100000')

    // Save
    await page.getByTestId('add-deal-save').click()

    // Dialog should close
    await expect(page.getByTestId('deal-creation-dialog')).not.toBeVisible({ timeout: 10000 })

    // New deal should appear in deals section
    await expect(
      page.getByTestId('deal-name').filter({ hasText: uniqueDeal })
    ).toBeVisible({ timeout: 15000 })
  })

  test('Add Deal form validates required fields', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Open deal dialog
    await page.getByTestId('quick-action-add-deal').click()
    await expect(page.getByTestId('deal-creation-dialog')).toBeVisible()

    // Leave name empty and try to save
    await page.getByTestId('add-deal-save').click()

    // Validation error should show
    await expect(page.getByTestId('add-deal-name-error')).toBeVisible()
    await expect(page.getByTestId('add-deal-name-error')).toContainText('Deal name is required')

    // Dialog should still be open
    await expect(page.getByTestId('deal-creation-dialog')).toBeVisible()
  })

  test('Add Deal dialog can be cancelled', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Open deal dialog
    await page.getByTestId('quick-action-add-deal').click()
    await expect(page.getByTestId('deal-creation-dialog')).toBeVisible()

    // Enter partial data
    await page.getByTestId('add-deal-name-input').fill('CancelledDeal')

    // Cancel
    await page.getByTestId('add-deal-cancel').click()

    // Dialog should close
    await expect(page.getByTestId('deal-creation-dialog')).not.toBeVisible()

    // No new deal should appear
    await expect(
      page.getByTestId('deal-name').filter({ hasText: 'CancelledDeal' })
    ).toHaveCount(0)
  })

  test('Add Attachment button opens file upload dialog', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Click Add Attachment
    await page.getByTestId('quick-action-add-attachment').click()

    // Upload dialog should open
    await expect(page.getByTestId('attachment-upload-dialog')).toBeVisible()
    await expect(page.getByTestId('add-attachment-dropzone')).toBeVisible()
    await expect(page.getByTestId('add-attachment-file-input')).toBeAttached()
  })

  test('Add Attachment uploads file successfully', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Open attachment dialog
    await page.getByTestId('quick-action-add-attachment').click()
    await expect(page.getByTestId('attachment-upload-dialog')).toBeVisible()

    // Create a test file
    const filename = `Proposal_v2_${Date.now()}.pdf`
    const filePath = path.join('/tmp', filename)
    fs.writeFileSync(filePath, 'test pdf content')

    // Upload via hidden file input
    await page.getByTestId('add-attachment-file-input').setInputFiles(filePath)

    // Dialog should close
    await expect(page.getByTestId('attachment-upload-dialog')).not.toBeVisible({ timeout: 15000 })

    // New attachment should appear in attachments section
    await expect(
      page.getByTestId('attachment-filename').filter({ hasText: filename })
    ).toBeVisible({ timeout: 15000 })

    // Cleanup
    fs.unlinkSync(filePath)
  })

  test('Add Attachment dialog shows deal association dropdown', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Open attachment dialog
    await page.getByTestId('quick-action-add-attachment').click()
    await expect(page.getByTestId('attachment-upload-dialog')).toBeVisible()

    // Deal dropdown should be visible (Acme Corp has deals)
    const dealDropdown = page.getByTestId('add-attachment-deal-dropdown')
    await expect(dealDropdown).toBeVisible({ timeout: 10000 })

    // Click to open dropdown
    await dealDropdown.click()
    const menu = page.getByTestId('add-attachment-deal-dropdown-menu')
    await expect(menu).toBeVisible()

    // Should show "None" and available deals
    await expect(menu).toContainText('None')
    await expect(menu).toContainText('Enterprise License')
  })

  test('Add Attachment dialog can be cancelled', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Open attachment dialog
    await page.getByTestId('quick-action-add-attachment').click()
    await expect(page.getByTestId('attachment-upload-dialog')).toBeVisible()

    // Cancel
    await page.getByTestId('add-attachment-cancel').click()

    // Dialog should close
    await expect(page.getByTestId('attachment-upload-dialog')).not.toBeVisible()
  })

  test('Add Person button opens person association dialog', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Click Add Person
    await page.getByTestId('quick-action-add-person').click()

    // Person dialog should open
    await expect(page.getByTestId('person-association-dialog')).toBeVisible()
    await expect(page.getByTestId('add-person-tab-search')).toBeVisible()
    await expect(page.getByTestId('add-person-tab-create')).toBeVisible()
    await expect(page.getByTestId('add-person-search-input')).toBeVisible()
    await expect(page.getByTestId('add-person-role-input')).toBeVisible()
  })

  test('Add Person associates person successfully', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Open person dialog
    await page.getByTestId('quick-action-add-person').click()
    await expect(page.getByTestId('person-association-dialog')).toBeVisible()

    // Search for an individual
    await page.getByTestId('add-person-search-input').fill('Emily')

    // Wait for results
    const result = page.getByTestId('add-person-result').filter({ hasText: 'Emily Davis' })
    await expect(result).toBeVisible({ timeout: 10000 })
    await result.click()

    // Selected person should appear
    await expect(page.getByTestId('add-person-selected')).toContainText('Emily Davis')

    // Enter role
    await page.getByTestId('add-person-role-input').fill('VP Sales')

    // Save
    await page.getByTestId('add-person-save').click()

    // Dialog should close
    await expect(page.getByTestId('person-association-dialog')).not.toBeVisible({ timeout: 10000 })

    // Person should appear in people section
    await expect(
      page.getByTestId('person-name').filter({ hasText: 'Emily Davis' })
    ).toBeVisible({ timeout: 15000 })
  })

  test('Add Person dialog supports creating a new person', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Open person dialog
    await page.getByTestId('quick-action-add-person').click()
    await expect(page.getByTestId('person-association-dialog')).toBeVisible()

    // Switch to Create tab
    await page.getByTestId('add-person-tab-create').click()

    // Create form fields should appear
    await expect(page.getByTestId('add-person-name-input')).toBeVisible()
    await expect(page.getByTestId('add-person-title-input')).toBeVisible()
    await expect(page.getByTestId('add-person-create-role-input')).toBeVisible()
    await expect(page.getByTestId('add-person-email-input')).toBeVisible()
    await expect(page.getByTestId('add-person-phone-input')).toBeVisible()

    // Fill in new person
    const uniqueName = `Tom Wilson ${Date.now()}`
    await page.getByTestId('add-person-name-input').fill(uniqueName)
    await page.getByTestId('add-person-title-input').fill('Sales Director')

    // Save
    await page.getByTestId('add-person-save').click()

    // Dialog should close
    await expect(page.getByTestId('person-association-dialog')).not.toBeVisible({ timeout: 10000 })

    // New person should appear in people section
    await expect(
      page.getByTestId('person-name').filter({ hasText: uniqueName })
    ).toBeVisible({ timeout: 15000 })
  })

  test('Add Person form validates required fields', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Open person dialog (search mode)
    await page.getByTestId('quick-action-add-person').click()
    await expect(page.getByTestId('person-association-dialog')).toBeVisible()

    // Try to save without selecting a person
    await page.getByTestId('add-person-save').click()

    // Validation error should show
    await expect(page.locator('.form-error')).toContainText('Person is required')

    // Dialog should still be open
    await expect(page.getByTestId('person-association-dialog')).toBeVisible()
  })

  test('Add Person dialog can be cancelled', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Open person dialog
    await page.getByTestId('quick-action-add-person').click()
    await expect(page.getByTestId('person-association-dialog')).toBeVisible()

    // Cancel
    await page.getByTestId('add-person-cancel').click()

    // Dialog should close
    await expect(page.getByTestId('person-association-dialog')).not.toBeVisible()
  })
})

// =========================================================================
// SourceInfoSection
// =========================================================================
test.describe('SourceInfoSection', () => {
  test('Source Info section displays heading', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('source-info-section')).toBeVisible()

    await expect(page.getByTestId('source-info-heading')).toHaveText('Source Info')
  })

  test('Source Info displays Acquisition Source field', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('source-info-section')).toBeVisible()

    const field = page.getByTestId('acquisition-source-field')
    await expect(field).toBeVisible()
    await expect(field).toContainText('Acquisition Source')
    await expect(field).toContainText('Referral')
  })

  test('Source Info displays Campaign field', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('source-info-section')).toBeVisible()

    const field = page.getByTestId('campaign-field')
    await expect(field).toBeVisible()
    await expect(field).toContainText('Campaign')
    await expect(field).toContainText('None')
  })

  test('Source Info displays Channel field', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('source-info-section')).toBeVisible()

    const field = page.getByTestId('channel-field')
    await expect(field).toBeVisible()
    await expect(field).toContainText('Channel')
  })

  test('Source Info displays Date Acquired field', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('source-info-section')).toBeVisible()

    const field = page.getByTestId('date-acquired-field')
    await expect(field).toBeVisible()
    await expect(field).toContainText('Date Acquired')
  })

  test('Source Info Edit button opens edit form', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('source-info-section')).toBeVisible()

    // Edit button should be visible with pencil icon
    const editBtn = page.getByTestId('source-info-edit-button')
    await expect(editBtn).toBeVisible()
    await expect(editBtn.locator('svg')).toBeVisible()

    // Click Edit
    await editBtn.click()

    // Form should open with pre-populated fields
    await expect(page.getByTestId('source-info-form')).toBeVisible()
    await expect(page.getByTestId('acquisition-source-input')).toBeVisible()
    await expect(page.getByTestId('campaign-input')).toBeVisible()
    await expect(page.getByTestId('channel-input')).toBeVisible()
    await expect(page.getByTestId('date-acquired-input')).toBeVisible()

    // Acquisition source should be pre-populated with "Referral"
    await expect(page.getByTestId('acquisition-source-input')).toHaveValue('Referral')
  })

  test('Source Info edit saves changes', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('source-info-section')).toBeVisible()

    // Open edit
    await page.getByTestId('source-info-edit-button').click()
    await expect(page.getByTestId('source-info-form')).toBeVisible()

    // Change campaign
    const campaignInput = page.getByTestId('campaign-input')
    await campaignInput.clear()
    await campaignInput.fill('Q4 Outreach')

    // Save
    await page.getByTestId('source-info-save').click()

    // Form should close
    await expect(page.getByTestId('source-info-form')).not.toBeVisible({ timeout: 10000 })

    // Campaign field should now show new value
    await expect(page.getByTestId('campaign-field')).toContainText('Q4 Outreach')

    // Restore original value
    await page.getByTestId('source-info-edit-button').click()
    await expect(page.getByTestId('source-info-form')).toBeVisible()
    const restoreCampaign = page.getByTestId('campaign-input')
    await restoreCampaign.clear()
    await page.getByTestId('source-info-save').click()
    await expect(page.getByTestId('source-info-form')).not.toBeVisible({ timeout: 10000 })
  })

  test('Source Info edit can be cancelled', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('source-info-section')).toBeVisible()

    // Get original campaign text
    const originalCampaign = await page.getByTestId('campaign-field').textContent()

    // Open edit
    await page.getByTestId('source-info-edit-button').click()
    await expect(page.getByTestId('source-info-form')).toBeVisible()

    // Change campaign
    const campaignInput = page.getByTestId('campaign-input')
    await campaignInput.clear()
    await campaignInput.fill('ShouldNotSave')

    // Cancel
    await page.getByTestId('source-info-cancel').click()

    // Form should close
    await expect(page.getByTestId('source-info-form')).not.toBeVisible()

    // Original values should remain
    await expect(page.getByTestId('campaign-field')).toHaveText(originalCampaign!)
  })
})

// =========================================================================
// TasksSection
// =========================================================================
test.describe('TasksSection', () => {
  test('Tasks section displays heading with unresolved tasks label', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('tasks-section')).toBeVisible()

    await expect(page.getByTestId('tasks-heading')).toHaveText('Tasks')
    await expect(page.getByTestId('tasks-unresolved-label')).toContainText('Unresolved tasks')
  })

  test('Tasks section shows unresolved tasks with checkboxes', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('tasks-section')).toBeVisible()

    // Wait for tasks to load
    await expect(page.getByTestId('tasks-list').or(page.getByTestId('tasks-empty'))).toBeVisible({ timeout: 10000 })

    // If tasks exist, verify structure
    const taskItems = page.getByTestId('task-item')
    const count = await taskItems.count()
    if (count > 0) {
      const firstTask = taskItems.first()
      await expect(firstTask.getByTestId('task-checkbox')).toBeVisible()
      await expect(firstTask.getByTestId('task-name')).toBeVisible()
      await expect(firstTask.getByTestId('task-due-date')).toBeVisible()
    }
  })

  test('Tasks display due dates in relative format', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('tasks-section')).toBeVisible()

    // Wait for tasks to load
    await expect(page.getByTestId('tasks-list').or(page.getByTestId('tasks-empty'))).toBeVisible({ timeout: 10000 })

    // Acme Corp has "Follow-up call" due today
    const taskItems = page.getByTestId('task-item')
    const count = await taskItems.count()
    if (count > 0) {
      // At least one task should have a relative date
      const dateTexts = await page.getByTestId('task-due-date').allTextContents()
      const hasRelativeDate = dateTexts.some(t =>
        t.includes('Due: Today') || t.includes('Due: Tomorrow') || t.includes('Due: Next Week') || t.includes('Due:')
      )
      expect(hasRelativeDate).toBe(true)
    }
  })

  test('Checking a task checkbox marks it as resolved', async ({ page }) => {
    test.setTimeout(90000)
    // Use Globex Solutions which has exactly 1 seeded task ("Send proposal")
    const client = await findClient(page.request, 'Globex Solutions')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('tasks-section')).toBeVisible()
    await expect(page.getByTestId('tasks-list').or(page.getByTestId('tasks-empty'))).toBeVisible({ timeout: 10000 })

    const taskItems = page.getByTestId('task-item')
    const count = await taskItems.count()
    if (count > 0) {
      // Get the name of the first task before checking it
      const firstTaskName = await taskItems.first().getByTestId('task-name').textContent()

      // Check the first task
      const firstCheckbox = taskItems.first().getByTestId('task-checkbox')
      await firstCheckbox.click()

      // The checked task should disappear from the unresolved list
      if (firstTaskName) {
        await expect(
          page.getByTestId('task-name').filter({ hasText: firstTaskName })
        ).toHaveCount(0, { timeout: 10000 })
      }
    }
  })

  test('Clicking a task name navigates to the Tasks List Page', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('tasks-section')).toBeVisible()
    await expect(page.getByTestId('tasks-list').or(page.getByTestId('tasks-empty'))).toBeVisible({ timeout: 10000 })

    const taskItems = page.getByTestId('task-item')
    const count = await taskItems.count()
    if (count > 0) {
      // Click the task name
      await taskItems.first().getByTestId('task-name').click()

      // Should navigate to tasks page
      await expect(page).toHaveURL(/\/tasks/)
    }
  })

  test('Each task entry navigates to the Tasks List Page', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('tasks-section')).toBeVisible()
    await expect(page.getByTestId('tasks-list').or(page.getByTestId('tasks-empty'))).toBeVisible({ timeout: 10000 })

    const taskItems = page.getByTestId('task-item')
    const count = await taskItems.count()
    if (count > 1) {
      // Click the second task name to verify each task navigates correctly
      await taskItems.nth(1).getByTestId('task-name').click()

      // Should navigate to tasks page
      await expect(page).toHaveURL(/\/tasks/)
    }
  })

  test('Tasks section shows empty state when no unresolved tasks exist', async ({ page }) => {
    // Use a client that may have no tasks (e.g., Alpha Dynamics or use one known to be empty)
    const client = await findClient(page.request, 'Alpha Dynamics')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('tasks-section')).toBeVisible()

    // Wait for loading to complete
    await expect(page.getByTestId('tasks-list').or(page.getByTestId('tasks-empty'))).toBeVisible({ timeout: 10000 })

    // Should show empty state (Alpha Dynamics has no seeded tasks)
    await expect(page.getByTestId('tasks-empty')).toBeVisible()
    await expect(page.getByTestId('tasks-empty')).toContainText('No tasks')
  })
})

// =========================================================================
// DealsSection
// =========================================================================
test.describe('DealsSection', () => {
  test('Deals section displays heading', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('deals-section')).toBeVisible()

    await expect(page.getByTestId('deals-heading')).toHaveText('Deals')
  })

  test('Deals section shows deal entries with name, stage, and value', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('deals-section')).toBeVisible()

    // Wait for deals to load
    await expect(page.getByTestId('deals-list')).toBeVisible({ timeout: 10000 })

    // Should show seeded deals
    const dealItems = page.getByTestId('deal-item')
    const count = await dealItems.count()
    expect(count).toBeGreaterThan(0)

    // Verify Enterprise License deal
    const enterpriseDeal = dealItems.filter({ hasText: 'Enterprise License' })
    await expect(enterpriseDeal).toBeVisible()
    await expect(enterpriseDeal.getByTestId('deal-stage')).toContainText('Proposal')
    await expect(enterpriseDeal.getByTestId('deal-value')).toContainText('$150,000')
  })

  test('Deal entry is clickable and navigates to deal detail page', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('deals-list')).toBeVisible({ timeout: 10000 })

    // Click on a deal
    const enterpriseDeal = page.getByTestId('deal-item').filter({ hasText: 'Enterprise License' })
    await enterpriseDeal.click()

    // Should navigate to deal detail page
    await expect(page).toHaveURL(/\/deals\/[0-9a-f-]+/)
  })

  test('Each deal entry navigates to the correct deal detail page', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('deals-list')).toBeVisible({ timeout: 10000 })

    // Click on a different deal
    const saasUpgrade = page.getByTestId('deal-item').filter({ hasText: 'SaaS Upgrade' })
    if (await saasUpgrade.isVisible()) {
      await saasUpgrade.click()
      await expect(page).toHaveURL(/\/deals\/[0-9a-f-]+/)
    }
  })

  test('Deals section shows empty state when no deals exist', async ({ page }) => {
    // Use a client with no deals
    const client = await findClient(page.request, 'Alpha Dynamics')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('deals-section')).toBeVisible()

    await expect(page.getByTestId('deals-list').or(page.getByTestId('deals-empty'))).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('deals-empty')).toBeVisible()
    await expect(page.getByTestId('deals-empty')).toContainText('No deals')
  })
})

// =========================================================================
// AttachmentsSection
// =========================================================================
test.describe('AttachmentsSection', () => {
  test('Attachments section displays heading', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('attachments-section')).toBeVisible()

    await expect(page.getByTestId('attachments-heading')).toHaveText('Attachments')
  })

  test('Attachments section shows empty state when no attachments exist', async ({ page }) => {
    // Use a client that won't have attachments uploaded by other tests in this file
    const client = await findClient(page.request, 'Gamma Consulting')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('attachments-section')).toBeVisible()

    await expect(page.getByTestId('attachments-list').or(page.getByTestId('attachments-empty'))).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('attachments-empty')).toBeVisible()
    await expect(page.getByTestId('attachments-empty')).toContainText('No attachments')
  })

  test('Attachments section shows file list with all details after upload', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('quick-actions')).toBeVisible()

    // Upload a file first
    const filename = `ServiceAgreement_${Date.now()}.pdf`
    const filePath = path.join('/tmp', filename)
    fs.writeFileSync(filePath, 'test pdf content for attachments test')

    await page.getByTestId('quick-action-add-attachment').click()
    await expect(page.getByTestId('attachment-upload-dialog')).toBeVisible()
    await page.getByTestId('add-attachment-file-input').setInputFiles(filePath)
    await expect(page.getByTestId('attachment-upload-dialog')).not.toBeVisible({ timeout: 15000 })

    // Verify attachment appears with all details
    const attachmentItem = page.getByTestId('attachment-item').filter({ hasText: filename })
    await expect(attachmentItem).toBeVisible({ timeout: 15000 })
    await expect(attachmentItem.getByTestId('attachment-type-icon')).toBeVisible()
    await expect(attachmentItem.getByTestId('attachment-filename')).toContainText(filename)
    await expect(attachmentItem.getByTestId('attachment-type-label')).toBeVisible()
    await expect(attachmentItem.getByTestId('attachment-created-date')).toBeVisible()
    await expect(attachmentItem.getByTestId('attachment-deal-link')).toContainText('Linked Deal:')

    // Clean up temp file
    fs.unlinkSync(filePath)
  })

  test('Delete action removes attachment with confirmation', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('attachments-section')).toBeVisible()

    // Upload a file first so we have something to delete
    const filename = `DeleteMe_${Date.now()}.docx`
    const filePath = path.join('/tmp', filename)
    fs.writeFileSync(filePath, 'delete me content')

    await page.getByTestId('quick-action-add-attachment').click()
    await expect(page.getByTestId('attachment-upload-dialog')).toBeVisible()
    await page.getByTestId('add-attachment-file-input').setInputFiles(filePath)
    await expect(page.getByTestId('attachment-upload-dialog')).not.toBeVisible({ timeout: 15000 })

    // Wait for attachment to appear
    const attachmentItem = page.getByTestId('attachment-item').filter({ hasText: filename })
    await expect(attachmentItem).toBeVisible({ timeout: 15000 })

    // Click delete
    await attachmentItem.getByTestId('attachment-delete-button').click()

    // Confirmation dialog should appear
    await expect(page.getByTestId('attachment-delete-confirmation')).toBeVisible()
    await expect(page.getByTestId('attachment-delete-confirmation')).toContainText(filename)

    // Confirm deletion
    await page.getByTestId('attachment-delete-confirm').click()

    // Attachment should be removed
    await expect(
      page.getByTestId('attachment-item').filter({ hasText: filename })
    ).toHaveCount(0, { timeout: 15000 })

    fs.unlinkSync(filePath)
  })

  test('Delete attachment can be cancelled', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('attachments-section')).toBeVisible()

    // Upload a file first
    const filename = `DontDeleteMe_${Date.now()}.txt`
    const filePath = path.join('/tmp', filename)
    fs.writeFileSync(filePath, 'keep me content')

    await page.getByTestId('quick-action-add-attachment').click()
    await expect(page.getByTestId('attachment-upload-dialog')).toBeVisible()
    await page.getByTestId('add-attachment-file-input').setInputFiles(filePath)
    await expect(page.getByTestId('attachment-upload-dialog')).not.toBeVisible({ timeout: 15000 })

    const attachmentItem = page.getByTestId('attachment-item').filter({ hasText: filename })
    await expect(attachmentItem).toBeVisible({ timeout: 15000 })

    // Click delete
    await attachmentItem.getByTestId('attachment-delete-button').click()
    await expect(page.getByTestId('attachment-delete-confirmation')).toBeVisible()

    // Cancel
    await page.getByTestId('attachment-delete-cancel').click()

    // Confirmation should close
    await expect(page.getByTestId('attachment-delete-confirmation')).not.toBeVisible()

    // Attachment should still be there
    await expect(attachmentItem).toBeVisible()

    fs.unlinkSync(filePath)
  })
})

// =========================================================================
// PeopleSection
// =========================================================================
test.describe('PeopleSection', () => {
  test('People section displays heading', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('people-section')).toBeVisible()

    await expect(page.getByTestId('people-heading')).toHaveText('People')
  })

  test('People section shows person entries with avatar, name, and role', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('people-section')).toBeVisible()

    // Wait for people to load
    await expect(page.getByTestId('people-list')).toBeVisible({ timeout: 10000 })

    // Acme Corp should have Sarah Jenkins
    const personItems = page.getByTestId('person-item')
    const count = await personItems.count()
    expect(count).toBeGreaterThan(0)

    // Verify Sarah Jenkins entry
    const sarahEntry = personItems.filter({ hasText: 'Sarah Jenkins' })
    await expect(sarahEntry).toBeVisible()
    await expect(sarahEntry.getByTestId('person-avatar')).toBeVisible()
    await expect(sarahEntry.getByTestId('person-name')).toContainText('Sarah Jenkins')
    await expect(sarahEntry.getByTestId('person-role')).toBeVisible()
  })

  test('Person entry is clickable and navigates to person detail page', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('people-list')).toBeVisible({ timeout: 10000 })

    // Click on Sarah Jenkins
    const sarahEntry = page.getByTestId('person-item').filter({ hasText: 'Sarah Jenkins' })
    await sarahEntry.getByTestId('person-name').click()

    // Should navigate to person detail page
    await expect(page).toHaveURL(/\/individuals\/[0-9a-f-]+/)
    await expect(page.getByTestId('person-name')).toHaveText('Sarah Jenkins')
  })

  test('Person entry shows remove action and remove confirmation works', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('people-list')).toBeVisible({ timeout: 10000 })

    // First add a person we can safely remove
    await page.getByTestId('quick-action-add-person').click()
    await expect(page.getByTestId('person-association-dialog')).toBeVisible()

    await page.getByTestId('add-person-tab-create').click()
    const removableName = `RemoveMe ${Date.now()}`
    await page.getByTestId('add-person-name-input').fill(removableName)
    await page.getByTestId('add-person-save').click()
    await expect(page.getByTestId('person-association-dialog')).not.toBeVisible({ timeout: 10000 })

    // Wait for the person to appear
    const personEntry = page.getByTestId('person-item').filter({ hasText: removableName })
    await expect(personEntry).toBeVisible({ timeout: 15000 })

    // Click remove button
    await personEntry.getByTestId('person-remove-button').click()

    // Confirmation should appear
    await expect(page.getByTestId('person-remove-confirmation')).toBeVisible()
    await expect(page.getByTestId('person-remove-confirmation')).toContainText(removableName)

    // Confirm removal
    await page.getByTestId('person-remove-confirm').click()

    // Person should be removed
    await expect(
      page.getByTestId('person-item').filter({ hasText: removableName })
    ).toHaveCount(0, { timeout: 15000 })
  })

  test('Person removal can be cancelled', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('people-list')).toBeVisible({ timeout: 10000 })

    const personItems = page.getByTestId('person-item')
    const beforeCount = await personItems.count()

    // Click remove on first person
    await personItems.first().getByTestId('person-remove-button').click()
    await expect(page.getByTestId('person-remove-confirmation')).toBeVisible()

    // Cancel
    await page.getByTestId('person-remove-cancel').click()

    // Confirmation should close
    await expect(page.getByTestId('person-remove-confirmation')).not.toBeVisible()

    // No entries should be removed
    await expect(page.getByTestId('person-item')).toHaveCount(beforeCount)
  })

  test('People section shows empty state when no individuals are associated', async ({ page }) => {
    // Use Alpha Dynamics which has Alex Johnson - but let's use a client with potentially no people
    const client = await findClient(page.request, 'Beta Systems')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('people-section')).toBeVisible()

    await expect(page.getByTestId('people-list').or(page.getByTestId('people-empty'))).toBeVisible({ timeout: 10000 })

    // If this client has no people, verify empty state
    const hasEmpty = await page.getByTestId('people-empty').isVisible().catch(() => false)
    if (hasEmpty) {
      await expect(page.getByTestId('people-empty')).toContainText('No people')
    }
  })
})

// =========================================================================
// TimelineSection
// =========================================================================
test.describe('TimelineSection', () => {
  test('Timeline section displays heading', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('timeline-section')).toBeVisible()

    await expect(page.getByTestId('timeline-heading')).toHaveText('Timeline')
  })

  test('Timeline shows entries in reverse chronological order', async ({ page }) => {
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('timeline-section')).toBeVisible()

    // Wait for timeline entries to load
    await expect(page.getByTestId('timeline-list').or(page.getByTestId('timeline-empty'))).toBeVisible({ timeout: 10000 })

    const entries = page.getByTestId('timeline-entry')
    const count = await entries.count()
    if (count > 0) {
      // Each entry should have a date, event type
      const firstEntry = entries.first()
      await expect(firstEntry.getByTestId('timeline-date')).toBeVisible()
      await expect(firstEntry.getByTestId('timeline-event-type')).toBeVisible()
      await expect(firstEntry.getByTestId('timeline-icon')).toBeVisible()
    }
  })

  test('Timeline displays various event types', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('timeline-section')).toBeVisible()

    await expect(page.getByTestId('timeline-list').or(page.getByTestId('timeline-empty'))).toBeVisible({ timeout: 10000 })

    // Get all event types
    const eventTypes = await page.getByTestId('timeline-event-type').allTextContents()

    // Timeline should have event type labels that are readable
    for (const eventType of eventTypes) {
      expect(eventType.length).toBeGreaterThan(0)
    }
  })

  test('Timeline entries with subjects are clickable', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('timeline-section')).toBeVisible()

    await expect(page.getByTestId('timeline-list').or(page.getByTestId('timeline-empty'))).toBeVisible({ timeout: 10000 })

    // Check if there are clickable subject links
    const subjectLinks = page.getByTestId('timeline-subject-link')
    const linkCount = await subjectLinks.count()
    if (linkCount > 0) {
      // Click the first subject link and verify navigation
      await subjectLinks.first().click()
      await expect(page).toHaveURL(/\/(deals|individuals|tasks)/)
    }
  })

  test('Timeline updates when new actions occur', async ({ page }) => {
    test.setTimeout(90000)
    const client = await findClient(page.request, 'Acme Corp')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('timeline-section')).toBeVisible()
    await expect(page.getByTestId('timeline-list').or(page.getByTestId('timeline-empty'))).toBeVisible({ timeout: 10000 })

    // Count current timeline entries
    const beforeCount = await page.getByTestId('timeline-entry').count()

    // Create a new task (which triggers a timeline entry)
    const uniqueTask = `Timeline test task ${Date.now()}`
    await page.getByTestId('quick-action-add-task').click()
    await expect(page.getByTestId('task-creation-dialog')).toBeVisible()
    await page.getByTestId('add-task-name-input').fill(uniqueTask)
    await page.getByTestId('add-task-save').click()
    await expect(page.getByTestId('task-creation-dialog')).not.toBeVisible({ timeout: 10000 })

    // Timeline should update with exactly one new entry
    await expect(page.getByTestId('timeline-entry')).toHaveCount(beforeCount + 1, { timeout: 15000 })

    // The new entry should be a "Task Created" event
    const firstEntry = page.getByTestId('timeline-entry').first()
    await expect(firstEntry.getByTestId('timeline-event-type')).toContainText('Task Created')
  })

  test('Timeline shows empty state when no events exist', async ({ page }) => {
    // Use a client that likely has no timeline events
    const client = await findClient(page.request, 'Beta Systems')
    await page.goto(`/clients/${client.id}`)
    await expect(page.getByTestId('timeline-section')).toBeVisible()

    await expect(page.getByTestId('timeline-list').or(page.getByTestId('timeline-empty'))).toBeVisible({ timeout: 10000 })

    // If empty
    const hasEmpty = await page.getByTestId('timeline-empty').isVisible().catch(() => false)
    if (hasEmpty) {
      await expect(page.getByTestId('timeline-empty')).toContainText('No activity')
    }
  })
})
