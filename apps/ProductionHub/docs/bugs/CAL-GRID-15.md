# Bug: CAL-GRID-15: Drag-and-drop reschedule can be cancelled

## Step 1: Evidence

Evidence the app is broken: None found. The drag-and-drop implementation in CalendarGrid.tsx correctly handles HTML5 drag events and shows a reschedule tooltip. CAL-GRID-14 (same mechanism, different days) passes consistently.

Evidence the test is broken: The test is missing `test.slow()` which the equivalent passing test CAL-GRID-14 includes. The Replay Chromium browser adds 2-3x overhead to all operations. Without `test.slow()`, the test timeout is insufficient for drag-and-drop operations which involve multiple async browser events (dragstart, dragover, drop) that are slower under instrumentation.

## Step 2: Determination

Which is broken: TEST

## Step 3: Root Cause

The test at `tests/calendar-grid.spec.ts:495` is missing `test.slow()`. The equivalent test CAL-GRID-14 at line 432 includes `test.slow()` and passes. Drag-and-drop operations with the Replay Chromium browser are significantly slower due to recording instrumentation. Without `test.slow()`, the default timeout may not be sufficient for the full drag-and-drop sequence to complete (dragstart → dragover → drop → state update → tooltip render).
