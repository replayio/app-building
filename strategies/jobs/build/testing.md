# Strategy

You will run all the tests in the app and get them to pass..

## Unpack Sub-Groups

Unpack the initial testing job into a single group:

```
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/build/testing.md" \
  --job "FixTests: Get all tests passing"
```

After running tests and there are failures, pick specific failing tests and add a group to fix
them without regressing any tests that passed in previous runs:

```
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/build/testing.md" \
  --job "Fix: <failing test name 1>" \
  --job "Fix: <failing test name 2>"
```

## Requirements

Once all playwright tests have been written, you must get them to pass.
When getting tests to pass, you must ensure the app is actually working.
You must not paper over problems in the app by hard-coding values,
disabling test functionality, and so on.

You might encounter bugs in the tests and can fix those, but you must ensure
that the test is correctly exercising the app as described in the corresponding
entry in tests.md

You MUST read these skill files before testing.

https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-cli/SKILL.md
https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-mcp/SKILL.md

RECORD_REPLAY_API_KEY is already set in the environment for using the Replay CLI.

## Replay.io Playwright Installation and Configuration

Every app MUST use the Replay browser to record Playwright test runs. This section describes
the exact installation steps and configuration required.

### 1. Install dependencies

The app's `package.json` must include these dev dependencies:

```bash
npm install --save-dev @[REDACTED]io/playwright @playwright/test
```

`@[REDACTED]io/playwright` (currently v5.0.1) provides the `[REDACTED]Reporter` and `devices` exports
for integrating Replay recordings into Playwright.

### 2. Install the Replay browser

Run once in the container (or as part of CI setup):

```bash
npx [REDACTED]io install
```

This downloads the Replay Chromium browser to `~/.[REDACTED]/runtimes/chrome-linux/chrome`.
Verify it exists:

```bash
ls ~/.[REDACTED]/runtimes/chrome-linux/chrome
```

### 3. API key

`RECORD_REPLAY_API_KEY` must be set in the environment. It is already available in this
container. The Playwright config passes it to the reporter via:

```ts
apiKey: process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY
```

### 4. Playwright config

The Playwright config MUST:

1. Import BOTH `[REDACTED]Reporter` and `devices as [REDACTED]Devices` from `@[REDACTED]io/playwright`.
2. Include `[REDACTED]Reporter(...)` in the `reporter` array with `upload: false`. Uploads are
   handled by the test script, NOT by the reporter.
3. Spread `[REDACTED]Devices['Replay Chromium']` into the global `use` config. This sets
   `executablePath`, `RECORD_ALL_CONTENT`, and critically `RECORD_REPLAY_METADATA_FILE` which
   is required for the reporter to attach test metadata (pass/fail result) to recordings.
   Without `RECORD_REPLAY_METADATA_FILE`, the recording driver cannot read the per-test
   metadata written by the fixture, and all recordings will have empty `testResult`.

**IMPORTANT**: Do NOT manually set `launchOptions.executablePath` and `env` instead of using
`[REDACTED]Devices['Replay Chromium']`. Manual config misses `RECORD_REPLAY_METADATA_FILE`,
which breaks the recording-to-test metadata association.

Example:

```ts
import { defineConfig, devices } from '@playwright/test';
import { devices as [REDACTED]Devices, [REDACTED]Reporter } from '@[REDACTED]io/playwright';

export default defineConfig({
  reporter: [
    [REDACTED]Reporter({
      apiKey: process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY,
      upload: false,
    }),
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  use: {
    ...[REDACTED]Devices['Replay Chromium'],
  },
});
```

### 5. Replay CLI commands reference

- `npx [REDACTED]io list` — List all local recordings (ID, host, date, duration, status).
- `npx [REDACTED]io list --json` — Full JSON metadata for all recordings. Each entry includes:
  `id`, `buildId`, `date`, `duration`, `metadata` (host, URI, sourceMaps, processType),
  `path`, `recordingStatus` (one of `"recording"`, `"finished"`, `"crashed"`).
- `npx [REDACTED]io upload <id>` — Upload a single recording by ID. Returns the viewable URL.
- `npx [REDACTED]io upload --all` — Upload all local recordings.
- `npx [REDACTED]io remove --all` — Delete all local recordings (use between runs to avoid stale
  data accumulating).

### 6. OpenSSL 1.1 requirement

