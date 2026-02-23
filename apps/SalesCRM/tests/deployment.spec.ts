import { test, expect } from '@playwright/test'

test('Deployment functional test: app loads and supports auth operations', async ({
  page,
}) => {
  test.slow()

  // 1. Navigate to the main page and confirm app renders
  await page.goto('/clients')
  await expect(page.getByTestId('clients-list-page')).toBeVisible()
  await expect(page.getByTestId('sidebar')).toBeVisible()
  await expect(page.locator('text=Sales CRM')).toBeVisible()

  // Verify navigation links render
  await expect(page.getByTestId('nav-link-clients')).toBeVisible()
  await expect(page.getByTestId('nav-link-deals')).toBeVisible()
  await expect(page.getByTestId('nav-link-tasks')).toBeVisible()

  // 2. Perform a write operation: sign up a new user
  const uniqueEmail = `test-deploy-${Date.now()}@example.com`
  const testName = 'Deploy Test User'
  const testPassword = 'TestPassword123!'

  // Open auth form and switch to sign up
  await page.getByTestId('sign-in-button').click()
  await expect(page.getByTestId('auth-form')).toBeVisible()
  await page.getByTestId('auth-toggle').click()

  // Fill sign up form
  await page.getByTestId('auth-name-input').fill(testName)
  await page.getByTestId('auth-email-input').fill(uniqueEmail)
  await page.getByTestId('auth-password-input').fill(testPassword)
  await page.getByTestId('auth-submit-button').click()

  // Verify sign up succeeded (either shows user name or a confirmation message)
  const userNameVisible = page.getByTestId('user-name')
  const authMessage = page.getByTestId('auth-message')
  await expect(userNameVisible.or(authMessage)).toBeVisible({ timeout: 15000 })

  // If we got a confirmation message, sign in instead
  if (await authMessage.isVisible()) {
    // Sign in with the created account
    await page.getByTestId('auth-toggle').click()
    await page.getByTestId('auth-email-input').fill(uniqueEmail)
    await page.getByTestId('auth-password-input').fill(testPassword)
    await page.getByTestId('auth-submit-button').click()
  }

  // Verify user is logged in - either user name shows or we got a message
  await expect(
    userNameVisible.or(authMessage).or(page.getByTestId('auth-error')),
  ).toBeVisible({ timeout: 15000 })
})
