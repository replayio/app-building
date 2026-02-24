# Report Definition: Test Failures

This file defines the analysis template and synthesis instructions for a test-failures report.
It is referenced by `analyzeLogs.md` and `synthesizeReport.md` during report generation.

## Per-Log Analysis Template

For each log file, produce a markdown file with the following structure:

```
# <log filename>

## Summary
NOTES: <brief summary of what this log was about>

## Test Failures
TEST_FAILURES: <count of distinct test failures in this log, 0 if none>

For each test failure:

### Failure: <test name>
FAILURE_CATEGORY: <one of: timeout, strict-mode, data-contamination, CSS/layout, backend-bug, missing-testid, seed-data-mismatch, infrastructure, spa-redirect, recording-upload-failure, other>
PRE_EXISTING: yes/no (yes = failure existed before the current work and is unrelated)
REPLAY_USED: yes/no (yes = agent actively called mcp__replay__* tools to analyze a recording)
REPLAY_NOT_USED_REASON: <if REPLAY_USED is no, explain why — e.g. "diagnosed from error output", "no recording available", "upload failed">
RECORDING_AVAILABLE: yes/no (no = recording upload failed, infrastructure failure, or no recording was created)
DEBUGGING_SUCCESSFUL: yes/no/partial

#### Replay Usage (if REPLAY_USED is yes)
OUTCOME: <what the Replay analysis revealed>
DEBUGGING_STRATEGY: <how the agent approached debugging — e.g. "PlaywrightSteps to find stuck step, then Screenshot to see page state">
TOOLS_USED: <comma-separated list of mcp__replay__* tools called>

#### Resolution
CHANGESET_REVISION: <git SHA from "CHANGESET REVISION:" line in log, or "none">
FAILING_TEST: <test name from "FAILING TEST:" line in log, or "none">
```

If a log has no test failures, just write the Summary section with TEST_FAILURES: 0.

## Report Synthesis

Compile all analysis files into a single report with these sections:

### 1. Summary Statistics
- Total logs analyzed
- Logs with test failures / logs without
- Total distinct test failures across all logs
- Replay usage rate (failures where Replay was used / total failures)
- Debugging success rate (successful + partial / total failures, excluding pre-existing)
- Replay-assisted success rate (successful among Replay-used failures)
- Recording availability rate (failures where recording was available / total failures)
- Total test re-runs across all logs (number of test re-runs needed to achieve all-pass)

### 2. Failure Table
A markdown table with columns:
| Log | Test | Category | Pre-existing | Replay Used | Recording Available | Strategy | Tools | Success | Changeset |

One row per test failure across all logs.

### 3. Patterns
- When was Replay most effective? (failure categories, tool sequences)
- When was Replay NOT used and why?
- Common debugging strategies that worked
- Common debugging strategies that failed
- Recurring failure categories

### 4. Recommendations
Target these files with specific, actionable recommendations:
- `skills/debugging/*.md` — New patterns, tool sequences, or categories to add
- `skills/tasks/build/testing.md` — Process improvements for the testing workflow
- `skills/review/reportTestFailures.md` — Improvements to this report template itself
