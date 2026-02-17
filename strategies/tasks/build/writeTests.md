# Strategy

You are writing playwright tests which check that all the different entries in docs/tests.md are satisfied by the app.

## Unpack Subtasks

Unpack the initial write tests task into WriteTest<Name> subtasks for every test entry name in docs/tests.md

IMPORTANT: The last subtask for the tests on each page must require committing and exiting afterwards.

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

- All `data-testid` values used across all test files for the same component must be consistent. Before
  writing cross-cutting tests that reference components tested in other spec files, read the existing
  spec files to use the same testid values.

- When the test spec entry describes file upload functionality (e.g., "file picker opens", "select a
  file to upload"), the test must exercise actual file upload mechanics (e.g., Playwright's
  `setInputFiles` on a file input). Do not substitute a URL/text input test for a file upload test —
  this masks missing upload functionality in the app.

- Strategy files are at `/repo/strategies/tasks/` and its subdirectories (the repo root), NOT inside
  the app directory. Always use `/repo/strategies/tasks/reviewChanges.md`,
  `/repo/strategies/tasks/build/writeTests.md`, etc.

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