The Replay browser's recording driver requires `libcrypto.so.1.1` (OpenSSL 1.1). If the
container only has OpenSSL 3, the browser will run but silently fail to record (no error in
test output, just `DoLoadDriverHandle: dlopen failed` in stderr). Fix: download Ubuntu 18.04's
`libssl1.1` deb, extract it, and set `LD_LIBRARY_PATH` to point at the extracted libs. See
the deployment Playwright config for a working example.

## Running Tests

Run tests via `npm run test <testFile>` from the app directory (see `strategies/scripts/test.md`
for the full script specification). Do NOT manually run playwright or start dev servers.

- Write the results to a logs/test-run-N.log file.
- Tests MUST run in parallel with multiple workers (use `fullyParallel: true` in playwright config).

## Debugging

When tests fail, you MUST follow this process for each distinct failure. Every step is
mandatory — do NOT skip or reorder steps.

1. Announce `ANALYZING TEST FAILURE: <test name>`.
2. Find the uploaded recording IDs in the `npm run test` output. The test script automatically
   uploads failed recordings and logs full metadata for each one. Look for the
   `=== REPLAY RECORDINGS METADATA ===` block and the `REPLAY UPLOADED: <recordingId>` lines
   in the output. Choose the recording whose URI and duration best match the failing test. If
   the upload did not happen (e.g., the script was misconfigured), use
   `npx [REDACTED]io list --json` to find recordings and upload them manually:
   `npx [REDACTED]io upload <id>`.
3. Announce `TEST FAILURE UPLOADED: <recordingId>` before doing anything else.
4. Use Replay MCP tools to analyze the failure. Pick the tool that fits the failure:
   `PlaywrightSteps`, `ConsoleMessages`, `NetworkRequest`, `SearchSources`, `Logpoint`,
   `Evaluate`, `GetStack`, `ReactComponents`, `Screenshot`, etc. Use as many as needed to
   understand what actually happened before making any changes.
5. Write a bug writeup to `docs/bugs/<TestName>.md` following the investigative template below.
   You MUST fill in every section before making any code changes.
6. Only after completing the Replay analysis AND the bug writeup, fix the test and/or app based
   on what you found.

### Bug Writeup Template

For each test failure, create `docs/bugs/<TestName>.md` with exactly this structure:

```
# Bug: <test name>

## Step 1: Evidence

Evidence the app is broken: <describe concrete evidence from Replay analysis — wrong API
responses, incorrect state, missing data, UI rendering issues, etc. Write "None found" if
no evidence.>

Evidence the test is broken: <describe concrete evidence from Replay analysis — wrong
selectors, bad assertions, race conditions, incorrect test data expectations, etc. Write
"None found" if no evidence.>

## Step 2: Determination

Which is broken: <APP or TEST>

## Step 3: Root Cause

<Completely explain the cause of the problem in the app or test. Include the specific file(s),
function(s), and line(s) involved. Explain WHY the code is wrong, not just WHAT is wrong.>
```

Do NOT skip Replay analysis and jump straight to reading error messages or guessing at fixes.
Do NOT skip the bug writeup and jump straight to fixing code.
Do NOT stop or cancel a recording upload because it is "taking a while" — wait for it to complete.
The Replay recording contains the actual runtime state — use it.

When testing the app after deployment, use the Replay browser to record the app and debug any problems.

## Directives

- Do NOT manually start `netlify dev` for testing. Let Playwright's built-in `webServer` config
  handle the dev server — it starts and stops the server automatically per test run, avoiding
  zombie processes and port conflicts. Only use manual `netlify dev` for one-off curl checks.

- If you do manually start `netlify dev` for curl testing, you MUST pass `--functions ./netlify/functions`
  to avoid 404 errors on function endpoints. The `base` setting in `netlify.toml` causes the functions
  directory to resolve incorrectly without this flag. Example:
  `npx netlify dev --port 8888 --functions ./netlify/functions`

- After making code changes to Netlify Functions or frontend code during a testing session, ALWAYS
  restart the dev server before re-running tests. The dev server may cache old function bundles.
  Kill background processes with `pkill -f "netlify"` and `pkill -f "vite"` before restarting.

- All browsers must run headless. Never use Xvfb, never set `DISPLAY`, never use the `[REDACTED]io record`
  CLI (it launches a headed browser). Use `@[REDACTED]io/playwright` for recordings.

