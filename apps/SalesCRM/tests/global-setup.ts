import * as jose from 'jose'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Same test secret as in netlify/utils/auth.ts (TEST_JWT_SECRET)
const TEST_JWT_SECRET = 'test-jwt-secret-for-playwright'

// Fixed test user UUID (used as auth_user_id)
const TEST_USER_AUTH_ID = '00000000-0000-0000-0000-000000000001'

async function generateTestJWT(): Promise<string> {
  const secret = new TextEncoder().encode(TEST_JWT_SECRET)

  return new jose.SignJWT({
    sub: TEST_USER_AUTH_ID,
    email: 'test@example.com',
    name: 'Test User',
    role: 'authenticated',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export default async function globalSetup() {
  // Generate test JWT
  console.log('Generating test auth token...')
  const testJWT = await generateTestJWT()

  // Write storageState file for Playwright
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:8888',
        localStorage: [
          {
            name: 'auth-token',
            value: testJWT,
          },
        ],
      },
    ],
  }

  const storageStatePath = resolve(__dirname, 'test-storage-state.json')
  writeFileSync(storageStatePath, JSON.stringify(storageState, null, 2))
  console.log('Test auth storage state written to', storageStatePath)
}
