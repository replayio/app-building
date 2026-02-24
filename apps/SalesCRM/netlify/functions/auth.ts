import type { Context } from '@netlify/functions'
import { neon } from '@neondatabase/serverless'
import jwt from 'jsonwebtoken'
import { createHash, randomBytes } from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })
}

function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
  } catch {
    return null
  }
}

export default async function handler(req: Request, context: Context) {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const sql = neon(databaseUrl)
  const url = new URL(req.url)

  // GET /auth?action=me - Get current user from token
  if (req.method === 'GET') {
    const action = url.searchParams.get('action')
    if (action === 'me') {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'No token provided' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const token = authHeader.slice(7)
      const decoded = verifyToken(token)
      if (!decoded) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const rows = await sql`SELECT id, email, name FROM users WHERE id = ${decoded.userId}`
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ user: rows[0] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // POST /auth - Sign in, sign up, forgot password, etc.
  if (req.method === 'POST') {
    const body = await req.json()
    const { action, email, password, name } = body as {
      action: string
      email?: string
      password?: string
      name?: string
    }

    if (action === 'signin') {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const rows = await sql`SELECT id, email, name, password_hash FROM users WHERE email = ${email}`
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const user = rows[0]
      if (!verifyPassword(password, user.password_hash)) {
        return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const token = generateToken(user.id, user.email)
      return new Response(
        JSON.stringify({
          user: { id: user.id, email: user.email, name: user.name },
          token,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }

    if (action === 'signup') {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Check if user already exists
      const existing = await sql`SELECT id FROM users WHERE email = ${email}`
      if (existing.length > 0) {
        return new Response(JSON.stringify({ error: 'Email already in use' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const passwordHash = hashPassword(password)
      const displayName = name || email.split('@')[0]

      const inserted = await sql`
        INSERT INTO users (name, email, password_hash)
        VALUES (${displayName}, ${email}, ${passwordHash})
        RETURNING id, email, name
      `

      const user = inserted[0]
      const isTest = process.env.IS_TEST === 'true'

      if (isTest) {
        // In test mode, auto-confirm and return session immediately
        const token = generateToken(user.id, user.email)
        return new Response(
          JSON.stringify({
            user: { id: user.id, email: user.email, name: user.name },
            token,
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        )
      }

      // In production mode, create confirmation token and require email confirmation
      const confirmToken = randomBytes(32).toString('hex')
      await sql`
        INSERT INTO email_tokens (user_id, token, type, expires_at)
        VALUES (${user.id}, ${confirmToken}, 'confirmation', NOW() + INTERVAL '24 hours')
      `

      return new Response(
        JSON.stringify({
          message: 'Please check your email to confirm your account.',
          user: { id: user.id, email: user.email, name: user.name },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      )
    }

    if (action === 'forgot-password') {
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const rows = await sql`SELECT id FROM users WHERE email = ${email}`
      // Always return success to avoid email enumeration
      if (rows.length > 0) {
        const resetToken = randomBytes(32).toString('hex')
        await sql`
          INSERT INTO email_tokens (user_id, token, type, expires_at)
          VALUES (${rows[0].id}, ${resetToken}, 'reset', NOW() + INTERVAL '1 hour')
        `
      }

      return new Response(
        JSON.stringify({ message: 'If the email exists, a reset link has been sent.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }

    if (action === 'confirm-email') {
      const { token } = body as { token?: string }
      if (!token) {
        return new Response(JSON.stringify({ error: 'Token required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const rows = await sql`
        SELECT id, user_id FROM email_tokens
        WHERE token = ${token} AND type = 'confirmation' AND used_at IS NULL AND expires_at > NOW()
      `

      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      await sql`UPDATE email_tokens SET used_at = NOW() WHERE id = ${rows[0].id}`

      const userRows = await sql`SELECT id, email, name FROM users WHERE id = ${rows[0].user_id}`
      const user = userRows[0]
      const authToken = generateToken(user.id, user.email)

      return new Response(
        JSON.stringify({ message: 'Email confirmed successfully.', token: authToken, user: { id: user.id, email: user.email, name: user.name } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }

    if (action === 'reset-password') {
      const { token, newPassword } = body as { token?: string; newPassword?: string }
      if (!token || !newPassword) {
        return new Response(JSON.stringify({ error: 'Token and new password required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const rows = await sql`
        SELECT id, user_id FROM email_tokens
        WHERE token = ${token} AND type = 'reset' AND used_at IS NULL AND expires_at > NOW()
      `

      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const passwordHash = hashPassword(newPassword)
      await sql`UPDATE users SET password_hash = ${passwordHash}, updated_at = NOW() WHERE id = ${rows[0].user_id}`
      await sql`UPDATE email_tokens SET used_at = NOW() WHERE id = ${rows[0].id}`

      return new Response(
        JSON.stringify({ message: 'Password reset successfully.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  })
}
