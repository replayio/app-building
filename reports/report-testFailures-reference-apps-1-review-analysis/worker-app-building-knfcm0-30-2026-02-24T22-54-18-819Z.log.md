# worker-app-building-knfcm0-30-2026-02-24T22-54-18-819Z.log

## Summary
NOTES: Fixed 4 groups of InventoryTracker dashboard test failures across 7 test runs. Fixed data-testid prefix collisions in MaterialsCategoriesOverview, ISO timestamp parsing in RecentTransactionsTable/DateRangeFilter, React StrictMode race condition in dismiss-alert flow, and added test.slow() for infrastructure-sensitive tests. All 35 tests passed on run 7. Replay was used extensively for debugging dismiss and timeout failures.

## Test Failures
TEST_FAILURES: 11
TEST_RERUNS: 6

### Failure: Low inventory alert Dismiss button removes the alert
FAILURE_CATEGORY: backend-bug
PRE_EXISTING: no
REPLAY_USED: yes
RECORDING_AVAILABLE: yes
DEBUGGING_SUCCESSFUL: yes
ROOT_CAUSE_CLUSTER: dismiss-race-condition

#### Replay Usage (if REPLAY_USED is yes)
OUTCOME: Revealed React StrictMode double-mount causing two fetchDashboardData calls; second fetch overwrote dismiss state with stale data containing the dismissed alert
DEBUGGING_STRATEGY: PlaywrightSteps to find stuck step, then NetworkRequest to trace API call sequence and identify the race condition between dismiss and dashboard fetch responses
TOOLS_USED: mcp__replay__PlaywrightSteps, mcp__replay__NetworkRequest

#### Resolution
CHANGESET_REVISION: none
FAILING_TEST: Low inventory alert Dismiss button removes the alert

### Failure: Each category column shows category name, total items count, and total units count
FAILURE_CATEGORY: CSS/layout
PRE_EXISTING: no
REPLAY_USED: no
REPLAY_NOT_USED_REASON: diagnosed from error output - data-testid prefix collision causing element count mismatch (12 instead of 4)
RECORDING_AVAILABLE: no
DEBUGGING_SUCCESSFUL: yes
ROOT_CAUSE_CLUSTER: testid-prefix-collision

#### Resolution
CHANGESET_REVISION: none
FAILING_TEST: Each category column shows category name, total items count, and total units count

### Failure: Each category shows a sample of materials with names and quantities
FAILURE_CATEGORY: CSS/layout
PRE_EXISTING: no
REPLAY_USED: no
REPLAY_NOT_USED_REASON: diagnosed from error output - same data-testid prefix collision
RECORDING_AVAILABLE: no
DEBUGGING_SUCCESSFUL: yes
ROOT_CAUSE_CLUSTER: testid-prefix-collision

#### Resolution
CHANGESET_REVISION: none
FAILING_TEST: Each category shows a sample of materials with names and quantities

### Failure: Materials categories overview updates when category filter is applied
FAILURE_CATEGORY: CSS/layout
PRE_EXISTING: no
REPLAY_USED: no
REPLAY_NOT_USED_REASON: diagnosed from error output - same data-testid prefix collision
RECORDING_AVAILABLE: no
DEBUGGING_SUCCESSFUL: yes
ROOT_CAUSE_CLUSTER: testid-prefix-collision

#### Resolution
CHANGESET_REVISION: none
FAILING_TEST: Materials categories overview updates when category filter is applied

### Failure: Recent transactions table shows multiple transactions in reverse chronological order
FAILURE_CATEGORY: backend-bug
PRE_EXISTING: no
REPLAY_USED: no
REPLAY_NOT_USED_REASON: diagnosed from error output - Invalid Date displayed due to double T00:00:00 appended to ISO timestamps
RECORDING_AVAILABLE: no
DEBUGGING_SUCCESSFUL: yes
ROOT_CAUSE_CLUSTER: iso-date-parsing

#### Resolution
CHANGESET_REVISION: none
FAILING_TEST: Recent transactions table shows multiple transactions in reverse chronological order

