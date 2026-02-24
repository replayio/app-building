# Strategy

Analyze worker log files to extract test failures and compile them into a report.

## Reading Logs

**You MUST use `npm run read-log /path/to/log` from the repo root to read any log file.**
Do NOT use the Read tool, cat, head, tail, or grep on raw log files.

## Analyzing Logs for Test Failures

For each log file specified in your jobs:

1. Run `npm run read-log <path>` and read the output.
2. Look for evidence of test failures, including:
   - Playwright test output showing failed tests (e.g. `FAILED`, `Error`, assertion failures)
   - Test commands that exited with non-zero status
   - Stack traces from test runs
   - Any `npm run test` or `npx playwright test` invocations that failed
3. For each failure found, record:
   - **Log file**: the path to the log
   - **Test name**: the failing test name or describe block
   - **Error message**: the assertion or error message
   - **Brief context**: what the worker was doing (e.g. which job/strategy)

## Writing the Report

Append findings to `logs/test-failure-report.md`. Use this format:

```markdown
## <Log File Name>

- **Test**: `<test name>`
  **Error**: <error message summary>
  **Context**: <what job/strategy was running>
```

If a log file contains NO test failures, do NOT add an entry for it — skip it silently.

Create the file with a header if it does not exist yet:

```markdown
# Test Failure Report

Generated from worker logs.

```

## Compiling the Final Report

If your job is "CompileReport", read the full `logs/test-failure-report.md` and add a
summary section at the top (after the header) with:
- Total number of log files that contained failures
- Total number of distinct test failures
- Most commonly failing tests (if patterns emerge)
- Brief recommendations
