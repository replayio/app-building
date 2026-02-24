# Fix: ClientDetailPage testSpec directive violations

## Violations

Two test entries were missing or had ambiguous navigation targets in `docs/tests.md`,
violating the testSpec.md directive: "For every clickable element, the test entry must
specify the exact navigation target or action result. Do not leave navigation destinations
ambiguous."

### 1. TasksSection - Ambiguous task click navigation

The existing test "Clicking a task name navigates to the task detail page" used ambiguous
language: "the app navigates to the task detail or opens the task for viewing/editing on
the Tasks List Page (/tasks) with that task highlighted or expanded."

Additionally, the DealsSection and PeopleSection both had two navigation tests each
(primary + "each entry navigates correctly"), but TasksSection only had one.

### 2. TimelineSection - Missing "Deal Created" entity link navigation

The "Timeline entries are clickable and navigate to detail pages" test covered navigation
for "Deal Stage Changed" and "Contact Added" entries but did not cover "Deal Created"
entries, even though the deal name in "Deal Created" events is also a clickable link.

## Directive

From `testSpec.md`: "For every clickable element, the test entry must specify the exact
navigation target or action result. Do not leave navigation destinations ambiguous."

## Fix

### tests.md changes
- Renamed and updated "Clicking a task name navigates to the task detail page" to
  "Clicking a task name navigates to the Tasks List Page" with unambiguous target `/tasks`
- Added "Each task entry navigates to the Tasks List Page" test entry (matching the
  DealsSection/PeopleSection pattern of two navigation tests)
- Fixed timeline task navigation from ambiguous wording to "Tasks List Page (/tasks)"
- Added "Deal Created" scenario to "Timeline entries are clickable" test with navigation
  to "Deal Detail Page (/deals/:dealId)"

### Playwright test changes
- Renamed existing test to match new test entry title
- Added new "Each task entry navigates to the Tasks List Page" test that clicks the
  second task item and verifies navigation to `/tasks`
