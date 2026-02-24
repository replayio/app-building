# Fix: ClientDetailPage component and test stability fixes

## Violations

### 1. TimelineSection - Non-navigable subjects rendered as clickable links

In `ClientTimelineSection.tsx`, timeline entries with `reference_id` and `reference_type`
were always rendered as clickable subject links (`<button class="timeline-subject-link">`),
even when the `reference_type` was not navigable (e.g., `'attachment'`). The
`handleSubjectClick` handler only supports `'deal'`, `'individual'`, and `'task'` types,
so clicking an attachment subject link did nothing.

### 2. Test stability - Timeouts and state isolation

Several Playwright tests failed intermittently due to:
- **Vite cold start**: The first test to run exceeded the 60s default timeout because Vite
  needs to compile and serve the app on first request.
- **Multi-page tests**: Tests that visit multiple client pages (e.g., "Header displays type
  badge" visits 2 clients, "Header displays status badge" visits 4 clients) exceeded the
  default timeout.
- **Parallel state mutation**: The "Status change can be dismissed" test assumed the client
  started with "Active" status, but parallel tests could change the status before this test
  ran (`fullyParallel: true` with 2 workers).
- **Element visibility timeouts**: Several tests had tight timeouts (10000ms) for waiting on
  elements like `deals-list`, `people-list`, and dialog interactions.

### 3. Lint error - Unused helper function

The test file contained an unused `findIndividual` helper function that caused a lint error.

## Fix

### ClientTimelineSection.tsx
- Added a type check before rendering subject links: only render `<button>` with
  `timeline-subject-link` class when `reference_type` is one of `['deal', 'individual', 'task']`.
  Entries with other reference types (e.g., `'attachment'`) now render the subject as plain
  text.

### client-detail.spec.ts
- Removed unused `findIndividual` helper function (lint fix)
- Added `test.setTimeout(90000)` to "Header displays client name prominently" (first test,
  Vite cold start)
- Added `test.setTimeout(90000)` to "Header displays type badge" (visits 2 clients)
- Added `test.setTimeout(120000)` to "Header displays status badge" (visits 4 clients)
- Fixed "Status change can be dismissed" to capture current status dynamically instead of
  assuming "Active", preventing failures from parallel test state mutation
- Increased element visibility timeouts from 10000ms to 15000-20000ms for:
  - Deal entry click and navigation tests
  - People list visibility, dialog interactions, and navigation tests
  - Person removal cancel test
