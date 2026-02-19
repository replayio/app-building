# Strategy

The strategy documents used to build the app have directives sections for requirements that must
be adhered to when performing that stage of development. During this stage you will systematically
go through the entire app and check that its behavior is following all directives.

## Unpack Sub-Jobs

Read `docs/tests.md` to understand the existing application structure. Add sub-jobs using
`add-next-job` (in REVERSE order) for every page in the app:

- CheckTestSpec<PageName>: Check for `testSpec.md` (`strategies/jobs/build/`) directive violations in the test entries for the page.
- CheckComponents<PageName>: Check for `writeApp.md` (`strategies/jobs/build/`) directive violations in the components for the page.
- CheckTests<PageName>: Check for `writeTests.md` (`strategies/jobs/build/`) directive violations in the playwright tests for
  each of the page's test entries.

Also add additional non-page specific sub-jobs:

- CheckBackend: Check for `writeApp.md` (`strategies/jobs/build/`) directive violations in all backend functions.

Use `add-next-job` in reverse order for correct sequencing. All sub-jobs should use
`--strategy "strategies/jobs/maintain/checkDirectives.md"`.

## Checking for violations

During each checking job you need to read the strategy document and all the directives,
and then go through all the documentation / code you are checking to look for violations of those directives.
You must do this systematically and announce each entry name / file you are checking.

For any violations you find, add fix jobs using `add-next-job` (in reverse order). Do not fix them immediately.

1. FixViolation: Fix the directive violation.
2. RunTests: Make sure tests are passing.
3. DocumentFix: Document the fix appropriately.

Example:
```
npx tsx /repo/scripts/add-next-job.ts --strategy "strategies/jobs/maintain/checkDirectives.md" --description "DocumentFix: Document the fix"
npx tsx /repo/scripts/add-next-job.ts --strategy "strategies/jobs/maintain/checkDirectives.md" --description "RunTests: Verify tests pass after fix"
npx tsx /repo/scripts/add-next-job.ts --strategy "strategies/jobs/maintain/checkDirectives.md" --description "FixViolation: Fix <violation description>"
```

## Fixing violations

Fix the relevant documentation / code to make sure it is not violating the directives.
Make sure to update anything else affected by the changes you are making, in `docs/tests.md`, the app code,
and playwright tests.

## Running tests

Make sure all tests pass. Read `strategies/jobs/build/testing.md` to understand how to run tests and debug failures.

## Documenting fixes

Commit all changes and exit.

## Tips

- When fixing violations, commit after each logical group of fixes (e.g. all SQL fixes together,
  all data-testid fixes together) rather than trying to fix everything in one pass. Each job
  should commit and exit, and attempting to fix all violations without committing
  leads to unproductive iterations with zero commits.
- Group related fix tasks into a single FixViolation job when they share the same root cause
  (e.g. "FixViolationMissingTestIds" for all modals missing data-testid attributes).
