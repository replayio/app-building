import { test, expect } from '@playwright/test'

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByTestId('sidebar')).toBeVisible()
  })

  test('Sidebar displays all navigation links with correct icons', async ({ page }) => {
    // Logo is visible at the top
    await expect(page.getByTestId('sidebar-logo')).toBeVisible()

    // All 6 navigation links are present
    const navLinks = [
      'sidebar-link-dashboard',
      'sidebar-link-clients',
      'sidebar-link-deals',
      'sidebar-link-tasks',
      'sidebar-link-reports',
      'sidebar-link-settings',
    ]
    for (const testId of navLinks) {
      await expect(page.getByTestId(testId)).toBeVisible()
    }

    // Each nav link has an SVG icon
    for (const testId of navLinks) {
      await expect(page.getByTestId(testId).locator('svg')).toBeVisible()
    }

    // "Clients" link is visually highlighted as active
    const clientsLink = page.getByTestId('sidebar-link-clients')
    await expect(clientsLink).toHaveClass(/active/)

    // User profile avatar with dropdown chevron is shown at the bottom
    await expect(page.getByTestId('sidebar-profile-button')).toBeVisible()
    await expect(page.getByTestId('sidebar-profile-avatar')).toBeVisible()
  })

  test('Sidebar navigation links route to correct pages', async ({ page }) => {
    // Click Dashboard
    await page.getByTestId('sidebar-link-dashboard').click()
    await expect(page).toHaveURL('/dashboard')

    // Click Deals from Dashboard (sidebar is present on all pages)
    await page.getByTestId('sidebar-link-deals').click()
    await expect(page).toHaveURL('/deals')

    // Click Tasks from Deals
    await page.getByTestId('sidebar-link-tasks').click()
    await expect(page).toHaveURL('/tasks')

    // Click Reports from Tasks
    await page.getByTestId('sidebar-link-reports').click()
    await expect(page).toHaveURL('/reports')

    // Click Settings from Reports
    await page.getByTestId('sidebar-link-settings').click()
    await expect(page).toHaveURL('/settings')
  })

  test('Sidebar highlights the active page', async ({ page }) => {
    // On /clients, the Clients link should be active
    const clientsLink = page.getByTestId('sidebar-link-clients')
    await expect(clientsLink).toHaveClass(/active/)

    // All other links should NOT be active
    const otherLinks = [
      'sidebar-link-dashboard',
      'sidebar-link-deals',
      'sidebar-link-tasks',
      'sidebar-link-reports',
      'sidebar-link-settings',
    ]
    for (const testId of otherLinks) {
      await expect(page.getByTestId(testId)).not.toHaveClass(/active/)
    }
  })

  test('Sidebar user profile dropdown', async ({ page }) => {
    // Click profile button to open dropdown
    await page.getByTestId('sidebar-profile-button').click()
    await expect(page.getByTestId('sidebar-profile-dropdown')).toBeVisible()

    // Dropdown should have Profile and Log Out options
    await expect(page.getByTestId('sidebar-profile-option-profile')).toBeVisible()
    await expect(page.getByTestId('sidebar-profile-option-logout')).toBeVisible()

    // Click Log Out
    await page.getByTestId('sidebar-profile-option-logout').click()

    // Should redirect to login page
    await expect(page).toHaveURL('/login')
  })
})
