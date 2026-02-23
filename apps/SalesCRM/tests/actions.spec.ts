import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

test.describe('ClientsActions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByTestId('clients-actions')).toBeVisible()
    // Wait for clients to load
    await expect(page.getByTestId('clients-table').or(page.getByTestId('clients-table-empty'))).toBeVisible()
  })

  test('Import button opens import dialog', async ({ page }) => {
    // Click Import button
    await page.getByTestId('import-button').click()

    // Import modal should be visible
    await expect(page.getByTestId('import-modal')).toBeVisible()

    // Shows instructions about CSV format
    const modalContent = page.getByTestId('import-modal-content')
    await expect(modalContent).toContainText('Client Name')
    await expect(modalContent).toContainText('Type')
    await expect(modalContent).toContainText('Status')
    await expect(modalContent).toContainText('Tags')
    await expect(modalContent).toContainText('Source')
    await expect(modalContent).toContainText('Primary Contact')

    // Shows a file upload area accepting .csv
    await expect(page.getByTestId('import-dropzone')).toBeVisible()
    const fileInput = page.getByTestId('import-file-input')
    await expect(fileInput).toHaveAttribute('accept', '.csv')
  })

  test('Import dialog processes valid CSV file', async ({ page }) => {
    // Open import dialog
    await page.getByTestId('import-button').click()
    await expect(page.getByTestId('import-modal')).toBeVisible()

    // Create a valid CSV file
    const csvContent = `Client Name,Type,Status,Tags,Source
ImportTest Alpha,Organization,Active,"SaaS,Enterprise",Referral
ImportTest Beta,Individual,Prospect,Startup,Direct`
    const csvPath = path.join('/tmp', `test-import-${Date.now()}.csv`)
    fs.writeFileSync(csvPath, csvContent)

    // Upload the CSV file
    const fileInput = page.getByTestId('import-file-input')
    await fileInput.setInputFiles(csvPath)

    // Preview should show 2 clients
    await expect(page.getByTestId('import-preview')).toBeVisible()
    await expect(page.getByTestId('import-preview')).toContainText('2 clients found')

    // Confirm the import
    await page.getByTestId('import-confirm').click()

    // Success message should appear
    await expect(page.getByTestId('import-success')).toContainText('2 clients imported successfully')

    // Modal should close after success
    await expect(page.getByTestId('import-modal')).not.toBeVisible({ timeout: 5000 })

    // The imported clients should appear in the table
    await expect(page.locator('[data-testid^="client-row-"]').filter({ hasText: 'ImportTest Alpha' })).toBeVisible({ timeout: 10000 })

    // Clean up temp file
    fs.unlinkSync(csvPath)
  })

  test('Import dialog rejects invalid file', async ({ page }) => {
    // Open import dialog
    await page.getByTestId('import-button').click()
    await expect(page.getByTestId('import-modal')).toBeVisible()

    // Create a CSV missing required column "Client Name"
    const csvContent = `Name,Type,Status
Bad Corp,Organization,Active`
    const csvPath = path.join('/tmp', `test-import-invalid-${Date.now()}.csv`)
    fs.writeFileSync(csvPath, csvContent)

    // Upload the file
    const fileInput = page.getByTestId('import-file-input')
    await fileInput.setInputFiles(csvPath)

    // Error message should appear
    await expect(page.getByTestId('import-error')).toContainText('Missing required column: Client Name')

    // Import confirm button should not appear (no preview)
    await expect(page.getByTestId('import-confirm')).not.toBeVisible()

    // Clean up temp file
    fs.unlinkSync(csvPath)
  })

  test('Export button downloads client data', async ({ page }) => {
    // Wait for table to load
    await expect(page.locator('[data-testid^="client-row-"]').first()).toBeVisible()

    // Set up download listener
    const downloadPromise = page.waitForEvent('download')

    // Click Export button
    await page.getByTestId('export-button').click()

    // A download should be triggered
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('clients.csv')

    // Read the downloaded file contents
    const downloadPath = await download.path()
    const csvContent = fs.readFileSync(downloadPath!, 'utf-8')

    // Check CSV headers
    expect(csvContent).toContain('Client Name')
    expect(csvContent).toContain('Type')
    expect(csvContent).toContain('Status')
    expect(csvContent).toContain('Tags')
    expect(csvContent).toContain('Source')
    expect(csvContent).toContain('Primary Contact')
    expect(csvContent).toContain('Open Deals')
    expect(csvContent).toContain('Next Task')
  })

  test('Export respects current filters', async ({ page }) => {
    // Wait for table to load
    await expect(page.locator('[data-testid^="client-row-"]').first()).toBeVisible()

    // Apply Status: Active filter
    await page.getByTestId('status-filter-trigger').click()
    await page.getByTestId('status-filter-option-Active').click()
    await expect(page.getByTestId('clients-table')).toBeVisible()
    await expect(page.locator('[data-testid^="client-row-"]').first()).toBeVisible()

    // Set up download listener and click export
    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('export-button').click()

    const download = await downloadPromise
    const downloadPath = await download.path()
    const csvContent = fs.readFileSync(downloadPath!, 'utf-8')

    // The exported CSV should only contain Active clients
    const lines = csvContent.split('\n').filter(l => l.trim())
    // Skip header row, check each data row contains Active
    for (let i = 1; i < lines.length; i++) {
      expect(lines[i]).toContain('Active')
    }

    // Should NOT contain non-Active statuses
    expect(csvContent).not.toContain(',Inactive,')
    expect(csvContent).not.toContain(',Prospect,')
    expect(csvContent).not.toContain(',Churned,')
  })

  test('Add New Client button opens creation dialog', async ({ page }) => {
    // Click Add New Client button
    await page.getByTestId('add-client-button').click()

    // Client form modal should be visible
    await expect(page.getByTestId('client-form-modal')).toBeVisible()

    // Form should have all required fields
    await expect(page.getByTestId('client-form-name')).toBeVisible()
    await expect(page.getByTestId('client-form-type')).toBeVisible()
    await expect(page.getByTestId('client-form-type-organization')).toBeVisible()
    await expect(page.getByTestId('client-form-type-individual')).toBeVisible()
    await expect(page.getByTestId('client-form-status')).toBeVisible()
    await expect(page.getByTestId('client-form-tags')).toBeVisible()
    await expect(page.getByTestId('client-form-source')).toBeVisible()
  })

  test('Add New Client form validates required fields', async ({ page }) => {
    // Open the add client dialog
    await page.getByTestId('add-client-button').click()
    await expect(page.getByTestId('client-form-modal')).toBeVisible()

    // Leave name empty and try to submit
    await page.getByTestId('client-form-submit').click()

    // Validation error should appear
    await expect(page.getByTestId('client-form-name-error')).toContainText('Client name is required')

    // Modal should still be open (form not submitted)
    await expect(page.getByTestId('client-form-modal')).toBeVisible()
  })

  test('Add New Client form creates a client successfully', async ({ page }) => {
    const uniqueName = `NewCorp-${Date.now()}`

    // Open the add client dialog
    await page.getByTestId('add-client-button').click()
    await expect(page.getByTestId('client-form-modal')).toBeVisible()

    // Fill in the form
    await page.getByTestId('client-form-name').fill(uniqueName)
    await page.getByTestId('client-form-type-organization').click()

    // Select status: Prospect
    await page.getByTestId('client-form-status-trigger').click()
    await page.getByTestId('client-form-status-option-prospect').click()

    // Add tags: SaaS, Startup
    const tagInput = page.getByTestId('client-form-tags-input')
    await tagInput.fill('SaaS')
    await tagInput.press('Enter')
    await tagInput.fill('Startup')
    await tagInput.press('Enter')

    // Set source
    await page.getByTestId('client-form-source').fill('Referral')

    // Submit the form
    await page.getByTestId('client-form-submit').click()

    // Dialog should close
    await expect(page.getByTestId('client-form-modal')).not.toBeVisible({ timeout: 10000 })

    // New client should appear in the table
    await expect(page.locator('[data-testid^="client-row-"]').filter({ hasText: uniqueName })).toBeVisible({ timeout: 10000 })
  })

  test('Add New Client dialog can be cancelled', async ({ page }) => {
    // Record current row count
    const initialRows = await page.locator('[data-testid^="client-row-"]').count()

    // Open the add client dialog
    await page.getByTestId('add-client-button').click()
    await expect(page.getByTestId('client-form-modal')).toBeVisible()

    // Enter partial data
    await page.getByTestId('client-form-name').fill('CancelledClient')

    // Click Cancel
    await page.getByTestId('client-form-cancel').click()

    // Dialog should close
    await expect(page.getByTestId('client-form-modal')).not.toBeVisible()

    // No new client should appear
    await expect(
      page.locator('[data-testid^="client-row-"]').filter({ hasText: 'CancelledClient' })
    ).toHaveCount(0)

    // Row count should remain the same
    const finalRows = await page.locator('[data-testid^="client-row-"]').count()
    expect(finalRows).toBe(initialRows)
  })
})
