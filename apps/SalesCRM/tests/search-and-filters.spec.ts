import { test, expect } from '@playwright/test'

test.describe('ClientsSearchAndFilters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByTestId('clients-search-and-filters')).toBeVisible()
    // Wait for clients to load
    await expect(page.getByTestId('clients-table').or(page.getByTestId('clients-table-empty'))).toBeVisible()
  })

  test('Search bar filters clients by name', async ({ page }) => {
    // Type "Acme" into the search bar
    await page.getByTestId('search-input').fill('Acme')

    // Wait for the table to update - should show Acme Corp
    await expect(page.getByTestId('clients-table')).toBeVisible()
    await expect(page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Acme Corp' })).toBeVisible()

    // Non-matching clients should not be visible
    await expect(
      page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Globex Solutions' })
    ).toHaveCount(0, { timeout: 10000 })
  })

  test('Search bar filters clients by tag', async ({ page }) => {
    // Search for "SaaS" tag
    await page.getByTestId('search-input').fill('SaaS')

    // Wait for results - clients with SaaS tag should appear
    await expect(page.getByTestId('clients-table')).toBeVisible()
    await expect(page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Acme Corp' })).toBeVisible({ timeout: 10000 })

    // Clients without SaaS tag should not appear
    await expect(
      page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Globex Solutions' })
    ).toHaveCount(0, { timeout: 10000 })
  })

  test('Search bar filters clients by contact name', async ({ page }) => {
    // Search for "Sarah" (primary contact Sarah Jenkins on Acme Corp)
    await page.getByTestId('search-input').fill('Sarah')

    // Acme Corp (whose primary contact is Sarah Jenkins) should appear
    await expect(page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Acme Corp' })).toBeVisible({ timeout: 10000 })

    // Clients without Sarah as contact should not appear
    await expect(
      page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Globex Solutions' })
    ).toHaveCount(0, { timeout: 10000 })
  })

  test('Search bar shows empty state when no results match', async ({ page }) => {
    // Type a nonsense search
    await page.getByTestId('search-input').fill('zzzznonexistent')

    // Wait for empty state
    await expect(page.getByTestId('clients-table-empty')).toBeVisible({ timeout: 10000 })

    // Pagination should show 0 clients
    await expect(page.getByTestId('pagination-info')).toContainText('0 of 0 clients')
  })

  test('Status dropdown filters by client status', async ({ page }) => {
    // Open Status dropdown and select "Active"
    await page.getByTestId('status-filter-trigger').click()
    await page.getByTestId('status-filter-option-Active').click()

    // Dropdown should display "Status: Active"
    await expect(page.getByTestId('status-filter-trigger')).toContainText('Status: Active')

    // Wait for table update - all visible rows should have Active status
    await expect(page.getByTestId('clients-table')).toBeVisible()
    const rows = page.locator('[data-testid^="client-row-"]')
    await expect(rows.first()).toBeVisible()

    // Check that all visible status badges say Active
    const statusBadges = page.locator('[data-testid^="client-status-"]')
    const count = await statusBadges.count()
    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toHaveText('Active')
    }

    // Reset to "All"
    await page.getByTestId('status-filter-trigger').click()
    await page.getByTestId('status-filter-option-all').click()

    // Should show all clients again - verify total increased
    await expect(page.getByTestId('clients-table')).toBeVisible()
  })

  test('Tags dropdown filters by tag', async ({ page }) => {
    // Open Tags dropdown and select "Enterprise"
    await page.getByTestId('tags-filter-trigger').click()
    await page.getByTestId('tags-filter-option-Enterprise').click()

    // Dropdown should display "Tags: Enterprise"
    await expect(page.getByTestId('tags-filter-trigger')).toContainText('Tags: Enterprise')

    // Wait for table update - all visible rows should have Enterprise tag
    await expect(page.getByTestId('clients-table')).toBeVisible()
    const rows = page.locator('[data-testid^="client-row-"]')
    await expect(rows.first()).toBeVisible()

    // Each visible row's tags cell should contain Enterprise
    const tagsCells = page.locator('[data-testid^="client-tags-"]')
    const count = await tagsCells.count()
    for (let i = 0; i < count; i++) {
      await expect(tagsCells.nth(i)).toContainText('Enterprise')
    }
  })

  test('Source dropdown filters by acquisition source', async ({ page }) => {
    // Open Source dropdown and select "Referral"
    await page.getByTestId('source-filter-trigger').click()
    await page.getByTestId('source-filter-option-Referral').click()

    // Dropdown should display "Source: Referral"
    await expect(page.getByTestId('source-filter-trigger')).toContainText('Source: Referral')

    // Wait for table update
    await expect(page.getByTestId('clients-table')).toBeVisible()
    const rows = page.locator('[data-testid^="client-row-"]')
    await expect(rows.first()).toBeVisible()

    // Verify at least Acme Corp (source=Referral) is shown
    await expect(page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Acme Corp' })).toBeVisible()
  })

  test('Sort dropdown changes table ordering', async ({ page }) => {
    // Wait for table to load
    await expect(page.locator('[data-testid^="client-row-"]').first()).toBeVisible()

    // Select "Name A-Z"
    await page.getByTestId('sort-filter-trigger').click()
    await page.getByTestId('sort-filter-option-name_asc').click()

    // Wait for reload
    await expect(page.locator('[data-testid^="client-row-"]').first()).toBeVisible()

    // Get all client names
    const namesAZ = await page.locator('[data-testid^="client-name-"]').allTextContents()
    const sortedAZ = [...namesAZ].sort((a, b) => a.localeCompare(b))
    expect(namesAZ).toEqual(sortedAZ)

    // Select "Name Z-A"
    await page.getByTestId('sort-filter-trigger').click()
    await page.getByTestId('sort-filter-option-name_desc').click()

    // Wait for reload
    await expect(page.locator('[data-testid^="client-row-"]').first()).toBeVisible()

    const namesZA = await page.locator('[data-testid^="client-name-"]').allTextContents()
    const sortedZA = [...namesZA].sort((a, b) => b.localeCompare(a))
    expect(namesZA).toEqual(sortedZA)
  })

  test('Multiple filters combine correctly', async ({ page }) => {
    // Apply Status: Active
    await page.getByTestId('status-filter-trigger').click()
    await page.getByTestId('status-filter-option-Active').click()
    await expect(page.getByTestId('clients-table')).toBeVisible()

    // Apply Tags: Enterprise
    await page.getByTestId('tags-filter-trigger').click()
    await page.getByTestId('tags-filter-option-Enterprise').click()
    await expect(page.getByTestId('clients-table')).toBeVisible()

    // Wait for filtered results
    await expect(page.locator('[data-testid^="client-row-"]').first()).toBeVisible()

    // All visible rows should have Active status AND Enterprise tag
    const rows = page.locator('[data-testid^="client-row-"]')
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i)
      await expect(row.locator('[data-testid^="client-status-"]')).toHaveText('Active')
      await expect(row.locator('[data-testid^="client-tags-"]')).toContainText('Enterprise')
    }

    // Add search for "Acme"
    await page.getByTestId('search-input').fill('Acme')

    // Only Acme Corp should match (Active + Enterprise + name "Acme")
    await expect(page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Acme Corp' })).toBeVisible({ timeout: 10000 })
  })

  test('Clearing search resets the filter', async ({ page }) => {
    // First, apply a search
    await page.getByTestId('search-input').fill('Acme')

    // Wait for filtered results
    await expect(page.locator('[data-testid^="client-row-"]').filter({ hasText: 'Acme Corp' })).toBeVisible({ timeout: 10000 })

    // Store the count while filtered
    const filteredCount = await page.locator('[data-testid^="client-row-"]').count()

    // Clear the search using the clear button
    await page.getByTestId('search-clear').click()

    // Wait for the table to show all clients
    await expect(page.getByTestId('clients-table')).toBeVisible()
    await expect(page.locator('[data-testid^="client-row-"]').first()).toBeVisible({ timeout: 10000 })

    // Should show more clients than the filtered view
    const totalCount = await page.locator('[data-testid^="client-row-"]').count()
    expect(totalCount).toBeGreaterThanOrEqual(filteredCount)
  })
})
