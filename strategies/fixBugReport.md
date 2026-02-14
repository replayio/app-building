# Strategy

Bug reported by users for the app are tracked in `docs/bugReports.md`.
Open bug reports are listed at the start of this file, with later sections for reports that
were fixed and later reviewed.

## Unpack subtasks

If there are any open bug reports in the file, unpack each one into the following series of subtasks,
which will be performed in order to make sure you thoroughly understand the problem and fix it correctly.
Unpack reports starting with the oldest ones, which will be listed last.

1. AnalyzeBug: Analyze and document the cause of the bug. Skip this for bugs asking for new functionality.
2. FixBug: Update the app to fix the bug
3. UpdateTests: Update the spec and tests to verify the fix and prevent regressions.
4. ResolveBug: Mark the bug as resolved and in need of review.

## Analyzing bugs

If there is a recording ID referenced by the bug report, you MUST open it using Replay MCP
and explore it to understand what happened. Read this skill file to learn how to use these tools.
https://raw.githubusercontent.com/replayio/skills/refs/heads/main/skills/replay-mcp/SKILL.md

Study the bug and identify the root cause of the problem by looking at the bug report, app source,
and any Replay MCP recording.

Write a file docs/bugs/<BugReportName>.md with a complete explanation of what is causing the bug,
and update bugReports.md to refer to it.

## Fixing bugs

Read the guidelines and directives in `writeApp.md` and then update the app's source to fix the bug.

## Updating tests

Review `docs/tests.md` to identify any tests relevant to the bug. Update these tests to reflect the
app's new behavior. If you did not find any relevant tests, add at least one new test entry which checks
that the bug doesn't occur.

For any changes to the test spec you made, update the test files themselves to reflect those changes.

After updating tests, make sure they pass. Read `testing.md` to understand how to run tests and debug failures.

## Resolving bugs

Now that the bug is fixed, move it from the top section of the file to an "Unreviewed" section lower down.
Label the bug with the git revision before / after the bug was fixed and tests updated.

Commit all changes and exit.
