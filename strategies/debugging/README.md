# Debugging with Replay MCP Tools

This directory contains guides for using Replay MCP tools to investigate different categories
of test failures. Before attempting to debug a test failure, scan these guides for the category
that matches your failure and follow the recommended tool sequence.

## Guides

- `timeouts.md` — Test timeouts and stuck steps (most common failure type)
- `race-conditions.md` — Parallel test interference, flaky assertions, state corruption
- `component-rendering.md` — Components not mounting, empty DOM, React rendering issues
- `network-and-api.md` — API errors, missing data, wrong responses
- `form-and-input.md` — Form validation, input interactions, browser-native behavior
- `seed-data.md` — Missing test data, empty collections, count mismatches

## Quick Reference: Which Tool to Start With

| Symptom | Start with |
|---------|-----------|
| Test timed out | `PlaywrightSteps` |
| Element not found / count mismatch | `PlaywrightSteps` then `Screenshot` |
| Wrong data displayed | `NetworkRequest` then `Logpoint` |
| Component not rendering | `Screenshot` then `ConsoleMessages` |
| API returning errors | `NetworkRequest` then `ConsoleMessages` |
| Assertion wrong value | `Evaluate` or `Logpoint` |
| Flaky / intermittent | `PlaywrightSteps` then `Logpoint` on shared state |
| Uncaught exception | `UncaughtException` then `GetStack` |
| DB constraint violation (500) | `NetworkRequest` then `Logpoint` on handler |
| Click times out on toggle/checkbox | `PlaywrightSteps` then check if testid is on sr-only element |
| All API calls failing after setup | `NetworkRequest` then `LocalStorage` (stale server?) |
