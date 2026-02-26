# Bug: ReportList page title and breadcrumb inconsistency

## Step 1: Evidence

Evidence the app is broken: The ReportListHeader component displayed "ReportList" (camelCase) as the page title instead of "Reports". The breadcrumb used "Page / reports" format instead of "Home > Reports", inconsistent with other pages (e.g., NavBar breadcrumb uses "Home" and proper capitalized labels like "Reports").

Evidence the test is broken: None found.

## Step 2: Determination

Which is broken: APP

## Step 3: Root Cause

File: `src/components/ReportListHeader.tsx`

1. **Page title (line 29):** The `<h1>` element contained the raw component name `"ReportList"` instead of the user-friendly label `"Reports"`. All other pages use human-readable titles (e.g., "Accounts", "Transactions").

2. **Breadcrumb (lines 23-25):** The breadcrumb items used `{ label: "Page" }` and `{ label: "reports" }` instead of `{ label: "Home" }` and `{ label: "Reports" }`. The NavBar's own breadcrumb component (NavBar.tsx line 105) uses `"Home"` as the root label and proper capitalized page names. The ReportHeader component (for report detail pages) also uses `"Reports"` as its breadcrumb label.

## Fix

- Changed page title from `"ReportList"` to `"Reports"` in ReportListHeader.tsx
- Changed breadcrumb from `"Page" / "reports"` to `"Home" / "Reports"` in ReportListHeader.tsx
- Updated docs/tests.md test expectations to match the corrected behavior
