# TasksListPage Directive Violations Check

## Verification Results

All 23 TasksListPage tests pass (23/23).

## Violations Identified (Pending Fix)

The following test quality violations were identified during directive checking and are queued for fix:

### 1. TLP-FLT-02: Uses .count() inside .toPass() (writeTests.md violation)
**Directive violated**: "Never nest `.count()` or `.textContent()` inside `.toPass()` — use atomic Playwright assertions instead."

The filter-by-priority test uses a pattern that can cause nested-wait deadlocks. Needs replacement with an atomic assertion.

### 2. TLP-CRD-08: Tests title edit instead of due date edit (testSpec.md violation)
**Directive violated**: Test entry specifies verifying due date editing, but the test exercises title editing instead.

The test does not match its spec entry's expected behavior.

### 3. TLP-CRD-06: Missing timeline entry verification (testSpec.md violation)
**Directive violated**: "If the app has a timeline or history feature, every mutation that the timeline tracks must write a history entry."

Mark Complete should verify a timeline entry is created on the associated client, but the test only checks the task is removed from the list.

### 4. TLP-CRD-09: Missing cross-entity verification (testSpec.md violation)
**Directive violated**: "Every mutation test entry must also verify that side effects on other entities are reflected."

Delete task should verify the deleted task no longer appears on the associated client/deal detail pages.

## Current State
All tests pass in their current form. The violations above are about test quality and completeness — the tests run successfully but do not fully exercise the behavior specified in their test entries. Fix jobs are queued to address each violation.
