import { test, expect } from '@playwright/test'

async function createClientsViaAPI(page: import('@playwright/test').Page, count: number, prefix: string) {
  const baseURL = 'http://localhost:8888'
  const clients = Array.from({ length: count }, (_, i) => ({
    name: `${prefix}-${i}`,
    type: 'Organization',
    status: 'Active',
    source: '',
  }))
  await page.request.post(`${baseURL}/.netlify/functions/clients?action=import`, {
    data: { clients },
  })
}

/** Navigate away and back using client-side routing to refresh data.
 *  Avoids page.goto which can get empty responses from Netlify dev server. */
async function refreshClientsPage(page: import('@playwright/test').Page) {
  await page.getByTestId('sidebar-link-dashboard').click()
  await expect(page).toHaveURL('/dashboard')
  await page.getByTestId('sidebar-link-clients').click()
  await expect(page.getByTestId('clients-table').or(page.getByTestId('clients-table-empty'))).toBeVisible({ timeout: 30000 })
}

test.describe('Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByTestId('pagination')).toBeVisible()
    await expect(page.getByTestId('clients-table').or(page.getByTestId('clients-table-empty'))).toBeVisible()
  })

  test('Pagination displays correct count information', async ({ page }) => {
    const paginationInfo = page.getByTestId('pagination-info')
    await expect(paginationInfo).toBeVisible()

    const text = await paginationInfo.textContent()
    // Should match "Showing X-Y of Z clients" or "Showing 0 of 0 clients"
    expect(text).toMatch(/Showing (\d+-\d+|\d+) of \d+ clients/)
  })

  test('Clicking Next page loads the next set of clients', async ({ page }) => {
    test.setTimeout(120000)
    // Check if we have enough clients for multiple pages
    const paginationInfo = page.getByTestId('pagination-info')
    let text = await paginationInfo.textContent()
    let totalMatch = text?.match(/of (\d+) clients/)
    let total = totalMatch ? parseInt(totalMatch[1]) : 0

    if (total <= 50) {
      // Create enough clients for 2 pages
      const needed = 55 - total
      if (needed > 0) {
        await createClientsViaAPI(page, needed, `PagNext-${Date.now()}`)
        await refreshClientsPage(page)
      }
    }

    // Re-check pagination
    text = await paginationInfo.textContent()
    totalMatch = text?.match(/of (\d+) clients/)
    total = totalMatch ? parseInt(totalMatch[1]) : 0

    const nextBtn = page.getByTestId('pagination-next')
    if (await nextBtn.isDisabled()) return

    // Record initial info
    const initialText = await paginationInfo.textContent()

    // Click Next
    await nextBtn.click()

    // Pagination text should change
    await expect(paginationInfo).not.toHaveText(initialText!)

    // Previous button should be enabled on page 2
    await expect(page.getByTestId('pagination-prev')).toBeEnabled()
  })

  test('Clicking Previous page loads the previous set of clients', async ({ page }) => {
    test.setTimeout(120000)
    const nextBtn = page.getByTestId('pagination-next')
    if (await nextBtn.isDisabled()) {
      // Create enough clients
      await createClientsViaAPI(page, 55, `PagPrev-${Date.now()}`)
      await refreshClientsPage(page)
    }

    if (await page.getByTestId('pagination-next').isDisabled()) return

    // Go to page 2
    await page.getByTestId('pagination-next').click()
    const paginationInfo = page.getByTestId('pagination-info')
    await expect(page.getByTestId('pagination-prev')).toBeEnabled()

    // Click Previous
    await page.getByTestId('pagination-prev').click()

    // Should be back on page 1
    await expect(paginationInfo).toContainText('Showing 1-')
  })

  test('Previous button is disabled on first page', async ({ page }) => {
    await expect(page.getByTestId('pagination-prev')).toBeDisabled()
  })

  test('Next button is disabled on last page', async ({ page }) => {
    const paginationInfo = page.getByTestId('pagination-info')
    const text = await paginationInfo.textContent()
    const totalMatch = text?.match(/of (\d+) clients/)
    const total = totalMatch ? parseInt(totalMatch[1]) : 0

    if (total <= 50) {
      // Only one page, next should be disabled
      await expect(page.getByTestId('pagination-next')).toBeDisabled()
      return
    }

    // Navigate to the last page
    const totalPages = Math.ceil(total / 50)
    const lastPageBtn = page.getByTestId(`pagination-page-${totalPages}`)
    if (await lastPageBtn.isVisible()) {
      await lastPageBtn.click()
    } else {
      // Click next repeatedly until disabled
      while (!(await page.getByTestId('pagination-next').isDisabled())) {
        await page.getByTestId('pagination-next').click()
        await page.waitForTimeout(500)
      }
    }

    await expect(page.getByTestId('pagination-next')).toBeDisabled()
  })

  test('Clicking a specific page number navigates to that page', async ({ page }) => {
    const nextBtn = page.getByTestId('pagination-next')
    if (await nextBtn.isDisabled()) {
      // Only one page - verify page 1 button exists
      await expect(page.getByTestId('pagination-page-1')).toBeVisible()
      return
    }

    // Click page 2 button
    const page2Btn = page.getByTestId('pagination-page-2')
    if (await page2Btn.isVisible()) {
      await page2Btn.click()

      // Should show page 2 range
      const paginationInfo = page.getByTestId('pagination-info')
      await expect(paginationInfo).toContainText('Showing 51-')

      // Page 2 button should be highlighted
      await expect(page2Btn).toHaveClass(/active/)
    }
  })

  test('Current page number is visually highlighted', async ({ page }) => {
    // On page 1, "1" button should be highlighted
    const page1Btn = page.getByTestId('pagination-page-1')
    await expect(page1Btn).toBeVisible()
    await expect(page1Btn).toHaveClass(/active/)

    // Other pages should NOT be highlighted
    const page2Btn = page.getByTestId('pagination-page-2')
    if (await page2Btn.isVisible()) {
      await expect(page2Btn).not.toHaveClass(/active/)
    }
  })

  test('Pagination resets when filters change', async ({ page }) => {
    const nextBtn = page.getByTestId('pagination-next')

    if (!(await nextBtn.isDisabled())) {
      // Navigate away from page 1
      await nextBtn.click()
      await expect(page.getByTestId('pagination-prev')).toBeEnabled()
    }

    // Apply a filter
    await page.getByTestId('status-filter-trigger').click()
    await page.getByTestId('status-filter-option-Active').click()

    // Pagination should reset to page 1
    const paginationInfo = page.getByTestId('pagination-info')
    // With few results it may show "Showing 1-X" or "Showing 0 of 0"
    await expect(paginationInfo).toHaveText(/Showing (1-|0 of 0)/, { timeout: 10000 })

    // If there's a page 1 button, it should be active
    const page1Btn = page.getByTestId('pagination-page-1')
    if (await page1Btn.isVisible()) {
      await expect(page1Btn).toHaveClass(/active/)
    }
  })
})
