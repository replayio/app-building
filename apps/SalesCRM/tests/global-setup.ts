import { execSync } from 'child_process'

export default function globalSetup() {
  console.log('Seeding database before tests...')
  execSync('npm run seed-db', { stdio: 'inherit', cwd: process.cwd() })
}