- The Playwright config MUST use `fullyParallel: true` and `workers` > 1 (or the default). Do NOT
  set `workers: 1` — tests must be designed to run concurrently. If tests interfere with each other,
  fix the isolation (database branches, unique test data), not the parallelism.

- Tests MUST NOT run against the production database or the main Neon branch. The test script
  creates ephemeral Neon branches for test runs and deletes them afterwards.

- NEVER stop, cancel, or skip a Replay recording upload that is in progress. The upload is a
  prerequisite for Replay MCP analysis, which is mandatory for debugging failures. If the upload
  is taking a long time, WAIT for it to finish. Do NOT proceed with fixes based on "enough
  information" — you must complete the full upload → MCP analysis → fix cycle. Stopping an
  upload to "save time" violates the debugging process and leads to guesswork-based fixes.

- Always run tests via `npm run test <testFile>` (from the app directory), never by calling
  `npx playwright test` directly. The test script includes essential pre-test setup (branch
  creation, schema init, seeding, stale cleanup) that is skipped when running Playwright directly.

## Tips

- When a test times out inside a `.toPass()` block, use `mcp__[REDACTED]__PlaywrightSteps` first. It
  shows the exact sequence of Playwright actions with timestamps and return values. Look for a
  step that is stuck auto-waiting for an element — this reveals nested-wait deadlocks where the
  DOM changed mid-iteration and an inner `textContent()` or `count()` call is waiting on an
  element that was removed. The fix is always in the test: replace the iteration loop with a
  single atomic Playwright assertion (see the nested-wait directive in writeTests.md).
- When debugging history/timeline tests, check for duplicate entries caused by React re-renders triggering multiple API calls, and check for missing entries from mutation handlers that skip history writes.
- When many detail-page tests fail with "expected count > 0, received 0", the root cause is almost
  always that the database has no seed data OR the API functions are not working. Check both before
  attempting to fix individual tests.
- When filter/search tests return wrong data (e.g., filtering by "proposal" returns "Qualification"),
  the root cause may be that the SQL query is silently broken. Verify the API returns correctly
  filtered results by curling the endpoint directly with filter parameters.
- Tests that pass individually but fail in the full suite usually indicate data contamination between
  tests. With per-worker database branches, cross-worker contamination is impossible. If tests within
  the same worker interfere, make tests that create/modify/delete data operate on their own isolated
  records or re-seed the worker's branch in `beforeAll`.
- When test IDs differ between spec files (cross-cutting vs page-specific), decide on ONE canonical
  set of IDs in the component and update whichever test file has fewer references.
- When testing unauthenticated scenarios with `browser.newContext()`, always pass
  `storageState: { cookies: [], origins: [] }` to ensure a truly empty context. Without this,
  Supabase or other auth libraries may detect cached sessions from previous test runs, causing
  "unauthenticated" tests to appear authenticated.
- If many tests suddenly fail with `net::ERR_CONNECTION_REFUSED` or `ERR_CONNECTION_RESET` partway
  through a test run, the dev server crashed mid-suite. Do NOT debug individual test failures —
  they are all caused by the same server crash. Re-run the full suite. If the crash recurs, check
  for memory pressure or port conflicts from zombie processes.
- Zombie processes (`<defunct>`) from previous `vite` or `netlify` runs are harmless and cannot be
  killed (they are orphaned child processes waiting for PID 1 to reap them). Ignore them. The
  Playwright `webServer` config starts fresh processes on different ports and is not affected.
- Commit incrementally during debugging sessions. If you improve test results (e.g., 81→207 passing)
  or fix a meaningful issue, commit those changes immediately even if other failures remain. An
  iteration that produces zero commits despite significant work (strategy updates, code fixes,
  debugging progress) is wasted effort because the next iteration starts from scratch.
- Before running tests, verify `NEON_PROJECT_ID` is set in the environment. The test script
  requires it for creating ephemeral Neon branches. The project ID for SalesCRM is
  `rough-lake-81841975` — set it with `export NEON_PROJECT_ID=rough-lake-81841975`.
- Running the full test suite at once (e.g., `npx playwright test` with no file argument) can
  OOM or crash with `ERR_STRING_TOO_LONG` on large suites. Always run tests one spec file at a
  time using `npm run test tests/<file>.spec.ts` (which uses the test script that manages
  database branches). When verifying broad changes, pick the most relevant 2-3 spec files.
