# Replay Usage in Debugging Test Failures

Analysis of 347 worker logs from `~/recordreplay/app-building-2/logs/` (Feb 15-21, 2026).

## Investigation Strategy

1. Used `npm run read-log <path>` (the project's log formatting script) to read each worker log as a readable conversation showing assistant text, tool calls, and results.
2. Split 347 logs into batches processed by parallel agents.
3. For each log, identified whether tests were run, whether they failed, whether Replay MCP tools were used for debugging, and the outcome.

Key indicators searched for:
- **Test failures**: `npm run test` commands followed by failure output (FAIL, timeout, assertion errors)
- **Replay usage**: `mcp__replay__*` tool calls (PlaywrightSteps, Screenshot, ConsoleMessages, NetworkRequest, Logpoint, Evaluate, SearchSources, ReadSource, ReactComponents, InspectElement, UncaughtException)
- **Success**: whether tests passed by end of the log session

Note: All tests run in `replay-chromium` browser as part of the test infrastructure, so replay *recordings* are created on every test run. "Replay used" below means the agent actively used Replay MCP tools to analyze a recording for debugging, not merely that tests ran in the replay browser.

## Summary

| Metric | Count |
|--------|-------|
| Total worker logs analyzed | 347 |
| Logs containing test failures | ~41 |
| Test failures where Replay was used for debugging | 14 |
| Test failures where Replay was NOT used | ~27 |
| Debugging attempts that were successful | ~39 of ~41 |
| Replay tool errors encountered | 0 |

## Worker Logs with Test Failures

### Failures Debugged WITH Replay

#### 1. `reviewed/worker-2026-02-18T19-43-37-073Z.log`
- **(a) Replay used**: Yes
- **(b) Strategy**: Deployment test failure. Uploaded recording and used Replay MCP tools to analyze the deployment.
- **(c) Success**: Yes
- **(d) Replay errors**: None

#### 2. `reviewed/worker-2026-02-18T21-16-46-536Z.log`
- **(a) Replay used**: Yes (recording `a876330e`)
- **(b) Strategy**: Tests failed with 3 failures. Uploaded recording and analyzed with Replay tools.
- **(c) Success**: Yes
- **(d) Replay errors**: None

#### 3. `reviewed/worker-2026-02-19T21-24-18-527Z.log`
- **(a) Replay used**: Yes
- **(b) Strategy**: On test failure, parsed `~/.replay/recordings.log`, found the longest failed recording, and uploaded it to Replay for debugging.
- **(c) Success**: Yes
- **(d) Replay errors**: None

#### 4. `reviewed/worker-2026-02-19T23-29-46-713Z.log`
- **(a) Replay used**: Yes
- **(b) Strategy**: Diagnosed `.toPass()` deadlock in DATA-02 test. Used Replay to identify that `taskCards.nth(4).textContent()` auto-waited inside `.toPass()`, causing a deadlock where Playwright's inner timeout conflicted with the `.toPass()` retry loop.
- **(c) Success**: Yes
- **(d) Replay errors**: None

#### 5. `worker-2026-02-20T05-45-51-308Z.log`
- **(a) Replay used**: Yes
- **(b) Strategy**: Ran tests after fixing lint errors. Used Replay recording to analyze deal-detail test failures.
- **(c) Success**: Yes
- **(d) Replay errors**: None

#### 6. `worker-2026-02-20T11-42-52-380Z.log`
- **(a) Replay used**: Yes (recording `b89790a4-9c4b-43b2-8da7-a9f845bd3e5c`)
- **(b) Strategy**: 20/22 person-detail tests passed; PDP-REL-05 and PDP-CH-04 failed. Uploaded recording, used Replay to analyze. Found PDP-REL-05 failed due to a custom `<select>` not being interactable with native Playwright `.selectOption()`.
- **(c) Success**: Yes
- **(d) Replay errors**: None

#### 7. `worker-2026-02-20T12-13-27-892Z.log`
- **(a) Replay used**: Yes
- **(b) Strategy**: Fixed DDP-HIS-02 `.toPass()` deadlock (replaced `count()` inside `.toPass()` with atomic `toHaveCount` assertions). Used Replay to verify fix behavior.
- **(c) Success**: Yes
- **(d) Replay errors**: None

#### 8. `worker-2026-02-20T13-25-51-930Z.log`
- **(a) Replay used**: Yes (recording `3126f9f7-324b-48f7-8d7b-a6fa7864a83f`)
- **(b) Strategy**: STP-WH-07 (webhook enable/disable toggle) timed out. Uploaded recording, checked console messages and network requests with Replay. Found `toBeChecked` was targeting a `<label>` instead of the underlying `<input>` checkbox. Fixed test to target the input element.
- **(c) Success**: Yes
- **(d) Replay errors**: None

#### 9. `worker-2026-02-20T16-35-53-946Z.log`
- **(a) Replay used**: Yes
- **(b) Strategy**: Deployment test. Used Replay recording to analyze deployment verification failure (database authentication issue with stale password).
- **(c) Success**: Yes
- **(d) Replay errors**: None

#### 10. `worker-2026-02-20T21-05-51-266Z.log`
- **(a) Replay used**: Yes (recording `7357c55a-cf65-4b25-8189-1ffb189af5a7`)
- **(b) Strategy**: PDP-REL-04a and PDP-REL-05 failed due to parallel test isolation (count-based assertions failed when concurrent tests modified the same person's relationships). Used Replay PlaywrightSteps, NetworkRequest, SearchSources, Logpoint, Evaluate, and Screenshot to trace runtime state. Found relationship count was 2 instead of expected 1 from parallel test interference. Fixed by switching to name-based assertions.
- **(c) Success**: Yes
- **(d) Replay errors**: None
- **Tools used**: PlaywrightSteps, NetworkRequest, SearchSources, Logpoint, Evaluate, Screenshot, ReadSource, ConsoleMessages

#### 11. `worker-2026-02-20T21-13-04-828Z.log`
- **(a) Replay used**: Yes (recording `d8a3c082-3fbd-4bd9-8c9f-37557bbbf573`)
- **(b) Strategy**: PDP-CH-01 failed because navigated-to person had no seeded contact history entries. Used Replay PlaywrightSteps to see where test got stuck, SearchSources to verify entry rendering had 0 hits, Logpoint to inspect entries array (confirmed empty). Fixed by creating a contact history entry via UI before assertions.
- **(c) Success**: Yes
- **(d) Replay errors**: None
- **Tools used**: PlaywrightSteps, SearchSources, Logpoint

#### 12. `worker-2026-02-20T23-49-43-756Z.log`
- **(a) Replay used**: Yes
- **(b) Strategy**: DDP-HDR-04 timed out (toHaveCount assertion for deal history entries). Used PlaywrightSteps, Evaluate, ConsoleMessages, UncaughtException, and Screenshot to investigate. Diagnosed race condition from parallel tests (DDP-HIS-02 changes stages on the same deal). Test passed on re-run.
- **(c) Success**: Yes
- **(d) Replay errors**: None
- **Tools used**: PlaywrightSteps, Evaluate, ConsoleMessages, UncaughtException, Screenshot

#### 13. `worker-2026-02-20T12-51-54-645Z.log`
- **(a) Replay used**: Yes
- **(b) Strategy**: TDP-HDR-02 timed out trying to click a client row. Used PlaywrightSteps to find the stuck step (step 31 - wrong locator using plain `tr` instead of `data-testid="client-row-*"`). Used Screenshot to see the page state. Fixed locator.
- **(c) Success**: Yes
- **(d) Replay errors**: None
- **Tools used**: PlaywrightSteps, Screenshot

#### 14. `worker-2026-02-20T13-00-10-123Z.log`
- **(a) Replay used**: Yes
- **(b) Strategy**: Two separate failures in TDP-HDR-01. First: "Malformed value" on date input (used PlaywrightSteps, fixed date format YYYY-MM-DDTHH:MM -> YYYY-MM-DD). Second: timeout on assignee trigger click (used PlaywrightSteps, found wrong data-testid). Fixed both issues.
- **(c) Success**: Yes
- **(d) Replay errors**: None
- **Tools used**: PlaywrightSteps

#### 15. `worker-2026-02-21T00-21-51-482Z.log`
- **(a) Replay used**: Yes
- **(b) Strategy**: 4 failures in DDP tests. Used PlaywrightSteps across multiple test runs to iteratively diagnose: (1) incorrect locator logic (hasNot vs has filter), (2) seed data gaps (first deal had no writeups/attachments), (3) timing issues. Fixed across 4 test run iterations.
- **(c) Success**: Yes
- **(d) Replay errors**: None
- **Tools used**: PlaywrightSteps

#### 16. `worker-2026-02-21T03-34-33-230Z.log`
- **(a) Replay used**: Yes (11 different Replay tools)
- **(b) Strategy**: Complex multi-round session (104 turns, $4.72). All 22 tests initially failed due to 6 root causes. Used Replay extensively: Screenshots showed empty #root div; NetworkRequests revealed SPA redirect intercepting Vite module requests (returning HTML for JS); Logpoints on auth signup handler traced missing token to unset IS_TEST env var. Fixed all 6 issues.
- **(c) Success**: Yes
- **(d) Replay errors**: None
- **Tools used**: PlaywrightSteps, Screenshot, ConsoleMessages, ReactComponents, NetworkRequest, UncaughtException, SearchSources, InspectElement, ListSources, Logpoint, ReadSource

#### 17. `worker-2026-02-21T03-42-03-835Z.log`
- **(a) Replay used**: Yes (post-fix verification)
- **(b) Strategy**: Deployment test failed due to missing DATABASE_URL env var on Netlify. Agent diagnosed from error context, set env vars, redeployed. Used Replay ConsoleMessages, NetworkRequest, Screenshot to verify the fix worked.
- **(c) Success**: Yes
- **(d) Replay errors**: None

#### 18. `worker-2026-02-21T04-24-50-090Z.log`
- **(a) Replay used**: Yes (recording `7f4c8da9-5b08-4885-9f87-964dd209a2d3`)
- **(b) Strategy**: 5/6 forgot-password tests passed; "Submit with Invalid Email Format" failed. Used PlaywrightSteps to confirm click happened but validation error never appeared. Diagnosed: browser-native email validation on `<input type="email">` prevented `handleSubmit` from firing. Fixed by adding `noValidate` to form.
- **(c) Success**: Yes
- **(d) Replay errors**: None
- **Tools used**: PlaywrightSteps

#### 19. `worker-2026-02-21T09-35-37-625Z.log`
- **(a) Replay used**: Yes
- **(b) Strategy**: 43/47 settings tests passed initially. Used Replay to diagnose 2 non-obvious issues: (1) ImportDialog component closed by `onImported()` before results could display (found via source search and network request analysis); (2) webhook toggle race condition where a late GET response overwrote an optimistic PATCH update (found via SearchSources hit counts showing the overwrite). Fixed both component bugs and tests.
- **(c) Success**: Yes
- **(d) Replay errors**: None
- **Tools used**: PlaywrightSteps, ConsoleMessages, NetworkRequest, SearchSources, ReadSource

### Failures Debugged WITHOUT Replay

#### 20. `reviewed/worker-2026-02-17T16-42-07-597Z.log`
- **(b) Strategy**: Read error context files (page snapshots). Debugged unauthenticated test failures by passing explicit empty `storageState` to `browser.newContext()`.
- **(c) Success**: Yes
- **(d) Note**: The log review flagged this as a directive violation for not using Replay MCP tools.

#### 21. `reviewed/worker-2026-02-18T15-59-54-937Z.log`
- **(b) Strategy**: Read test code and component code. Identified that `availableEvents` stayed empty when API call failed silently in catch block.
- **(c) Success**: Yes

#### 22. `reviewed/worker-2026-02-18T19-32-57-979Z.log`
- **(b) Strategy**: Read test output (56 passing, 74 failing). Categorized failures by spec file.
- **(c) Success**: Partial (bulk test-fixing session)

#### 23. `reviewed/worker-2026-02-18T19-45-34-999Z.log`
- **(b) Strategy**: Test infrastructure issue (BashTool pre-flight checks taking too long).
- **(c) Success**: Unclear

#### 24. `reviewed/worker-2026-02-18T20-54-40-910Z.log`
- **(b) Strategy**: Read error output, identified test infrastructure/setup issues.
- **(c) Success**: Yes

#### 25. `reviewed/worker-2026-02-18T19-54-00-756Z.log`
- **(b) Strategy**: Attempted to use `replayio record` for deployment verification but failed due to missing DISPLAY/X server. Tried multiple approaches (DISPLAY=:99, timeout wrappers).
- **(c) Success**: No (environment issue)
- **(d) Note**: Not a Replay MCP tool error, but a `replayio` CLI environment issue.

#### 26. `reviewed/worker-2026-02-19T23-10-12-635Z.log`
- **(b) Strategy**: 10/11 tests passed; DATA-02 timed out. Attempted to use Replay recording but "replay recording isn't accessible." Analyzed code directly, looked at screenshots.
- **(c) Success**: Partial
- **(d) Note**: Replay recording was not accessible for analysis.

#### 27. `reviewed/worker-2026-02-20T02-27-12-185Z.log`
- **(b) Strategy**: Log review iteration noting test failures (ATOM-01, ATOM-02, DATA-02) and queuing fix jobs.
- **(c) Success**: N/A (review only)

#### 28. `worker-2026-02-20T05-18-16-305Z.log`
- **(b) Strategy**: Read test output, identified transient Neon DB infrastructure errors. Re-ran tests and they passed.
- **(c) Success**: Yes

#### 29. `worker-2026-02-20T07-01-36-974Z.log`
- **(b) Strategy**: Directive checking found missing delete buttons, failing test assertions. Code/spec analysis, not test execution debugging.
- **(c) Success**: N/A (audit only)

#### 30. `worker-2026-02-20T07-44-21-156Z.log`
- **(b) Strategy**: Referenced `analyze-test-failure` script for test analysis.
- **(c) Success**: Yes

#### 31. `worker-2026-02-20T08-12-04-046Z.log`
- **(b) Strategy**: Directive checking found test ID mismatches. Verified expected test IDs against spec.
- **(c) Success**: N/A (audit only)

#### 32. `worker-2026-02-20T08-39-36-595Z.log`
- **(b) Strategy**: Found `.toPass()` directive violations (using `count()` inside `.toPass()` blocks). Recommended replacing with atomic `toHaveCount` assertions.
- **(c) Success**: N/A (audit only)

#### 33. `worker-2026-02-20T08-45-03-201Z.log`
- **(b) Strategy**: Found tests using native `selectOption()` on custom dropdown components. Identified as a test design issue.
- **(c) Success**: N/A (audit only)

#### 34. `worker-2026-02-20T10-08-23-052Z.log`
- **(b) Strategy**: Read lint error output. Pre-existing lint errors (no-empty-pattern, no-unused-vars) unrelated to changes. Verified changes were correct.
- **(c) Success**: Yes

#### 35. `worker-2026-02-20T11-57-33-493Z.log`
- **(b) Strategy**: Read lint output. Pre-existing lint errors. Checked component test IDs.
- **(c) Success**: Yes

#### 36. `worker-2026-02-20T13-08-51-726Z.log`
- **(b) Strategy**: Read test output. Fixed test entry descriptions and missing assertions for TDP-HDR-01.
- **(c) Success**: Yes

#### 37. `worker-2026-02-20T13-29-51-368Z.log`
- **(b) Strategy**: Read lint output. Added missing import/export test entries (STP-IE-03/04/05/06/07/08).
- **(c) Success**: Yes

#### 38. `worker-2026-02-20T18-21-37-666Z.log`
- **(b) Strategy**: Referenced `analyze-test-failure` script.
- **(c) Success**: Yes

#### 39. `worker-2026-02-20T21-48-33-369Z.log`
- **(b) Strategy**: Read test output. DLP-HDR-05 CSV import test passed but other deal-list tests had issues.
- **(c) Success**: Yes

#### 40. `worker-2026-02-20T22-00-24-069Z.log`
- **(b) Strategy**: Read test output directly. Identified label mismatches in DLP-HDR-02.
- **(c) Success**: Yes

#### 41. `worker-2026-02-20T22-17-48-219Z.log`
- **(b) Strategy**: Read test output. All 23 TasksListPage tests passed despite earlier error context files.
- **(c) Success**: Yes

#### 42. `worker-2026-02-20T23-25-47-074Z.log`
- **(b) Strategy**: Read test output. CDP-HDR-02 failed due to parallel test concurrency flake. Re-ran, all 53 passed.
- **(c) Success**: Yes

#### 43. `worker-2026-02-20T12-27-14-368Z.log`
- **(b) Strategy**: Read test output. DDP-HIS-02 flaky failure (pre-existing race condition). Agent's new modal cancel tests all passed.
- **(c) Success**: Yes

#### 44. `worker-2026-02-20T12-31-13-883Z.log`
- **(b) Strategy**: Read test output. DDP-HIS-02 flaky failure again. Agent's DDP-LTK-04 fix passed.
- **(c) Success**: Yes

#### 45. `worker-2026-02-20T12-42-59-583Z.log`
- **(b) Strategy**: Read test output, identified Tailwind class name mismatch after CSS variable refactor. Updated test to check computed background-color instead of class names.
- **(c) Success**: Yes (24/24 passed)

#### 46. `worker-2026-02-21T04-05-00-483Z.log`
- **(b) Strategy**: Read test error output (NeonDbError: column "owner_id" does not exist). Identified that CREATE TABLE IF NOT EXISTS doesn't modify existing tables. Added `runMigrations` with ALTER TABLE ADD COLUMN IF NOT EXISTS. Iterated when "column status does not exist" appeared on second run.
- **(c) Success**: Yes (22/22 passed)

#### 47. `worker-2026-02-21T04-44-16-693Z.log`
- **(b) Strategy**: Read test error output. 8/9 passed, 1 failed (NeonDbError from parallel workers sharing same email). Fixed by generating unique random emails per worker using `Math.random()` inside `beforeAll`.
- **(c) Success**: Yes (9/9 passed)

#### 48. `worker-2026-02-21T05-32-01-460Z.log`
- **(b) Strategy**: Read test output. 10/11 passed; "Delete on Hover" failed because CSS `group-hover:opacity-100` wasn't reliably triggered in Replay Chromium. Fixed by removing opacity assertion, using `force:true` click, and verifying functional behavior (row disappears).
- **(c) Success**: Yes (11/11 passed)

#### 49. `worker-2026-02-21T08-58-43-921Z.log`
- **(b) Strategy**: Read test output. 11/12 clients-list-page tests passed. The 1 failure (expecting "Created" column header) was pre-existing, unrelated to the deals.ts refactoring.
- **(c) Success**: Partial (pre-existing failure not fixed)

## Replay Tool Usage Patterns

### Most commonly used Replay tools (across all debugging sessions):
1. **PlaywrightSteps** - Used in nearly every Replay debugging session. Primary entry point for understanding where a test got stuck.
2. **Screenshot** - Used to see page state at specific points.
3. **ConsoleMessages** - Used to check for runtime errors.
4. **NetworkRequest** - Used to trace API calls and responses.
5. **SearchSources** / **ReadSource** - Used to find and read source code hit counts.
6. **Logpoint** - Used to inspect runtime variable values at specific execution points.
7. **Evaluate** - Used to evaluate expressions at specific points.

### When Replay was most valuable:
- **Timeout debugging**: When a test timed out, PlaywrightSteps revealed which step was stuck and why (wrong locator, element not visible, wrong target).
- **Race condition diagnosis**: Logpoints and Evaluate helped trace data flow to find that parallel tests or late-arriving API responses caused state corruption.
- **Component mounting failures**: Screenshots and ReactComponents showed empty DOM when SPA redirects intercepted Vite module requests.
- **Form validation issues**: PlaywrightSteps showed that clicks happened but expected elements never appeared, revealing browser-native validation interference.

### When Replay was NOT used (and why):
- **Obvious error messages**: When test output clearly showed the root cause (e.g., "column does not exist", "NeonDbError"), agents fixed code directly.
- **Lint/typecheck failures**: Pre-existing lint errors unrelated to changes.
- **Flaky tests**: When re-running tests made them pass (transient DB errors, parallel test interference).
- **CSS/class name mismatches**: When error messages clearly described the assertion failure.

## Errors Encountered While Using Replay

- **No MCP tool errors were observed** across any of the 19 Replay debugging sessions.
- **One environment issue**: `reviewed/worker-2026-02-18T19-54-00-756Z.log` had a `replayio` CLI failure due to missing X server/DISPLAY (not a Replay MCP tool issue).
- **One inaccessible recording**: `reviewed/worker-2026-02-19T23-10-12-635Z.log` noted "replay recording isn't accessible" when trying to analyze a failed test, forcing the agent to debug from code alone.