### Failure: Recent transactions table updates when date range filter is applied
FAILURE_CATEGORY: backend-bug
PRE_EXISTING: no
REPLAY_USED: yes
RECORDING_AVAILABLE: yes
DEBUGGING_SUCCESSFUL: yes
ROOT_CAUSE_CLUSTER: date-filter-stale-data

#### Replay Usage (if REPLAY_USED is yes)
OUTCOME: Confirmed test timeout was due to slow API responses (15s page load, 7s per interaction) combined with stale DOM data during filtered fetch
DEBUGGING_STRATEGY: PlaywrightSteps to trace step timing and identify where the test stalled waiting for filtered data
TOOLS_USED: mcp__replay__PlaywrightSteps

#### Resolution
CHANGESET_REVISION: none
FAILING_TEST: Recent transactions table updates when date range filter is applied

### Failure: Selecting a new date range updates all dashboard widgets
FAILURE_CATEGORY: backend-bug
PRE_EXISTING: no
REPLAY_USED: no
REPLAY_NOT_USED_REASON: diagnosed from error output - same ISO date parsing issue and stale data during filtered fetch
RECORDING_AVAILABLE: yes
DEBUGGING_SUCCESSFUL: yes
ROOT_CAUSE_CLUSTER: date-filter-stale-data

#### Resolution
CHANGESET_REVISION: none
FAILING_TEST: Selecting a new date range updates all dashboard widgets

### Failure: Selecting a category filters dashboard content to that category
FAILURE_CATEGORY: backend-bug
PRE_EXISTING: no
REPLAY_USED: no
REPLAY_NOT_USED_REASON: diagnosed from error output - same filter integration bug
RECORDING_AVAILABLE: no
DEBUGGING_SUCCESSFUL: yes
ROOT_CAUSE_CLUSTER: date-filter-stale-data

#### Resolution
CHANGESET_REVISION: none
FAILING_TEST: Selecting a category filters dashboard content to that category

### Failure: Selecting All Categories resets the filter to show all data
FAILURE_CATEGORY: backend-bug
PRE_EXISTING: no
REPLAY_USED: no
REPLAY_NOT_USED_REASON: diagnosed from error output - same category column count mismatch from testid collision
RECORDING_AVAILABLE: no
DEBUGGING_SUCCESSFUL: yes
ROOT_CAUSE_CLUSTER: testid-prefix-collision

#### Resolution
CHANGESET_REVISION: none
FAILING_TEST: Selecting All Categories resets the filter to show all data

### Failure: Low inventory alerts section shows empty state when no materials are below reorder point
FAILURE_CATEGORY: timeout
PRE_EXISTING: no
REPLAY_USED: yes
RECORDING_AVAILABLE: yes
DEBUGGING_SUCCESSFUL: yes
ROOT_CAUSE_CLUSTER: dismiss-race-condition

#### Replay Usage (if REPLAY_USED is yes)
OUTCOME: Found that second dismiss API call never got a response before timeout; confirmed sequential dismiss calls are slow with ephemeral Neon branches
DEBUGGING_STRATEGY: PlaywrightSteps to trace step timing, NetworkRequest to check each dismiss API response
TOOLS_USED: mcp__replay__PlaywrightSteps, mcp__replay__NetworkRequest

#### Resolution
CHANGESET_REVISION: none
FAILING_TEST: Low inventory alerts section shows empty state when no materials are below reorder point

### Failure: Each low inventory alert shows severity, material name, current quantity, and reorder point
FAILURE_CATEGORY: timeout
PRE_EXISTING: no
REPLAY_USED: yes
RECORDING_AVAILABLE: yes
DEBUGGING_SUCCESSFUL: yes
ROOT_CAUSE_CLUSTER: infrastructure-slowness

#### Replay Usage (if REPLAY_USED is yes)
OUTCOME: Confirmed purely timing-related - page loaded at 18.5s, table appeared at 33.6s, test was verifying 3rd row at 57.9s (just 2s before 60s timeout)
DEBUGGING_STRATEGY: PlaywrightSteps to trace step-by-step timing and identify infrastructure slowness
TOOLS_USED: mcp__replay__PlaywrightSteps

#### Resolution
CHANGESET_REVISION: none
FAILING_TEST: Each low inventory alert shows severity, material name, current quantity, and reorder point
