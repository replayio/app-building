import { execSync } from 'child_process'

function run(cmd: string, label: string): void {
  console.log(`\n--- ${label} ---\n`)
  try {
    execSync(cmd, { stdio: 'inherit', cwd: import.meta.dirname + '/..' })
  } catch {
    console.error(`\n${label} failed.`)
    process.exit(1)
  }
}

run('npx tsc --noEmit', 'Typecheck')
run('npx eslint . --fix', 'Lint')

console.log('\nAll checks passed.')
