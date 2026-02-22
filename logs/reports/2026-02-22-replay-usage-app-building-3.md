# Replay MCP Usage Report: app-building-3

**Date**: 2026-02-22
**Source**: 400 worker logs from `~/recordreplay/app-building-3/logs/`
**Period**: 2026-02-15 to 2026-02-21

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total logs analyzed | 400 |
| Logs with test failures | 46 (11.5%) |
| Failures where Replay MCP was used | 33 (71.7% of failures) |
| Failures where Replay MCP was NOT used | 13 (28.3% of failures) |
| Logs with Replay used (no failure — verification) | 6 |
| Total logs with any Replay MCP usage | 39 (9.8%) |
| Successful fixes with Replay | 28 |
| Partial success with Replay | 5 |
| Replay errors encountered | 2 (recording-to-test matching issues) |

## Replay MCP Tool Usage Frequency

| Tool | Times Used | Notes |
|------|-----------|-------|
| `PlaywrightSteps` | 30 | Most used. Essential for identifying stuck steps, deadlocks, timing. |
| `ConsoleMessages` | 20 | Second most used. Checks for errors, warnings. |
| `NetworkRequest` | 20 | Tied second. Traces API calls, response bodies, status codes. |
| `SearchSources` | 16 | Finds hit counts on code lines to confirm execution paths. |
| `Logpoint` | 15 | Inspects runtime values at specific source locations. |
| `Screenshot` | 14 | Visual page state verification. |
| `Evaluate` | 10 | Evaluates expressions at specific execution points. |
| `ReadSource` | 9 | Reads source code with hit counts. |
| `InspectElement` | 7 | DOM attribute inspection. |
| `UncaughtException` | 6 | Checks for unhandled exceptions. |
| `ReactException` | 4 | React-specific error checking. |
| `DescribeComponent` | 3 | React component tree analysis. |
| `ReactComponents` | 3 | React component inspection. |
| `ListSources` | 3 | Source file discovery. |
| `Timeline` | 3 | Event sequence overview (early logs only). |
| `DescribePoint` | 2 | Execution point context. |
| `LocalStorage` | 1 | Auth token lifecycle tracing. |
| `GetStack` | 1 | Call stack inspection. |

## Test Failures Table

### Failures WITH Replay MCP Usage (33 logs)

