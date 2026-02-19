import { getDb } from '../utils/db'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'
import * as jose from 'jose'

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

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const action = url.searchParams.get('action')
  const headers = { 'Content-Type': 'application/json' }

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

  const body = await req.json() as { email?: string; password?: string }
  const { email, password } = body

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400, headers })
  }

  if (password.length < 6) {
    return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), { status: 400, headers })
  }

  const sql = getDb()

  // POST ?action=signup
  if (action === 'signup') {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: 'An account with this email already exists' }), { status: 409, headers })
    }

    const passwordHash = hashPassword(password)
    const name = email.split('@')[0] || 'User'
    const authUserId = crypto.randomUUID()

    const rows = await sql`
      INSERT INTO users (auth_user_id, email, name, password_hash, provider)
      VALUES (${authUserId}::uuid, ${email}, ${name}, ${passwordHash}, 'email')
      RETURNING id, auth_user_id, email, name, avatar_url
    `
    const user = rows[0]
    const token = await generateToken(user.auth_user_id as string, user.email as string, user.name as string)

    return new Response(JSON.stringify({
      access_token: token,
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
    }), { status: 201, headers })
  }

  // POST ?action=login
  if (action === 'login') {
    const rows = await sql`
      SELECT id, auth_user_id, email, name, avatar_url, password_hash
      FROM users WHERE email = ${email}
    `
    if (rows.length === 0 || !rows[0].password_hash) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401, headers })
    }

    const user = rows[0]
    if (!verifyPassword(password, user.password_hash as string)) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401, headers })
    }

    const token = await generateToken(user.auth_user_id as string, user.email as string, user.name as string)

    return new Response(JSON.stringify({
      access_token: token,
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
    }), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Invalid action. Use ?action=signup, ?action=login, or ?action=me' }), { status: 400, headers })
}
