# TasksListPage Directive Violations Check

## Verification Results

All 23 TasksListPage tests pass (23/23).

## Violations Identified (Fixed)

The following test quality violations were identified during directive checking and have been fixed:

### 1. TLP-FLT-02: Uses .count() inside .toPass() (writeTests.md violation) — FIXED
**Directive violated**: "Never nest `.count()` or `.textContent()` inside `.toPass()` — use atomic Playwright assertions instead."

**Fix**: Replaced `.toPass()` block containing `.count()` calls with atomic assertions: `.toBeVisible()` to verify at least one card exists, and `.toHaveCount(0)` with `.filter({ hasNot: ... })` to verify all cards have high priority badges.

### 2. TLP-CRD-08: Tests title edit instead of due date edit (testSpec.md violation) — FIXED
**Directive violated**: Test entry specifies verifying due date editing, but the test exercises title editing instead.

**Fix**: Changed test to edit the due date field (set to tomorrow) instead of the title, and assert the card shows "Tomorrow" in the due date element.

### 3. TLP-CRD-06: Missing timeline entry verification (testSpec.md violation) — FIXED
**Directive violated**: "If the app has a timeline or history feature, every mutation that the timeline tracks must write a history entry."

**Fix**: Test now creates a task with a client association, marks it complete, then verifies via the client-timeline API that exactly one `task_completed` timeline entry was created for the task.

### 4. TLP-CRD-09: Missing cross-entity verification (testSpec.md violation) — FIXED
**Directive violated**: "Every mutation test entry must also verify that side effects on other entities are reflected."

**Fix**: Test now creates a task with a client association, deletes it, then navigates to the associated client detail page to verify the task no longer appears in the tasks section.

## Current State
All violations have been fixed. Tests now fully exercise the behavior specified in their test entries.