| Log | Tools | Category | Success | Summary |
|-----|-------|----------|---------|---------|
| `worker-02-17T20-32-57` | Timeline, NetworkRequest | network/API | yes | Deployment test — verified data flow with Replay |
| `worker-02-17T21-18-04` | Timeline, NetworkRequest, ConsoleMessages, SearchSources, ReadSource, ListSources | network/API | yes | Production DB missing "users" table — 6 tools traced auth flow |
| `worker-02-18T15-31-51` | Timeline | infrastructure | yes | 4 bug fixes, Replay for deployment verification only |
| `worker-02-18T19-13-46` | NetworkRequest, ConsoleMessages, LocalStorage, GetStack, DescribePoint, Evaluate, SearchSources, ReadSource | infrastructure | partial | Stale dev server with deleted Neon branch — 8 tools, most intensive session |
| `worker-02-18T20-54-40` | 10 tools | infrastructure | partial | Recording-to-test matching failure — stub recording analyzed |
| `worker-02-18T21-16-46` | ConsoleMessages, NetworkRequest, SearchSources, Logpoint, Timeline, InspectElement | infrastructure | partial | Same matching issue — wrong recording analyzed |
| `worker-02-19T21-24-18` | 10 tools | race condition | partial | Redux fetch ordering — PlaywrightSteps revealed DOM race condition |
| `worker-02-19T23-10-12` | 10 tools | race condition | partial | .toPass() deadlock — outstanding Logpoint+Evaluate debugging |
| `worker-02-19T23-29-46` | PlaywrightSteps, ConsoleMessages, Screenshot | race condition | partial | Fixed DATA-02 with atomic assertion from Replay insights |
| `worker-02-20T05-45-51` | PlaywrightSteps | timeout | yes | Confirmed pre-existing flaky failures |
| `worker-02-20T08-07-34` | 9 tools | timeout | yes | DDP-LTK-03/04 — multi-pass debugging, $4.95, 70 turns |
| `worker-02-20T11-29-41` | PlaywrightSteps, NetworkRequest, SearchSources, ReadSource, Logpoint, ConsoleMessages, Screenshot | race condition | yes | Parallel test race conditions on ClientDetailPage |
| `worker-02-20T11-42-52` | PlaywrightSteps, ConsoleMessages | form/input | yes | FilterSelect custom dropdown vs native select |
| `worker-02-20T12-13-27` | 10 tools | race condition | yes | Parallel stage change race condition — 75 turns, $5.28 |
| `worker-02-20T12-51-54` | PlaywrightSteps, Screenshot | timeout | yes | Wrong testId for FilterSelect trigger |
| `worker-02-20T13-00-10` | PlaywrightSteps, Screenshot | timeout | yes | FilterSelect trigger testId mismatch |
| `worker-02-20T13-25-51` | PlaywrightSteps, ConsoleMessages, NetworkRequest, SearchSources, Logpoint | form/input | yes | sr-only checkbox click issue — Logpoint confirmed 0 hits |
| `worker-02-20T18-50-38` | PlaywrightSteps, ConsoleMessages, NetworkRequest, SearchSources, Logpoint | network/API | yes | 500 from missing email_confirmed column — ALTER TABLE fix |
| `worker-02-20T21-05-51` | PlaywrightSteps, NetworkRequest, SearchSources, ConsoleMessages, Logpoint, Evaluate, Screenshot, ReadSource | race condition | yes | Parallel relationship count race condition |
| `worker-02-20T21-13-04` | PlaywrightSteps, SearchSources, Logpoint | seed data | yes | Missing contact history entries on navigated person |
| `worker-02-20T21-48-33` | PlaywrightSteps | timeout | yes | Nested-wait deadlock in sort test |
| `worker-02-20T23-25-47` | PlaywrightSteps, Evaluate, ConsoleMessages, UncaughtException, Screenshot | race condition | yes | CDP-HDR-02 flaky from parallel test interference |
| `worker-02-20T23-49-43` | PlaywrightSteps, Evaluate, ConsoleMessages, UncaughtException, Screenshot | race condition | yes | DDP-HDR-04 intermittent from parallel test race |
| `worker-02-21T00-21-51` | PlaywrightSteps | seed data | yes | Missing writeups/attachments on first deal |
| `worker-02-21T09-05-30` | 13 tools | infrastructure | partial | Full test infrastructure setup — most tools used in single session |
| `worker-02-21T09-16-57` | ConsoleMessages, NetworkRequest, UncaughtException, ReactException | network/API | yes | Deployment validation after stale DATABASE_URL fix |
| `worker-02-21T09-33-12` | 8 tools | network/API | yes | ResetPasswordPage — Netlify Functions 404 on second sign-in |
| `worker-02-21T10-46-39` | PlaywrightSteps | timeout | yes | Confirmed pre-existing flaky debounce test |
| `worker-02-21T15-11-12` (no Replay) | — | timeout | yes | Sort/timeline failures — fixed without Replay |
| `worker-02-21T17-08-07` | 7 tools | network/API | yes | Import DB CHECK constraint violation — `'active'` not in enum |
| `worker-02-21T17-31-25` | 10 tools | network/API | yes | CreateDealModal DB constraint — `'on_track'` not in status enum |
| `worker-02-21T18-04-59` | PlaywrightSteps | seed data | yes | Status badge test — seed data used old status values |

### Failures WITHOUT Replay MCP Usage (13 logs)

| Log | Category | Success | Why No Replay |
|-----|----------|---------|---------------|
| `worker-02-17T16-39-03` | form/input | yes | Used error context files instead — storageState caching |
| `worker-02-18T19-32-57` | infrastructure | partial | Stopped Replay upload mid-flight (violated strategy) |
| `worker-02-18T19-45-34` | infrastructure | no | Test setup failed (missing NEON_PROJECT_ID) |
| `worker-02-18T20-17-42` | infrastructure | partial | Uploaded recordings but never called MCP tools |
| `worker-02-20T08-12-04` | timeout | N/A | Known pre-existing flaky test |
| `worker-02-20T12-42-59` | other | yes | Straightforward CSS class name mismatch |
| `worker-02-21T10-07-16` | infrastructure | yes | Transient sign-in failure — used git stash to isolate |
| `worker-02-21T12-57-22` | other | yes | Pre-existing sign-out test, unrelated to changes |
| `worker-02-21T13-46-01` | timeout | yes | Pre-existing flaky debounce test |
| `worker-02-21T14-11-07` | seed data | yes | Pre-existing Date Acquired test failure |
| `worker-02-21T15-44-45` | component rendering | yes | CSS z-index issue — straightforward fix |
| `worker-02-21T19-21-12` | timeout | yes | Pre-existing flaky debounce test |
| `worker-02-21T19-29-48` | other | yes | Pre-existing ClientHeader/SourceInfoSection issues |
| `worker-02-21T19-42-02` | other | yes | Regression from own code change — self-explanatory |

