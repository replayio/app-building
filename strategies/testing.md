# Strategy

You will run all the tests in the app and get them to pass..

## Unpack Subtasks

Unpack the initial stage task into a single FixTests task to get all tests passing.

After running tests and there are failures, pick a specific failing test and add a subtask to fix that test without regressing any tests that passed in previous runs. The subtask must require committing and exiting afterwards. Focus on that subtask until finished.

## Requirements

Once all playwright tests have been written, you must get them to pass.
When getting tests to pass, you must ensure the app is actually working.
You must not paper over problems in the app by hard-coding values,
disabling test functionality, and so on.

You might encounter bugs in the tests and can fix those, but you must ensure
that the test is correctly exercising the app as described in the corresponding
entry in tests.md

You MUST read these skill files before testing.

https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-cli/SKILL.md
https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-mcp/SKILL.md

RECORD_REPLAY_API_KEY is already set in the environment for using the Replay CLI.

## Running Tests

Every time you run the playwright tests, do the following:
- Restart any existing development servers to pick up the latest changes. There might be development servers running from previous runs.
- Use the Replay browser to record test executions.
- Write the results to a logs/test-run-N.log file.
- Use a single worker, to avoid tests interfering with each other.

## Debugging

When debugging with a test failure whose cause isn't obvious, upload the Replay recording of the
test failure captured while running and use the Replay MCP service to debug the failure.

Make sure you understand the cause of every test failure, and fix the test and/or app in an appropriate fashion.

Whenever you use the tools to understand a test failure, write a file in lessons
describing what you did and what you learned from using the tool.

Look through these lessons and the tips below for anything relevant to the failure.

When testing the app after deployment, use the Replay browser to record the app and debug any problems.

## Directives

- When debugging history/timeline tests, check for duplicate entries caused by React re-renders triggering multiple API calls, and check for missing entries from mutation handlers that skip history writes.
