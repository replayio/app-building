# Strategy

When running tests you must use the Replay Browser to record test executions,
and the Replay MCP service to debug test failures. Make sure you understand the cause
of every test failure, and fix the test and/or app in an appropriate fashion.

Read these skill files.

https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-cli/SKILL.md
https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-mcp/SKILL.md

RECORD_REPLAY_API_KEY is already set in the environment for using the Replay CLI.

Whenever you use the tools to understand a non-obvious test failure,
update or create a suitable lesson file in lessons/debugging.

Whenever you are investigating a non-obvious test failure, look through these lessons
for anything relevant to the failure.

## Required Environment Variables

```
RECORD_REPLAY_API_KEY
```
