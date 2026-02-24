import { test, expect } from '@playwright/test'
import { neon } from '@neondatabase/serverless'
import { createHash, randomBytes } from 'crypto'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

function getDb() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL not set')
  return neon(databaseUrl)
}

async function createUserWithConfirmToken(sql: ReturnType<typeof neon>) {
  const uniqueEmail = `confirm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`
  const passwordHash = hashPassword('testpass123')
  const result = await sql`
    INSERT INTO users (name, email, password_hash)
    VALUES ('Confirm Test User', ${uniqueEmail}, ${passwordHash})
    RETURNING id, email, name
  `
  const user = result[0]

  const confirmToken = randomBytes(32).toString('hex')
  await sql`
    INSERT INTO email_tokens (user_id, token, type, expires_at)
    VALUES (${user.id}, ${confirmToken}, 'confirmation', NOW() + INTERVAL '24 hours')
  `

  return { user, confirmToken }
}

test.describe('ConfirmEmailPage', () => {
  test('Loading state displayed while confirming email with token', async ({ page }) => {
    // Delay the API response to observe the loading state
    await page.route('**/.netlify/functions/auth', async (route) => {
      await new Promise((r) => setTimeout(r, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Email confirmed successfully.', token: 'fake-jwt' }),
      })
    })

    await page.goto('/auth/confirm-email?token=sometoken')

    // Loading message should be visible
    await expect(page.getByTestId('confirm-loading')).toBeVisible()
    await expect(page.getByTestId('confirm-loading')).toHaveText('Confirming your email...')
  })

  test('Successful confirmation shows success message and redirects to /clients', async ({ page }) => {
    test.slow()

    const sql = getDb()
    const { confirmToken } = await createUserWithConfirmToken(sql)

    // Navigate with the real token — exercises the real production confirm-email code path
    await page.goto(`/auth/confirm-email?token=${confirmToken}`)

    // Verify success message
    await expect(page.getByTestId('confirm-success')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('confirm-success')).toHaveText('Email confirmed! Redirecting...')

    // Verify redirect to /clients
    await expect(page).toHaveURL(/\/clients/, { timeout: 30000 })
  })

  test('Missing token shows error message', async ({ page }) => {
    await page.goto('/auth/confirm-email')

    // Error should appear immediately (no API call made)
    await expect(page.getByTestId('confirm-error')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('confirm-error')).toHaveText('No confirmation token provided')
  })

  test('Invalid or expired token shows error message', async ({ page }) => {
    // Navigate with a token that doesn't exist in the DB — exercises real backend validation
    await page.goto('/auth/confirm-email?token=invalidtoken123')

    await expect(page.getByTestId('confirm-error')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('confirm-error')).toHaveText('Invalid or expired token')
  })

  test('Network error shows error message', async ({ page }) => {
    // Simulate network failure
    await page.route('**/.netlify/functions/auth', async (route) => {
      await route.abort('connectionfailed')
    })

    await page.goto('/auth/confirm-email?token=sometoken')

    await expect(page.getByTestId('confirm-error')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('confirm-error')).toHaveText('Network error')
  })

  test('Auto-login after successful confirmation stores auth token', async ({ page }) => {
    test.slow()

    const sql = getDb()
    const { confirmToken } = await createUserWithConfirmToken(sql)

    // Navigate with the real token — exercises the real production confirm-email code path
    await page.goto(`/auth/confirm-email?token=${confirmToken}`)

    // Wait for success and redirect
    await expect(page.getByTestId('confirm-success')).toBeVisible({ timeout: 30000 })
    await expect(page).toHaveURL(/\/clients/, { timeout: 30000 })

    // Verify localStorage has the auth token
    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).toBeTruthy()

    // Verify user is logged in — sidebar shows user info instead of Sign In button
    await expect(page.getByTestId('user-name')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('user-name')).toHaveText('Confirm Test User')
    await expect(page.getByTestId('sign-out-button')).toBeVisible()
    await expect(page.getByTestId('sign-in-button')).not.toBeVisible()
  })
})
