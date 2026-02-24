import { test, expect } from '@playwright/test'

test.describe('ForgotPasswordPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await expect(page.getByTestId('forgot-password-page')).toBeVisible()
  })

  test('Forgot password form displays email input and submit button', async ({ page }) => {
    // Verify page heading
    await expect(page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible()

    // Verify email input with placeholder
    const emailInput = page.getByTestId('forgot-email-input')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('placeholder', 'Enter your email')

    // Verify submit button
    const submitButton = page.getByTestId('forgot-submit-button')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toHaveText('Send Reset Link')
  })

  test('Submitting email shows success message', async ({ page }) => {
    // Fill email and submit
    await page.getByTestId('forgot-email-input').fill('test@example.com')
    await page.getByTestId('forgot-submit-button').click()

    // Success message should appear
    await expect(page.getByTestId('reset-email-sent')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('reset-email-sent')).toHaveText(
      'If an account exists with that email, a password reset link has been sent.'
    )

    // Form should no longer be visible
    await expect(page.getByTestId('forgot-email-input')).not.toBeVisible()
    await expect(page.getByTestId('forgot-submit-button')).not.toBeVisible()
  })

  test('Submit button shows loading state during submission', async ({ page }) => {
    // Fill email
    await page.getByTestId('forgot-email-input').fill('test@example.com')

    // Intercept the API call to delay the response
    await page.route('**/.netlify/functions/auth', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'If the email exists, a reset link has been sent.' }),
      })
    })

    // Click submit and immediately check loading state
    await page.getByTestId('forgot-submit-button').click()

    // Button should show loading text and be disabled
    await expect(page.getByTestId('forgot-submit-button')).toHaveText('Sending...')
    await expect(page.getByTestId('forgot-submit-button')).toBeDisabled()

    // After response, success message should appear
    await expect(page.getByTestId('reset-email-sent')).toBeVisible({ timeout: 30000 })
  })

  test('Error message displayed on server error', async ({ page }) => {
    // Intercept the API call to return an error
    await page.route('**/.netlify/functions/auth', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to send reset email' }),
      })
    })

    // Fill email and submit
    await page.getByTestId('forgot-email-input').fill('test@example.com')
    await page.getByTestId('forgot-submit-button').click()

    // Error message should be displayed
    await expect(page.getByTestId('forgot-error-message')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('forgot-error-message')).toHaveText('Failed to send reset email')

    // Form should still be visible for retry
    await expect(page.getByTestId('forgot-email-input')).toBeVisible()
    await expect(page.getByTestId('forgot-submit-button')).toBeVisible()

    // Error should disappear on re-submit (unroute to allow real request)
    await page.unroute('**/.netlify/functions/auth')
    await page.getByTestId('forgot-submit-button').click()
    await expect(page.getByTestId('forgot-error-message')).not.toBeVisible({ timeout: 30000 })
  })

  test('Error message displayed on network failure', async ({ page }) => {
    // Intercept the API call to simulate network failure
    await page.route('**/.netlify/functions/auth', async (route) => {
      await route.abort('connectionfailed')
    })

    // Fill email and submit
    await page.getByTestId('forgot-email-input').fill('test@example.com')
    await page.getByTestId('forgot-submit-button').click()

    // Network error message should be displayed
    await expect(page.getByTestId('forgot-error-message')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('forgot-error-message')).toHaveText('Network error')

    // Form should still be visible for retry
    await expect(page.getByTestId('forgot-email-input')).toBeVisible()
    await expect(page.getByTestId('forgot-submit-button')).toBeVisible()
  })
})
