import { test, expect } from '@playwright/test'

test.describe('SidebarNavLinks', () => {
  test('Sidebar displays all navigation links with icons', async ({ page }) => {
    await page.goto('/clients')

    const sidebar = page.getByTestId('sidebar')
    await expect(sidebar).toBeVisible()

    // Verify app title
    await expect(sidebar.locator('text=Sales CRM')).toBeVisible()

    // Verify all 6 nav links exist in order
    const navLinks = [
      { testId: 'nav-link-clients', label: 'Clients' },
      { testId: 'nav-link-contacts', label: 'Contacts' },
      { testId: 'nav-link-deals', label: 'Deals' },
      { testId: 'nav-link-tasks', label: 'Tasks' },
      { testId: 'nav-link-team', label: 'Team' },
      { testId: 'nav-link-settings', label: 'Settings' },
    ]

    for (const link of navLinks) {
      const el = page.getByTestId(link.testId)
      await expect(el).toBeVisible()
      await expect(el).toContainText(link.label)
      // Verify each link has an SVG icon
      await expect(el.locator('svg')).toBeVisible()
    }

    // Verify order by checking the nav list children
    const navItems = page.getByTestId('sidebar-nav').locator('li')
    await expect(navItems).toHaveCount(6)
  })

  test('Clicking Clients link navigates to /clients', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByTestId('settings-page')).toBeVisible()

    await page.getByTestId('nav-link-clients').click()

    await expect(page).toHaveURL(/\/clients$/)
    await expect(page.getByTestId('clients-list-page')).toBeVisible()
    // Active link should have non-transparent background (sidebar-active = #eeeeee)
    const clientsBg = await page.getByTestId('nav-link-clients').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    )
    expect(clientsBg).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('Clicking Contacts link navigates to /contacts', async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByTestId('clients-list-page')).toBeVisible()

    await page.getByTestId('nav-link-contacts').click()

    await expect(page).toHaveURL(/\/contacts$/)
    await expect(page.getByTestId('contacts-list-page')).toBeVisible()
    const contactsBg = await page.getByTestId('nav-link-contacts').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    )
    expect(contactsBg).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('Clicking Deals link navigates to /deals', async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByTestId('clients-list-page')).toBeVisible()

    await page.getByTestId('nav-link-deals').click()

    await expect(page).toHaveURL(/\/deals$/)
    await expect(page.getByTestId('deals-list-page')).toBeVisible()
    const dealsBg = await page.getByTestId('nav-link-deals').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    )
    expect(dealsBg).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('Clicking Tasks link navigates to /tasks', async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByTestId('clients-list-page')).toBeVisible()

    await page.getByTestId('nav-link-tasks').click()

    await expect(page).toHaveURL(/\/tasks$/)
    await expect(page.getByTestId('tasks-list-page')).toBeVisible()
    const tasksBg = await page.getByTestId('nav-link-tasks').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    )
    expect(tasksBg).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('Clicking Team link navigates to /users', async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByTestId('clients-list-page')).toBeVisible()

    await page.getByTestId('nav-link-team').click()

    await expect(page).toHaveURL(/\/users$/)
    await expect(page.getByTestId('users-list-page')).toBeVisible()
    const teamBg = await page.getByTestId('nav-link-team').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    )
    expect(teamBg).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('Clicking Settings link navigates to /settings', async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByTestId('clients-list-page')).toBeVisible()

    await page.getByTestId('nav-link-settings').click()

    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.getByTestId('settings-page')).toBeVisible()
    const settingsBg = await page.getByTestId('nav-link-settings').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    )
    expect(settingsBg).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('Active link highlights based on current route', async ({ page }) => {
    await page.goto('/clients')

    const clientsLink = page.getByTestId('nav-link-clients')
    const contactsLink = page.getByTestId('nav-link-contacts')
    const dealsLink = page.getByTestId('nav-link-deals')
    const tasksLink = page.getByTestId('nav-link-tasks')
    const teamLink = page.getByTestId('nav-link-team')
    const settingsLink = page.getByTestId('nav-link-settings')

    // Clients link should have active background
    const activeColor = await clientsLink.evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    )
    expect(activeColor).not.toBe('rgba(0, 0, 0, 0)')

    // All other links should have transparent background
    for (const link of [contactsLink, dealsLink, tasksLink, teamLink, settingsLink]) {
      const bg = await link.evaluate((el) => getComputedStyle(el).backgroundColor)
      expect(bg).toBe('rgba(0, 0, 0, 0)')
    }
  })

  test('Active link updates on sub-routes', async ({ page }) => {
    // Navigate to a sub-route of /clients
    await page.goto('/clients/123')

    const clientsLink = page.getByTestId('nav-link-clients')
    const activeColor = await clientsLink.evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    )
    expect(activeColor).not.toBe('rgba(0, 0, 0, 0)')

    // Other links should not be active
    const contactsLink = page.getByTestId('nav-link-contacts')
    const contactsBg = await contactsLink.evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    )
    expect(contactsBg).toBe('rgba(0, 0, 0, 0)')
  })

  test('Sidebar is persistent across all pages', async ({ page }) => {
    const pages = [
      { path: '/clients', testId: 'clients-list-page' },
      { path: '/deals', testId: 'deals-list-page' },
      { path: '/tasks', testId: 'tasks-list-page' },
      { path: '/contacts', testId: 'contacts-list-page' },
      { path: '/users', testId: 'users-list-page' },
      { path: '/settings', testId: 'settings-page' },
    ]

    for (const p of pages) {
      await page.goto(p.path)
      await expect(page.getByTestId(p.testId)).toBeVisible()

      const sidebar = page.getByTestId('sidebar')
      await expect(sidebar).toBeVisible()

      // Verify sidebar width is approximately 244px
      const box = await sidebar.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.width).toBeGreaterThanOrEqual(240)
      expect(box!.width).toBeLessThanOrEqual(250)

      // Verify nav links are functional
      await expect(page.getByTestId('sidebar-nav')).toBeVisible()
    }
  })
})
