# Strategy

You are testing an app to make sure all of its functionality works.

Once all playwright tests have been written, you must get them to pass.
When getting tests to pass, you must ensure the app is actually working.
You must not paper over problems in the app by hard-coding values,
disabling test functionality, and so on.

You might encounter bugs in the tests and can fix those, but you must ensure
that the test is correctly exercising the app as described in the corresponding
entry in tests.md

## Running Tests

Every time you run the playwright tests, do the following:
- Write the results to a logs/test-run-N.log file.
- Use a single worker, to avoid tests interfering with each other.

If any tests fail, pick a specific failing test to work on, preferring any regressing test
that passed in previous runs. Add a task for fixing it to plan.md and work on that until it is
passing.

## Tasks

Make sure the plan includes the following tasks:

- A task to get the tests passing.
- When tests are passing, do an additional deploy of the tested version to a new netlify/neon site and add that info to the deployment.txt file.
