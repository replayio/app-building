# Bug: Low inventory alert Dismiss button removes the alert

## Step 1: Evidence

Evidence the app is broken: The dismiss API call succeeds (200 OK) and the Redux `dismissAlert.fulfilled` handler correctly filters out the alert from `state.alerts`. However, React StrictMode in development mode causes components to mount twice, resulting in TWO concurrent `fetchDashboardData` dispatches. Both fetch responses include the dismissed alert (since the queries ran before the dismiss INSERT). The second `fetchDashboardData.fulfilled` overwrites the optimistic state update from `dismissAlert.fulfilled`, causing the alert to reappear. Network requests 18437.56 and 18437.58 both returned Copper Wire in their alerts, and request 18437.59 (dismiss POST) returned 200 OK. The timing is: fetch1.fulfilled → fetch2.response queued → dismiss.fulfilled (Copper removed) → fetch2.fulfilled (Copper back).

Evidence the test is broken: None found. The test correctly clicks dismiss and waits 15 seconds for the alert to disappear.

## Step 2: Determination

Which is broken: APP

## Step 3: Root Cause

The `dashboardSlice.ts` Redux slice does not protect against concurrent `fetchDashboardData` responses overwriting optimistic updates from `dismissAlert`. When `dismissAlert.fulfilled` fires, it removes the alert from `state.alerts`. But if a previously-dispatched `fetchDashboardData` response arrives afterward, `fetchDashboardData.fulfilled` sets `state.alerts = action.payload.alerts` which includes the dismissed alert (since the server query ran before the dismiss commit). The fix is to track dismissed material IDs in the Redux state and filter them out in `fetchDashboardData.fulfilled`, ensuring stale fetch responses don't resurrect dismissed alerts.
