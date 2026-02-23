# Strategy

The strategy documents used to build the app have directives sections for requirements that must
be adhered to when performing that stage of development. During this stage you will systematically
go through the entire app and check that its behavior is following all directives.

## Unpack subtasks

Read `docs/tests.md` to understand the existing application structure. Add the following subtasks
for every page in the app:

- CheckTestSpec<PageName>: Check for `testSpec.md` (`strategies/tasks/build/`) directive violations in the test entries for the page.
- CheckComponents<PageName>: Check for `writeApp.md` (`strategies/tasks/build/`) directive violations in the components for the page.
- CheckTests<PageName>: Check for `writeTests.md` (`strategies/tasks/build/`) directive violations in the playwright tests for
  each of the page's test entries.

Also add additional non-page specific subtasks:

- CheckBackend: Check for `writeApp.md` (`strategies/tasks/build/`) directive violations in all backend functions.

## Checking for violations

During each checking task you need to read the strategy document and all the directives,
and then go through all the documentation / code you are checking to look for violations of those directives.
You must do this systematically and announce each entry name / file you are checking.

For any violations you find, add the following pending tasks to `docs/plan.md`. Do not fix them immediately.

1. FixViolation: Fix the directive violation.
2. RunTests: Make sure tests are passing.
3. DocumentFix: Document the fix appropriately.

Add a pending task to fix any violations you find. Do not fix them immediately.

## Fixing violations

Fix the relevant documentation / code to make sure it is not violating the directives.
Make sure to update anything else affected by the changes you are making, in `docs/tests.md`, the app code,
and playwright tests.

## Running tests

Make sure all tests pass. Read `strategies/tasks/build/testing.md` to understand how to run tests and debug failures.

## Documenting fixes

Update the section for the current round of maintenance in `docs/plan.md`
with a note about the fix you performed.

Commit all changes and exit.

## Tips

- When fixing violations, commit after each logical group of fixes (e.g. all SQL fixes together,
  all data-testid fixes together) rather than trying to fix everything in one pass. The performTasks
  strategy requires exiting after commits, and attempting to fix all violations without committing
  leads to unproductive iterations with zero commits.
- Group related fix tasks into a single FixViolation task when they share the same root cause
  (e.g. "FixViolationMissingTestIds" for all modals missing data-testid attributes).
