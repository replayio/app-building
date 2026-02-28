import { execSync } from 'child_process'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const appDir = join(import.meta.dirname, '..')
const logDir = join(appDir, 'logs')
const logFile = join(logDir, 'check.log')

mkdirSync(logDir, { recursive: true })

let log = ''
let failed = false
let failStep = ''

// Step 1: Typecheck
try {
  const result = execSync('npx tsc --noEmit', { cwd: appDir, encoding: 'utf-8', stdio: 'pipe' })
  log += '=== TYPECHECK ===\n' + result + '\n'
} catch (err: unknown) {
  const e = err as { stdout?: string; stderr?: string }
  log += '=== TYPECHECK (FAILED) ===\n' + (e.stdout || '') + '\n' + (e.stderr || '') + '\n'
  failed = true
  failStep = 'typecheck'
}

// Step 2: Lint (only if typecheck passed)
if (!failed) {
  try {
    const result = execSync('npx eslint . --fix', { cwd: appDir, encoding: 'utf-8', stdio: 'pipe' })
    log += '=== LINT ===\n' + result + '\n'
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string }
    log += '=== LINT (FAILED) ===\n' + (e.stdout || '') + '\n' + (e.stderr || '') + '\n'
    failed = true
    failStep = 'lint'
  }
}

writeFileSync(logFile, log)

if (failed) {
  console.log(`check failed (${failStep}) — see logs/check.log`)
  process.exit(1)
} else {
  console.log('check passed')
}
