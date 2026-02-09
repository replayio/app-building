# Strategy

When running tests you must use the Replay browser to record test executions,
and the Replay MCP service to debug test failures. Make sure you understand the cause
of every test failure, and fix the test and/or app in an appropriate fashion.

Read these skill files.

https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-cli/SKILL.md
https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-mcp/SKILL.md

RECORD_REPLAY_API_KEY is already set in the environment for using the Replay CLI.

Whenever you use the tools to understand a test failure, write a lesson file in lessons/debugging
describing what you did and what you learned from using the tool.

Whenever you are investigating a non-obvious test failure, look through these lessons
for anything relevant to the failure.

When testing the app after deployment, use the Replay browser to record the app and debug any problems.

## Required Environment Variables

```
RECORD_REPLAY_API_KEY
```
