/**
 * check script: Runs typecheck and lint with autofix.
 * Quality gate that must pass before every commit.
 */

import { execSync } from 'child_process'

function main() {
  console.log('Running typecheck...')
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' })
  } catch {
    process.exit(1)
  }

  console.log('Running lint with autofix...')
  try {
    execSync('npx eslint . --fix', { stdio: 'inherit' })
  } catch {
    process.exit(1)
  }

  console.log('All checks passed.')
}

main()
