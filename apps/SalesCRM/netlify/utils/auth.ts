import { neon } from '@neondatabase/serverless'
import * as jose from 'jose'

// Test mode: fixed HMAC secret for Playwright test JWTs
const TEST_JWT_SECRET = 'test-jwt-secret-for-playwright'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

function getJwtSecret(): Uint8Array {
  if (process.env.IS_TEST === 'true') {
    return new TextEncoder().encode(TEST_JWT_SECRET)
  }
  const secret = process.env.JWT_SECRET || 'dev-jwt-secret-do-not-use-in-prod'
  return new TextEncoder().encode(secret)
}

export interface UserRecord {
  id: string
  auth_user_id: string
  email: string
  name: string
  avatar_url: string
  provider: string
}

export interface OptionalAuthRequest extends Request {
  user: UserRecord | null
}

export function optionalAuth(
  handler: (req: OptionalAuthRequest) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    const authReq = req as OptionalAuthRequest
    authReq.user = null

    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      try {
        const secret = getJwtSecret()
        const { payload } = await jose.jwtVerify(token, secret)

        const authUserId = payload.sub
        const email = (payload.email as string) || ''
        const name = (payload.name as string) || email.split('@')[0] || 'User'

        if (authUserId) {
          const sql = getDb()
          const rows = await sql`
            INSERT INTO users (auth_user_id, email, name, provider)
            VALUES (${authUserId}::uuid, ${email}, ${name}, 'email')
            ON CONFLICT (auth_user_id) DO UPDATE SET
              email = EXCLUDED.email,
              name = EXCLUDED.name,
              updated_at = NOW()
            RETURNING *
          `
          authReq.user = rows[0] as UserRecord
        }
      } catch {
        // Invalid token — proceed without auth
      }
    }

    return handler(authReq)
  }
}

export function requiresAuth(
  handler: (req: OptionalAuthRequest) => Promise<Response>
) {
  return optionalAuth(async (req: OptionalAuthRequest) => {
    if (!req.user) {
      return new Response(JSON.stringify({ error: 'Missing authorization token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return handler(req)
  })
}

export { TEST_JWT_SECRET }
