import { neon } from '@neondatabase/serverless'
import * as jose from 'jose'

const JWKS_URL = 'https://auth.nut.new/auth/v1/.well-known/jwks.json'

// Test mode EC key pair (P-256) — used when IS_TEST=true
// This is a fixed key pair used ONLY for test JWT signing/verification
const TEST_EC_PRIVATE_JWK = {
  kty: 'EC' as const,
  crv: 'P-256' as const,
  x: 'T7keXrICjriQzs6jXLJe1_S7Ga20VEJeeSfl7pODsBg',
  y: '2QoGUig5j0Ac9HxFzRiXFocrtc9SMQeDCN_0cFPsoKA',
  d: 'd4mqyRScgTukdLiA3nwN-Oan12YSSxm362ZGQtuH7ak',
}

const TEST_EC_PUBLIC_JWK = {
  kty: 'EC' as const,
  crv: 'P-256' as const,
  x: 'T7keXrICjriQzs6jXLJe1_S7Ga20VEJeeSfl7pODsBg',
  y: '2QoGUig5j0Ac9HxFzRiXFocrtc9SMQeDCN_0cFPsoKA',
}

let jwksPromise: ReturnType<typeof jose.createRemoteJWKSet> | null = null

function getJWKS() {
  if (!jwksPromise) {
    jwksPromise = jose.createRemoteJWKSet(new URL(JWKS_URL))
  }
  return jwksPromise
}

let testPublicKey: Awaited<ReturnType<typeof jose.importJWK>> | null = null

async function getTestPublicKey() {
  if (!testPublicKey) {
    testPublicKey = await jose.importJWK(TEST_EC_PUBLIC_JWK, 'ES256')
  }
  return testPublicKey
}

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

export interface UserRecord {
  id: string
  auth_user_id: string
  email: string
  name: string
  avatar_url: string
  provider: string
}

export interface AuthenticatedRequest extends Request {
  user: UserRecord
}

export function requiresAuth(
  handler: (req: AuthenticatedRequest) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing authorization token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.slice(7)

    try {
      let payload: jose.JWTPayload

      if (process.env.IS_TEST === 'true') {
        // Test mode: verify with local EC test key
        const key = await getTestPublicKey()
        const result = await jose.jwtVerify(token, key)
        payload = result.payload
      } else {
        // Production mode: verify with remote JWKS
        const JWKS = getJWKS()
        const result = await jose.jwtVerify(token, JWKS, {
          issuer: 'https://auth.nut.new/auth/v1',
        })
        payload = result.payload
      }

      const authUserId = payload.sub
      const email = (payload.email as string) || ''
      const userMetadata = (payload.user_metadata as Record<string, string>) || {}
      const appMetadata = (payload.app_metadata as Record<string, string>) || {}
      const name = userMetadata.full_name || userMetadata.name || email.split('@')[0] || 'User'
      const provider = appMetadata.provider || 'unknown'
      const avatarUrl = userMetadata.avatar_url || ''

      if (!authUserId) {
        return new Response(JSON.stringify({ error: 'Invalid token: missing sub' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const sql = getDb()
      const rows = await sql`
        INSERT INTO users (auth_user_id, email, name, provider, avatar_url)
        VALUES (${authUserId}::uuid, ${email}, ${name}, ${provider}, ${avatarUrl})
        ON CONFLICT (auth_user_id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          provider = EXCLUDED.provider,
          avatar_url = EXCLUDED.avatar_url,
          updated_at = NOW()
        RETURNING *
      `

      const user = rows[0] as UserRecord
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = user

      return handler(authenticatedReq)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      return new Response(JSON.stringify({ error: message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}

// Export test key for use in test helpers
export { TEST_EC_PRIVATE_JWK }
