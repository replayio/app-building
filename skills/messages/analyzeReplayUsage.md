# Skill

Use this skill when the user asks you to study how Replay MCP tools were used across
worker logs — e.g., to find patterns, measure effectiveness, identify gaps, or update
the debugging guides.

## Step 1: Read all worker logs

**You MUST use `npm run read-log /path/to/log` from the repo root to read every log file.**
Do NOT use grep, cat, head, tail, or the Read tool on raw log files. See
`skills/messages/analyzeLogs.md` for why.

**Do NOT pipe read-log output through grep or other filters.** The read-log script already
formats the output into a readable summary. Read the full output to understand the log.

Log files live in:
- `/repo/logs/` and `/repo/logs/reviewed/` — worker logs for the overall system.
- `apps/<AppName>/logs/` — app-specific logs including test runs.

### Processing approach

1. Create a data directory for per-log analysis files:
   `logs/reports/<timestamp>-<name>/data/`

2. List all worker log files.

3. Launch subagents to process logs in parallel. Each subagent reads one log using
   `npm run read-log <path>` and writes a structured analysis file to the data directory.
   The filename should match the log filename with a `.md` extension. Limit to 3-4
   concurrent subagents to avoid rate limits.

4. Each analysis file should contain:
   ```
   # <log filename>
   TEST_FAILURE: yes/no
   REPLAY_USED: yes/no
   REPLAY_TOOLS: <comma-separated list or "none">
   STRATEGY: <how the agent approached debugging>
   SUCCESS: yes/no/partial
   REPLAY_ERRORS: <any errors or "none">
   NOTES: <brief summary of what the log was about>
   ```

5. After all subagents finish, read the analysis files from the data directory to
   compile the report.

### Subagent instructions

Each subagent should:
- Run `npm run read-log <path>` from the repo root (do NOT pipe through grep or filters)
- Read the full output to understand what happened in the log
- Write the analysis file to the data directory
- The subagent MUST NOT use grep, cat, head, tail, or the Read tool on raw log files

## Step 2: Classify findings

For each log with a test failure, classify:

1. **Failure category**: timeout, race condition, component rendering, network/API,
   form/input, seed data, infrastructure, or other.
2. **Replay used**: yes (active debugging with MCP tools) or no (diagnosed from error
   output alone). Note: all tests run in replay-chromium, so the browser is always Replay —
   "Replay used" means the agent actively called `mcp__replay__*` tools to analyze a
   recording.
3. **Tools used**: list of specific `mcp__replay__*` tools called.
4. **Strategy**: how the agent approached debugging (e.g., "PlaywrightSteps to find stuck
   step, then Screenshot to see page state").
5. **Success**: did the agent fix the issue?
6. **Replay errors**: any errors returned by Replay MCP tool calls.

## Step 3: Write the report

Write the report to `logs/reports/<timestamp>-<name>.md` (sibling to the data directory).
`<timestamp>` is `YYYY-MM-DD` and `<name>` describes the analysis (e.g.,
`replay-usage-app-building-3`).

Include:
- Summary statistics (total logs, logs with failures, replay used vs not, success rate)
- Table of every log with a test failure and the classification from Step 2
- Patterns observed (when replay was most/least useful, common tool sequences)
- Errors encountered while using Replay

## Step 4: Update debugging guides

Compare the findings against the existing guides in `skills/debugging/`:
- `timeouts.md`
- `race-conditions.md`
- `component-rendering.md`
- `network-and-api.md`
- `form-and-input.md`
- `seed-data.md`
- `README.md` (quick reference table)

For each finding:
- If it matches an existing category, check whether the guide already covers the specific
  root cause. If not, add it with the tool sequence that worked and a reference to the
  log file as an example.
- If it doesn't match any existing category, create a new guide file and add it to
  `README.md`.
- Update the quick reference table in `README.md` if new symptom-to-tool mappings were
  discovered.
- If a Replay tool was particularly effective for a problem type not mentioned in the
  guide, add it to the recommended tool sequence.
