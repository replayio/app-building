# Bug: Row action menu clicks intercepted by table cells

## Step 1: Evidence

Evidence the app is broken: Playwright reports that when clicking `action-view-*`,
`action-edit-*`, or `action-delete-*` buttons in the row action dropdown menu, the click
is intercepted by `<div class="table-cell table-cell-task">` — a sibling cell in the same
table row. The dropdown menu renders visually but pointer events don't reach it.

Evidence the test is broken: None found

## Step 2: Determination

Which is broken: APP

## Step 3: Root Cause

In `src/index.css`, the `.clients-table` has `overflow: hidden` (line 362). The
`.row-action-menu` is positioned absolutely within the 44px-wide action column but extends
160px to the left (via `right: 0`). Because the table has `overflow: hidden`, the dropdown
content that extends beyond the table cell boundary is clipped. Additionally, the adjacent
table cells (e.g., `table-cell-task` at 1.5fr width) share the same stacking context as the
action wrapper, so they intercept pointer events even when the dropdown appears to be visible.

Fix: Remove `overflow: hidden` from `.clients-table` and ensure the `.row-action-wrapper`
creates a proper stacking context with a z-index so the dropdown appears above sibling cells.
