# Strategy

You will run all the tests in the app and get them to pass..

## Unpack Subtasks

Unpack the initial stage task into a single FixTests task to get all tests passing.

After running tests and there are failures, pick a specific failing test and add a subtask to fix that test without regressing any tests that passed in previous runs. The subtask must require committing and exiting afterwards. Focus on that subtask until finished.

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

## Running Tests

Every time you run the playwright tests, do the following:
- Restart any existing development servers to pick up the latest changes. There might be development servers running from previous runs.
- Use the Replay browser to record test executions.
- Write the results to a logs/test-run-N.log file.
- Use a single worker, to avoid tests interfering with each other.

## Debugging

When tests fail, you MUST follow this process for each distinct failure:

1. Announce `ANALYZING TEST FAILURE: <test name>`.
2. Upload the Replay recording of the failed test using the Replay CLI.
3. Use Replay MCP tools to analyze the failure. Start with `mcp__[REDACTED]__ConsoleMessages` and
   `mcp__[REDACTED]__NetworkRequest` to get an overview, then drill into specifics with tools like
   `mcp__[REDACTED]__SearchSources`, `mcp__[REDACTED]__Logpoint`, `mcp__[REDACTED]__Evaluate`,
   `mcp__[REDACTED]__GetStack`, and `mcp__[REDACTED]__ReactComponents` as needed.
4. Only after completing the Replay analysis, fix the test and/or app based on what you found.

Do NOT skip Replay analysis and jump straight to reading error messages or guessing at fixes.
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

## Tips

- When debugging history/timeline tests, check for duplicate entries caused by React re-renders triggering multiple API calls, and check for missing entries from mutation handlers that skip history writes.
- When many detail-page tests fail with "expected count > 0, received 0", the root cause is almost
  always that the database has no seed data OR the API functions are not working. Check both before
  attempting to fix individual tests.
- When filter/search tests return wrong data (e.g., filtering by "proposal" returns "Qualification"),
  the root cause may be that the SQL query is silently broken. Verify the API returns correctly
  filtered results by curling the endpoint directly with filter parameters.
- Tests that pass individually but fail in the full suite usually indicate data contamination between
  tests. Consider adding database re-seeding in `globalSetup` or `beforeAll`, or make tests that
  create/modify/delete data operate on their own isolated records.
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
