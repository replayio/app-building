# Strategy

The strategy documents used to build the app have directives sections for requirements that must
be adhered to when performing that stage of development. During this stage you will systematically
go through the entire app and check that its behavior is following all directives.

## Unpack Sub-Groups

Read `docs/tests.md` to understand the existing application structure. Add one job group per
page using `add-group`, with all checks for that page in the same group:

```
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/maintain/checkDirectives.md" \
  --job "CheckTestSpec<PageName>: Check testSpec.md directive violations in <PageName> test entries" \
  --job "CheckComponents<PageName>: Check writeApp.md directive violations in <PageName> components" \
  --job "CheckTests<PageName>: Check writeTests.md directive violations in <PageName> tests"
```

Also add a separate group for non-page specific checks:

```
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/maintain/checkDirectives.md" \
  --job "CheckBackend: Check writeApp.md directive violations in all backend functions"
```

## Checking for violations

During each checking job you need to read the strategy document and all the directives,
and then go through all the documentation / code you are checking to look for violations of those directives.
You must do this systematically and announce each entry name / file you are checking.

For any violations you find, add a fix group using `add-group`. Do not fix them immediately.

Example:
```
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/maintain/checkDirectives.md" \
  --job "FixViolation: Fix <violation description>" \
  --job "RunTests: Verify tests pass after fix" \
  --job "DocumentFix: Document the fix"
```

## Fixing violations

Fix the relevant documentation / code to make sure it is not violating the directives.
Make sure to update anything else affected by the changes you are making, in `docs/tests.md`, the app code,
and playwright tests.

## Running tests

Make sure all tests pass. Read `strategies/jobs/build/testing.md` to understand how to run tests and debug failures.

## Tips

- Group related fix tasks into a single FixViolation job when they share the same root cause
  (e.g. "FixViolationMissingTestIds" for all modals missing data-testid attributes).
