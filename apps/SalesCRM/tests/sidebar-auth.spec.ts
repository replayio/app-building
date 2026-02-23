import { test, expect } from '@playwright/test'

// Helper to generate unique email for test isolation
function uniqueEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`
}

test.describe('SidebarUserArea', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clients')
  })

  test('Sign In button shown when not logged in', async ({ page }) => {
    // User is not authenticated
    const signInButton = page.getByTestId('sign-in-button')
    await expect(signInButton).toBeVisible()

    // No avatar, name, or sign-out should be visible
    await expect(page.getByTestId('user-avatar')).not.toBeVisible()
    await expect(page.getByTestId('user-name')).not.toBeVisible()
    await expect(page.getByTestId('sign-out-button')).not.toBeVisible()
  })

  test('Clicking Sign In reveals inline auth form', async ({ page }) => {
    await page.getByTestId('sign-in-button').click()

    const authForm = page.getByTestId('auth-form')
    await expect(authForm).toBeVisible()

    // Verify form has all required fields
    await expect(page.getByTestId('auth-email-input')).toBeVisible()
    await expect(page.getByTestId('auth-password-input')).toBeVisible()
    await expect(page.getByTestId('auth-submit-button')).toBeVisible()
    await expect(page.getByTestId('forgot-password-link')).toBeVisible()
    await expect(page.getByTestId('auth-toggle')).toBeVisible()

    // Submit button should say "Sign In"
    await expect(page.getByTestId('auth-submit-button')).toHaveText('Sign In')
  })

  test('Sign In form submits with email and password', async ({ page }) => {
    // This test does signup + signout + signin, so it needs extra time
    test.slow()

    // First, create an account via sign up
    const email = uniqueEmail()
    const password = 'testpass123'

    await page.getByTestId('sign-in-button').click()
    await page.getByTestId('auth-toggle').click()
    await page.getByTestId('auth-name-input').fill('Test User')
    await page.getByTestId('auth-email-input').fill(email)
    await page.getByTestId('auth-password-input').fill(password)
    await page.getByTestId('auth-submit-button').click()

    // Wait for sign up to complete (IS_TEST=true auto-confirms)
    await expect(page.getByTestId('user-name')).toBeVisible({ timeout: 30000 })

    // Sign out so we can test sign in
    await page.getByTestId('sign-out-button').click()
    await expect(page.getByTestId('sign-in-button')).toBeVisible()

    // Now sign in with the created account
    await page.getByTestId('sign-in-button').click()
    await page.getByTestId('auth-email-input').fill(email)
    await page.getByTestId('auth-password-input').fill(password)
    await page.getByTestId('auth-submit-button').click()

    // On success: form replaced by user info
    await expect(page.getByTestId('user-avatar')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('user-name')).toHaveText('Test User')
    await expect(page.getByTestId('sign-out-button')).toBeVisible()
  })

  test('Forgot password link navigates to /auth/forgot-password', async ({ page }) => {
    await page.getByTestId('sign-in-button').click()
    await expect(page.getByTestId('auth-form')).toBeVisible()

    await page.getByTestId('forgot-password-link').click()

    await expect(page).toHaveURL(/\/auth\/forgot-password$/)
    await expect(page.getByTestId('forgot-password-page')).toBeVisible()
  })

  test('Toggle switches between Sign In and Sign Up modes', async ({ page }) => {
    await page.getByTestId('sign-in-button').click()

    // Start in Sign In mode
    await expect(page.getByTestId('auth-submit-button')).toHaveText('Sign In')
    // Name field should not be visible in sign-in mode
    await expect(page.getByTestId('auth-name-input')).not.toBeVisible()

    // Toggle to Sign Up
    await page.getByTestId('auth-toggle').click()

    // Submit button should say "Sign Up"
    await expect(page.getByTestId('auth-submit-button')).toHaveText('Sign Up')
    // Email and password fields remain visible
    await expect(page.getByTestId('auth-email-input')).toBeVisible()
    await expect(page.getByTestId('auth-password-input')).toBeVisible()
    // Toggle text should indicate switch back to Sign In
    await expect(page.getByTestId('auth-toggle')).toHaveText('Sign In')

    // Toggle back to Sign In
    await page.getByTestId('auth-toggle').click()
    await expect(page.getByTestId('auth-submit-button')).toHaveText('Sign In')
    await expect(page.getByTestId('auth-toggle')).toHaveText('Sign Up')
  })

  test('Sign Up form submits and requires email confirmation', async ({ page }) => {
    const email = uniqueEmail()

    await page.getByTestId('sign-in-button').click()
    await page.getByTestId('auth-toggle').click()

    // Fill out sign up form
    await page.getByTestId('auth-name-input').fill('New User')
    await page.getByTestId('auth-email-input').fill(email)
    await page.getByTestId('auth-password-input').fill('newpass123')
    await page.getByTestId('auth-submit-button').click()

    // In test mode (IS_TEST=true), signup auto-confirms and returns a session immediately
    // So the user should be authenticated
    await expect(page.getByTestId('user-name')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('user-name')).toHaveText('New User')
  })

  test('Logged in state shows avatar, name, and sign-out', async ({ page }) => {
    // Create account and sign in
    const email = uniqueEmail()

    await page.getByTestId('sign-in-button').click()
    await page.getByTestId('auth-toggle').click()
    await page.getByTestId('auth-name-input').fill('Logged In User')
    await page.getByTestId('auth-email-input').fill(email)
    await page.getByTestId('auth-password-input').fill('testpass123')
    await page.getByTestId('auth-submit-button').click()

    // Wait for authenticated state
    await expect(page.getByTestId('user-area')).toBeVisible({ timeout: 30000 })

    // Verify avatar (shows initial)
    await expect(page.getByTestId('user-avatar')).toBeVisible()
    await expect(page.getByTestId('user-avatar')).toHaveText('L')

    // Verify display name
    await expect(page.getByTestId('user-name')).toBeVisible()
    await expect(page.getByTestId('user-name')).toHaveText('Logged In User')

    // Verify sign-out button
    await expect(page.getByTestId('sign-out-button')).toBeVisible()

    // Sign In button should NOT be visible
    await expect(page.getByTestId('sign-in-button')).not.toBeVisible()
  })

  test('Clicking sign-out logs the user out', async ({ page }) => {
    // Create account and sign in
    const email = uniqueEmail()

    await page.getByTestId('sign-in-button').click()
    await page.getByTestId('auth-toggle').click()
    await page.getByTestId('auth-name-input').fill('Sign Out User')
    await page.getByTestId('auth-email-input').fill(email)
    await page.getByTestId('auth-password-input').fill('testpass123')
    await page.getByTestId('auth-submit-button').click()

    // Wait for authenticated state
    await expect(page.getByTestId('user-name')).toBeVisible({ timeout: 30000 })

    // Click sign out
    await page.getByTestId('sign-out-button').click()

    // User area should revert to showing Sign In button
    await expect(page.getByTestId('sign-in-button')).toBeVisible()

    // Avatar and name should not be visible
    await expect(page.getByTestId('user-avatar')).not.toBeVisible()
    await expect(page.getByTestId('user-name')).not.toBeVisible()

    // App should still function - sidebar and nav are still visible
    await expect(page.getByTestId('sidebar')).toBeVisible()
    await expect(page.getByTestId('sidebar-nav')).toBeVisible()

    // Navigation still works
    await page.getByTestId('nav-link-deals').click()
    await expect(page).toHaveURL(/\/deals$/)
    await expect(page.getByTestId('deals-list-page')).toBeVisible()
  })
})
