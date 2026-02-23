/**
 * Global teardown for Playwright.
 * Branch cleanup and .env restoration are handled by scripts/test.ts,
 * so this is intentionally empty.
 */
export default async function globalTeardown() {
  // no-op — cleanup handled by test script
}
