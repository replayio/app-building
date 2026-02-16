import { execSync } from 'child_process'
import * as jose from 'jose'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Same test key as in netlify/utils/auth.ts
const TEST_EC_PRIVATE_JWK = {
  kty: 'EC' as const,
  crv: 'P-256' as const,
  x: 'T7keXrICjriQzs6jXLJe1_S7Ga20VEJeeSfl7pODsBg',
  y: '2QoGUig5j0Ac9HxFzRiXFocrtc9SMQeDCN_0cFPsoKA',
  d: 'd4mqyRScgTukdLiA3nwN-Oan12YSSxm362ZGQtuH7ak',
}

// Fixed test user UUID
const TEST_USER_AUTH_ID = '00000000-0000-0000-0000-000000000001'

async function generateTestJWT(): Promise<string> {
  const privateKey = await jose.importJWK(TEST_EC_PRIVATE_JWK, 'ES256')

  const jwt = await new jose.SignJWT({
    sub: TEST_USER_AUTH_ID,
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
    },
    app_metadata: {
      provider: 'email',
    },
    role: 'authenticated',
  })
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(privateKey)

  return jwt
}

export default async function globalSetup() {
  console.log('Seeding database before tests...')
  execSync('npm run seed-db', { stdio: 'inherit', cwd: process.cwd() })

  console.log('Generating test auth token...')
  const testJWT = await generateTestJWT()

  // The Supabase JS client stores sessions under sb-<hostname-prefix>-auth-token
  // For https://auth.nut.new, hostname.split('.')[0] = 'auth'
  const supabaseStorageKey = 'sb-auth-auth-token'

  const supabaseSession = {
    access_token: testJWT,
    refresh_token: 'test-refresh-token',
    expires_in: 86400,
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    token_type: 'bearer',
    user: {
      id: TEST_USER_AUTH_ID,
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User',
      },
      app_metadata: {
        provider: 'email',
      },
      role: 'authenticated',
      aud: 'authenticated',
    },
  }

  // Write storageState file for Playwright
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:8888',
        localStorage: [
          {
            name: supabaseStorageKey,
            value: JSON.stringify(supabaseSession),
          },
        ],
      },
    ],
  }

  const storageStatePath = resolve(__dirname, 'test-storage-state.json')
  writeFileSync(storageStatePath, JSON.stringify(storageState, null, 2))
  console.log('Test auth storage state written to', storageStatePath)
}
