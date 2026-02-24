# Strategy

Generate a test failure report by scanning worker logs for test execution results
and compiling findings into a structured report.

## Reading logs

**You MUST use `npm run read-log /path/to/log` from the repo root to read any log file.**
Do NOT use the Read tool, cat, head, tail, or grep on raw log files. The raw content is
either too large or full of ANSI escape codes that make it unreadable.

## Processing a batch

Each job specifies a batch of log files to scan. For each log file in the batch:

1. Run `npm run read-log <path>` and read the output.
2. Look for evidence of test execution — keywords like `npm run test`, `playwright`,
   `passed`, `failed`, `timed out`, `FAIL`, `PASS`, test file names (`.spec.ts`),
   test result summaries.
3. If the log contains test results, extract:
   - Which test file(s) were run
   - Number of tests passed / failed / skipped
   - Names of failing tests and a brief description of the failure (timeout, assertion,
     connection error, etc.)
   - Whether the failure was ultimately fixed in that same log session
   - The recording ID if a Replay recording was uploaded
4. If the log contains NO test execution, skip it and note it was skipped.

## Writing the report

Append findings to `docs/test-failure-report.md`. Each batch job appends its section.
Use this format:

```markdown
## Log: <filename>
- **Timestamp**: <derived from filename>
- **Test file(s)**: <list>
- **Results**: X passed, Y failed, Z skipped
- **Failures**:
  - `<test name>`: <brief failure reason>
- **Replay recordings**: <recording IDs if any>
- **Resolution**: <fixed in this session / not fixed / N/A>
```

If a log had no test execution, write:

```markdown
## Log: <filename>
- No test execution found.
```

## Compiling the summary

The final job in the sequence compiles the report. Read the full `docs/test-failure-report.md`
and prepend a summary section at the top:

```markdown
# Test Failure Report

Generated: <date>

## Summary
- Total logs scanned: N
- Logs with test execution: N
- Total test runs: N
- Total failures found: N
- Unique failing tests: <list>
- Most common failure types: <list>

---
```
