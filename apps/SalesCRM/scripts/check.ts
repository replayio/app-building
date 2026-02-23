import { execSync } from 'child_process'

try {
  console.log('Running typecheck...')
  execSync('npx tsc --noEmit', { stdio: 'inherit' })
} catch {
  process.exit(1)
}

try {
  console.log('Running lint...')
  execSync('npx eslint . --fix', { stdio: 'inherit' })
} catch {
  process.exit(1)
}

console.log('All checks passed.')
