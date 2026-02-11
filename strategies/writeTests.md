# Strategy

You are writing playwright tests which check that all the different entries in docs/tests.md are satisfied by the app.

## Guidelines

- For a given test entry, write a playwright test which matches the entry's requirements and verifies that the app will behave as the user expects.
- Do not run the playwright tests, but make sure that the test should pass and update the app code if necessary.
- The title of the playwright test must match the title of the test entry.
- If you discover parts of the app that haven't been fully implemented, you must finish implementation of the app.
- Playwright tests and app components/pages must use data-testid to identify elements on the page.

## Tasks

Make sure there is a subtask to write a test for every entry in tests.md

## Tips

- Tests must verify navigation targets precisely — assert the URL or page content after a click, not just that a click handler exists. A link going to the wrong page is a common bug that only surfaces if the test checks where it actually lands.

- For actions that produce side effects (e.g. history entries, timeline updates), write assertions that verify both the primary effect and the side effect. Also assert the side effect happens exactly once — duplicate entries from redundant API calls are a common bug.
