import { test, expect } from '@playwright/test'

test.describe('ResetPasswordPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/reset-password?token=testtoken')
    await expect(page.getByTestId('reset-password-page')).toBeVisible()
  })

  test('Reset password form displays password input, confirm password input, and submit button', async ({ page }) => {
    // Verify page heading
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible()

    // Verify password input with placeholder
    const passwordInput = page.getByTestId('reset-password-input')
    await expect(passwordInput).toBeVisible()
    await expect(passwordInput).toHaveAttribute('placeholder', 'New password')

    // Verify confirm password input with placeholder
    const confirmInput = page.getByTestId('reset-confirm-input')
    await expect(confirmInput).toBeVisible()
    await expect(confirmInput).toHaveAttribute('placeholder', 'Confirm password')

    // Verify submit button
    const submitButton = page.getByTestId('reset-submit-button')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toHaveText('Reset Password')
  })

  test('Submitting mismatched passwords shows validation error', async ({ page }) => {
    // Fill mismatched passwords
    await page.getByTestId('reset-password-input').fill('password123')
    await page.getByTestId('reset-confirm-input').fill('password456')
    await page.getByTestId('reset-submit-button').click()

    // Error message should be displayed
    await expect(page.getByTestId('reset-error-message')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('reset-error-message')).toHaveText('Passwords do not match')

    // Form should still be visible
    await expect(page.getByTestId('reset-password-input')).toBeVisible()
    await expect(page.getByTestId('reset-confirm-input')).toBeVisible()
    await expect(page.getByTestId('reset-submit-button')).toBeVisible()
  })

  test('Successful password reset navigates to /clients', async ({ page }) => {
    // Intercept the API call to return success
    await page.route('**/.netlify/functions/auth', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password reset successfully.' }),
      })
    })

    // Fill matching passwords and submit
    await page.getByTestId('reset-password-input').fill('newpassword123')
    await page.getByTestId('reset-confirm-input').fill('newpassword123')
    await page.getByTestId('reset-submit-button').click()

    // Should navigate to /clients
    await expect(page).toHaveURL(/\/clients/, { timeout: 30000 })
  })

  test('Submit button shows loading state during submission', async ({ page }) => {
    // Intercept the API call to delay the response
    await page.route('**/.netlify/functions/auth', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password reset successfully.' }),
      })
    })

    // Fill matching passwords
    await page.getByTestId('reset-password-input').fill('newpassword123')
    await page.getByTestId('reset-confirm-input').fill('newpassword123')

    // Click submit and immediately check loading state
    await page.getByTestId('reset-submit-button').click()

    // Button should show loading text and be disabled
    await expect(page.getByTestId('reset-submit-button')).toHaveText('Resetting...')
    await expect(page.getByTestId('reset-submit-button')).toBeDisabled()

    // After response, should navigate to /clients
    await expect(page).toHaveURL(/\/clients/, { timeout: 30000 })
  })

  test('Error message displayed on server error', async ({ page }) => {
    // Intercept the API call to return an error
    await page.route('**/.netlify/functions/auth', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid or expired token' }),
      })
    })

    // Fill matching passwords and submit
    await page.getByTestId('reset-password-input').fill('newpassword123')
    await page.getByTestId('reset-confirm-input').fill('newpassword123')
    await page.getByTestId('reset-submit-button').click()

    // Error message should be displayed
    await expect(page.getByTestId('reset-error-message')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('reset-error-message')).toHaveText('Invalid or expired token')

    // Form should still be visible for retry
    await expect(page.getByTestId('reset-password-input')).toBeVisible()
    await expect(page.getByTestId('reset-confirm-input')).toBeVisible()
    await expect(page.getByTestId('reset-submit-button')).toBeVisible()
  })

  test('Error message displayed on network failure', async ({ page }) => {
    // Intercept the API call to simulate network failure
    await page.route('**/.netlify/functions/auth', async (route) => {
      await route.abort('connectionfailed')
    })

    // Fill matching passwords and submit
    await page.getByTestId('reset-password-input').fill('newpassword123')
    await page.getByTestId('reset-confirm-input').fill('newpassword123')
    await page.getByTestId('reset-submit-button').click()

    // Network error message should be displayed
    await expect(page.getByTestId('reset-error-message')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('reset-error-message')).toHaveText('Network error')

    // Form should still be visible for retry
    await expect(page.getByTestId('reset-password-input')).toBeVisible()
    await expect(page.getByTestId('reset-confirm-input')).toBeVisible()
    await expect(page.getByTestId('reset-submit-button')).toBeVisible()
  })
})
