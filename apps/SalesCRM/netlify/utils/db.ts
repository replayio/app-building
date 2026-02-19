import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { resolve } from 'path'

let _testDbUrl: string | null = null

function getTestDbUrl(): string {
  if (_testDbUrl) return _testDbUrl
  // Try multiple paths since CWD varies between Netlify Dev sandbox and project root
  const candidates = [
    'tests/test-branch-data.json',
    resolve(process.cwd(), 'tests/test-branch-data.json'),
    resolve(process.cwd(), '../../tests/test-branch-data.json'),
  ]
  for (const p of candidates) {
    try {
      const data = JSON.parse(readFileSync(p, 'utf-8'))
      _testDbUrl = data.connectionUri
      return _testDbUrl!
    } catch {
      // try next
    }
  }
  throw new Error('IS_TEST is set but tests/test-branch-data.json not found in any expected location')
}

export function getDb() {
  const url = process.env.IS_TEST === 'true'
    ? getTestDbUrl()
    : process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}
