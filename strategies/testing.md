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

## Debugging

When running tests you must use the Replay browser to record test executions,
and the Replay MCP service to debug test failures. Make sure you understand the cause
of every test failure, and fix the test and/or app in an appropriate fashion.

Read these skill files.

https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-cli/SKILL.md
https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-mcp/SKILL.md

RECORD_REPLAY_API_KEY is already set in the environment for using the Replay CLI.

Whenever you use the tools to understand a test failure, write a file in lessons
describing what you did and what you learned from using the tool.

Whenever you are investigating a non-obvious test failure, look through these lessons and the tips below
for anything relevant to the failure.

When testing the app after deployment, use the Replay browser to record the app and debug any problems.

## Tasks

Make sure the plan includes the following tasks:

- A task to get the tests passing.
- When tests are passing, do an additional deploy of the tested version to a new netlify/neon site and add that info to the deployment.txt file.

## Tips
