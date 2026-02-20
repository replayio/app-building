# Strategy

You are writing playwright tests which check that all the different entries in docs/tests.md are satisfied by the app.

## Unpack Sub-Groups

Unpack the initial write tests job into groups using `add-group`. Add one group per page,
containing all test entries for that page:

```
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/build/writeTests.md" \
  --job "WriteTest<TestEntry1>: Write test for <TestEntry1>" \
  --job "WriteTest<TestEntry2>: Write test for <TestEntry2>" \
  --job "WriteTest<TestEntry3>: Write test for <TestEntry3>"
```

## Guidelines

- For a given test entry, write a playwright test which matches the entry's requirements and verifies that the app will behave as the user expects.
- Do not run the playwright tests, but make sure that the test should pass and update the app code if necessary.
- The title of the playwright test must match the title of the test entry.
- If you discover parts of the app that haven't been fully implemented, you must finish implementation of the app.
- Playwright tests and app components/pages must use data-testid to identify elements on the page.

## Directives

- Tests must verify navigation targets precisely — assert the URL or page content after a click, not just that a click handler exists. A link going to the wrong page is a common bug that only surfaces if the test checks where it actually lands.

- For actions that produce side effects (e.g. history entries, timeline updates), write assertions that verify both the primary effect and the side effect. Also assert the side effect happens exactly once — duplicate entries from redundant API calls are a common bug.

- Avoid using `getByText()` with common words that may appear as substrings in other elements (labels,
  options, buttons). Playwright's `getByText` is case-insensitive and uses substring matching by default.
  Prefer `getByTestId` for precise element targeting, or use `getByRole`/`getByLabel` with exact matching.
  A `strict mode violation: getByText(...) resolved to N elements` error means the selector is ambiguous —
  never work around it with `.first()`, instead use a more specific selector like `getByTestId` or
  `getByRole` with `{ exact: true }`.

- All `data-testid` values used across all test files for the same component must be consistent. Before
  writing cross-cutting tests that reference components tested in other spec files, read the existing
  spec files to use the same testid values.

- When the test spec entry describes file upload functionality (e.g., "file picker opens", "select a
  file to upload"), the test must exercise actual file upload mechanics (e.g., Playwright's
  `setInputFiles` on a file input). Do not substitute a URL/text input test for a file upload test —
  this masks missing upload functionality in the app.

- NEVER put Playwright locator calls with auto-wait semantics (e.g. `count()`, `textContent()`,
  `isVisible()`) inside a `.toPass()` retry block in a way that iterates over dynamic elements.
  If the DOM changes mid-iteration, an inner locator call will auto-wait for an element that no
  longer exists, and `.toPass()` cannot interrupt that inner wait to retry the block — the test
  deadlocks. Instead, use a single atomic Playwright assertion that has built-in retry:

  BAD — nested waits deadlock when DOM changes mid-loop:
  ```ts
  await expect(async () => {
    const cards = page.locator('[data-testid^="card-"]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).textContent(); // hangs if DOM shrinks
      if (text?.includes(name)) found = true;
    }
    expect(found).toBeFalsy();
  }).toPass({ timeout: 15000 });
  ```

  GOOD — single atomic assertion with built-in retry, no nested waits:
  ```ts
  await expect(
    page.locator('[data-testid^="card-"]').filter({ hasText: name })
  ).toHaveCount(0, { timeout: 15000 });
  ```

  The same principle applies to any `.toPass()` block: keep the body free of Playwright auto-waiting
  calls that can block indefinitely. Use locator chaining (`.filter()`, `.locator()`) and
  single-assertion expect matchers (`.toHaveCount()`, `.toContainText()`, `.toBeVisible()`) instead.

- Strategy files are at `/repo/strategies/jobs/` and its subdirectories (the repo root), NOT inside
  the app directory. Always use `/repo/strategies/jobs/build/writeTests.md`, etc.

- When a test spec entry describes editing or interacting with a specific field (e.g., "edit client
  field", "change value"), the test must exercise that exact field with corresponding actions and
  assertions. Do not write a test that only verifies a subset of the fields or operations mentioned
  in the spec entry — each described interaction must be tested. A common bug is implementing editing
  for some fields but not all; only per-field testing catches this.

- Apps with login/signup functionality must have a complete e2e test that exercises the full
  sign-up and sign-in flow against the real auth backend. The test must create a new account,
  verify the post-signup state (session established or confirmation required), then sign in
  with the new credentials and verify the authenticated state. This catches issues like email
  confirmation requirements, incorrect error handling, and session establishment failures that
  unit-level or mocked tests miss.

## Parallel Test Design

Tests run in parallel across multiple Playwright workers, each with its own isolated database branch.
Write tests with this in mind:

- Tests within the same spec file share a worker and therefore a database branch. Tests across
  different spec files may run in separate workers with separate databases.
- Tests that create, modify, or delete records must not rely on a fixed total count of records
  in the database (e.g., "expect 5 clients"). Other tests in the same worker may have already
  created or deleted records. Instead, assert on specific records by name/ID, or use relative
  assertions ("at least N", "contains this item").
- Tests that need a pristine dataset should create their own records in `beforeAll`/`beforeEach`
  and clean them up in `afterAll`/`afterEach`, rather than depending on the global seed data
  being unmodified.
- Never hardcode database IDs in tests. Query the UI or API to discover IDs for the records
  you need to interact with.
- The Playwright config must use `fullyParallel: true`. Do not set `workers: 1`.

## Tips

- Before writing tests that interact with shared UI components (ConfirmDialog, modals, dropdowns),
  read the shared component first to get the exact `data-testid` values. Do not guess test IDs.
- When adding `data-testid` attributes to a set of components for a page, plan ALL testid additions
  upfront by reading all components first, then make edits in batches. This avoids repeated re-reads
  and sequential small edits to the same file.
- When writing tests for a detail page, read: (1) the Netlify function for the entity, (2) the page
  component, (3) 2-3 representative section components. Do not exhaustively read every file in the app.
- If Playwright browser installation fails with permission errors, set `PLAYWRIGHT_BROWSERS_PATH` to
  a writable directory (e.g., `/home/node/.cache/ms-playwright`) before running `npx playwright install`.