## Patterns Observed

### When Replay Was Most Effective

1. **Race conditions and parallel test interference** (8 logs): Replay's `PlaywrightSteps` + `Logpoint` + `Evaluate` combination excelled at tracing timing-dependent failures. The agent could see exact step sequences with timestamps, then inspect Redux/API state at specific execution points to identify fetch ordering or count-based assertion conflicts.

2. **Network/API debugging** (7 logs): `NetworkRequest` immediately revealed wrong status codes, missing columns, constraint violations. Combined with `Logpoint` on server-side handlers, the agent could trace request → DB query → error path.

3. **Timeout debugging** (6 logs): `PlaywrightSteps` was the go-to first tool — it showed which step was stuck and whether the test was in a nested-wait deadlock (`.toPass()` + `.count()` + `.textContent()`).

4. **Form/input issues** (2 logs): `InspectElement` and `PlaywrightSteps` revealed mismatches between test expectations and actual DOM (sr-only inputs, custom dropdowns vs native selects).

### When Replay Was Not Needed

1. **Pre-existing flaky failures** (6 logs): When the failure was clearly unrelated to the agent's changes, Replay was correctly skipped.
2. **Straightforward errors** (4 logs): CSS class mismatches, self-explanatory error messages, or regressions from the agent's own code that were obvious from the test output.
3. **Infrastructure failures** (3 logs): Missing env vars, test setup failures — no recording to analyze.

### Most Effective Tool Sequences

| Problem Type | Recommended Sequence |
|-------------|---------------------|
| Timeout/deadlock | `PlaywrightSteps` → identify stuck step → `Screenshot` for page state |
| Race condition | `PlaywrightSteps` → `Logpoint` on state updates → `Evaluate` to inspect values at specific points |
| API error | `NetworkRequest` → `ConsoleMessages` → `Logpoint` on handler → `ReadSource` |
| Missing data | `PlaywrightSteps` → `NetworkRequest` (check API response) → `SearchSources` (hit counts on render code) |
| Form interaction | `PlaywrightSteps` → `InspectElement` → `Screenshot` |

### Key Challenges

1. **Recording-to-test matching** (early logs): Before the Replay reporter was properly configured with test metadata, agents couldn't identify which recording corresponded to which failing test. This was fixed by properly configuring `@replayio/playwright` with `replayDevices['Replay Chromium']` spread.

2. **Stub recordings**: Some recordings were only 2-3 seconds and contained just initial page loads, not the actual test failure. This happened when the Replay browser crashed or the recording driver failed silently.

## New Patterns for Debugging Guides

### Already Covered
- Timeout/deadlock from `.toPass()` nested waits → `timeouts.md`
- Race conditions from parallel tests → `race-conditions.md`
- Missing seed data → `seed-data.md`
- Form input mismatches (custom dropdown vs native select) → `form-and-input.md`
- Schema migration (ALTER TABLE) → `network-and-api.md`

### New Patterns to Add

1. **DB CHECK constraint violations** (`network-and-api.md`): When a form sends a value not in the database's CHECK constraint (e.g., `'active'` for a status column that only accepts `'open'`/`'won'`/`'lost'`), `NetworkRequest` shows the 500 response, and `Logpoint` on the handler reveals the exact constraint error. Fix: update the form values to match the DB enum.

2. **sr-only checkbox click failure** (`form-and-input.md`): When `data-testid` is on a hidden `sr-only` input, Playwright's click never reaches it. `PlaywrightSteps` shows the click step timing out. `Logpoint` on the handler confirms 0 hits. Fix: move the testid to the visible label element.

3. **Stale dev server with deleted Neon branch** (`network-and-api.md`): When `reuseExistingServer` reuses a server whose `DATABASE_URL` points to a deleted ephemeral branch, all API calls fail. `NetworkRequest` shows no API calls or auth errors. `LocalStorage` + `GetStack` can trace the auth token lifecycle to find where it breaks.

4. **Deployment validation with Replay** (new: `deployment.md`?): 6 logs used Replay MCP tools proactively to validate deployments (not debugging failures). Tools: `Screenshot` + `NetworkRequest` + `ConsoleMessages` to verify the deployed app loads, makes correct API calls, and has no errors.
