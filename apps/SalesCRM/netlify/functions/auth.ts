import { getDb } from '../utils/db'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'
import * as jose from 'jose'
import { sendConfirmationEmail, sendPasswordResetEmail } from '../utils/email'

const TEST_JWT_SECRET = 'test-jwt-secret-for-playwright'

function getJwtSecret(): Uint8Array {
  if (process.env.IS_TEST === 'true') {
    return new TextEncoder().encode(TEST_JWT_SECRET)
  }
  const secret = process.env.JWT_SECRET || 'dev-jwt-secret-do-not-use-in-prod'
  return new TextEncoder().encode(secret)
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  const hashBuffer = Buffer.from(hash, 'hex')
  const derivedBuffer = scryptSync(password, salt, 64)
  return timingSafeEqual(hashBuffer, derivedBuffer)
}

async function generateToken(userId: string, email: string, name: string): Promise<string> {
  const secret = getJwtSecret()
  return new jose.SignJWT({ sub: userId, email, name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

function generateEmailToken(): string {
  return randomBytes(32).toString('hex')
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const action = url.searchParams.get('action')
  const headers = { 'Content-Type': 'application/json' }
  const isTest = process.env.IS_TEST === 'true'

  // GET ?action=me — returns current user from token
  if (req.method === 'GET' && action === 'me') {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers })
    }
    try {
      const secret = getJwtSecret()
      const { payload } = await jose.jwtVerify(authHeader.slice(7), secret)
      const authUserId = payload.sub
      const email = (payload.email as string) || ''
      const name = (payload.name as string) || email.split('@')[0] || 'User'

      const sql = getDb()
      const rows = await sql`
        INSERT INTO users (auth_user_id, email, name, provider)
        VALUES (${authUserId}::uuid, ${email}, ${name}, 'email')
        ON CONFLICT (auth_user_id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          updated_at = NOW()
        RETURNING id, email, name, avatar_url
      `
      return new Response(JSON.stringify(rows[0]), { status: 200, headers })
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers })
    }
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  }

  const sql = getDb()

  // POST ?action=confirm-email — confirm email with token
  if (action === 'confirm-email') {
    const body = await req.json() as { token?: string }
    const { token } = body
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), { status: 400, headers })
    }

    const rows = await sql`
      SELECT et.id AS token_id, et.user_id, et.expires_at, et.used_at, u.auth_user_id, u.email, u.name, u.avatar_url
      FROM email_tokens et
      JOIN users u ON u.id = et.user_id
      WHERE et.token = ${token} AND et.type = 'confirm'
    `
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or expired confirmation link' }), { status: 400, headers })
    }

    const row = rows[0]
    if (row.used_at) {
      return new Response(JSON.stringify({ error: 'This confirmation link has already been used' }), { status: 400, headers })
    }
    if (new Date(row.expires_at as string) < new Date()) {
      return new Response(JSON.stringify({ error: 'This confirmation link has expired' }), { status: 400, headers })
    }

    await sql`UPDATE email_tokens SET used_at = NOW() WHERE id = ${row.token_id}`
    await sql`UPDATE users SET email_confirmed = true, updated_at = NOW() WHERE id = ${row.user_id}`

    const jwtToken = await generateToken(row.auth_user_id as string, row.email as string, row.name as string)

    return new Response(JSON.stringify({
      access_token: jwtToken,
      user: { id: row.user_id, email: row.email, name: row.name, avatar_url: row.avatar_url },
    }), { status: 200, headers })
  }

  // POST ?action=forgot-password — send password reset email
  if (action === 'forgot-password') {
    const body = await req.json() as { email?: string }
    const { email } = body
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400, headers })
    }

    const userRows = await sql`SELECT id, email FROM users WHERE email = ${email}`
    if (userRows.length === 0) {
      return new Response(JSON.stringify({ message: 'If an account with that email exists, a password reset link has been sent.' }), { status: 200, headers })
    }

    const user = userRows[0]
    const token = generateEmailToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await sql`
      INSERT INTO email_tokens (user_id, token, type, expires_at)
      VALUES (${user.id}, ${token}, 'reset', ${expiresAt.toISOString()})
    `

    await sendPasswordResetEmail(user.email as string, token, req)

    return new Response(JSON.stringify({ message: 'If an account with that email exists, a password reset link has been sent.' }), { status: 200, headers })
  }

  // POST ?action=reset-password — reset password with token
  if (action === 'reset-password') {
    const body = await req.json() as { token?: string; password?: string }
    const { token, password } = body
    if (!token || !password) {
      return new Response(JSON.stringify({ error: 'Token and new password are required' }), { status: 400, headers })
    }
    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), { status: 400, headers })
    }

    const rows = await sql`
      SELECT et.id AS token_id, et.user_id, et.expires_at, et.used_at, u.auth_user_id, u.email, u.name, u.avatar_url
      FROM email_tokens et
      JOIN users u ON u.id = et.user_id
      WHERE et.token = ${token} AND et.type = 'reset'
    `
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or expired reset link' }), { status: 400, headers })
    }

    const row = rows[0]
    if (row.used_at) {
      return new Response(JSON.stringify({ error: 'This reset link has already been used' }), { status: 400, headers })
    }
    if (new Date(row.expires_at as string) < new Date()) {
      return new Response(JSON.stringify({ error: 'This reset link has expired' }), { status: 400, headers })
    }

    const passwordHash = hashPassword(password)
    await sql`UPDATE email_tokens SET used_at = NOW() WHERE id = ${row.token_id}`
    await sql`UPDATE users SET password_hash = ${passwordHash}, updated_at = NOW() WHERE id = ${row.user_id}`

    const jwtToken = await generateToken(row.auth_user_id as string, row.email as string, row.name as string)

    return new Response(JSON.stringify({
      access_token: jwtToken,
      user: { id: row.user_id, email: row.email, name: row.name, avatar_url: row.avatar_url },
    }), { status: 200, headers })
  }

  const body = await req.json() as { email?: string; password?: string }
  const { email, password } = body

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400, headers })
  }

  if (password.length < 6) {
    return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), { status: 400, headers })
  }

  // POST ?action=signup
  if (action === 'signup') {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: 'An account with this email already exists' }), { status: 409, headers })
    }

    const passwordHash = hashPassword(password)
    const name = email.split('@')[0] || 'User'
    const authUserId = crypto.randomUUID()

    // In test mode, auto-confirm and return session immediately
    if (isTest) {
      const rows = await sql`
        INSERT INTO users (auth_user_id, email, name, password_hash, provider, email_confirmed)
        VALUES (${authUserId}::uuid, ${email}, ${name}, ${passwordHash}, 'email', true)
        RETURNING id, auth_user_id, email, name, avatar_url
      `
      const user = rows[0]
      const token = await generateToken(user.auth_user_id as string, user.email as string, user.name as string)
      return new Response(JSON.stringify({
        access_token: token,
        user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
      }), { status: 201, headers })
    }

    // Production: create unconfirmed user and send confirmation email
    const rows = await sql`
      INSERT INTO users (auth_user_id, email, name, password_hash, provider, email_confirmed)
      VALUES (${authUserId}::uuid, ${email}, ${name}, ${passwordHash}, 'email', false)
      RETURNING id, auth_user_id, email, name, avatar_url
    `
    const user = rows[0]

    const confirmToken = generateEmailToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await sql`
      INSERT INTO email_tokens (user_id, token, type, expires_at)
      VALUES (${user.id}, ${confirmToken}, 'confirm', ${expiresAt.toISOString()})
    `

    await sendConfirmationEmail(email, confirmToken, req)

    return new Response(JSON.stringify({
      needsConfirmation: true,
      message: 'Please check your email to confirm your account before signing in.',
    }), { status: 201, headers })
  }

  // POST ?action=login
  if (action === 'login') {
    const rows = await sql`
      SELECT id, auth_user_id, email, name, avatar_url, password_hash, email_confirmed
      FROM users WHERE email = ${email}
    `
    if (rows.length === 0 || !rows[0].password_hash) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401, headers })
    }

    const user = rows[0]
    if (!verifyPassword(password, user.password_hash as string)) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401, headers })
    }

    // In production, require email confirmation before login
    if (!isTest && !user.email_confirmed) {
      return new Response(JSON.stringify({ error: 'Please confirm your email before signing in. Check your inbox for the confirmation link.' }), { status: 403, headers })
    }

    const token = await generateToken(user.auth_user_id as string, user.email as string, user.name as string)

    return new Response(JSON.stringify({
      access_token: token,
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
    }), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers })
}
