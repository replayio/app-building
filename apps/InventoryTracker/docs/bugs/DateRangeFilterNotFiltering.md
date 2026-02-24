# Bug: DateRangeFilter and CategoryFilter not properly filtering dashboard data

## Step 1: Evidence

Evidence the app is broken: When the user applies a date range filter, the dashboard dispatches `fetchDashboardData` with filter params. The `fetchDashboardData.pending` handler does not clear `recentTransactions` from the Redux state, so the previous unfiltered data remains in the DOM while the filtered API call is in flight. The tests read the stale (unfiltered) transaction dates before the filtered response arrives, seeing "Feb 15, 2026" when expecting only January dates, and "Jan 20, 2026" when expecting only February dates.

Evidence the test is broken: None found. The tests correctly apply filters and check the resulting data.

## Step 2: Determination

Which is broken: APP

## Step 3: Root Cause

The `fetchDashboardData.pending` handler in `dashboardSlice.ts` preserves stale `recentTransactions` data while a new filtered fetch is in flight. Since `fetchDashboardData.pending` does not clear or invalidate the old transactions, the UI continues displaying previous (unfiltered) data until the new response arrives. The fix is to clear `recentTransactions` on pending so the component shows an empty/loading state until the filtered data arrives, ensuring users never see stale data that doesn't match the applied filters.
